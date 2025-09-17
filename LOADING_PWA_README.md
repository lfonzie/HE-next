# Sistema de Loading e PWA - HubEdu.ia

Este documento descreve como usar o sistema de loading e PWA implementado no HubEdu.ia.

## 🎯 Sistema de Loading

### Componentes Disponíveis

#### 1. LoadingScreen (Tela Completa)
```tsx
import { LoadingScreen, useLoadingScreen } from '@/components/ui/LoadingScreen';

function MyComponent() {
  const { isLoading, message, progress, startLoading, stopLoading } = useLoadingScreen();

  const handleLoad = () => {
    startLoading('Carregando dados...', 3000);
    // Simular progresso
    setTimeout(() => stopLoading(), 3000);
  };

  return (
    <>
      <button onClick={handleLoad}>Carregar</button>
      <LoadingScreen
        isLoading={isLoading}
        message={message}
        progress={progress}
        variant="default" // default, minimal, gradient, pulse
        size="md" // sm, md, lg, xl
        showProgress={true}
        showPercentage={true}
        cancelable={false}
      />
    </>
  );
}
```

#### 2. LoadingSpinner (Spinner Simples)
```tsx
import { LoadingSpinner } from '@/components/ui/LoadingScreen';

<LoadingSpinner 
  size="md" // xs, sm, md, lg, xl
  variant="default" // default, dots, pulse, ring
  className="text-blue-500"
/>
```

#### 3. LoadingCard (Card com Loading)
```tsx
import { LoadingCard } from '@/components/ui/LoadingScreen';

<LoadingCard 
  message="Carregando conteúdo..."
  variant="default" // default, minimal, skeleton
  showSpinner={true}
/>
```

### Sistema Global de Loading

#### Provider e Hook
```tsx
import { LoadingProvider, useLoading } from '@/lib/loading';

// No layout.tsx (já configurado)
<LoadingProvider>
  {children}
</LoadingProvider>

// Em componentes
function MyComponent() {
  const { start, update, end, cancel } = useLoading();

  const handleAsyncOperation = async () => {
    const key = start('my-operation', {
      message: 'Processando...',
      cancelable: true,
      onCancel: () => console.log('Cancelado'),
      priority: 'high'
    });

    try {
      // Simular progresso
      update(key, { progress: 50 });
      await someAsyncOperation();
      update(key, { progress: 100 });
      end(key, 'success');
    } catch (error) {
      end(key, 'error');
    }
  };
}
```

#### Componentes de Loading Global
```tsx
import { 
  LoadingButton, 
  LoadingInput, 
  useButtonLoading,
  useInputLoading 
} from '@/lib/loading';

// Botão com loading
<LoadingButton 
  loading={isLoading}
  onClick={handleClick}
  variant="default"
  size="md"
>
  Salvar
</LoadingButton>

// Input com loading
<LoadingInput
  loading={isValidating}
  placeholder="Digite algo..."
  value={value}
  onChange={handleChange}
/>

// Hooks para loading
function MyComponent() {
  const { loading, withLoading } = useButtonLoading();
  
  const handleSave = () => withLoading(async () => {
    await saveData();
  });
}
```

### Skeleton Components
```tsx
import { 
  Skeleton, 
  ChatSkeleton, 
  CardSkeleton, 
  TableSkeleton 
} from '@/lib/loading';

// Skeleton básico
<Skeleton className="h-4 w-3/4" />

// Skeleton para chat
<ChatSkeleton messageCount={3} />

// Skeleton para cards
<CardSkeleton showImage={true} showActions={true} />

// Skeleton para tabelas
<TableSkeleton rows={5} columns={4} showHeader={true} />
```

## 📱 PWA (Progressive Web App)

### Configuração Automática

O PWA já está configurado automaticamente no `layout.tsx` com:

- **Manifest**: `/public/manifest.webmanifest`
- **Service Worker**: `/public/sw.js`
- **Meta tags**: Apple, Android, theme-color
- **Provider**: `PWAProvider` com instalação automática

### Funcionalidades PWA

#### 1. Instalação Automática
- Prompt automático para instalar o app
- Detecção se já está instalado
- Botão de instalação personalizado

#### 2. Service Worker
- Cache de recursos estáticos
- Funcionamento offline
- Atualizações automáticas

#### 3. Indicadores de Status
- Status online/offline
- Status do service worker (desenvolvimento)
- Status de instalação PWA

