# Arquitetura - ReThread Frontend

## 📊 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐         ┌─────────────────┐             │
│  │  Public Pages  │         │  Admin Pages    │             │
│  │  (/)           │         │  (/admin/*)     │             │
│  │                │         │                 │             │
│  │ - Home         │         │ - Dashboard     │             │
│  │ - Login        │         │ - Produtos CRUD │             │
│  └───────┬────────┘         └────────┬────────┘             │
│          │                           │                       │
│          │                           │                       │
│          ├───────────┬───────────────┤                       │
│          │           │               │                       │
│     ┌────▼──────┐ ┌──▼────────┐ ┌───▼───────┐               │
│     │  Features │ │  Shared   │ │ Middleware│               │
│     │           │ │           │ │           │               │
│     │ - Auth    │ │ - Libs    │ │ - Auth    │               │
│     │ - Produtos│ │ - Utils   │ │   Check   │               │
│     │ - Admin   │ │ - Types   │ └───────────┘               │
│     └─────┬─────┘ └───────────┘                             │
│           │                                                   │
│           │                                                   │
│      ┌────▼────────┐                                          │
│      │ API Client  │                                          │
│      │ (fetch)     │                                          │
│      └────┬────────┘                                          │
│           │                                                   │
└───────────┼───────────────────────────────────────────────────┘
            │
            │ HTTP/REST
            │
┌───────────▼───────────────────────────────────────────────────┐
│                     BACKEND API                               │
│                                                               │
│  Endpoints:                                                   │
│  - GET  /api/produtos         (público)                      │
│  - GET  /api/produtos/:id     (público)                      │
│  - POST /api/auth/login       (público)                      │
│  - GET  /api/auth/verify      (protegido)                    │
│  - POST /api/produtos         (protegido - admin)            │
│  - PUT  /api/produtos/:id     (protegido - admin)            │
│  - DEL  /api/produtos/:id     (protegido - admin)            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Estrutura de Pastas (App/Feature Pattern)

```
rethread-frontend/
│
├── app/                          # Next.js App Router
│   ├── (public)/                 # Grupo de rotas públicas
│   │   └── produtos/             # (futuro) páginas de produtos
│   │
│   ├── admin/                    # Área administrativa
│   │   ├── layout.tsx            # Layout com AdminNav
│   │   ├── dashboard/            # Dashboard de estatísticas
│   │   │   └── page.tsx
│   │   └── produtos/             # CRUD de produtos
│   │       └── page.tsx
│   │
│   ├── login/                    # Autenticação
│   │   └── page.tsx
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home (lista produtos)
│   └── globals.css               # Estilos globais
│
├── features/                     # Features por domínio
│   │
│   ├── auth/                     # 🔐 Feature de Autenticação
│   │   ├── services/
│   │   │   └── auth.service.ts   # Lógica de login/verificação
│   │   ├── hooks/
│   │   │   └── useAuth.ts        # Hook client-side
│   │   └── types/                # Tipos específicos
│   │
│   ├── produtos/                 # 🛍️ Feature de Produtos
│   │   ├── components/
│   │   │   ├── ProdutoCard.tsx   # Card com WhatsApp
│   │   │   └── ProdutosList.tsx  # Grid de produtos
│   │   ├── services/
│   │   │   └── produtos.service.ts # CRUD de produtos
│   │   └── types/
│   │
│   └── admin/                    # 👨‍💼 Feature Administrativa
│       ├── components/
│       │   └── AdminNav.tsx      # Navegação admin
│       ├── services/
│       └── types/
│
├── shared/                       # Código compartilhado
│   ├── components/
│   │   └── Pagination.tsx        # Paginação reutilizável
│   ├── lib/
│   │   └── api-client.ts         # Cliente HTTP centralizado
│   ├── types/
│   │   └── index.ts              # Tipos globais (Produto, etc)
│   └── utils/
│       └── format.ts             # Formatação (preço, WhatsApp)
│
├── middleware.ts                 # Proteção de rotas admin
├── .env.local                    # Variáveis de ambiente
└── next.config.ts                # Configuração Next.js
```

---

## 🔄 Fluxo de Dados

### 1. Listagem de Produtos (SSR - Público)

```
User → http://localhost:3000
           │
           ▼
    app/page.tsx (Server Component)
           │
           ▼
    produtosService.getProdutos()
           │
           ▼
    apiClient.get('/produtos')
           │
           ▼
    Backend API: GET /api/produtos
           │
           ▼
    Response com dados paginados
           │
           ▼
    ProdutosList component renderiza
           │
           ▼
    HTML retornado para o cliente
```

### 2. Autenticação de Admin

```
User → /login
           │
           ▼
    Login Page (Client Component)
           │
           ▼
    useAuth().login({ email, password })
           │
           ▼
    authService.login(credentials)
           │
           ▼
    Backend API: POST /api/auth/login
           │
           ▼
    Response com { user, token }
           │
           ▼
    Salva token em cookie
           │
           ▼
    Redirect para /admin/dashboard
```

### 3. Proteção de Rotas Admin

```
User → /admin/dashboard
           │
           ▼
    middleware.ts intercepta
           │
           ▼
    Busca token do cookie
           │
           ├─ Sem token ──────► Redirect para /login
           │
           ▼
    Verifica com Backend: GET /auth/verify
           │
           ├─ Token inválido ─► Redirect para /login
           │
           ▼
    Token válido → permite acesso
           │
           ▼
    Renderiza dashboard/page.tsx
```

### 4. Click no WhatsApp

```
User → Click em "Chamar no WhatsApp"
           │
           ▼
    ProdutoCard.handleWhatsAppClick()
           │
           ▼
    getWhatsAppMessage(produto) - cria mensagem
           │
           ▼
    formatWhatsAppLink() - formata URL
           │
           ▼
    window.open(link) - abre WhatsApp Web
```

---

## 🔐 Sistema de Autenticação

```
┌──────────────────────────────────────────────┐
│            Fluxo de Autenticação             │
└──────────────────────────────────────────────┘

Login Page                     Backend
    │                             │
    │  POST /auth/login          │
    ├──────────────────────────► │
    │  { email, password }        │
    │                             │
    │  ◄─────────────────────────┤
    │  { user, token }            │
    │                             │
    ▼                             │
Salva cookie                      │
"rethread_admin_token"            │
    │                             │
    ▼                             │
Redirect /admin                   │
    │                             │
    ▼                             │
Middleware.ts                     │
    │                             │
    │  GET /auth/verify          │
    │  Header: Bearer {token}    │
    ├──────────────────────────► │
    │                             │
    │  ◄─────────────────────────┤
    │  { valid: true, user }      │
    │                             │
    ▼                             │
Acesso Permitido                  │
    │                             │
    ▼
Dashboard/Admin Pages
```

---

## 🎨 Componentes e Responsabilidades

### Server Components (SSR)

- `app/page.tsx` - Lista produtos (SEO otimizado)
- `app/admin/dashboard/page.tsx` - Dashboard
- `app/admin/produtos/page.tsx` - Lista admin

**Vantagens:**
- ✅ Renderizado no servidor
- ✅ Dados frescos a cada request
- ✅ Melhor para SEO
- ✅ Menos JavaScript no cliente

### Client Components ('use client')

- `features/produtos/components/ProdutoCard.tsx`
- `features/admin/components/AdminNav.tsx`
- `app/login/page.tsx`
- `shared/components/Pagination.tsx`

**Quando usar:**
- ✅ Interatividade (onClick, onChange)
- ✅ Hooks do React (useState, useEffect)
- ✅ Browser APIs (window, document)

---

## 📦 Services Layer

### API Client (`shared/lib/api-client.ts`)

Cliente HTTP centralizado com:
- ✅ Tratamento de erros
- ✅ Configuração de headers
- ✅ Suporte a autenticação
- ✅ Type safety

```typescript
// Uso público
apiClient.get('/produtos')

// Uso protegido
apiClient.withAuth(token).post('/produtos', data)
```

### Produtos Service (`features/produtos/services/produtos.service.ts`)

Encapsula lógica de negócio:
- ✅ Buscar produtos com filtros
- ✅ CRUD completo
- ✅ Conversão de parâmetros

### Auth Service (`features/auth/services/auth.service.ts`)

Gerencia autenticação:
- ✅ Login
- ✅ Verificação de token
- ✅ Helpers server-side

---

## 🛡️ Middleware de Proteção

O `middleware.ts` protege todas as rotas `/admin/*`:

```typescript
export const config = {
  matcher: '/admin/:path*',
};
```

**Sequência de verificação:**
1. Busca token no cookie
2. Se não existe → redirect /login
3. Verifica token com backend
4. Se inválido → redirect /login
5. Se válido → permite acesso

---

## 🎯 Tipos TypeScript

Tipos compartilhados em `shared/types/index.ts`:

```typescript
- Produto           # Modelo de produto completo
- PaginatedResponse # Resposta paginada genérica
- ApiError          # Formato de erro da API
- User              # Dados do usuário
- AuthResponse      # Resposta de login
```

---

## 🌐 Roteamento Next.js 16

### Rotas Públicas
- `/` → Loja principal
- `/login` → Login admin

### Rotas Protegidas (requerem auth)
- `/admin/dashboard` → Dashboard
- `/admin/produtos` → Lista produtos
- `/admin/produtos/new` → Criar produto (futuro)
- `/admin/produtos/[id]/edit` → Editar produto (futuro)

### Grupos de Rotas
- `(public)` → Agrupa rotas públicas sem afetar URL

---

## ⚡ Performance e Otimizações

### Server-Side Rendering (SSR)
- Produtos renderizados no servidor
- Revalidação configurável (`revalidate: 60`)

### Otimização de Imagens
- `next/image` para todas as imagens
- Lazy loading automático
- Otimização de tamanho

### Code Splitting
- Componentes carregados sob demanda
- Bundle otimizado por rota

---

## 🔮 Próximas Evoluções

1. **Página de detalhes do produto**
   - Rota: `/produtos/[id]`
   - Galeria de imagens
   - Informações completas

2. **Upload de imagens no admin**
   - Integração com storage
   - Preview de imagem
   - Validação de formato

3. **Busca e filtros avançados**
   - Busca por texto
   - Filtro por categoria, cor, preço
   - Ordenação

4. **Sistema de cache Redis**
   - Cache de produtos
   - Invalidação inteligente

5. **Testes automatizados**
   - Unit tests (Vitest)
   - Integration tests
   - E2E tests (Playwright)

---

**Arquitetura projetada para escalabilidade e manutenibilidade** 🚀
