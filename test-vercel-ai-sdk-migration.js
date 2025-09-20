#!/usr/bin/env node

/**
 * Script para testar as migrações do Vercel AI SDK
 * Testa os principais endpoints migrados para garantir que estão funcionando
 */

import { config } from 'dotenv';
config();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Test data
const testData = {
  topic: 'Fotossíntese',
  message: 'Explique como funciona a fotossíntese',
  mode: 'sync'
};

// Test cases
const testCases = [
  {
    name: 'Geração de Aulas Principal',
    endpoint: '/api/aulas/generate',
    method: 'POST',
    data: testData,
    expectedFields: ['success', 'lesson', 'slides', 'metrics']
  },
  {
    name: 'Geração de Aulas Gemini',
    endpoint: '/api/aulas/generate-gemini',
    method: 'POST',
    data: testData,
    expectedFields: ['success', 'lesson', 'slides', 'metrics']
  },
  {
    name: 'Classificação de Mensagens',
    endpoint: '/api/classify',
    method: 'POST',
    data: { userMessage: testData.message, history: [] },
    expectedFields: ['module', 'confidence', 'scores']
  },
  {
    name: 'Slides Iniciais Gemini',
    endpoint: '/api/aulas/initial-slides-gemini',
    method: 'POST',
    data: { topic: testData.topic },
    expectedFields: ['success', 'slides']
  },
  {
    name: 'Aulas Progressivas Gemini',
    endpoint: '/api/aulas/progressive-gemini',
    method: 'POST',
    data: { topic: testData.topic },
    expectedFields: ['success', 'lesson']
  }
];

async function testEndpoint(testCase) {
  console.log(`\n🧪 Testando: ${testCase.name}`);
  console.log(`📍 Endpoint: ${testCase.endpoint}`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}${testCase.endpoint}`, {
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.data)
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Verificar campos esperados
    const missingFields = testCase.expectedFields.filter(field => !(field in result));
    
    if (missingFields.length > 0) {
      console.log(`❌ Campos ausentes: ${missingFields.join(', ')}`);
      return false;
    }
    
    console.log(`✅ Sucesso! Duração: ${duration}ms`);
    console.log(`📊 Campos encontrados: ${testCase.expectedFields.join(', ')}`);
    
    // Log adicional para endpoints específicos
    if (testCase.endpoint.includes('aulas/generate')) {
      console.log(`📚 Slides gerados: ${result.slides?.length || 0}`);
      console.log(`🎯 Qualidade: ${result.metrics?.quality?.score || 'N/A'}%`);
    }
    
    if (testCase.endpoint.includes('classify')) {
      console.log(`🎯 Módulo: ${result.module}`);
      console.log(`📈 Confiança: ${(result.confidence * 100).toFixed(1)}%`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes das migrações do Vercel AI SDK');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  const results = [];
  
  for (const testCase of testCases) {
    const success = await testEndpoint(testCase);
    results.push({ name: testCase.name, success });
    
    // Pausa entre testes para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 Resultado: ${successful}/${total} testes passaram`);
  
  if (successful === total) {
    console.log('🎉 Todas as migrações estão funcionando corretamente!');
  } else {
    console.log('⚠️ Algumas migrações precisam de atenção.');
  }
  
  return successful === total;
}

// Verificar se as variáveis de ambiente necessárias estão configuradas
function checkEnvironment() {
  const requiredVars = [
    'GOOGLE_GEMINI_API_KEY',
    'GOOGLE_API_KEY', 
    'GOOGLE_GENERATIVE_AI_API_KEY'
  ];
  
  const hasGoogleKey = requiredVars.some(varName => process.env[varName]);
  
  if (!hasGoogleKey) {
    console.log('❌ Nenhuma chave do Google AI encontrada nas variáveis de ambiente');
    console.log('📝 Configure pelo menos uma das seguintes variáveis:');
    requiredVars.forEach(varName => console.log(`   - ${varName}`));
    return false;
  }
  
  console.log('✅ Variáveis de ambiente configuradas');
  return true;
}

// Executar testes
async function main() {
  if (!checkEnvironment()) {
    process.exit(1);
  }
  
  const success = await runTests();
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
