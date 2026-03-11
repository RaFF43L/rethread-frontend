
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function formatWhatsAppLink(phoneNumber: string, message: string): string {
  const phone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Gera mensagem de texto para WhatsApp (SEM link de imagem)
 * Usado quando compartilhamos imagem como arquivo anexo
 */
export function getWhatsAppMessageText(produto: { nome: string; preco: number }): string {
  return `Olá! Tenho interesse neste produto:\n\n📦 *${produto.nome}*\n💰 ${formatPrice(produto.preco)}`;
}

/**
 * Remove query parameters de URLs pré-assinadas do S3
 */
function cleanUrlForWhatsApp(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

/**
 * DEPRECATED: Use getWhatsAppMessageText + Web Share API
 * Gera mensagem COM link de imagem (não funciona bem no WhatsApp)
 */
export function getWhatsAppMessage(produto: { nome: string; preco: number; imagem?: string }): string {
  const baseMessage = `Olá! Tenho interesse neste produto:\n\n📦 *${produto.nome}*\n💰 ${formatPrice(produto.preco)}`;
  
  if (produto.imagem && produto.imagem.startsWith('http')) {
    const cleanUrl = cleanUrlForWhatsApp(produto.imagem);
    return `${baseMessage}\n\n🖼️ Imagem: ${cleanUrl}`;
  }
  
  return baseMessage;
}
