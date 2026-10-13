"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAudioAnalyser,
  ParticipantEvent,
  Room,
  RoomEvent,
  Track,
  type LocalAudioTrack,
  type Participant,
  type RemoteAudioTrack,
  type RemoteTrack,
  type TextStreamReader,
} from "livekit-client";
import { hasSession } from "@/features/auth/lib/session";
import type { ChatSessionBridge } from "@/features/chat/hooks/useChatStream";
import {
  requestVoiceToken,
  resolveChatItems,
  VoiceRequestError,
} from "@/features/chat/services/voice.service";
import type { ChatMessageRole } from "@/features/chat/types";

/** Live transcription of both sides, published by LiveKit agents. */
const TRANSCRIPTION_TOPIC = "lk.transcription";
/** `{"skus": [...]}` published by our agent after a reply that recommends products. */
const SKUS_TOPIC = "rethread.skus";
/** Participant attribute LiveKit agents use to publish their state. */
const AGENT_STATE_ATTRIBUTE = "lk.agent.state";
/**
 * How long the "listening" placeholder survives after the user stops speaking
 * without any transcript arriving (e.g. noise the STT discarded).
 */
const PENDING_TURN_TIMEOUT_MS = 5000;
/** Wider decibel range than LiveKit's default, which saturates on speech. */
const ANALYSER_OPTIONS = {
  fftSize: 512,
  smoothingTimeConstant: 0.5,
  minDecibels: -85,
  maxDecibels: -25,
};

type AudioAnalyser = ReturnType<typeof createAudioAnalyser>;

export type VoiceStatus = "idle" | "connecting" | "connected" | "error";

/** State published by the voice agent (`lk.agent.state`). */
export type VoiceAgentState =
  | "initializing"
  | "listening"
  | "thinking"
  | "speaking"
  | null;

export interface StartVoiceOptions {
  /** Product the conversation is about, forwarded to the backend. */
  itemId?: string;
}

export interface UseVoiceChat {
  status: VoiceStatus;
  isMuted: boolean;
  error: string | null;
  /**
   * True from the moment the user starts speaking until their transcript shows
   * up in the chat, so the UI can hold a "listening" placeholder meanwhile.
   */
  isUserTurnPending: boolean;
  agentState: VoiceAgentState;
  /**
   * Instant microphone volume in [0, 1]. Meant to be polled every animation
   * frame by a meter (no React state, so it never re-renders the chat).
   */
  getMicLevel: () => number;
  /** Same as `getMicLevel`, for the assistant's voice. */
  getAgentLevel: () => number;
  /** When the call got connected (epoch ms), for a call timer. */
  connectedAt: number | null;
  /** Must be called from a user gesture (click) due to browser autoplay rules. */
  start: (options?: StartVoiceOptions) => Promise<void>;
  stop: () => void;
  toggleMute: () => Promise<void>;
}

function describeError(err: unknown): string {
  if (err instanceof VoiceRequestError) {
    if (err.status === 401) return "Entre na sua conta para conversar por voz.";
    if (err.status === 403) {
      return "A conversa por voz está disponível apenas para administradores.";
    }
    return err.message;
  }
  const name = (err as { name?: unknown } | null)?.name;
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Permita o acesso ao microfone para conversar por voz.";
  }
  if (name === "NotFoundError") return "Nenhum microfone encontrado.";
  return "Não foi possível iniciar a conversa por voz.";
}

/** Requests a join token, dropping a stale session id once if the backend rejects it. */
async function fetchVoiceToken(bridge: ChatSessionBridge, itemId?: string) {
  const sessionId = bridge.getSessionId() ?? undefined;
  try {
    return await requestVoiceToken({ sessionId, itemId });
  } catch (err) {
    // 404: the session no longer exists (or belongs to someone else).
    if (sessionId && err instanceof VoiceRequestError && err.status === 404) {
      bridge.setSessionId(null);
      return requestVoiceToken({ itemId });
    }
    throw err;
  }
}

function parseSkus(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as { skus?: unknown };
    return Array.isArray(parsed?.skus)
      ? parsed.skus.filter((sku): sku is string => typeof sku === "string")
      : [];
  } catch {
    return [];
  }
}

function readAgentState(participant: Participant): VoiceAgentState | undefined {
  const state = participant.attributes[AGENT_STATE_ATTRIBUTE];
  return state === "initializing" ||
    state === "listening" ||
    state === "thinking" ||
    state === "speaking"
    ? state
    : undefined;
}

