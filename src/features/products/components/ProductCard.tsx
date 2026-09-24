"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { Product } from "@/shared/types";
import { formatPrice } from "@/shared/utils/format";
import { ProductImage } from "@/shared/components/ProductImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { SustainabilityBadge } from "@/shared/components/SustainabilityBadge";
import { cn } from "@/shared/lib/utils";
import { ProductConditionScale } from "./ProductConditionScale";

export type ProductCardViewMode = "editorial" | "compact";

interface ProductCardProps {
  product: Product;
  whatsappNumber?: string;
  /** "editorial" = imagem grande estilo moodboard; "compact" = grade tradicional (default, mantém comportamento atual) */
  viewMode?: ProductCardViewMode;
  /** Chamado ao clicar em "Garimpar similares"; default navega para o catálogo filtrado por categoria */
  onFindSimilar?: (product: Product) => void;
  /** Callback para abrir Quick View */
  onQuickView?: (product: Product) => void;
}

export function ProductCard({
  product,
  viewMode = "compact",
  onFindSimilar,
  onQuickView,
}: ProductCardProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const isEditorial = viewMode === "editorial";
  const secondImage = product.images[1];

  const goToDetails = () => router.push(`/product/${product.id}`);

  const handleFindSimilar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFindSimilar) {
      onFindSimilar(product);
      return;
    }
    if (product.category) {
      router.push(`/?categoria=${encodeURIComponent(product.category)}`);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const badges = [product.era, ...(product.style ?? []), product.fit].filter(
    (value): value is string => Boolean(value),
  );

  return (
    <article className={cn("group", imageLoaded && "animate-in fade-in duration-500")}>
      <div
        onClick={goToDetails}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToDetails();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Ver detalhes de ${product.name}`}
        className={cn(
          "relative overflow-hidden bg-neutral-100 dark:bg-card mb-4 cursor-pointer",
          "transition-all duration-300 ease-out",
          "group-hover:shadow-xl",
          isEditorial ? "aspect-[4/5]" : "aspect-[3/4]",
        )}
      >
        <ProductImage
          src={product.images[0] ?? "/placeholder-product.svg"}
          alt={product.name}
          objectFit="cover"
        />

        {secondImage && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
            <ProductImage 
              src={secondImage} 
              alt="" 
              objectFit="cover"
            />
          </div>
        )}

        {/* Top badges and availability */}
        <div className="absolute left-3 top-3 right-3 z-20 flex items-start justify-between gap-2">
          {product.condition && (
            <div className="bg-neutral-950/85 px-2 py-1">
              <ProductConditionScale condition={product.condition} compact />
            </div>
          )}
          
          {!product.available && (
            <span className="bg-neutral-950/85 px-2 py-1 text-[9px] tracking-[0.12em] uppercase text-coral font-medium">
              Vendido
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className={cn(
          "absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between gap-2",
          "transition-all duration-300",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          "translate-y-2 group-hover:translate-y-0"
        )}>
          <FavoriteButton productId={product.id} size="sm" />
          
          <div className="flex gap-2">
          {onQuickView && (
            <button
              type="button"
              onClick={handleQuickView}
              className={cn(
                "flex items-center justify-center rounded-full",
                "bg-background/90 backdrop-blur-sm p-2 text-foreground",
                "shadow-sm hover:shadow-md transition-all duration-200",
                "hover:bg-background hover:scale-110 active:scale-95"
              )}
              aria-label={`Visualização rápida de ${product.name}`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          
          {product.category && (
            <button
              type="button"
              onClick={handleFindSimilar}
              className={cn(
                "flex items-center justify-center rounded-full",
                "bg-background/90 backdrop-blur-sm p-2 text-foreground",
                "shadow-sm hover:shadow-md transition-all duration-200",
                "hover:bg-background hover:scale-110 active:scale-95"
              )}
              aria-label={`Garimpar peças parecidas com ${product.name}`}
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          </div>
        </div>

        {/* Overlay gradient on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        )} />
      </div>

      <div
        onClick={goToDetails}
        className="space-y-1.5 cursor-pointer"
      >
        {product.brand && (
          <p className="text-[10px] tracking-[0.20em] uppercase text-coral font-semibold">
            {product.brand}
          </p>
        )}
        <h3 className={cn(
          "text-[14px] font-medium text-neutral-950 line-clamp-1 leading-snug",
          "transition-colors duration-200"
        )}>
          {product.name}
        </h3>
        {product.condition && (
          <p className="text-[11px] text-neutral-600">
            {product.condition === 'new_with_tag' && 'Nova com etiqueta'}
            {product.condition === 'excellent' && 'Excelente estado'}
            {product.condition === 'very_good' && 'Muito bom estado'}
            {product.condition === 'visible_marks' && 'Marcas visíveis'}
          </p>
        )}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-[20px] font-bold text-neutral-950 font-serif">
            {formatPrice(product.price)}
          </span>
          {product.size && (
            <span className="text-[11px] text-neutral-700">
              · Tam. {product.size}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton({
  viewMode = "compact",
}: {
  viewMode?: ProductCardViewMode;
}) {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div
        className={cn(
          "bg-muted mb-3 rounded-2xl",
          viewMode === "editorial" ? "aspect-[4/5]" : "aspect-[3/4]",
        )}
      />
      <div className="h-3 w-2/3 bg-muted rounded mb-2" />
      <div className="h-3 w-1/3 bg-muted rounded" />
    </div>
  );
}
