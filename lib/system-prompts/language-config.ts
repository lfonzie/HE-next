// lib/system-prompts/language-config.ts
// Configuração centralizada de idioma para garantir que todos os módulos respondam exclusivamente em português brasileiro

export const LANGUAGE_CONFIG = {
  // Instrução obrigatória de idioma para TODOS os prompts
  MANDATORY_LANGUAGE_INSTRUCTION: `
🚨 IDIOMA OBRIGATÓRIO E CRÍTICO - INSTRUÇÃO NÃO NEGOCIÁVEL:
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIA e NÃO NEGOCIÁVEL
- Se detectar que está respondendo em outro idioma, pare imediatamente e refaça em português brasileiro
- Use apenas termos e expressões em português brasileiro
- Adapte exemplos e referências para o contexto brasileiro
- Use linguagem clara, didática e apropriada para estudantes brasileiros`,

  // Instruções específicas para formatação matemática
  MATH_FORMATTING_INSTRUCTIONS: `
FORMATAÇÃO MATEMÁTICA E QUÍMICA OBRIGATÓRIA:
- Use APENAS símbolos Unicode para matemática e química
- NUNCA use LaTeX, KaTeX, $...$, $$...$$, \\(...\\), \\[...\\]
- PROIBIDO usar comandos LaTeX como \\text, \\xrightarrow, \\frac, \\alpha, \\beta, etc.

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

EXEMPLOS CORRETOS:
- Fórmulas químicas: H₂SO₄, C₈H₁₀N₄O₂, Na₂CO₃
- Reações: H₂ + Cl₂ → 2HCl, CaCO₃ ⇌ Ca²⁺ + CO₃²⁻
- Matemática: x² + y² = z², ∫₀^∞ e^(-x) dx, ∑ᵢ₌₁ⁿ xᵢ
- Física: E = mc², F = ma, ℏω

EXEMPLOS INCORRETOS (NÃO USAR):
- \\text{H}_2\\text{SO}_4, H_2SO_4, $H_2SO_4$
- \\frac{a}{b}, \\alpha + \\beta, \\sum_{i=1}^{n}
- \\rightarrow, \\in, \\leq, \\infty`,

  // Instruções para contexto brasileiro
  BRAZILIAN_CONTEXT_INSTRUCTIONS: `
CONTEXTO BRASILEIRO OBRIGATÓRIO:
- Use exemplos do cotidiano brasileiro
- Referencie a BNCC (Base Nacional Comum Curricular) e suas competências específicas
- Identifique e desenvolva as competências BNCC relacionadas ao conteúdo
- Exercite habilidades específicas da BNCC em cada atividade
- Use termos educacionais brasileiros (ensino médio, vestibular, ENEM)
- Adapte situações para a realidade brasileira
- Use linguagem apropriada para estudantes brasileiros
- Referencie instituições e sistemas educacionais brasileiros`,

  // Instruções para diferentes tipos de módulos
  MODULE_SPECIFIC_INSTRUCTIONS: {
    professor: `
MÓDULO PROFESSOR - INSTRUÇÕES ESPECÍFICAS:
- Seja didático e pedagógico
- Use linguagem clara e acessível
- Adapte o conteúdo ao nível educacional brasileiro
- Use exemplos práticos do dia a dia brasileiro
- Foque no aprendizado efetivo e compreensão dos conceitos`,

    ti: `
MÓDULO TI - INSTRUÇÕES ESPECÍFICAS:
- Use terminologia técnica em português brasileiro
- Adapte soluções para o contexto brasileiro
- Use linguagem clara e objetiva
- Forneça instruções passo a passo em português`,

    financeiro: `
MÓDULO FINANCEIRO - INSTRUÇÕES ESPECÍFICAS:
- Use terminologia financeira brasileira
- Referencie moeda brasileira (Real - R$)
- Use exemplos do sistema financeiro brasileiro
- Adapte para a realidade econômica brasileira`,

    rh: `
MÓDULO RH - INSTRUÇÕES ESPECÍFICAS:
- Use terminologia de recursos humanos brasileira
- Referencie legislação trabalhista brasileira (CLT)
- Adapte para a realidade do mercado de trabalho brasileiro
- Use linguagem profissional e clara`,

    bem_estar: `
MÓDULO BEM-ESTAR - INSTRUÇÕES ESPECÍFICAS:
- Use linguagem acolhedora e empática
- Adapte para a realidade educacional brasileira
- Referencie recursos de apoio disponíveis no Brasil
- Use tom profissional mas humanizado`,

    social_media: `
MÓDULO SOCIAL MEDIA - INSTRUÇÕES ESPECÍFICAS:
- Use terminologia de marketing digital brasileira
- Adapte para plataformas populares no Brasil
- Use linguagem adequada para redes sociais brasileiras
- Foque em conteúdo educativo e institucional`,

    coordenacao: `
MÓDULO COORDENAÇÃO - INSTRUÇÕES ESPECÍFICAS:
- Use terminologia pedagógica brasileira
- Referencie a BNCC e diretrizes educacionais brasileiras
- Adapte para a realidade das escolas brasileiras
- Use linguagem profissional e educativa`,

    secretaria: `
MÓDULO SECRETARIA - INSTRUÇÕES ESPECÍFICAS:
- Use terminologia administrativa brasileira
- Adapte para procedimentos administrativos brasileiros
- Use linguagem cordial e profissional
- Referencie documentação e processos brasileiros`
  }
};

/**
 * Função para obter instruções completas de idioma para qualquer módulo
 */
export function getLanguageInstructions(module?: string): string {
  const baseInstructions = LANGUAGE_CONFIG.MANDATORY_LANGUAGE_INSTRUCTION;
  const mathInstructions = LANGUAGE_CONFIG.MATH_FORMATTING_INSTRUCTIONS;
  const contextInstructions = LANGUAGE_CONFIG.BRAZILIAN_CONTEXT_INSTRUCTIONS;
  
  let moduleInstructions = '';
  if (module && LANGUAGE_CONFIG.MODULE_SPECIFIC_INSTRUCTIONS[module as keyof typeof LANGUAGE_CONFIG.MODULE_SPECIFIC_INSTRUCTIONS]) {
    moduleInstructions = LANGUAGE_CONFIG.MODULE_SPECIFIC_INSTRUCTIONS[module as keyof typeof LANGUAGE_CONFIG.MODULE_SPECIFIC_INSTRUCTIONS];
  }
  
  return `${baseInstructions}\n\n${mathInstructions}\n\n${contextInstructions}${moduleInstructions ? `\n\n${moduleInstructions}` : ''}`;
}

/**
 * Função para adicionar instruções de idioma a qualquer prompt
 */
export function addLanguageInstructions(prompt: string, module?: string): string {
  const languageInstructions = getLanguageInstructions(module);
  
  // Verificar se o prompt já contém instruções de idioma
  if (prompt.includes('IDIOMA OBRIGATÓRIO') || prompt.includes('PT-BR')) {
    return prompt;
  }
  
  return `${languageInstructions}\n\n${prompt}`;
}

/**
 * Função para validar se um prompt contém instruções de idioma adequadas
 */
export function validateLanguageInstructions(prompt: string): boolean {
  const requiredElements = [
    'PT-BR',
    'português brasileiro',
    'NUNCA responda em espanhol',
    'NUNCA responda em inglês'
  ];
  
  return requiredElements.every(element => 
    prompt.toLowerCase().includes(element.toLowerCase())
  );
}

export default LANGUAGE_CONFIG;
