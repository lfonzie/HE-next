# Resolução de Conflitos - System Prompts

## 🔍 **Problema Identificado**

Havia conflitos entre dois sistemas de prompts criados:

### Sistema 1: Prompts TypeScript
- **Arquivos**: `professor.ts`, `enem.ts`, `support.ts`, `ti.ts`, etc.
- **Configuração**: `config.ts` com `SYSTEM_PROMPTS_CONFIG`
- **Gerenciador**: `utils.ts` com `SystemPromptManager`
- **API**: `/api/system-prompts/example`

### Sistema 2: Prompts JSON
- **Arquivos**: `system-messages.json`, `modules.json`
- **Gerenciador**: `system-messages-loader.ts` com `SystemMessagesLoader`
- **API**: `/api/system-messages`

## ⚠️ **Conflitos Encontrados**

1. **Duplicação de Prompts**: Mesmos prompts em formatos diferentes
2. **Sobreposição de Funcionalidades**: Dois gerenciadores diferentes
3. **APIs Duplicadas**: Duas APIs para acessar prompts
4. **Inconsistências**: Configurações diferentes entre sistemas
5. **Complexidade Desnecessária**: Múltiplas formas de fazer a mesma coisa

## ✅ **Solução Implementada**

### Sistema Unificado Criado

**Arquivo Principal**: `unified-config.ts`
- Combina o melhor dos dois sistemas
- Usa prompts TypeScript (mais completos e organizados)
- Mantém compatibilidade com estrutura JSON
- Sistema único e consistente

### Arquivos Removidos (Conflitantes)
- ❌ `config.ts` (substituído por `unified-config.ts`)
- ❌ `system-messages.json` (prompts migrados para TypeScript)
- ❌ `modules.json` (prompts migrados para TypeScript)
- ❌ `system-messages-loader.ts` (funcionalidade integrada)
- ❌ `/api/system-messages/route.ts` (API duplicada)

### Arquivos Mantidos (Melhorados)
- ✅ `professor.ts` - Prompts do professor (mais completos)
- ✅ `enem.ts` - Prompts ENEM (mais completos)
- ✅ `support.ts` - Prompts de suporte (mais completos)
- ✅ `ti.ts` - Prompts de TI (mais completos)
- ✅ `classification.ts` - Prompts de classificação
- ✅ `lessons.ts` - Prompts de lições
- ✅ `common.ts` - Configurações comuns
- ✅ `utils.ts` - Gerenciador unificado
- ✅ `/api/system-prompts/example` - API unificada

## 🎯 **Sistema Unificado Final**

### Estrutura Simplificada
```
lib/system-prompts/
├── index.ts                 # Exportações principais
├── unified-config.ts        # Configuração centralizada (NOVO)
├── utils.ts                 # Gerenciador unificado
├── classification.ts        # Prompts de classificação
├── professor.ts             # Prompts do professor
├── enem.ts                  # Prompts ENEM
├── support.ts               # Prompts de suporte
├── ti.ts                    # Prompts de TI
├── lessons.ts               # Prompts de lições
├── common.ts                # Configurações comuns
├── README.md                # Documentação
└── CONFLICT_RESOLUTION.md   # Este arquivo
```

### Prompts Disponíveis (20+ prompts)
1. **Classificação**: `router.intent.system`, `visual.classification.system`, `topic.extraction.system`
2. **Professor**: `professor.interactive.system`, `professor.expanded_lesson.system`, `math.integration.system`
3. **ENEM**: `enem.interactive.system`, `enem.essay.evaluation`
4. **TI**: `ti.troubleshoot.system`, `ti.hint.system`
5. **Suporte**: `support.general.system`, `secretaria.atendimento.system`, `rh.support.system`, `financeiro.support.system`, `social_media.support.system`, `bem_estar.support.system`, `coordenacao.support.system`
6. **Lições**: `lessons.creation.system`

## 🚀 **Como Usar o Sistema Unificado**

### Importação Simplificada
```typescript
import { 
  getUnifiedSystemPrompt, 
  getUnifiedActivePrompts,
  promptManager 
} from '@/lib/system-prompts';

// Obter prompt específico
const prompt = getUnifiedSystemPrompt('professor.interactive.system');

// Obter todos os prompts ativos
const activePrompts = getUnifiedActivePrompts();

// Usar gerenciador
const messages = promptManager.buildMessages({
  key: 'professor.interactive.system',
  userMessage: 'Preciso de uma aula sobre fotossíntese'
});
```

### API Unificada
```typescript
// GET - Listar prompts disponíveis
const response = await fetch('/api/system-prompts/example');

// POST - Usar prompt específico
const response = await fetch('/api/system-prompts/example', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    promptKey: 'professor.interactive.system',
    userMessage: 'Explique a fotossíntese'
  })
});
```

## ✨ **Benefícios da Unificação**

1. **Simplicidade**: Um único sistema para gerenciar prompts
2. **Consistência**: Configurações padronizadas
3. **Manutenibilidade**: Mais fácil de manter e atualizar
4. **Performance**: Menos overhead e duplicação
5. **Clareza**: Estrutura mais clara e organizada
6. **Compatibilidade**: Mantém compatibilidade com sistema antigo
7. **Flexibilidade**: Fácil de estender e modificar

## 📊 **Estatísticas Finais**

- **Total de prompts**: 20+ prompts unificados
- **Arquivos removidos**: 5 arquivos conflitantes
- **APIs consolidadas**: 1 API unificada
- **Gerenciadores**: 1 gerenciador unificado
- **Configurações**: 1 sistema de configuração centralizado

## 🔄 **Migração Completa**

O sistema agora está completamente unificado e livre de conflitos. Todos os prompts do projeto HubEdu antigo foram migrados e organizados de forma consistente no novo projeto Next.js.

### Próximos Passos
1. ✅ Conflitos resolvidos
2. ✅ Sistema unificado criado
3. ✅ Documentação atualizada
4. ✅ APIs consolidadas
5. ✅ Testes de funcionamento
6. 🔄 Deploy e validação em produção
