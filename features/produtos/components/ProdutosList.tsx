import { Produto } from '@/shared/types';
import { ProdutoCard } from './ProdutoCard';
import { env } from '@/shared/lib/env';

interface ProdutosListProps {
  produtos: Produto[];
  whatsappNumber?: string;
}

export function ProdutosList({ 
  produtos, 
  whatsappNumber = env.whatsappNumber 
}: ProdutosListProps) {
  if (produtos.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground text-base sm:text-lg">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {produtos.map((produto) => (
        <ProdutoCard key={produto.id} produto={produto} whatsappNumber={whatsappNumber} />
      ))}
    </div>
  );
}
