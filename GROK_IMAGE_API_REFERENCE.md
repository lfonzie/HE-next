# 🔌 Referência da API Grok Image Generation

## Visão Geral

Este documento descreve como usar a API do Grok (xAI) para geração de imagens, baseado na documentação oficial da xAI.

---

## 📍 Endpoint

```
POST https://api.x.ai/v1/images/generations
```

---

## 🔑 Autenticação

Todas as requisições requerem um header de autorização:

```http
Authorization: Bearer YOUR_XAI_API_KEY
```

---

## 📥 Request Body

```typescript
{
  "model": "grok-2-image-1212",
  "prompt": string,           // Descrição da imagem desejada
  "n": number,                // Número de imagens (1-10), padrão: 1
  "response_format": string   // "url" ou "b64_json", padrão: "url"
}
```

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `model` | string | Sim | - | Modelo a usar: `"grok-2-image-1212"` |
| `prompt` | string | Sim | - | Descrição textual da imagem |
| `n` | number | Não | 1 | Quantidade de imagens (1-10) |
| `response_format` | string | Não | "url" | Formato: `"url"` ou `"b64_json"` |

---

## 📤 Response Body

### Formato URL (response_format: "url")

```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "https://api.x.ai/v1/images/abc123.jpg"
    },
    {
      "url": "https://api.x.ai/v1/images/def456.jpg"
    }
  ]
}
```

### Formato Base64 (response_format: "b64_json")

```json
{
  "created": 1234567890,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
```

---

## 💻 Exemplos de Uso

### Python com SDK OpenAI

```python
from openai import OpenAI

client = OpenAI(
    api_key="sua_chave_api_aqui",
    base_url="https://api.x.ai/v1"
)

response = client.images.generate(
    model="grok-2-image-1212",
    prompt="Uma paisagem montanhosa ao pôr do sol, em estilo realista",
    n=1,
    response_format="url"
)

# Acessar URL da imagem
image_url = response.data[0].url
print(image_url)
```

### JavaScript/TypeScript com SDK OpenAI

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: 'sua_chave_api_aqui',
    baseURL: 'https://api.x.ai/v1'
});

async function generateImage() {
    const response = await openai.images.generate({
        model: 'grok-2-image-1212',
        prompt: 'Uma paisagem montanhosa ao pôr do sol, em estilo realista',
        n: 1,
        response_format: 'url'
    });

    console.log(response.data[0].url);
}

generateImage();
```

### cURL (HTTP direto)

```bash
curl -X POST https://api.x.ai/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sua_chave_api_aqui" \
  -d '{
    "model": "grok-2-image-1212",
    "prompt": "Uma paisagem montanhosa ao pôr do sol, em estilo realista",
    "n": 1,
    "response_format": "url"
  }'
```

### Fetch API (Browser/Node.js)

```typescript
const response = await fetch('https://api.x.ai/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'grok-2-image-1212',
    prompt: 'Uma paisagem montanhosa ao pôr do sol, em estilo realista',
    n: 1,
    response_format: 'url'
  })
});

const data = await response.json();
const imageUrl = data.data[0].url;
```

---

## ⚡ Rate Limits

| Limite | Valor |
|--------|-------|
| Requisições por segundo | 5 |
| Imagens por requisição | 10 |
| Total de imagens por dia | Baseado no plano |

**Recomendação**: Implemente delays entre requisições (mínimo 200ms).

---

## 💰 Pricing

| Item | Custo |
|------|-------|
| Custo por imagem | $0.07 USD |
| Formato de cobrança | Por imagem gerada |

**Exemplo**: 100 imagens = $7.00 USD

---

## 🔒 Segurança e Boas Práticas

### 1. Proteção da API Key

```typescript
// ✅ CORRETO: No servidor (API route)
const apiKey = process.env.XAI_API_KEY;

