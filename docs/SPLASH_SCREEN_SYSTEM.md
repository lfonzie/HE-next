# Sistema de Loading Global HubEdu.ia

## Visão Geral

Sistema completo de loading/splash screen com tema HubEdu.ia (fundo escuro, letras amarelas) usando React TSX + Tailwind + Framer Motion. Funciona como overlay global PWA-friendly com badge de estado online/offline, barra de progresso e intro rápido para modo standalone.

## Características

- ✅ **Tema HubEdu.ia**: Fundo escuro com letras amarelas
- ✅ **Ícones SVG**: Substitui emojis por ícones profissionais
- ✅ **Framer Motion**: Animações suaves e modernas
- ✅ **PWA Ready**: Detecta modo standalone automaticamente
- ✅ **Loading Global**: Overlay que funciona em toda a aplicação
- ✅ **Progresso Real**: Suporte a barras de progresso 0-100%
- ✅ **Acessibilidade**: ARIA labels e suporte a screen readers
- ✅ **Responsivo**: Funciona em mobile e desktop

## Como Usar

### 1. Configuração no Layout (já feito)

O sistema já está integrado no `app/layout.tsx`:

```tsx
import { LoadingProvider, LoadingOverlay, RouteLoadingGlue } from '@/components/ui/SplashScreen'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <LoadingProvider>
          <RouteLoadingGlue />
          <LoadingOverlay />
          {children}
        </LoadingProvider>
      </body>
    </html>
  )
}
```

### 2. Uso Programático em Componentes

```tsx
"use client";
import { useAsyncLoader, useLoading } from "@/components/ui/SplashScreen";

export default function MeuComponente() {
  const { withLoading } = useAsyncLoader();
  const { startLoading, stopLoading, updateProgress } = useLoading();

  // Loading simples
  async function operacaoSimples() {
    await withLoading(async () => {
      const response = await fetch("/api/dados");
      return response.json();
    }, "Carregando dados...");
  }

  // Loading com progresso
  async function operacaoComProgresso() {
    startLoading("Processando...", true);
    
    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(i, `Processando... ${i}%`);
      }
    } finally {
      stopLoading();
    }
  }

  return (
    <div>
      <button onClick={operacaoSimples}>Operação Simples</button>
      <button onClick={operacaoComProgresso}>Operação com Progresso</button>
    </div>
  );
}
```

### 3. Loading entre Rotas

Crie `app/loading.tsx` (já criado):

```tsx
import { LoadingCard } from '@/components/ui/loading'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoadingCard 
        message="Carregando página..."
        variant="ring"
        size="lg"
      />
    </div>
  )
}
```

## Componentes Disponíveis

### SplashScreen
Tela de splash inicial com animações e informações do HubEdu.ia.

```tsx
import { SplashScreen } from '@/components/ui/SplashScreen'

<SplashScreen 
  onComplete={() => console.log('Splash completo')}
  minDisplayTime={2000}
  showIntro={true}
/>
```

### LoadingOverlay
Overlay global para operações assíncronas.

```tsx
import { LoadingOverlay } from '@/components/ui/SplashScreen'

// Já incluído no layout, mas pode ser usado individualmente
<LoadingOverlay />
```

### RouteLoadingGlue
Integração automática com mudanças de rota.

```tsx
import { RouteLoadingGlue } from '@/components/ui/SplashScreen'

// Já incluído no layout
<RouteLoadingGlue />
```

## Hooks Disponíveis

### useLoading
Hook principal para controle de loading.

```tsx
const { 
  isLoading, 
  message, 
  progress, 
  startLoading, 
  updateProgress, 
  stopLoading, 
  setMessage 
} = useLoading();
```

### useAsyncLoader
Hook para operações assíncronas com loading automático.

```tsx
const { withLoading } = useAsyncLoader();

await withLoading(async () => {
  // Sua operação assíncrona aqui
}, "Mensagem de loading");
```

## Personalização

### Cores
O sistema usa as cores do tema HubEdu.ia definidas no Tailwind:
- `bg-gray-900`: Fundo escuro
- `text-yellow-400`: Texto principal amarelo
- `text-yellow-300`: Texto secundário
- `border-yellow-400`: Bordas amarelas

### Animações
Todas as animações são feitas com Framer Motion e podem ser customizadas:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Conteúdo animado
</motion.div>
```

### Mensagens
Personalize as mensagens de loading:

```tsx
startLoading("Sua mensagem personalizada");
updateProgress(50, "Processando dados...");
```

## PWA e Standalone

O sistema detecta automaticamente quando está rodando em modo PWA e mostra uma mensagem de boas-vindas:

```tsx
{isStandalone && showIntro && (
  <motion.div className="mt-8 text-yellow-200/60 text-xs">
    Bem-vindo ao HubEdu.ia
  </motion.div>
)}
```

## Acessibilidade

- `role="status"` para screen readers
- `aria-live="polite"` para atualizações
- `aria-label` descritivo
- Contraste adequado para leitura
- Suporte a `prefers-reduced-motion`

## Exemplo Completo

Veja o arquivo `components/examples/LoadingExample.tsx` para um exemplo completo de uso.

## Troubleshooting

### Loading não aparece
- Verifique se o `LoadingProvider` está envolvendo sua aplicação
- Confirme se o componente está usando `"use client"`

### Animações não funcionam
- Verifique se o Framer Motion está instalado
- Confirme se não há conflitos de CSS

### PWA não detecta standalone
- Verifique se o manifest.json está configurado
- Teste em um dispositivo real, não apenas no navegador

## Performance

- Animações são otimizadas para 60fps
- Loading overlay usa `backdrop-blur` para performance
- Componentes são lazy-loaded quando possível
- Suporte a `prefers-reduced-motion` para acessibilidade
