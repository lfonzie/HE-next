# Otimizações de Performance do Chat

## Problema Identificado

O processo de chat estava demorando muito desde o clique do usuário até o início do streaming, com os seguintes gargalos identificados:

1. **Chamada HTTP Sequencial Desnecessária**: O endpoint `/api/chat/multi-provider` fazia uma chamada HTTP para `/api/router/classify`, adicionando ~1.5s de latência
2. **Classificação OpenAI Redundante**: Todas as mensagens eram classificadas via OpenAI, mesmo as simples
3. **Orquestrador Duplo**: Chamadas desnecessárias ao orquestrador mesmo com módulo definido
4. **Falta de Cache**: Mensagens similares eram reclassificadas repetidamente

## Otimizações Implementadas

### 1. Eliminação da Chamada HTTP Sequencial

**Antes:**
```typescript
// Chamada HTTP para classificar complexidade
const response = await fetch('http://localhost:3000/api/router/classify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: lastMessage.content })
})
```

**Depois:**
```typescript
// Classificação local instantânea
const complexityResult = classifyComplexity(lastMessage.content)
```

**Impacto**: Redução de ~1.5s na latência inicial.

### 2. Sistema de Cache Inteligente

Criado cache em memória para classificações de complexidade:

```typescript
// Cache com TTL de 5 minutos e limite de 1000 entradas
const classificationCache = new Map<string, { classification: ComplexityLevel, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 1000;
```

**Benefícios:**
- Mensagens similares são classificadas instantaneamente
- Redução de chamadas à OpenAI
- Limpeza automática de cache expirado

### 3. Classificação Local Melhorada

Implementada classificação local robusta que identifica:

- **Trivial**: Saudações simples, mensagens curtas (< 15 chars)
- **Simples**: Perguntas básicas, consultas diretas
- **Complexa**: Perguntas educacionais avançadas, análises detalhadas

```typescript
// Palavras-chave educacionais expandidas
const hasEducationalTerms = /\b(geometria|álgebra|trigonometria|cálculo|derivada|integral|equação|função|teorema|demonstração|prova|análise|síntese|...)\b/i.test(message);
```

### 4. Função Utilitária Reutilizável

Criado `lib/complexity-classifier.ts` com:

- `classifyComplexity()`: Classificação com cache integrado
- `getProviderConfig()`: Configuração automática de provider/modelo
- `clearComplexityCache()`: Limpeza manual para testes
- `getCacheStats()`: Estatísticas do cache

### 5. Otimização de Providers

Configuração automática baseada na complexidade:

```typescript
// Trivial -> Google Gemini Flash (mais rápido)
// Simples -> OpenAI GPT-4o-mini (balanceado)
// Complexa -> OpenAI GPT-4o (mais poderoso)
```

### 6. Redução de Chamadas ao Orquestrador

```typescript
// Só usar orquestrador se realmente necessário
if (module === 'auto' || !module) {
  const orchestratorResult = await orchestrate({...})
} else {
  console.log('Using provided module:', targetModule)
}
```

## Resultados Esperados

### Antes das Otimizações:
```
Clique do usuário -> Classificação HTTP (~1.5s) -> Orquestrador (~0.5s) -> Streaming
Total: ~2.0s até início do streaming
```

### Depois das Otimizações:
```
Clique do usuário -> Classificação local (~0.01s) -> Streaming
Total: ~0.1s até início do streaming
```

**Melhoria**: Redução de ~95% no tempo até início do streaming.

## Arquivos Modificados

1. **`lib/complexity-classifier.ts`** - Nova função utilitária
2. **`app/api/router/classify/route.ts`** - Simplificado para usar função utilitária
3. **`app/api/chat/multi-provider/route.ts`** - Eliminada chamada HTTP, adicionado cache local

## Monitoramento

Os logs agora mostram:
- `⚡ [MULTI-PROVIDER] Complexity classification: simples (local, cached)`
- `⚡ [COMPLEXITY CLASSIFIER] Cache hit: "mensagem..." -> simples`

## Próximos Passos

1. **Monitorar métricas** de performance em produção
2. **Ajustar TTL do cache** baseado no uso real
3. **Implementar cache distribuído** se necessário (Redis)
4. **Adicionar métricas** de hit rate do cache
