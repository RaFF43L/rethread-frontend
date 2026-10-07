"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  calca: "Calças",
  blusa: "Blusas",
  camiseta: "Camisetas",
  short: "Shorts",
  vestido: "Vestidos",
  saia: "Saias",
  jaqueta: "Jaquetas",
  macacao: "Macacões",
};

interface CategoryFiltersProps {
  categories: { category: string; count: number }[];
  selectedCategory?: string;
}

const BUTTON_BASE =
  "relative inline-flex items-center h-9 px-4 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-['']";

const BUTTON_IDLE =
  "border border-line text-muted-foreground hover:bg-action-soft hover:text-foreground";

export function CategoryFilters({
  categories,
  selectedCategory,
}: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateCategory = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete("category");
    else params.set("category", value);
    params.set("page", "1");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <nav
      aria-label="Categorias"
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
    >
      <button
        type="button"
        onClick={() => updateCategory(null)}
        className={cn(
          BUTTON_BASE,
          !selectedCategory
            ? "bg-action text-action-foreground"
            : BUTTON_IDLE
        )}
      >
        Todas
      </button>
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.category;
        return (
          <button
            key={cat.category}
            type="button"
            onClick={() => updateCategory(isSelected ? null : cat.category)}
            className={cn(
              BUTTON_BASE,
              isSelected ? "bg-action text-action-foreground" : BUTTON_IDLE
            )}
          >
            {CATEGORY_LABELS[cat.category] || cat.category}
          </button>
        );
      })}
    </nav>
  );
}
