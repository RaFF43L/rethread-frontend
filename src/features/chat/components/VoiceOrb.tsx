"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type VoiceOrbMode =
  | "ambient"
  | "connecting"
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "muted";

/** Level source for orbs that don't follow any audio. */
export const SILENT_LEVEL = () => 0;

/** Volume below this is treated as silence (room noise). */
const NOISE_FLOOR = 0.05;
const GAIN = 2.4;
/** Per-frame easing towards the target level: fast attack, slow release. */
const ATTACK = 0.45;
const RELEASE = 0.08;

interface VoiceOrbProps {
  /** `ambient` is purely decorative: slow spin, no audio, no rAF loop. */
  mode: VoiceOrbMode;
  /** Instant volume in [0, 1] for the active voice; polled every animation frame. */
  getLevel?: () => number;
  /** Diameter of the core, in px. The glow spills outside of it. */
  size?: number;
  className?: string;
  /** Rendered centered on top of the sphere (e.g. an icon). */
  children?: ReactNode;
}

/**
 * The "aura": a glowing sphere whose halo swells with the voice in the room —
 * the user's while they speak, the assistant's while it answers — and spins
 * faster while the assistant thinks. Level changes are written straight to the
 * DOM from a rAF loop, so the chat never re-renders at frame rate.
 */
export function VoiceOrb({
  mode,
  getLevel = SILENT_LEVEL,
  size = 40,
  className,
  children,
}: VoiceOrbProps) {
  const haloRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const reactive = mode === "listening" || mode === "speaking" || mode === "idle";
  const animated = reactive || mode === "thinking" || mode === "muted";

  useEffect(() => {
    // Ambient/connecting orbs keep their static styles; no per-frame work.
    if (!animated) return;
    let frame = 0;
    let level = 0;
    const tick = () => {
      const raw = reactive ? (getLevel() - NOISE_FLOOR) * GAIN : 0;
      const target = Math.min(1, Math.max(0, raw));
      level += (target - level) * (target > level ? ATTACK : RELEASE);
      if (haloRef.current) {
        haloRef.current.style.transform = `scale(${(0.9 + level * 0.55).toFixed(3)})`;
        haloRef.current.style.opacity = (0.45 + level * 0.55).toFixed(3);
      }
      if (coreRef.current) {
        coreRef.current.style.transform = `scale(${(1 + level * 0.1).toFixed(3)})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animated, getLevel, reactive]);

  const isDim = mode === "muted" || mode === "connecting";
  const spin =
    mode === "thinking"
      ? "motion-safe:animate-[auraSpin_1.6s_linear_infinite]"
      : "motion-safe:animate-[auraSpin_7s_linear_infinite]";

  return (
    <div
      aria-hidden="true"
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* Ripples while someone is talking. */}
      {(mode === "listening" || mode === "speaking") &&
        [0, 1].map((i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-full border border-[var(--aura-2)] opacity-0 motion-safe:animate-[auraRipple_2.4s_ease-out_infinite]"
            style={{ animationDelay: `${i * 1.2}s` }}
          />
        ))}

      {/* Halo: scaled by the voice level (outer), spun by CSS (inner). */}
      <div
        ref={haloRef}
        className={cn(
          "absolute -inset-[30%] transition-opacity duration-300",
          // No audio to follow: let the halo breathe on its own.
          mode === "ambient" && "motion-safe:animate-[auraBreath_3.2s_ease-in-out_infinite]",
        )}
        style={{ opacity: mode === "ambient" ? 0.7 : 0.45 }}
      >
        {/* Even base glow, so the spinning gradient never looks lopsided. */}
        <div
          className={cn(
            "absolute inset-[12%] rounded-full bg-[var(--aura-2)] opacity-40 blur-lg",
            isDim && "opacity-15",
          )}
        />
        <div
          className={cn(
            "h-full w-full rounded-full blur-md",
            "[background:conic-gradient(from_0deg,var(--aura-1),var(--aura-2),var(--aura-3),var(--aura-2),var(--aura-1))]",
            spin,
            isDim && "opacity-40 grayscale",
          )}
        />
      </div>

      {/* Core sphere with a glassy highlight and a slow inner swirl. */}
      <div
        ref={coreRef}
        className={cn(
          "absolute inset-0 overflow-hidden rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,0.35),0_4px_14px_-4px_var(--aura-1)] transition-[filter] duration-300",
          "[background:radial-gradient(circle_at_50%_60%,var(--aura-1),var(--aura-core))]",
          isDim && "grayscale-[0.6]",
          mode === "connecting" && "motion-safe:animate-[auraBreath_1.4s_ease-in-out_infinite]",
        )}
      >
        <div
          className={cn(
            "absolute -inset-1/4 opacity-60 mix-blend-screen",
            "[background:conic-gradient(from_90deg,transparent,var(--aura-2),transparent_40%,var(--aura-3),transparent_75%)]",
            spin,
          )}
        />
        <div className="absolute inset-0 rounded-full [background:radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.55),transparent_38%)]" />
      </div>

      {children && (
        <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
          {children}
        </div>
      )}
    </div>
  );
}
