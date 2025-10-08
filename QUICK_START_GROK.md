# 🚀 Grok Image Generation - Quick Start

## ⚡ 3 Passos para Começar

### 1️⃣ Obter API Key
```
https://console.x.ai/ → Criar conta → Gerar chave
```

### 2️⃣ Configurar
```bash
# .env.local
XAI_API_KEY="xai-your-api-key-here"
```

### 3️⃣ Usar
```typescript
// API
POST /api/internal/images/generate
{
  "topic": "fotossíntese",
  "count": 6,
  "provider": "grok"
}

// Código
import { generateImageWithGrok } from '@/lib/grok-image-generator';
const result = await generateImageWithGrok({
  prompt: 'Beautiful sunset',
  n: 1
});
```

---

## 🎯 Escolher Provider

### Use **Grok** quando:
- ⚡ Precisar de **velocidade** (<1s/imagem)
- 📦 Gerar **múltiplas imagens** (4+)
- 🔗 Preferir **URLs** ao invés de base64
- 💵 Orçamento permite ($0.07/imagem)

### Use **Gemini** quando:
- 🎨 Precisar de **alta qualidade**
- 🔬 Conteúdo **científico/educacional**
- 📊 Gerar **poucos imagens** (1-3)
- 💰 Orçamento **limitado** (grátis)

---

## 📊 Comparação Rápida

| | Grok | Gemini |
|---|---|---|
| **Velocidade** | ⚡⚡⚡ (<1s) | 🐢 (1-3s) |
| **Qualidade** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Batch** | ✅ (10 imgs) | ❌ (1 img) |
| **Custo** | $0.07/img | Grátis |
| **Formato** | URLs | Base64 |

---

## 💻 Exemplos

### Seleção Manual
```typescript
const response = await fetch('/api/internal/images/generate', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'sistema solar',
    count: 6,
    provider: 'grok' // ou 'gemini'
  })
});
```

### Seleção Automática
```typescript
import { getRecommendedProvider } from '@/lib/image-provider-config';

const provider = getRecommendedProvider({
  imageCount: 10,    // → Grok
  needsSpeed: true   // → Grok
});
```

### Batch com Grok
```typescript
import { generateMultipleImagesWithGrok } from '@/lib/grok-image-generator';

const images = await generateMultipleImagesWithGrok([
  'Image 1', 'Image 2', 'Image 3',
  'Image 4', 'Image 5', 'Image 6'
], 'url');
```

---

## 💰 Custos

| Imagens | Grok | Gemini |
|---------|------|--------|
| 1 | $0.07 | $0.00 |
| 6 | $0.42 | $0.00 |
| 100 | $7.00 | $0.00 |
| 1000 | $70.00 | $0.00 |

```typescript
import { calculateCost } from '@/lib/image-provider-config';
const cost = calculateCost('grok', 100); // $7.00
```

---

## 🔧 Verificar Status

```bash
# Via cURL
curl http://localhost:3000/api/internal/images/generate

# Via código
import { getProviderStatus } from '@/lib/image-provider-config';
const status = getProviderStatus();
// { configured: 2, providers: { grok: true, gemini: true } }
```

---

## 🐛 Troubleshooting

### Erro: "XAI_API_KEY not configured"
```bash
# 1. Adicionar ao .env.local
XAI_API_KEY="sua-chave"

# 2. Reiniciar
npm run dev
```

### Erro: "Rate limit exceeded"
Sistema já implementa delay automático (200ms).
Se persistir, reduza número de imagens.

### Imagens em Placeholder
- Verificar API key
- Verificar créditos xAI
- Tentar outro provider

---

## 📚 Documentação

- **Guia Completo**: `GROK_IMAGE_GENERATION_GUIDE.md`
- **API Reference**: `GROK_IMAGE_API_REFERENCE.md`
- **Resumo**: `GROK_INTEGRATION_SUMMARY.md`
- **Changelog**: `CHANGELOG_GROK_INTEGRATION.md`

---

## 🎉 Pronto!

```typescript
// Seu código aqui
const result = await fetch('/api/internal/images/generate', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'seu tema',
    count: 6,
    provider: 'grok' // Rápido!
  })
});

const images = await result.json();
console.log(images); // 6 imagens geradas! 🎨
```

---

**Links Rápidos**:
- Console: https://console.x.ai/
- Docs: https://docs.x.ai/
- Custo: $0.07/imagem
- Rate Limit: 5 req/sec

