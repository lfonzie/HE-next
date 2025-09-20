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
  
  /**
   * Extrai conteúdo balanceado entre chaves, começando no índice da '{'.
   * Retorna null se não houver fechamento correspondente.
   */
  const extractBracedContent = (
    source: string,
    startIndex: number
  ): { content: string; end: number } | null => {
    if (source[startIndex] !== '{') return null;
    let depth = 0;
    for (let i = startIndex; i < source.length; i++) {
      const char = source[i];
      // pular caractere escapado
      if (char === '\\') {
        i++;
        continue;
      }
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0) {
          return { content: source.slice(startIndex + 1, i), end: i };
        }
      }
    }
    return null;
  };
  
  /**
   * Substitui \frac, \dfrac, \tfrac por numerador⁄denominador
   * Suporta chaves aninhadas e também forma sem chaves (\frac a b).
   */
  const replaceLatexFractions = (input: string): string => {
    const commands = ['\\dfrac', '\\tfrac', '\\frac'];
    let cursor = 0;
    let output = '';
    const findNextCommand = (from: number): { index: number; cmd: string } | null => {
      let bestIndex = -1;
      let bestCmd = '';
      for (const cmd of commands) {
        const idx = input.indexOf(cmd, from);
        if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
          bestIndex = idx;
          bestCmd = cmd;
        }
      }
      return bestIndex === -1 ? null : { index: bestIndex, cmd: bestCmd };
    };
    
    while (cursor < input.length) {
      const next = findNextCommand(cursor);
      if (!next) {
        output += input.slice(cursor);
        break;
      }
      // copiar o trecho anterior ao comando
      output += input.slice(cursor, next.index);
      let i = next.index + next.cmd.length;
      // pular espaços
      while (i < input.length && /\s/.test(input[i])) i++;
      
      let numerator = '';
      let denominator = '';
      let endIndex = i;
      
      if (input[i] === '{') {
        const numRes = extractBracedContent(input, i);
        if (!numRes) {
          // não conseguiu parsear, copia literal e avança um caractere para evitar loop infinito
          output += next.cmd;
          cursor = i;
          continue;
        }
        numerator = numRes.content;
        i = numRes.end + 1;
        while (i < input.length && /\s/.test(input[i])) i++;
        if (input[i] === '{') {
          const denRes = extractBracedContent(input, i);
          if (!denRes) {
            output += `${next.cmd}{${numerator}}`;
            cursor = i + 1;
            continue;
          }
          denominator = denRes.content;
          endIndex = denRes.end + 1;
        } else {
          // denominador sem chaves
          const m = input.slice(i).match(/^\S+/);
          if (!m) {
            output += `${next.cmd}{${numerator}}`;
            cursor = i;
            continue;
          }
          denominator = m[0];
          endIndex = i + m[0].length;
        }
      } else {
        // forma sem chaves: \frac a b
        const m1 = input.slice(i).match(/^\S+/);
        if (!m1) {
          output += next.cmd;
          cursor = i;
          continue;
        }
        numerator = m1[0];
        i += m1[0].length;
        while (i < input.length && /\s/.test(input[i])) i++;
        const m2 = input.slice(i).match(/^\S+/);
        if (!m2) {
          output += `${next.cmd} ${numerator}`;
          cursor = i;
          continue;
        }
        denominator = m2[0];
        endIndex = i + m2[0].length;
      }
      
      // Processar recursivamente numerador e denominador para casos aninhados
      const numProcessed = replaceLatexFractions(numerator);
      const denProcessed = replaceLatexFractions(denominator);
      output += `${numProcessed}⁄${denProcessed}`;
      cursor = endIndex;
    }
    return output;
  };
  
  // Primeiro processar frações com parser robusto
  let result = replaceLatexFractions(text)
    // Normalizar fórmulas químicas com \text{} primeiro
    .replace(/\\text\{([A-Za-z]+)\}_([0-9]+)/g, (match, element, subscript) => {
      const unicodeSubscript = subscript.split('').map(n => {
        const subscripts: Record<string, string> = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
          '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return subscripts[n] || n;
      }).join('');
      return element + unicodeSubscript;
    })
    .replace(/\\text\{([A-Za-z]+)\}_\{([0-9]+)\}/g, (match, element, subscript) => {
      const unicodeSubscript = subscript.split('').map(n => {
        const subscripts: Record<string, string> = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
          '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return subscripts[n] || n;
      }).join('');
      return element + unicodeSubscript;
    })
    // Remover comandos \text{} restantes
    .replace(/\\text\{([^}]*)\}/g, '$1')
    // Delimitadores inline do LaTeX \( ... \) e \[ ... \]
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    
    // Raízes
    .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√$2')
    
    // Potências e subscritos Unicode
    .replace(/\^(\d+)/g, (match, num) => {
      const superscripts: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
        '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
      };
      return num.split('').map((d: string) => superscripts[d] || d).join('');
    })
    .replace(/\^([a-zA-Z])/g, (match, letter) => {
      const superscripts: Record<string, string> = {
        'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ',
        'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ',
        'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ',
        't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
        'A': 'ᴬ', 'B': 'ᴮ', 'C': 'ᶜ', 'D': 'ᴰ', 'E': 'ᴱ', 'F': 'ᶠ',
        'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ', 'K': 'ᴷ', 'L': 'ᴸ',
        'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ', 'S': 'ˢ',
        'T': 'ᵀ', 'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ', 'X': 'ˣ', 'Y': 'ʸ', 'Z': 'ᶻ'
      };
      return superscripts[letter] || `^${letter}`;
    })
    .replace(/_(\d+)/g, (match, num) => {
      const subscripts: Record<string, string> = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
        '6': '₆', '7': '₇', '8': '₈', '9': '₉'
      };
      return num.split('').map((d: string) => subscripts[d] || d).join('');
    })
    .replace(/_([a-zA-Z])/g, (match, letter) => {
      const subscripts: Record<string, string> = {
        'a': 'ₐ', 'b': 'ᵦ', 'c': 'ᵧ', 'd': 'ᵨ', 'e': 'ₑ', 'f': 'ᵩ',
        'g': 'ᵨ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ',
        'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ',
        't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'w': 'ᵥ', 'x': 'ₓ', 'y': 'ᵧ', 'z': 'ᵨ',
        'A': 'ₐ', 'B': 'ᵦ', 'C': 'ᵧ', 'D': 'ᵨ', 'E': 'ₑ', 'F': 'ᵩ',
        'G': 'ᵨ', 'H': 'ₕ', 'I': 'ᵢ', 'J': 'ⱼ', 'K': 'ₖ', 'L': 'ₗ',
        'M': 'ₘ', 'N': 'ₙ', 'O': 'ₒ', 'P': 'ₚ', 'R': 'ᵣ', 'S': 'ₛ',
        'T': 'ₜ', 'U': 'ᵤ', 'V': 'ᵥ', 'W': 'ᵥ', 'X': 'ₓ', 'Y': 'ᵧ', 'Z': 'ᵨ'
      };
      return subscripts[letter] || `_${letter}`;
    })
    
    // Símbolos matemáticos básicos
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\approx/g, '≈')
    .replace(/\\equiv/g, '≡')
    .replace(/\\infty/g, '∞')
    .replace(/\\propto/g, '∝')
    .replace(/\\perp/g, '⊥')
    .replace(/\\parallel/g, '∥')
    .replace(/\\angle/g, '∠')
    
    // Operadores
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏')
    .replace(/\\int/g, '∫')
    .replace(/\\lim/g, 'lim')
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    
    // Letras gregas minúsculas
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\varepsilon/g, 'ε')
    .replace(/\\zeta/g, 'ζ')
    .replace(/\\eta/g, 'η')
    .replace(/\\theta/g, 'θ')
    .replace(/\\vartheta/g, 'ϑ')
    .replace(/\\iota/g, 'ι')
    .replace(/\\kappa/g, 'κ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\xi/g, 'ξ')
    .replace(/\\pi/g, 'π')
    .replace(/\\varpi/g, 'ϖ')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\varrho/g, 'ϱ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\varsigma/g, 'ς')
    .replace(/\\tau/g, 'τ')
    .replace(/\\upsilon/g, 'υ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\varphi/g, 'ϕ')
    .replace(/\\chi/g, 'χ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\omega/g, 'ω')
    
    // Letras gregas maiúsculas
    .replace(/\\Gamma/g, 'Γ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Theta/g, 'Θ')
    .replace(/\\Lambda/g, 'Λ')
    .replace(/\\Xi/g, 'Ξ')
    .replace(/\\Pi/g, 'Π')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\Upsilon/g, 'Υ')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\Psi/g, 'Ψ')
    .replace(/\\Omega/g, 'Ω')
    
    // Conjuntos
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\supset/g, '⊃')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\supseteq/g, '⊇')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\varnothing/g, '∅')
    .replace(/\\mathbb\{R\}/g, 'ℝ')
    .replace(/\\mathbb\{N\}/g, 'ℕ')
    .replace(/\\mathbb\{Z\}/g, 'ℤ')
    .replace(/\\mathbb\{Q\}/g, 'ℚ')
    .replace(/\\mathbb\{C\}/g, 'ℂ')
    .replace(/\\mathbb\{P\}/g, 'ℙ')
    .replace(/\\mathbb\{F\}/g, '𝔽')
    
    // Lógica
    .replace(/\\land/g, '∧')
    .replace(/\\lor/g, '∨')
    .replace(/\\neg/g, '¬')
    .replace(/\\implies/g, '⇒')
    .replace(/\\iff/g, '⇔')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\uparrow/g, '↑')
    .replace(/\\downarrow/g, '↓')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    
    // Geometria
    .replace(/\\triangle/g, '△')
    .replace(/\\square/g, '□')
    .replace(/\\diamond/g, '◇')
    .replace(/\\bullet/g, '•')
    .replace(/\\cdot/g, '·')
    
    // Pontos e reticências
    .replace(/\\ldots/g, '…')
    .replace(/\\cdots/g, '⋯')
    .replace(/\\vdots/g, '⋮')
    .replace(/\\ddots/g, '⋱')
    
    // Física e outras áreas
    .replace(/\\hbar/g, 'ℏ')
    .replace(/\\ell/g, 'ℓ')
    .replace(/\\wp/g, '℘')
    .replace(/\\Re/g, 'ℜ')
    .replace(/\\Im/g, 'ℑ')
    .replace(/\\aleph/g, 'ℵ')
    
    // Parênteses, colchetes e chaves
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\left\{/g, '{')
    .replace(/\\right\}/g, '}')
    .replace(/\\left\|/g, '|')
    .replace(/\\right\|/g, '|')
    
    // Limpar espaços extras (preservando quebras de linha)
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n');
  
  return result;
}
