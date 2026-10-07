"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageCarousel } from "@/shared/components/ImageCarousel";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ProductConditionScale } from "@/features/products/components/ProductConditionScale";
import { ProductMeasurements } from "@/features/products/components/ProductMeasurements";
import { useRecentlyViewed } from "@/shared/hooks/useRecentlyViewed";
import { env } from "@/shared/lib/env";
import {
  formatPrice,
  formatWhatsAppLink,
  getProductInquiryMessage,
} from "@/shared/utils/format";
import { MessageCircle, ArrowLeft, Share2, Leaf } from "lucide-react";
import type { Product } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

interface ProductDetailClientProps {
  product: Product;
}

const CATEGORY_DISPLAY: Record<string, string> = {
  calca: "Calça",
  blusa: "Blusa",
  camiseta: "Camiseta",
  short: "Short",
  vestido: "Vestido",
  saia: "Saia",
  jaqueta: "Jaqueta",
  macacao: "Macacão",
};

function formatCategory(category: string): string {
  return (
    CATEGORY_DISPLAY[category] ??
    category.charAt(0).toUpperCase() + category.slice(1)
  );
}

const WHATSAPP_BUTTON =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-action px-4 text-sm font-medium text-action-foreground transition-colors duration-150 ease-out hover:bg-action/90 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addRecentlyViewed } = useRecentlyViewed();
  const router = useRouter();
  const ctaRef = useRef<HTMLDivElement>(null);
  const [canShare, setCanShare] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [showMobileBar, setShowMobileBar] = useState(false);

  useEffect(() => {
    addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);

  useEffect(() => {
    // Client-only values read after mount to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    const node = ctaRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowMobileBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: product.name,
        text: `${product.name} - ${formatPrice(product.price)}`,
        url: window.location.href,
      });
    } catch {
      // User cancelled or sharing unavailable
    }
  };

  const whatsappLink = product.available
    ? formatWhatsAppLink(
        env.whatsappNumber,
        getProductInquiryMessage(
          {
            name: product.name,
            price: product.price,
            size: product.size,
            color: product.color,
          },
          pageUrl,
        ),
      )
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-surface border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action rounded"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            {canShare && (
              <button
                type="button"
                onClick={handleShare}
                className="rounded-full p-2 text-foreground transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                aria-label="Compartilhar"
              >
                <Share2 className="h-5 w-5" />
              </button>
            )}
            <FavoriteButton product={product} size="md" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 md:pb-8">
        <div className="grid items-start gap-8 md:grid-cols-[55fr_45fr] md:gap-12">
          {/* Left column: photo */}
          <div className="motion-safe:animate-[productFade_300ms_ease-out_both]">
            <ImageCarousel
              images={product.images}
              videos={product.videos}
              alt={product.name}
              priority
              objectFit="contain"
            />
          </div>

          {/* Right column: info */}
          <div className="flex flex-col gap-5">
            {/* Name */}
            <h1
              className="text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground motion-safe:animate-[blockRise_300ms_ease-out_both]"
              style={{ animationDelay: "0ms" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <p
              className="text-[1.5rem] font-semibold text-foreground motion-safe:animate-[blockRise_300ms_ease-out_both]"
              style={{ animationDelay: "50ms" }}
            >
              {formatPrice(product.price)}
            </p>

            {/* Attributes + availability */}
            <div
              className="flex flex-wrap items-center gap-2 motion-safe:animate-[blockRise_300ms_ease-out_both]"
              style={{ animationDelay: "100ms" }}
            >
              <span
                className={cn(
                  "inline-flex h-7 items-center rounded-md px-2.5 text-[0.75rem] font-medium",
                  product.available
                    ? "bg-action text-action-foreground"
                    : "border border-line text-muted-foreground",
                )}
              >
                {product.available ? "Disponível" : "Indisponível"}
              </span>
              {product.category && (
                <span className="inline-flex h-7 items-center rounded-md bg-action-soft px-2.5 text-[0.8125rem] text-foreground">
                  {formatCategory(product.category)}
                </span>
              )}
              {product.size && (
                <span className="inline-flex h-7 items-center rounded-md bg-action-soft px-2.5 text-[0.8125rem] text-foreground">
                  Tamanho {product.size}
                </span>
              )}
              {product.color && (
                <span className="inline-flex h-7 items-center rounded-md bg-action-soft px-2.5 text-[0.8125rem] text-foreground">
                  {product.color}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div
                className="motion-safe:animate-[blockRise_300ms_ease-out_both]"
                style={{ animationDelay: "150ms" }}
              >
                <h2 className="mb-1 text-sm font-medium text-foreground">
                  Descrição
                </h2>
                <p className="text-[0.9375rem] leading-[1.5] text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            {/* Condition */}
            {product.condition && (
              <div
                className="motion-safe:animate-[blockRise_300ms_ease-out_both]"
                style={{ animationDelay: "200ms" }}
              >
                <h2 className="mb-2 text-sm font-medium text-foreground">
                  Condição da peça
                </h2>
                <ProductConditionScale condition={product.condition} />
              </div>
            )}

            {/* Measurements */}
            {product.measurements && product.measurements.length > 0 && (
              <div
                className="motion-safe:animate-[blockRise_300ms_ease-out_both]"
                style={{ animationDelay: "250ms" }}
              >
                <h2 className="mb-2 text-sm font-medium text-foreground">
                  Medidas
                </h2>
                <ProductMeasurements
                  measurements={product.measurements}
                  size={product.size}
                />
              </div>
            )}

            {/* Positive impact */}
            <div
              className="motion-safe:animate-[blockRise_300ms_ease-out_both]"
              style={{ animationDelay: "300ms" }}
            >
              <h2 className="mb-2 text-sm font-medium text-foreground">
                Impacto positivo
              </h2>
              <div className="flex items-start gap-3 rounded-md border border-line bg-action-soft p-4">
                <div className="rounded-full bg-surface p-2">
                  <Leaf className="h-5 w-5 text-action" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Sustentável
                  </h3>
                  <p className="text-[0.8125rem] text-muted-foreground">
                    Reduz impacto ambiental
                  </p>
                </div>
              </div>
            </div>

            {/* Buy action */}
            <div
              ref={ctaRef}
              className="rounded-md border border-line p-4 motion-safe:animate-[blockRise_300ms_ease-out_both]"
              style={{ animationDelay: "350ms" }}
            >
              {product.available && whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={WHATSAPP_BUTTON}
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                  Tenho interesse nesta peça
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-line bg-transparent px-4 text-sm font-medium text-muted-foreground"
                >
                  Peça indisponível
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky action bar */}
      {product.available && whatsappLink && (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-line bg-surface px-4 py-2 md:hidden motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
            showMobileBar ? "translate-y-0" : "translate-y-full",
          )}
        >
          <span className="text-base font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-action px-4 text-sm font-medium text-action-foreground transition-colors duration-150 ease-out hover:bg-action/90 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            Tenho interesse nesta peça
          </a>
        </div>
      )}
    </div>
  );
}
