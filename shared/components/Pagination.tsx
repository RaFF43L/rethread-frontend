'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Quantas páginas mostrar

    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-8">
      <Button
        variant="outline"
        size="default"
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
        className={cn(
          "gap-1",
          currentPage === 1 && "cursor-not-allowed opacity-50"
        )}
      >
        {currentPage === 1 ? (
          <div>
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </div>
        ) : (
          <Link href={createPageUrl(currentPage - 1)}>
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Link>
        )}
      </Button>

      <div className="flex gap-2">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-4 py-2 text-muted-foreground">
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="default"
              asChild
              className={cn(
                "min-w-[40px]",
                currentPage === page && "shadow-md"
              )}
            >
              <Link href={createPageUrl(page as number)}>
                {page}
              </Link>
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="default"
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
        className={cn(
          "gap-1",
          currentPage === totalPages && "cursor-not-allowed opacity-50"
        )}
      >
        {currentPage === totalPages ? (
          <div>
            Próxima
            <ChevronRight className="w-4 h-4" />
          </div>
        ) : (
          <Link href={createPageUrl(currentPage + 1)}>
            Próxima
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </Button>
    </div>
  );
}
