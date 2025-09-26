# System Prompts - HubEdu.ia

Este diretório contém todos os system prompts organizados e centralizados do projeto HubEdu.ia.

## 📁 Estrutura

```
lib/system-prompts/
├── index.ts                    # Exportações principais
├── config.ts                   # Configuração centralizada dos prompts
├── utils.ts                    # Utilitários para gerenciamento de prompts
├── classification.ts           # Prompts de classificação de módulos
├── professor.ts               # Prompts para aulas interativas do professor
├── enem.ts                    # Prompts específicos para ENEM
├── support.ts                 # Prompts de suporte por módulo
├── ti.ts                      # Prompts de suporte técnico
├── lessons.ts                 # Prompts para criação de lições
├── lessons-structured.ts      # Prompts para lições estruturadas
├── lessons-professional-pacing.ts # Prompts para lições com ritmo profissional
├── hubedu-interactive.ts      # Prompts para funcionalidades interativas
├── common.ts                  # Prompts e configurações comuns
├── api-routes.ts              # Prompts específicos para rotas de API
├── modules.ts                 # Prompts específicos para módulos do sistema
├── features.ts                # Prompts específicos para funcionalidades
├── language-config.ts         # Configurações de idioma
├── bncc-config.ts             # Configurações BNCC
├── math-unicode.ts             # Instruções para Unicode matemático
├── unified-config.ts          # Configuração unificada de todos os prompts
└── README.md                  # Esta documentação
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

## 📋 Categorias de Prompts

### 1. API Routes (`api-routes.ts`)
Prompts específicos para diferentes rotas de API:
- `support`: Assistente de suporte geral
- `ti_assist`: Suporte técnico especializado
- `ti_playbook`: Geração de playbooks de troubleshooting
- `enem_explanations`: Explicações de questões ENEM
- `quiz_generation`: Geração de quizzes educacionais
- E muitos outros...

### 2. Modules (`modules.ts`)
Prompts específicos para módulos do sistema:
- `professor`: Assistente educacional
- `ti`: Especialista em TI educacional
- `secretaria`: Assistente de secretaria escolar
- `financeiro`: Especialista em gestão financeira
- `rh`: Especialista em recursos humanos
- `coordenacao`: Coordenação pedagógica
- `atendimento`: Atendimento ao cliente
- `enem`: Preparação para ENEM
- `aula_interativa`: Criação de aulas interativas

### 3. Features (`features.ts`)
Prompts específicos para funcionalidades:
- `module_classification`: Classificação de módulos
- `visual_classification`: Classificação visual
- `topic_extraction`: Extração de tópicos
- `enem_question_generation`: Geração de questões ENEM
- `redacao_evaluation`: Avaliação de redações
- `slide_generation`: Geração de slides
- `quiz_generation`: Geração de quizzes
- `sentiment_analysis`: Análise de sentimento
- `theme_detection`: Detecção de temas
- `content_validation`: Validação de conteúdo

### 4. Específicos
Prompts específicos para funcionalidades particulares:
- `PROFESSOR_INTERACTIVE_PROMPT`: Aulas interativas do professor
- `ENEM_SYSTEM_PROMPT`: Sistema ENEM básico
- `ENEM_SYSTEM_PROMPT_ENHANCED`: Sistema ENEM avançado
- `SUPPORT_SYSTEM_PROMPT`: Sistema de suporte
- `HUBEDU_INTERACTIVE_BASE_PROMPT`: Funcionalidades interativas do HubEdu

### 5. Classificação
Prompts para classificação e análise:
- `MODULE_CLASSIFICATION_PROMPT`: Classificação de módulos
- `VISUAL_CLASSIFICATION_PROMPT`: Classificação visual
- `TOPIC_EXTRACTION_PROMPT`: Extração de tópicos

### 6. Comuns
Prompts e configurações comuns:
- `DEFAULT_SYSTEM_PROMPT`: Prompt padrão do sistema
- `UNICODE_INSTRUCTIONS`: Instruções para Unicode matemático

### 7. TI
Prompts específicos para suporte técnico:
- `TI_TROUBLESHOOTING_PROMPT`: Troubleshooting TI
- `TI_HINT_PROMPT`: Dicas TI
- `TROUBLESHOOTING_STEPS_PROMPT`: Passos de troubleshooting

### 8. Lições
Prompts para criação de lições:
- `LESSON_CREATION_PROMPT`: Criação de lições
- `STRUCTURED_LESSON_PROMPT`: Lições estruturadas
- `PROFESSIONAL_PACING_LESSON_PROMPT`: Lições com ritmo profissional

## 🛠️ Editor de Prompts

### Acesso ao Editor
O editor de prompts está disponível em `/admin/system-prompts-editor` e é restrito a super administradores.

### Funcionalidades do Editor
- **Interface Visual**: Editor com numeração de linhas e syntax highlighting
- **Busca e Filtros**: Busca por nome/descrição e filtros por categoria
- **Edição Avançada**: 
  - Formatação automática
  - Inserção de elementos markdown
  - Contador de caracteres, linhas e palavras
  - Posição do cursor em tempo real
- **Controle de Versão**: Indicação de alterações não salvas
- **Categorização**: Organização por categorias (API Routes, Modules, Features, etc.)

### Como Usar o Editor
1. Acesse `/admin/system-prompts-editor`
2. Selecione um prompt da lista lateral
3. Clique em "Editar" para habilitar a edição
4. Faça suas alterações no editor avançado
5. Use os botões de formatação para melhorar o texto
6. Clique em "Salvar" para confirmar as alterações

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google AI (opcional)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Outros provedores conforme necessário
```

