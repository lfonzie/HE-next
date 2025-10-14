// lib/utils/perplexity-cleaner.ts
// Utility functions to clean Perplexity responses by removing source citations

import { callGrok } from '@/lib/providers/grok';

/**
 * Uses AI to intelligently clean Perplexity responses by removing source citations
 */
export async function cleanPerplexityResponseWithAI(text: string): Promise<string> {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return text;
  }

  try {
    const prompt = `Você é um especialista em limpeza de texto. Sua tarefa é remover citações de fonte de respostas do Perplexity AI, mantendo todo o conteúdo informativo intacto.

INSTRUÇÕES:
- Identifique e remova TODOS os números de referência/citação que aparecem no texto (como 1, 2, 123, 3151, NM123, etc.)
- Estes números geralmente aparecem no final de frases, após pontos, ou diretamente após palavras
- NÃO remova números que fazem parte de dados importantes como temperaturas, medidas, datas, porcentagens
- Preserve toda a estrutura e formatação do texto
- Mantenha o texto em português brasileiro
- Retorne apenas o texto limpo, sem explicações

EXEMPLOS:
❌ Antes: "Temperatura atual: 19°C1."
✅ Depois: "Temperatura atual: 19°C."

❌ Antes: "Ventos de 16.2 km/h1."
✅ Depois: "Ventos de 16.2 km/h."

❌ Antes: "Possibilidade de chuva34."
✅ Depois: "Possibilidade de chuva."

TEXTO PARA LIMPAR:
${text}

Retorne apenas o texto limpo:`;

    const grokResponse = await callGrok('grok-4-fast-reasoning', [], prompt, '');

    // Extract text from Grok response
    let cleanedText = '';
    if (typeof grokResponse === 'string') {
      cleanedText = grokResponse;
    } else if (grokResponse && typeof grokResponse === 'object') {
      // Handle different response formats from Grok
      cleanedText = grokResponse.text || grokResponse.content || grokResponse.response || '';
    }

    // Fallback: if AI fails or returns invalid response, use the basic regex cleaning
    if (!cleanedText || typeof cleanedText !== 'string' || cleanedText.trim().length === 0) {
      console.warn('[PERPLEXITY-CLEANER] AI cleaning failed, using regex fallback. Raw response:', grokResponse);
      return cleanPerplexityResponseEnhanced(text);
    }

    // Additional check: if the cleaned text still has citation patterns, use regex fallback
    if (/\b\d{3,5}\b(?=[.!?]|$)/.test(cleanedText)) {
      console.warn('[PERPLEXITY-CLEANER] AI cleaning left citation patterns, using regex fallback');
      return cleanPerplexityResponseEnhanced(text);
    }

    return cleanedText.trim();

  } catch (error) {
    console.error('[PERPLEXITY-CLEANER] Error using AI for cleaning:', error);
    // Fallback to regex-based cleaning
    return cleanPerplexityResponseEnhanced(text);
  }
}

/**
 * Enhanced cleaning with regex (fallback method)
 */
export function cleanPerplexityResponseEnhanced(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = text;

  // Remove citation numbers that appear at the end of sentences/paragraphs
  // These are typically isolated numbers after punctuation or at line end
  cleaned = cleaned.replace(/(?<=[.!?]\s*)\d{1,5}(?=\s|$|\n)/g, '');

  // Remove citation codes that appear directly after text (like "25°C134" -> "25°C")
  // More aggressive: remove any number after letters that could be citations
  cleaned = cleaned.replace(/([a-zA-Z°%])([1-9]\d{0,4})(?=[.!?]|$|\n|\s|$)/g, '$1');

  // Remove multiple consecutive citation numbers (like 1116, 1234, etc.)
  cleaned = cleaned.replace(/\b\d{3,5}\b(?=[.!?]|$|\n|\s)/g, '');

  // Remove citation codes that appear in the middle of text (more aggressive)
  cleaned = cleaned.replace(/(\w+)([1-9]\d{2,4})(?=[.!?]|$|\n)/g, (match, text, num) => {
    // Only remove if it's likely a citation (not common measurements)
    if (!['km', 'mm', 'kg', 'cm', 'ml', 'ºC', '°C', '%', 'km/h'].some(unit =>
      text.toLowerCase().includes(unit) || match.toLowerCase().includes(unit))) {
      return text;
    }
    return match;
  });

  // Remove numbers in brackets [1], [2], etc.
  cleaned = cleaned.replace(/\[\d+\]/g, '');

  // Remove numbers in parentheses (1), (2), etc. that are likely citations
  cleaned = cleaned.replace(/\(\d+\)/g, '');

  // Remove superscript numbers ¹, ², ³, etc.
  cleaned = cleaned.replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]/g, '');

  // Clean up multiple spaces and punctuation artifacts left by removal
  cleaned = cleaned.replace(/\s+([.!?])/g, '$1'); // Remove spaces before punctuation
  cleaned = cleaned.replace(/([.!?])\s*([.!?])/g, '$1'); // Remove duplicate punctuation
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize multiple spaces
  cleaned = cleaned.trim(); // Remove leading/trailing whitespace

  // Remove empty lines and normalize line breaks
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/^\s*\n+|\n+\s*$/g, '');

  return cleaned;
}

/**
 * Checks if a response is likely from Perplexity based on the presence of source citations
 */
export function isPerplexityResponse(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Check for common Perplexity citation patterns
  const perplexityPatterns = [
    /\b\d{3,5}\b(?=[.!?]|$)/, // 3-5 digit numbers at end of sentences
    /\[\d+\]/, // Numbers in brackets
    /\(\d+\)/, // Numbers in parentheses
    /[¹²³⁴⁵⁶⁷⁸⁹⁰]/ // Superscript numbers
  ];

  return perplexityPatterns.some(pattern => pattern.test(text));
}