"use client";

import { useRecentlyViewed } from "@/shared/hooks/useRecentlyViewed";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/shared/utils/format";
import { ProductImage } from "@/shared/components/ProductImage";
import { cn } from "@/shared/lib/utils";
import { Clock } from "lucide-react";

export function RecentlyViewedSection() {
  const { recentlyViewed, isLoaded } = useRecentlyViewed();
  const router = useRouter();

  if (!isLoaded || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 md:py-10 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base md:text-lg font-bold text-foreground">
            Visto Recentemente
          </h2>
        </div>

        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {recentlyViewed.map((item, index) => (
              <button
                key={item.id}
                onClick={() => router.push(`/product/${item.id}`)}
                className={cn(
                  "group flex-shrink-0 w-32 md:w-36 snap-start",
                  "transition-all duration-200",
                  "hover:scale-105 focus:scale-105 focus:outline-none",
                  "animate-in fade-in slide-in-from-right-4",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-2">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    objectFit="cover"
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/40 to-transparent",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  )} />
                </div>
                <h3 className="text-xs font-medium text-foreground line-clamp-1 text-left mb-1">
                  {item.name}
                </h3>
                <p className="text-sm font-semibold text-foreground text-left">
                  {formatPrice(item.price)}
                </p>
              </button>
            ))}
          </div>
          
          {/* Fade effect at edges */}
          <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-secondary/30 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
