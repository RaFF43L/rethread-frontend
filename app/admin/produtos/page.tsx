import Link from 'next/link';
import { produtosService } from '@/features/produtos/services/produtos.service';
import { formatPrice } from '@/shared/utils/format';
import { Pagination } from '@/shared/components/Pagination';
import { ProdutoActions } from '@/features/admin/components/ProdutoActions';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import Image from 'next/image';
import { Plus } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProdutosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 15;

  const { data: produtos, pagination } = await produtosService.getProdutos({ page, limit });

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

      {produtos.length === 0 ? (
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
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Categoria
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Tamanho
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {produtos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 flex-shrink-0">
                          <Image
                            src={produto.imagens[0] || '/placeholder-product.svg'}
                            alt={produto.nome}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                            {produto.nome}
                          </div>
                          <div className="text-xs text-gray-400">{produto.cor}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-gray-600 capitalize">{produto.categoria || '—'}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{produto.tamanho || '—'}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-[#A0522D]">{formatPrice(produto.preco)}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {produto.disponivel ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-transparent">Disponível</Badge>
                      ) : (
                        <Badge variant="secondary">Vendido</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <ProdutoActions
                        numericId={produto.numericId}
                        nome={produto.nome}
                        disponivel={produto.disponivel}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

