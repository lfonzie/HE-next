# Design System Mobile-First - HubEdu.ia

Sistema de design responsivo otimizado para mobile e desktop, implementando as melhores práticas de UX/UI modernas.

## 🎯 Princípios Fundamentais

### 1. Mobile-First
- **Defina estilos para telas pequenas primeiro**
- **Adicione refinamentos em breakpoints maiores** (`sm`, `md`, `lg`)
- **Quebre por conteúdo, não por device**

```tsx
// ❌ Desktop-first
<div className="grid grid-cols-3 md:grid-cols-1 gap-8 md:gap-4">

// ✅ Mobile-first  
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
```

### 2. Tipografia Fluida
Sistema baseado em `clamp()` que escala automaticamente:

```css
:root {
  --step-0:  clamp(1rem, 0.95rem + 0.4vw, 1.125rem);    /* body */
  --step-1:  clamp(1.125rem, 1rem + 0.5vw, 1.25rem);   /* large body */
  --step-2:  clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);   /* h4 */
  --step-3:  clamp(1.5rem, 1.2rem + 1vw, 2rem);       /* h3 */
  --step-4:  clamp(2rem, 1.6rem + 1.6vw, 2.75rem);    /* h2 */
  --step-5:  clamp(2.5rem, 2rem + 2vw, 3.5rem);       /* h1 */
}
```

### 3. Espaçamento Adaptativo
Escala fluida que se adapta ao tamanho da tela:

```css
:root {
  --space-xs: clamp(0.25rem, 0.2rem + 0.2vw, 0.375rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.4vw, 0.75rem);
  --space-md: clamp(1rem, 0.8rem + 0.8vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
  --space-xl: clamp(2rem, 1.6rem + 1.6vw, 3rem);
}
```

## 🧩 Componentes Disponíveis

### ResponsiveContainer
Container que se adapta automaticamente:

```tsx
<ResponsiveContainer size="lg" padding="md">
  <h1 className="type-h1">Conteúdo</h1>
</ResponsiveContainer>
```

**Props:**
- `size`: `xs` | `sm` | `md` | `lg` | `xl` | `2xl`
- `padding`: `none` | `sm` | `md` | `lg`

### ResponsiveGrid
Grid que se adapta ao conteúdo:

```tsx
<ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
  {items.map(item => <Card key={item.id} {...item} />)}
</ResponsiveGrid>
```

### ResponsiveButton
Botões com tap targets adequados (44x44px mínimo):

```tsx
<ResponsiveButton 
  variant="primary" 
  size="md" 
  fullWidth
  loading={isLoading}
>
  Ação Principal
</ResponsiveButton>
```

**Props:**
- `variant`: `primary` | `secondary` | `outline` | `ghost` | `destructive`
- `size`: `sm` | `md` | `lg`
- `fullWidth`: boolean
- `loading`: boolean

### ResponsiveImage
Imagens otimizadas com lazy loading:

```tsx
<ResponsiveImage
  src="/hero.jpg"
  alt="Hero image"
  aspectRatio="video"
  width={1200}
  height={600}
  priority
/>
```

**Props:**
- `aspectRatio`: `square` | `video` | `portrait` | `landscape` | `auto`
- `priority`: boolean (para imagens acima do fold)
- `loading`: `lazy` | `eager`

### ResponsiveCard
Cards com padding e espaçamento responsivos:

```tsx
<ResponsiveCard variant="elevated" padding="md">
  <h3 className="type-h4">Título</h3>
  <p className="type-body">Conteúdo do card</p>
</ResponsiveCard>
```

## 📱 Safe Areas

Suporte automático para notch, ilhas dinâmicas e gestos:

```tsx
// Header com safe area
<header className="fixed top-0 safe-top">

// Footer com safe area  
<footer className="safe-bottom">

// Todas as direções
<div className="safe-all">
```

**Classes disponíveis:**
- `.safe-top` - Respeita notch/ilha superior
- `.safe-bottom` - Respeita gestos inferiores
- `.safe-left` - Respeita gestos laterais
- `.safe-right` - Respeita gestos laterais
- `.safe-all` - Todas as direções

## 🎨 Classes de Tipografia

```tsx
<h1 className="type-display">Display Text</h1>
<h1 className="type-h1">Heading 1</h1>
<h2 className="type-h2">Heading 2</h2>
<h3 className="type-h3">Heading 3</h3>
<h4 className="type-h4">Heading 4</h4>
<p className="type-body-lg">Body Large</p>
<p className="type-body">Body Text</p>
<p className="type-small">Small Text</p>
<p className="type-caption">Caption</p>
```

## 📏 Classes de Espaçamento

```tsx
// Margens fluidas
<div className="space-fluid-md">

// Gaps fluidos
<div className="gap-fluid-lg">

// Containers fluidos
<div className="container-fluid-lg">
```

## ⚡ Performance

### Otimizações Implementadas