### Configuração de Modelos
Os prompts são configurados com diferentes modelos baseados na complexidade:
- **GPT-4o-mini**: Para prompts simples e rápidos
- **GPT-4o**: Para prompts complexos e críticos
- **Gemini-2.0-flash-exp**: Para prompts que se beneficiam do Google AI

## 📊 Monitoramento

### Métricas Disponíveis
- Número total de prompts
- Prompts ativos por categoria
- Uso por módulo
- Performance por modelo

### Logs
Todos os prompts são logados com:
- Timestamp de uso
- Módulo utilizado
- Tamanho do prompt
- Modelo utilizado
- Tempo de resposta

## 🚨 Importante

### Segurança
- Apenas super administradores podem editar prompts
- Todas as alterações são logadas
- Backup automático antes de alterações críticas

### Boas Práticas
- Sempre teste prompts em ambiente de desenvolvimento
- Mantenha prompts concisos e objetivos
- Use linguagem clara e específica
- Documente alterações significativas
- Monitore performance após mudanças

### Troubleshooting
- Se um prompt não funcionar, verifique a sintaxe
- Confirme se o modelo suporta o tamanho do prompt
- Verifique logs para identificar problemas
- Use o editor para validar formatação

## 📝 Contribuição

### Adicionando Novos Prompts
1. Identifique a categoria apropriada
2. Crie o prompt seguindo as convenções existentes
3. Adicione ao arquivo correspondente
4. Atualize as exportações em `index.ts`
5. Teste o prompt antes de fazer commit

### Convenções
- Use português brasileiro (PT-BR)
- Mantenha tom educativo e profissional
- Seja específico e objetivo
- Inclua exemplos quando apropriado
- Documente casos especiais

## 🔄 Atualizações

### Versionamento
- Cada prompt tem um número de versão
- Alterações significativas incrementam a versão
- Histórico de mudanças é mantido

### Migração
- Prompts antigos são mantidos para compatibilidade
- Novos prompts são adicionados gradualmente
- Deprecação é comunicada com antecedência
```

## 📋 Prompts Disponíveis

### Classificação
- `router.intent.system` - Classificação de módulos escolares
- `visual.classification.system` - Classificação de relevância visual
- `topic.extraction.system` - Extração de tópicos concisos

### Professor
- `professor.interactive.system` - Aulas interativas completas (14 slides)
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
