#!/usr/bin/env node

/**
 * Teste simples para verificar a detecção de complexidade
 */

// Simulação das funções de detecção
function analyzeQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Detectar busca na web
  const webSearchKeywords = [
    'pesquisar', 'buscar', 'encontrar', 'procurar', 'onde', 'quando', 'quem',
    'últimas notícias', 'notícias', 'atual', 'recente', 'hoje', 'ontem',
    'preço', 'cotação', 'valor', 'mercado', 'bolsa', 'ações',
    'tempo', 'clima', 'previsão', 'temperatura'
  ];
  
  const needsWebSearch = webSearchKeywords.some(keyword => 
    lowerQuestion.includes(keyword)
  );
  
  // Detectar complexidade
  const wordCount = question.split(' ').length;
  let complexity = 'simple';
  
  if (needsWebSearch) {
    complexity = 'medium';
  } else if (wordCount > 20) {
    complexity = 'complex';
  } else if (wordCount > 10) {
    complexity = 'medium';
  }
  
  // Selecionar provedor
  let recommendedProvider, recommendedModel;
  
  if (needsWebSearch) {
    recommendedProvider = 'perplexity';
    recommendedModel = 'sonar';
  } else if (complexity === 'complex') {
    recommendedProvider = 'gpt5';
    recommendedModel = 'gpt-5-chat-latest';
  } else if (complexity === 'simple' && wordCount <= 3) {
    recommendedProvider = 'gemini';
    recommendedModel = 'gemini-2.5-flash';
  } else {
    recommendedProvider = 'openai';
    recommendedModel = 'gpt-4o-mini';
  }
  
  return {
    complexity,
    needsWebSearch,
    recommendedProvider,
    recommendedModel,
    confidence: 0.8
  };
}

function getSelectionExplanation(analysis) {
  const { complexity, needsWebSearch, recommendedProvider } = analysis;
  
  if (needsWebSearch) {
    return `🔍 Busca na web detectada → Perplexity Sonar`;
  }
  
  switch (recommendedProvider) {
    case 'gpt5':
      return `🧠 Pergunta complexa (${complexity}) → GPT-5 Chat Latest`;
    case 'gemini':
      return `⚡ Pergunta trivial → Gemini 2.5 Flash`;
    case 'openai':
      return `💬 Pergunta simples → GPT-4o Mini`;
    default:
      return `🤖 Seleção automática → ${recommendedProvider}`;
  }
}

async function testComplexityDetector() {
  console.log('🧪 Testando detecção de complexidade...\n');

  const testQuestions = [
    "Olá",
    "Como você está?",
    "Pesquisar últimas notícias sobre tecnologia",
    "Explique como funciona o algoritmo de machine learning",
    "Qual o preço do Bitcoin hoje?",
    "Como configurar um servidor web?"
  ];

  testQuestions.forEach((question, index) => {
    const analysis = analyzeQuestion(question);
    const explanation = getSelectionExplanation(analysis);
    
    console.log(`${index + 1}. "${question}"`);
    console.log(`   Complexidade: ${analysis.complexity}`);
    console.log(`   Busca web: ${analysis.needsWebSearch ? 'Sim' : 'Não'}`);
    console.log(`   Provedor: ${analysis.recommendedProvider}`);
    console.log(`   Modelo: ${analysis.recommendedModel}`);
    console.log(`   Explicação: ${explanation}`);
    console.log();
  });

  console.log('🎯 Regras de seleção:');
  console.log('   🔍 Busca na web → Perplexity Sonar');
  console.log('   🧠 Perguntas complexas → GPT-5 Chat Latest');
  console.log('   ⚡ Perguntas triviais → Gemini 2.5 Flash');
  console.log('   💬 Perguntas simples → GPT-4o Mini');

  console.log('\n🎉 Teste concluído!');
}

// Executar teste
testComplexityDetector();
