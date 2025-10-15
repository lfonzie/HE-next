// Test the current cleaning function with the actual response
import { cleanPerplexityResponseWithAI } from './lib/utils/perplexity-cleaner.ts';

const testResponse = `O tempo em Sorocaba neste dia 13 de outubro de 2025 está com temperatura em torno de 26 a 27°C, céu muito nublado com possibilidade de chuva fraca a moderada ao longo do dia, umidade alta (em torno de 70-88%) e vento soprando a cerca de 12 a 16 km/h. A máxima prevista para hoje é de aproximadamente 24-27°C e mínima em torno de 18-19°C1234. O céu permanece com muitas nuvens e há alerta de tempestades localizadas, com possibilidade de ventos fortes, conforme alerta do INMET para a região1116.

Para o mês de outubro, Sorocaba tem média de 10 dias ensolarados, 1 dia nublado e 20 dias chuvosos, com precipitação média mensal estimada em torno de 105 mm. Até o dia 13, já choveu aproximadamente 35 mm, cerca de 33% da média mensal esperada135.

Resumo atual:

Temperatura: 18-27°C
Condição: muito nublado com chuvas fracas a moderadas
Umidade: alta (70-88%)
Vento: 12-16 km/h
Alerta: tempestades e ventos fortes para Sorocaba e região2311`;

console.log('=== TESTING PERPLEXITY CLEANING ===');
console.log('Original response:');
console.log(testResponse);
console.log('\n=== CLEANING ===');

try {
  const cleaned = await cleanPerplexityResponseWithAI(testResponse);
  console.log('✅ Cleaning completed!');
  console.log('Cleaned response:');
  console.log(cleaned);

  // Check if sources were removed
  const hasSources = /\d{3,4}(?![.!?]|$)/.test(cleaned);
  console.log(`\nSources still present: ${hasSources ? '❌ YES' : '✅ NO'}`);

  // Check specific patterns
  const patterns = [
    /\d{4}/g, // 4-digit numbers
    /\d{3}/g, // 3-digit numbers
  ];

  patterns.forEach((pattern, i) => {
    const matches = cleaned.match(pattern);
    console.log(`Pattern ${i + 1} (${pattern}) matches in cleaned:`, matches);
  });

} catch (error) {
  console.error('❌ Cleaning failed:', error);
}


