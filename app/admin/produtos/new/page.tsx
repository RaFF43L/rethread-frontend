'use client';

import { createProduct } from '@/app/admin/actions';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/produtos">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Produto</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Preencha os dados do produto</p>
        </div>
      </div>

      <ProductForm
        onSubmitAction={createProduct}
        submitLabel="Cadastrar Produto"
        submittingLabel="Cadastrando..."
      />
    </div>
  );
}