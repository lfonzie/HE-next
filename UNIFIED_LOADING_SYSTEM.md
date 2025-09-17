# Sistema Unificado de Loading - HubEdu.ia

## 🎯 Visão Geral

O sistema unificado de loading consolida todas as funcionalidades de carregamento em uma única solução, baseada no código fornecido pelo usuário. O sistema mantém compatibilidade com implementações anteriores enquanto oferece uma experiência moderna e consistente.

## 📁 Estrutura de Arquivos

```
components/ui/
├── UnifiedLoadingScreen.tsx    # Sistema principal unificado
├── loading.tsx                 # Compatibilidade com sistema anterior
└── index.ts                    # Exportações centralizadas

app/
└── loading.tsx                 # Rota principal de loading

lib/
└── loading.tsx                 # Sistema global avançado

hooks/
└── useGlobalLoading.tsx        # Hook global de loading
```

## 🚀 Como Usar

### 1. LoadingScreen Principal

```tsx
import LoadingScreen from '@/components/ui/UnifiedLoadingScreen';

function MyComponent() {
  const handleComplete = () => {
    console.log('Loading completed!');
  };

  return (
    <LoadingScreen 
      onComplete={handleComplete}
      duration={6000}
      message="Carregando plataforma..."
      variant="fullscreen"
      showProgress={true}
    />
  );
}
```

### 2. Componentes Auxiliares

```tsx
import { SimpleSpinner, LoadingOverlay } from '@/components/ui/UnifiedLoadingScreen';

// Spinner simples para botões
<SimpleSpinner size="md" className="text-blue-500" />

// Overlay para componentes específicos
<LoadingOverlay isLoading={isLoading} message="Carregando dados...">
  <MyContent />
</LoadingOverlay>
```

### 3. Hook para Controle Programático

```tsx
import { useLoadingScreen } from '@/components/ui/UnifiedLoadingScreen';

function MyComponent() {
  const { isLoading, progress, startLoading, stopLoading } = useLoadingScreen({
    duration: 4000,
    autoComplete: true
  });

  const handleAsyncOperation = async () => {
    startLoading();
    await someAsyncOperation();
    stopLoading();
  };

  return (
    <button onClick={handleAsyncOperation}>
      {isLoading ? 'Carregando...' : 'Iniciar Operação'}
    </button>
  );
}
```

### 4. Compatibilidade com Sistema Anterior

```tsx
// Importações antigas continuam funcionando
import { LoadingScreen, LoadingSpinner, LoadingOverlay } from '@/components/ui/loading';

// Ou usando o sistema global
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
```

## ✨ Funcionalidades

### 🎨 Animações Avançadas
- **Partículas Flutuantes**: 20 partículas com posições pré-definidas para evitar problemas de hidratação
- **Orbs de Gradiente**: Círculos animados com blur e movimento suave
- **Spinner Personalizado**: Anel rotativo com pontos internos animados
- **Barra de Progresso**: Com efeito shimmer e animações suaves
- **Transições**: Mensagens com fade in/out usando AnimatePresence

### 🎛️ Controles Flexíveis
- **Duração Customizável**: Tempo de carregamento configurável
- **Mensagens Dinâmicas**: Array de mensagens que rotacionam automaticamente
- **Variantes**: `fullscreen` ou `overlay`
- **Progresso**: Barra de progresso opcional com porcentagem
- **Callback**: Função executada ao completar o carregamento

### ♿ Acessibilidade
- **Reduced Motion**: Suporte para usuários com preferência por menos animações
- **Design Responsivo**: Funciona em todos os tamanhos de tela
- **ARIA**: Atributos apropriados para leitores de tela

### 🔧 Compatibilidade
- **Sistema Anterior**: Mantém compatibilidade com implementações existentes
- **Re-exports**: Componentes legados continuam funcionando
- **Sistema Global**: Integração com sistema de loading global avançado

## 🎯 Casos de Uso

### 1. Página de Loading Inicial
```tsx
// app/loading.tsx
<LoadingScreen 
  onComplete={() => router.push('/')}
  duration={6000}
  message="Carregando plataforma..."
  variant="fullscreen"
/>
```

### 2. Loading em Componentes
```tsx
<LoadingOverlay isLoading={isLoading} message="Processando dados...">
  <DataTable />
</LoadingOverlay>
```

### 3. Botões com Loading
```tsx
<button disabled={isLoading}>
  {isLoading && <SimpleSpinner size="sm" className="mr-2" />}
  Salvar
</button>
```

### 4. Loading Programático
```tsx
const { isLoading, startLoading, stopLoading } = useLoadingScreen();

const handleSubmit = async () => {
  startLoading();
  try {
    await submitData();
  } finally {
    stopLoading();
  }
};
```

## 🔄 Migração

### De Sistema Anterior
As importações antigas continuam funcionando:
```tsx
// Antes
import { LoadingScreen } from '@/components/ui/loading';

// Agora (opcional)
import LoadingScreen from '@/components/ui/UnifiedLoadingScreen';
```

### Para Sistema Unificado
```tsx
// Novo sistema
import LoadingScreen, { SimpleSpinner, LoadingOverlay, useLoadingScreen } from '@/components/ui/UnifiedLoadingScreen';
```

## 🎨 Personalização

### Cores e Temas
O sistema usa as cores padrão do HubEdu.ia:
- **Primária**: `yellow-400` para elementos principais
- **Secundária**: `orange-500` para gradientes
- **Fundo**: `black` com transparência
- **Texto**: `yellow-300` para mensagens

### Animações
Todas as animações são baseadas em Framer Motion e podem ser customizadas através das props ou CSS.

## 🐛 Troubleshooting

### Problemas Comuns

1. **Hidratação**: As posições das partículas são pré-definidas para evitar problemas de hidratação
2. **Performance**: Animações são otimizadas e respeitam `prefers-reduced-motion`
3. **Compatibilidade**: Sistema mantém compatibilidade com implementações anteriores

### Debug
```tsx
// Ativar logs de debug
const { isLoading, progress } = useLoadingScreen({ 
  duration: 6000,
  autoComplete: true 
});

console.log('Loading state:', { isLoading, progress });
```

## 📈 Performance

- **Lazy Loading**: Componentes são carregados apenas quando necessário
- **Memoização**: Animações são otimizadas com React.memo
- **Cleanup**: Timeouts e intervalos são limpos automaticamente
- **Bundle Size**: Sistema unificado reduz tamanho do bundle

## 🔮 Futuras Melhorias

- [ ] Suporte a temas personalizados
- [ ] Mais variantes de animação
- [ ] Integração com sistema de notificações
- [ ] Métricas de performance de loading
- [ ] Suporte a loading progressivo com etapas

---

**Sistema Unificado de Loading v1.0** - HubEdu.ia
