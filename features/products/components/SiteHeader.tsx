'use client';

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Menu, Search, X, Shield } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  calca: 'Calças',
  blusa: 'Blusas',
  camiseta: 'Camisetas',
  short: 'Shorts',
  vestido: 'Vestidos',
};

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

interface SiteHeaderProps {
  categories: { category: string; count: number }[];
  selectedCategory?: string;
  selectedSize?: string;
}

export function SiteHeader({ categories, selectedCategory, selectedSize }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      params.set('q', term.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    startTransition(() => router.push(`/?${params.toString()}`));
  }, [searchParams, startTransition, router]);

  useEffect(() => {
    if (!searchOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushSearch(searchTerm), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm, searchOpen, pushSearch]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    if (searchTerm) {
      setSearchTerm('');
      pushSearch('');
    }
  };

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.set('page', '1');
    startTransition(() => {
      router.push(`/?${params.toString()}`);
      setMenuOpen(false);
    });
  };

  const hasFilters = !!(selectedCategory || selectedSize);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white">
        <div className="flex items-center justify-between px-5 h-14">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)} aria-label="Buscar">
              {searchOpen ? (
                <X className="w-[22px] h-[22px] text-foreground" />
              ) : (
                <Search className="w-[22px] h-[22px] text-foreground" />
              )}
            </button>
            <Link href="/login" aria-label="Admin">
              <Shield className="w-[22px] h-[22px] text-foreground" />
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="px-5 pb-4">
            <div className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por marca, cor..."
                autoFocus
                className="w-full pl-6 border-b border-foreground/20 bg-transparent py-2 text-sm outline-none focus:border-foreground placeholder:text-muted-foreground"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Side drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-out overflow-y-auto',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Menu</span>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-8">
          {/* Categories */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Categorias
            </h4>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => updateParam('categoria', null)}
                className={cn(
                  'block w-full text-left py-2 text-sm transition-colors',
                  !selectedCategory
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Todas as peças
              </button>
              {categories.map(cat => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() =>
                    updateParam('categoria', selectedCategory === cat.category ? null : cat.category)
                  }
                  className={cn(
                    'block w-full text-left py-2 text-sm transition-colors',
                    selectedCategory === cat.category
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {CATEGORY_LABELS[cat.category] || cat.category}
                </button>
              ))}
            </nav>
          </div>

          {/* Sizes */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Tamanhos
            </h4>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateParam('tamanho', selectedSize === size ? null : size)}
                  className={cn(
                    'text-xs px-3 py-1.5 border transition-all',
                    selectedSize === size
                      ? 'border-foreground bg-foreground text-white'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                startTransition(() => router.push('/'));
                setMenuOpen(false);
              }}
              className="text-xs text-muted-foreground underline underline-offset-2"
            >
              Limpar filtros
            </button>
          )}

          {/* Admin */}
          <div className="pt-4 border-t border-border">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <Shield className="w-4 h-4" />
              Área Admin
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
