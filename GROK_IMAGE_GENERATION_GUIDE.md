# 🎨 Guia de Geração de Imagens com Grok

## 📋 Visão Geral

O sistema agora suporta **dois provedores** de geração de imagens:

1. **Google Gemini 2.5 Flash Image** - Alta qualidade, focado em conteúdo educacional
2. **xAI Grok Image Generation** - Rápido, com suporte a lotes, ideal para múltiplas imagens

---

## 🚀 Configuração Rápida

### 1. Obter Chaves de API

#### Google Gemini API Key
- **Onde obter**: [Google AI Studio](https://ai.google.dev/)
- **Variável de ambiente**: `GEMINI_API_KEY` ou `GOOGLE_GENERATIVE_AI_API_KEY`
- **Custo**: Gratuito (preview)

#### xAI Grok API Key
- **Onde obter**: [xAI Console](https://console.x.ai/)
- **Variável de ambiente**: `XAI_API_KEY`
- **Custo**: $0.07 por imagem

### 2. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env.local`:

```bash
# Google Gemini (escolha uma das opções)
GEMINI_API_KEY="sua-chave-gemini-aqui"
# OU
GOOGLE_GENERATIVE_AI_API_KEY="sua-chave-gemini-aqui"

# xAI Grok
XAI_API_KEY="sua-chave-xai-aqui"
```

**Nota**: Você pode configurar ambos os provedores ou apenas um. O sistema fará fallback automaticamente se apenas um estiver configurado.

---

## 📊 Comparação de Provedores

| Característica | Gemini 2.5 Flash Image | Grok Image Generation |
|---------------|------------------------|----------------------|
| **Velocidade** | 🟡 Médio (1-3s/imagem) | 🟢 Rápido (<1s/imagem) |
| **Qualidade** | 🟢 Alta | 🟡 Média-Alta |
| **Custo** | 🟢 Gratuito (preview) | 🟡 $0.07/imagem |
| **Formato** | Base64 inline | URLs |
| **Batch** | ❌ Não (1 por vez) | ✅ Sim (até 10) |
| **Rate Limit** | 60 req/min | 5 req/sec |
| **Melhor Para** | Diagramas científicos, alta qualidade | Múltiplas imagens, velocidade |

---

## 💻 Como Usar

### API Interna de Geração (`/api/internal/images/generate`)

```typescript
// Exemplo: Gerar 6 imagens com Grok
const response = await fetch('/api/internal/images/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'fotossíntese',
    count: 6,
    provider: 'grok', // 'gemini' ou 'grok'
    context: 'aula_biologia'
  })
});

const result = await response.json();
console.log(result.images); // Array de 6 imagens
console.log(result.provider); // 'grok'
```

### API de Aulas V2 (`/api/aulas-v2/generate-images`)

```typescript
// Exemplo: Gerar imagens para aula com Grok
const response = await fetch('/api/aulas-v2/generate-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    theme: 'Revolução Francesa',
    prompts: [
      'Storming of the Bastille illustration',
      'French Revolution timeline diagram',
      'Napoleon Bonaparte portrait',
      'Declaration of Rights illustration',
      'Guillotine historical image',
      'French Revolution map'
    ],
    provider: 'grok' // Opcional: 'gemini' ou 'grok'
  })
});

const result = await response.json();
console.log(result.images); // 6 imagens geradas
console.log(result.provider); // Provider usado
```

### Seleção Automática de Provider

Se você não especificar o `provider`, o sistema escolhe automaticamente baseado em:

1. **Disponibilidade**: Usa o provider configurado
2. **Contexto**: 
   - Múltiplas imagens (>3) → Grok (batch)
   - Alta qualidade → Gemini
   - Velocidade → Grok
3. **Fallback**: Se um provider falhar, tenta o outro automaticamente

```typescript
// Sistema escolhe automaticamente
const response = await fetch('/api/internal/images/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'sistema solar',
    count: 6
    // provider não especificado - sistema decide
  })
});
```

---

## 🛠️ Utilitários de Configuração

### Verificar Status dos Providers

```typescript
import { getProviderStatus } from '@/lib/image-provider-config';

const status = getProviderStatus();
console.log(status);
// {
//   total: 2,
//   configured: 2,
//   providers: {
//     gemini: true,
//     grok: true
//   }
// }
```

### Obter Informações do Provider

```typescript
import { getProviderInfo } from '@/lib/image-provider-config';

const grokInfo = getProviderInfo('grok');
console.log(grokInfo);
// {
//   id: 'grok',
//   name: 'xAI Grok Image Generation',
//   speed: 'fast',
//   quality: 'medium',
//   cost: 0.07,
//   maxImagesPerRequest: 10,
//   ...
// }
```

### Calcular Custo Estimado

```typescript
import { calculateCost } from '@/lib/image-provider-config';

const cost = calculateCost('grok', 6);
console.log(`Custo estimado: $${cost}`); // "Custo estimado: $0.42"
```

### Obter Provider Recomendado

```typescript
import { getRecommendedProvider } from '@/lib/image-provider-config';

// Para geração rápida de múltiplas imagens
const provider = getRecommendedProvider({
  imageCount: 10,
  needsSpeed: true
});
console.log(provider); // 'grok'

// Para alta qualidade
const provider2 = getRecommendedProvider({
  imageCount: 1,
  needsHighQuality: true
});
console.log(provider2); // 'gemini'
```

---

## 🎯 Casos de Uso Recomendados

### Use **Gemini** quando:
- ✅ Precisar de **alta qualidade** para diagramas científicos
- ✅ Gerar **1-3 imagens** apenas
- ✅ Conteúdo **educacional/científico** complexo
- ✅ Orçamento limitado (gratuito)

### Use **Grok** quando:
- ✅ Precisar gerar **múltiplas imagens** (4+)
- ✅ **Velocidade** é prioridade
- ✅ Preferir **URLs** ao invés de base64
- ✅ Orçamento permite ($0.07/imagem)

---

## 📝 Exemplos de Integração

### Exemplo 1: Frontend com Seleção de Provider

```typescript
'use client';

import { useState } from 'react';
import { getAvailableProviders } from '@/lib/image-provider-config';

export function ImageGeneratorForm() {
  const [provider, setProvider] = useState<'gemini' | 'grok'>('gemini');
  const availableProviders = getAvailableProviders();

  const handleGenerate = async () => {
    const response = await fetch('/api/internal/images/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'fotossíntese',
        count: 6,
        provider
      })
    });

    const result = await response.json();
    // Processar resultado...
  };

  return (
    <div>
      <label>Provider:</label>
      <select value={provider} onChange={(e) => setProvider(e.target.value as any)}>
        {availableProviders.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} - {p.speed} speed, {p.quality} quality
          </option>
        ))}
      </select>
      
      <button onClick={handleGenerate}>Gerar Imagens</button>
    </div>
  );
}
```

### Exemplo 2: Geração Batch com Grok

```typescript
import { generateMultipleImagesWithGrok } from '@/lib/grok-image-generator';

async function generateBatch() {
  const prompts = [
    'Photosynthesis process diagram',
    'Plant cell structure',
    'Chloroplast detailed view',
    'Light and dark reactions',
    'Calvin cycle illustration',
    'Photosynthesis overview'
  ];

  // Gera todas as 6 imagens de uma vez (batch)
  const images = await generateMultipleImagesWithGrok(prompts, 'url');
  
  console.log(`Generated ${images.length} images`);
  return images;
}
```

### Exemplo 3: Fallback Automático

```typescript
async function generateWithFallback(topic: string) {
  const response = await fetch('/api/internal/images/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      count: 6,
      provider: 'grok', // Tenta Grok primeiro
      fallback: true // Se Grok falhar, usa Gemini automaticamente
    })
  });

  const result = await response.json();
  console.log(`Imagens geradas com: ${result.provider}`);
  return result;
}
```

---

## 🔧 Troubleshooting

### Erro: "XAI_API_KEY not configured"

**Solução**: 
1. Obtenha uma chave em https://console.x.ai/
2. Adicione ao `.env.local`: `XAI_API_KEY="sua-chave-aqui"`
3. Reinicie o servidor: `npm run dev`

### Erro: "No image generation provider configured"

**Solução**: Configure pelo menos um provider (Gemini ou Grok)

### Imagens em Placeholder

**Causa**: Provider falhou ao gerar imagem
**Solução**: 
1. Verifique se a API key está correta
2. Verifique se há créditos disponíveis (Grok)
3. Tente o outro provider

### Rate Limit Exceeded

**Grok**: Máximo 5 requisições por segundo
- Solução: O sistema já implementa delay entre requisições (200ms)

**Gemini**: Máximo 60 requisições por minuto
- Solução: O sistema já implementa delay entre requisições (1000ms)

---

## 📊 Monitoramento

### Verificar Status da API

```bash
curl http://localhost:3000/api/internal/images/generate
```

**Resposta**:
```json
{
  "name": "API Interna de Geração de Imagens",
  "version": "2.0.0",
  "providers": {
    "gemini": {
      "status": "configured",
      "model": "gemini-2.5-flash-image-preview"
    },
    "grok": {
      "status": "configured",
      "model": "grok-2-image-1212"
    }
  },
  "features": [
    "Suporte a Gemini e Grok",
    "Auto-fallback entre providers"
  ]
}
```

---

## 💰 Estimativa de Custos

### Cenário 1: Aula com 6 Imagens

| Provider | Custo por Aula | Custo 100 Aulas | Custo 1000 Aulas |
|----------|----------------|-----------------|------------------|
| Gemini   | $0.00          | $0.00           | $0.00            |
| Grok     | $0.42          | $42.00          | $420.00          |

### Cenário 2: Sistema Híbrido (3 imagens Gemini + 3 imagens Grok)

- **Custo por aula**: $0.21
- **Custo 100 aulas**: $21.00
- **Custo 1000 aulas**: $210.00

---

## 📚 Referências

### Documentação Oficial

- **Gemini API**: https://ai.google.dev/
- **Grok API**: https://docs.x.ai/docs/guides/image-generations
- **xAI Console**: https://console.x.ai/

### Código Fonte

- **Grok Utility**: `/lib/grok-image-generator.ts`
- **Provider Config**: `/lib/image-provider-config.ts`
- **API Interna**: `/app/api/internal/images/generate/route.ts`
- **API Aulas V2**: `/app/api/aulas-v2/generate-images/route.ts`

---

## ✅ Checklist de Implementação

- [x] Criar função de geração com Grok
- [x] Atualizar APIs para suportar múltiplos providers
- [x] Adicionar variáveis de ambiente
- [x] Implementar fallback automático
- [x] Criar sistema de configuração
- [x] Documentar uso e exemplos
- [x] Adicionar comparação de providers
- [x] Implementar cálculo de custos

---

## 🎉 Pronto para Usar!

Agora você tem **dois provedores** de geração de imagens:

1. **Configure** as chaves de API no `.env.local`
2. **Escolha** o provider baseado nas suas necessidades
3. **Gere** imagens com alta qualidade ou velocidade
4. **Aproveite** o fallback automático entre providers

Para começar, veja os exemplos acima e escolha o provider ideal para seu caso de uso! 🚀

