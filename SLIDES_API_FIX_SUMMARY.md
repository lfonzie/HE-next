# Correções Implementadas no Endpoint /api/slides

## Problema Identificado

O endpoint `/api/slides` estava falhando com erro `SyntaxError: Unexpected token '`', "```json` devido a respostas da API OpenAI que incluíam formatação Markdown em vez de JSON puro.

## Soluções Implementadas

### 1. Sanitização de Resposta JSON

**Arquivo:** `app/api/slides/route.ts`

```typescript
function sanitizeJsonString(content: string): string {
  // First, try to extract JSON from markdown blocks
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  
  // If no markdown blocks, try to find JSON object/array
  const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  
  // Fallback: clean the entire content
  return content
    .replace(/```json/g, '') // Remove ```json
    .replace(/```/g, '')     // Remove ```
    .replace(/^\s+|\s+$/g, '') // Remove espaços em branco no início/fim
    .replace(/\n/g, '')      // Remove quebras de linha
    .replace(/\t/g, '');     // Remove tabulações
}
```

**Funcionalidades:**
- Extrai JSON de blocos Markdown (```json ... ```)
- Identifica objetos/arrays JSON em texto misto
- Remove formatação indesejada como fallback

### 2. Validação de Formato JSON

```typescript
function isPotentiallyValidJson(content: string): boolean {
  const trimmed = content.trim();
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  );
}
```

**Funcionalidades:**
- Verifica se a string tem formato de JSON válido
- Evita chamadas desnecessárias ao `JSON.parse`

### 3. Validação de Estrutura do Slide

```typescript
function validateSlideStructure(slide: any): slide is Slide {
  return (
    slide &&
    typeof slide === 'object' &&
    typeof slide.type === 'string' &&
    ['explanation', 'question', 'closing'].includes(slide.type) &&
    typeof slide.title === 'string' &&
    typeof slide.content === 'string' &&
    slide.title.trim().length > 0 &&
    slide.content.trim().length > 0
  );
}
```

**Funcionalidades:**
- Valida campos obrigatórios do slide
- Verifica tipos de dados corretos
- Garante que campos não estão vazios

### 4. Lógica de Retry Melhorada

```typescript
async function generateSlide(topic: string, position: number, attempt: number = 1): Promise<Slide> {
  // Enhanced prompt for retry attempts
  const retryPrompt = attempt === 1 
    ? basePrompt
    : `${basePrompt}\n\nCRÍTICO: Retorne APENAS um objeto JSON válido, sem blocos de código Markdown (ex.: sem \`\`\`json ou \`\`\`), comentários ou texto adicional. A resposta deve ser exclusivamente JSON puro.`;

  // ... lógica de geração ...

  // Retry with enhanced prompt if not the last attempt
  if (attempt < 3) {
    console.warn(`Retrying slide generation (attempt ${attempt + 1})`);
    return generateSlide(topic, position, attempt + 1);
  }
}
```

**Funcionalidades:**
- Prompts progressivamente mais restritivos
- Retry automático com logging detalhado
- Mensagens de erro específicas

### 5. Logging Detalhado

```typescript
// Log raw response for debugging
console.log(`Raw API response (attempt ${attempt}):`, content);

// Validate JSON format before parsing
if (!isPotentiallyValidJson(sanitizedContent)) {
  console.error(`Response is not in valid JSON format (attempt ${attempt}):`, sanitizedContent);
  throw new Error('Response is not in valid JSON format');
}
```

**Funcionalidades:**
- Log da resposta bruta da API
- Log de tentativas e erros específicos
- Facilita debugging em produção

## Testes Implementados

**Arquivo:** `test-slides-api-fix.js`

### Cenários Testados

1. ✅ **Resposta JSON válida** - JSON puro sem formatação
2. ✅ **Resposta com blocos Markdown** - ```json ... ```
3. ✅ **Resposta com texto adicional** - Texto + JSON + texto
4. ✅ **Resposta JSON inválida** - JSON malformado
5. ✅ **Resposta vazia** - String vazia
6. ✅ **Resposta com estrutura inválida** - JSON válido mas campos faltando

### Resultados dos Testes

```
📊 Resultados: 6/6 testes passaram
🎉 Todos os testes passaram! As correções estão funcionando.
```

## Integração com Simulador ENEM

### Impacto no Módulo Professor Interativa

- **Fallback para Banco Local**: Em caso de falha na geração de slides, o sistema pode usar questões do banco local (2009–2023)
- **Mensagem de Erro na UI**: Exibe mensagem amigável ao usuário em caso de falha persistente
- **Cache de Slides**: Armazena slides gerados com sucesso para reduzir chamadas repetitivas
- **Persistência no Neon**: Salva progresso parcial mesmo com falhas

### Ajustes no Roteiro do Simulador ENEM

1. **Fluxo Geral**: Verificação para garantir fallback imediato em modo misto
2. **Orquestração por Lotes**: Lógica de retry aplicada também à geração de questões IA
3. **Feedback Detalhado**: Cards de erro com questões similares do banco local
4. **Persistência**: Campo `generation_error` em `payload_json` para rastreamento
5. **QA**: Testes para cenários de falha na geração de slides

## Prevenção de Recorrências

### 1. Testes de Prompt
- Validação de prompts em ambiente de teste
- Simulação de respostas com Markdown

### 2. Monitoramento Proativo
- Logs detalhados com ferramentas de observabilidade
- Captura de respostas brutas da API
- Uso de `trace_id` para correlação de eventos

### 3. Validação Contínua
- Testes unitários para o endpoint `/api/slides`
- Simulação de diferentes tipos de resposta

### 4. Documentação de Prompts
- Biblioteca de prompts padronizados
- Versões específicas para JSON puro
- Validação regular contra mudanças na API

## Comandos para Teste

```bash
# Testar correções localmente
node test-slides-api-fix.js

# Testar integração com API real (servidor deve estar rodando)
node test-slides-api-fix.js --integration

# Verificar linting
npm run lint app/api/slides/route.ts
```

## Status da Implementação

- ✅ Sanitização de resposta JSON
- ✅ Validação de formato JSON
- ✅ Validação de estrutura do slide
- ✅ Lógica de retry melhorada
- ✅ Logging detalhado
- ✅ Testes automatizados
- ✅ Documentação completa

**Resultado:** O erro `SyntaxError: Unexpected token '`', "```json` foi completamente resolvido com robustez adicional para diferentes cenários de resposta da API OpenAI.
