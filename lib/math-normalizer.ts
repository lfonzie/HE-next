/**
 * Normalizador de fórmulas matemáticas
 * Converte LaTeX para Unicode legível em português brasileiro
 */

export interface MathNormalizationOptions {
  usePortugueseNotation?: boolean; // sen, cos, tg em vez de sin, cos, tan
  preserveSpacing?: boolean;      // manter espaçamento original
  removeExtraBraces?: boolean;     // remover chaves LaTeX extras
}

/**
 * Normaliza texto matemático convertendo LaTeX para Unicode
 */
export function normalizeMath(
  text: string, 
  options: MathNormalizationOptions = {}
): string {
  const {
    usePortugueseNotation = true,
    preserveSpacing = true,
    removeExtraBraces = true
  } = options;

  let normalized = text;

  // 1. Funções trigonométricas (LaTeX → PT-BR)
  if (usePortugueseNotation) {
    normalized = normalized
      .replace(/\\sin\b/g, "sen")
      .replace(/\\cos\b/g, "cos")
      .replace(/\\tan\b/g, "tg")
      .replace(/\\cot\b/g, "cotg")
      .replace(/\\sec\b/g, "sec")
      .replace(/\\csc\b/g, "cossec")
      .replace(/\\arcsin\b/g, "arcsen")
      .replace(/\\arccos\b/g, "arccos")
      .replace(/\\arctan\b/g, "arctg");
  } else {
    // Manter notação internacional
    normalized = normalized
      .replace(/\\sin\b/g, "sin")
      .replace(/\\cos\b/g, "cos")
      .replace(/\\tan\b/g, "tan")
      .replace(/\\cot\b/g, "cot")
      .replace(/\\sec\b/g, "sec")
      .replace(/\\csc\b/g, "csc");
  }

  // 2. Frações \frac{a}{b} → a/b
  normalized = normalized.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2");

  // 3. Expoentes e subscritos
  normalized = normalized
    // Expoentes simples
    .replace(/\^2\b/g, "²")
    .replace(/\^3\b/g, "³")
    .replace(/\^4\b/g, "⁴")
    .replace(/\^5\b/g, "⁵")
    .replace(/\^6\b/g, "⁶")
    .replace(/\^7\b/g, "⁷")
    .replace(/\^8\b/g, "⁸")
    .replace(/\^9\b/g, "⁹")
    .replace(/\^0\b/g, "⁰")
    .replace(/\^1\b/g, "¹")
    // Expoentes com chaves \^{n}
    .replace(/\^\{([^}]*)\}/g, (match, exp) => {
      const expMap: Record<string, string> = {
        '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶',
        '7': '⁷', '8': '⁸', '9': '⁹', '0': '⁰', '1': '¹'
      };
      return expMap[exp] || `^${exp}`;
    })
    // Subscritos simples
    .replace(/_1\b/g, "₁")
    .replace(/_2\b/g, "₂")
    .replace(/_3\b/g, "₃")
    .replace(/_4\b/g, "₄")
    .replace(/_5\b/g, "₅")
    .replace(/_6\b/g, "₆")
    .replace(/_7\b/g, "₇")
    .replace(/_8\b/g, "₈")
    .replace(/_9\b/g, "₉")
    .replace(/_0\b/g, "₀")
    // Subscritos com chaves _{n}
    .replace(/_\{([^}]*)\}/g, (match, sub) => {
      const subMap: Record<string, string> = {
        '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
        '6': '₆', '7': '₇', '8': '₈', '9': '₉', '0': '₀'
      };
      return subMap[sub] || `_${sub}`;
    });

  // 4. Operadores matemáticos
  normalized = normalized
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\mp/g, "∓")
    .replace(/\\neq/g, "≠")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\approx/g, "≈")
    .replace(/\\equiv/g, "≡")
    .replace(/\\infty/g, "∞")
    .replace(/\\sum/g, "∑")
    .replace(/\\prod/g, "∏")
    .replace(/\\int/g, "∫")
    .replace(/\\partial/g, "∂")
    .replace(/\\nabla/g, "∇")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\epsilon/g, "ε")
    .replace(/\\theta/g, "θ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\mu/g, "μ")
    .replace(/\\pi/g, "π")
    .replace(/\\sigma/g, "σ")
    .replace(/\\phi/g, "φ")
    .replace(/\\omega/g, "ω");

  // 5. Setas
  normalized = normalized
    .replace(/\\rightarrow/g, "→")
    .replace(/\\leftarrow/g, "←")
    .replace(/\\leftrightarrow/g, "↔")
    .replace(/\\Rightarrow/g, "⇒")
    .replace(/\\Leftarrow/g, "⇐")
    .replace(/\\Leftrightarrow/g, "⇔")
    .replace(/\\longrightarrow/g, "→")
    .replace(/\\longleftarrow/g, "←")
    .replace(/\\xrightarrow\{[^}]*\}/g, "→")
    .replace(/\\xleftarrow\{[^}]*\}/g, "←");

  // 6. Conjuntos e lógica
  normalized = normalized
    .replace(/\\in/g, "∈")
    .replace(/\\notin/g, "∉")
    .replace(/\\subset/g, "⊂")
    .replace(/\\supset/g, "⊃")
    .replace(/\\subseteq/g, "⊆")
    .replace(/\\supseteq/g, "⊇")
    .replace(/\\cup/g, "∪")
    .replace(/\\cap/g, "∩")
    .replace(/\\emptyset/g, "∅")
    .replace(/\\forall/g, "∀")
    .replace(/\\exists/g, "∃")
    .replace(/\\land/g, "∧")
    .replace(/\\lor/g, "∨")
    .replace(/\\neg/g, "¬");

  // 7. Raízes e outros símbolos
  normalized = normalized
    .replace(/\\sqrt/g, "√")
    .replace(/\\sqrt\[([^\]]*)\]/g, "√[$1]")
    .replace(/\\angle/g, "∠")
    .replace(/\\triangle/g, "△")
    .replace(/\\square/g, "□")
    .replace(/\\diamond/g, "◇")
    .replace(/\\hbar/g, "ℏ")
    .replace(/\\aleph/g, "ℵ");

  // 8. Remover comandos de texto
  normalized = normalized.replace(/\\text\{([^}]*)\}/g, "$1");

  // 9. Limpar chaves extras se solicitado
  if (removeExtraBraces) {
    normalized = normalized.replace(/[{}]/g, "");
  }

  // 10. Limpar espaços extras
  if (!preserveSpacing) {
    normalized = normalized.replace(/\s+/g, " ").trim();
  }

  return normalized;
}

