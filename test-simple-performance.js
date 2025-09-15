#!/usr/bin/env node

/**
 * Teste simples de performance para o endpoint /api/chat/stream
 * Versão simplificada que funciona com Node.js
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;
const TEST_MESSAGES = [
  'Olá, como você está?',
  'Preciso de ajuda com matemática',
  'Como funciona a fotossíntese?',
  'Quero fazer um simulado do ENEM',
  'Tenho problemas com o wifi da escola'
];

function makeRequest(message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message,
      context: { module: 'ATENDIMENTO' }
    });

    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: '/api/chat/stream',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const startTime = Date.now();
    let firstTokenTime = null;
    let receivedData = false;

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk.toString();
        
        if (!receivedData && chunk.length > 0) {
          receivedData = true;
          firstTokenTime = Date.now();
        }
      });

      res.on('end', () => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const timeToFirstToken = firstTokenTime ? firstTokenTime - startTime : totalTime;

        resolve({
          success: true,
          totalTime,
          timeToFirstToken,
          message: message.substring(0, 30) + '...',
          statusCode: res.statusCode
        });
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      resolve({
        success: false,
        totalTime: endTime - Date.now(),
        timeToFirstToken: null,
        message: message.substring(0, 30) + '...',
        error: error.message
      });
    });

    req.write(postData);
    req.end();
  });
}

async function testCacheEffectiveness() {
  console.log('\n🧪 Testando Eficácia do Cache...');
  
  const message = 'Preciso de ajuda com matemática';
  
  // Primeira chamada (sem cache)
  console.log('📤 Primeira chamada (sem cache)...');
  const result1 = await makeRequest(message);
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Segunda chamada (com cache)
  console.log('📤 Segunda chamada (com cache)...');
  const result2 = await makeRequest(message);
  
  return { result1, result2 };
}

async function runTests() {
  console.log('🚀 Teste de Performance - Endpoint /api/chat/stream');
  console.log('==================================================');
  
  const results = [];
  
  // Teste individual de cada mensagem
  for (let i = 0; i < TEST_MESSAGES.length; i++) {
    const message = TEST_MESSAGES[i];
    console.log(`\n📝 Teste ${i + 1}/${TEST_MESSAGES.length}: "${message.substring(0, 30)}..."`);
    
    const result = await makeRequest(message);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Sucesso - Tempo total: ${result.totalTime}ms, Primeiro token: ${result.timeToFirstToken}ms`);
    } else {
      console.log(`❌ Erro: ${result.error}`);
    }
    
    // Aguardar entre testes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Teste de cache
  const cacheTest = await testCacheEffectiveness();
  
  // Estatísticas finais
  console.log('\n📊 ESTATÍSTICAS FINAIS');
  console.log('======================');
  
  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length > 0) {
    const totalTimes = successfulResults.map(r => r.totalTime);
    const firstTokenTimes = successfulResults.map(r => r.timeToFirstToken).filter(t => t !== null);
    
    const avgTotalTime = totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length;
    const avgFirstTokenTime = firstTokenTimes.reduce((a, b) => a + b, 0) / firstTokenTimes.length;
    const minTotalTime = Math.min(...totalTimes);
    const maxTotalTime = Math.max(...totalTimes);
    const minFirstTokenTime = Math.min(...firstTokenTimes);
    const maxFirstTokenTime = Math.max(...firstTokenTimes);
    
    console.log(`📈 Tempo Total Médio: ${avgTotalTime.toFixed(0)}ms`);
    console.log(`📈 Tempo para Primeiro Token Médio: ${avgFirstTokenTime.toFixed(0)}ms`);
    console.log(`📈 Tempo Total Mínimo: ${minTotalTime}ms`);
    console.log(`📈 Tempo Total Máximo: ${maxTotalTime}ms`);
    console.log(`📈 Primeiro Token Mínimo: ${minFirstTokenTime}ms`);
    console.log(`📈 Primeiro Token Máximo: ${maxFirstTokenTime}ms`);
    
    // Comparação com cache
    if (cacheTest.result1.success && cacheTest.result2.success) {
      const improvement = cacheTest.result1.totalTime - cacheTest.result2.totalTime;
      const improvementPercent = (improvement / cacheTest.result1.totalTime) * 100;
      
      console.log('\n🚀 MELHORIA COM CACHE:');
      console.log(`📈 Sem cache: ${cacheTest.result1.totalTime}ms`);
      console.log(`📈 Com cache: ${cacheTest.result2.totalTime}ms`);
      console.log(`📈 Melhoria: ${improvement}ms (${improvementPercent.toFixed(1)}%)`);
    }
    
    // Avaliação de performance
    console.log('\n🎯 AVALIAÇÃO DE PERFORMANCE:');
    if (avgTotalTime < 3000) {
      console.log('✅ EXCELENTE - Tempo médio < 3s');
    } else if (avgTotalTime < 5000) {
      console.log('✅ BOM - Tempo médio < 5s');
    } else if (avgTotalTime < 8000) {
      console.log('⚠️  REGULAR - Tempo médio < 8s');
    } else {
      console.log('❌ RUIM - Tempo médio > 8s');
    }
    
    if (avgFirstTokenTime < 1000) {
      console.log('✅ EXCELENTE - Primeiro token < 1s');
    } else if (avgFirstTokenTime < 2000) {
      console.log('✅ BOM - Primeiro token < 2s');
    } else {
      console.log('⚠️  REGULAR - Primeiro token > 2s');
    }
    
    // Comparação com objetivo (9.5s -> 2-3s)
    const targetTime = 3000; // 3 segundos
    const improvementFromTarget = ((avgTotalTime - targetTime) / targetTime) * 100;
    
    console.log('\n🎯 COMPARAÇÃO COM OBJETIVO:');
    console.log(`📈 Tempo atual: ${avgTotalTime.toFixed(0)}ms`);
    console.log(`📈 Objetivo: ${targetTime}ms`);
    if (avgTotalTime <= targetTime) {
      console.log('🎉 OBJETIVO ALCANÇADO! Performance melhorada significativamente.');
    } else {
      console.log(`⚠️  Ainda ${improvementFromTarget.toFixed(1)}% acima do objetivo.`);
    }
  }
  
  console.log('\n🏁 Testes concluídos!');
}

// Executar testes
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { makeRequest, testCacheEffectiveness, runTests };
