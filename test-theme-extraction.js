#!/usr/bin/env node

/**
 * Teste do Sistema Inteligente de Extração e Tradução de Temas
 * Testa a extração do tema principal e tradução para inglês
 */

// Importação será feita via require para compatibilidade com Node.js
const { extractAndTranslateTheme } = require('./lib/theme-extraction.ts');

async function testThemeExtraction() {
  console.log('🧪 Testando Sistema de Extração e Tradução de Temas\n');
  
  const testCases = [
    'Como funciona a respiração?',
    'O que é fotossíntese?',
    'Causas da Independência do Brasil',
    'Como funciona a inteligência artificial?',
    'O que é matemática?',
    'Sistema imunológico humano',
    'Evolução das espécies',
    'Clima e relevo do Brasil'
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 Testando: "${testCase}"`);
    
    try {
      const result = await extractAndTranslateTheme(testCase);
      
      console.log(`✅ Resultado:`);
      console.log(`   🎯 Tema extraído: "${result.mainTheme}"`);
      console.log(`   🌍 Tema traduzido: "${result.translatedTheme}"`);
      console.log(`   📊 Confiança: ${result.confidence}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Erro ao processar "${testCase}":`, error.message);
      console.log('');
    }
  }
  
  console.log('🎉 Teste concluído!');
}

// Executar teste
testThemeExtraction().catch(console.error);
