'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductImage } from '@/shared/components/ProductImage';

const CATEGORY_LABELS: Record<string, string> = {
  calca: 'Calças',
  blusa: 'Blusas',
  camiseta: 'Camisetas',
  short: 'Shorts',
  vestido: 'Vestidos',
};

interface CategoryCarouselProps {
  categories: { category: string; count: number; image: string }[];
  selectedCategory?: string;
}

export function CategoryCarousel({ categories, selectedCategory }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const navigate = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory === cat) params.delete('categoria');
    else params.set('categoria', cat);
    params.set('page', '1');
    startTransition(() => router.push(`/?${params.toString()}`));
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (categories.length === 0) return null;

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {categories.map(cat => (
          <button
            key={cat.category}
            type="button"
            onClick={() => navigate(cat.category)}
            className="relative flex-shrink-0 w-[calc(50%-6px)] md:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] aspect-[3/4] rounded-lg overflow-hidden group snap-start"
          >
            <div className="absolute inset-0">
              <ProductImage
                src={cat.image}
                alt={CATEGORY_LABELS[cat.category] || cat.category}
              />
            </div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <span className="absolute bottom-4 left-4 text-white text-sm font-medium tracking-wide">
              {CATEGORY_LABELS[cat.category] || cat.category}
            </span>
          </button>
        ))}
      </div>

      {categories.length > 2 && (
        <div className="flex justify-center gap-8 mt-6">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="text-foreground/40 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Próximo"
            className="text-foreground/40 hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}