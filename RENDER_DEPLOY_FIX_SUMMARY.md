# Render Deploy Fix - Resumo das Correções

## Problema Identificado
O deploy no Render estava falhando devido ao erro:
```
Module not found: Can't resolve '@google/genai'
```

## Correções Aplicadas

### 1. ✅ Instalação da Dependência Correta
- **Problema**: O código importava `@google/genai` mas o package.json tinha `@google/generative-ai`
- **Solução**: Instalado `@google/genai@^0.6.0`
```bash
npm install "@google/genai@^0.6.0"
```

### 2. ✅ Configuração de Runtime nos Handlers
Adicionado `runtime = 'nodejs'` e `dynamic = 'force-dynamic'` nos arquivos:
- `app/api/chat/live/send-audio-stream/route.ts`
- `app/api/chat/live/send-screen-stream/route.ts` 
- `app/api/chat/live/send-video-stream/route.ts`
- `app/api/test/live-connect/route.ts`

```typescript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

### 3. ✅ Correção do next.config.js
- **Problema**: `outputFileTracingRoot` estava em `experimental` (deprecated)
- **Solução**: Movido para raiz da configuração
```javascript
const nextConfig = {
  outputFileTracingRoot: __dirname,
  // ... outras configurações
}
```

### 4. ✅ Verificação de Lockfiles
- **Status**: ✅ Apenas um `package-lock.json` na raiz (correto)
- **Localização**: `/Users/lf/Documents/GitHub/HE-next/package-lock.json`

### 5. ✅ Criação de APIs Mock para Build
Criadas APIs mock para permitir build das páginas admin:
- `app/api/system-prompts/route.ts`
- `app/api/system-prompts/[id]/route.ts`
- `app/api/system-prompts/[id]/publish/route.ts`
- `app/api/system-prompts/[id]/preview/route.ts`

### 6. ✅ Teste de Build Local
- **Status**: ✅ Build bem-sucedido
- **Tempo**: 19.7s
- **Páginas geradas**: 153/153
- **Erros**: 0

## Arquivos Modificados

### Dependências
- `package.json` - Adicionado `@google/genai@^0.6.0`

### Configuração
- `next.config.js` - Corrigido `outputFileTracingRoot`

### Handlers de API
- `app/api/chat/live/send-audio-stream/route.ts`
- `app/api/chat/live/send-screen-stream/route.ts`
- `app/api/chat/live/send-video-stream/route.ts`
- `app/api/test/live-connect/route.ts`

### APIs Mock
- `app/api/system-prompts/route.ts` (novo)
- `app/api/system-prompts/[id]/route.ts` (novo)
- `app/api/system-prompts/[id]/publish/route.ts` (novo)
- `app/api/system-prompts/[id]/preview/route.ts` (novo)

## Próximos Passos para Deploy

1. **Commit das alterações**:
```bash
git add .
git commit -m "fix: resolve @google/genai import error for Render deploy"
git push
```

2. **Verificar variáveis de ambiente no Render**:
- `GOOGLE_API_KEY` (ou `GEMINI_API_KEY`)
- `NODE_OPTIONS=--max-old-space-size=4096`
- `NEXT_TELEMETRY_DISABLED=1`

3. **Build Command no Render**:
```bash
NODE_OPTIONS='--max-old-space-size=4096' npm ci --include=dev && NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

## Status Final
✅ **PRONTO PARA DEPLOY** - Todas as correções aplicadas e build local bem-sucedido
