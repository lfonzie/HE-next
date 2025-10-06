# Sistema de Geração de Imagens com Google Gemini - Documentação

## Visão Geral

Este sistema implementa um mecanismo beta para geração automática de imagens educacionais usando Google Gemini 2.5 Nano Banana. As imagens são geradas através de prompts em inglês para os slides selecionados (6 com imagens) e tudo é estruturado em JSON.

## Características Principais

### ✅ Sistema Beta Ativado por Padrão
- O sistema beta está **ATIVADO** por padrão
- Pode ser **desativado manualmente** a qualquer momento
- Controle total sobre quando usar geração automática de imagens

### 🎯 Slides com Imagens
- **Slides selecionados**: 1, 3, 6, 8, 11, 14
- Cada slide gera um prompt específico em inglês
- Imagens são geradas automaticamente pelo Google Gemini

### 🤖 Integração com Google Gemini
- **Modelo**: Gemini 2.0 Flash Exp (mais recente disponível)
- **Prompts**: Traduzidos automaticamente para inglês
- **Fallback**: Sistema de imagens placeholder em caso de erro

### 📊 Estrutura JSON Completa
- Toda resposta é estruturada em JSON
- Metadados detalhados sobre geração de imagens
- Status do sistema beta incluído

## Arquivos Implementados

### APIs
- `app/api/gemini/generate-lesson-images/route.ts` - Geração de imagens para aulas
- `app/api/aulas/generate-with-gemini-images/route.ts` - API completa de criação de aulas
- `app/api/gemini/beta-control/route.ts` - Controle do sistema beta

### Serviços
- `lib/gemini-lesson-image-service.ts` - Serviço principal de geração de imagens
- `lib/gemini-lesson-json-structure.ts` - Estruturas JSON e validações

### Componentes
- `components/aulas/GeminiImageBetaToggle.tsx` - Toggle para ativar/desativar beta
- `components/aulas/EnhancedAulasModal.tsx` - Modal de criação de aulas atualizado
- `components/admin/GeminiBetaAdminPanel.tsx` - Painel de administração

### Hooks
- `hooks/useGeminiImageBeta.ts` - Hook para gerenciar estado do sistema beta

## Como Usar

### 1. Criar Aula com Sistema Beta

```typescript
// Usar a nova API de geração de aulas
const response = await fetch('/api/aulas/generate-with-gemini-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    topic: 'Fotossíntese',
    betaImagesEnabled: true // Sistema beta ativado
  })
});

const data = await response.json();
console.log('Aula gerada:', data.lesson);
console.log('Status das imagens:', data.betaStatus);
```

### 2. Controlar Sistema Beta

```typescript
// Ativar sistema beta
await fetch('/api/gemini/beta-control', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'enable' })
});

// Desativar sistema beta
await fetch('/api/gemini/beta-control', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'disable' })
});

// Verificar status
const status = await fetch('/api/gemini/beta-control');
const data = await status.json();
console.log('Status do sistema beta:', data.betaStatus);
```

### 3. Usar Componentes React

```tsx
import { EnhancedAulasModal } from '@/components/aulas/EnhancedAulasModal';
import { GeminiImageBetaToggle } from '@/components/aulas/GeminiImageBetaToggle';

function MyComponent() {
  const [betaEnabled, setBetaEnabled] = useState(true);

  return (
    <div>
      <GeminiImageBetaToggle 
        onToggle={setBetaEnabled}
        initialEnabled={betaEnabled}
      />
      
      <EnhancedAulasModal 
        isOpen={true}
        onClose={() => {}}
        initialTopic="Matemática"
      />
    </div>
  );
}
```

## Estrutura JSON de Resposta

### Resposta Completa da API

```json
{
  "success": true,
  "lesson": {
    "id": "aula-gemini-1234567890",
    "title": "Aula sobre Fotossíntese",
    "topic": "Fotossíntese",
    "subject": "Biologia",
    "grade": 8,
    "objectives": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
    "introduction": "Introdução da aula...",
    "slides": [
      {
        "slideNumber": 1,
        "type": "introduction",
        "title": "Introdução à Fotossíntese",
        "content": "Conteúdo do slide...",
        "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "imageData": "iVBORw0KGgoAAAANSUhEUgAA...",
        "imageMimeType": "image/png",
        "generatedBy": "gemini",
        "timeEstimate": 5
      }
    ],
    "summary": "Resumo da aula...",
    "nextSteps": ["Próximo passo 1", "Próximo passo 2"]
  },
  "betaStatus": {
    "enabled": true,
    "model": "gemini-2.0-flash-exp",
    "totalGenerated": 6,
    "totalFailed": 0,
    "generationTime": 15000
  },
  "metadata": {
    "topic": "Fotossíntese",
    "subject": "Biologia",
    "grade": "8",
    "totalSlides": 14,
    "slidesWithImages": 6,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### Status do Sistema Beta

```json
{
  "success": true,
  "action": "status",
  "betaStatus": {
    "enabled": true,
    "model": "gemini-2.0-flash-exp",
    "imageSlides": [1, 3, 6, 8, 11, 14],
    "maxRetries": 3,
    "timeout": 30000,
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "stats": {
      "totalRequests": 25,
      "successfulGenerations": 20,
      "failedGenerations": 5,
      "averageGenerationTime": 12000
    }
  }
}
```

## Configuração

### Variáveis de Ambiente

```bash
# Obrigatória para funcionamento do sistema beta
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Configuração Padrão

```typescript
const DEFAULT_CONFIG = {
  betaSystem: {
    enabled: true, // Sistema beta ATIVADO por padrão
    model: 'gemini-2.0-flash-exp',
    imageSlides: [1, 3, 6, 8, 11, 14],
    maxRetries: 3,
    timeout: 30000
  },
  prompts: {
    language: 'english',
    translationEnabled: true,
    optimizationEnabled: true
  },
  fallback: {
    enabled: true,
    placeholderImages: {
      1: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
      // ... outros slides
    }
  }
};
```

## Fluxo de Funcionamento

1. **Usuário cria aula** com tópico específico
2. **Sistema verifica** se beta está ativado
3. **Se ativado**: Gera conteúdo da aula + imagens com Gemini
4. **Se desativado**: Gera apenas conteúdo da aula
5. **Para slides selecionados**: Cria prompt em inglês
6. **Chama Gemini** para gerar imagem
7. **Se sucesso**: Usa imagem gerada
8. **Se falha**: Usa imagem de fallback
9. **Retorna JSON** estruturado com todos os dados

## Monitoramento e Estatísticas

O sistema inclui estatísticas detalhadas:
- Total de requisições
- Gerações bem-sucedidas
- Falhas na geração
- Tempo médio de geração
- Status do sistema beta

## Fallback e Tratamento de Erros

- **API Key não configurada**: Sistema desativado automaticamente
- **Erro na geração**: Usa imagem de placeholder
- **Timeout**: Usa imagem de fallback
- **Rate limit**: Aguarda e tenta novamente

## Compatibilidade

- ✅ Sistema atual continua funcionando normalmente
- ✅ Sistema novo funciona em paralelo (beta)
- ✅ Pode ser ativado/desativado a qualquer momento
- ✅ Não quebra funcionalidades existentes

## Próximos Passos

1. **Testar** o sistema em ambiente de desenvolvimento
2. **Configurar** API key do Google Gemini
3. **Ativar** sistema beta para testes
4. **Monitorar** estatísticas de geração
5. **Ajustar** configurações conforme necessário

---

**Status**: ✅ Sistema implementado e pronto para uso
**Versão**: 1.0.0
**Data**: Janeiro 2024
