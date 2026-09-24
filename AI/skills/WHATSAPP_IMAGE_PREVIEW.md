# 🖼️ WhatsApp Image Preview - Guia de Implementação

## ❌ Problema

WhatsApp **não mostra preview de URLs pré-assinadas** do S3 porque elas contêm query parameters:

```
❌ Não funciona no WhatsApp:
https://bucket.s3.amazonaws.com/product.jpeg?X-Amz-Signature=abc123...

✅ Funciona no WhatsApp:
https://bucket.s3.amazonaws.com/product.jpeg
https://cdn.seuloja.com/product.jpeg
```

---

## 🔧 Soluções (Escolha Uma)

### **Opção 1: Bucket S3 Público** ⭐ Recomendada para Brechó

**Quando usar:** Imagens de produtos não são sensíveis (brechó, e-commerce)

#### Configuração no AWS Console:

1. **Abrir S3 Console:**
   ```
   https://s3.console.aws.amazon.com/
   ```

2. **Selecionar bucket `rethread-prod`**

3. **Permissions → Block public access**
   - Desmarcar "Block all public access"
   - Salvar

4. **Permissions → Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::rethread-prod/products/*"
       }
     ]
   }
   ```

5. **Testar URL direta:**
   ```bash
   curl https://rethread-prod.s3.us-east-1.amazonaws.com/products/xxx.jpeg
   ```

#### Backend: Parar de gerar URLs pré-assinadas

No seu backend NestJS, retorne URL direta:

```typescript
// ❌ Antes (pré-assinada):
const imageUrl = await this.s3.getSignedUrlPromise('getObject', {
  Bucket: 'rethread-prod',
  Key: `products/${filename}`,
  Expires: 3600
});

// ✅ Depois (direta):
const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/products/${filename}`;
```

**Prós:**
- ✅ Simples e rápido
- ✅ WhatsApp mostra preview
- ✅ URLs permanentes (sem expirar)
- ✅ Cache melhor (CDN)

**Contras:**
- ⚠️ Imagens ficam públicas (qualquer um com URL pode acessar)
- ⚠️ Sem controle de acesso granular

---

### **Opção 2: CloudFront + URL Limpa** 🚀 Profissional

**Quando usar:** Precisa de URLs limpas MAS com controle de acesso

#### Configuração:

1. **Criar CloudFront Distribution:**
   - Origin: Seu bucket S3
   - Origin Access Identity (OAI)
   - Domain: `cdn.segundaaura.com.br`

2. **Configurar URLs limpas:**
   ```
   https://cdn.segundaaura.com.br/products/xxx.jpeg
   ```

3. **Segurança (opcional):**
   - Signed Cookies (ao invés de Signed URLs)
   - WAF para proteção
   - HTTPS obrigatório

4. **Backend retorna URL CloudFront:**
   ```typescript
   const imageUrl = `https://cdn.segundaaura.com.br/products/${filename}`;
   ```

**Prós:**
- ✅ URLs limpas (WhatsApp mostra preview)
- ✅ CDN global (mais rápido)
- ✅ Controle de acesso (se usar Signed Cookies)
- ✅ Domínio customizado

**Contras:**
- ⚠️ Configuração mais complexa
- ⚠️ Custo adicional (CloudFront)

---

### **Opção 3: Proxy no Backend** 🔄 Alternativa

**Quando usar:** Não pode/quer mudar S3, quer controle total

#### Criar endpoint no backend:

```typescript
// Backend: src/products/products.controller.ts
@Get('image/:id')
async getProductImage(
  @Param('id') id: string,
  @Res() res: Response
) {
  // Buscar produto no DB
  const product = await this.productsService.findOne(id);
  
  // Buscar imagem do S3
  const s3Object = await this.s3.getObject({
    Bucket: 'rethread-prod',
    Key: product.imageKey
  }).promise();
  
  // Retornar imagem diretamente
  res.set('Content-Type', 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=31536000');
  res.send(s3Object.Body);
}
```

#### Frontend usa URL do backend:

```typescript
// Frontend: produtos.service.ts
const imagemUrl = `${env.apiUrl}/products/image/${product.id}`;
```

**Prós:**
- ✅ URLs limpas: `https://api.seuloja.com/products/image/123`
- ✅ Controle total no backend
- ✅ Não precisa mudar S3

**Contras:**
- ⚠️ Backend vira proxy (mais carga)
- ⚠️ Sem CDN (a menos que use CloudFront na frente)
- ⚠️ Latência maior

---

## 📊 Comparação Rápida

| Solução | Complexidade | Preview WhatsApp | Segurança | Performance | Custo |
|---------|--------------|------------------|-----------|-------------|-------|
| **S3 Público** | 🟢 Baixa | ✅ Sim | ⚠️ Imagens públicas | 🟢 Boa | 💰 Baixo |
| **CloudFront** | 🟡 Média | ✅ Sim | ✅ Configurável | 🟢 Excelente | 💰💰 Médio |
| **Backend Proxy** | 🟡 Média | ✅ Sim | ✅ Total | 🔴 Regular | 💰 Baixo |

---

## ✅ Recomendação para Segunda Aura

Para um **brechó** (imagens de produtos não são sensíveis):

### **Use Opção 1: S3 Público**

**Motivos:**
1. Imagens de roupas não são informação sensível
2. Implementação em 5 minutos
3. WhatsApp mostra preview imediatamente
4. Menor custo
5. Melhor performance (S3 direto)

**Próximos passos:**
1. Configure bucket público (instruções acima)
2. Atualize backend para retornar URLs diretas
3. Teste enviando no WhatsApp

---

## 🔧 Implementação no Frontend (Já Feita)

Atualizei o código para remover query params:

```typescript
// shared/utils/format.ts
function cleanUrlForWhatsApp(url: string): string {
  const urlObj = new URL(url);
  return `${urlObj.origin}${urlObj.pathname}`; // Remove ?X-Amz-...
}
```

**Mas:** Isso sozinho não resolve! A URL sem query params retornará **403 Forbidden** do S3.

**Você PRECISA:**
- Tornar bucket público **OU**
- Usar CloudFront **OU**  
- Criar proxy no backend

---

## 🧪 Como Testar

### Antes de publicar:

```bash
# Teste se URL limpa funciona:
curl https://rethread-prod.s3.us-east-1.amazonaws.com/products/xxx.jpeg

# Se retornar 403: Bucket não está público
# Se retornar imagem: Pronto para WhatsApp!
```

### Depois de configurar:

1. Abra o site
2. Clique em "Chamar no WhatsApp"
3. Veja a mensagem com URL limpa
4. Cole no WhatsApp
5. **Deverá mostrar preview da imagem**

---

## 📞 Alternativa: Mandar Imagem Separada

Se preview não for crítico, você pode instruir o vendedor:

```
Mensagem automática:
"Olá! Tenho interesse no produto XYZ - R$ 299,99"

Vendedor responde:
*Envia foto manualmente*
```

Isso funciona mas é menos profissional.

---

## 🎯 Solução Rápida para AGORA

**Backend deve parar de usar URLs pré-assinadas:**

```typescript
// ❌ Remova isso:
s3.getSignedUrl(...)

// ✅ Use isso:
`https://rethread-prod.s3.us-east-1.amazonaws.com/products/${filename}`
```

**E configure bucket público nas Permissions.**

---

**Need help?** Me avise qual opção você escolheu que eu te ajudo a implementar! 🚀
