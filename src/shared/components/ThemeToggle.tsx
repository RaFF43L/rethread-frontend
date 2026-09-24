"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
      }
      className="text-foreground"
    >
      {theme === "dark" ? (
        <Sun className="w-[22px] h-[22px]" />
      ) : (
        <Moon className="w-[22px] h-[22px]" />
      )}
    </button>
  );
}