/**
 * Voice conversation over LiveKit, sharing the session and message list of the
 * text chat through `bridge`. Audio flows directly between the browser and
 * LiveKit; the backend only issues the join token and resolves product SKUs.
 */
export function useVoiceChat(bridge: ChatSessionBridge): UseVoiceChat {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserTurnPending, setIsUserTurnPending] = useState(false);
  const [agentState, setAgentState] = useState<VoiceAgentState>(null);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  // The current call. Cleared before disconnecting, so any async work that
  // finds a different room here knows its call was cancelled.
  const roomRef = useRef<Room | null>(null);
  const audioElementsRef = useRef(new Set<HTMLMediaElement>());
  const analyserRef = useRef<AudioAnalyser | null>(null);
  // One analyser per remote audio track (the agent publishes a single one).
  const agentAnalysersRef = useRef(new Map<RemoteTrack, AudioAnalyser>());
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every chat reset, so late transcripts/products from a previous
  // conversation never land in the new one.
  const conversationRef = useRef(0);

  const clearPendingTimeout = useCallback(() => {
    if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    pendingTimeoutRef.current = null;
  }, []);

  const resolveUserTurn = useCallback(() => {
    clearPendingTimeout();
    setIsUserTurnPending(false);
  }, [clearPendingTimeout]);

  /** Tears down everything tied to a call (the room itself is handled by callers). */
  const releaseCall = useCallback(() => {
    audioElementsRef.current.forEach((el) => el.remove());
    audioElementsRef.current.clear();
    void analyserRef.current?.cleanup();
    analyserRef.current = null;
    agentAnalysersRef.current.forEach((analyser) => void analyser.cleanup());
    agentAnalysersRef.current.clear();
    resolveUserTurn();
    setAgentState(null);
    setIsMuted(false);
    setConnectedAt(null);
  }, [resolveUserTurn]);

  const stop = useCallback(() => {
    const room = roomRef.current;
    roomRef.current = null;
    void room?.disconnect();
    releaseCall();
    setStatus("idle");
    setError(null);
  }, [releaseCall]);

  // Hang up on unmount and whenever the conversation is reset.
  useEffect(() => stop, [stop]);
  useEffect(
    () =>
      bridge.onReset(() => {
        conversationRef.current += 1;
        stop();
      }),
    [bridge, stop],
  );

  const getMicLevel = useCallback(
    () => analyserRef.current?.calculateVolume() ?? 0,
    [],
  );

  const getAgentLevel = useCallback(() => {
    let level = 0;
    agentAnalysersRef.current.forEach((analyser) => {
      level = Math.max(level, analyser.calculateVolume());
    });
    return level;
  }, []);

  const readTranscription = useCallback(
    async (reader: TextStreamReader, role: ChatMessageRole) => {
      const conversation = conversationRef.current;
      const attributes = reader.info.attributes ?? {};
      // Several streams may carry the same segment (e.g. interim then final
      // user transcripts): they all update the same message.
      const segmentId = attributes["lk.segment_id"] ?? reader.info.id;
      const isFinal = attributes["lk.transcription_final"] === "true";
      const messageId = `voice-${segmentId}`;

      let text = "";
      try {
        for await (const chunk of reader) {
          if (conversationRef.current !== conversation) return;
          text += chunk;
          if (!text.trim()) continue;
          // The real transcript replaces the "listening" placeholder.
          if (role === "user") resolveUserTurn();
          bridge.upsertMessage(messageId, role, {
            content: text,
            status: isFinal ? "done" : "streaming",
            via: "voice",
          });
        }
      } catch {
        // Stream interrupted (e.g. the call ended); keep what arrived.
      }
      if (text.trim() && conversationRef.current === conversation) {
        bridge.upsertMessage(messageId, role, { status: "done" });
      }
    },
    [bridge, resolveUserTurn],
  );

  const handleSkus = useCallback(
    async (reader: TextStreamReader) => {
      const conversation = conversationRef.current;
      try {
        const skus = parseSkus(await reader.readAll());
        if (skus.length === 0) return;
        const items = await resolveChatItems(skus);
        if (conversationRef.current !== conversation) return;
        bridge.attachItems(items);
      } catch {
        if (conversationRef.current !== conversation) return;
        setError("Não foi possível carregar as peças recomendadas.");
      }
    },
    [bridge],
  );

  const start = useCallback(
    async ({ itemId }: StartVoiceOptions = {}) => {
      if (roomRef.current) return;

      // Same gate as the text chat: never hit the backend anonymously.
      if (!hasSession()) {
        setError("Entre na sua conta para conversar por voz.");
        setStatus("error");
        return;
      }

      // Created up front so `stop()` can cancel the call while it is starting.
      const room = new Room();
      roomRef.current = room;
      setStatus("connecting");
      setError(null);
      setIsMuted(false);

      const syncAgentState = (participant: Participant) => {
        const state = readAgentState(participant);
        if (state === undefined) return;
        setAgentState(state);
        // The agent took the turn, so whatever the user said has been heard.
        if (state === "thinking" || state === "speaking") resolveUserTurn();
      };

      try {
        // A fresh token on every call — it is short-lived and never stored.
        const { url, token, session_id } = await fetchVoiceToken(bridge, itemId);
        if (roomRef.current !== room) return;
        // Voice and text share the same session (and so the same memory).
        bridge.setSessionId(session_id);

        room.registerTextStreamHandler(TRANSCRIPTION_TOPIC, (reader, participant) => {
          const role: ChatMessageRole =
            participant.identity === room.localParticipant.identity
              ? "user"
              : "assistant";
          void readTranscription(reader, role);
        });
        room.registerTextStreamHandler(SKUS_TOPIC, (reader) => {
          void handleSkus(reader);
        });

        room
          .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
            if (track.kind !== Track.Kind.Audio) return;
            const el = track.attach();
            el.hidden = true;
            audioElementsRef.current.add(el);
            document.body.appendChild(el);
            agentAnalysersRef.current.set(
              track,
              createAudioAnalyser(track as RemoteAudioTrack, ANALYSER_OPTIONS),
            );
          })
          .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
            void agentAnalysersRef.current.get(track)?.cleanup();
            agentAnalysersRef.current.delete(track);
            track.detach().forEach((el) => {
              audioElementsRef.current.delete(el);
              el.remove();
            });
          })
          .on(RoomEvent.ParticipantConnected, syncAgentState)
          .on(RoomEvent.ParticipantAttributesChanged, (_changed, participant) =>
            syncAgentState(participant),
          )
          .on(RoomEvent.Disconnected, () => {
            // Ignore the disconnect we triggered ourselves in `stop()`.
            if (roomRef.current !== room) return;
            roomRef.current = null;
            releaseCall();
            setStatus("idle");
          });

        // LiveKit's speaker detection: marks the start of a user turn right away,
        // well before the STT returns any text.
        room.localParticipant.on(ParticipantEvent.IsSpeakingChanged, (speaking) => {
          if (roomRef.current !== room) return;
          if (speaking) {
            clearPendingTimeout();
            setIsUserTurnPending(true);
          } else {
            clearPendingTimeout();
            pendingTimeoutRef.current = setTimeout(
              () => setIsUserTurnPending(false),
              PENDING_TURN_TIMEOUT_MS,
            );
          }
        });

        await room.connect(url, token);
        if (roomRef.current !== room) return;
        // The agent may have joined before us.
        room.remoteParticipants.forEach(syncAgentState);
        await room.localParticipant.setMicrophoneEnabled(true);
        if (roomRef.current !== room) return;

        const micTrack = room.localParticipant.getTrackPublication(
          Track.Source.Microphone,
        )?.audioTrack as LocalAudioTrack | undefined;
        if (micTrack) {
          analyserRef.current = createAudioAnalyser(micTrack, ANALYSER_OPTIONS);
        }

        await room.startAudio();
        if (roomRef.current !== room) return;
        setConnectedAt(Date.now());
        setStatus("connected");
      } catch (err) {
        if (roomRef.current !== room) return; // cancelled by `stop()`
        roomRef.current = null;
        void room.disconnect();
        releaseCall();
        setError(describeError(err));
        setStatus("error");
      }
    },
    [
      bridge,
      clearPendingTimeout,
      handleSkus,
      readTranscription,
      releaseCall,
      resolveUserTurn,
    ],
  );

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const enabled = room.localParticipant.isMicrophoneEnabled;
    try {
      await room.localParticipant.setMicrophoneEnabled(!enabled);
      if (roomRef.current === room) setIsMuted(enabled);
    } catch (err) {
      if (roomRef.current === room) setError(describeError(err));
    }
  }, []);

  return {
    status,
    isMuted,
    error,
    isUserTurnPending,
    agentState,
    getMicLevel,
    getAgentLevel,
    connectedAt,
    start,
    stop,
    toggleMute,
  };
}
