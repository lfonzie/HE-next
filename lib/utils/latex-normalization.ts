// lib/utils/latex-normalization.ts
// Utility functions to convert LaTeX syntax to Unicode for proper display

/**
 * Comprehensive mapping of LaTeX patterns to Unicode equivalents
 */
const LATEX_TO_UNICODE_MAPPINGS = {
  // Subscripts
  subscripts: {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    'a': 'ₐ', 'b': 'ᵦ', 'c': 'ᵧ', 'd': 'ᵨ', 'e': 'ₑ',
    'f': 'ᵩ', 'g': 'ᵪ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
    'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
    'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
    'v': 'ᵥ', 'w': 'ᵥ', 'x': 'ₓ', 'y': 'ᵧ', 'z': 'ᵨ'
  },
  
  // Superscripts
  superscripts: {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
    'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
    'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
    'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
    'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
  },
  
  // Common chemical formulas
  chemicalFormulas: {
    'CO_2': 'CO₂',
    'H_2O': 'H₂O',
    'H_2SO_4': 'H₂SO₄',
    'H_2O_2': 'H₂O₂',
    'NH_3': 'NH₃',
    'CH_4': 'CH₄',
    'C_6H_{12}O_6': 'C₆H₁₂O₆',
    'CaCO_3': 'CaCO₃',
    'NaCl': 'NaCl',
    'HCl': 'HCl',
    'NaOH': 'NaOH',
    'Ca(OH)_2': 'Ca(OH)₂',
    'Mg(OH)_2': 'Mg(OH)₂',
    'Al_2O_3': 'Al₂O₃',
    'Fe_2O_3': 'Fe₂O₃',
    'SO_2': 'SO₂',
    'SO_3': 'SO₃',
    'NO_2': 'NO₂',
    'N_2O': 'N₂O',
    'N_2O_5': 'N₂O₅',
    'P_2O_5': 'P₂O₅',
    'K_2O': 'K₂O',
    'CaO': 'CaO',
    'MgO': 'MgO',
    'CuO': 'CuO',
    'ZnO': 'ZnO',
    'TiO_2': 'TiO₂',
    'SiO_2': 'SiO₂',
    'CO': 'CO',
    'NO': 'NO',
    'N_2': 'N₂',
    'O_2': 'O₂',
    'H_2': 'H₂',
    'Cl_2': 'Cl₂',
    'Br_2': 'Br₂',
    'I_2': 'I₂',
    'F_2': 'F₂',
    'P_4': 'P₄',
    'S_8': 'S₈',
    'C_2H_5OH': 'C₂H₅OH',
    'C_2H_4': 'C₂H₄',
    'C_2H_2': 'C₂H₂',
    'C_3H_8': 'C₃H₈',
    'C_4H_{10}': 'C₄H₁₀',
    'C_5H_{12}': 'C₅H₁₂',
    'C_6H_6': 'C₆H₆',
    'C_7H_8': 'C₇H₈',
    'C_8H_{10}': 'C₈H₁₀',
    'C_9H_{12}': 'C₉H₁₂',
    'C_{10}H_{12}': 'C₁₀H₁₂'
  },
  
  // Mathematical symbols
  mathSymbols: {
    '\\times': '×',
    '\\div': '÷',
    '\\pm': '±',
    '\\mp': '∓',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\neq': '≠',
    '\\approx': '≈',
    '\\equiv': '≡',
    '\\propto': '∝',
    '\\infty': '∞',
    '\\sum': '∑',
    '\\prod': '∏',
    '\\int': '∫',
    '\\oint': '∮',
    '\\nabla': '∇',
    '\\partial': '∂',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\zeta': 'ζ',
    '\\eta': 'η',
    '\\theta': 'θ',
    '\\iota': 'ι',
    '\\kappa': 'κ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\xi': 'ξ',
    '\\omicron': 'ο',
    '\\pi': 'π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\tau': 'τ',
    '\\upsilon': 'υ',
    '\\phi': 'φ',
    '\\chi': 'χ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    '\\Gamma': 'Γ',
    '\\Delta': 'Δ',
    '\\Theta': 'Θ',
    '\\Lambda': 'Λ',
    '\\Xi': 'Ξ',
    '\\Pi': 'Π',
    '\\Sigma': 'Σ',
    '\\Upsilon': 'Υ',
    '\\Phi': 'Φ',
    '\\Psi': 'Ψ',
    '\\Omega': 'Ω'
  },
  
  // Arrows
  arrows: {
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\leftrightarrow': '↔',
    '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐',
    '\\Leftrightarrow': '⇔',
    '\\longrightarrow': '⟶',
    '\\longleftarrow': '⟵',
    '\\longleftrightarrow': '⟷',
    '\\Longrightarrow': '⟹',
    '\\Longleftarrow': '⟸',
    '\\Longleftrightarrow': '⟺',
    '\\xrightarrow': '→',
    '\\xleftarrow': '←',
    '\\xleftrightarrow': '↔',
    '\\uparrow': '↑',
    '\\downarrow': '↓',
    '\\updownarrow': '↕',
    '\\Uparrow': '⇑',
    '\\Downarrow': '⇓',
    '\\Updownarrow': '⇕',
    '\\nearrow': '↗',
    '\\searrow': '↘',
    '\\swarrow': '↙',
    '\\nwarrow': '↖'
  },
  
  // Fractions
  fractions: {
    '\\frac{1}{2}': '½',
    '\\frac{1}{3}': '⅓',
    '\\frac{2}{3}': '⅔',
    '\\frac{1}{4}': '¼',
    '\\frac{3}{4}': '¾',
    '\\frac{1}{5}': '⅕',
    '\\frac{2}{5}': '⅖',
    '\\frac{3}{5}': '⅗',
    '\\frac{4}{5}': '⅘',
    '\\frac{1}{6}': '⅙',
    '\\frac{5}{6}': '⅚',
    '\\frac{1}{7}': '⅐',
    '\\frac{1}{8}': '⅛',
    '\\frac{3}{8}': '⅜',
    '\\frac{5}{8}': '⅝',
    '\\frac{7}{8}': '⅞',
    '\\frac{1}{9}': '⅑',
    '\\frac{1}{10}': '⅒'
  }
};

