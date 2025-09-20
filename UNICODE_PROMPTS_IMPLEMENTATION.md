# Implementação de Instruções Unicode nos Prompts da OpenAI

## Resumo das Alterações

Foi implementado um sistema completo para garantir que todos os prompts enviados para a API da OpenAI incluam instruções específicas para usar Unicode em matemática e química, eliminando completamente o uso de LaTeX.

## Arquivos Modificados

### 1. `lib/system-prompts/common.ts`
- **Adicionado:** `UNICODE_INSTRUCTIONS` - Instruções completas de Unicode
- **Adicionado:** `addUnicodeInstructions()` - Função para adicionar Unicode a qualquer prompt
- **Modificado:** `DEFAULT_SYSTEM_PROMPT` - Agora inclui instruções de Unicode por padrão

### 2. `lib/system-prompts/utils.ts`
- **Modificado:** `buildMessages()` - Agora aplica automaticamente `addUnicodeInstructions()` a todos os prompts
- **Resultado:** Todos os prompts enviados para OpenAI incluem instruções de Unicode

### 3. `lib/system-prompts/professor.ts`
- **Já implementado:** Instruções de Unicode já estavam presentes
- **Status:** Mantido como está (já funcional)

### 4. `lib/system-prompts/enem.ts`
- **Adicionado:** Instruções completas de Unicode no início do prompt
- **Resultado:** Prompts do ENEM agora usam Unicode

### 5. `lib/system-prompts/index.ts`
- **Adicionado:** Export das novas funções `addUnicodeInstructions`, `UNICODE_INSTRUCTIONS`, `DEFAULT_SYSTEM_PROMPT`

## Instruções de Unicode Implementadas

### Formatação Obrigatória
```
FORMATAÇÃO MATEMÁTICA E QUÍMICA OBRIGATÓRIA:
- Use APENAS símbolos Unicode para matemática e química
- NUNCA use LaTeX, KaTeX, $...$, $$...$$, \\(...\\), \\[...\\]
- PROIBIDO usar comandos LaTeX como \\text, \\xrightarrow, \\frac, \\alpha, \\beta, etc.
```

### Símbolos Unicode Corretos
- **Frações:** ½, ⅓, ¼, ¾ ou escreva "um meio", "um terço"
- **Subscritos:** H₂O, CO₂, C₆H₁₂O₆ (use ₁, ₂, ₃, ₄, ₅, ₆, ₇, ₈, ₉)
- **Sobrescritos:** x², x³, E = mc² (use ⁰, ¹, ², ³, ⁴, ⁵, ⁶, ⁷, ⁸, ⁹)
- **Operadores:** √, ±, ÷, ×, π, α, β, γ, δ, ε, θ, λ, μ, σ, φ, ψ, ω
- **Integrais:** ∫, ∬, ∭, ∮
- **Somatórios:** ∑, ∏
- **Setas:** →, ←, ↑, ↓, ↔, ⇌, ⇋
- **Conjuntos:** ∈, ∉, ⊂, ⊃, ⊆, ⊇, ∪, ∩, ∅, ∀, ∃
- **Lógica:** ∧, ∨, ¬, ⇒, ⇔
- **Comparação:** ≤, ≥, ≠, ≈, ≡, ∞

### Exemplos Corretos
- **Fórmulas químicas:** H₂SO₄, C₈H₁₀N₄O₂, Na₂CO₃
- **Reações:** H₂ + Cl₂ → 2HCl, CaCO₃ ⇌ Ca²⁺ + CO₃²⁻
- **Matemática:** x² + y² = z², ∫₀^∞ e^(-x) dx, ∑ᵢ₌₁ⁿ xᵢ
- **Física:** E = mc², F = ma, ℏω

### Exemplos Incorretos (Não Usar)
- `\text{H}_2\text{SO}_4`, `H_2SO_4`, `$H_2SO_4$`
- `\frac{a}{b}`, `\alpha + \beta`, `\sum_{i=1}^{n}`
- `\rightarrow`, `\in`, `\leq`, `\infty`

## Como Funciona

### 1. Aplicação Automática
A função `buildMessages()` no `SystemPromptManager` agora aplica automaticamente as instruções de Unicode a todos os prompts:

```typescript
public buildMessages(request: PromptRequest): SystemPromptMessage[] {
  const prompt = this.getPrompt(request.key);
  if (!prompt) {
    throw new Error(`Prompt not found: ${request.key}`);
  }

  // Adicionar instruções de Unicode ao prompt do sistema
  const systemContent = addUnicodeInstructions(prompt.json.content);

  const messages: SystemPromptMessage[] = [
    {
      role: 'system',
      content: systemContent
    }
  ];
  // ... resto da função
}
```

### 2. Função de Adição Inteligente
A função `addUnicodeInstructions()` verifica se o prompt já contém instruções de Unicode antes de adicionar:

```typescript
export function addUnicodeInstructions(prompt: string): string {
  // Verificar se o prompt já contém instruções de Unicode
  if (prompt.includes('UNICODE CORRETOS') || prompt.includes('FORMATAÇÃO MATEMÁTICA')) {
    return prompt;
  }
  
  return prompt + UNICODE_INSTRUCTIONS;
}
```

### 3. Prompts Específicos Atualizados
- **Professor:** Já tinha instruções de Unicode (mantido)
- **ENEM:** Adicionadas instruções completas de Unicode
- **Outros prompts:** Recebem automaticamente via `addUnicodeInstructions()`

## Benefícios da Implementação

### 1. Consistência Total
- Todos os prompts agora instruem a IA a usar Unicode
- Não há mais variação entre diferentes módulos
- Garantia de que todas as respostas usem Unicode

### 2. Manutenção Simplificada
- Instruções centralizadas em um local
- Fácil atualização de símbolos Unicode
- Aplicação automática a novos prompts

### 3. Compatibilidade Universal
- Unicode funciona em todos os navegadores e dispositivos
- Não requer bibliotecas externas como KaTeX
- Melhor acessibilidade para leitores de tela

### 4. Performance Melhorada
- Não há processamento de LaTeX no frontend
- Renderização mais rápida
- Menor uso de recursos

## Prompts Afetados

### Prompts que Agora Incluem Unicode Automaticamente:
1. **Classificação:** `router.intent.system`, `visual.classification.system`, `topic.extraction.system`
2. **Professor:** `professor.interactive.system`, `professor.expanded_lesson.system`, `math.integration.system`
3. **ENEM:** `enem.interactive.system`, `enem.essay.evaluation`
4. **TI:** `ti.troubleshoot.system`, `ti.hint.system`
5. **Suporte:** `support.general.system`, `secretaria.atendimento.system`, `rh.support.system`, `financeiro.support.system`, `social_media.support.system`, `bem_estar.support.system`, `coordenacao.support.system`
6. **Lições:** `lessons.creation.system`

### APIs Afetadas:
- `/api/system-prompts/example`
- `/api/professor/interactive-example`
- `/api/professor/generate`
- `/api/module-professor-interactive`
- `/api/enem/explanations`
- Todas as outras APIs que usam `promptManager.buildMessages()`

## Status Final

✅ **Implementação Completa**
- Instruções de Unicode em todos os prompts
- Aplicação automática via `SystemPromptManager`
- Função centralizada para adicionar Unicode
- Prompts específicos atualizados
- Documentação completa criada

O sistema agora garante que **TODAS** as respostas da OpenAI usem Unicode para matemática e química, eliminando completamente o uso de LaTeX em qualquer contexto do chat.