// ❌ ERRADO: Expor no cliente
const apiKey = "xai-123456789"; // NÃO FAÇA ISSO!
```

### 2. Validação de Input

```typescript
function validatePrompt(prompt: string): boolean {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  if (prompt.length > 1000) {
    throw new Error('Prompt too long (max 1000 characters)');
  }
  
  return true;
}
```

### 3. Tratamento de Erros

```typescript
try {
  const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'grok-2-image-1212',
      prompt: userPrompt,
      n: 1
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API Error: ${response.status} - ${errorData.message}`);
  }

  const data = await response.json();
  return data.data[0].url;

} catch (error) {
  console.error('Failed to generate image:', error);
  // Implementar fallback ou retry
}
```

### 4. Rate Limiting

```typescript
class RateLimiter {
  private lastRequest = 0;
  private minInterval = 200; // 200ms = 5 req/sec

  async throttle() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequest = Date.now();
  }
}

const limiter = new RateLimiter();

async function generateImage(prompt: string) {
  await limiter.throttle();
  // Fazer requisição...
}
```

---

## 🐛 Troubleshooting

### Erro 401: Unauthorized

**Causa**: API key inválida ou não fornecida

**Solução**:
```typescript
// Verificar se a API key está configurada
if (!process.env.XAI_API_KEY) {
  throw new Error('XAI_API_KEY not configured');
}
```

### Erro 429: Too Many Requests

**Causa**: Rate limit excedido

**Solução**: Implementar retry com backoff exponencial:
```typescript
async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateImage(prompt);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### Erro 400: Bad Request

**Causa**: Parâmetros inválidos

**Checklist**:
- [ ] Prompt não está vazio
- [ ] `n` está entre 1-10
- [ ] `response_format` é "url" ou "b64_json"
- [ ] `model` é "grok-2-image-1212"

---

## 📊 Comparação: URL vs Base64

| Característica | URL | Base64 |
|---------------|-----|--------|
| **Tamanho da resposta** | Pequeno (~100 bytes) | Grande (~100KB+) |
| **Velocidade** | Rápido | Mais lento |
| **Armazenamento** | No servidor xAI | Inline no JSON |
| **Persistência** | Temporário | Permanente |
| **Uso recomendado** | Produção | Desenvolvimento/testes |

### Exemplo de Tamanho

```typescript
// URL response: ~100 bytes
{
  "url": "https://api.x.ai/v1/images/abc123.jpg"
}

// Base64 response: ~100KB+
{
  "b64_json": "iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvz..." // (continua por 100KB)
}
```

---

## 🔄 Migração de Outros Providers

### De DALL-E (OpenAI)

```diff
- const response = await openai.images.generate({
-   model: "dall-e-3",
+ const openai = new OpenAI({
+   apiKey: process.env.XAI_API_KEY,
+   baseURL: 'https://api.x.ai/v1'
+ });
+ 
+ const response = await openai.images.generate({
+   model: "grok-2-image-1212",
    prompt: "...",
    n: 1
  });
```

### De Stable Diffusion

```diff
- const response = await fetch('https://api.stability.ai/v1/generation/...', {
+ const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
-     'Authorization': `Bearer ${STABILITY_KEY}`
+     'Authorization': `Bearer ${XAI_KEY}`
    },
    body: JSON.stringify({
+     model: 'grok-2-image-1212',
      prompt: '...'
    })
  });
```

---

## 📚 Recursos Adicionais

- **Documentação Oficial**: https://docs.x.ai/docs/guides/image-generations
- **Console xAI**: https://console.x.ai/
- **API Reference**: https://x.ai/api
- **Status Page**: https://status.x.ai/

---

## ⚙️ Configuração no Projeto

### Arquivo `.env.local`

```bash
XAI_API_KEY="xai-your-api-key-here"
```

### Uso no Código

```typescript
import { generateImageWithGrok } from '@/lib/grok-image-generator';

const result = await generateImageWithGrok({
  prompt: 'A beautiful sunset over mountains',
  n: 1,
  response_format: 'url'
});

console.log(result.images[0]); // URL da imagem
```

---

## ✅ Checklist de Integração

- [ ] Obter API key em https://console.x.ai/
- [ ] Adicionar `XAI_API_KEY` ao `.env.local`
- [ ] Implementar rate limiting (200ms entre requisições)
- [ ] Adicionar tratamento de erros
- [ ] Implementar retry com backoff
- [ ] Validar inputs do usuário
- [ ] Proteger API key (nunca expor no frontend)
- [ ] Monitorar custos ($0.07 por imagem)
- [ ] Implementar fallback para outros providers

---

**Pronto!** 🎉 Agora você pode gerar imagens com a API do Grok de forma eficiente e segura.

