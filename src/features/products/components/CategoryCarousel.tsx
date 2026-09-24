"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductImage } from "@/shared/components/ProductImage";
import { cn } from "@/shared/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  calca: "Calças",
  blusa: "Blusas",
  camiseta: "Camisetas",
  short: "Shorts",
  vestido: "Vestidos",
};

interface CategoryCarouselProps {
  categories: { category: string; count: number; image: string }[];
  selectedCategory?: string;
}

export function CategoryCarousel({
  categories,
  selectedCategory,
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const navigate = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory === cat) params.delete("categoria");
    else params.set("categoria", cat);
    params.set("page", "1");
    startTransition(() => router.push(`/?${params.toString()}`));
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (categories.length === 0) return null;

  const isPlaceholder = (src: string) =>
    src === "/placeholder-product.svg" || src === "/placeholder-product.png";

  return (
    <div className="space-y-3">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {categories.map((cat) => (
          <button
            key={cat.category}
            type="button"
            onClick={() => navigate(cat.category)}
            className={cn(
              "relative flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden group snap-start",
              "transition-all duration-300 hover:scale-105",
              selectedCategory === cat.category && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
            )}
          >
            <div className="absolute inset-0">
              {isPlaceholder(cat.image) ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <img
                    src="/logo-segunda-aura.png"
                    alt="Segunda Aura"
                    className="w-3/5 h-auto opacity-40"
                  />
                </div>
              ) : (
                <ProductImage
                  src={cat.image}
                  alt={CATEGORY_LABELS[cat.category] || cat.category}
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
            <span className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-medium tracking-wider drop-shadow-lg text-center">
              {CATEGORY_LABELS[cat.category] || cat.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
