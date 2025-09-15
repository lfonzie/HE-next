# Orquestrador e OpenAI - Integração Completa

## Visão Geral da Arquitetura

O sistema HubEdu utiliza uma arquitetura híbrida que combina **heurísticas locais** com **classificação inteligente via OpenAI** para determinar qual módulo deve processar cada mensagem do usuário.

## Fluxo de Funcionamento

### 1. Entrada da Mensagem
```
Usuário → Chat Interface → useChat Hook → API /api/chat
```

### 2. Classificação Inteligente (OpenAI)
```
Mensagem → /api/classify → OpenAI GPT-4o-mini → Módulo Recomendado
```

**Processo de Classificação:**
- **Prompt Especializado**: `MODULE_CLASSIFICATION_PROMPT` contém regras específicas para cada módulo
- **Modelo**: `gpt-4o-mini` com temperatura baixa (0.1) para consistência
- **Formato**: JSON estruturado com `module`, `confidence`, `rationale`, `needsImages`
- **Validação**: Sanitização e fallback para módulos válidos

### 3. Orquestração Inteligente
```
Classificação → Orchestrator → Módulo Específico → Resposta
```

**Componentes do Orquestrador:**

#### A. Detecção de Intenção (`classifyIntent`)
- **Heurística Local**: Análise de palavras-chave e padrões
- **Fallback**: Se heurística falhar, usa classificação OpenAI
- **Contexto**: Considera histórico da conversa

#### B. Decisão de Módulos (`decideModules`)
- **Política de Prioridade**: Ordem específica de preferência
- **Threshold de Confiança**: Mínimo 0.5 para módulos específicos
- **Slots**: Extração de parâmetros necessários (tema, área, etc.)

#### C. Execução do Módulo (`orchestrate`)
- **Validação de Slots**: Verifica parâmetros obrigatórios
- **Execução**: Chama o módulo específico
- **Trace**: Logging completo para debugging

## Módulos Disponíveis

### 1. **PROFESSOR** - Conteúdo Educacional
- **Detecção**: Palavras-chave acadêmicas (matemática, física, biologia, etc.)
- **OpenAI**: Explicações detalhadas, resolução de exercícios
- **Slots**: `tema`, `disciplina`

### 2. **AULA_EXPANDIDA** - Aulas Completas
- **Detecção**: "aula expandida", "aula completa", "explicação completa"
- **OpenAI**: Geração de aulas estruturadas com 8 slides
- **Slots**: `tema`

### 3. **ENEM_INTERATIVO** - Simulados com Explicações
- **Detecção**: "enem interativo", "simulado interativo"
- **OpenAI**: Questões ENEM com explicações detalhadas
- **Slots**: `area`, `quantidade_questoes`

### 4. **TI** - Suporte Técnico
- **Detecção**: Problemas técnicos, equipamentos, sistemas
- **OpenAI**: Diagnóstico e soluções técnicas
- **Slots**: `problema`, `equipamento`

### 5. **RH** - Recursos Humanos
- **Detecção**: Questões de funcionários, benefícios, políticas
- **OpenAI**: Orientações sobre procedimentos internos
- **Slots**: `tipo_consulta`

### 6. **FINANCEIRO** - Questões de Pagamento
- **Detecção**: Mensalidades, boletos, valores
- **OpenAI**: Orientações sobre pagamentos
- **Slots**: `tipo_pagamento`

### 7. **BEM_ESTAR** - Suporte Emocional
- **Detecção**: Ansiedade, conflitos, saúde mental
- **OpenAI**: Apoio emocional e orientações
- **Slots**: `tipo_apoio`

### 8. **SOCIAL_MEDIA** - Marketing Digital
- **Detecção**: Posts, redes sociais, marketing
- **OpenAI**: Criação de conteúdo digital
- **Slots**: `tipo_conteudo`

### 9. **COORDENACAO** - Gestão Pedagógica
- **Detecção**: Coordenação, currículo, avaliações
- **OpenAI**: Orientações pedagógicas
- **Slots**: `area_pedagogica`

### 10. **SECRETARIA** - Documentos Escolares
- **Detecção**: Matrícula, declarações, documentos
- **OpenAI**: Orientações sobre procedimentos
- **Slots**: `tipo_documento`

