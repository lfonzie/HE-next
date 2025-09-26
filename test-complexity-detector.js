#!/usr/bin/env node

/**
 * Teste para verificar a detecção de complexidade e seleção automática de modelos
 */

import { analyzeQuestion, getSelectionExplanation } from './lib/complexity-detector.js';

async function testComplexityDetector() {
  console.log('🧪 Testando detecção de complexidade e seleção automática...\n');

  const testQuestions = [
    // Perguntas simples
    "Olá, como você está?",
    "Qual é a capital do Brasil?",
    "Obrigado pela ajuda",
    
    // Buscas na web
    "Pesquisar últimas notícias sobre tecnologia",
    "Qual o preço do Bitcoin hoje?",
    "Como está o tempo em São Paulo?",
    "Encontrar restaurantes perto de mim",
    
    // Perguntas complexas
    "Explique como funciona o algoritmo de machine learning",
    "Analise as implicações éticas da inteligência artificial",
    "Compare as diferentes abordagens de programação funcional",
    "Por que a economia global está em crise?",
    
    // Perguntas criativas
    "Escreva uma história sobre um robô que sonha",
    "Crie um poema sobre a natureza",
    "Invente um personagem para um jogo",
    "Desenhe uma solução criativa para o trânsito",
    
    // Perguntas técnicas
    "Como configurar um servidor web?",
    "Resolva este erro de código JavaScript",
    "Explique a diferença entre SQL e NoSQL",
    "Como implementar autenticação JWT?"
  ];

  console.log('📊 Resultados da análise:\n');

  testQuestions.forEach((question, index) => {
    const analysis = analyzeQuestion(question);
    const explanation = getSelectionExplanation(analysis);
    
    console.log(`${index + 1}. "${question}"`);
    console.log(`   Complexidade: ${analysis.complexity}`);
    console.log(`   Tipo: ${analysis.type}`);
    console.log(`   Busca web: ${analysis.needsWebSearch ? 'Sim' : 'Não'}`);
    console.log(`   Provedor: ${analysis.recommendedProvider}`);
    console.log(`   Modelo: ${analysis.recommendedModel}`);
    console.log(`   Explicação: ${explanation}`);
    console.log(`   Confiança: ${(analysis.confidence * 100).toFixed(0)}%`);
    console.log();
  });

  // Estatísticas
  const results = testQuestions.map(q => analyzeQuestion(q));
  const providerCounts = results.reduce((acc, r) => {
    acc[r.recommendedProvider] = (acc[r.recommendedProvider] || 0) + 1;
    return acc;
  }, {});

  console.log('📈 Estatísticas de seleção:');
  Object.entries(providerCounts).forEach(([provider, count]) => {
    const percentage = ((count / testQuestions.length) * 100).toFixed(1);
    console.log(`   ${provider}: ${count} perguntas (${percentage}%)`);
  });

  console.log('\n🎯 Regras de seleção:');
  console.log('   🔍 Busca na web → Perplexity Sonar');
  console.log('   🧠 Perguntas complexas → GPT-5 Chat Latest');
  console.log('   🎨 Perguntas criativas → Gemini 2.5 Flash');
  console.log('   ⚡ Perguntas simples/técnicas → GPT-4o Mini');

  console.log('\n🎉 Teste de detecção de complexidade concluído!');
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testComplexityDetector();
}

export { testComplexityDetector };
