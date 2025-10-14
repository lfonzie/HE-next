// Test regex cleaning directly
function cleanPerplexityResponseEnhanced(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = text;

  // Remove citation numbers that appear at the end of sentences/paragraphs
  // These are typically isolated numbers after punctuation or at line end
  // More conservative approach: only remove if preceded by punctuation and followed by whitespace or end
  cleaned = cleaned.replace(/(?<=[.!?]\s*)\d{1,5}(?=\s|$|\n)/g, '');

  // Remove citation codes that appear directly after text (like "25°C134" -> "25°C")
  // But be careful not to remove legitimate numbers in measurements
  cleaned = cleaned.replace(/([a-zA-Z°%])([1-9]\d{0,4})(?=[.!?]|$|\n)/g, '$1');

  // Remove isolated citation codes that are clearly not part of content
  // Look for patterns like "text123." or "text123\n"
  cleaned = cleaned.replace(/\w([1-9]\d{0,4})(?=[.!?]|$|\n)/g, (match, num) => {
    // Only remove if the number is 2+ digits and not a common measurement
    if (num.length >= 2 && !['km', 'mm', 'kg', 'cm', 'ml', 'ºC', '°C', '%'].some(unit =>
      match.includes(unit.slice(0, -1)))) {
      return match.replace(num, '');
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

const testResponse = `O tempo em Sorocaba neste dia 13 de outubro de 2025 está com temperatura em torno de 26 a 27°C, céu muito nublado com possibilidade de chuva fraca a moderada ao longo do dia, umidade alta (em torno de 70-88%) e vento soprando a cerca de 12 a 16 km/h. A máxima prevista para hoje é de aproximadamente 24-27°C e mínima em torno de 18-19°C1234. O céu permanece com muitas nuvens e há alerta de tempestades localizadas, com possibilidade de ventos fortes, conforme alerta do INMET para a região1116.

Para o mês de outubro, Sorocaba tem média de 10 dias ensolarados, 1 dia nublado e 20 dias chuvosos, com precipitação média mensal estimada em torno de 105 mm. Até o dia 13, já choveu aproximadamente 35 mm, cerca de 33% da média mensal esperada135.

Resumo atual:

Temperatura: 18-27°C
Condição: muito nublado com chuvas fracas a moderadas
Umidade: alta (70-88%)
Vento: 12-16 km/h
Alerta: tempestades e ventos fortes para Sorocaba e região2311`;

console.log('=== TESTING REGEX CLEANING ===');
console.log('Original response:');
console.log(testResponse);
console.log('\n=== CLEANING ===');

const cleaned = cleanPerplexityResponseEnhanced(testResponse);
console.log('Cleaned response:');
console.log(cleaned);

// Check if sources were removed
const hasSources = /\d{3,4}(?![.!?]|$)/.test(cleaned);
console.log(`\nSources still present: ${hasSources ? '❌ YES' : '✅ NO'}`);

// Check specific problematic patterns
const patterns = [
  /\d{4}/g, // 4-digit numbers
  /\d{3}/g, // 3-digit numbers
];

patterns.forEach((pattern, i) => {
  const matches = cleaned.match(pattern);
  console.log(`Pattern ${i + 1} (${pattern}) matches in cleaned:`, matches);
});