### 11. **ATENDIMENTO** - Fallback Geral
- **Detecção**: Quando não se encaixa em outros módulos
- **OpenAI**: Chat geral e direcionamento
- **Slots**: Nenhum

## Integração OpenAI por Módulo

### 1. **Classificação Inteligente**
```typescript
// app/api/classify/route.ts
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.1,
  max_tokens: 100,
  messages: [
    { role: "system", content: MODULE_CLASSIFICATION_PROMPT },
    { role: "user", content: userMessage }
  ],
  response_format: { type: "json_object" }
});
```

### 2. **Geração de Conteúdo Educacional**
```typescript
// app/api/module-professor-interactive/route.ts
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "Você é um professor especializado..." },
    { role: "user", content: `Disciplina: ${subject}\nPergunta: ${query}` }
  ],
  max_completion_tokens: 3000,
  temperature: 0.7
});
```

### 3. **Geração de Questões ENEM**
```typescript
// lib/ai/enem-generator.ts
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.7,
  max_tokens: 3000,
  response_format: { type: 'json_object' }
});
```

### 4. **Chat Geral com Contexto**
```typescript
// app/api/chat/stream/route.ts
const messages = [
  {
    role: 'system',
    content: `Você é um professor virtual especializado em educação brasileira...
    Contexto atual: ${context?.module ? `Módulo: ${context.module}` : 'Chat geral'}`
  },
  { role: 'user', content: message }
];
```

## Configuração de Modelos

### Seleção Inteligente de Modelo
```typescript
// lib/openai.ts
export function selectModel(message: string, module?: string): string {
  const complexity = analyzeMessageComplexity(message, module)
  return complexity === 'complex' ? MODELS.COMPLEX : MODELS.SIMPLE
}
```

### Análise de Complexidade
- **Palavras-chave complexas**: análise, síntese, estratégia, metodologia
- **Palavras-chave simples**: o que, como, quando, exemplo, explicação
- **Critérios**: comprimento, múltiplas perguntas, termos técnicos

## Fluxo de Dados Completo

```
1. Usuário envia mensagem
   ↓
2. useChat Hook recebe mensagem
   ↓
3. Classificação automática (se necessário)
   ↓
4. OpenAI classifica módulo apropriado
   ↓
5. Orquestrador decide execução
   ↓
6. Módulo específico é executado
   ↓
7. OpenAI gera conteúdo específico
   ↓
8. Resposta é retornada ao usuário
```

## Vantagens da Arquitetura Híbrida

### 1. **Eficiência**
- Heurísticas locais para casos simples
- OpenAI apenas quando necessário
- Cache de classificações

### 2. **Precisão**
- Classificação inteligente com contexto
- Validação e sanitização
- Fallback robusto

### 3. **Flexibilidade**
- Módulos especializados
- Prompts específicos por área
- Configuração dinâmica

### 4. **Escalabilidade**
- Rate limiting
- Monitoramento de uso
- Otimização de custos

## Monitoramento e Debugging

### 1. **Logs Estruturados**
```typescript
console.log(`🔍 [CLASSIFY] "${userMessage.substring(0, 30)}..."`)
console.log(`✅ [CLASSIFY] ${parsed.module} (${Math.round(parsed.confidence * 100)}%)`)
```

### 2. **Trace Completo**
```typescript
const trace: OrchestratorTrace = {
  module: decision.primary.id,
  confidence: det.confidence,
  intent: det.intent,
  slots: det.slots,
  latencyMs: Date.now() - t0
}
```

### 3. **Métricas de Performance**
- Latência de classificação
- Taxa de acerto
- Uso de tokens
- Custo por requisição

## Conclusão

O sistema HubEdu utiliza uma arquitetura inteligente que combina:

1. **Orquestrador**: Gerencia o fluxo e decide qual módulo usar
2. **OpenAI**: Fornece classificação inteligente e geração de conteúdo
3. **Módulos Especializados**: Cada um com sua função específica
4. **Heurísticas Locais**: Para casos simples e fallback
5. **Monitoramento**: Para otimização contínua

Esta integração permite que o sistema seja tanto eficiente quanto inteligente, fornecendo respostas precisas e contextualizadas para cada tipo de consulta educacional.
