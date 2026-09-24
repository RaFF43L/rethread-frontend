# ENVIRONMENT SETUP - Segunda Aura Brechó

## 📁 Arquivos de Configuração

### Arquivos Criados:
1. **`.env.example`** - Template para desenvolvimento
2. **`.env.production.example`** - Template para produção
3. **`shared/lib/env.ts`** - Gerenciamento type-safe de variáveis
4. **`shared/components/ProductImage.tsx`** - Componente otimizado para imagens S3

---

## 🔧 Configuração para Desenvolvimento

### 1. Configurar Variáveis Locais

O arquivo `.env.local` já está configurado com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
NEXT_PUBLIC_S3_BUCKET_URL=http://localhost:4566/rethread-dev
NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION=false
```

### 2. Iniciar Servidores

```bash
# Backend
cd rethread-backend
npm run dev

# Frontend
cd rethread-frontend
npm run dev
```

---

## 🚀 Configuração para Produção

### 1. Variáveis de Ambiente na Vercel/AWS

Configure estas variáveis no painel de deployment:

```env
# API Backend
NEXT_PUBLIC_API_URL=https://api.segundaaura.com.br

# WhatsApp (seu número real)
NEXT_PUBLIC_WHATSAPP_NUMBER=5511987654321

# S3 Bucket (seu bucket de produção)
NEXT_PUBLIC_S3_BUCKET_URL=https://segunda-aura-prod.s3.sa-east-1.amazonaws.com

# App
NEXT_PUBLIC_APP_URL=https://www.segundaaura.com.br
NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION=false
```

### 2. Next.js Config

O `next.config.ts` já está configurado para aceitar:
- ✅ URLs do LocalStack (desenvolvimento)
- ✅ URLs do S3 AWS (produção) - `*.s3.*.amazonaws.com`
- ✅ CloudFront CDN - `*.cloudfront.net`
- ✅ Imagens não otimizadas (para URLs pré-assinadas)

### 3. CORS no Backend

Certifique-se que seu backend permite o domínio de produção:

```typescript
// backend/main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',           // Dev
    'https://www.segundaaura.com.br',  // Prod
  ],
  credentials: true,
});
```

---

## 🛡️ Segurança

### ✅ O que está seguro:

1. **Variáveis Públicas**: Apenas `NEXT_PUBLIC_*` são expostas ao cliente
2. **URLs Dinâmicas**: Configuradas via variáveis de ambiente
3. **Validação**: Função `validateEnv()` verifica variáveis obrigatórias em produção
4. **Type Safety**: TypeScript garante uso correto das variáveis

### ⚠️ NUNCA exponha:

```env
# ❌ NUNCA adicione NEXT_PUBLIC_ nestes:
API_SECRET_KEY=xxx
DATABASE_URL=xxx
AWS_SECRET_ACCESS_KEY=xxx
JWT_SECRET=xxx
```

---

## 🖼️ Configuração de Imagens

### URLs Pré-assinadas do S3

O backend retorna `imageUrl` com assinatura temporária:

```json
{
  "imageUrl": "http://localhost:4566/...?X-Amz-Signature=..."
}
```

### Componente ProductImage

Criado componente otimizado que:
- ✅ Detecta URLs S3 automaticamente
- ✅ Usa `unoptimized` para URLs pré-assinadas
- ✅ Fallback para imagem de placeholder
- ✅ Loading skeleton
- ✅ Error handling

### Uso:

```tsx
import { ProductImage } from '@/shared/components/ProductImage';

<ProductImage 
  src={produto.imagem}
  alt={produto.nome}
/>
```

---

## 📦 Helper Functions

### `env.ts` exporta:

```typescript
// Acessar configurações
env.apiUrl
env.whatsappNumber
env.s3BucketUrl
env.isProduction

// Construir URLs
getApiUrl('/products')  // http://localhost:3001/products

// Verificar se é S3
isS3Image(url)  // true/false

// Obter URL de imagem com fallback
getImageUrl(imageUrl, fallback)
```

---

## 🔄 Fluxo de Imagens

### Desenvolvimento:
```
Backend → LocalStack S3 → URL pré-assinada → ProductImage → Usuário
```

### Produção:
```
Backend → AWS S3 → URL pré-assinada → ProductImage → Usuário
```

---

## 📝 Checklist de Deploy

### Antes de fazer deploy:

- [ ] Configurar variáveis no Vercel/AWS
- [ ] Atualizar `NEXT_PUBLIC_API_URL` para API de produção
- [ ] Atualizar `NEXT_PUBLIC_WHATSAPP_NUMBER` com número real
- [ ] Configurar bucket S3 de produção
- [ ] Habilitar CORS no backend para domínio de produção
- [ ] Testar upload de imagens no backend
- [ ] Verificar se URLs pré-assinadas estão funcionando
- [ ] Testar em mobile

### Após deploy:

- [ ] Verificar se imagens carregam
- [ ] Testar botão do WhatsApp
- [ ] Verificar performance no Lighthouse
- [ ] Testar PWA manifest
- [ ] Validar SEO

---

## 🐛 Troubleshooting

### Imagens não aparecem?

1. **Verificar URL da imagem**:
```bash
# Copie a URL do Network tab e teste no navegador
curl -I "URL_DA_IMAGEM"
```

2. **Verificar Next.js config**:
```typescript
// next.config.ts deve incluir o hostname
remotePatterns: [
  { hostname: 'seu-bucket.s3.amazonaws.com' }
]
```

3. **Desabilitar otimização**:
```env
NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION=false
```

### CORS errors?

Configure no backend:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

---

## 📚 Arquivos Modificados

- ✅ `.env.local` - Configurado
- ✅ `next.config.ts` - Aceita S3 e CloudFront
- ✅ `shared/lib/env.ts` - Gerenciamento de variáveis
- ✅ `shared/lib/api-client.ts` - Usa env.ts
- ✅ `features/produtos/services/produtos.service.ts` - Usa getImageUrl()
- ✅ `features/produtos/components/ProdutoCard.tsx` - Usa ProductImage
- ✅ `features/produtos/components/ProdutosList.tsx` - Usa env.whatsappNumber
- ✅ `shared/components/ProductImage.tsx` - Novo componente

---

**Pronto para produção!** 🚀
