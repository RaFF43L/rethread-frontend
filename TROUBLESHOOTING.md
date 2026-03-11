# 🔧 Troubleshooting - ReThread Frontend

## ❌ Erro: "fetch failed" / "ECONNREFUSED"

```
⨯ TypeError: fetch failed
Error: connect ECONNREFUSED 127.0.0.1:3001
```

### Soluções:

#### 1. Backend não está rodando

**Problema:** O backend não está iniciado ou travou.

**Solução:**
```bash
# Navegue até o diretório do backend e inicie-o
cd /caminho/para/seu/backend
npm run dev
# ou
npm start
```

#### 2. URL incorreta no .env.local

**Problema:** A URL está sem `/api` ou com porta errada.

**Verificar:** `.env.local` deve ter:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**NÃO deve ser:**
- ❌ `http://localhost:3001` (sem /api)
- ❌ `http://localhost:3000/api` (porta errada)

**Após editar `.env.local`, REINICIE o servidor Next.js:**
```bash
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

#### 3. Porta diferente

**Problema:** Backend roda em porta diferente de 3001.

**Solução:** Ajuste em `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:PORTA_CORRETA/api
```

#### 4. Testar manualmente se backend responde

**PowerShell:**
```powershell
# Teste simples
Invoke-WebRequest -Uri http://localhost:3001/api/products

# Se funcionar, verá os produtos
# Se falhar, backend não está acessível
```

**Bash/CMD:**
```bash
curl http://localhost:3001/api/products
```

---

## ❌ Produtos não aparecem na tela

### Verificações:

1. **Console do Browser (F12)**
   - Abra DevTools
   - Vá para aba "Console"
   - Procure por erros em vermelho

2. **Network Tab**
   - Abra DevTools > Network
   - Recarregue a página
   - Veja se requisição para `/products` falhou
   - Verifique o status code (200 = OK, 404 = não encontrado, 500 = erro servidor)

3. **Backend retorna dados corretos?**
   
   Teste diretamente:
   ```bash
   curl http://localhost:3001/api/products
   ```
   
   Deve retornar JSON com estrutura:
   ```json
   {
     "data": [...],
     "pagination": {
       "page": 1,
       "limit": 12,
       "total": 10,
       "totalPages": 1
     }
   }
   ```

4. **CORS não configurado**
   
   No backend (Express.js exemplo):
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

---

## ❌ Login não funciona

### Verificações:

1. **Endpoint de login existe?**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"123456"}'
   ```

2. **Resposta do backend está correta?**
   
   Deve retornar:
   ```json
   {
     "user": { "id": "...", "email": "...", "nome": "...", "role": "admin" },
     "token": "eyJhbGci..."
   }
   ```

3. **Cookie está sendo salvo?**
   - DevTools > Application > Cookies
   - Procure por `rethread_admin_token`
   - Se não aparecer, o token não está sendo salvo

4. **Token JWT válido?**
   - Cole o token em https://jwt.io
   - Verifique se não está expirado
   - Verifique se tem as claims necessárias

---

## ❌ Imagens não carregam

### Problema: Imagens aparecem quebradas

**Solução:** Adicionar domínio em `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'seu-dominio.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      // Adicione mais conforme necessário
    ],
  },
};

export default nextConfig;
```

**Após alterar, reinicie o servidor.**

---

## ❌ Erro 401 Unauthorized no Admin

### Problema: Sempre redireciona para login

**Verificações:**

1. **Token está no cookie?**
   - DevTools > Application > Cookies
   - Verifique `rethread_admin_token`

2. **Endpoint `/auth/verify` funciona?**
   ```bash
   curl http://localhost:3001/api/auth/verify \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

3. **Middleware/Proxy verificando corretamente?**
   - Veja arquivo `proxy.ts`
   - Verifique se está fazendo request correto

---

## 🔄 Passos gerais de debug

### 1. Limpar cache e rebuild

```bash
# Pare o servidor (Ctrl+C)
rm -rf .next
npm run build
npm run dev
```

### 2. Verificar logs do terminal

Ao rodar `npm run dev`, veja se há erros no terminal.

### 3. Verificar variáveis de ambiente

```bash
# Ver variáveis carregadas
cat .env.local
```

Lembre-se: **Sempre reinicie o servidor Next.js após mudar `.env.local`**

### 4. Modo de desenvolvimento vs Produção

Em desenvolvimento (`npm run dev`), erros são mais verbosos.
Em produção (`npm run build && npm start`), erros são suprimidos.

**Use modo dev para debug!**

---

## 🆘 Checklist Rápido

Quando algo não funciona:

- [ ] Backend está rodando?
- [ ] `.env.local` tem URL correta com `/api`?
- [ ] Reiniciei o Next.js após mudar `.env.local`?
- [ ] CORS está configurado no backend?
- [ ] Endpoint retorna JSON no formato correto?
- [ ] Console do browser mostra algum erro?
- [ ] Network tab mostra requisições falhando?

---

## 📞 Endpoints que DEVEM funcionar

Para a aplicação funcionar, estes endpoints são **obrigatórios**:

### Públicos:
- ✅ `GET /api/products` - Listar produtos
- ✅ `GET /api/products/:id` - Ver produto específico
- ✅ `POST /api/auth/login` - Login admin

### Protegidos (com token):
- ✅ `GET /api/auth/verify` - Verificar token
- ✅ `POST /api/products` - Criar produto
- ✅ `PUT /api/products/:id` - Atualizar produto
- ✅ `DELETE /api/products/:id` - Deletar produto

---

## 💡 Dicas

1. **Use ferramentas de teste de API:**
   - Postman
   - Insomnia
   - Thunder Client (VS Code extension)
   - curl / Invoke-WebRequest

2. **Olhe sempre os logs:**
   - Terminal do frontend
   - Terminal do backend
   - Console do browser

3. **Teste incrementalmente:**
   - Primeiro: backend responde?
   - Segundo: frontend consegue chamar?
   - Terceiro: dados aparecem na tela?

4. **CORS é comum:**
   - 90% dos problemas de integração são CORS
   - Configure corretamente no backend

---

## 🔍 Como identificar o problema

```
Erro ECONNREFUSED → Backend não está rodando
Erro CORS           → Backend não permite origem do frontend
Erro 404            → Endpoint não existe (URL errada)
Erro 401            → Não autenticado (token inválido/ausente)
Erro 500            → Erro no servidor backend
Erro de parsing     → Resposta não é JSON válido
```

---

**Se o problema persistir, verifique:**
1. Logs do backend
2. Documentação do seu backend
3. BACKEND_SPEC.md para formato esperado
