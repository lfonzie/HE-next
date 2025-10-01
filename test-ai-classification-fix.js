#!/usr/bin/env node

/**
 * Script de teste para validar as correções do erro "AI Classification Failed"
 * 
 * Este script testa:
 * 1. Configuração da API do Gemini
 * 2. Funcionamento da classificação de imagens
 * 3. Sistema de fallback local
 * 4. Tratamento de erros com retry
 */

import fetch from 'node-fetch';

// Configuração
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_IMAGES = [
  {
    url: 'https://example.com/plant-leaf.jpg',
    title: 'Green plant leaf in sunlight',
    description: 'A healthy green leaf showing photosynthesis process',
    source: 'unsplash'
  },
  {
    url: 'https://example.com/chloroplast-diagram.jpg',
    title: 'Chloroplast structure diagram',
    description: 'Educational diagram showing chloroplast anatomy',
    source: 'wikimedia'
  },
  {
    url: 'https://example.com/generic-image.jpg',
    title: 'Abstract design pattern',
    description: 'Generic abstract design',
    source: 'pixabay'
  }
];

async function testGeminiConfiguration() {
  console.log('🔧 Testando configuração do Gemini...');
  
  const apiKeys = [
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY'
  ];
  
  let hasValidKey = false;
  
  for (const key of apiKeys) {
    if (process.env[key]) {
      console.log(`✅ ${key} está configurada`);
      hasValidKey = true;
    } else {
      console.log(`❌ ${key} não está configurada`);
    }
  }
  
  if (!hasValidKey) {
    console.log('⚠️ Nenhuma chave de API do Gemini encontrada');
    return false;
  }
  
  return true;
}

async function testImageClassification() {
  console.log('\n🤖 Testando classificação de imagens...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/images/ai-classification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'fotossíntese',
        subject: 'biologia',
        images: TEST_IMAGES
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('📊 Resultado da classificação:');
    console.log(`- Sucesso: ${result.success}`);
    console.log(`- Total de imagens: ${result.totalImages}`);
    console.log(`- Imagens relevantes: ${result.relevantImages}`);
    console.log(`- Método de análise: ${result.analysisMethod}`);
    
    if (result.results && result.results.length > 0) {
      console.log('\n📋 Análise das imagens:');
      result.results.forEach((img, index) => {
        console.log(`${index + 1}. ${img.title}`);
        console.log(`   - Relevância: ${img.relevanceScore}/100`);
        console.log(`   - Valor educacional: ${img.educationalValue}/100`);
        console.log(`   - Adequação: ${img.appropriateness}/100`);
        console.log(`   - Relevante: ${img.isRelevant ? 'Sim' : 'Não'}`);
        console.log(`   - Categoria: ${img.category}`);
        console.log(`   - Justificativa: ${img.reasoning}`);
        console.log('');
      });
    }
    
    return result.success;
    
  } catch (error) {
    console.error('❌ Erro na classificação:', error.message);
    return false;
  }
}

async function testSmartSearch() {
  console.log('\n🔍 Testando busca inteligente...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/images/smart-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'fotossíntese',
        subject: 'biologia',
        count: 3
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('📊 Resultado da busca inteligente:');
    console.log(`- Sucesso: ${result.success}`);
    console.log(`- Total encontrado: ${result.totalFound}`);
    console.log(`- Imagens retornadas: ${result.images?.length || 0}`);
    console.log(`- Fallback usado: ${result.fallbackUsed ? 'Sim' : 'Não'}`);
    console.log(`- Método de busca: ${result.searchMethod}`);
    console.log(`- Fontes utilizadas: ${result.sourcesUsed?.join(', ') || 'Nenhuma'}`);
    
    if (result.images && result.images.length > 0) {
      console.log('\n🖼️ Imagens encontradas:');
      result.images.forEach((img, index) => {
        console.log(`${index + 1}. ${img.title}`);
        console.log(`   - Fonte: ${img.source}`);
        console.log(`   - Score de relevância: ${img.relevanceScore}`);
        console.log(`   - URL: ${img.url}`);
        console.log('');
      });
    }
    
    return result.success;
    
  } catch (error) {
    console.error('❌ Erro na busca inteligente:', error.message);
    return false;
  }
}

async function testFallbackSystem() {
  console.log('\n🔄 Testando sistema de fallback...');
  
  // Simular falha da IA removendo temporariamente a chave
  const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  try {
    const response = await fetch(`${BASE_URL}/api/images/ai-classification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'fotossíntese',
        subject: 'biologia',
        images: TEST_IMAGES
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('📊 Resultado do fallback:');
    console.log(`- Sucesso: ${result.success}`);
    console.log(`- Método de análise: ${result.analysisMethod}`);
    
    if (result.results && result.results.length > 0) {
      const fallbackImages = result.results.filter(img => 
        img.reasoning.includes('fallback')
      );
      console.log(`- Imagens processadas por fallback: ${fallbackImages.length}`);
    }
    
    return result.success;
    
  } catch (error) {
    console.error('❌ Erro no teste de fallback:', error.message);
    return false;
  } finally {
    // Restaurar a chave original
    if (originalKey) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
    }
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes das correções de classificação de IA\n');
  
  const tests = [
    { name: 'Configuração do Gemini', fn: testGeminiConfiguration },
    { name: 'Classificação de Imagens', fn: testImageClassification },
    { name: 'Busca Inteligente', fn: testSmartSearch },
    { name: 'Sistema de Fallback', fn: testFallbackSystem }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
    } catch (error) {
      console.error(`❌ Erro no teste ${test.name}:`, error.message);
      results.push({ name: test.name, success: false });
    }
  }
  
  console.log('\n📋 Resumo dos testes:');
  console.log('='.repeat(50));
  
  let passedTests = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${status} - ${result.name}`);
    if (result.success) passedTests++;
  });
  
  console.log('='.repeat(50));
  console.log(`Resultado: ${passedTests}/${results.length} testes passaram`);
  
  if (passedTests === results.length) {
    console.log('🎉 Todos os testes passaram! As correções estão funcionando.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
  
  return passedTests === results.length;
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

export { runTests, testGeminiConfiguration, testImageClassification, testSmartSearch, testFallbackSystem };
