"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/features/products/context/FavoritesProvider";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import type { Product } from "@/shared/types";

interface FavoriteButtonProps {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ product, className, size = "md" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const favorite = isFavorite(product.numericId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    void toggleFavorite(product);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={favorite}
      className={cn(
        "group relative rounded-full bg-surface/80 backdrop-blur-md",
        "flex items-center justify-center transition-colors duration-150",
        "motion-safe:hover:scale-105 motion-safe:active:scale-95",
        "border border-line",
        favorite && "bg-action-soft border-action/30",
        sizeClasses[size],
        className
      )}
    >
      <Heart
        className={cn(
          "transition-colors duration-150",
          iconSizes[size],
          favorite
            ? "fill-action stroke-action"
            : "stroke-muted-foreground group-hover:stroke-action",
          isAnimating && "motion-safe:animate-[favPop_200ms_ease-out]"
        )}
      />
    </button>
  );
}
