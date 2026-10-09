# Guia de Usabilidade — Rethread

Visão geral dos principais fluxos da aplicação, ilustrada com capturas de tela
geradas automaticamente via Playwright, em **modo claro e escuro**.

> As imagens deste documento são geradas pelo script em [`e2e/screenshots.spec.ts`](../e2e/screenshots.spec.ts).
> Para atualizá-las, rode `npm run shots` (requer o backend rodando em `http://localhost:3001`).
> Os arquivos ficam em `docs/screenshots/<light|dark>/<desktop|mobile>/`.

---

## 1. Catálogo (Home)

Página inicial com o catálogo de peças, filtros por categoria e atalho para os favoritos.

| | Desktop | Mobile |
| --- | --- | --- |
| **Claro** | ![Home desktop claro](screenshots/light/desktop/01-home.png) | ![Home mobile claro](screenshots/light/mobile/01-home.png) |
| **Escuro** | ![Home desktop escuro](screenshots/dark/desktop/01-home.png) | ![Home mobile escuro](screenshots/dark/mobile/01-home.png) |

Página inteira (com scroll):

| Claro | Escuro |
| --- | --- |
| ![Home inteira clara](screenshots/light/desktop/01-home-full.png) | ![Home inteira escura](screenshots/dark/desktop/01-home-full.png) |

---

## 2. Detalhe do produto

Ao clicar numa peça, o usuário vê fotos, preço, tamanho, descrição e o CTA de contato via WhatsApp.

| | Desktop | Mobile |
| --- | --- | --- |
| **Claro** | ![Produto desktop claro](screenshots/light/desktop/02-product-full.png) | ![Produto mobile claro](screenshots/light/mobile/02-product-full.png) |
| **Escuro** | ![Produto desktop escuro](screenshots/dark/desktop/02-product-full.png) | ![Produto mobile escuro](screenshots/dark/mobile/02-product-full.png) |

---

## 3. Favoritos (deslogado)

Sem login, a página de favoritos convida o usuário a entrar para salvar suas peças.

| | Desktop | Mobile |
| --- | --- | --- |
| **Claro** | ![Favoritos desktop claro](screenshots/light/desktop/03-favorites.png) | ![Favoritos mobile claro](screenshots/light/mobile/03-favorites.png) |
| **Escuro** | ![Favoritos desktop escuro](screenshots/dark/desktop/03-favorites.png) | ![Favoritos mobile escuro](screenshots/dark/mobile/03-favorites.png) |

---

## 4. Favoritos (logado, com itens)

Após o login, o usuário vê suas peças favoritadas, sincronizadas com a conta.

| | Desktop | Mobile |
| --- | --- | --- |
| **Claro** | ![Favoritos logado desktop claro](screenshots/light/desktop/04-favorites-logged-in.png) | ![Favoritos logado mobile claro](screenshots/light/mobile/04-favorites-logged-in.png) |
| **Escuro** | ![Favoritos logado desktop escuro](screenshots/dark/desktop/04-favorites-logged-in.png) | ![Favoritos logado mobile escuro](screenshots/dark/mobile/04-favorites-logged-in.png) |

> Este fluxo exige uma sessão real. Veja ["Fluxos autenticados"](#fluxos-autenticados-login) abaixo.

---

## Como regenerar os prints

```bash
# 1. Garanta o backend rodando em http://localhost:3001
# 2. Gere os prints (o Playwright sobe o `next dev` sozinho):

npm run shots     # público: claro + escuro, desktop + mobile
```

As imagens são salvas em `docs/screenshots/<light|dark>/<desktop|mobile>/` e versionadas no git.

### Fluxos autenticados (login)

Os prints logados (ex.: favoritos com itens) precisam de uma **sessão real** —
o accessToken vem do backend, não dá para fabricar. Capturamos a sessão **uma vez**
e reusamos:

```bash
# 1. Faça o login UMA vez (abre o browser; logue no Google na janela):
npm run auth:login     # salva a sessão em e2e/.auth/state.json (gitignored)

# 2. Gere os prints autenticados (reusa a sessão salva; claro + escuro):
npm run shots:auth
```

- A sessão fica em `e2e/.auth/state.json` (com tokens → **nunca** vai pro git).
- O token expira em ~24h. Para reautenticar: delete o arquivo e rode `npm run auth:login`
  de novo (ou `FORCE_AUTH=1 npm run auth:login`).

### Dicas

- **Explorar/gravar novos fluxos:** `npx playwright codegen http://localhost:3000`
  gera o código do teste enquanto você navega.
- **Modo visual (debug passo a passo):** `npx playwright test --ui`.
- **Novos fluxos que exigem login** (admin, etc.): reusam o mesmo `storageState`
  da sessão capturada; é só adicionar o teste em `e2e/authenticated.spec.ts`.
