# AGENTS.md

Instruções para agentes de IA trabalhando neste repositório.

## Projeto

ReThread Frontend — aplicação Next.js para gerenciamento e exibição de produtos de roupas (brechó Segunda Aura), com área pública e área administrativa protegida.

- **Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Shadcn/UI (Radix), Zod + React Hook Form
- **Backend:** API externa (NestJS) consumida via `shared/lib/api-client.ts`; spec em `AI/modes/BACKEND_SPEC.md`

## Comandos

```bash
npm run dev     # servidor de desenvolvimento (localhost:3000)
npm run build   # build de produção
npm run start   # servidor de produção
npm run lint    # ESLint
```

Não há testes automatizados neste projeto. Variáveis de ambiente ficam em `.env.local` (ver `AI/modes/ENVIRONMENT_SETUP.md`).

## Estrutura

- `app/` — App Router: `(public)/` rotas públicas, `admin/` rotas protegidas, `login/`
- `features/` — código por domínio (`auth/`, `products/`, `admin/`), cada uma com `components/`, `services/`, `hooks/`
- `shared/` — código compartilhado: `components/` (inclui `ui/` com primitivos Shadcn), `lib/`, `types/`, `utils/`
- `proxy.ts` — proxy/middleware de proteção de rotas `/admin/*` via token em cookie
- `AI/` — documentação organizada para agentes de IA (ver índice abaixo)

## Pasta AI/ (índice)

Documentação do projeto organizada em duas pastas. Consulte antes de implementar algo relacionado.

### AI/modes/ — documentação padrão do projeto

| Arquivo | Quando consultar |
|---|---|
| `ARCHITECTURE.md` | Arquitetura geral, fluxo de dados, decisões estruturais |
| `BACKEND_SPEC.md` | Endpoints e contratos esperados do backend |
| `ENVIRONMENT_SETUP.md` | Variáveis de ambiente e configuração |
| `QUICK_START.md` | Primeira execução do projeto |
| `SETUP_COMPLETO.md` | Configuração completa do ambiente |
| `TROUBLESHOOTING.md` | Erros conhecidos e soluções (ex.: `fetch failed`/`ECONNREFUSED`) |
| `PROJECT_SUMMARY.md` | Checklist de entrega do projeto |
| `FINAL_SUMMARY.md` | Resumo do que foi implementado |

### AI/skills/ — guias de implementação

| Arquivo | Quando consultar |
|---|---|
| `PWA_IMPLEMENTATION.md` | Progressive Web App, manifest, service worker |
| `SHADCN_UI_IMPLEMENTATION.md` | Identidade visual Segunda Aura, temas e cores |
| `UI_IMPROVEMENTS.md` | Padrões de UI/UX já aplicados (busca, formulários) |
| `WHATSAPP_IMAGE_PREVIEW.md` | URLs do S3 e preview de imagens no WhatsApp |
| `BACKEND_S3_URLS_EXAMPLE.md` | Exemplo de código do backend retornando URLs diretas do S3 |

## Convenções

- Componentes em `PascalCase.tsx`; services em `kebab-case.service.ts`; hooks em `useNomeDaFuncionalidade.ts`
- Respostas e mensagens de commit em português; commits seguem Conventional Commits (`feat:`, `fix:` com escopo, ex.: `fix(products):`)
- Páginas públicas usam SSR com revalidação de 60s; páginas admin sempre atualizadas
- Erros tratados de forma centralizada no API client — não duplicar tratamento nas telas
- Não commitar `.env.local` nem segredos
