"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Mic, MicOff, PhoneOff, X } from "lucide-react";
import type { UseVoiceChat } from "@/features/chat/hooks/useVoiceChat";
import { VoiceOrb } from "@/features/chat/components/VoiceOrb";
import { formatCallDuration, getVoiceVisuals } from "@/features/chat/lib/voice-visuals";
import { cn } from "@/shared/lib/utils";

/** Elapsed call time; ticks on its own so the chat doesn't re-render every second. */
function CallTimer({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="tabular-nums">{formatCallDuration(since, now)}</span>;
}

/** Call dock shown above the composer while a voice call is active (or failed). */
export function ChatVoiceBar({ voice }: { voice: UseVoiceChat }) {
  const { status, isMuted, error, connectedAt, stop, toggleMute } = voice;

  if (status === "idle" && !error) return null;

  if (status === "error" || status === "idle") {
    return (
      <div className="flex items-center gap-2 border-t border-line bg-surface px-4 py-2 text-xs text-red-600 motion-safe:animate-[blockRise_200ms_ease-out] dark:text-red-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <p className="flex-1">{error}</p>
        <button
          type="button"
          onClick={stop}
          aria-label="Fechar aviso"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-action-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const { mode, label, getLevel } = getVoiceVisuals(voice);
  const isConnecting = status === "connecting";
  const isLive = mode === "listening" || mode === "thinking" || mode === "speaking";

  return (
    <div className="relative overflow-hidden border-t border-line bg-surface px-3 py-2.5 motion-safe:animate-[blockRise_220ms_ease-out]">
      {/* Ambient glow from the orb side + a light sweep along the top edge. */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_140%_at_0%_50%,color-mix(in_oklab,var(--aura-2)_16%,transparent),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--aura-2),var(--aura-3),transparent)] bg-[length:200%_100%] opacity-80 motion-safe:animate-[shimmerX_3s_linear_infinite]" />

      <div className="relative mx-auto flex w-full max-w-3xl items-center gap-3">
        <VoiceOrb mode={mode} getLevel={getLevel} size={36} className="mx-1" />

        <div className="min-w-0 flex-1" aria-live="polite">
          <p
            className={cn(
              "truncate text-sm font-medium text-foreground",
              (isConnecting || isLive) && "text-shimmer",
            )}
          >
            {label}
          </p>
          <p className="flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
            {error && !isConnecting ? (
              <span className="truncate normal-case tracking-normal text-red-600 dark:text-red-400">
                {error}
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isConnecting ? "bg-muted-foreground" : "bg-emerald-400 shadow-[0_0_6px_var(--aura-2)]",
                  )}
                />
                Voz
                {connectedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <CallTimer since={connectedAt} />
                  </>
                )}
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void toggleMute()}
          disabled={isConnecting}
          aria-pressed={isMuted}
          aria-label={isMuted ? "Ligar microfone" : "Desligar microfone"}
          title={isMuted ? "Ligar microfone" : "Desligar microfone"}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:cursor-not-allowed disabled:opacity-40 motion-safe:active:scale-95",
            isMuted
              ? "border-transparent bg-foreground text-background"
              : "border-line bg-surface text-foreground hover:border-action/40 hover:bg-action-soft",
          )}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={stop}
          aria-label="Encerrar conversa por voz"
          title="Encerrar"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_4px_14px_-4px_rgba(220,38,38,0.7)] transition-all duration-150 hover:bg-red-600/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-safe:active:scale-95"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
