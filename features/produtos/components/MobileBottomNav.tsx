'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, SlidersHorizontal, MessageCircle, X } from 'lucide-react';
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

interface MobileBottomNavProps {
  categories: { category: string; count: number }[];
  selectedCategory?: string;
  selectedSize?: string;
  whatsappNumber: string;
}

export function MobileBottomNav({
  categories,
  selectedCategory,
  selectedSize,
  whatsappNumber,
}: MobileBottomNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const hasFilters = !!(selectedCategory || selectedSize);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.set('page', '1');
    startTransition(() => {
      router.push(`/?${params.toString()}`);
      setDrawerOpen(false);
    });
  };

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
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Filter Drawer */}
      <div
        className={cn(
          'lg:hidden fixed bottom-16 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out',
          drawerOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E8E0D5]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E0D5]">
          <span className="font-semibold text-foreground">Filtros</span>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  startTransition(() => router.push('/'));
                  setDrawerOpen(false);
                }}
                className="text-xs text-[#A0522D] underline underline-offset-2"
              >
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Categorias */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Categorias
            </h4>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(({ category, label }) => {
                const isSelected = category === '' ? !selectedCategory : selectedCategory === category;
                return (
                  <button
                    key={category || 'all'}
                    type="button"
                    onClick={() =>
                      updateParam('categoria', category === '' ? null : isSelected ? null : category)
                    }
                    className={cn(
                      'text-sm px-4 py-1.5 rounded-full border transition-all',
                      isSelected
                        ? 'border-[#A0522D] bg-[#A0522D] text-white font-medium'
                        : 'border-[#E8E0D5] text-muted-foreground hover:border-[#A0522D] hover:text-[#A0522D]',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tamanhos */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Tamanho
            </h4>
            <div className="flex flex-wrap gap-2">
              {[...SIZES, ...NUMERIC_SIZES].map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateParam('tamanho', isSelected ? null : size)}
                    className={cn(
                      'text-sm px-3 py-1.5 border rounded transition-all',
                      isSelected
                        ? 'border-[#A0522D] bg-[#A0522D] text-white font-medium'
                        : 'border-[#E8E0D5] text-muted-foreground hover:border-[#A0522D] hover:text-[#A0522D]',
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Padding inferior para safe area */}
        <div className="h-4" />
      </div>

      {/* Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E0D5]">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-6 text-[#A0522D]"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Início</span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(prev => !prev)}
            className={cn(
              'flex flex-col items-center gap-1 px-6 transition-colors',
              hasFilters || drawerOpen ? 'text-[#A0522D]' : 'text-muted-foreground',
            )}
          >
            <div className="relative">
              <SlidersHorizontal className="w-5 h-5" />
              {hasFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#A0522D]" />
              )}
            </div>
            <span className="text-[10px] font-medium">Filtros</span>
          </button>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 px-6 text-[#25D366]"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">WhatsApp</span>
          </a>
        </div>
      </nav>
    </>
  );
}
