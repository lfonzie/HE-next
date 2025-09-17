# System Prompts - HubEdu.ia

Este diretório contém todos os system prompts migrados do projeto HubEdu antigo para o novo projeto Next.js.

## 📁 Estrutura

```
lib/system-prompts/
├── index.ts              # Exportações principais
├── config.ts             # Configuração centralizada dos prompts
├── utils.ts              # Utilitários para gerenciamento de prompts
├── classification.ts     # Prompts de classificação de módulos
├── professor.ts          # Prompts para aulas interativas do professor
├── enem.ts              # Prompts específicos para ENEM
├── support.ts           # Prompts de suporte por módulo
├── ti.ts                # Prompts de suporte técnico
├── lessons.ts           # Prompts para criação de lições
├── common.ts            # Prompts e configurações comuns
└── README.md            # Esta documentação
```

## 🚀 Como Usar

### Importação Básica

```typescript
import { promptManager, getSystemPrompt } from '@/lib/system-prompts';

// Obter um prompt específico
const prompt = getSystemPrompt('professor.interactive.system');

// Usar o gerenciador
const manager = promptManager;
const activePrompts = manager.getActivePrompts();
```

### Construção de Mensagens

```typescript
import { promptManager, PromptRequest } from '@/lib/system-prompts';

const request: PromptRequest = {
  key: 'professor.interactive.system',
  userMessage: 'Preciso de uma aula sobre fotossíntese',
  context: {
    subject: 'Biologia',
    level: 'Ensino Médio'
  }
};

const messages = promptManager.buildMessages(request);
```

### Uso com OpenAI

```typescript
import OpenAI from 'openai';
import { promptManager } from '@/lib/system-prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const request = {
  key: 'professor.interactive.system',
  userMessage: 'Explique a fórmula de Bhaskara'
};

const messages = promptManager.buildMessages(request);
const config = promptManager.getModelConfig(request.key);

const completion = await openai.chat.completions.create({
  model: config.model,
  messages: messages as any,
  temperature: config.temperature,
  max_tokens: config.maxTokens,
});
```

## 📋 Prompts Disponíveis

### Classificação
- `router.intent.system` - Classificação de módulos escolares
- `visual.classification.system` - Classificação de relevância visual
- `topic.extraction.system` - Extração de tópicos concisos

### Professor
- `professor.interactive.system` - Aulas interativas completas (9 slides)
- `professor.expanded_lesson.system` - Aulas expandidas (8 passos)
- `math.integration.system` - Integração matemática

### ENEM
- `enem.interactive.system` - Aulas específicas para ENEM
- `enem.essay.evaluation` - Avaliação de redação ENEM

### Suporte
- `support.general.system` - Suporte técnico geral
- `secretaria.atendimento.system` - Suporte da secretaria
- `rh.support.system` - Suporte de recursos humanos
- `financeiro.support.system` - Suporte financeiro
- `social_media.support.system` - Suporte de redes sociais
- `bem_estar.support.system` - Suporte de bem-estar
- `coordenacao.support.system` - Suporte de coordenação

### TI
- `ti.troubleshoot.system` - Resolução de problemas técnicos
- `ti.hint.system` - Dicas específicas de TI

### Lições
- `lessons.creation.system` - Criação de lições interativas

## 🔧 Configurações

### Modelos Suportados
- `gpt-4o-mini` - Modelo rápido e eficiente para tarefas simples
- `gpt-5-chat-latest` - Modelo mais recente com capacidades avançadas

### Formatos de Resposta
- `json_object` - Para respostas estruturadas
- `text` - Para texto livre
- `markdown` - Para conteúdo formatado

## 📊 Estatísticas

```typescript
import { promptManager } from '@/lib/system-prompts';

const stats = promptManager.getPromptStats();
console.log(stats);
// {
//   total: 20,
//   active: 18,
//   inactive: 1,
//   deprecated: 1,
//   byType: { ... },
//   byModel: { ... }
// }
```

## ✅ Validação

```typescript
import { promptManager, validatePromptContent } from '@/lib/system-prompts';

// Validar um prompt específico
const validation = promptManager.validatePrompt('professor.interactive.system');

// Validar conteúdo de prompt
const contentValidation = validatePromptContent(promptContent);
```

## 🔄 Migração do Projeto Antigo

Todos os prompts foram migrados do projeto HubEdu antigo (`/Users/lf/Documents/HubEdu.ai_/`) e organizados por funcionalidade. As principais mudanças incluem:

1. **Organização modular** - Prompts separados por funcionalidade
2. **Tipagem TypeScript** - Tipos definidos para todos os prompts
3. **Gerenciamento centralizado** - Sistema unificado de gerenciamento
4. **Validação integrada** - Validação automática de prompts
5. **Configuração flexível** - Fácil customização de modelos e parâmetros

## 🛠️ Manutenção

### Adicionar Novo Prompt

1. Adicione o prompt no arquivo apropriado (ex: `professor.ts`)
2. Configure no `config.ts` com todas as propriedades necessárias
3. Teste usando `promptManager.validatePrompt()`

### Atualizar Prompt Existente

1. Modifique o conteúdo no arquivo de origem
2. Atualize a versão no `config.ts`
3. Teste a validação

### Deprecar Prompt

1. Mude o status para `'deprecated'` no `config.ts`
2. Adicione nota na descrição sobre a substituição
3. Mantenha por compatibilidade por algumas versões

## 📝 Notas Importantes

- Todos os prompts usam símbolos Unicode para matemática (não LaTeX)
- Prompts são otimizados para contexto educacional brasileiro
- Validação automática previne erros de configuração
- Sistema de versionamento permite evolução controlada
- Compatibilidade com múltiplos modelos OpenAI
