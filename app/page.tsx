import { Suspense } from 'react';
import { productsService } from '@/features/products/services/products.service';
import { ProductsList } from '@/features/products/components/ProductsList';
import { Pagination } from '@/shared/components/Pagination';
import { CategoryCarousel } from '@/features/products/components/CategoryCarousel';
import { SiteHeader } from '@/features/products/components/SiteHeader';
import { WhatsAppFloat } from '@/features/products/components/WhatsAppFloat';
import Link from 'next/link';
import { env } from '@/shared/lib/env';
import { getImageUrl } from '@/shared/lib/env';
import { ProductBackend } from '@/shared/types';

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

function extractImage(product: ProductBackend): string {
  if (product.imageUrls && product.imageUrls.length > 0) return product.imageUrls[0];
  if (product.images && product.images.length > 0) return getImageUrl(product.images[0].urlS3);
  if (product.imageUrl) return product.imageUrl;
  if (product.urlS3) return getImageUrl(product.urlS3);
  return '/placeholder-product.svg';
}

async function ProductsSection({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 12;
  const query = params.q;
  const categoria = params.categoria;
  const tamanho = params.tamanho;

  let products;
  let pagination;

  if (tamanho) {
    ({ data: products, pagination } = await productsService.getProductsFiltered({ size: tamanho, page, limit }));
  } else if (categoria) {
    ({ data: products, pagination } = await productsService.getProductsByCategory(categoria, { page, limit }));
  } else {
    ({ data: products, pagination } = await productsService.getProducts({ page, limit }));
  }

  let filteredProducts = products;
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description?.toLowerCase().includes(searchTerm) ||
      p.color.toLowerCase().includes(searchTerm)
    );
  }

  const title = tamanho
    ? `Tamanho ${tamanho}`
    : categoria
    ? (CATEGORY_LABELS[categoria] || categoria)
    : query
    ? `"${query}"`
    : 'Destaques';

  return (
    <>
      <h2
        className="text-2xl md:text-3xl font-bold text-center mb-8"
        style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}
      >
        {title}
      </h2>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nenhuma peça encontrada</p>
        </div>
      ) : (
        <>
          <ProductsList products={filteredProducts} />
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

  let categoryItems: { category: string; count: number; image: string }[] = [];
  try {
    const categories = await productsService.getCategories();
    categoryItems = categories.map(c => ({
      category: c.category,
      count: c.products.length,
      image: c.products.length > 0 ? extractImage(c.products[0]) : '/placeholder-product.svg',
    }));
  } catch {
    // silent failure if categories endpoint is unavailable
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader
        categories={categoryItems}
        selectedCategory={params.categoria}
        selectedSize={params.tamanho}
      />

      {/* Hero — Logo como protagonista */}
      <section className="py-12 md:py-20 text-center">
        <Link href="/" className="inline-block">
          <h1 className="sr-only">Segunda Aura</h1>
          <img
            src="/logo-segunda-aura.png"
            alt="Segunda Aura"
            className="w-64 md:w-80 h-auto mx-auto"
          />
        </Link>
      </section>

      {/* Categorias — cards com imagem */}
      {categoryItems.length > 0 && (
        <section className="px-5 pb-16">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-8"
            style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}
          >
            Categorias
          </h2>
          <CategoryCarousel categories={categoryItems} selectedCategory={params.categoria} />
        </section>
      )}

      {/* Produtos */}
      <section className="px-5 pb-16 flex-1">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-foreground border-t-transparent" />
            </div>
          }
        >
          <ProductsSection searchParams={searchParams} />
        </Suspense>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-10">
        <div className="text-center px-5">
          <p
            className="text-lg font-semibold text-foreground mb-1"
            style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontStyle: 'italic' }}
          >
            Segunda Aura
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sustentabilidade e estilo em cada peça
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-4">
            &copy; {new Date().getFullYear()} Segunda Aura Brechó
          </p>
        </div>
      </footer>

      {/* WhatsApp flutuante */}
      <WhatsAppFloat number={env.whatsappNumber} />
    </div>
  );
}

export const revalidate = 60;