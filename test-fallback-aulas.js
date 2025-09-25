#!/usr/bin/env node

/**
 * Script para testar o fallback OpenAI quando Gemini falha por quota excedida
 * Este script simula o cenário onde o Gemini atinge o limite de quota
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_TOPIC = 'Como funciona o sistema solar?';

async function testFallback() {
  console.log('🧪 Testando fallback OpenAI para aulas...\n');
  
  try {
    console.log(`📝 Tópico de teste: "${TEST_TOPIC}"`);
    console.log(`🌐 URL: ${BASE_URL}/api/aulas/generate-gemini`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);
    
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/aulas/generate-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: TEST_TOPIC,
        mode: 'sync',
        schoolId: 'test-school'
      }),
    });
    
    const duration = Date.now() - startTime;
    const responseData = await response.json();
    
    console.log(`⏱️  Duração: ${duration}ms`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`✅ Sucesso: ${responseData.success}`);
    
    if (responseData.success) {
      console.log(`🤖 Provedor usado: ${responseData.usage?.provider || 'N/A'}`);
      console.log(`🧠 Modelo: ${responseData.usage?.model || 'N/A'}`);
      console.log(`💰 Custo estimado: $${responseData.usage?.costEstimate || 'N/A'}`);
      console.log(`📄 Total de slides: ${responseData.slides?.length || 'N/A'}`);
      console.log(`🎯 Total de tokens: ${responseData.usage?.totalTokens || 'N/A'}`);
      
      // Verificar se foi usado o fallback
      if (responseData.usage?.provider === 'openai') {
        console.log('\n🎉 FALLBACK OPENAI ATIVADO COM SUCESSO!');
        console.log('✅ O sistema detectou a falha do Gemini e usou o OpenAI como fallback');
      } else if (responseData.usage?.provider === 'gemini') {
        console.log('\n✅ GEMINI FUNCIONANDO NORMALMENTE');
        console.log('ℹ️  O Gemini não atingiu o limite de quota, então não foi necessário usar o fallback');
      }
      
      // Verificar estrutura da aula
      if (responseData.lesson?.slides) {
        const quizSlides = responseData.lesson.slides.filter(slide => slide.type === 'quiz');
        console.log(`\n📋 Estrutura da aula:`);
        console.log(`   - Total de slides: ${responseData.lesson.slides.length}`);
        console.log(`   - Slides de quiz: ${quizSlides.length}`);
        console.log(`   - Slides com imagens: ${responseData.lesson.slides.filter(slide => slide.imageUrl).length}`);
      }
      
    } else {
      console.log(`❌ Erro: ${responseData.error}`);
      console.log(`📝 Detalhes: ${responseData.details || 'N/A'}`);
      
      if (responseData.error?.includes('quota') || responseData.error?.includes('rate limit')) {
        console.log('\n⚠️  ERRO DE QUOTA DETECTADO');
        console.log('ℹ️  Se o OpenAI estiver configurado, o fallback deveria ter sido ativado');
        console.log('🔍 Verifique se OPENAI_API_KEY está configurado no ambiente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 SOLUÇÃO:');
      console.log('1. Certifique-se de que o servidor Next.js está rodando');
      console.log('2. Execute: npm run dev');
      console.log('3. Tente novamente');
    }
  }
}

async function testMultipleRequests() {
  console.log('\n🔄 Testando múltiplas requisições para simular limite de quota...\n');
  
  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(
      fetch(`${BASE_URL}/api/aulas/generate-gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Teste ${i + 1}: ${TEST_TOPIC}`,
          mode: 'sync',
          schoolId: 'test-school'
        }),
      }).then(async (response) => {
        const data = await response.json();
        return {
          index: i + 1,
          status: response.status,
          success: data.success,
          provider: data.usage?.provider,
          model: data.usage?.model,
          error: data.error
        };
      }).catch(error => ({
        index: i + 1,
        error: error.message
      }))
    );
  }
  
  const results = await Promise.all(requests);
  
  console.log('📊 Resultados das requisições:');
  results.forEach(result => {
    if (result.error) {
      console.log(`   ${result.index}. ❌ Erro: ${result.error}`);
    } else {
      const status = result.success ? '✅' : '❌';
      const provider = result.provider ? ` (${result.provider})` : '';
      console.log(`   ${result.index}. ${status} Status: ${result.status}${provider}`);
    }
  });
  
  const successfulRequests = results.filter(r => r.success);
  const openaiRequests = successfulRequests.filter(r => r.provider === 'openai');
  const geminiRequests = successfulRequests.filter(r => r.provider === 'gemini');
  
  console.log(`\n📈 Estatísticas:`);
  console.log(`   - Requisições bem-sucedidas: ${successfulRequests.length}/5`);
  console.log(`   - Usando Gemini: ${geminiRequests.length}`);
  console.log(`   - Usando OpenAI (fallback): ${openaiRequests.length}`);
  
  if (openaiRequests.length > 0) {
    console.log('\n🎉 FALLBACK OPENAI FUNCIONANDO!');
    console.log('✅ O sistema está alternando automaticamente para OpenAI quando necessário');
  }
}

// Executar testes
async function runTests() {
  console.log('🚀 Iniciando testes de fallback para aulas...\n');
  
  // Verificar variáveis de ambiente
  console.log('🔧 Verificando configuração:');
  console.log(`   - GOOGLE_GEMINI_API_KEY: ${process.env.GOOGLE_GEMINI_API_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   - BASE_URL: ${BASE_URL}\n`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  ATENÇÃO: OPENAI_API_KEY não está configurado!');
    console.log('ℹ️  O fallback não funcionará sem esta chave.\n');
  }
  
  // Teste único
  await testFallback();
  
  // Aguardar um pouco antes do próximo teste
  console.log('\n⏳ Aguardando 2 segundos antes do próximo teste...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste múltiplo
  await testMultipleRequests();
  
  console.log('\n✨ Testes concluídos!');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testFallback, testMultipleRequests };
