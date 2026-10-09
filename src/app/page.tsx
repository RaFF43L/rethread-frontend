import { Suspense } from "react";
import { productsService } from "@/features/products/services/products.service";
import { Product } from "@/shared/types";
import { ProductsList } from "@/features/products/components/ProductsList";
import { Pagination } from "@/shared/components/Pagination";
import { SiteHeader } from "@/features/products/components/SiteHeader";
import { CategoryFilters } from "@/features/products/components/CategoryFilters";
import { FavoritesShortcut } from "@/features/products/components/FavoritesShortcut";
import { EmptyState } from "@/shared/components/EmptyState";

const ITEMS_PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{
    category?: string;
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

  let filteredProducts = products;

  if (params.category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === params.category
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

  try {
    const categories = await productsService.getCategories();
    categoryItems = categories.map((c) => ({
      category: c.category,
      count: c.products.length,
      image:
        c.products.length > 0 && c.products[0].images && c.products[0].images[0]
          ? typeof c.products[0].images[0] === "string"
            ? c.products[0].images[0]
            : c.products[0].images[0].urlS3
          : "/placeholder-product.svg",
    }));
  } catch {
    // silent failure
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section id="produtos" className="w-full py-10 md:py-14 px-4 md:px-14">
          <div className="max-w-[1360px] mx-auto">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[1.5rem] md:text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground">
                  Explore o catálogo
                </h1>
                <p className="mt-1 text-[0.9375rem] font-normal leading-[1.5] text-muted-foreground">
                  Peças únicas e autênticas.
                </p>
              </div>
              <FavoritesShortcut />
            </div>

            <div className="mb-8 md:mb-10">
              <CategoryFilters
                categories={categoryItems}
                selectedCategory={params.category}
              />
            </div>

            <Suspense
              fallback={
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-action border-t-transparent" />
                </div>
              }
            >
              <ProductsSection searchParams={searchParams} />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}

export const revalidate = 60;
