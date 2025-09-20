/**
 * Instruções específicas para formatação matemática em Unicode
 * Versão atualizada com foco em trigonometria e fórmulas matemáticas
 */

export const ENHANCED_UNICODE_INSTRUCTIONS = `

🚨 IDIOMA OBRIGATÓRIO E CRÍTICO: 
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIA e NÃO NEGOCIÁVEL
- Se detectar que está respondendo em outro idioma, pare imediatamente e refaça em português brasileiro

FORMATAÇÃO MATEMÁTICA E QUÍMICA OBRIGATÓRIA:
- Use APENAS símbolos Unicode para matemática e química
- NUNCA use LaTeX, KaTeX, $...$, $$...$$, \\(...\\), \\[...\\]
- PROIBIDO usar comandos LaTeX como \\text, \\xrightarrow, \\frac, \\alpha, \\beta, etc.
- PROIBIDO usar \\sin, \\cos, \\tan, \\frac{a}{b}, \\sqrt{a}, etc.

SÍMBOLOS UNICODE CORRETOS:
- Frações: ½, ⅓, ¼, ¾ ou escreva "um meio", "um terço"
- Subscritos: H₂O, CO₂, C₆H₁₂O₆ (use ₁, ₂, ₃, ₄, ₅, ₆, ₇, ₈, ₉)
- Sobrescritos: x², x³, E = mc² (use ⁰, ¹, ², ³, ⁴, ⁵, ⁶, ⁷, ⁸, ⁹)
- Operadores: √, ±, ÷, ×, π, α, β, γ, δ, ε, θ, λ, μ, σ, φ, ψ, ω
- Integrais: ∫, ∬, ∭, ∮
- Somatórios: ∑, ∏
- Setas: →, ←, ↑, ↓, ↔, ⇌, ⇋
- Conjuntos: ∈, ∉, ⊂, ⊃, ⊆, ⊇, ∪, ∩, ∅, ∀, ∃
- Lógica: ∧, ∨, ¬, ⇒, ⇔
- Comparação: ≤, ≥, ≠, ≈, ≡, ∞

FUNÇÕES TRIGONOMÉTRICAS EM PORTUGUÊS:
- Use "sen" em vez de "sin" ou "\\sin"
- Use "cos" em vez de "\\cos"
- Use "tg" em vez de "tan" ou "\\tan"
- Use "cotg" em vez de "cot" ou "\\cot"
- Use "sec" em vez de "\\sec"
- Use "cossec" em vez de "csc" ou "\\csc"

EXEMPLOS CORRETOS:
- Fórmulas químicas: H₂SO₄, C₈H₁₀N₄O₂, Na₂CO₃
- Reações: H₂ + Cl₂ → 2HCl, CaCO₃ ⇌ Ca²⁺ + CO₃²⁻
- Matemática: x² + y² = z², ∫₀^∞ e^(-x) dx, ∑ᵢ₌₁ⁿ xᵢ
- Física: E = mc², F = ma, ℏω
- Trigonometria: sen²θ + cos²θ = 1, sen(2θ) = 2·sen(θ)·cos(θ)
- Identidades: cos(2θ) = cos²θ - sen²θ, tg(θ) = sen(θ)/cos(θ)
- Fórmulas de adição: sen(a ± b) = sen(a)·cos(b) ± cos(a)·sen(b)
- Fórmulas de duplicação: sen(2θ) = 2·sen(θ)·cos(θ), cos(2θ) = cos²θ - sen²θ

EXEMPLOS INCORRETOS (NÃO USAR):
- \\text{H}_2\\text{SO}_4, H_2SO_4, $H_2SO_4$
- \\frac{a}{b}, \\alpha + \\beta, \\sum_{i=1}^{n}
- \\rightarrow, \\in, \\leq, \\infty
- \\sin(θ), \\cos(θ), \\tan(θ), \\frac{sen(θ)}{cos(θ)}
- \\sin^2(θ), \\cos^2(θ), \\sqrt{a^2 + b^2}
- \\sin(2\\theta), \\cos(2\\theta), \\tan(2\\theta)
- \\frac{\\sin(a)}{\\cos(a)}, \\frac{1}{\\sin(\\theta)}`;

/**
 * Instruções específicas para fórmulas trigonométricas
 */
export const TRIGONOMETRY_INSTRUCTIONS = `

FÓRMULAS TRIGONOMÉTRICAS - SEMPRE EM UNICODE:

IDENTIDADES FUNDAMENTAIS:
- sen²θ + cos²θ = 1
- tg(θ) = sen(θ)/cos(θ)
- cotg(θ) = cos(θ)/sen(θ)
- sec(θ) = 1/cos(θ)
- cossec(θ) = 1/sen(θ)

FÓRMULAS DE ADIÇÃO E SUBTRAÇÃO:
- sen(a ± b) = sen(a)·cos(b) ± cos(a)·sen(b)
- cos(a ± b) = cos(a)·cos(b) ∓ sen(a)·sen(b)
- tg(a ± b) = (tg(a) ± tg(b))/(1 ∓ tg(a)·tg(b))

FÓRMULAS DE DUPLICAÇÃO:
- sen(2θ) = 2·sen(θ)·cos(θ)
- cos(2θ) = cos²θ - sen²θ = 2·cos²θ - 1 = 1 - 2·sen²θ
- tg(2θ) = 2·tg(θ)/(1 - tg²θ)

FÓRMULAS DE MEIO ÂNGULO:
- sen(θ/2) = ±√((1 - cos(θ))/2)
- cos(θ/2) = ±√((1 + cos(θ))/2)
- tg(θ/2) = (1 - cos(θ))/sen(θ) = sen(θ)/(1 + cos(θ))

LEI DOS SENOS E COSSENOS:
- Lei dos Senos: a/sen(A) = b/sen(B) = c/sen(C)
- Lei dos Cossenos: a² = b² + c² - 2·b·c·cos(A)

IMPORTANTE: NUNCA use \\sin, \\cos, \\tan, \\frac, \\sqrt, \\theta, etc.
SEMPRE use: sen, cos, tg, √, θ, ², ³, etc.`;

/**
 * Função para adicionar instruções de Unicode aprimoradas a qualquer prompt
 */
export function addEnhancedUnicodeInstructions(prompt: string): string {
  // Verificar se o prompt já contém instruções de Unicode
  if (prompt.includes('UNICODE CORRETOS') || prompt.includes('FORMATAÇÃO MATEMÁTICA')) {
    return prompt;
  }
  
  return prompt + ENHANCED_UNICODE_INSTRUCTIONS;
}

/**
 * Função para adicionar instruções específicas de trigonometria
 */
export function addTrigonometryInstructions(prompt: string): string {
  return prompt + TRIGONOMETRY_INSTRUCTIONS;
}
