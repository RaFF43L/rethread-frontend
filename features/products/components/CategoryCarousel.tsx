'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/shared/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  calca: 'Calças',
  blusa: 'Blusas',
  camiseta: 'Camisetas',
  short: 'Shorts',
  vestido: 'Vestidos',
};

function Pill({ active, disabled, onClick, children }: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-all whitespace-nowrap',
        active
          ? 'border-[#A0522D] bg-[#A0522D] text-white font-medium'
          : 'border-[#E8E0D5] bg-white text-muted-foreground hover:border-[#A0522D] hover:text-[#A0522D]',
        disabled && 'opacity-60 pointer-events-none',
      )}
    >
      {children}
    </button>
  );
}

interface CategoryCarouselProps {
  categories: { category: string; count: number }[];
  selectedCategory?: string;
}

export function CategoryCarousel({ categories, selectedCategory }: CategoryCarouselProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigate = (categoria: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoria) params.set('categoria', categoria);
    else params.delete('categoria');
    params.set('page', '1');
    startTransition(() => router.push(`/?${params.toString()}`));
  };

  const totalCount = categories.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
      <Pill active={!selectedCategory} disabled={isPending} onClick={() => navigate(null)}>
        Tudo
        {totalCount > 0 && <span className="ml-1.5 opacity-60 text-xs">{totalCount}</span>}
      </Pill>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.category;
        const label = CATEGORY_LABELS[cat.category] || cat.category;
        return (
          <Pill
            key={cat.category}
            active={isSelected}
            disabled={isPending}
            onClick={() => navigate(isSelected ? null : cat.category)}
          >
            {label}
            {cat.count > 0 && <span className="ml-1.5 opacity-60 text-xs">{cat.count}</span>}
          </Pill>
        );
      })}
    </div>
  );
}