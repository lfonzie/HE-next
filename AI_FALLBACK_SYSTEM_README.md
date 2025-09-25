# Sistema Universal de Fallback de IA

Este sistema implementa um fallback automático robusto entre diferentes provedores de IA usando o Vercel AI SDK. Quando um modelo falha (por quota, erro de API, timeout, etc.), o sistema automaticamente tenta outros provedores disponíveis.

## 🚀 Características Principais

- **Fallback Automático**: Troca automaticamente entre provedores quando um falha
- **Detecção Inteligente de Erros**: Identifica erros de quota, API key inválida, timeout, etc.
- **Monitoramento de Saúde**: Rastreia a saúde de cada provedor e aplica backoff
- **Configuração Flexível**: Suporta múltiplos provedores e modelos
- **Logs Detalhados**: Rastreamento completo de tentativas e fallbacks
- **Middleware Universal**: Pode ser usado em qualquer endpoint de IA

## 📋 Provedores Suportados

| Provedor | Modelos | Prioridade | Status |
|----------|---------|------------|--------|
| OpenAI | GPT-4o Mini, GPT-4o, GPT-5 | 1 | ✅ Ativo |
| Google Gemini | Gemini 1.5 Flash, Gemini 1.5 Pro | 2 | ✅ Ativo |
| Perplexity AI | Sonar | 3 | ✅ Ativo |
| Anthropic Claude | Claude 3 Haiku, Claude 3 Sonnet | 4 | 🔧 Opcional |

## 🛠️ Configuração

### Variáveis de Ambiente

```bash
# OpenAI (Prioridade 1)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Gemini (Prioridade 2)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here
# OU
GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here
# OU
GOOGLE_API_KEY=your-gemini-api-key-here

# Perplexity AI (Prioridade 3)
PERPLEXITY_API_KEY=your-perplexity-api-key-here
PERPLEXITY_MODEL_SELECTION=sonar

# Anthropic Claude (Prioridade 4 - Opcional)
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### Instalação

O sistema já está integrado ao projeto. Não são necessárias dependências adicionais.

## 📖 Como Usar

### 1. Uso Básico com Middleware

```typescript
import { withAIFallback } from '@/lib/ai-middleware'

// Handler original
async function originalHandler(request: NextRequest, options: AIMiddlewareOptions) {
  // Sua lógica específica aqui
  // Se falhar, o middleware automaticamente tentará outros provedores
  throw new Error('Provider failed')
}

// Endpoint com fallback automático
export const POST = withAIFallback(originalHandler, {
  module: 'professor',
  complexity: 'simple',
  temperature: 0.7,
  maxTokens: 4000,
  timeout: 30000,
  maxRetries: 3
})
```

### 2. Uso Direto do Fallback Manager

```typescript
import { executeWithFallback } from '@/lib/ai-fallback-manager'

const result = await executeWithFallback({
  message: 'Sua pergunta aqui',
  module: 'professor',
  complexity: 'simple',
  systemPrompt: 'Prompt personalizado (opcional)',
  temperature: 0.7,
  maxTokens: 4000,
  timeout: 30000,
  maxRetries: 3,
  preferredProvider: 'openai', // Forçar provedor específico
  excludeProviders: ['google'] // Excluir provedores específicos
})

if (result.success) {
  console.log('Resposta:', result.content)
  console.log('Provedor usado:', result.provider)
  console.log('Modelo:', result.model)
  console.log('Latência:', result.latency)
  console.log('Tentativas:', result.attempts)
  console.log('Cadeia de fallback:', result.fallbackChain)
} else {
  console.error('Erro:', result.error)
}
```

### 3. Hooks Pré-configurados

```typescript
import { createChatEndpoint, createLessonEndpoint, createClassificationEndpoint } from '@/lib/ai-middleware'

// Para endpoints de chat
export const POST = createChatEndpoint({
  module: 'professor',
  complexity: 'simple'
})

// Para endpoints de geração de aulas
export const POST = createLessonEndpoint({
  complexity: 'complex',
  temperature: 0.8
})

