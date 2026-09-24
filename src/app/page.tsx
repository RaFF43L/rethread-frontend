import { Suspense } from "react";
import { productsService } from "@/features/products/services/products.service";
import { Product } from "@/shared/types";
import { ProductsList } from "@/features/products/components/ProductsList";
import { Pagination } from "@/shared/components/Pagination";
import { SiteHeader } from "@/features/products/components/SiteHeader";
import { WhatsAppFloat } from "@/features/products/components/WhatsAppFloat";
import { env } from "@/shared/lib/env";
import { EmptyState } from "@/shared/components/EmptyState";
import { RecentlyViewedSection } from "@/shared/components/RecentlyViewedSection";
import { AnnouncementBar } from "@/shared/components/AnnouncementBar";
import { HeroSection } from "@/features/products/components/HeroSection";
import { TrustBadges } from "@/shared/components/TrustBadges";
import { EditorialFooter } from "@/shared/components/EditorialFooter";

const ITEMS_PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{
    categoria?: string;
    tamanho?: string;
    q?: string;
    page?: string;
  }>;
}

async function ProductsSection({ searchParams }: PageProps) {
  const params = await searchParams;
  let products: Product[] = [];

  try {
    const response = await productsService.getProducts();
    products = response.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  // Client-side filtering
  let filteredProducts = products;

  if (params.q) {
    const q = params.q.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.style?.some((s) => s.toLowerCase().includes(q)) ||
        p.material?.toLowerCase().includes(q)
    );
  }

  if (params.categoria) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === params.categoria
    );
  }

  if (params.tamanho) {
    filteredProducts = filteredProducts.filter(
      (p) => p.size === params.tamanho
    );
  }

  const currentPage = Number(params.page || 1);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="Nenhuma peça encontrada"
          description="Tente ajustar seus filtros ou remova alguns para ver mais resultados."
        />
      ) : (
        <>
          <ProductsList products={paginatedProducts} />
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
          )}
        </>
      )}
    </>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  let categoryItems: { category: string; count: number; image: string }[] = [];
  let totalProducts = 0;
  
  try {
    const categories = await productsService.getCategories();
    categoryItems = categories.map((c) => ({
      category: c.category,
      count: c.products.length,
      image: c.products.length > 0 && c.products[0].images && c.products[0].images[0]
        ? (typeof c.products[0].images[0] === 'string' ? c.products[0].images[0] : c.products[0].images[0].urlS3)
        : "/placeholder-product.svg",
    }));
    totalProducts = categories.reduce((sum, c) => sum + c.products.length, 0);
  } catch {
    // silent failure
  }

  const hasFilters = !!(params.categoria || params.tamanho || params.q);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Header */}
      <SiteHeader
        categories={categoryItems}
        selectedCategory={params.categoria}
        selectedSize={params.tamanho}
      />

      {/* Hero Section - Apenas na home sem filtros */}
      {!hasFilters && <HeroSection totalProducts={totalProducts} />}

      {/* Produtos */}
      <section id="produtos" className="w-full py-12 md:py-20 px-4 md:px-14 bg-neutral-100">
        <div className="max-w-[1360px] mx-auto">
          {/* Section Header */}
          {!hasFilters && (
            <div className="flex items-end justify-between mb-10 md:mb-12">
              <div>
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.22em] uppercase text-neutral-600 mb-2 md:mb-3">
                  Explore o catálogo
                </p>
                <h2 className="font-serif text-[32px] md:text-[40px] font-bold italic text-neutral-950">
                  Peças em destaque
                </h2>
              </div>
            </div>
          )}

          <Suspense
            fallback={
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-coral border-t-transparent" />
              </div>
            }
          >
            <ProductsSection searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* Trust Badges - Apenas na home sem filtros */}
      {!hasFilters && <TrustBadges />}

      {/* Recently Viewed */}
      <RecentlyViewedSection />

      {/* Footer Editorial */}
      <EditorialFooter />

      {/* WhatsApp Float */}
      <WhatsAppFloat number={env.whatsappNumber} />
    </div>
  );
}

export const revalidate = 60;
