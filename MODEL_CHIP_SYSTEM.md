# Sistema de Chips de Modelo - Documentação

## Visão Geral

O sistema de chips de modelo foi implementado para identificar visualmente qual modelo de IA está sendo usado em cada mensagem do chat, baseado na dificuldade da pergunta e no roteamento inteligente do multi router.

## Mapeamento de Modelos

### IA Eco (Triviais)
- **Modelo**: Gemini 2.0 Flash Exp
- **Chip**: Verde com ícone Bot
- **Uso**: Respostas rápidas e econômicas para perguntas simples
- **Exemplos**: Definições básicas, perguntas curtas, informações gerais

### IA (Simples)
- **Modelo**: GPT-4o Mini
- **Chip**: Azul com ícone Brain
- **Uso**: Respostas equilibradas para perguntas de complexidade média
- **Exemplos**: Explicações educacionais, perguntas moderadas

### IA Turbo (Complexas)
- **Modelo**: GPT-4o/GPT-5, Claude Sonnet, Mistral Large
- **Chip**: Roxo com ícone Sparkles
- **Uso**: Respostas avançadas e detalhadas para perguntas complexas
- **Exemplos**: Análises profundas, questões técnicas, explicações detalhadas

## Componentes Implementados

### 1. ModelChip Component
**Arquivo**: `components/chat/ModelChip.tsx`

Componente principal que renderiza o chip visual do modelo:
- Detecta automaticamente o modelo baseado no nome ou tier
- Exibe ícone, cor e label apropriados
- Suporte para informações detalhadas (provedor, complexidade)

### 2. ModelDetails Component
**Arquivo**: `components/chat/ModelChip.tsx`

Componente para exibir informações detalhadas do modelo:
- Descrição do modelo
- Contagem de tokens
- Informações de custo

### 3. Integração nos Componentes de Mensagem

#### ChatMessage
- Chip exibido abaixo do avatar do assistente
- Informações detalhadas no footer da mensagem
- Atualização do compare function para incluir novas propriedades

#### StreamingMessage
- Chip exibido abaixo do avatar durante streaming
- Informações detalhadas no footer
- Suporte para propriedades de roteamento

## Tipos de Dados Atualizados

### Message Interface
```typescript
interface Message {
  // ... propriedades existentes
  provider?: string;           // Provedor usado (openai, google, etc.)
  complexity?: string;          // Complexidade detectada (simple, complex, etc.)
  routingReasoning?: string;    // Explicação do roteamento
}
```

## Rotas da API Atualizadas

### 1. Multi-Provider Route
**Arquivo**: `app/api/chat/multi-provider/route.ts`

- Integração com `routeAIModel` para roteamento inteligente
- Headers de resposta incluem informações de roteamento:
  - `X-Provider`: Provedor selecionado
  - `X-Model`: Modelo usado
  - `X-Complexity`: Complexidade detectada
  - `X-Tier`: Tier calculado (IA, IA_SUPER, IA_ECO)
  - `X-Routing-Reasoning`: Explicação do roteamento

### 2. Stream Route
**Arquivo**: `app/api/chat/stream/route.ts`

- Integração com sistema de roteamento
- Metadados de resposta incluem informações completas de roteamento
- Suporte para diferentes provedores baseado na complexidade

## Hook useChat Atualizado

**Arquivo**: `hooks/useChat.ts`

- Extração de informações de roteamento dos headers da resposta
- Armazenamento das informações nas mensagens
- Suporte para todas as novas propriedades de roteamento

## Sistema de Roteamento Inteligente

### Detecção de Complexidade
O sistema analisa automaticamente:
- Palavras-chave de complexidade
- Tamanho da mensagem
- Número de perguntas
- Termos técnicos

### Seleção de Provedor
Baseado em:
- Caso de uso detectado
- Complexidade da pergunta
- Disponibilidade do provedor
- Preferências configuradas

### Mapeamento de Tier
- **Simple** → IA (GPT-4o Mini)
- **Complex** → IA Turbo (GPT-4o/GPT-5)
- **Fast** → IA Eco (Gemini)

## Benefícios

1. **Transparência**: Usuários podem ver qual modelo está sendo usado
2. **Confiança**: Chips visuais indicam a qualidade da resposta
3. **Otimização**: Sistema escolhe automaticamente o melhor modelo
4. **Custo-Efetividade**: Modelos mais baratos para perguntas simples
5. **Performance**: Respostas rápidas quando apropriado

## Configuração

### Variáveis de Ambiente Necessárias
```env
OPENAI_API_KEY=your_openai_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Personalização
- Cores dos chips podem ser ajustadas em `ModelChip.tsx`
- Mapeamento de modelos pode ser modificado em `ai-model-router.ts`
- Lógica de detecção de complexidade pode ser refinada

## Monitoramento

O sistema inclui logs detalhados para:
- Decisões de roteamento
- Seleção de provedores
- Detecção de complexidade
- Performance dos modelos

## Futuras Melhorias

1. **Aprendizado**: Sistema pode aprender com feedback dos usuários
2. **Métricas**: Coleta de métricas de performance por modelo
3. **A/B Testing**: Teste de diferentes modelos para otimização
4. **Cache**: Cache inteligente baseado na complexidade
5. **Fallback**: Sistema de fallback robusto entre provedores
