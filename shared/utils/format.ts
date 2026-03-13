
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

export function getWhatsAppMessageText(product: { name: string; price: number; size?: string }): string {
  const lines = [
    `Ola! Tenho interesse neste produto:`,
    ``,
    `*${product.name}*`,
    `R$ ${product.price.toFixed(2).replace('.', ',')}`,
  ];
  if (product.size) lines.push(`Tamanho: ${product.size}`);
  return lines.join('\n');
}

function cleanUrlForWhatsApp(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

/** @deprecated Use getWhatsAppMessageText + Web Share API */
export function getWhatsAppMessage(product: { name: string; price: number; image?: string }): string {
  const baseMessage = `Olá! Tenho interesse neste produto:\n\n📦 *${product.name}*\n💰 ${formatPrice(product.price)}`;
  
  if (product.image && product.image.startsWith('http')) {
    const cleanUrl = cleanUrlForWhatsApp(product.image);
    return `${baseMessage}\n\n🖼️ Imagem: ${cleanUrl}`;
  }
  
  return baseMessage;
}
