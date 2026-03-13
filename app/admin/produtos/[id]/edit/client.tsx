'use client';

import { atualizarProduto } from '@/app/admin/actions';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Produto } from '@/shared/types';

interface EditProdutoClientProps {
  produto: Produto;
}

export function EditProdutoClient({ produto }: EditProdutoClientProps) {
  const handleSubmit = async (formData: FormData) => {
    await atualizarProduto(produto.numericId, formData);
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
          <p className="text-muted-foreground text-sm mt-0.5">{produto.nome}</p>
        </div>
      </div>

      <ProductForm
        defaultValues={{
          marca: produto.nome,
          cor: produto.cor,
          descricao: produto.descricao,
          preco: produto.preco,
          category: produto.categoria as any,
          size: produto.tamanho as any,
        }}
        existingImages={produto.imagens}
        onSubmitAction={handleSubmit}
        submitLabel="Salvar Alterações"
        submittingLabel="Salvando..."
      />
    </div>
  );
}
