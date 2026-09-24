import { Leaf, Droplet, Recycle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SustainabilityBadgeProps {
  className?: string;
  variant?: "leaf" | "water" | "recycle";
  showLabel?: boolean;
  compact?: boolean;
}

const variants = {
  leaf: {
    icon: Leaf,
    label: "Sustentável",
    description: "Reduz impacto ambiental",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  water: {
    icon: Droplet,
    label: "Economiza Água",
    description: "Até 2.700L economizados",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  recycle: {
    icon: Recycle,
    label: "Circular",
    description: "Economia circular",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
};

export function SustainabilityBadge({
  className,
  variant = "leaf",
  showLabel = true,
  compact = false,
}: SustainabilityBadgeProps) {
  const config = variants[variant];
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
          config.bg,
          config.border,
          className
        )}
        title={config.description}
      >
        <Icon className={cn("w-3.5 h-3.5", config.color)} />
        {showLabel && (
          <span className={cn("text-xs font-medium", config.color)}>
            {config.label}
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        config.bg,
        config.border,
        className
      )}
    >
      <div className={cn("rounded-full p-2", "bg-white shadow-sm")}>
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>
      <div className="flex-1">
        <h4 className={cn("text-sm font-semibold mb-0.5", config.color)}>
          {config.label}
        </h4>
        <p className="text-xs text-muted-foreground">
          {config.description}
        </p>
      </div>
    </div>
  );
}
