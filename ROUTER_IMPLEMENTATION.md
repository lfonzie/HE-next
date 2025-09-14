# Intelligent Module Router Implementation

## Overview

The Intelligent Module Router is a two-stage classification system that automatically routes user messages to the appropriate module handlers in the HubEdu.ai application. It combines fast regex-based rules with a mock LLM router to provide accurate module classification with telemetry and audit capabilities.

## Architecture

### Two-Stage Classification Pipeline

1. **Stage 1: Fast Rules** - Regex-based pattern matching for immediate classification
2. **Stage 2: LLM Router** - Mock LLM-based classification (can be replaced with actual LLM)
3. **Fusion** - Combines scores from both stages with weighted fusion
4. **Decision** - Routes to appropriate module or fallback to `chat_geral`

### Components

- **API Route**: `/api/router/classify` - Server-side classification endpoint
- **Frontend Hook**: `useModuleRouter` - React hook for frontend integration
- **Module Catalog**: `catalog.json` - Static module definitions and configurations
- **Demo Component**: `RouterDemo` - Example frontend component

## Files Created

### 1. Module Catalog (`catalog.json`)
```json
{
  "version": "1.0.0",
  "modules": [
    {
      "module_id": "enem",
      "name": "ENEM",
      "description": "Handles ENEM-related tasks like simulations, questions, and answer keys.",
      "keywords": ["enem", "simulado", "questão", "questões", "gabarito", "linguagens", "ciencias", "matematica"],
      "entities": ["matematica", "linguagens", "ciencias", "tempo", "dificuldade", "n"],
      "blocklist": ["prova de bolsas", "mensalidade", "matricula"]
    },
    // ... other modules
  ]
}
```

### 2. API Route (`app/api/router/classify/route.ts`)
- Implements two-stage classification pipeline
- Returns JSON response with module_id, intent, entities, confidence, rationale, and trace_id
- Includes circuit breaker fallback to rules-only classification
- Logs telemetry data for auditing

### 3. Frontend Hook (`lib/useModuleRouter.ts`)
- React hook for calling the router API
- Handles loading states and errors
- Dispatches to appropriate module handlers
- Supports manual module correction for learning

### 4. Demo Component (`components/RouterDemo.tsx`)
- Interactive demo of the router functionality
- Test message buttons for quick testing
- Displays classification results with confidence scores
- Shows entity extraction and intent detection

## API Response Format

```json
{
  "module_id": "enem",
  "intent": "buscar_questoes",
  "entities": ["matematica", "tempo", "n"],
  "confidence": 0.82,
  "rationale": "palavras-chave + LLM",
  "trace_id": "router-2025-09-14T13:47:34.054Z"
}
```

## Test Results

The router correctly classifies the following test cases:

1. **"Quero 20 questões de matemática do ENEM com tempo 30min"** → `enem` (72% confidence)
2. **"Não consigo abrir a página, dá erro 404"** → `ti_suporte` (58% confidence)
3. **"Quanto fica a mensalidade com 30% de bolsa?"** → `resultados_bolsas` (62% confidence)
4. **"Preciso fazer minha matrícula na secretaria"** → `secretaria` (70% confidence)
5. **"Como criar uma aula sobre física?"** → `professor_interativo` (57% confidence)
6. **"Build falhou no Render, preciso de ajuda"** → `ti_suporte` (69% confidence)

## Integration with Existing Deployment

### Port Configuration
- **HubEdu.ai**: Port 10000 (main application)
- **ENEM API**: Port 11000 (internal API)
- **Router API**: Available at `/api/router/classify` on HubEdu.ai

### Build Configuration
The existing build scripts in `package.json` are already configured correctly:
```json
{
  "build": "npm run build:hubedu && npm run build:enem",
  "build:hubedu": "next build",
  "build:enem": "cd enem-api-main && npm install --prefer-offline --no-audit && npx prisma generate && npm run build"
}
```

### Render Configuration
The `render-start.sh` script correctly starts both services:
```bash
concurrently --kill-others --prefix-colors "blue,green" --names "HubEdu,ENEM-API" \
  "next start" \
  "cd enem-api-main && PORT=11000 npm start" 2>&1 | tee hubedu.log
```

## Usage Examples

### Frontend Integration
```tsx
import { useModuleRouter } from '@/lib/useModuleRouter';

function ChatComponent() {
  const { response, loading, error, classifyMessage } = useModuleRouter();

  const handleMessage = async (message: string) => {
    await classifyMessage(message);
    
    if (response) {
      switch (response.module_id) {
        case 'enem':
          // Handle ENEM-specific logic
          break;
        case 'ti_suporte':
          // Handle TI support logic
          break;
        // ... other modules
      }
    }
  };

  return (
    // Your chat UI
  );
}
```

### API Testing
```bash
curl -X POST http://localhost:10000/api/router/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "Quero questões de matemática do ENEM", "context": ""}'
```

## Performance Considerations

- **Catalog Caching**: Module catalog is loaded into memory at startup
- **Fast Rules**: Regex patterns provide immediate classification for common cases
- **Circuit Breaker**: Falls back to rules-only if LLM fails
- **Telemetry**: Lightweight logging with trace IDs for auditing

## Future Enhancements

1. **LLM Integration**: Replace mock LLM router with actual LLM (e.g., Grok API)
2. **Learning System**: Implement few-shot learning from user corrections
3. **Caching**: Add Redis caching for improved performance
4. **Analytics**: Store telemetry data in database for analysis
5. **A/B Testing**: Support for testing different classification strategies

## Compliance

- **LGPD**: No PII is included in prompts or logs
- **Auditability**: All decisions are logged with trace IDs
- **Transparency**: Rationale is provided for each classification decision

## Troubleshooting

### Common Issues

1. **Low Confidence Scores**: Check if keywords in catalog match user input patterns
2. **Wrong Module Selection**: Review blocklist rules and keyword priorities
3. **API Errors**: Verify catalog.json is valid and accessible

### Debugging

Enable detailed logging by checking console output for:
- Classification scores
- Rule matches
- LLM router results
- Final decision rationale

## Deployment Checklist

- [ ] `catalog.json` is in project root
- [ ] API route is accessible at `/api/router/classify`
- [ ] Frontend hook is imported correctly
- [ ] Build scripts use `npm install` instead of `npm ci`
- [ ] Render configuration uses port 11000 for ENEM API
- [ ] Environment variables are set correctly
- [ ] Test router functionality before deployment
