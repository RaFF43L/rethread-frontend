import Image from 'next/image';
import { formatPrice } from '@/shared/utils/format';
import { Badge } from '@/shared/components/ui/badge';
import { ProductActions } from './ProductActions';
import type { Product } from '@/shared/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0">
          <Image
            src={product.images[0] || '/placeholder-product.svg'}
            alt={product.name}
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-xs text-gray-400">{product.color}</p>
            </div>
            {product.available ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-transparent flex-shrink-0">Disponível</Badge>
            ) : (
              <Badge variant="secondary" className="flex-shrink-0">Vendido</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {product.category && <span className="capitalize">{product.category}</span>}
            {product.size && <span>Tam: {product.size}</span>}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-semibold text-[#A0522D]">{formatPrice(product.price)}</span>
            <ProductActions
              numericId={product.numericId}
              name={product.name}
              available={product.available}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
