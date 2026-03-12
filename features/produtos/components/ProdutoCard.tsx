'use client';

import { Produto } from '@/shared/types';
import { formatPrice } from '@/shared/utils/format';
import { ImageCarousel } from '@/shared/components/ImageCarousel';
import { useRouter } from 'next/navigation';

interface ProdutoCardProps {
  produto: Produto;
  whatsappNumber: string;
}

export function ProdutoCard({ produto }: ProdutoCardProps) {
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#A0522D] transition-all duration-300 hover:shadow-xl hover:scale-[1.03] flex flex-col h-full cursor-pointer"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        router.push(`/produto/${produto.id}`);
      }}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-stone-50">
        <ImageCarousel images={produto.imagens} alt={produto.nome} />

        {!produto.disponivel && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <span className="bg-black/70 text-white text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
              Indisponivel
            </span>
          </div>
        )}
      </div>

      <div className="px-3 pt-3 pb-3 flex flex-col gap-1.5">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-foreground leading-tight line-clamp-1">
          {produto.nome}
        </h3>

        <span className="text-lg font-bold" style={{ color: '#A0522D' }}>
          {formatPrice(produto.preco)}
        </span>

        {produto.tamanho && (
          <span className="inline-block self-start text-[11px] font-medium text-muted-foreground border border-[#E8E0D5] rounded-full px-2.5 py-0.5">
            {produto.tamanho}
          </span>
        )}
      </div>
    </div>
  );
}