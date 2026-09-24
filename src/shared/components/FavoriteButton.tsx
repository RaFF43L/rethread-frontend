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
    setTimeout(() => setIsAnimating(false), 600);
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
          "rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center",
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
        "group relative rounded-full bg-background/80 dark:bg-background/60 backdrop-blur-md shadow-sm hover:shadow-lg",
        "flex items-center justify-center transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "border border-border/40 hover:border-border/60",
        favorite && "bg-coral/5 border-coral/30",
        sizeClasses[size],
        className
      )}
    >
      <Heart
        className={cn(
          "transition-all duration-300",
          iconSizes[size],
          favorite
            ? "fill-coral stroke-coral"
            : "stroke-muted-foreground group-hover:stroke-coral",
          isAnimating && "animate-[heartbeat_0.6s_ease-in-out]"
        )}
      />
      
      {/* Ripple effect */}
      {isAnimating && (
        <span className="absolute inset-0 rounded-full bg-coral/20 animate-ping" />
      )}
    </button>
  );
}
