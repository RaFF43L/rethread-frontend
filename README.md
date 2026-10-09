# ReThread — Frontend (Brechó Segunda Aura)

Loja online de um brechó de moda sustentável. O site mostra um catálogo público de
peças únicas, permite favoritar, e tem uma área administrativa para
cadastrar e gerenciar os produtos. Há também um assistente de IA (chat) que ajuda a
encontrar peças.

O backend é um serviço separado (API ReThread); este repositório é apenas o frontend.

## Stack

- **Next.js (App Router)** com **React** e **TypeScript**
- **Tailwind CSS** para estilo, com tokens de tema (claro/escuro)
- **Radix UI** para primitivos acessíveis (select, dialog)
- **react-hook-form + zod** para formulários e validação
- **lucide-react** para ícones

## Por que SSR

O catálogo é a parte pública e principal do site, então renderizar no servidor faz
sentido por três motivos concretos:

- **SEO e compartilhamento**: as páginas de produto e a home precisam chegar ao
  navegador (e ao Google) já com o conteúdo no HTML, incluindo metadados OpenGraph.
- **Primeira pintura rápida**: o visitante vê as peças sem esperar um carregamento no
  cliente — os dados são buscados no servidor antes de enviar a página.
- **Cache incremental**: páginas de catálogo usam `revalidate` (ISR), então são
  servidas de cache e atualizadas periodicamente, sem rebuild.

Na prática, as páginas de leitura (home, produto) são **Server Components** que
buscam dados direto da API. As partes interativas (chat, favoritos, formulários do
admin, login) são **Client Components**, marcados com `"use client"`.

## Arquitetura

O código segue uma organização **por feature**: cada domínio do produto vive em sua
própria pasta, com tudo que precisa junto, em vez de separar por tipo de arquivo. O
que é usado por mais de uma feature fica em `shared`.

```
src/
  app/        Rotas (App Router). Define URLs, layout e SSR.
  features/   Domínios da aplicação (um por pasta).
  shared/     Código reutilizável entre features.
```

### `src/app` — rotas

Cada pasta é uma rota. As páginas são Server Components por padrão.

- `/` — home, catálogo de produtos
- `/product/[id]` — página de um produto
- `/favorites` — peças favoritadas
- `/admin` — painel: `dashboard` e CRUD de `products`
- `/auth/google/callback` — retorno do login com Google

### `src/features` — domínios

Cada feature agrupa o que lhe pertence. Nem toda feature usa todas as subpastas:

- `components/` — componentes de UI daquela feature
- `services/` — chamadas à API e regras de acesso a dados
- `context/` — estado compartilhado via React Context (provider + hook)
- `hooks/` — hooks específicos da feature
- `lib/` — funções puras/utilitários do domínio

Features atuais:

- `products` — catálogo, card de produto, filtros, favoritos
- `auth` — login Google, sessão do usuário, autorização por grupo
- `chat` — assistente de IA via streaming (SSE)
- `admin` — formulário de cadastro/edição de produto

### `src/shared` — reutilizável

- `components/` — componentes genéricos; `components/ui/` são os primitivos de
  interface (button, input, select, card...)
- `lib/` — infraestrutura: `api-client` (cliente HTTP), `env` (variáveis de
  ambiente), `utils`
- `hooks/` — hooks genéricos
- `types/` — tipos TypeScript compartilhados
- `utils/` — funções utilitárias (formatação de preço, etc.)

## Acesso à API

Toda chamada passa pelo `api-client` (`src/shared/lib/api-client.ts`), que escolhe a
URL base conforme o ambiente:

- **No navegador**: usa o proxy `/api/backend` (reescrito no `next.config.ts`) para
  evitar problemas de CORS.
- **No servidor** (Server Components): chama a API diretamente.

## Como rodar

Pré-requisitos: Node.js e a API do backend rodando.

```bash
npm install
npm run dev     # ambiente de desenvolvimento (http://localhost:3000)
```

Outros scripts:

```bash
npm run build   # build de produção
npm run start   # serve o build
npm run lint    # checagem com ESLint
```

### Variáveis de ambiente

Defina em um arquivo `.env` na raiz:

- `NEXT_PUBLIC_API_URL` — URL base da API do backend
- `NEXT_PUBLIC_APP_URL` — URL pública do site (usada em metadados)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — número de WhatsApp para contato/compra
- `NEXT_PUBLIC_SESSION_COOKIE_NAME` — nome do cookie de sessão
- `NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION` — liga/desliga a otimização de imagens
