'use client';

import { SearchBar } from './SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface ProductsHeaderProps {
  totalProducts: number;
  currentCount: number;
}

export function ProductsHeader({ totalProducts, currentCount }: ProductsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleLimitChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', value);
    params.set('page', '1'); // Reset to page 1

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const currentLimit = searchParams.get('limit') || '12';
  const searchQuery = searchParams.get('q');

  return (
    <div className="space-y-6 mb-8">
      {/* Título e contador */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Nossa Coleção
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {searchQuery ? (
            <>
              <span className="font-medium">{currentCount}</span> {currentCount === 1 ? 'resultado' : 'resultados'} para "{searchQuery}"
            </>
          ) : (
            <>
              Navegue por nossas <span className="font-medium text-coral">{totalProducts}</span> peças exclusivas
            </>
          )}
        </p>
      </div>

      {/* Barra de pesquisa */}
      <SearchBar />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Mostrar por página:</span>
          <Select value={currentLimit} onValueChange={handleLimitChange} disabled={isPending}>
            <SelectTrigger className="w-20 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {searchQuery && (
          <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            Mostrando {currentCount} de {totalProducts} produtos
          </p>
        )}
      </div>
    </div>
  );
}
