import { cn } from "@/shared/lib/utils";

/** Fixed sparkle positions (in % of the header) so SSR and client match. */
const SPARKLES = [
  { left: "8%", top: "22%", size: 3, delay: "0s" },
  { left: "21%", top: "70%", size: 2, delay: "1.1s" },
  { left: "34%", top: "30%", size: 2, delay: "2.3s" },
  { left: "47%", top: "64%", size: 3, delay: "0.6s" },
  { left: "58%", top: "18%", size: 2, delay: "1.8s" },
  { left: "69%", top: "58%", size: 3, delay: "2.9s" },
  { left: "81%", top: "26%", size: 2, delay: "0.3s" },
  { left: "92%", top: "68%", size: 2, delay: "1.5s" },
];

/**
 * Decorative neon layer for the site header, built on the same "aura" palette
 * as the voice chat: drifting glows, a halo behind the logo, twinkling sparkles,
 * a periodic light sweep and a shimmering neon line on the bottom edge.
 * Pure CSS — every animation is gated behind `motion-safe`.
 */
export function SiteHeaderGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Light theme: the logo PNG has an opaque white background, so keep its
          area untouched — any tint around it would outline the image's box. */}
      <div className="absolute inset-0 [--logo-clear:190px] md:[--logo-clear:340px] [mask-image:linear-gradient(90deg,transparent_var(--logo-clear),black_calc(var(--logo-clear)_+_120px))] dark:[mask-image:none]">
        {/* Soft ambient glows (opacity on the wrapper: auraBreath animates opacity) */}
        <div className="absolute right-[12%] -top-20 h-40 w-72 opacity-[0.12] dark:opacity-20">
          <div className="h-full w-full rounded-full bg-[var(--aura-2)] blur-3xl motion-safe:animate-[auraBreath_6s_ease-in-out_infinite]" />
        </div>
        <div className="absolute -right-10 -bottom-24 h-40 w-80 opacity-[0.12] dark:opacity-20">
          <div
            className="h-full w-full rounded-full bg-[var(--aura-3)] blur-3xl motion-safe:animate-[auraBreath_7.5s_ease-in-out_infinite]"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        {/* Halo behind the logo, like the voice orb's spinning aura. Dark only:
            the light logo has an opaque white background. */}
        <div className="absolute left-4 top-1/2 hidden h-20 w-40 -translate-y-1/2 opacity-25 dark:block md:left-14 md:h-28 md:w-56">
          <div className="h-full w-full rounded-full blur-2xl [background:conic-gradient(from_0deg,var(--aura-1),var(--aura-2),var(--aura-3),var(--aura-2),var(--aura-1))] motion-safe:animate-[auraSpin_12s_linear_infinite]" />
        </div>

        {/* Sparkles */}
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[var(--aura-2)] opacity-60 shadow-[0_0_6px_2px_var(--aura-2)] motion-safe:animate-[auraTwinkle_3.6s_ease-in-out_infinite]"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}

        {/* Light sweep crossing the header every few seconds */}
        <div className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 opacity-0 [background:linear-gradient(90deg,transparent,color-mix(in_srgb,var(--aura-2)_22%,transparent),transparent)] motion-safe:animate-[neonSweep_9s_ease-in-out_infinite]" />

        {/* Blurred glow under the neon line */}
        <NeonLine className="h-0.5 blur-[2px] opacity-90" />
        <NeonLine className="h-2 blur-md opacity-50" />
      </div>

      {/* Crisp neon bottom edge, full width in both themes */}
      <NeonLine className="h-px" />
    </div>
  );
}

function NeonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 bg-[length:200%_100%] motion-safe:animate-[shimmerX_6s_linear_infinite]",
        "[background-image:linear-gradient(90deg,transparent,var(--aura-1)_15%,var(--aura-2)_35%,var(--aura-3)_50%,var(--aura-2)_65%,var(--aura-1)_85%,transparent)]",
        className,
      )}
    />
  );
}
