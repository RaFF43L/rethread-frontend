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

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
const NUMERIC_SIZES = ['34', '36', '38', '40', '42', '44', '46'];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">
      {children}
    </h4>
  );
}

function CategoryItem({ label, count, active, onClick }: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left py-2 px-2.5 rounded-lg text-sm flex items-center justify-between transition-colors',
        active
          ? 'text-[#A0522D] font-semibold bg-[#A0522D]/[0.08]'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
      )}
    >
      <span>{label}</span>
      <span className="text-xs opacity-40">{count}</span>
    </button>
  );
}

function SizeChip({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-xs px-2.5 py-1.5 border rounded transition-all',
        active
          ? 'border-[#A0522D] bg-[#A0522D] text-white font-medium'
          : 'border-[#E8E0D5] text-muted-foreground hover:border-[#A0522D] hover:text-[#A0522D]',
      )}
    >
      {label}
    </button>
  );
}

interface FilterSidebarProps {
  categories: { category: string; count: number }[];
  selectedCategory?: string;
  selectedSize?: string;
}

export function FilterSidebar({ categories, selectedCategory, selectedSize }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.set('page', '1');
    startTransition(() => router.push(`/?${params.toString()}`));
  };

  const hasFilters = !!(selectedCategory || selectedSize);
  const totalCount = categories.reduce((a, c) => a + c.count, 0);

  const allCategories = [
    { category: '', label: 'Tudo', count: totalCount },
    ...categories.map(c => ({
      category: c.category,
      label: CATEGORY_LABELS[c.category] || c.category,
      count: c.count,
    })),
  ];

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Categorias</SectionTitle>
        <div className="space-y-0.5">
          {allCategories.map(({ category, label, count }) => {
            const isSelected = category === '' ? !selectedCategory : selectedCategory === category;
            return (
              <CategoryItem
                key={category || 'all'}
                label={label}
                count={count}
                active={isSelected}
                onClick={() => updateParam('categoria', category === '' ? null : (isSelected ? null : category))}
              />
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle>Tamanho</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {[...SIZES, ...NUMERIC_SIZES].map((size) => {
            const isSelected = selectedSize === size;
            return (
              <SizeChip
                key={size}
                label={size}
                active={isSelected}
                onClick={() => updateParam('tamanho', isSelected ? null : size)}
              />
            );
          })}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push('/'))}
          className="text-xs text-muted-foreground hover:text-[#A0522D] underline underline-offset-2 w-full text-left transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
