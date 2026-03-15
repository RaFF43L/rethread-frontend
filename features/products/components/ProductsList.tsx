import { Product } from '@/shared/types';
import { ProductCard } from './ProductCard';
import { env } from '@/shared/lib/env';

interface ProductsListProps {
  products: Product[];
  whatsappNumber?: string;
}

export function ProductsList({ 
  products, 
  whatsappNumber = env.whatsappNumber 
}: ProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground text-base sm:text-lg">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />
      ))}
    </div>
  );
}
