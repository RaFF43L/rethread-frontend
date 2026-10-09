"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/features/products/context/FavoritesProvider";

export function FavoritesShortcut() {
  const { count } = useFavorites();

  return (
    <Link
      href="/favorites"
      className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-line bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Heart
        className={count > 0 ? "h-4 w-4 fill-action stroke-action" : "h-4 w-4"}
      />
      Meus favoritos
      {count > 0 && (
        <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1 text-[11px] font-semibold leading-none text-action-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
