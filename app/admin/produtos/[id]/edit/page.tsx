import { notFound } from 'next/navigation';
import { produtosService } from '@/features/produtos/services/produtos.service';
import { atualizarProduto } from '@/app/admin/actions';
import { EditProdutoClient } from './client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProdutoPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (isNaN(numericId)) notFound();

  let produto;
  try {
    produto = await produtosService.getProdutoByNumericId(numericId);
  } catch {
    notFound();
  }

  return <EditProdutoClient produto={produto} />;
}
