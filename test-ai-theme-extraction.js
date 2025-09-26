// Teste da nova implementação com IA para extração de tema
import { detectTheme } from './lib/themeDetection.ts';

async function testAIThemeExtraction() {
  console.log('🤖 Testando extração de tema com IA...\n');

  const testCases = [
    'Como funciona o sistema solar?',
    'O que é fotossíntese?',
    'Explicar divisão celular',
    'Como funciona a gravidade?',
    'Aula sobre inteligência artificial',
    'O que são equações de segundo grau?',
    'Como funciona a eletricidade?',
    'Explicar evolução das espécies'
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📝 Input: "${testCase}"`);
      
      const result = await detectTheme(testCase);
      
      console.log(`✅ Resultado:`);
      console.log(`   - Tema (PT): "${result.theme}"`);
      console.log(`   - Tema (EN): "${result.englishTheme}"`);
      console.log(`   - Confiança: ${result.confidence}`);
      console.log(`   - Categoria: ${result.category}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Erro para "${testCase}":`, error.message);
      console.log('---');
    }
  }

  console.log('\n🎉 Teste concluído!');
}

// Executar teste se chamado diretamente
testAIThemeExtraction().catch(console.error);
