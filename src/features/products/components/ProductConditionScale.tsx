"use client";

import { ProductCondition } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

const STEPS: { key: ProductCondition; label: string; description: string }[] = [
  {
    key: "new_with_tag",
    label: "Novo c/ etiqueta",
    description: "Peça nunca usada, com etiqueta original.",
  },
  {
    key: "excellent",
    label: "Excelente",
    description: "Usada poucas vezes, sem sinais visíveis de uso.",
  },
  {
    key: "very_good",
    label: "Muito bom",
    description: "Uso leve, pequenos sinais imperceptíveis à distância.",
  },
  {
    key: "visible_marks",
    label: "Marcas visíveis",
    description: "Sinais de uso perceptíveis, detalhados nas fotos macro.",
  },
];

interface ProductConditionScaleProps {
  condition?: ProductCondition;
  className?: string;
  /** Renderiza apenas o selo compacto (para uso em cards de listagem) */
  compact?: boolean;
}

export function ProductConditionScale({
  condition,
  className,
  compact = false,
}: ProductConditionScaleProps) {
  if (!condition) return null;

  const activeIndex = STEPS.findIndex((step) => step.key === condition);
  if (activeIndex === -1) return null;

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground",
          className,
        )}
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-foreground"
          aria-hidden="true"
        />
        {STEPS[activeIndex].label}
      </span>
    );
  }

  return (
    <div
      className={cn("w-full", className)}
      role="group"
      aria-label={`Condição da peça: ${STEPS[activeIndex].label}`}
    >
      <ol className="flex items-center gap-1.5">
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          return (
            <li
              key={step.key}
              className="flex flex-1 flex-col items-center gap-2"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  isActive || isPast ? "bg-foreground" : "bg-border",
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-center text-[11px] uppercase tracking-wide transition-colors",
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-muted-foreground">
        {STEPS[activeIndex].description}
      </p>
    </div>
  );
}
