'use client';

// Barra de pesquisa e filtros para produtos

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
      params.set('page', '1'); // Reset to page 1 on search
    } else {
      params.delete('q');
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        
        <Input
          type="text"
          placeholder="Buscar por nome, marca ou cor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-24 h-12 text-base shadow-sm border-2 focus-visible:ring-coral"
          disabled={isPending}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {searchTerm && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClear}
              disabled={isPending}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="bg-coral hover:bg-coral-dark text-white shadow-sm"
          >
            {isPending ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </div>
    </form>
  );
}
