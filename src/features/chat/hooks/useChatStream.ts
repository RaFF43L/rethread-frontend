"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hasSession } from "@/features/auth/lib/session";
import { notifySessionExpired } from "@/shared/lib/session-events";
import { sendChatMessage } from "@/features/chat/services/chat.service";
import type {
  ChatMessage,
  ChatMessageRole,
  ChatProductItem,
  ChatStreamEvent,
} from "@/features/chat/types";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Pulls streamed text out of a `token` payload, tolerating key variations. */
function extractToken(data: Record<string, unknown> | null): string {
  if (!data) return "";
  const candidate =
    data.content ?? data.text ?? data.delta ?? data.token ?? data.value;
  return typeof candidate === "string" ? candidate : "";
}

/** Pulls a short error string out of an `error` event payload. */
function extractError(data: Record<string, unknown> | null): string | undefined {
  if (!data) return undefined;
  const candidate =
    data.message ?? data.detail ?? data.error ?? data.status;
  return typeof candidate === "string" ? candidate : undefined;
}

/**
 * Lets another transport (the voice call) share this conversation: same
 * session id (so the assistant keeps one memory) and same message list.
 * Every function is stable for the lifetime of the hook.
 */
export interface ChatSessionBridge {
  getSessionId: () => string | null;
  setSessionId: (id: string | null) => void;
  /** Inserts the message with this id, or patches it if it already exists. */
  upsertMessage: (
    id: string,
    role: ChatMessageRole,
    patch: Partial<Omit<ChatMessage, "id" | "role">>,
  ) => void;
  /**
   * Attaches products to the latest assistant message; when that message
   * already has products (or there is none), appends a cards-only message.
   */
  attachItems: (items: ChatProductItem[]) => void;
  /** Subscribes to `reset()`; returns the unsubscribe function. */
  onReset: (listener: () => void) => () => void;
}

export interface UseChatStream {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  send: (text: string) => void;
  stop: () => void;
  reset: () => void;
  bridge: ChatSessionBridge;
}

export function useChatStream(): UseChatStream {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Conversation session id (from the `session` event). A ref so `send` always
  // reads the latest value without being re-created.
  const sessionIdRef = useRef<string | null>(null);
  const resetListenersRef = useRef(new Set<() => void>());

  // Abort any in-flight stream when the consumer unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    // Lets the voice call hang up before the conversation is cleared.
    resetListenersRef.current.forEach((listener) => listener());
    setMessages([]);
    setError(null);
    // Starts a brand-new conversation/session on the next message.
    sessionIdRef.current = null;
  }, [stop]);

  const bridge = useMemo<ChatSessionBridge>(
    () => ({
      getSessionId: () => sessionIdRef.current,
      setSessionId: (id) => {
        sessionIdRef.current = id;
      },
      upsertMessage: (id, role, patch) =>
        setMessages((prev) =>
          prev.some((m) => m.id === id)
            ? prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
            : [...prev, { id, role, content: "", ...patch }],
        ),
      attachItems: (items) => {
        if (items.length === 0) return;
        setMessages((prev) => {
          const index = prev.findLastIndex((m) => m.role === "assistant");
          if (index !== -1 && !prev[index].items?.length) {
            return prev.map((m, i) => (i === index ? { ...m, items } : m));
          }
          return [
            ...prev,
            { id: createId(), role: "assistant", content: "", items, status: "done" },
          ];
        });
      },
      onReset: (listener) => {
        resetListenersRef.current.add(listener);
        return () => {
          resetListenersRef.current.delete(listener);
        };
      },
    }),
    [],
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      // The chat requires an active session — never hit the backend anonymously.
      // We can only check for the (readable) profile cookie; the actual token is
      // HttpOnly and injected by the proxy.
      if (!hasSession()) {
        // The profile cookie may have just expired: let the header catch up.
        notifySessionExpired();
        setError("Entre na sua conta para usar o assistente.");
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setError(null);
      setIsStreaming(true);

      const assistantId = createId();
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "user", content: trimmed },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          status: "streaming",
        },
      ]);

      // Updates only the in-flight assistant message.
      const patch = (updater: (msg: ChatMessage) => ChatMessage) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? updater(m) : m)),
        );

      const handleEvent = (event: ChatStreamEvent) => {
        switch (event.type) {
          case "session": {
            const id = event.data?.session_id ?? event.data?.sessionId;
            if (typeof id === "string") sessionIdRef.current = id;
            break;
          }
          case "token": {
            const chunk = extractToken(event.data);
            if (chunk) patch((m) => ({ ...m, content: m.content + chunk }));
            break;
          }
          case "done": {
            const data = event.data;
            // The full reply may arrive here (`response`) in addition to any
            // streamed tokens; keep streamed text when present, fall back to it.
            const response =
              typeof data?.response === "string" ? data.response : undefined;
            const items = Array.isArray(data?.items)
              ? (data.items as ChatProductItem[])
              : undefined;
            patch((m) => ({
              ...m,
              content: m.content || response || "",
              items,
              status: "done",
            }));
            break;
          }
          case "error": {
            const detail = extractError(event.data) ?? "Ocorreu um erro.";
            patch((m) => ({ ...m, status: "error", error: detail }));
            setError(detail);
            break;
          }
          default:
            // Pipeline events (triage/specialist/tool/quality/status) are not
            // surfaced in the UI — the typing indicator covers the wait.
            break;
        }
      };

      const sessionId = sessionIdRef.current;
      sendChatMessage(
        {
          message: trimmed,
          firstInteraction: !sessionId,
          sessionId: sessionId ?? undefined,
          signal: controller.signal,
        },
        handleEvent,
      )
        .catch((err: unknown) => {
          if (controller.signal.aborted) return; // user-initiated stop
          const detail =
            err instanceof Error ? err.message : "Não foi possível obter a resposta.";
          patch((m) => ({
            ...m,
            status: "error",
            error: m.content ? undefined : detail,
          }));
          setError(detail);
        })
        .finally(() => {
          if (abortRef.current === controller) abortRef.current = null;
          // Any message still marked streaming is now closed.
          patch((m) => (m.status === "streaming" ? { ...m, status: "done" } : m));
          setIsStreaming(false);
        });
    },
    [isStreaming],
  );

  return { messages, isStreaming, error, send, stop, reset, bridge };
}
