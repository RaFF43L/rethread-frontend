"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useChatStream } from "@/features/chat/hooks/useChatStream";
import { useVoiceChat } from "@/features/chat/hooks/useVoiceChat";
import { VoiceOrb } from "@/features/chat/components/VoiceOrb";
import { WhatsAppIcon } from "@/features/products/components/WhatsAppFloat";
import { env } from "@/shared/lib/env";

/**
 * Floating chat entry point: a glowing bubble anchored to the bottom-right that
 * expands into a chat panel over the current page. Mounted globally so it is
 * available on every screen. Sits below modals (z-90 < the Pix modal's z-100).
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Owned here so it survives closing the panel — closing just minimizes; the
  // conversation (and any in-flight stream) keeps running in the background.
  const chat = useChatStream();
  const voice = useVoiceChat(chat.bridge);
  const { stop: stopVoice } = voice;

  // Unlike the text stream, a voice call does not keep running minimized.
  const close = useCallback(() => {
    stopVoice();
    setOpen(false);
  }, [stopVoice]);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Assistente Segunda Aura"
          className="relative flex h-[min(620px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-[color-mix(in_oklab,var(--aura-1)_35%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--aura-2)_25%,transparent)] motion-safe:animate-[slideUp_220ms_ease-out]"
        >
          {/* Thin aura accent along the top edge. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,var(--aura-2),var(--aura-3),transparent)]" />
          <ChatPanel chat={chat} voice={voice} onClose={close} />
        </div>
      )}

      {!open && (
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${env.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fale pelo WhatsApp"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-150 ease-out hover:scale-105 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <WhatsAppIcon className="h-7 w-7" />
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir assistente"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 ease-out hover:scale-110 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            {/* Same aura as the voice call, idling until it is opened. */}
            <VoiceOrb mode="ambient" size={56}>
              <Sparkles className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            </VoiceOrb>
            {/* "Alive" status dot. */}
            <span className="absolute right-0.5 top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
