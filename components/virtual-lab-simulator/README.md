# 🧪 Virtual Lab Simulator Module

Este módulo oferece simulações interativas de laboratório para experimentos de química e física, permitindo que estudantes explorem conceitos científicos de forma visual e interativa.

## 📁 Estrutura de Arquivos

```
components/virtual-lab-simulator/
├── experiments/
│   ├── ChemicalReactionLab.tsx          # Simulação de reações químicas
│   ├── PendulumLab.tsx                  # Simulação de movimento pendular
│   ├── BouncingBallLab.tsx              # Simulação de bola saltitante
│   └── ColorMixingLab.tsx               # Simulação de mistura de cores
├── components/
│   ├── ExperimentView.tsx               # Visualizador principal de experimentos
│   ├── Sidebar.tsx                      # Barra lateral de navegação
│   ├── ExperimentCard.tsx               # Card de experimento
│   └── ParameterControls.tsx            # Controles de parâmetros
├── icons/
│   ├── FlaskIcon.tsx                    # Ícone de frasco
│   ├── PendulumIcon.tsx                 # Ícone de pêndulo
│   ├── BallIcon.tsx                     # Ícone de bola
│   └── ColorIcon.tsx                    # Ícone de cores
├── hooks/
│   ├── useExperimentState.ts            # Hook de estado do experimento
│   ├── usePhysicsSimulation.ts          # Hook de simulação física
│   └── useChemicalReactions.ts          # Hook de reações químicas
├── services/
│   ├── physicsEngine.ts                 # Motor de física
│   ├── chemicalEngine.ts                # Motor de química
│   └── experimentData.ts                # Dados dos experimentos
├── types/
│   ├── experiment.ts                    # Tipos de experimentos
│   ├── physics.ts                       # Tipos de física
│   └── chemistry.ts                     # Tipos de química
└── VirtualLabSimulator.tsx              # Componente principal do módulo
```

## 🚀 Funcionalidades

### 🧪 Experimentos Disponíveis

1. **Reação Química**
   - Mistura de compostos químicos
   - Previsão de resultados com IA
   - Explicações científicas
   - Efeitos visuais

2. **Movimento Pendular**
   - Simulação de movimento harmônico simples
   - Ajuste de comprimento e ângulo
   - Visualização do período
   - Gráficos de movimento

3. **Bola Saltitante**
   - Exploração de gravidade e elasticidade
   - Coeficiente de restituição
   - Comportamento da bola
   - Análise de energia

4. **Mistura de Cores**
   - Teoria das cores
   - Mistura RGB e CMYK
   - Círculo cromático
   - Harmonia de cores

### 🎯 Características

- **Interface Intuitiva**: Design responsivo e fácil de usar
- **Parâmetros Ajustáveis**: Controles em tempo real
- **Visualizações**: Gráficos e animações
- **Explicações Científicas**: Contexto educacional
- **Compatibilidade**: Funciona em desktop e mobile

## 🛠️ Tecnologias

- **React 19**: Componentes modernos
- **TypeScript**: Tipagem estática
- **Canvas API**: Renderização de gráficos
- **Web Animations API**: Animações fluidas
- **Tailwind CSS**: Estilização responsiva

## 📚 Como Usar

### 1. Importar o Módulo

```tsx
import { VirtualLabSimulator } from '@/components/virtual-lab-simulator/VirtualLabSimulator'
```

### 2. Usar o Componente

```tsx
<VirtualLabSimulator 
  initialExperiment="chemical-reaction"
  showSidebar={true}
  enableFullscreen={true}
/>
```

### 3. Props Disponíveis

- `initialExperiment`: Experimento inicial
- `showSidebar`: Mostrar barra lateral
- `enableFullscreen`: Permitir tela cheia
- `onExperimentChange`: Callback de mudança de experimento

## 🔧 Desenvolvimento

### Adicionar Novo Experimento

1. Criar componente em `experiments/`
2. Adicionar ícone em `icons/`
3. Registrar em `experimentData.ts`
4. Atualizar tipos em `types/experiment.ts`

### Personalizar Física

1. Modificar `physicsEngine.ts`
2. Atualizar `usePhysicsSimulation.ts`
3. Ajustar parâmetros nos experimentos

## 📖 Documentação Adicional

- [Guia de Experimentos](./docs/experiments.md)
- [API de Física](./docs/physics-api.md)
- [Personalização](./docs/customization.md)
