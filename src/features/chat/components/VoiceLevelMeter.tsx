"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";

/** Relative height of each bar: tallest in the middle. */
const BAR_WEIGHTS = [0.5, 0.8, 1, 0.8, 0.5];
const MIN_SCALE = 0.2;
/** Volume below this is treated as silence (room noise). */
const NOISE_FLOOR = 0.05;
/** Maps the useful volume range onto the full bar height. */
const GAIN = 2.4;

interface VoiceLevelMeterProps {
  /** Instant volume in [0, 1]; polled every animation frame. */
  getLevel: () => number;
  className?: string;
  barClassName?: string;
}

/**
 * Equalizer-style bars that follow the microphone volume. Writes straight to
 * the DOM from a rAF loop, so it never re-renders the surrounding chat.
 */
export function VoiceLevelMeter({
  getLevel,
  className,
  barClassName,
}: VoiceLevelMeterProps) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    const tick = (time: number) => {
      const level = Math.min(1, Math.max(0, (getLevel() - NOISE_FLOOR) * GAIN));
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        // A small per-bar wobble so the bars don't move in lockstep.
        const wobble = 0.8 + 0.2 * Math.sin(time / 110 + i * 1.7);
        const scale = MIN_SCALE + (1 - MIN_SCALE) * level * BAR_WEIGHTS[i] * wobble;
        bar.style.transform = `scaleY(${scale.toFixed(3)})`;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [getLevel]);

  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex h-4 items-center gap-[3px]", className)}
    >
      {BAR_WEIGHTS.map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className={cn(
            "h-full w-[3px] origin-center rounded-full bg-current transition-transform duration-75",
            barClassName,
          )}
          style={{ transform: `scaleY(${MIN_SCALE})` }}
        />
      ))}
    </span>
  );
}
