#!/usr/bin/env node

/**
 * Script de teste para verificar se os modelos Google estão funcionando
 * sem o sufixo -002 que estava causando erro 404
 */

const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

// Modelos para testar
const MODELS_TO_TEST = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

// Modelos que devem falhar (com sufixo -002)
const INVALID_MODELS = [
  'gemini-1.5-flash-002',
  'gemini-1.5-pro-002',
  'gemini-2.0-flash-exp-002'
];

async function testModel(modelName) {
  try {
    console.log(`🧪 Testando modelo: ${modelName}`);
    
    const model = google(modelName);
    const response = await generateText({
      model,
      prompt: 'Responda apenas "OK" se você conseguir processar esta mensagem.',
      temperature: 0.1,
      maxTokens: 10
    });
    
    console.log(`✅ ${modelName}: Sucesso - "${response.text}"`);
    return { success: true, response: response.text };
    
  } catch (error) {
    console.log(`❌ ${modelName}: Erro - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de modelos Google...\n');
  
  // Verificar se a API key está configurada
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_GENERATIVE_AI_API_KEY não configurada');
    console.log('Configure a variável de ambiente antes de executar os testes');
    process.exit(1);
  }
  
  console.log('📋 Testando modelos válidos:');
  const validResults = [];
  for (const model of MODELS_TO_TEST) {
    const result = await testModel(model);
    validResults.push({ model, ...result });
  }
  
  console.log('\n📋 Testando modelos inválidos (devem falhar):');
  const invalidResults = [];
  for (const model of INVALID_MODELS) {
    const result = await testModel(model);
    invalidResults.push({ model, ...result });
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  
  const validSuccess = validResults.filter(r => r.success).length;
  const invalidFailures = invalidResults.filter(r => !r.success).length;
  
  console.log(`✅ Modelos válidos funcionando: ${validSuccess}/${MODELS_TO_TEST.length}`);
  console.log(`❌ Modelos inválidos falhando: ${invalidFailures}/${INVALID_MODELS.length}`);
  
  if (validSuccess === MODELS_TO_TEST.length && invalidFailures === INVALID_MODELS.length) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('Os modelos estão configurados corretamente.');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM');
    console.log('Verifique a configuração dos modelos.');
  }
  
  // Detalhes dos erros
  const allErrors = [...validResults, ...invalidResults].filter(r => !r.success);
  if (allErrors.length > 0) {
    console.log('\n🔍 DETALHES DOS ERROS:');
    allErrors.forEach(({ model, error }) => {
      console.log(`  ${model}: ${error}`);
    });
  }
}

// Executar testes
runTests().catch(console.error);