// Para endpoints de classificação
export const POST = createClassificationEndpoint({
  complexity: 'fast'
})
```

## 🔧 Configurações Avançadas

### Opções do Fallback Manager

```typescript
interface FallbackOptions {
  message: string                    // Mensagem para processar
  module?: string                   // Módulo ('professor', 'enem', 'ti', etc.)
  complexity?: 'simple' | 'complex' | 'fast'  // Nível de complexidade
  systemPrompt?: string             // Prompt do sistema personalizado
  temperature?: number              // Temperatura (0.0 - 1.0)
  maxTokens?: number                // Máximo de tokens
  timeout?: number                  // Timeout em ms
  maxRetries?: number               // Máximo de tentativas
  preferredProvider?: string        // Provedor preferido
  excludeProviders?: string[]      // Provedores a excluir
}
```

### Opções do Middleware

```typescript
interface AIMiddlewareOptions {
  module?: string                   // Módulo padrão
  complexity?: 'simple' | 'complex' | 'fast'  // Complexidade padrão
  systemPrompt?: string             // Prompt padrão
  temperature?: number              // Temperatura padrão
  maxTokens?: number                // Tokens padrão
  timeout?: number                  // Timeout padrão
  maxRetries?: number               // Tentativas padrão
  preferredProvider?: string        // Provedor preferido
  excludeProviders?: string[]       // Provedores excluídos
  enableCaching?: boolean           // Habilitar cache
  cacheKey?: string                 // Chave de cache personalizada
}
```

## 📊 Monitoramento

### Endpoint de Status

```bash
GET /api/ai-fallback/status
```

Retorna:
- Status de todos os provedores
- Configurações de ambiente
- Recomendações de melhoria
- Estatísticas de saúde

### Reset de Provedor

```bash
POST /api/ai-fallback/status
{
  "providerId": "openai",
  "action": "reset"
}
```

### Logs

O sistema gera logs detalhados com prefixos:
- `🤖 [AI-FALLBACK]`: Operações do sistema de fallback
- `🎯 [PROVIDER-SELECTION]`: Seleção de provedores
- `🔄 [FALLBACK]`: Tentativas de fallback
- `❌ [AI-ERROR]`: Erros de IA
- `✅ [AI-SUCCESS]`: Sucessos

## 🧪 Testes

### Script de Teste Automático

```bash
node test-ai-fallback-system.cjs
```

O script testa:
- Status dos provedores
- Requisições simples
- Múltiplas requisições
- Fallback forçado
- Diferentes complexidades

### Teste Manual

```bash
# Testar endpoint de exemplo
curl -X POST http://localhost:3000/api/ai-fallback/example \
  -H "Content-Type: application/json" \
  -d '{"message": "Teste de fallback"}'

# Verificar status
curl http://localhost:3000/api/ai-fallback/status
```

## 🔍 Detecção de Erros

O sistema detecta automaticamente:

### Erros de Quota
- `quota exceeded`
- `rate limit`
- `limit exceeded`
- `too many requests`
- Código HTTP 429

### Erros de API Key
- `api key`
- `authentication`
- `unauthorized`
- Código HTTP 401

### Erros de Timeout
- Timeout de conexão
- Timeout de resposta
- Timeout configurado

## 📈 Estratégias de Fallback

### 1. Fallback por Prioridade
1. OpenAI GPT-4o Mini (mais rápido e confiável)
2. Google Gemini (boa qualidade, contexto extenso)
3. Perplexity AI (pesquisa e informações atualizadas)
4. Anthropic Claude (máxima qualidade, se configurado)

### 2. Fallback por Complexidade
- **Simples**: OpenAI GPT-4o Mini ou Google Gemini Flash
- **Complexa**: OpenAI GPT-4o ou Google Gemini Pro
- **Rápida**: OpenAI GPT-4o Mini ou Google Gemini Flash

### 3. Fallback por Módulo
- **Professor**: OpenAI preferido
- **ENEM**: OpenAI para questões complexas
- **TI**: OpenAI para código
- **Financeiro**: OpenAI para cálculos

## 🚨 Troubleshooting

### Problema: Nenhum provedor disponível
**Solução**: Verifique se pelo menos uma API key está configurada

### Problema: Todos os provedores falhando
**Solução**: 
1. Verifique as API keys
2. Verifique os limites de quota
3. Verifique a conectividade de rede
4. Use o endpoint de status para diagnóstico

### Problema: Fallback muito lento
**Solução**:
1. Reduza o timeout
2. Reduza o número de tentativas
3. Configure provedores preferidos
4. Use cache quando possível

### Problema: Respostas inconsistentes
**Solução**:
1. Configure system prompts específicos
2. Ajuste a temperatura
3. Use provedores preferidos para consistência

## 🔄 Migração de Endpoints Existentes

Para migrar um endpoint existente:

1. **Identifique o handler atual**:
```typescript
// Antes
export async function POST(request: NextRequest) {
  // Lógica existente
}
```

2. **Extraia a lógica para um handler**:
```typescript
// Depois
async function originalHandler(request: NextRequest, options: AIMiddlewareOptions) {
  // Lógica existente movida para cá
}

