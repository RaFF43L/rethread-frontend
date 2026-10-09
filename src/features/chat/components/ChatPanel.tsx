"use client";

import { useEffect, useRef } from "react";
import { Loader2, Lock, LogIn, RotateCcw, Sparkles, X } from "lucide-react";
import type { UseChatStream } from "@/features/chat/hooks/useChatStream";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";
import { isAdminUser } from "@/features/auth/lib/groups";
import { ChatMessageItem } from "@/features/chat/components/ChatMessageItem";
import { ChatComposer } from "@/features/chat/components/ChatComposer";

const SUGGESTIONS = [
  "Quero um look casual para o fim de semana",
  "Tem alguma peça de jeans disponível?",
  "Me ajuda a escolher um presente",
];

interface ChatPanelProps {
  /** Conversation state, owned by a parent that stays mounted across open/close. */
  chat: UseChatStream;
  /** When provided, renders a close button in the header (used by the widget). */
  onClose?: () => void;
}

export function ChatPanel({ chat, onClose }: ChatPanelProps) {
  const { user, status, startLogin } = useUserSession();
  const { messages, isStreaming, send, stop, reset } = chat;
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEmpty = messages.length === 0;
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
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-action-soft text-action">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Assistente Segunda Aura
            </h1>
            <p className="text-xs text-muted-foreground">
              Tire dúvidas e descubra peças
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {canUseChat && (
            <button
              type="button"
              onClick={reset}
              disabled={isEmpty && !isStreaming}
              title="Nova conversa"
              aria-label="Nova conversa"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-foreground transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:cursor-not-allowed disabled:opacity-40"
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-action-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
              {isEmpty ? (
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
                </div>
              )}
            </div>
          </div>

          <ChatComposer isStreaming={isStreaming} onSend={send} onStop={stop} />
        </>
      )}
    </div>
  );
}
