"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ productId, className, size = "md" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const favorite = isLoaded && isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleFavorite(productId);
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

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "rounded-full bg-surface/80 border border-line backdrop-blur-sm flex items-center justify-center",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
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
