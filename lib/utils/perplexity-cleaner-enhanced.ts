// lib/utils/perplexity-cleaner-enhanced.ts
// Enhanced utility functions to clean Perplexity responses by removing source citations
// Based on comprehensive regex patterns and AST parsing approaches

/**
 * Remove Perplexity citations using enhanced regex patterns
 * This approach is fast and handles most cases effectively
 */
export function removePerplexityCitations(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown;
  }

  let s = markdown;

  // 1) Remover blocos estilo "…】"
  s = s.replace(/【\s*\d+[^】]*】/g, "");

  // 2) Remover footnotes tipo [^1]
  s = s.replace(/\[\^\d+\]/g, "");

  // 3) Remover citações entre colchetes: [1], [2,3], [1–3]
  s = s.replace(/\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\]/g, "");

  // 4) Remover números grudados no fim da palavra (…paulista13)
  //   - mais específico para evitar remover números importantes
  s = s.replace(/([a-zA-ZáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ])(\d{1,3})(?=[.!?]|$|\s)/g, '$1');

  // 5) Remover superscritos unicode (¹²³ etc.)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, "");

  // 6) Limpeza adicional para casos específicos
  // Remover números soltos no final de frases (mais específico)
  s = s.replace(/\s+\d{1,3}(?=[.!?]|$)/g, '');

  // 7) Limpeza de espaços duplos e pontuação
  s = s.replace(/\s+([.!?])/g, '$1'); // Remove spaces before punctuation
  s = s.replace(/([.!?])\s*([.!?])/g, '$1'); // Remove duplicate punctuation
  s = s.replace(/\s+/g, ' '); // Normalize multiple spaces

  return s.trim();
}

/**
 * More restrictive version that only acts at the end of lines
 * Use this if you see numbers appearing in the middle of sentences
 */
export function removePerplexityCitationsEndOfLine(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown;
  }

  let s = markdown;

  // 1) Remover blocos estilo "…】"
  s = s.replace(/【\s*\d+[^】]*】/g, "");

  // 2) Remover footnotes tipo [^1]
  s = s.replace(/\[\^\d+\]/g, "");

  // 3) Remover citações entre colchetes no fim de uma palavra/frase: [1], [2,3], [1–3]
  s = s.replace(
    /(?<=\S)\s*\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\](?=[\s)*\].,;:!?】]*($|\n))/g,
    ""
  );

  // 4) Versão mais restritiva - só age no fim da linha
  s = s.replace(/(?<=\S)(\s*\d{1,3})\s*$/gm, "");

  // 5) Remover superscritos unicode isolados no fim (¹²³ etc.)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+(?=(?:[\s)\].,;:!?】]*($|\n)))/g, "");

  // 6) Espaços duplos ocasionais após limpezas
  s = s.replace(/[ \t]+\n/g, "\n");

  return s.trim();
}

/**
 * Comprehensive cleaning function that combines multiple approaches
 * This is the main function to use for most cases
 */
export function cleanPerplexityResponseComprehensive(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = text;

  // Apply the enhanced regex cleaning
  cleaned = removePerplexityCitations(cleaned);

  // Additional cleanup for edge cases
  cleaned = cleaned
    // Remove standalone citation numbers at line ends
    .replace(/\s+\d{1,5}\s*$/gm, '')
    // Remove citation patterns in parentheses
    .replace(/\(\s*\d+\s*\)/g, '')
    // Remove citation patterns with dashes
    .replace(/\[\s*\d+\s*-\s*\d+\s*\]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up punctuation artifacts
    .replace(/\s+([.!?])/g, '$1')
    .replace(/([.!?])\s*([.!?])/g, '$1')
    // Normalize line breaks
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  return cleaned;
}

/**
 * Check if text contains Perplexity citation patterns
 */
export function hasPerplexityCitations(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const citationPatterns = [
    /【\s*\d+[^】]*】/, // Chinese-style citations
    /\[\^\d+\]/, // Footnotes
    /\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\]/, // Bracket citations
    /[a-zA-ZáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]\d{1,3}(?=[.!?]|$|\s)/, // Numbers after letters
    /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/, // Superscripts
    /\s+\d{1,3}(?=[.!?]|$)/ // Standalone numbers at end
  ];

  return citationPatterns.some(pattern => pattern.test(text));
}

/**
 * Test function to validate the cleaning works correctly
 */
export function testPerplexityCleaning(): void {
  const testCases = [
    {
      input: "A temperatura atual é de 25°C13.",
      expected: "A temperatura atual é de 25°C.",
      description: "Remove citation after temperature"
    },
    {
      input: "O Brasil tem mais de 400 milhões de habitantes2.",
      expected: "O Brasil tem mais de 400 milhões de habitantes.",
      description: "Remove citation after population number"
    },
    {
      input: "Em 2023, o país cresceu 2.5%9.",
      expected: "Em 2023, o país cresceu 2.5%.",
      description: "Remove citation after percentage"
    },
    {
      input: "A cidade de São Paulo13 tem muitos habitantes.",
      expected: "A cidade de São Paulo tem muitos habitantes.",
      description: "Remove citation after city name"
    },
    {
      input: "Segundo estudos [1, 2, 3], a situação é complexa.",
      expected: "Segundo estudos, a situação é complexa.",
      description: "Remove bracket citations"
    },
    {
      input: "A pesquisa¹²³ mostra resultados interessantes.",
      expected: "A pesquisa mostra resultados interessantes.",
      description: "Remove superscript citations"
    },
    {
      input: "O ano de 2024 foi marcante.",
      expected: "O ano de 2024 foi marcante.",
      description: "Preserve year numbers"
    },
    {
      input: "A temperatura de 25°C é ideal.",
      expected: "A temperatura de 25°C é ideal.",
      description: "Preserve temperature with degree symbol"
    }
  ];

  console.log("🧪 Testing Perplexity Citation Cleaning:");
  console.log("=" .repeat(50));

  testCases.forEach((testCase, index) => {
    const result = cleanPerplexityResponseComprehensive(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`\nTest ${index + 1}: ${testCase.description}`);
    console.log(`Input:    "${testCase.input}"`);
    console.log(`Expected: "${testCase.expected}"`);
    console.log(`Result:   "${result}"`);
    console.log(`Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });

  console.log("\n" + "=" .repeat(50));
}
