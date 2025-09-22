# Integração Perplexity com Vercel AI SDK

## Visão Geral

Esta integração permite usar a API do Perplexity através do Vercel AI SDK, oferecendo capacidades de busca em tempo real e respostas baseadas em informações atualizadas.

## Configuração

### 1. Instalação

A dependência já foi instalada:
```bash
npm install @ai-sdk/perplexity
```

### 2. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Perplexity AI
PERPLEXITY_API_KEY="your-perplexity-api-key-here"

# Perplexity API Configuration
PERPLEXITY_API_PRIORITY=api
PERPLEXITY_MODEL_SELECTION=llama-3.1-sonar-small-128k-online
PERPLEXITY_ENABLE_SEARCH=true
```

### 3. Obter Chave da API

1. Acesse [Perplexity API](https://www.perplexity.ai/settings/api)
2. Crie uma conta ou faça login
3. Gere uma nova chave da API
4. Copie a chave e adicione ao arquivo `.env.local`

## Modelos Disponíveis

### Modelos Online (com busca)
- `llama-3.1-sonar-small-128k-online` (padrão)
- `llama-3.1-sonar-large-128k-online`
- `llama-3.1-sonar-huge-128k-online`

### Modelos Offline
- `llama-3.1-sonar-small-128k-chat`
- `llama-3.1-sonar-large-128k-chat`
- `llama-3.1-sonar-huge-128k-chat`

## Uso

### 1. API Endpoint

```typescript
// POST /api/chat/perplexity
{
  "messages": [
    { "role": "user", "content": "Qual é a capital do Brasil?" }
  ],
  "module": "professor" // opcional
}
```

### 2. Hook React

```typescript
import { usePerplexityChat } from '@/hooks/usePerplexityChat'

function MyComponent() {
  const {
    messages,
    input,
    handleInputChange,
    sendMessage,
    isLoading,
    error
  } = usePerplexityChat()

  return (
    <div>
      {/* Sua interface de chat */}
    </div>
  )
}
```

### 3. Uso Direto

```typescript
import { generateText } from 'ai'
import { perplexity } from '@ai-sdk/perplexity'

const model = perplexity('llama-3.1-sonar-small-128k-online', {
  apiKey: process.env.PERPLEXITY_API_KEY,
})

const result = await generateText({
  model,
  prompt: 'Explique sobre a Revolução Francesa',
  maxTokens: 1000,
  temperature: 0.7,
})
```

## Testando a Integração

### 1. Teste via Script

```bash
npm run test:perplexity
```

### 2. Teste via API

```bash
curl http://localhost:3000/api/test-perplexity
```

### 3. Teste via Interface

Acesse: `http://localhost:3000/perplexity-demo`

## Características Especiais

### 1. Busca em Tempo Real
Os modelos "online" do Perplexity podem acessar informações atualizadas da internet.

### 2. Streaming
Suporte completo a streaming de respostas para melhor experiência do usuário.

### 3. Classificação de Módulos
Sistema automático de classificação de perguntas por módulo educacional.

### 4. Cache Inteligente
Sistema de cache para otimizar performance e reduzir custos.

## Configurações Avançadas

### 1. Parâmetros do Modelo

```typescript
const result = await generateText({
  model,
  prompt: 'Sua pergunta aqui',
  maxTokens: 4000,        // Máximo de tokens
  temperature: 0.7,        // Criatividade (0-1)
  topP: 0.9,              // Diversidade (0-1)
})
```

### 2. Configuração de Streaming

```typescript
const result = await streamText({
  model,
  messages: aiMessages,
  maxTokens: 4000,
  temperature: 0.7,
  topP: 0.9,
})
```

## Troubleshooting

### Erro 401 - Unauthorized
- Verifique se a chave da API está correta
- Verifique se a chave tem permissões adequadas

### Erro 429 - Rate Limit
- Aguarde um momento e tente novamente
- Verifique seus limites de API

### Erro de Conexão
- Verifique sua conexão com a internet
- Verifique se o serviço do Perplexity está funcionando

## Exemplos de Uso

### 1. Pergunta Educacional

```typescript
const response = await sendMessage(
  "Explique sobre a fotossíntese para o ENEM",
  "enem"
)
```

### 2. Busca de Informações Atualizadas

```typescript
const response = await sendMessage(
  "Quais são as últimas notícias sobre educação no Brasil?",
  "professor"
)
```

### 3. Aula Interativa

```typescript
const response = await sendMessage(
  "Crie uma aula sobre matemática básica",
  "aula_interativa"
)
```

## Monitoramento

### 1. Logs
Todos os requests são logados no console com prefixo `🤖 Perplexity Chat request:`

### 2. Métricas
- Tempo de resposta
- Uso de tokens
- Taxa de erro
- Cache hit rate

### 3. Headers de Resposta
- `X-Provider`: perplexity
- `X-Model`: modelo usado
- `X-Module`: módulo classificado
- `X-Streaming`: true/false

## Próximos Passos

1. Configure sua chave da API
2. Teste a integração
3. Explore os diferentes modelos
4. Implemente em sua aplicação
5. Monitore performance e custos