export const POST = withAIFallback(originalHandler, {
  // Configurações específicas
})
```

3. **Teste o fallback**:
```bash
node test-ai-fallback-system.cjs
```

## 📝 Exemplos Completos

### Endpoint de Chat com Fallback

```typescript
import { withAIFallback } from '@/lib/ai-middleware'

async function chatHandler(request: NextRequest, options: AIMiddlewareOptions) {
  const body = await request.json()
  const { message, history = [] } = body
  
  // Validações específicas
  if (!message?.trim()) {
    throw new Error('Message is required')
  }
  
  // Processamento específico (cache, validações, etc.)
  // ...
  
  // Se chegou até aqui, o handler original funcionou
  return NextResponse.json({
    success: true,
    message: 'Chat processed successfully',
    timestamp: new Date().toISOString()
  })
}

export const POST = withAIFallback(chatHandler, {
  module: 'professor',
  complexity: 'simple',
  temperature: 0.7,
  maxTokens: 4000,
  timeout: 30000,
  maxRetries: 3,
  enableCaching: true
})
```

### Endpoint de Geração de Aulas com Fallback

```typescript
import { withAIFallback } from '@/lib/ai-middleware'

async function lessonHandler(request: NextRequest, options: AIMiddlewareOptions) {
  const body = await request.json()
  const { topic, level, subject } = body
  
  // Validações específicas para aulas
  if (!topic?.trim()) {
    throw new Error('Topic is required')
  }
  
  // Processamento específico para aulas
  // ...
  
  return NextResponse.json({
    success: true,
    lesson: 'Lesson generated successfully',
    timestamp: new Date().toISOString()
  })
}

export const POST = withAIFallback(lessonHandler, {
  module: 'aula_interativa',
  complexity: 'complex',
  temperature: 0.8,
  maxTokens: 6000,
  timeout: 45000,
  maxRetries: 2
})
```

## 🎯 Benefícios

1. **Alta Disponibilidade**: Sistema sempre funcionando mesmo com falhas de provedores
2. **Redundância**: Múltiplos provedores garantem continuidade
3. **Otimização de Custos**: Usa provedores mais baratos quando possível
4. **Qualidade Consistente**: Fallback inteligente mantém qualidade
5. **Monitoramento**: Visibilidade completa do sistema
6. **Facilidade de Uso**: Middleware simples para qualquer endpoint
7. **Flexibilidade**: Configuração granular por endpoint

## 🔮 Próximos Passos

- [ ] Suporte a mais provedores (Mistral, Groq, etc.)
- [ ] Fallback baseado em custo
- [ ] Fallback baseado em latência
- [ ] Cache inteligente de respostas
- [ ] Métricas avançadas de performance
- [ ] Dashboard de monitoramento
- [ ] Alertas automáticos de falhas

---

**Desenvolvido com ❤️ para garantir que sua aplicação sempre tenha IA disponível!**
