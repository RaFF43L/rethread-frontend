export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')),
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999',
  authCookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'segunda_aura_token',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Segunda Aura Brechó',
  enableImageOptimization: process.env.NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * Valida se todas as variáveis obrigatórias estão definidas
 * Chame esta função no início da aplicação
 */
export function validateEnv() {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_WHATSAPP_NUMBER',
  ];

  const missing = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0 && env.isProduction) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`
    );
  }

  if (missing.length > 0 && env.isDevelopment) {
    console.warn(
      `⚠️  Missing environment variables (using defaults): ${missing.join(', ')}`
    );
  }
}

/**
 * Helper para construir URLs de API
 */
export function getApiUrl(path: string): string {
  const baseUrl = env.apiUrl.endsWith('/') 
    ? env.apiUrl.slice(0, -1) 
    : env.apiUrl;
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Helper para verificar se uma URL é uma imagem S3
 */
export function isS3Image(url: string): boolean {
  return url.includes('s3.') || 
         url.includes('amazonaws.com') || 
         url.includes('.s3-');
}

/**
 * Helper para obter URL de imagem otimizada
 */
export function getImageUrl(imageUrl?: string, fallback?: string): string {
  if (!imageUrl) {
    return fallback || '/placeholder-product.svg';
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return `${env.apiUrl}/${imageUrl}`;
}

if (typeof window !== 'undefined' && env.isProduction) {
  validateEnv();
}
