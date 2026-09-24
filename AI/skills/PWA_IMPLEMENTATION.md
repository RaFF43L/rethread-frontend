# PWA - Segunda Aura Brechó

## 🚀 Implementação PWA Completa

O app agora está totalmente otimizado como **Progressive Web App (PWA)** com identidade visual forte e design mobile-first.

### ✨ Melhorias Implementadas

#### 1. **Identidade Visual com Logo**
- ✅ Logo SVG da Segunda Aura adicionado no header
- ✅ Design mobile-first com logo responsivo (11px mobile → 14px desktop)
- ✅ Cores da marca (#D4988C coral, #8B9D7C olive, #F5F1E8 cream)
- ✅ Header sticky otimizado para navegação mobile

#### 2. **URL Pré-assinada do S3**
- ✅ Backend agora retorna `imageUrl` pré-assinada
- ✅ Adapter atualizado para priorizar `imageUrl`
- ✅ Fallback para construção de URL quando necessário
- ✅ Next.js configurado para aceitar imagens de `localhost:4566` (LocalStack S3)

#### 3. **PWA Manifest**
Arquivo `public/manifest.json` criado com:
- Nome: "Segunda Aura Brechó"
- Theme color: #D4988C (coral)
- Background: #F5F1E8 (cream)
- Display: standalone (modo app nativo)
- Ícone SVG adaptativo

#### 4. **Otimizações Mobile**

**Header:**
- Altura reduzida em mobile
- Logo + texto compacto
- Admin link oculto em telas muito pequenas
- Sticky com backdrop blur

**Hero Section:**
- Tamanhos de fonte responsivos (2xl → 3xl → 5xl)
- Padding ajustado para mobile (py-8 → py-16)
- Texto otimizado para leitura em telas pequenas

**Grid de Produtos:**
- Mobile: 1 coluna
- Tablet: 2 colunas (sm:)
- Desktop: 3 colunas (lg:)
- XL: 4 colunas (xl:)
- Gap reduzido em mobile (gap-4 → gap-6)

**Cards de Produto:**
- Altura de imagem responsiva (h-56 mobile → h-64 desktop)
- Padding interno ajustado (p-3 → p-4)
- Tamanhos de badge menores em mobile
- Botão WhatsApp otimizado para toque
- Layout flex com mt-auto para preço

#### 5. **Metadados e SEO**
- ✅ Título atualizado: "Segunda Aura Brechó - Moda Sustentável"
- ✅ Descrição otimizada para brechó
- ✅ Theme color definido (#D4988C)
- ✅ Viewport configurado (escala 1-5)
- ✅ Apple Web App capable
- ✅ Favicon SVG
- ✅ Apple touch icon

#### 6. **Configuração de Imagens**
`next.config.ts` atualizado para permitir:
```typescript
remotePatterns: [
  { hostname: 'localhost', port: '3001' },    // Backend direto
  { hostname: 'localhost', port: '4566' },    // LocalStack S3
]
```

### 📱 Como Testar PWA

#### Desktop:
1. Abra Chrome/Edge
2. Acesse http://localhost:3000
3. Clique nos 3 pontos → "Instalar Segunda Aura..."
4. App será instalado como aplicativo standalone

#### Mobile (via DevTools):
1. Abra DevTools (F12)
2. Clique no ícone de dispositivo móvel
3. Selecione um dispositivo (iPhone, Galaxy, etc)
4. Teste navegação touch
5. Application tab → Manifest para ver configurações PWA

### 🎨 Design Tokens

**Cores CSS:**
```css
--coral: #D4988C (primário)
--olive: #8B9D7C (secundário)
--cream: #F5F1E8 (background)
```

**Classes Tailwind:**
- `text-coral` / `bg-coral`
- `text-olive` / `bg-olive`
- `text-cream` / `bg-cream`

**Breakpoints:**
- `sm:` 640px (tablet pequeno)
- `md:` 768px (tablet)
- `lg:` 1024px (desktop)
- `xl:` 1280px (desktop grande)

### ✅ Checklist PWA

- ✅ Logo SVG no header
- ✅ Manifest.json configurado
- ✅ Theme color definido
- ✅ Viewport otimizado
- ✅ Mobile-first design
- ✅ Imagens responsivas
- ✅ Touch targets adequados (min 44x44px)
- ✅ Header sticky
- ✅ Grid flexível
- ✅ Tamanhos de fonte escaláveis
- ✅ URLs de imagem S3 pré-assinadas
- ✅ Next.js image optimization
- ✅ Apple Web App meta tags

### 🚀 Próximos Passos (Opcional)

1. **Service Worker:**
   - Cache de produtos para offline
   - Background sync
   - Push notifications

2. **Performance:**
   - Lazy loading de imagens
   - Code splitting
   - Preload de recursos críticos

3. **Recursos PWA Avançados:**
   - Share API para compartilhar produtos
   - Web Share Target
   - Badging API para notificações
   - Install prompt customizado

### 📊 Estrutura de Arquivos

```
public/
├── logo-segunda-aura.svg     # Logo principal
└── manifest.json              # PWA manifest

app/
├── layout.tsx                 # Meta tags PWA
└── page.tsx                   # Home com logo no header

features/produtos/
├── components/
│   ├── ProdutoCard.tsx       # Responsivo mobile
│   └── ProdutosList.tsx      # Grid flexível
└── services/
    └── produtos.service.ts    # Adapter com imageUrl

next.config.ts                 # Imagens LocalStack S3
```

---

**Segunda Aura Brechó** - Agora como PWA! 📱✨
