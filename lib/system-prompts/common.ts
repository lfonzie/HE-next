// lib/system-prompts/common.ts
import { getLanguageInstructions } from './language-config';

export const DEFAULT_SYSTEM_PROMPT = `Você é um assistente educacional inteligente. Responda de forma clara, concisa e educativa.

${getLanguageInstructions()}`;

export const MATH_SYMBOLS_UNICODE = {
  superscript: "x², x³, x⁴, x⁵, x⁶, x⁷, x⁸, x⁹",
  subscript: "x₁, x₂, x₃, x₄, x₅, x₆, x₇, x₈, x₉",
  operators: "√, ±, ÷, ×, ½, ¼, ¾, π, α, β, γ, δ, ε, ζ, η, θ, λ, μ, ν, ξ, ο, ρ, σ, τ, υ, φ, χ, ψ, ω",
  integrals: "∫, ∬, ∭, ∮, ∯, ∰",
  sums: "∑, ∏, ∐",
  infinity: "∞",
  arrows: "→, ←, ↑, ↓, ↔, ↕, ⇐, ⇒, ⇑, ⇓, ⇔, ⇕",
  sets: "∈, ∉, ⊂, ⊃, ⊆, ⊇, ∪, ∩, ∅, ∀, ∃, ∄",
  logic: "∧, ∨, ¬, ⊕, ⊗, ⊙, ⊚, ⊛, ⊜, ⊝, ⊞, ⊟, ⊠, ⊡",
  geometry: "∠, ∟, ⊥, ∥, ∦, ∝, ∼, ≃, ≅, ≆, ≇, ≈, ≉, ≊, ≋, ≌, ≍, ≎, ≏, ≐, ≑, ≒, ≓, ≔, ≕, ≖, ≗, ≘, ≙, ≚, ≛, ≜, ≝, ≞, ≟, ≠, ≡, ≢, ≣, ≤, ≥, ≦, ≧, ≨, ≩, ≪, ≫, ≬, ≭, ≮, ≯, ≰, ≱, ≲, ≳, ≴, ≵, ≶, ≷, ≸, ≹, ≺, ≻, ≼, ≽, ≾, ≿, ⊀, ⊁, ⊂, ⊃, ⊄, ⊅, ⊆, ⊇, ⊈, ⊉, ⊊, ⊋, ⊌, ⊍, ⊎, ⊏, ⊐, ⊑, ⊒, ⊓, ⊔, ⊕, ⊖, ⊗, ⊘, ⊙, ⊚, ⊛, ⊜, ⊝, ⊞, ⊟, ⊠, ⊡, ⊢, ⊣, ⊤, ⊥, ⊦, ⊧, ⊨, ⊩, ⊪, ⊫, ⊬, ⊭, ⊮, ⊯, ⊰, ⊱, ⊲, ⊳, ⊴, ⊵, ⊶, ⊷, ⊸, ⊹, ⊺, ⊻, ⊼, ⊽, ⊾, ⊿, ⋀, ⋁, ⋂, ⋃, ⋄, ⋅, ⋆, ⋇, ⋈, ⋉, ⋊, ⋋, ⋌, ⋍, ⋎, ⋏, ⋐, ⋑, ⋒, ⋓, ⋔, ⋕, ⋖, ⋗, ⋘, ⋙, ⋚, ⋛, ⋜, ⋝, ⋞, ⋟, ⋠, ⋡, ⋢, ⋣, ⋤, ⋥, ⋦, ⋧, ⋨, ⋩, ⋪, ⋫, ⋬, ⋭, ⋮, ⋯, ⋰, ⋱, ⋲, ⋳, ⋴, ⋵, ⋶, ⋷, ⋸, ⋹, ⋺, ⋻, ⋼, ⋽, ⋾, ⋿"
};

export const FORBIDDEN_MATH_FORMATS = [
  "LaTeX",
  "KaTeX", 
  "$...$",
  "$$...$$",
  "\\(...\\)",
  "\\[...\\]"
];

export const RESPONSE_FORMATS = {
  JSON: "json_object",
  TEXT: "text",
  MARKDOWN: "markdown"
};

export const MODEL_CONFIGURATIONS = {
  "gpt-4o-mini": {
    maxTokens: 4000,
    temperature: 0.7,
    description: "Modelo rápido e eficiente para tarefas gerais"
  },
  "gpt-5-chat-latest": {
    maxTokens: 12000,
    temperature: 0.7,
    description: "Modelo mais recente com capacidades avançadas"
  }
};

export const CONTENT_SAFETY_RULES = [
  "Não gere conteúdo ofensivo ou inadequado",
  "Mantenha linguagem educacional apropriada",
  "Evite informações médicas ou legais específicas",
  "Sempre oriente para verificação de fontes confiáveis",
  "Promova pensamento crítico e verificação de informações"
];

export const EDUCATIONAL_PRINCIPLES = [
  "Use metodologia socrática - faça perguntas que estimulem o raciocínio",
  "Personalize o conteúdo para o nível do aluno",
  "Encoraje verificação crítica de informações",
  "Foque em análise e aplicação prática, não apenas memorização",
  "Use exemplos práticos e contextualizados",
  "Promova conexões interdisciplinares",
  "Desenvolva habilidades de pensamento crítico"
];

export const BRAZILIAN_CONTEXT = {
  curriculum: "BNCC - Base Nacional Comum Curricular",
  exams: ["ENEM", "vestibular", "concursos públicos"],
  subjects: ["Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Português", "Literatura", "Inglês", "Espanhol", "Filosofia", "Sociologia", "Artes", "Educação Física"],
  regions: ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"],
  culture: "Contexto brasileiro, exemplos do cotidiano nacional, situações práticas locais"
};

export const ACCESSIBILITY_GUIDELINES = [
  "Use linguagem clara e simples",
  "Evite jargões sem explicação",
  "Forneça alternativas textuais para elementos visuais",
  "Use contraste adequado em sugestões de cores",
  "Estruture o conteúdo de forma lógica e hierárquica",
  "Forneça instruções passo a passo claras"
];

export const ERROR_HANDLING = {
  fallbackMessages: {
    parseError: "Desculpe, houve um problema ao processar sua solicitação. Tente novamente.",
    networkError: "Problema de conexão. Verifique sua internet e tente novamente.",
    timeoutError: "A solicitação demorou muito para ser processada. Tente novamente.",
    validationError: "Os dados fornecidos não estão no formato correto. Verifique e tente novamente."
  },
  retryStrategies: {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialDelay: 1000
  }
};

/**
 * Instruções obrigatórias de Unicode para todos os prompts
 */
export const UNICODE_INSTRUCTIONS = `

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
- \\rightarrow, \\in, \\leq, \\infty`;

/**
 * Função para adicionar instruções de Unicode a qualquer prompt
 */
export function addUnicodeInstructions(prompt: string): string {
  // Verificar se o prompt já contém instruções de Unicode
  if (prompt.includes('UNICODE CORRETOS') || prompt.includes('FORMATAÇÃO MATEMÁTICA')) {
    return prompt;
  }
  
  return prompt + UNICODE_INSTRUCTIONS;
}
