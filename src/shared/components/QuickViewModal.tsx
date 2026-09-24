"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, ExternalLink } from "lucide-react";
import { Product } from "@/shared/types";
import {
  formatPrice,
  formatWhatsAppLink,
  getWhatsAppMessageText,
} from "@/shared/utils/format";
import { ProductImage } from "@/shared/components/ProductImage";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { SustainabilityBadge } from "@/shared/components/SustainabilityBadge";
import { ProductConditionScale } from "@/features/products/components/ProductConditionScale";
import { cn } from "@/shared/lib/utils";
import { env } from "@/shared/lib/env";
import Link from "next/link";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedImageIndex(0);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 w-full max-w-5xl max-h-[90vh] mx-4 overflow-hidden",
          "bg-background rounded-2xl shadow-2xl",
          "animate-in zoom-in-95 duration-300",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 z-20 rounded-full p-2",
            "bg-white/90 backdrop-blur-sm shadow-lg",
            "hover:bg-white transition-colors duration-200",
            "hover:scale-110 active:scale-95",
          )}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status badge and Favorite button */}
        <div className="absolute top-4 right-16 z-20 flex items-center gap-2">
          <Badge
            variant={product.available ? "default" : "secondary"}
            className="text-sm"
          >
            {product.available ? "Disponível" : "Vendido"}
          </Badge>
          <FavoriteButton productId={product.id} size="md" />
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[90vh]">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <ProductImage
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full"
                objectFit="cover"
                priority
              />

              {/* Sustainability badge overlay */}
              <div className="absolute top-4 left-4">
                <SustainabilityBadge variant="leaf" compact />
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden",
                      "border-2 transition-all duration-200",
                      selectedImageIndex === index
                        ? "border-coral scale-105"
                        : "border-border hover:border-coral/50",
                    )}
                  >
                    <ProductImage
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full"
                      objectFit="cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {product.name}
              </h2>

              <div className="text-3xl font-bold text-coral">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Product info */}
            <div className="flex flex-wrap gap-2">
              {product.category && (
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              )}
              {product.size && (
                <Badge variant="outline" className="text-xs">
                  Tamanho: {product.size}
                </Badge>
              )}
              {product.color && (
                <Badge variant="outline" className="text-xs">
                  {product.color}
                </Badge>
              )}
            </div>

            {/* Condition */}
            {product.condition && (
              <div className="py-2">
                <ProductConditionScale condition={product.condition} />
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Descrição
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto pt-4 border-t">
              {product.available && (
                <a
                  href={formatWhatsAppLink(
                    env.whatsappNumber,
                    getWhatsAppMessageText({
                      name: product.name,
                      price: product.price,
                      size: product.size,
                    }),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 px-6",
                    "bg-[#25D366] hover:bg-[#20BA5A]",
                    "text-white font-medium rounded-xl",
                    "transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                  Tenho interesse
                </a>
              )}

              <Link href={`/product/${product.id}`}>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={onClose}
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver detalhes completos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
