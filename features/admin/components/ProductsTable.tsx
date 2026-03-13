import Image from 'next/image';
import { formatPrice } from '@/shared/utils/format';
import { Badge } from '@/shared/components/ui/badge';
import { ProductActions } from './ProductActions';
import type { Product } from '@/shared/types';

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 flex-shrink-0">
                    <Image
                      src={product.images[0] || '/placeholder-product.svg'}
                      alt={product.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-400">{product.color}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600 capitalize">{product.category || '—'}</span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{product.size || '—'}</span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="text-sm font-semibold text-[#A0522D]">{formatPrice(product.price)}</span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                {product.available ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-transparent">Disponível</Badge>
                ) : (
                  <Badge variant="secondary">Vendido</Badge>
                )}
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <ProductActions
                  numericId={product.numericId}
                  name={product.name}
                  available={product.available}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
