"use client";

import { useState } from "react";
import { Product } from "@/shared/types";
import { ProductCard } from "./ProductCard";
import { env } from "@/shared/lib/env";
import { QuickViewModal } from "@/shared/components/QuickViewModal";

interface ProductsListProps {
  products: Product[];
  whatsappNumber?: string;
}

export function ProductsList({ products, whatsappNumber }: ProductsListProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            whatsappNumber={whatsappNumber || env.whatsappNumber}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
