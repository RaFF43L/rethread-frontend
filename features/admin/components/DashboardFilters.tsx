'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'calca', label: 'Calças' },
  { value: 'blusa', label: 'Blusas' },
  { value: 'camiseta', label: 'Camisetas' },
  { value: 'short', label: 'Shorts' },
  { value: 'vestido', label: 'Vestidos' },
];

const STATUSES = [
  { value: 'available', label: 'Disponíveis' },
  { value: 'sold', label: 'Vendidos' },
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-sm px-3 py-1.5 border rounded-full transition-all whitespace-nowrap',
        active
          ? 'border-[#A0522D] bg-[#A0522D] text-white font-medium'
          : 'border-[#E8E0D5] text-muted-foreground hover:border-[#A0522D] hover:text-[#A0522D]',
      )}
    >
      {label}
    </button>
  );
}

function FilterContent({ isPending }: { isPending: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    startTransition(() => router.push(`/admin/dashboard?${params.toString()}`));
  };

  return (
    <div className={cn('space-y-5', isPending && 'opacity-60')}>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2.5">
          Categoria
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              label={cat.label}
              active={category === cat.value}
              onClick={() => updateParam('category', category === cat.value ? null : cat.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2.5">
          Status
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <Chip
              key={s.value}
              label={s.label}
              active={status === s.value}
              onClick={() => updateParam('status', status === s.value ? null : s.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2.5">
          Período
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => updateParam('startDate', e.target.value || null)}
            className="text-sm border border-[#E8E0D5] rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:border-[#A0522D]"
          />
          <span className="text-xs text-muted-foreground">até</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => updateParam('endDate', e.target.value || null)}
            className="text-sm border border-[#E8E0D5] rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:border-[#A0522D]"
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardFilters() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const hasFilters = !!(category || status || startDate || endDate);

  const clearFilters = () => {
    startTransition(() => {
      router.push('/admin/dashboard');
      setDrawerOpen(false);
    });
  };

  return (
    <>
      {/* Desktop: inline */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#A0522D] transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>
        <FilterContent isPending={isPending} />
      </div>

      {/* Mobile: botão + drawer */}
      <div className="md:hidden mb-4">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={cn(
            'flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border transition-colors w-full justify-center',
            hasFilters
              ? 'border-[#A0522D] bg-[#A0522D]/5 text-[#A0522D] font-medium'
              : 'border-gray-200 bg-white text-gray-600',
          )}
        >
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4" />
            {hasFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#A0522D]" />
            )}
          </div>
          Filtros
        </button>
      </div>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out',
          drawerOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E8E0D5]" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E0D5]">
          <span className="font-semibold text-foreground">Filtros</span>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-xs text-[#A0522D] underline underline-offset-2">
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

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          <FilterContent isPending={isPending} />
        </div>

        <div className="h-4" />
      </div>
    </>
  );
}
