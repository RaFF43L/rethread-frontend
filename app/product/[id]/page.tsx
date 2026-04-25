import { notFound } from 'next/navigation';
import { productsService } from '@/features/products/services/products.service';
import { ImageCarousel } from '@/shared/components/ImageCarousel';
import { env } from '@/shared/lib/env';
import { formatWhatsAppLink, getWhatsAppMessageText } from '@/shared/utils/format';
import { formatPrice } from '@/shared/utils/format';
import { MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await productsService.getProductById(id);
    const firstImage = product.images[0] || '/placeholder-product.svg';

    return {
      title: `${product.name} - Segunda Aura Brechó`,
      description: product.description || `${product.name} - R$ ${product.price.toFixed(2).replace('.', ',')}`,
      openGraph: {
        title: `${product.name} - Segunda Aura Brechó`,
        description: [
          `R$ ${product.price.toFixed(2).replace('.', ',')}`,
          product.size ? `Tamanho ${product.size}` : null,
          product.available ? 'Disponível' : 'Indisponível',
        ].filter(Boolean).join(' · '),
        images: [{ url: firstImage, width: 1200, height: 630, alt: product.name }],
        type: 'website',
        siteName: 'Segunda Aura Brechó',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - Segunda Aura Brechó`,
        description: `R$ ${product.price.toFixed(2).replace('.', ',')}${product.size ? ` · Tamanho ${product.size}` : ''}`,
        images: [firstImage],
      },
    };
  } catch {
    return { title: 'Produto não encontrado | Segunda Aura Brechó' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  let product;
  try {
    product = await productsService.getProductById(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="flex items-center px-4 h-14">
          <a href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <img
              src="/logo-segunda-aura.png"
              alt="Segunda Aura"
              className="h-9 w-auto"
            />
          </a>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Carousel — full width, no lateral padding */}
        <div className="relative aspect-[3/4] bg-stone-50 overflow-hidden">
          <ImageCarousel
            images={product.images}
            videos={product.videos}
            alt={product.name}
            priority
            objectFit="contain"
          />
          {!product.available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
              <span className="bg-black/70 text-white text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
                Indisponível
              </span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="px-5 py-6 space-y-5">
          {/* Marca — discreta */}
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {product.name}
          </p>

          {/* Descrição */}
          {product.description && (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Tamanho + Cor */}
          {(product.size || product.color) && (
            <div className="flex items-center gap-3 flex-wrap">
              {product.size && (
                <span className="text-xs border border-border px-3 py-1 tracking-wide uppercase">
                  Tam. {product.size}
                </span>
              )}
              {product.color && (
                <span className="text-xs text-muted-foreground capitalize">
                  {product.color}
                </span>
              )}
            </div>
          )}

          {/* Preço */}
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(product.price)}
          </p>

          {/* WhatsApp */}
          {product.available ? (
            <a
              href={formatWhatsAppLink(
                env.whatsappNumber,
                `${getWhatsAppMessageText({ name: product.name, price: product.price, size: product.size })}\n\n${env.appUrl}/product/${product.id}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold transition-colors text-base rounded-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </a>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-3 border border-border rounded-lg">
              Peça indisponível
            </p>
          )}

          {/* Voltar */}
          <div className="text-center pt-2">
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              ← Voltar para o catálogo
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
