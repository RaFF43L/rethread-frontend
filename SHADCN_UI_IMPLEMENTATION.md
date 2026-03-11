# Implementação do Shadcn/ui - Segunda Aura Brechó

## 🎨 Identidade Visual

O projeto foi estilizado com a identidade visual da **Segunda Aura Brechó**, aplicando as cores da marca em todo o sistema.

### Paleta de Cores

- **Rosa/Coral**: `#D4988C` - Cor primária da marca
- **Verde Oliva**: `#8B9D7C` - Cor secundária
- **Bege/Cream**: `#F5F1E8` - Cor de fundo e destaque

## 📦 Dependências Instaladas

```json
{
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "lucide-react": "^0.469.0",
  "@radix-ui/react-slot": "^1.1.1"
}
```

## 🎯 Componentes Shadcn/ui Criados

### 1. **Button** (`shared/components/ui/button.tsx`)
Componente de botão com múltiplas variantes:
- `default` - Coral/Rosa (cor primária)
- `secondary` - Verde Oliva
- `outline` - Contorno
- `ghost` - Sem fundo
- `link` - Estilo de link
- `destructive` - Vermelho para ações destrutivas

Tamanhos: `sm`, `default`, `lg`, `icon`

### 2. **Card** (`shared/components/ui/card.tsx`)
Componente de cartão com partes:
- `Card` - Container principal
- `CardHeader` - Cabeçalho
- `CardTitle` - Título
- `CardDescription` - Descrição
- `CardContent` - Conteúdo
- `CardFooter` - Rodapé

### 3. **Badge** (`shared/components/ui/badge.tsx`)
Componente de distintivo/etiqueta:
- `default` - Coral/Rosa
- `secondary` - Verde Oliva
- `outline` - Contorno
- `destructive` - Vermelho
- `success` - Verde (customizado)

### 4. **Input** (`shared/components/ui/input.tsx`)
Campo de entrada de texto estilizado

### 5. **Label** (`shared/components/ui/label.tsx`)
Rótulo para campos de formulário

## 🎨 Configuração do Tema

### Tailwind CSS 4 (globals.css)

O projeto usa o novo **Tailwind CSS v4** com configuração inline via `@theme`:

```css
:root {
  /* Cores da Segunda Aura Brechó */
  --background: #F5F1E8;
  --foreground: #2D2D2D;
  
  --coral: #D4988C;
  --coral-light: #E5AFA6;
  --coral-dark: #C37D6F;
  
  --olive: #8B9D7C;
  --olive-light: #A4B896;
  --olive-dark: #6F8163;
  
  --cream: #F5F1E8;
  --cream-light: #FAF8F3;
  --cream-dark: #E8E1D3;
  
  --primary: #D4988C;    /* Coral */
  --secondary: #8B9D7C;  /* Olive */
  --accent: #D4988C;
  
  /* Mais variáveis... */
}
```

### Modo Escuro

O tema também inclui suporte para modo escuro com cores ajustadas.

## 🔄 Componentes Refatorados

### 1. **ProdutoCard**
- ✅ Usa `Card`, `CardContent`, `CardFooter`
- ✅ Usa `Button` para ação do WhatsApp
- ✅ Usa `Badge` para status (Disponível/Indisponível)
- ✅ Cores da marca aplicadas
- ✅ Ícones do Lucide React (MessageCircle)
- ✅ Efeito hover com scale na imagem
- ✅ Cor oficial do WhatsApp: `#25D366`

### 2. **Página Principal (app/page.tsx)**
- ✅ Nome alterado de "ReThread" para "Segunda Aura Brechó"
- ✅ Header com branding da Segunda Aura
- ✅ Hero section com gradiente coral/olive
- ✅ Background em bege/cream
- ✅ Footer em verde oliva
- ✅ Carregamento com spinner nas cores da marca

### 3. **Login Page (app/login/page.tsx)**
- ✅ Usa `Card` para container
- ✅ Usa `Input`, `Label` para campos
- ✅ Usa `Button` para submit
- ✅ Background gradiente cream/coral
- ✅ Ícones do Lucide (AlertCircle, ArrowLeft, Loader2)
- ✅ Branding "Segunda Aura Brechó"

### 4. **AdminNav**
- ✅ Usa `Button` para navegação
- ✅ Usa `Badge` para identificar área admin
- ✅ Ícones do Lucide (LayoutDashboard, Package, ExternalLink, LogOut)
- ✅ Cores da marca aplicadas
- ✅ Estados ativos com destaque

### 5. **Dashboard Admin**
- ✅ Usa `Card` para estatísticas
- ✅ Usa `Button` para ações rápidas
- ✅ Ícones do Lucide (Package, CheckCircle2, XCircle, DollarSign, Plus, List, Eye)
- ✅ Cards com hover effect
- ✅ Cores da marca nos indicadores

### 6. **Pagination**
- ✅ Usa `Button` para navegação
- ✅ Ícones ChevronLeft/ChevronRight
- ✅ Estados disabled estilizados
- ✅ Botão ativo com destaque coral

## 🛠️ Utilitários

### `shared/lib/utils.ts`
Função `cn()` para mesclar classes Tailwind:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 📱 Responsividade

Todos os componentes são totalmente responsivos:
- Mobile-first design
- Breakpoints: `sm`, `md`, `lg`
- Grid adaptativo
- Navegação mobile-friendly

## 🎭 Animações e Transições

- **Hover effects**: Scale, shadow, color change
- **Loading states**: Spinners animados
- **Transições suaves**: 200-300ms
- **Transform effects**: Scale nas imagens

## 🌈 Classes Tailwind Customizadas

Você pode usar as cores da marca diretamente:

```jsx
// Cores
className="bg-coral text-coral"
className="bg-olive text-olive"
className="bg-cream text-cream"

// Variações
className="bg-coral-light bg-coral-dark"
className="bg-olive-light bg-olive-dark"
className="bg-cream-light bg-cream-dark"

// Cores do sistema
className="bg-primary text-primary"
className="bg-secondary text-secondary"
```

## 📋 Checklist de Implementação

- ✅ Instalação de dependências
- ✅ Configuração do tema no globals.css
- ✅ Criação de componentes base (Button, Card, Badge, Input, Label)
- ✅ Refatoração do ProdutoCard
- ✅ Refatoração da página principal
- ✅ Refatoração da página de login
- ✅ Refatoração do AdminNav
- ✅ Refatoração do Dashboard
- ✅ Refatoração da Pagination
- ✅ Aplicação da identidade visual completa
- ✅ Teste de erros (nenhum erro encontrado)

## 🚀 Próximos Passos (Opcional)

1. **Formulários CRUD**
   - Criar/editar produtos com Shadcn forms
   - Adicionar componentes Select, Textarea, Checkbox

2. **Componentes Adicionais**
   - Dialog para modais
   - Sheet para sidebars
   - Dropdown Menu
   - Toast para notificações

3. **Upload de Imagens**
   - Componente de upload estilizado
   - Preview de imagens
   - Drag and drop

4. **Tabelas**
   - Componente Table do Shadcn
   - Sorting e filtering

## 📚 Recursos

- [Shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI](https://www.radix-ui.com/)

---

**Segunda Aura Brechó** - Moda sustentável com estilo único ♻️✨
