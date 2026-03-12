import { notFound } from 'next/navigation';
import { produtosService } from '@/features/produtos/services/produtos.service';
import { ProdutoCard } from '@/features/produtos/components/ProdutoCard';
import { env } from '@/shared/lib/env';
import { formatWhatsAppLink, getWhatsAppMessageText } from '@/shared/utils/format';
import { MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const produto = await produtosService.getProdutoById(id);
    const primeiraImagem = produto.imagens[0] || '/placeholder-product.svg';

    return {
      title: `${produto.nome} - R$ ${produto.preco.toFixed(2)} | Segunda Aura Brechó`,
      description: produto.descricao || `${produto.nome} - ${produto.cor}`,
      openGraph: {
        title: `${produto.nome} - Segunda Aura Brechó`,
        description: `💰 R$ ${produto.preco.toFixed(2)} • ${produto.cor} • ${produto.disponivel ? '✅ Disponível' : '❌ Indisponível'}`,
        images: [
          {
            url: primeiraImagem,
            width: 1200,
            height: 630,
            alt: produto.nome,
          },
        ],
        type: 'website',
        siteName: 'Segunda Aura Brechó',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${produto.nome} - Segunda Aura Brechó`,
        description: `R$ ${produto.preco.toFixed(2)} • ${produto.cor}`,
        images: [primeiraImagem],
      },
    };
  } catch {
    return {
      title: 'Produto não encontrado | Segunda Aura Brechó',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  let produto;
  try {
    produto = await produtosService.getProdutoById(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-md backdrop-blur-sm bg-card/98">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/logo-segunda-aura.svg" 
                alt="Segunda Aura Brechó" 
                className="w-12 h-12 sm:w-14 sm:h-14"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-coral leading-tight">Segunda Aura</h1>
                <p className="text-xs sm:text-sm text-olive font-medium">Brechó</p>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Produto */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 text-center">
          Detalhes do Produto
        </h2>
        
        <ProdutoCard 
          produto={produto} 
          whatsappNumber={env.whatsappNumber}
        />

        {produto.disponivel && (
          <a
            href={formatWhatsAppLink(
              env.whatsappNumber,
              `${getWhatsAppMessageText({ nome: produto.nome, preco: produto.preco })}\n\n${env.appUrl}/produto/${produto.id}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold transition-colors text-base"
          >
            <MessageCircle className="w-5 h-5" />
            Chamar no WhatsApp
          </a>
        )}

        <div className="mt-6 text-center">
          <a 
            href="/"
            className="text-coral hover:text-coral-dark underline text-sm"
          >
            ← Voltar para catálogo
          </a>
        </div>
      </main>
    </div>
  );
}
