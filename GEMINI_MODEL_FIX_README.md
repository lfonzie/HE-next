# Correção do Erro 404 "Publisher Model not found" - Gemini Models

## Problema Identificado

O erro `404 Publisher Model not found` estava ocorrendo porque o sistema estava tentando usar modelos Gemini com sufixo `-002` (ex: `gemini-1.5-flash-002`) no endpoint **Google AI for Developers**, onde esses sufixos são inválidos/descontinuados.

### Causa Raiz

1. **Mistura de endpoints**: O código estava usando o endpoint **Google AI for Developers** (`generativelanguage.googleapis.com`) mas com IDs de modelo do **Vertex AI** (`publishers/google/models/gemini-1.5-flash-002`)
2. **Modelos descontinuados**: Os sufixos `-001`, `-002` foram descontinuados para projetos novos no Google AI for Developers
3. **IDs incorretos**: O AI SDK espera IDs "curtos" como `gemini-2.5-flash`, não `gemini-1.5-flash-002`

## Solução Implementada

### 1. Arquivo de Resolução de Modelos (`lib/ai/resolveGoogleModel.ts`)

Criado sistema centralizado para resolver modelos Google corretamente:

```typescript
// Modelos válidos para Google AI for Developers
const DEV_MODELS = {
  'flash25': 'gemini-2.5-flash',
  'pro25': 'gemini-2.5-pro',
  'flash15': 'gemini-1.5-flash',  // sem sufixo -002
  'pro15': 'gemini-1.5-pro',
} as const;

export function resolveGoogleModel(base: GoogleModelKey, provider: GoogleProvider = 'dev'): string {
  if (provider === 'dev') {
    return DEV_MODELS[base];
  }
  throw new Error('Vertex AI não suportado neste endpoint');
}
```

### 2. Atualização de Configurações

**Arquivos atualizados:**
- `lib/ai-sdk-production-config.ts` - Modelos de produção
- `app/api/classify/route.ts` - Classificador principal
- `lib/ultra-fast-classifier.ts` - Classificador ultra-rápido
- `lib/ai-model-router.ts` - Roteador de modelos
- `lib/ai-providers.ts` - Provedores de IA

**Mudanças principais:**
```typescript
// ANTES (causava erro 404)
google: {
  simple: 'gemini-1.5-flash',  // poderia ser normalizado para -002
  complex: 'gemini-1.5-pro',
  fast: 'gemini-1.5-flash'
}

// DEPOIS (funcionando)
google: {
  simple: 'gemini-2.5-flash',  // modelo atual recomendado
  complex: 'gemini-2.5-pro',
  fast: 'gemini-2.5-flash'
}
```

### 3. Configuração de Ambiente

Criado `env.google-fixed.example` com modelos corretos:

```bash
# Modelos Google recomendados (2025)
GOOGLE_MODEL_DEFAULT=gemini-2.5-flash
GOOGLE_MODEL_CLASSIFY=gemini-2.5-flash
GOOGLE_MODEL_CHAT=gemini-2.5-pro
GOOGLE_MODEL_COMPLEX=gemini-2.5-pro
GOOGLE_MODEL_FAST=gemini-2.5-flash
```

### 4. Script de Teste

Criado `test-google-models-fix.js` para validar a correção:

```bash
node test-google-models-fix.js
```

## Modelos Válidos vs Inválidos

### ✅ Modelos Válidos (Google AI for Developers)
- `gemini-2.5-flash` - Recomendado para uso geral
- `gemini-2.5-pro` - Recomendado para tarefas complexas
- `gemini-1.5-flash` - Modelo legado ainda suportado
- `gemini-1.5-pro` - Modelo legado ainda suportado

### ❌ Modelos Inválidos (causam erro 404)
- `gemini-1.5-flash-002` - Sufixo descontinuado
- `gemini-1.5-pro-002` - Sufixo descontinuado
- `gemini-2.0-flash-exp-002` - Sufixo descontinuado

## Como Usar

### 1. Atualizar Variáveis de Ambiente

```bash
# Copiar configuração corrigida
cp env.google-fixed.example .env.local

# Editar com suas chaves de API
nano .env.local
```

### 2. Testar a Correção

```bash
# Executar script de teste
node test-google-models-fix.js
```

### 3. Usar nos Códigos

```typescript
import { resolveGoogleModel, getDefaultGoogleModel } from '@/lib/ai/resolveGoogleModel';

// Usar modelo recomendado
const model = google(getDefaultGoogleModel('simple')); // gemini-2.5-flash

// Ou resolver explicitamente
const model = google(resolveGoogleModel('flash25', 'dev')); // gemini-2.5-flash
```

## Verificação da Correção

### Antes da Correção
```
❌ Error: 404 Publisher Model not found
❌ URL: generativelanguage.googleapis.com/.../models/gemini-1.5-flash:generateContent
❌ Error message: publishers/google/models/gemini-1.5-flash-002
```

### Depois da Correção
```
✅ Success: Model working correctly
✅ URL: generativelanguage.googleapis.com/.../models/gemini-2.5-flash:generateContent
✅ Response: "OK"
```

## Referências

- [Google AI for Developers - Modelos](https://ai.google.dev/gemini-api/docs/models)
- [AI SDK - Google Provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)
- [Vertex AI vs Google AI for Developers](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions)

## Notas Importantes

1. **Não misturar endpoints**: Use Google AI for Developers OU Vertex AI, não ambos
2. **IDs canônicos**: Use sempre IDs "curtos" para Google AI for Developers
3. **Modelos atuais**: Prefira `gemini-2.5-flash/pro` sobre modelos legados
4. **Sem sufixos**: Nunca adicione `-001`, `-002` aos IDs de modelo
5. **Teste sempre**: Use o script de teste após mudanças de configuração
