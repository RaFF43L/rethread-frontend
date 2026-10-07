"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/components/ThemeProvider";
import { cn } from "@/shared/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={theme === "dark"}
      className="flex items-center border border-line bg-surface rounded-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <span
        className={cn(
          "flex items-center justify-center w-10 h-9 transition-colors duration-150",
          theme === "light"
            ? "bg-action text-action-foreground"
            : "text-muted-foreground"
        )}
      >
        <Sun className="w-4 h-4" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "flex items-center justify-center w-10 h-9 transition-colors duration-150",
          theme === "dark"
            ? "bg-action text-action-foreground"
            : "text-muted-foreground"
        )}
      >
        <Moon className="w-4 h-4" aria-hidden="true" />
      </span>
    </button>
  );
}
