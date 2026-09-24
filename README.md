# ReThread Frontend

Aplicação Next.js para gerenciamento e exibição de produtos de roupas, com área pública para visualização de produtos e área administrativa protegida.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Server-Side Rendering (SSR)** - Para otimização de performance

## 📁 Estrutura do Projeto

```
rethread-frontend/
├── app/                          # App Router do Next.js
│   ├── (public)/                 # Rotas públicas (agrupadas)
│   │   └── produtos/
│   ├── admin/                    # Rotas administrativas (protegidas)
│   │   ├── dashboard/
│   │   └── produtos/
│   ├── login/                    # Página de login
│   ├── layout.tsx                # Layout root
│   └── page.tsx                  # Página inicial
├── features/                     # Features organizadas por domínio
│   ├── auth/                     # Feature de autenticação
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   ├── produtos/                 # Feature de produtos
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   └── admin/                    # Feature administrativa
│       ├── components/
│       ├── services/
│       └── types/
├── shared/                       # Código compartilhado
│   ├── components/               # Componentes reutilizáveis
│   ├── lib/                      # Configurações (API client, etc)
│   ├── types/                    # Tipos TypeScript globais
│   └── utils/                    # Funções utilitárias
├── proxy.ts                      # Middleware/proxy de autenticação
└── AI/                           # Documentação para agentes de IA
```

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (já existe um exemplo):

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Configurações de autenticação
NEXT_PUBLIC_AUTH_COOKIE_NAME=rethread_admin_token
```

### 3. Executar em desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🎯 Features

### Área Pública

- ✅ Listagem de produtos com paginação
- ✅ Card de produto com imagem, descrição, cor e preço
- ✅ Botão para contato via WhatsApp
- ✅ Design responsivo
- ✅ SSR para otimização de SEO

### Área Administrativa

- ✅ Dashboard com estatísticas
- ✅ Listagem de produtos
- ✅ CRUD de produtos (criar, editar, excluir)
- ✅ Sistema de autenticação com token
- ✅ Middleware de proteção de rotas
- ✅ Interface intuitiva

## 🔐 Autenticação

O sistema utiliza tokens JWT armazenados em cookies para autenticação.

### Login

```
POST /api/auth/login
{
  "email": "admin@rethread.com",
  "password": "senha123"
}
```

### Rotas Protegidas

Todas as rotas `/admin/*` são protegidas pelo middleware e requerem autenticação válida.

## 📡 API Client

A aplicação utiliza um client HTTP centralizado (`shared/lib/api-client.ts`) para comunicação com o backend.

### Exemplo de uso:

```typescript
// Sem autenticação
const produtos = await apiClient.get('/produtos');

// Com autenticação
const token = 'seu_token_aqui';
const novoProduto = await apiClient.withAuth(token).post('/produtos', data);
```

## 🔧 Services

### Produtos Service

```typescript
import { produtosService } from '@/features/produtos/services/produtos.service';

// Listar produtos com paginação
const { data, pagination } = await produtosService.getProdutos({
  page: 1,
  limit: 12,
  categoria: 'camisetas',
});

// Buscar produto por ID
const produto = await produtosService.getProdutoById('123');
```

### Auth Service

```typescript
import { authService } from '@/features/auth/services/auth.service';

// Login
const { user, token } = await authService.login({
  email: 'admin@example.com',
  password: 'password',
});

// Verificar token
const isValid = await authService.verifyToken(token);
```

## 🎨 Componentes Principais

### ProdutoCard

Componente para exibição de produto com integração WhatsApp:

```tsx
<ProdutoCard 
  produto={produto} 
  whatsappNumber="5511999999999" 
/>
```

### Pagination

Componente de paginação reutilizável:

```tsx
<Pagination
  currentPage={1}
  totalPages={10}
  basePath="/produtos"
/>
```

## 📦 Build para Produção

```bash
npm run build
npm run start
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## 📝 Padrões de Código

### Organização de Features

Cada feature segue o padrão:
- `components/` - Componentes específicos da feature
- `services/` - Lógica de negócio e comunicação com API
- `hooks/` - Custom hooks React
- `types/` - Tipos TypeScript específicos

### Nomenclatura

- Componentes: `PascalCase.tsx`
- Services: `kebab-case.service.ts`
- Hooks: `useNomeDaFuncionalidade.ts`
- Tipos: `PascalCase` para interfaces e types

## 🌐 Rotas

### Públicas
- `/` - Página inicial com lista de produtos
- `/login` - Página de login administrativa

### Administrativas (protegidas)
- `/admin/dashboard` - Dashboard com estatísticas
- `/admin/produtos` - Listagem de produtos
- `/admin/produtos/new` - Criar novo produto
- `/admin/produtos/[id]/edit` - Editar produto

## 📱 WhatsApp Integration

Os cards de produto incluem um botão que abre o WhatsApp com mensagem pré-formatada:

```typescript
// Configurar número no componente
<ProdutoCard 
  produto={produto} 
  whatsappNumber="5511999999999" // Código do país + DDD + número
/>
```

## 🚨 Tratamento de Erros

A aplicação possui tratamento centralizado de erros no API client, exibindo mensagens amigáveis para o usuário.

## 🔄 Revalidação SSR

- Páginas públicas: Revalidadas a cada 60 segundos
- Páginas admin: Revalidadas a cada requisição (sempre atualizadas)

## 📄 Licença

Este projeto é privado e proprietário.

---

Desenvolvido com ❤️ para ReThread
