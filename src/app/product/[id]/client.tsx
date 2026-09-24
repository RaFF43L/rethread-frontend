"use client";

import { useEffect } from "react";
import { ImageCarousel } from "@/shared/components/ImageCarousel";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { SustainabilityBadge } from "@/shared/components/SustainabilityBadge";
import { ProductConditionScale } from "@/features/products/components/ProductConditionScale";
import { ProductMeasurements } from "@/features/products/components/ProductMeasurements";
import { useRecentlyViewed } from "@/shared/hooks/useRecentlyViewed";
import { env } from "@/shared/lib/env";
import {
  formatWhatsAppLink,
  getWhatsAppMessageText,
} from "@/shared/utils/format";
import { formatPrice } from "@/shared/utils/format";
import { MessageCircle, ArrowLeft, Share2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { Product } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${formatPrice(product.price)}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  };

  const badges = [product.era, ...(product.style ?? []), product.fit].filter(
    (value): value is string => Boolean(value),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <a
            href="/"
            className={cn(
              "flex items-center gap-2 text-foreground",
              "hover:opacity-70 transition-opacity"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </a>
          
          <div className="flex items-center gap-2">
            {typeof window !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className={cn(
                  "p-2 rounded-full hover:bg-secondary transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-foreground/20"
                )}
                aria-label="Compartilhar"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <FavoriteButton productId={product.id} size="md" />
            <Badge
              variant={product.available ? "default" : "secondary"}
              className="text-xs font-medium ml-1"
            >
              {product.available ? "Disponível" : "Vendido"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Left column: Images */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <ImageCarousel
              images={product.images}
              videos={product.videos}
              alt={product.name}
              priority
            />
          </div>

          {/* Right column: Details */}
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            {/* Product name */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-foreground">
              {formatPrice(product.price)}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {/* Product info */}
            <div className="flex flex-wrap gap-3 py-4 border-y border-border">
              {product.category && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Categoria:</span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              )}
              {product.size && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tamanho:</span>
                  <Badge variant="secondary">{product.size}</Badge>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Cor:</span>
                  <Badge variant="secondary">{product.color}</Badge>
                </div>
              )}
            </div>

            {/* Condition scale */}
            {product.condition && (
              <div className="py-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Condição da Peça
                </h3>
                <ProductConditionScale condition={product.condition} />
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Descrição
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Measurements */}
            {product.measurements && product.measurements.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Medidas
                </h3>
                <ProductMeasurements
                  measurements={product.measurements}
                  size={product.size}
                />
              </div>
            )}

            {/* Sustainability info */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Impacto Positivo
              </h3>
              <SustainabilityBadge variant="leaf" />
            </div>

            {/* CTA */}
            {product.available && (
              <div className="pt-6 sticky bottom-4 bg-background/95 backdrop-blur-sm rounded-xl p-4 border border-border shadow-lg">
                <a
                  href={formatWhatsAppLink(
                    env.whatsappNumber,
                    getWhatsAppMessageText({
                      name: product.name,
                      price: product.price,
                      size: product.size,
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full flex items-center justify-center gap-3 py-4 px-6",
                    "bg-[#25D366] hover:bg-[#20BA5A]",
                    "text-white font-semibold rounded-xl",
                    "transition-all duration-300",
                    "hover:scale-105 active:scale-95",
                    "shadow-lg hover:shadow-xl"
                  )}
                >
                  <MessageCircle className="w-6 h-6" />
                  Tenho interesse nesta peça
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