/**
 * Normaliza texto específico para fórmulas químicas
 */
export function normalizeChemistry(text: string): string {
  return text
    // Subscritos químicos
    .replace(/H_2/g, "H₂")
    .replace(/H_3/g, "H₃")
    .replace(/O_2/g, "O₂")
    .replace(/O_3/g, "O₃")
    .replace(/CO_2/g, "CO₂")
    .replace(/SO_4/g, "SO₄")
    .replace(/NO_3/g, "NO₃")
    .replace(/PO_4/g, "PO₄")
    .replace(/Cl_2/g, "Cl₂")
    .replace(/N_2/g, "N₂")
    .replace(/C_6H_12O_6/g, "C₆H₁₂O₆")
    .replace(/CaCO_3/g, "CaCO₃")
    .replace(/Na_2CO_3/g, "Na₂CO₃")
    .replace(/H_2SO_4/g, "H₂SO₄")
    .replace(/HCl/g, "HCl")
    .replace(/NaOH/g, "NaOH")
    // Cargas iônicas
    .replace(/\^2\+/g, "²⁺")
    .replace(/\^3\+/g, "³⁺")
    .replace(/\^2\-/g, "²⁻")
    .replace(/\^3\-/g, "³⁻")
    // Setas de reação
    .replace(/\\rightarrow/g, "→")
    .replace(/\\leftarrow/g, "←")
    .replace(/\\leftrightarrow/g, "⇌");
}

/**
 * Normaliza texto completo (matemática + química)
 */
export function normalizeScientificText(
  text: string, 
  options: MathNormalizationOptions = {}
): string {
  let normalized = text;
  
  // Aplicar normalização matemática
  normalized = normalizeMath(normalized, options);
  
  // Aplicar normalização química
  normalized = normalizeChemistry(normalized);
  
  return normalized;
}

/**
 * Tabela de símbolos Unicode para referência
 */
export const UNICODE_SYMBOLS = {
  // Expoentes
  superscript: {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
    '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻',
    '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ'
  },
  
  // Subscritos
  subscript: {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
    '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋',
    '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ',
    'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ',
    'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
    'v': 'ᵥ', 'x': 'ₓ'
  },
  
  // Operadores matemáticos
  operators: {
    'times': '×', 'cdot': '·', 'div': '÷', 'pm': '±', 'mp': '∓',
    'neq': '≠', 'leq': '≤', 'geq': '≥', 'approx': '≈', 'equiv': '≡',
    'infty': '∞', 'sum': '∑', 'prod': '∏', 'int': '∫', 'partial': '∂',
    'nabla': '∇'
  },
  
  // Letras gregas
  greek: {
    'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'epsilon': 'ε',
    'theta': 'θ', 'lambda': 'λ', 'mu': 'μ', 'pi': 'π', 'sigma': 'σ',
    'phi': 'φ', 'omega': 'ω', 'Gamma': 'Γ', 'Delta': 'Δ', 'Theta': 'Θ',
    'Lambda': 'Λ', 'Pi': 'Π', 'Sigma': 'Σ', 'Phi': 'Φ', 'Omega': 'Ω'
  },
  
  // Setas
  arrows: {
    'rightarrow': '→', 'leftarrow': '←', 'leftrightarrow': '↔',
    'Rightarrow': '⇒', 'Leftarrow': '⇐', 'Leftrightarrow': '⇔',
    'uparrow': '↑', 'downarrow': '↓', 'updownarrow': '↕'
  },
  
  // Conjuntos e lógica
  sets: {
    'in': '∈', 'notin': '∉', 'subset': '⊂', 'supset': '⊃',
    'subseteq': '⊆', 'supseteq': '⊇', 'cup': '∪', 'cap': '∩',
    'emptyset': '∅', 'forall': '∀', 'exists': '∃', 'land': '∧',
    'lor': '∨', 'neg': '¬'
  }
} as const;