### Hook useServiceWorker
```tsx
import { useServiceWorker } from '@/hooks/useServiceWorker';

function MyComponent() {
  const { 
    isSupported, 
    isRegistered, 
    isOnline, 
    updateServiceWorker,
    unregisterServiceWorker 
  } = useServiceWorker();

  return (
    <div>
      <p>SW Suportado: {isSupported ? 'Sim' : 'Não'}</p>
      <p>SW Registrado: {isRegistered ? 'Sim' : 'Não'}</p>
      <p>Online: {isOnline ? 'Sim' : 'Não'}</p>
    </div>
  );
}
```

## 🎨 Personalização

### Variantes de Loading
- **default**: Gradiente amarelo/laranja (tema HubEdu)
- **minimal**: Cinza simples
- **gradient**: Gradiente roxo/azul/ciano
- **pulse**: Gradiente verde/esmeralda

### Tamanhos
- **xs**: 12px
- **sm**: 16px  
- **md**: 24px
- **lg**: 32px
- **xl**: 48px

### Prioridades (Loading Global)
- **low**: Baixa prioridade
- **normal**: Prioridade normal
- **high**: Alta prioridade
- **critical**: Prioridade crítica

## 📁 Estrutura de Arquivos

```
components/
├── ui/
│   ├── LoadingScreen.tsx      # Componentes de loading
│   └── SplashScreen.tsx       # Tela de splash
├── providers/
│   └── PWAProvider.tsx        # Provider PWA
└── examples/
    └── LoadingDemo.tsx        # Demo dos componentes

lib/
└── loading.tsx                # Sistema global de loading

hooks/
└── useServiceWorker.ts        # Hook para service worker

styles/
└── loading-screen.css         # Estilos CSS

public/
├── manifest.webmanifest        # Manifest PWA
└── sw.js                      # Service Worker
```

## 🚀 Exemplo Completo

```tsx
'use client';

import { useState } from 'react';
import { LoadingScreen, useLoadingScreen } from '@/components/ui/LoadingScreen';
import { useLoading } from '@/lib/loading';

export function ExamplePage() {
  const [showLoading, setShowLoading] = useState(false);
  const { isLoading, message, progress, startLoading, stopLoading } = useLoadingScreen();
  const { start, end } = useLoading();

  const handleFullScreenLoad = () => {
    setShowLoading(true);
    startLoading('Carregando página completa...', 5000);
    
    // Simular progresso
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          stopLoading();
          setShowLoading(false);
        }, 500);
      }
    }, 1000);
  };

  const handleGlobalLoad = () => {
    const key = start('global-operation', {
      message: 'Processando dados globalmente...',
      cancelable: true,
      priority: 'high'
    });

    setTimeout(() => end(key, 'success'), 3000);
  };

  return (
    <div className="p-8 space-y-4">
      <h1>Exemplo de Loading</h1>
      
      <button 
        onClick={handleFullScreenLoad}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Loading Completo
      </button>
      
      <button 
        onClick={handleGlobalLoad}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Loading Global
      </button>

      {showLoading && (
        <LoadingScreen
          isLoading={isLoading}
          message={message}
          progress={progress}
          variant="default"
          size="lg"
          showProgress={true}
          showPercentage={true}
        />
      )}
    </div>
  );
}
```

## 🔧 Configuração Avançada

### Personalizar Service Worker
Edite `/public/sw.js` para modificar:
- Recursos em cache
- Estratégias de cache
- Comportamento offline

### Personalizar Manifest
Edite `/public/manifest.webmanifest` para modificar:
- Nome do app
- Ícones
- Cores do tema
- Modo de exibição

### Personalizar Loading
Edite `/styles/loading-screen.css` para modificar:
- Animações
- Cores
- Transições
- Responsividade

## 📝 Notas Importantes

1. **Performance**: O sistema de loading é otimizado para performance com useCallback e useMemo
2. **Acessibilidade**: Todos os componentes incluem ARIA labels e suporte a screen readers
3. **Responsividade**: Funciona perfeitamente em mobile e desktop
4. **Tema**: Suporte completo a modo escuro/claro
5. **PWA**: Funciona offline após instalação
6. **Service Worker**: Não interfere com desenvolvimento local

## 🐛 Troubleshooting

### Loading não aparece
- Verifique se o `LoadingProvider` está envolvendo o componente
- Confirme se `isLoading` está sendo setado corretamente

### PWA não instala
- Verifique se o manifest está acessível em `/manifest.webmanifest`
- Confirme se o service worker está registrado
- Teste em HTTPS (PWA requer HTTPS em produção)

### Service Worker não funciona
- Verifique o console para erros
- Confirme se o arquivo `/sw.js` existe
- Teste em produção (SW pode não funcionar em desenvolvimento local)
