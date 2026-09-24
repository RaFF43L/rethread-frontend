# Guia Rápido - ReThread Frontend

## 🚀 Início Rápido

### 1. Primeira Execução

```bash
# Já foi feito: npm install

# Verifique o arquivo .env.local e ajuste o URL do seu backend
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Iniciar em modo desenvolvimento
npm run dev
```

### 2. Acessar a Aplicação

- **Loja Pública**: http://localhost:3000
- **Login Admin**: http://localhost:3000/login
- **Dashboard Admin**: http://localhost:3000/admin/dashboard (após login)

---

## 📋 Checklist de Integração com Backend

- [ ] Backend rodando na porta configurada (default: 3001)
- [ ] CORS configurado para aceitar localhost:3000
- [ ] Endpoints de produtos retornando conforme BACKEND_SPEC.md
- [ ] Endpoint de autenticação funcionando
- [ ] URLs de imagens acessíveis

### Testar Backend Manualmente

**IMPORTANTE: Certifique-se que o backend está rodando primeiro!**

```bash
# Testar listagem de produtos
curl http://localhost:3001/api/products

# Ou no PowerShell:
Invoke-WebRequest -Uri http://localhost:3001/api/products

# Testar login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rethread.com","password":"senha123"}'

# Ou no PowerShell:
Invoke-RestMethod -Uri http://localhost:3001/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"admin@rethread.com","password":"senha123"}'
```

**Se receber erro "Connection refused" (ECONNREFUSED):**
- ✅ Verifique se o backend está rodando
- ✅ Verifique a porta correta em `.env.local`
- ✅ Certifique-se que a URL tem `/api` no final

---

## 🎯 Fluxos Principais

### Fluxo do Usuário (Público)

1. Acessa a home `/`
2. Vê lista de produtos paginada
3. Clica em "Chamar no WhatsApp" em um produto
4. É redirecionado para WhatsApp com mensagem pré-formatada

### Fluxo do Admin

1. Acessa `/login`
2. Insere credenciais (email e senha)
3. É redirecionado para `/admin/dashboard`
4. Visualiza estatísticas dos produtos
5. Pode navegar para `/admin/produtos` para gerenciar produtos
6. Pode criar/editar/excluir produtos

---

## 🔧 Customizações Comuns

### Alterar Número do WhatsApp

Em `app/page.tsx` e outros locais onde ProdutoCard é usado:

```tsx
<ProdutosList 
  produtos={produtos}
  whatsappNumber="5511999999999"  // ← Altere aqui
/>
```

### Alterar Quantidade de Produtos por Página

Em `app/page.tsx`:

```tsx
const limit = Number(params.limit) || 12; // ← Altere o 12
```

### Alterar Tempo de Revalidação SSR

Em `app/page.tsx`:

```tsx
export const revalidate = 60; // ← Altere para segundos desejados (0 = sempre buscar novo)
```

### Alterar Nome da Cookie de Autenticação

Em `.env.local`:

```env
NEXT_PUBLIC_AUTH_COOKIE_NAME=seu_nome_personalizado
```

---

## 🎨 Personalizar Cores (Tailwind)

Edite `tailwind.config.ts` para adicionar suas cores:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',    // Azul padrão
      secondary: '#6366F1',  // Indigo
      // Adicione suas cores aqui
    }
  }
}
```

---

## 📱 Adicionar Novas Features

### Exemplo: Adicionar Categorias de Produtos

1. **Criar componente de filtro**

```tsx
// features/produtos/components/CategoryFilter.tsx
'use client';

export function CategoryFilter({ onSelect }: { onSelect: (cat: string) => void }) {
  const categories = ['Camisetas', 'Calças', 'Vestidos', 'Acessórios'];
  
  return (
    <div className="flex gap-2">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="px-4 py-2 bg-white rounded-lg hover:bg-blue-50"
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
```

2. **Adicionar na página**

```tsx
// app/page.tsx
import { CategoryFilter } from '@/features/produtos/components/CategoryFilter';

// ... usar no JSX
<CategoryFilter onSelect={(cat) => {
  // Lógica de filtro
}} />
```

---

## 🔐 Múltiplos Níveis de Acesso

Se precisar adicionar mais roles além de admin:

1. **Atualizar tipo em `shared/types/index.ts`**

```typescript
export interface User {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'user' | 'editor'; // ← Adicione roles
}
```

2. **Criar middleware específico**

```typescript
// middleware.ts - adicionar verificação de role
const response = await fetch(...);
const { user } = await response.json();

if (user.role !== 'admin') {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}
```

---

## 🐛 Debug Comum

### Produtos não aparecem

1. Verifique console do browser (F12)
2. Verifique se backend está respondendo:
   ```bash
   curl http://localhost:3001/api/produtos
   ```
3. Verifique CORS no backend
4. Verifique a URL em `.env.local`

### Autenticação não funciona

1. Verifique se endpoint `/auth/login` está retornando token
2. Verifique se cookie está sendo salvo (DevTools > Application > Cookies)
3. Verifique se middleware está validando corretamente
4. Verifique nome da cookie em `.env.local`

### Imagens não carregam

1. Adicione domínio em `next.config.ts`:

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'seu-dominio.com',
      },
    ],
  },
};
```

### Erro de TypeScript

```bash
# Limpar cache e reinstalar
rm -rf .next
npm run build
```

---

## 📦 Deploy em Produção

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Não esqueça de adicionar as variáveis de ambiente no painel da Vercel!

### Outras Plataformas

```bash
# Build
npm run build

# Iniciar produção
npm run start
```

---

## 🔄 Próximos Passos Sugeridos

- [ ] Implementar busca de produtos
- [ ] Adicionar filtros avançados (preço, tamanho, cor)
- [ ] Criar página de detalhes do produto
- [ ] Implementar upload de imagens no admin
- [ ] Adicionar sistema de favoritos
- [ ] Implementar carrinho de compras (se necessário)
- [ ] Adicionar analytics
- [ ] Implementar testes (Jest, React Testing Library)
- [ ] Adicionar loading states melhores
- [ ] Implementar skeleton screens

---

## 💡 Dicas de Performance

1. **Otimizar Imagens**: Use Next/Image sempre
2. **Cache**: Ajuste revalidate conforme necessidade
3. **Lazy Loading**: Use dynamic imports para componentes pesados
4. **Bundle Size**: Analise com `npm run build` e otimize imports

```bash
# Analisar bundle
npm install -D @next/bundle-analyzer
```

---

## 📞 Suporte

- Documentação Next.js: https://nextjs.org/docs
- Documentação Tailwind: https://tailwindcss.com/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs/

---

**Desenvolvido para ReThread** 🧵
