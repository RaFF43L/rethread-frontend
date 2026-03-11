'use client';

import { Produto } from '@/shared/types';
import { formatPrice, formatWhatsAppLink, getWhatsAppMessageText } from '@/shared/utils/format';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { ProductImage } from '@/shared/components/ProductImage';
import { env } from '@/shared/lib/env';
import Link from 'next/link';

interface ProdutoCardProps {
  produto: Produto;
  whatsappNumber: string;
}

export function ProdutoCard({ produto, whatsappNumber }: ProdutoCardProps) {
  const handleWhatsAppClick = () => {
    const productUrl = `${env.appUrl}/produto/${produto.id}`;
    
    const message = getWhatsAppMessageText({
      nome: produto.nome,
      preco: produto.preco,
    }) + `\n\n${productUrl}`;
    
    const link = formatWhatsAppLink(whatsappNumber, message);
    window.open(link, '_blank');
  };

  return (
    <Card className="card-gradient overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <Link href={`/produto/${produto.id}`} className="relative h-56 sm:h-64 w-full overflow-hidden flex-shrink-0 block">
        <ProductImage
          src={produto.imagem}
          alt={produto.nome}
          className="group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {!produto.disponivel && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="destructive" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
              Indisponível
            </Badge>
          </div>
        )}
        {produto.disponivel && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <Badge variant="success" className="shadow-lg text-xs sm:text-sm">
              Disponível
            </Badge>
          </div>
        )}
      </Link>
      
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground line-clamp-1">
          {produto.nome}
        </h3>
        
        {produto.descricao && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
            {produto.descricao}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Cor:</span>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-border shadow-sm"
              style={{ backgroundColor: produto.cor.toLowerCase() }}
              title={produto.cor}
            />
            <Badge variant="outline" className="font-medium text-xs sm:text-sm">
              {produto.cor}
            </Badge>
          </div>
        </div>

        <div className="pt-1 sm:pt-2 mt-auto">
          <span className="text-2xl sm:text-3xl font-bold text-primary">
            {formatPrice(produto.preco)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0 flex-col gap-2">
        <Button
          onClick={handleWhatsAppClick}
          disabled={!produto.disponivel}
          className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-md text-sm sm:text-base"
          size="lg"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Chamar no WhatsApp
        </Button>
        
        <Button
          asChild
          variant="outline"
          className="w-full text-xs sm:text-sm"
          size="sm"
        >
          <Link href={`/produto/${produto.id}`}>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            Ver detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
