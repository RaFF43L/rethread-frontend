import Link from 'next/link';
import { productsService } from '@/features/products/services/products.service';
import { Pagination } from '@/shared/components/Pagination';
import { ProductCard } from '@/features/admin/components/ProductCard';
import { ProductsTable } from '@/features/admin/components/ProductsTable';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 15;

  const { data: products, pagination } = await productsService.getProducts({ page, limit });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pagination.total} produto{pagination.total !== 1 ? 's' : ''} no total
          </p>
        </div>

        <Button asChild className="bg-[#A0522D] hover:bg-[#8B4513]">
          <Link href="/admin/produtos/new">
            <Plus className="w-4 h-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">Nenhum produto cadastrado</p>
          <Button asChild className="bg-[#A0522D] hover:bg-[#8B4513]">
            <Link href="/admin/produtos/new">
              <Plus className="w-4 h-4" />
              Cadastrar primeiro produto
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Desktop: Tabela */}
          <div className="hidden md:block">
            <ProductsTable products={products} />
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              basePath="/admin/produtos"
            />
          </div>
        </>
      )}
    </div>
  );
}

export const revalidate = 0;

