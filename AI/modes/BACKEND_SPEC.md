# Especificação do Backend - ReThread API

Este documento descreve os endpoints esperados pelo frontend.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Todas as rotas administrativas requerem um token JWT no header:

```
Authorization: Bearer {token}
```

---

## Endpoints

### 1. Autenticação

#### POST `/auth/login`

Login de administrador.

**Request:**
```json
{
  "email": "admin@rethread.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@rethread.com",
    "nome": "Admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Credenciais inválidas
- `400` - Dados inválidos

---

#### GET `/auth/verify`

Verifica se o token é válido (rota protegida).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "admin@rethread.com",
    "nome": "Admin",
    "role": "admin"
  }
}
```

**Errors:**
- `401` - Token inválido ou expirado

---

### 2. Produtos

#### GET `/products`

Lista todos os produtos com paginação (rota pública).

**Query Parameters:**
- `page` (opcional) - Número da página (default: 1)
- `limit` (opcional) - Itens por página (default: 12)
- `categoria` (opcional) - Filtrar por categoria
- `cor` (opcional) - Filtrar por cor

**Example:**
```
GET /products?page=1&limit=12&categoria=camisetas
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Camiseta Básica Preta",
      "descricao": "Camiseta 100% algodão, confortável e durável",
      "preco": 49.90,
      "cor": "Preto",
      "imagem": "https://example.com/images/camiseta-preta.jpg",
      "categoria": "Camisetas",
      "tamanho": "M",
      "disponivel": true,
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "uuid2",
      "nome": "Calça Jeans Slim",
      "descricao": "Calça jeans com corte moderno",
      "preco": 129.90,
      "cor": "Azul",
      "imagem": "https://example.com/images/calca-jeans.jpg",
      "categoria": "Calças",
      "tamanho": "38",
      "disponivel": true,
      "createdAt": "2026-01-16T14:20:00Z",
      "updatedAt": "2026-01-16T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

---

#### GET `/products/:id`

Busca um produto específico por ID (rota pública).

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "Camiseta Básica Preta",
  "descricao": "Camiseta 100% algodão, confortável e durável",
  "preco": 49.90,
  "cor": "Preto",
  "imagem": "https://example.com/images/camiseta-preta.jpg",
  "categoria": "Camisetas",
  "tamanho": "M",
  "disponivel": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

**Errors:**
- `404` - Produto não encontrado

---

#### POST `/products` 🔒

Cria um novo produto (rota protegida - admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "nome": "Camiseta Básica Branca",
  "descricao": "Camiseta 100% algodão",
  "preco": 49.90,
  "cor": "Branco",
  "imagem": "https://example.com/images/camiseta-branca.jpg",
  "categoria": "Camisetas",
  "tamanho": "M",
  "disponivel": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nome": "Camiseta Básica Branca",
  "descricao": "Camiseta 100% algodão",
  "preco": 49.90,
  "cor": "Branco",
  "imagem": "https://example.com/images/camiseta-branca.jpg",
  "categoria": "Camisetas",
  "tamanho": "M",
  "disponivel": true,
  "createdAt": "2026-01-17T09:15:00Z",
  "updatedAt": "2026-01-17T09:15:00Z"
}
```

**Errors:**
- `400` - Dados inválidos
- `401` - Não autenticado

---

#### PUT `/products/:id` 🔒

Atualiza um produto existente (rota protegida - admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Request (parcial):**
```json
{
  "preco": 39.90,
  "disponivel": false
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "Camiseta Básica Branca",
  "descricao": "Camiseta 100% algodão",
  "preco": 39.90,
  "cor": "Branco",
  "imagem": "https://example.com/images/camiseta-branca.jpg",
  "categoria": "Camisetas",
  "tamanho": "M",
  "disponivel": false,
  "createdAt": "2026-01-17T09:15:00Z",
  "updatedAt": "2026-01-17T10:30:00Z"
}
```

**Errors:**
- `404` - Produto não encontrado
- `400` - Dados inválidos
- `401` - Não autenticado

---

#### DELETE `/products/:id` 🔒

Deleta um produto (rota protegida - admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204):**
```
No Content
```

**Errors:**
- `404` - Produto não encontrado
- `401` - Não autenticado

---

## Formato de Erros

Todos os erros seguem o formato:

```json
{
  "message": "Mensagem de erro legível",
  "statusCode": 400,
  "errors": {
    "field": ["Erro específico do campo"]
  }
}
```

---

## Cores Suportadas

As cores devem ser nomes válidos em português ou valores hexadecimais:

- Preto / #000000
- Branco / #FFFFFF
- Azul / #0000FF
- Vermelho / #FF0000
- Verde / #00FF00
- Amarelo / #FFFF00
- Rosa / #FF69B4
- Roxo / #800080
- Cinza / #808080
- Marrom / #8B4513

---

## Exemplos de Upload de Imagem

O frontend espera URLs completas para as imagens. O backend pode:

1. Armazenar imagens localmente e servir via URL estática
2. Usar serviços de storage (AWS S3, Cloudinary, etc)
3. Aceitar URLs externas

Exemplo de resposta esperada:
```json
{
  "imagem": "https://seu-backend.com/uploads/produtos/imagem.jpg"
}
```

---

## Notas Importantes

1. **CORS**: O backend deve permitir requisições do frontend (localhost:3000 em dev)
2. **JWT**: Tokens devem ter expiração configurável
3. **Validações**: Todos os campos obrigatórios devem ser validados
4. **Imagens**: URLs devem ser válidas e acessíveis
5. **Paginação**: Sempre retornar metadados de paginação

---

## Exemplo de Configuração CORS (Express.js)

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```
