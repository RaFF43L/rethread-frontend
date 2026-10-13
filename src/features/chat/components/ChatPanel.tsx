"use client";

import { useEffect, useRef } from "react";
import { Loader2, Lock, LogIn, RotateCcw, Sparkles, X } from "lucide-react";
import type { UseChatStream } from "@/features/chat/hooks/useChatStream";
import type { UseVoiceChat } from "@/features/chat/hooks/useVoiceChat";
import { ChatVoiceBar } from "@/features/chat/components/ChatVoiceBar";
import { VoiceOrb } from "@/features/chat/components/VoiceOrb";
import { getVoiceVisuals } from "@/features/chat/lib/voice-visuals";
import { cn } from "@/shared/lib/utils";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";
import { isAdminUser } from "@/features/auth/lib/groups";
import {
  ChatListeningBubble,
  ChatMessageItem,
} from "@/features/chat/components/ChatMessageItem";
import { ChatComposer } from "@/features/chat/components/ChatComposer";

const SUGGESTIONS = [
  "Quero um look casual para o fim de semana",
  "Tem alguma peça de jeans disponível?",
  "Me ajuda a escolher um presente",
];

/** Glassy round icon button used in the panel header. */
const HEADER_BUTTON =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/60 backdrop-blur transition-all duration-200 hover:border-[var(--aura-2)] hover:bg-action-soft hover:shadow-[0_0_12px_-3px_var(--aura-2)] motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:shadow-none";

interface ChatPanelProps {
  /** Conversation state, owned by a parent that stays mounted across open/close. */
  chat: UseChatStream;
  /** Voice call bound to the same conversation (see `useVoiceChat`). */
  voice: UseVoiceChat;
  /** When provided, renders a close button in the header (used by the widget). */
  onClose?: () => void;
}

export function ChatPanel({ chat, voice, onClose }: ChatPanelProps) {
  const { user, status, startLogin } = useUserSession();
  const { messages, isStreaming, send, stop, reset } = chat;
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEmpty = messages.length === 0;
  const isVoiceActive =
    voice.status === "connecting" || voice.status === "connected";
  const isVoiceLive = voice.status === "connected";
  const voiceVisuals = getVoiceVisuals(voice);

  // Live feedback for the voice turn, before any transcript text exists: the
  // user's "listening" bubble, then the assistant's typing dots while it thinks.
  const voiceIndicators = isVoiceLive && (
    <>
      {voice.isUserTurnPending && (
        <ChatListeningBubble getLevel={voice.getMicLevel} />
      )}
      {!voice.isUserTurnPending && voice.agentState === "thinking" && (
        <ChatMessageItem
          message={{ id: "voice-thinking", role: "assistant", content: "", status: "streaming" }}
        />
      )}
    </>
  );
  // The chat is restricted to admins for now (and the backend rejects anonymous
  // requests). Gate the whole conversation UI accordingly.
  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";
  const canUseChat = isAuthenticated && isAdminUser(user);

  // Follow the latest content — covers new messages, token streaming, and the
  // typewriter reveal (which grows the DOM without changing `messages`). Only
  // auto-scrolls when the user is already near the bottom, so reading earlier
  // messages isn't interrupted.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
    const observer = new MutationObserver(() => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [canUseChat]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Not overflow-hidden: the orb's glow may spill past the header edge. */}
      <header className="relative z-10 border-b border-line bg-surface px-4 py-3">
        {/* Backdrop: aura glows from both corners over a fading dot grid. */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(90%_170%_at_0%_0%,color-mix(in_oklab,var(--aura-2)_22%,transparent),transparent_60%),radial-gradient(70%_150%_at_100%_0%,color-mix(in_oklab,var(--aura-3)_16%,transparent),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--aura-2),var(--aura-3),transparent)] bg-[length:200%_100%] motion-safe:animate-[shimmerX_4s_linear_infinite]" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {isVoiceLive ? (
              <VoiceOrb mode={voiceVisuals.mode} getLevel={voiceVisuals.getLevel} size={34} />
            ) : (
              <VoiceOrb mode="ambient" size={34}>
                <Sparkles className="h-4 w-4" />
              </VoiceOrb>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  Assistente Segunda Aura
                </h1>
                <span className="shrink-0 rounded-full border border-[color-mix(in_oklab,var(--aura-2)_60%,transparent)] bg-[color-mix(in_oklab,var(--aura-2)_14%,transparent)] px-1.5 py-px text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-action shadow-[0_0_10px_-3px_var(--aura-2)]">
                  IA
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="truncate">
                  {isVoiceActive ? "Em conversa por voz" : "Online · Tire dúvidas e descubra peças"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {canUseChat && (
              <button
                type="button"
                onClick={reset}
                disabled={isEmpty && !isStreaming && !isVoiceActive}
                title="Nova conversa"
                aria-label="Nova conversa"
                className={cn(HEADER_BUTTON, "text-foreground")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Fechar"
                aria-label="Fechar chat"
                className={cn(HEADER_BUTTON, "text-muted-foreground hover:text-foreground")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {!canUseChat ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          {isLoadingSession ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : isAuthenticated ? (
            // Logged in, but not an admin — chat is restricted for now.
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-action-soft text-action">
                <Lock className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Acesso restrito
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  O assistente está disponível apenas para administradores no momento.
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-action-soft text-action">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Entre para conversar
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Faça login para usar o assistente e receber recomendações de peças.
                </p>
              </div>
              <button
                type="button"
                onClick={startLogin}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-action px-4 text-sm font-medium text-action-foreground transition-colors hover:bg-action/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <LogIn className="h-[18px] w-[18px]" />
                Entrar
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-3 py-5 md:px-4">
              {isEmpty && isVoiceActive ? (
                // Voice call on a fresh conversation: the aura takes the stage
                // until the first transcript arrives.
                <div className="flex flex-col items-center gap-6 py-14 text-center motion-safe:animate-[fadeIn_300ms_ease-out]">
                  <VoiceOrb
                    mode={voiceVisuals.mode}
                    getLevel={voiceVisuals.getLevel}
                    size={104}
                  />
                  <div className="mt-4" aria-live="polite">
                    <h2 className="text-shimmer text-base font-semibold">
                      {voiceVisuals.label}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fale naturalmente. A conversa aparece aqui em texto.
                    </p>
                  </div>
                </div>
              ) : isEmpty ? (
                <div className="flex flex-col items-center gap-5 py-12 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-action-soft text-action">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Como posso ajudar?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pergunte sobre peças, estilos ou peça uma recomendação.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => send(suggestion)}
                        className="rounded-full border border-line px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <ChatMessageItem key={message.id} message={message} />
                  ))}
                  {voiceIndicators}
                </div>
              )}
            </div>
          </div>

          <ChatVoiceBar voice={voice} />
          <ChatComposer
            isStreaming={isStreaming}
            onSend={send}
            onStop={stop}
            onStartVoice={isVoiceActive ? undefined : () => void voice.start()}
          />
        </>
      )}
    </div>
  );
}
