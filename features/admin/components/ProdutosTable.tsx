import Image from 'next/image';
import { formatPrice } from '@/shared/utils/format';
import { Badge } from '@/shared/components/ui/badge';
import { ProdutoActions } from './ProdutoActions';
import type { Produto } from '@/shared/types';

interface ProdutosTableProps {
  produtos: Produto[];
}

export function ProdutosTable({ produtos }: ProdutosTableProps) {
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
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600 capitalize">{produto.categoria || '—'}</span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
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
  );
}
