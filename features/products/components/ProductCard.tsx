'use client';

import { Product } from '@/shared/types';
import { formatPrice } from '@/shared/utils/format';
import { ImageCarousel } from '@/shared/components/ImageCarousel';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  whatsappNumber?: string;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  return (
    <div
      className="cursor-pointer group"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        router.push(`/product/${product.id}`);
      }}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-stone-50 mb-3">
        <ImageCarousel images={product.images} alt={product.name} />

        {!product.available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <span className="bg-black/70 text-white text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
              Indisponível
            </span>
          </div>
        )}
      </div>

      <h3 className="text-xs font-medium uppercase tracking-wider text-foreground line-clamp-1">
        {product.name}
      </h3>
      <span className="text-sm font-semibold text-foreground mt-0.5 block">
        {formatPrice(product.price)}
      </span>
    </div>
  );
}