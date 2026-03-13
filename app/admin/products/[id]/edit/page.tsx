import { notFound } from 'next/navigation';
import { productsService } from '@/features/products/services/products.service';
import { updateProduct } from '@/app/admin/actions';
import { EditProductClient } from './client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (isNaN(numericId)) notFound();

  let product;
  try {
    product = await productsService.getProductByNumericId(numericId);
  } catch {
    notFound();
  }

  return <EditProductClient product={product} />;
}
