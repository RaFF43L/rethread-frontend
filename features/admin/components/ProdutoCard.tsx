import Image from 'next/image';
import { formatPrice } from '@/shared/utils/format';
import { Badge } from '@/shared/components/ui/badge';
import { ProdutoActions } from './ProdutoActions';
import type { Produto } from '@/shared/types';

interface ProdutoCardProps {
  produto: Produto;
}

export function ProdutoCard({ produto }: ProdutoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0">
          <Image
            src={produto.imagens[0] || '/placeholder-product.svg'}
            alt={produto.nome}
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{produto.nome}</p>
              <p className="text-xs text-gray-400">{produto.cor}</p>
            </div>
            {produto.disponivel ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-transparent flex-shrink-0">Disponível</Badge>
            ) : (
              <Badge variant="secondary" className="flex-shrink-0">Vendido</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {produto.categoria && <span className="capitalize">{produto.categoria}</span>}
            {produto.tamanho && <span>Tam: {produto.tamanho}</span>}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-semibold text-[#A0522D]">{formatPrice(produto.preco)}</span>
            <ProdutoActions
              numericId={produto.numericId}
              nome={produto.nome}
              disponivel={produto.disponivel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
