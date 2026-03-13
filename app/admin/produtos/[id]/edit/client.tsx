'use client';

import { updateProduct } from '@/app/admin/actions';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/shared/types';

interface EditProductClientProps {
  product: Product;
}

export function EditProductClient({ product }: EditProductClientProps) {
  const handleSubmit = async (formData: FormData) => {
    await updateProduct(product.numericId, formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/produtos">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Produto</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{product.name}</p>
        </div>
      </div>

      <ProductForm
        defaultValues={{
          marca: product.name,
          cor: product.color,
          descricao: product.description,
          preco: product.price,
          category: product.category as any,
          size: product.size as any,
        }}
        existingImages={product.images}
        onSubmitAction={handleSubmit}
        submitLabel="Salvar Alterações"
        submittingLabel="Salvando..."
      />
    </div>
  );
}
