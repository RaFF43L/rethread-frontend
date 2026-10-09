"use client";

import { useEffect, useRef, useState } from "react";

const TICK_MS = 16; // ~1 frame

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Progressively reveals `target`, giving a steady "typing" feel regardless of
 * how the text arrives (token by token, or the whole reply at once).
 *
 * The reveal rate is proportional to the remaining backlog, so it always keeps
 * up with incoming tokens and eases out at the end. Text that is already
 * complete on first mount (e.g. an old message after reopening) is shown in
 * full with no animation.
 */
export function useTypewriter(target: string): string {
  const [displayed, setDisplayed] = useState(target);
  // How many characters are currently revealed. Starts fully revealed so a
  // message that mounts already complete does not re-animate.
  const revealedRef = useRef(target.length);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    // All state updates happen inside the (async) timer callback — never
    // synchronously in the effect body — so a blank/shrunk/already-complete
    // target snaps after one tick instead of triggering a cascading render.
    const step = () => {
      if (prefersReducedMotion() || target.length <= revealedRef.current) {
        revealedRef.current = target.length;
        setDisplayed(target);
        return;
      }
      const backlog = target.length - revealedRef.current;
      const chunk = Math.max(1, Math.ceil(backlog / 8));
      revealedRef.current = Math.min(target.length, revealedRef.current + chunk);
      setDisplayed(target.slice(0, revealedRef.current));
      if (revealedRef.current < target.length) {
        timer = setTimeout(step, TICK_MS);
      }
    };
    timer = setTimeout(step, TICK_MS);

    return () => clearTimeout(timer);
  }, [target]);

  return displayed;
}