/**
 * Converts LaTeX syntax to Unicode characters
 * @param text - Text containing LaTeX syntax
 * @returns Text with LaTeX converted to Unicode
 */
export function normalizeFormulas(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let normalizedText = text;

  // 1. Handle complex chemical formulas with \text{} commands first
  // Example: \text{C}_8\text{H}_{10}\text{N}_4\text{O}_2 → C₈H₁₀N₄O₂
  normalizedText = normalizedText.replace(/\\text\{([A-Za-z]+)\}_([0-9]+)/g, (match, element, subscript) => {
    const unicodeSubscript = subscript.split('').map(n => LATEX_TO_UNICODE_MAPPINGS.subscripts[n] || n).join('');
    return element + unicodeSubscript;
  });

  // 2. Handle chemical formulas with braces: \text{C}_{8}\text{H}_{10} → C₈H₁₀
  normalizedText = normalizedText.replace(/\\text\{([A-Za-z]+)\}_\{([0-9]+)\}/g, (match, element, subscript) => {
    const unicodeSubscript = subscript.split('').map(n => LATEX_TO_UNICODE_MAPPINGS.subscripts[n] || n).join('');
    return element + unicodeSubscript;
  });

  // 3. Handle chemical formulas with word boundaries
  Object.entries(LATEX_TO_UNICODE_MAPPINGS.chemicalFormulas).forEach(([latex, unicode]) => {
    const regex = new RegExp(`\\b${latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    normalizedText = normalizedText.replace(regex, unicode);
  });

  // 4. Handle fractions
  Object.entries(LATEX_TO_UNICODE_MAPPINGS.fractions).forEach(([latex, unicode]) => {
    normalizedText = normalizedText.replace(new RegExp(latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), unicode);
  });

  // 5. Handle mathematical symbols
  Object.entries(LATEX_TO_UNICODE_MAPPINGS.mathSymbols).forEach(([latex, unicode]) => {
    normalizedText = normalizedText.replace(new RegExp(latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), unicode);
  });

  // 6. Handle arrows with text annotations first (e.g., \xrightarrow{\text{...}})
  normalizedText = normalizedText.replace(/\\xrightarrow\{\\text\{([^}]*)\}\}/g, '→ [$1]');
  normalizedText = normalizedText.replace(/\\xleftarrow\{\\text\{([^}]*)\}\}/g, '← [$1]');
  normalizedText = normalizedText.replace(/\\xleftrightarrow\{\\text\{([^}]*)\}\}/g, '↔ [$1]');
  
  // Handle arrows with text annotations without \text command
  normalizedText = normalizedText.replace(/\\xrightarrow\{([^}]*)\}/g, '→ [$1]');
  normalizedText = normalizedText.replace(/\\xleftarrow\{([^}]*)\}/g, '← [$1]');
  normalizedText = normalizedText.replace(/\\xleftrightarrow\{([^}]*)\}/g, '↔ [$1]');
  
  // 7. Handle simple arrows
  Object.entries(LATEX_TO_UNICODE_MAPPINGS.arrows).forEach(([latex, unicode]) => {
    normalizedText = normalizedText.replace(new RegExp(latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), unicode);
  });

  // 8. Handle text commands (e.g., \text{...})
  normalizedText = normalizedText.replace(/\\text\{([^}]*)\}/g, '$1');
  
  // 9. Handle sqrt commands (e.g., \sqrt{x^2 + y^2})
  normalizedText = normalizedText.replace(/\\sqrt\{([^}]*)\}/g, '√$1');

  // 10. Handle subscripts with braces (e.g., H_{2}O)
  normalizedText = normalizedText.replace(/_\{([^}]+)\}/g, (match, content) => {
    return content.split('').map(char => LATEX_TO_UNICODE_MAPPINGS.subscripts[char] || char).join('');
  });

  // 11. Handle simple subscripts (e.g., CO_2)
  normalizedText = normalizedText.replace(/_([0-9a-zA-Z])/g, (match, char) => {
    return LATEX_TO_UNICODE_MAPPINGS.subscripts[char] || char;
  });

  // 12. Handle superscripts with braces (e.g., x^{2+3})
  normalizedText = normalizedText.replace(/\^\{([^}]+)\}/g, (match, content) => {
    return content.split('').map(char => LATEX_TO_UNICODE_MAPPINGS.superscripts[char] || char).join('');
  });

  // 13. Handle simple superscripts (e.g., x^2)
  normalizedText = normalizedText.replace(/\^([0-9a-zA-Z+\-=()])/g, (match, char) => {
    return LATEX_TO_UNICODE_MAPPINGS.superscripts[char] || char;
  });

  // 14. Handle remaining LaTeX commands that might appear
  normalizedText = normalizedText.replace(/\\[a-zA-Z]+/g, '');

  // 15. Clean up any remaining LaTeX syntax
  normalizedText = normalizedText.replace(/\\[^a-zA-Z]/g, '');
  normalizedText = normalizedText.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '');

  // 16. Clean up LaTeX brackets and extra braces
  normalizedText = normalizedText.replace(/[\[\]]/g, '');
  normalizedText = normalizedText.replace(/\{\{([^}]*)\}\}/g, '$1'); // Remove double braces
  normalizedText = normalizedText.replace(/\{([^}]*)\}/g, '$1'); // Remove single braces

  return normalizedText;
}

/**
 * Enhanced chemical formula normalizer specifically for complex LaTeX formulas
 * @param input - Text containing chemical formulas in LaTeX
 * @returns Text with chemical formulas converted to Unicode
 */
export function normalizeChemicalFormula(input: string): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  return input
    // Handle complex subscripts: _{19} → ₁₉
    .replace(/_\{([0-9]+)\}/g, (_, num) => 
      [...num].map(n => String.fromCharCode(0x2080 + +n)).join(""))
    // Handle simple subscripts: _8 → ₈
    .replace(/_([0-9]+)/g, (_, num) => 
      [...num].map(n => String.fromCharCode(0x2080 + +n)).join(""))
    // Handle superscripts: ^{2+3} → ²⁺³
    .replace(/\^\{([^}]+)\}/g, (_, content) => 
      content.split('').map(char => LATEX_TO_UNICODE_MAPPINGS.superscripts[char] || char).join(""))
    // Handle simple superscripts: ^2 → ²
    .replace(/\^([0-9]+)/g, (_, num) => 
      [...num].map(n => String.fromCharCode(0x2070 + +n)).join(""))
    // Handle long arrows
    .replace(/\\longrightarrow|\\xrightarrow\{[^}]*\}/g, "→")
    .replace(/\\longleftarrow|\\xleftarrow\{[^}]*\}/g, "←")
    .replace(/\\longleftrightarrow|\\xleftrightarrow\{[^}]*\}/g, "↔")
    // Remove \text{} commands
    .replace(/\\text\{([^}]*)\}/g, "$1")
    // Clean LaTeX brackets and extra braces
    .replace(/[\[\]]/g, "")
    .replace(/\{\{([^}]*)\}\}/g, '$1') // Remove double braces
    .replace(/\{([^}]*)\}/g, '$1') // Remove single braces
    // Clean remaining LaTeX commands
    .replace(/\\[a-zA-Z]+/g, '');
}

/**
 * Recursively normalizes LaTeX in nested objects (for lesson data)
 * @param obj - Object that may contain LaTeX strings
 * @returns Object with LaTeX normalized to Unicode
 */
export function normalizeObjectFormulas(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return normalizeFormulas(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => normalizeObjectFormulas(item));
  }

  if (typeof obj === 'object') {
    const normalized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      normalized[key] = normalizeObjectFormulas(value);
    }
    return normalized;
  }

  return obj;
}

/**
 * Validates if text contains LaTeX syntax
 * @param text - Text to validate
 * @returns True if LaTeX syntax is detected
 */
export function containsLatex(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const latexPatterns = [
    /\\[a-zA-Z]+/,           // LaTeX commands
    /_[0-9a-zA-Z]/,         // Subscripts
    /_\{[^}]*\}/,           // Subscripts with braces
    /\^[0-9a-zA-Z]/,        // Superscripts
    /\^\{[^}]*\}/,          // Superscripts with braces
    /\$[^$]*\$/,            // Math mode
    /\$\$[^$]*\$\$/,        // Display math mode
    /\\([^\\]|\\)/,         // Escaped characters
    /\\[^a-zA-Z]/           // Other LaTeX syntax
  ];

  return latexPatterns.some(pattern => pattern.test(text));
}

/**
 * Logs LaTeX detection for monitoring and prompt improvement
 * @param text - Text that contained LaTeX
 * @param context - Context where LaTeX was found
 */
export function logLatexDetection(text: string, context: string = 'unknown'): void {
  if (containsLatex(text)) {
    console.warn(`⚠️ LaTeX detected in ${context}:`, {
      context,
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Enhanced normalization with logging
 * @param text - Text to normalize
 * @param context - Context for logging
 * @returns Normalized text
 */
export function normalizeFormulasWithLogging(text: string, context: string = 'unknown'): string {
  const originalText = text;
  const normalizedText = normalizeFormulas(text);
  
  if (originalText !== normalizedText) {
    logLatexDetection(originalText, context);
  }
  
  return normalizedText;
}
