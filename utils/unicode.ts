/**
 * Utilitários para processamento de Unicode em mensagens
 */

/**
 * Normaliza texto Unicode para garantir compatibilidade
 * @param text - Texto a ser normalizado
 * @returns Texto normalizado
 */
export function normalizeUnicode(text: string): string {
  if (!text) return '';
  
  // Normalizar Unicode (NFD -> NFC)
  const normalized = text.normalize('NFC');
  
  // Garantir que caracteres especiais sejam preservados
  return normalized;
}

/**
 * Codifica texto para envio seguro via API
 * @param text - Texto a ser codificado
 * @returns Texto codificado
 */
export function encodeMessage(text: string): string {
  if (!text) return '';
  
  // Normalizar Unicode primeiro
  const normalized = normalizeUnicode(text);
  
  // Garantir que caracteres especiais sejam preservados
  return normalized;
}

/**
 * Decodifica texto recebido da API
 * @param text - Texto a ser decodificado
 * @returns Texto decodificado
 */
export function decodeMessage(text: string): string {
  if (!text) return '';
  
  // Normalizar Unicode
  const normalized = normalizeUnicode(text);
  
  return normalized;
}

/**
 * Processa mensagem para exibição segura
 * @param text - Texto a ser processado
 * @returns Texto processado para exibição
 */
export function processMessageForDisplay(text: string): string {
  if (!text) return '';
  
  // Normalizar Unicode
  const normalized = normalizeUnicode(text);
  
  // Garantir que quebras de linha sejam preservadas
  const processed = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  return processed;
}

/**
 * Valida se o texto contém caracteres Unicode válidos
 * @param text - Texto a ser validado
 * @returns true se válido, false caso contrário
 */
export function isValidUnicode(text: string): boolean {
  if (!text) return true;
  
  try {
    // Tentar normalizar o texto
    const normalized = text.normalize('NFC');
    
    // Verificar se não há caracteres de substituição Unicode
    return !normalized.includes('\uFFFD');
  } catch (error) {
    console.warn('Unicode validation error:', error);
    return false;
  }
}

/**
 * Converte caracteres matemáticos para Unicode apropriado
 * @param text - Texto contendo caracteres matemáticos
 * @returns Texto com caracteres Unicode matemáticos
 */
export function convertMathToUnicode(text: string): string {
  if (!text) return '';
  
  const mathConversions: Record<string, string> = {
    'x^2': 'x²',
    'x^3': 'x³',
    'x^4': 'x⁴',
    'sqrt': '√',
    'pi': 'π',
    'alpha': 'α',
    'beta': 'β',
    'gamma': 'γ',
    'delta': 'δ',
    'epsilon': 'ε',
    'theta': 'θ',
    'lambda': 'λ',
    'mu': 'μ',
    'sigma': 'σ',
    'phi': 'φ',
    'omega': 'ω',
    'infinity': '∞',
    'sum': '∑',
    'integral': '∫',
    'partial': '∂',
    'nabla': '∇',
    'plusminus': '±',
    'times': '×',
    'divide': '÷',
    'not': '¬',
    'and': '∧',
    'or': '∨',
    'implies': '⇒',
    'iff': '⇔',
    'forall': '∀',
    'exists': '∃',
    'in': '∈',
    'notin': '∉',
    'subset': '⊂',
    'superset': '⊃',
    'union': '∪',
    'intersection': '∩',
    'empty': '∅',
    'leq': '≤',
    'geq': '≥',
    'neq': '≠',
    'approx': '≈',
    'equiv': '≡',
    'propto': '∝',
    'perp': '⊥',
    'parallel': '∥',
    'angle': '∠',
    'triangle': '△',
    'square': '□',
    'diamond': '◇',
    'bullet': '•',
    'cdot': '·',
    'ldots': '…',
    'cdots': '⋯',
    'vdots': '⋮',
    'ddots': '⋱',
    'hbar': 'ℏ',
    'ell': 'ℓ',
    'wp': '℘',
    'Re': 'ℜ',
    'Im': 'ℑ',
    'aleph': 'ℵ',
    'hbar': 'ℏ',
    'ell': 'ℓ',
    'wp': '℘',
    'Re': 'ℜ',
    'Im': 'ℑ',
    'aleph': 'ℵ'
  };
  
  let result = text;
  
  // Aplicar conversões
  Object.entries(mathConversions).forEach(([key, unicode]) => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    result = result.replace(regex, unicode);
  });
  
  return result;
}
