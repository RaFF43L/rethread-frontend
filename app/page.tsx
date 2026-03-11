import { Suspense } from 'react';
import { produtosService } from '@/features/produtos/services/produtos.service';
import { ProdutosList } from '@/features/produtos/components/ProdutosList';
import { Pagination } from '@/shared/components/Pagination';
import { ProductsHeader } from '@/features/produtos/components/ProductsHeader';
import { Button } from '@/shared/components/ui/button';
import { Shield } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string; q?: string }>;
}

async function ProdutosPageContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 12;
  const query = params.q;

  const { data: produtos, pagination } = await produtosService.getProdutos({
    page,
    limit,
    q: query,
  });

  let filteredProdutos = produtos;
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredProdutos = produtos.filter(p => 
      p.nome.toLowerCase().includes(searchTerm) ||
      p.descricao?.toLowerCase().includes(searchTerm) ||
      p.cor.toLowerCase().includes(searchTerm)
    );
  }

  return (
    <>
      <ProductsHeader 
        totalProducts={pagination.total} 
        currentCount={filteredProdutos.length}
      />
      <ProdutosList produtos={filteredProdutos} />
      {filteredProdutos.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          basePath="/"
        />
      )}
    </>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen">
      <header className="bg-white/95 border-b border-border sticky top-0 z-50 shadow-md backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <img 
                src="/logo-segunda-aura.svg" 
                alt="Segunda Aura Brechó" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 drop-shadow-md"
              />
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-coral leading-tight tracking-tight drop-shadow-sm">
                  Segunda Aura
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-olive font-semibold tracking-wide">
                  BRECHÓ
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-coral text-coral hover:bg-coral hover:text-white transition-all shadow-sm"
            >
              <a href="/login">
                <Shield className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Admin</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Inspirado na etiqueta */}
      <section className="relative bg-white/80 backdrop-blur-sm py-10 sm:py-14 md:py-20 overflow-hidden">
        {/* Gradiente de fundo inspirado na borda da etiqueta */}
        <div className="absolute inset-0 bg-gradient-to-r from-coral/10 via-cream to-olive/10 opacity-60"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-coral drop-shadow-sm leading-tight">
              Cada peça já teve uma história.
            </h2>
            <p className="text-2xl sm:text-3xl md:text-5xl font-light text-olive drop-shadow-sm">
              Aqui começa outra.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto pt-4">
              Peças únicas de moda sustentável com a qualidade que você merece
            </p>
          </div>
        </div>
      </section>

      {/* Produtos */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-coral border-t-transparent"></div>
            </div>
          }
        >
          <ProdutosPageContent searchParams={searchParams} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-olive text-white py-10 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Segunda Aura Brechó</h3>
            <p className="text-cream-light mb-4">Sustentabilidade e estilo em cada peça</p>
            <p className="text-sm text-cream-dark">
              &copy; {new Date().getFullYear()} Segunda Aura Brechó. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const revalidate = 60; // Revalidar a cada 60 segundos
