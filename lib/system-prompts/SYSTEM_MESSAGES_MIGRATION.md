# Migração do system-messages.json

## 📋 Resumo da Migração

Este documento descreve a migração do arquivo `system-messages.json` do projeto HubEdu antigo (`/Users/lf/Documents/HubEdu.ai_/client/src/config/system-messages.json`) para o novo projeto Next.js.

## 🔍 Arquivo Original Encontrado

**Localização**: `/Users/lf/Documents/HubEdu.ai_/client/src/config/system-messages.json`

**Conteúdo**: Arquivo JSON completo com configurações de todos os módulos do sistema HubEdu.ia, incluindo:

- **9 módulos principais**: GENERAL, PROFESSOR, AULA_EXPANDIDA, SOCIAL_MEDIA, BEM_ESTAR, TI, FINANCEIRO, RH, ATENDIMENTO, COORDENACAO
- **Configurações globais**: HubEdu, configurações técnicas, integração, analytics
- **Metadados**: Versão, data de atualização, descrição do sistema

## 📁 Arquivos Criados na Migração

### 1. `system-messages.json`
- Versão atualizada do arquivo original
- Estrutura simplificada focada nos módulos essenciais
- Versão atualizada para 3.0.0

### 2. `modules.json`
- Módulos principais extraídos do arquivo original
- Foco nos módulos PROFESSOR e AULA_EXPANDIDA
- Estrutura otimizada para uso programático

### 3. `system-messages-loader.ts`
- Classe `SystemMessagesLoader` para carregar e gerenciar os dados
- Métodos para acessar módulos, validar configurações
- Conversão para formato `SystemPromptConfig`
- Singleton pattern para eficiência

### 4. `app/api/system-messages/route.ts`
- API REST para acessar os system messages
- Endpoints GET e POST para diferentes operações
- Validação e tratamento de erros

## 🎯 Módulos Migrados

### Módulos Principais
1. **GENERAL** - Assistente educacional geral
2. **PROFESSOR** - Professor particular digital
3. **AULA_EXPANDIDA** - Aulas interativas expandidas
4. **SOCIAL_MEDIA** - Criação de conteúdo digital
5. **BEM_ESTAR** - Suporte socioemocional
6. **TI** - Suporte técnico especializado
7. **FINANCEIRO** - Consultoria financeira educacional
8. **RH** - Gestão de recursos humanos
9. **ATENDIMENTO** - Atendimento geral institucional
10. **COORDENACAO** - Liderança pedagógica

### Características de Cada Módulo
- **systemPrompt**: Prompt principal do módulo
- **description**: Descrição do módulo
- **category**: Categoria (pedagogico, tecnico, financeiro, etc.)
- **isActive**: Status ativo/inativo
- **priority**: Prioridade (high, medium, low)
- **temperature**: Temperatura para OpenAI
- **maxTokens**: Máximo de tokens
- **maxCompletionTokens**: Máximo de tokens de completação
- **tone**: Tom de comunicação
- **targetAudience**: Audiência alvo

## 🚀 Como Usar

### Importação Básica
```typescript
import { systemMessagesLoader } from '@/lib/system-prompts';

// Obter módulo específico
const professorModule = systemMessagesLoader.getModule('PROFESSOR');

// Obter system prompt
const prompt = systemMessagesLoader.getSystemPrompt('PROFESSOR');

// Obter configuração
const config = systemMessagesLoader.getModuleConfig('PROFESSOR');
```

### Uso com API
```typescript
// GET - Listar todos os módulos
const response = await fetch('/api/system-messages');

// GET - Módulo específico
const response = await fetch('/api/system-messages?module=PROFESSOR');

// POST - Validar módulo
const response = await fetch('/api/system-messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'validate',
    moduleName: 'PROFESSOR'
  })
});
```

### Conversão para SystemPromptConfig
```typescript
import { systemMessagesLoader } from '@/lib/system-prompts';

// Converter módulo para SystemPromptConfig
const config = systemMessagesLoader.convertToSystemPromptConfig('PROFESSOR');

// Obter todos os configs
const allConfigs = systemMessagesLoader.getAllSystemPromptConfigs();
```

## 📊 Estatísticas

### Métricas Disponíveis
- **Total de módulos**: 10 módulos
- **Módulos ativos**: 10 módulos
- **Por categoria**: pedagogico (4), tecnico (1), financeiro (1), etc.
- **Por prioridade**: high (8), medium (2)
- **Por audiência**: estudantes, professores, gestores, etc.

### Validação
```typescript
// Validar módulo específico
const validation = systemMessagesLoader.validateModule('PROFESSOR');
console.log(validation.valid); // true/false
console.log(validation.errors); // array de erros
```

## 🔧 Configurações Técnicas

### Configurações Globais
- **Versão**: 3.0.0
- **Linguagem**: pt-BR
- **Framework Educacional**: BNCC
- **Compliance**: LGPD, LDB, ECA, CLT

### Configurações de API
- **Timeout**: 45 segundos
- **Rate Limit**: 100 req/min, 2000 req/hora
- **Retry Attempts**: 3 tentativas
- **Caching**: TTL de 1 hora

### Configurações de Segurança
- **Encryption**: AES-256
- **Data Retention**: Minimal
- **Access Control**: Role-based
- **Privacy by Design**: Ativado

## ✨ Melhorias Implementadas

1. **Organização Modular**: Separação clara entre diferentes tipos de prompts
2. **Tipagem TypeScript**: Tipos definidos para todas as estruturas
3. **Validação Integrada**: Validação automática de configurações
4. **API RESTful**: Endpoints organizados para diferentes operações
5. **Singleton Pattern**: Gerenciamento eficiente de recursos
6. **Documentação Completa**: README e exemplos de uso
7. **Compatibilidade**: Mantém compatibilidade com sistema antigo

## 🔄 Próximos Passos

1. **Migração Completa**: Migrar todos os módulos restantes do arquivo original
2. **Testes**: Implementar testes unitários para o loader
3. **Cache**: Implementar cache inteligente para melhor performance
4. **Monitoramento**: Adicionar métricas de uso e performance
5. **Atualização**: Sistema de versionamento para atualizações de prompts

## 📝 Notas Importantes

- Todos os prompts mantêm foco exclusivo no aluno
- Uso obrigatório de símbolos Unicode para matemática (não LaTeX)
- Protocolo de veracidade implementado em todos os módulos
- Alinhamento com BNCC e contexto educacional brasileiro
- Segurança e privacidade como prioridades fundamentais
