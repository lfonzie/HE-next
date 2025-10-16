// lib/citationStyler.ts
// Convert citation numbers to smaller Unicode characters for better UX

const SUPERSCRIPT_MAP: { [key: string]: string } = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹'
};

const SUBSCRIPT_MAP: { [key: string]: string } = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉'
};

/**
 * Convert citation numbers to smaller Unicode superscript characters
 * This makes citations less visually prominent while keeping them readable
 */
export function styleCitationsAsSuperscript(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text;

  // Convert numbers at end of words to superscript
  result = result.replace(
    /([a-zA-ZáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ])(\d{1,3})(?=[.!?]|$|\s)/g,
    (match, letter, numbers) => {
      const superscriptNumbers = numbers
        .split('')
        .map((digit: string) => SUPERSCRIPT_MAP[digit] || digit)
        .join('');
      return letter + superscriptNumbers;
    }
  );

  // Convert bracket citations to superscript
  result = result.replace(
    /\[(\d+(?:[–-]\d+)?(?:,\d+)*)\]/g,
    (match, numbers) => {
      const superscriptNumbers = numbers
        .split('')
        .map((char: string) => {
          if (SUPERSCRIPT_MAP[char]) {
            return SUPERSCRIPT_MAP[char];
          }
          return char; // Keep dashes and commas as is
        })
        .join('');
      return superscriptNumbers;
    }
  );

  return result;
}

/**
 * Convert citation numbers to smaller Unicode subscript characters
 * Alternative styling option
 */
export function styleCitationsAsSubscript(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text;

  // Convert numbers at end of words to subscript
  result = result.replace(
    /([a-zA-ZáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ])(\d{1,3})(?=[.!?]|$|\s)/g,
    (match, letter, numbers) => {
      const subscriptNumbers = numbers
        .split('')
        .map((digit: string) => SUBSCRIPT_MAP[digit] || digit)
        .join('');
      return letter + subscriptNumbers;
    }
  );

  // Convert bracket citations to subscript
  result = result.replace(
    /\[(\d+(?:[–-]\d+)?(?:,\d+)*)\]/g,
    (match, numbers) => {
      const subscriptNumbers = numbers
        .split('')
        .map((char: string) => {
          if (SUBSCRIPT_MAP[char]) {
            return SUBSCRIPT_MAP[char];
          }
          return char; // Keep dashes and commas as is
        })
        .join('');
      return subscriptNumbers;
    }
  );

  return result;
}

/**
 * Style citations with a subtle dot notation
 * Makes citations less prominent but still visible
 */
export function styleCitationsAsDots(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text;

  // Convert numbers at end of words to dots
  result = result.replace(
    /([a-zA-ZáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ])(\d{1,3})(?=[.!?]|$|\s)/g,
    (match, letter, numbers) => {
      const dots = '·'.repeat(Math.min(numbers.length, 3)); // Max 3 dots
      return letter + dots;
    }
  );

  // Convert bracket citations to dots
  result = result.replace(
    /\[(\d+(?:[–-]\d+)?(?:,\d+)*)\]/g,
    (match, numbers) => {
      const dotCount = Math.min(numbers.replace(/[^0-9]/g, '').length, 3);
      return '·'.repeat(dotCount);
    }
  );

  return result;
}
