import { Suspense } from 'react';
import { produtosService } from '@/features/produtos/services/produtos.service';
import { ProdutosList } from '@/features/produtos/components/ProdutosList';
import { Pagination } from '@/shared/components/Pagination';
import { CategoryCarousel } from '@/features/produtos/components/CategoryCarousel';
import { FilterSidebar } from '@/features/produtos/components/FilterSidebar';
import { MobileBottomNav } from '@/features/produtos/components/MobileBottomNav';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { env } from '@/shared/lib/env';

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string; q?: string; categoria?: string; tamanho?: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  calca: 'Calças',
  blusa: 'Blusas',
  camiseta: 'Camisetas',
  short: 'Shorts',
  vestido: 'Vestidos',
};

async function ProdutosPageContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 12;
  const query = params.q;
  const categoria = params.categoria;
  const tamanho = params.tamanho;

  let produtos;
  let pagination;

  if (tamanho) {
    // Usa /products/filter com o size correto (API não suporta category+size juntos)
    ({ data: produtos, pagination } = await produtosService.getProdutosFiltered({ size: tamanho, page, limit }));
  } else if (categoria) {
    ({ data: produtos, pagination } = await produtosService.getProdutosByCategoria(categoria, { page, limit }));
  } else {
    ({ data: produtos, pagination } = await produtosService.getProdutos({ page, limit }));
  }

  // Busca por texto é client-side (API não tem endpoint de busca full-text)
  let filteredProdutos = produtos;
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredProdutos = produtos.filter(p =>
      p.nome.toLowerCase().includes(searchTerm) ||
      p.descricao?.toLowerCase().includes(searchTerm) ||
      p.cor.toLowerCase().includes(searchTerm)
    );
  }

  const title = tamanho
    ? `Tamanho ${tamanho}`
    : categoria
    ? (CATEGORY_LABELS[categoria] || categoria)
    : query
    ? `"${query}"`
    : 'Todas as peças';

  return (
    <>
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredProdutos.length} {filteredProdutos.length === 1 ? 'peça' : 'peças'}
          </p>
        </div>
      </div>

      {filteredProdutos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nenhuma peça encontrada</p>
        </div>
      ) : (
        <>
          <ProdutosList produtos={filteredProdutos} />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            basePath="/"
          />
        </>
      )}
    </>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  let categoryItems: { category: string; count: number }[] = [];
  try {
    const categorias = await produtosService.getCategorias();
    categoryItems = categorias.map(c => ({ category: c.category, count: c.products.length }));
  } catch {
    // falha silenciosa se endpoint de categorias indisponÃ­vel
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E0D5] sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-segunda-aura.svg" alt="Segunda Aura" className="w-10 h-10" />
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontStyle: 'italic', color: '#A0522D' }}
            >
              Segunda Aura
            </span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-muted-foreground border border-[#E8E0D5] px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </header>

      {/* Layout principal */}
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="lg:flex lg:gap-10">

          {/* Sidebar - apenas desktop */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                categories={categoryItems}
                selectedCategory={params.categoria}
                selectedSize={params.tamanho}
              />
            </div>
          </aside>

          {/* ConteÃºdo principal */}
          <div className="flex-1 min-w-0">
            {/* Categorias (strip horizontal) */}
            <CategoryCarousel categories={categoryItems} selectedCategory={params.categoria} />

            {/* Produtos */}
            <Suspense
              fallback={
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#A0522D] border-t-transparent" />
                </div>
              }
            >
              <ProdutosPageContent searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Footer - apenas desktop */}
      <footer className="hidden lg:block border-t border-[#E8E0D5] bg-white py-10">
        <div className="container mx-auto px-4 text-center">
          <p
            className="text-lg font-semibold text-foreground mb-1"
            style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontStyle: 'italic' }}
          >
            Segunda Aura Brechó
          </p>
          <p className="text-sm text-muted-foreground">Sustentabilidade e estilo em cada peça</p>
          <p className="text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} Segunda Aura Brechó. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Bottom Nav - apenas mobile */}
      <MobileBottomNav
        categories={categoryItems}
        selectedCategory={params.categoria}
        selectedSize={params.tamanho}
        whatsappNumber={env.whatsappNumber}
      />

      {/* Espaço para o bottom nav no mobile */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}

export const revalidate = 60;