1. **Tipografia Fluida**: Elimina media queries desnecessárias
2. **Lazy Loading**: Imagens carregam apenas quando necessário
3. **Blur Placeholder**: Evita layout shift durante carregamento
4. **Tap Targets**: Mínimo 44x44px para facilitar toque
5. **Safe Areas**: Layout sempre visível em dispositivos móveis
6. **Min-h-dvh**: Viewport dinâmico que respeita teclado

### Configurações Viewport

```tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,        // Permite zoom
  userScalable: true,     // Acessibilidade
  themeColor: '#ffd233',
  colorScheme: 'light',
}
```

## 🔧 Configuração Tailwind

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'step--2': 'var(--step--2)',
        'step--1': 'var(--step--1)',
        'step-0': 'var(--step-0)',
        'step-1': 'var(--step-1)',
        'step-2': 'var(--step-2)',
        'step-3': 'var(--step-3)',
        'step-4': 'var(--step-4)',
        'step-5': 'var(--step-5)',
        'step-6': 'var(--step-6)',
      },
      spacing: {
        'fluid-xs': 'var(--space-xs)',
        'fluid-sm': 'var(--space-sm)',
        'fluid-md': 'var(--space-md)',
        'fluid-lg': 'var(--space-lg)',
        'fluid-xl': 'var(--space-xl)',
        'fluid-2xl': 'var(--space-2xl)',
        'fluid-3xl': 'var(--space-3xl)',
      },
      maxWidth: {
        'container-xs': 'var(--container-xs)',
        'container-sm': 'var(--container-sm)',
        'container-md': 'var(--container-md)',
        'container-lg': 'var(--container-lg)',
        'container-xl': 'var(--container-xl)',
        'container-2xl': 'var(--container-2xl)',
      },
    },
  },
}
```

## 📋 Checklist de QA

### Tipografia
- [ ] Body em 16-18px base
- [ ] Measure ≤ 65ch para texto longo
- [ ] `tracking-tight` apenas em títulos
- [ ] Contraste adequado em telas pequenas

### Espaçamento
- [ ] Teste em 320px, 375px, 393px, 430px
- [ ] Teste em 768px, 1024px, 1280px, 1440px
- [ ] Espaçamento consistente entre elementos

### Interação
- [ ] Todos os botões 44×44px mínimo
- [ ] Teclado não cobre CTAs importantes
- [ ] Scroll suave entre seções
- [ ] Estados de toque visíveis

### Safe Areas
- [ ] iPhone com notch
- [ ] Android com gestos
- [ ] Layout sempre visível
- [ ] Conteúdo não cortado

### Performance
- [ ] Lighthouse Mobile ≥ 90
- [ ] Imagens otimizadas com `sizes`
- [ ] Lazy loading implementado
- [ ] Scripts não utilizados removidos

## 🚀 Exemplo Completo

```tsx
export default function HomePage() {
  return (
    <div className="min-h-dvh">
      {/* Header com safe area */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-md safe-top">
        <ResponsiveContainer size="lg" padding="md">
          <div className="flex items-center justify-between py-4">
            <h1 className="type-h3 font-bold">Logo</h1>
            <ResponsiveButton size="sm">Menu</ResponsiveButton>
          </div>
        </ResponsiveContainer>
      </header>

      {/* Main content */}
      <main className="py-8">
        <ResponsiveContainer size="lg" padding="md">
          <div className="space-y-12">
            {/* Hero section */}
            <section className="text-center space-y-6">
              <h1 className="type-display font-bold">
                Título Principal
              </h1>
              <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
                Subtítulo com largura de linha confortável para leitura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ResponsiveButton size="lg">Ação Principal</ResponsiveButton>
                <ResponsiveButton size="lg" variant="outline">Ação Secundária</ResponsiveButton>
              </div>
            </section>

            {/* Grid de cards */}
            <section>
              <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
                {items.map(item => (
                  <ResponsiveCard key={item.id} variant="elevated" padding="md">
                    <h3 className="type-h4 font-semibold">{item.title}</h3>
                    <p className="type-body text-muted-foreground">{item.description}</p>
                    <ResponsiveButton size="sm" className="mt-4">Ver Mais</ResponsiveButton>
                  </ResponsiveCard>
                ))}
              </ResponsiveGrid>
            </section>
          </div>
        </ResponsiveContainer>
      </main>

      {/* Footer com safe area */}
      <footer className="border-t py-8 safe-bottom">
        <ResponsiveContainer size="lg" padding="md">
          <p className="type-small text-muted-foreground text-center">
            © 2025 HubEdu.ia
          </p>
        </ResponsiveContainer>
      </footer>
    </div>
  );
}
```

## 📚 Recursos Adicionais

- [Página de Demonstração](/responsive-demo) - Veja todos os componentes em ação
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Next.js Image](https://nextjs.org/docs/api-reference/next/image) - Otimização de imagens
- [CSS Clamp](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp) - Função CSS para valores fluidos

---

**Desenvolvido com ❤️ para HubEdu.ia**
