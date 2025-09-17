#!/usr/bin/env node

/**
 * Script para testar melhorias de performance no endpoint /api/chat/stream
 * 
 * Este script testa:
 * 1. Tempo de resposta do endpoint
 * 2. Eficácia do cache de classificação
 * 3. Comparação antes/depois das otimizações
 */

// Usar fetch nativo do Node.js 18+ ou node-fetch para versões anteriores
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_MESSAGES = [
  'Olá, como você está?',
  'Preciso de ajuda com matemática',
  'Como funciona a fotossíntese?',
  'Quero fazer um simulado do ENEM',
  'Tenho problemas com o wifi da escola',
  'Preciso de informações sobre matrícula',
  'Como calcular a área de um triângulo?',
  'Quero entender sobre genética',
  'Preciso de ajuda com física',
  'Como funciona a tabela periódica?'
];

async function testEndpoint(message, testName) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: { module: 'ATENDIMENTO' }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Ler o stream até o final
    let receivedData = false;
    let firstTokenTime = null;
    
    // Verificar se response.body tem getReader (browser) ou é um stream (Node.js)
    if (response.body && typeof response.body.getReader === 'function') {
      // Browser environment
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataString = line.slice(6);
            
            if (dataString === '[DONE]') {
              break;
            }

            if (!receivedData && dataString !== '') {
              receivedData = true;
              firstTokenTime = Date.now();
            }

            try {
              const data = JSON.parse(dataString);
              if (data.content) {
                // Primeiro token recebido
                if (!firstTokenTime) {
                  firstTokenTime = Date.now();
                }
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
      }
    } else {
      // Node.js environment - ler como stream
      const chunks = [];
      for await (const chunk of response.body) {
        chunks.push(chunk);
        
        if (!receivedData && chunk.length > 0) {
          receivedData = true;
          firstTokenTime = Date.now();
        }
      }
      
      const fullText = Buffer.concat(chunks).toString();
      const lines = fullText.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataString = line.slice(6);
          
          if (dataString === '[DONE]') {
            break;
          }

          try {
            const data = JSON.parse(dataString);
            if (data.content && !firstTokenTime) {
              firstTokenTime = Date.now();
            }
          } catch (e) {
            // Ignorar erros de parsing
          }
        }
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const timeToFirstToken = firstTokenTime ? firstTokenTime - startTime : totalTime;

    return {
      success: true,
      totalTime,
      timeToFirstToken,
      testName,
      message: message.substring(0, 30) + '...'
    };

  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      totalTime: endTime - startTime,
      timeToFirstToken: null,
      testName,
      message: message.substring(0, 30) + '...',
      error: error.message
    };
  }
}

async function testClassificationCache() {
  console.log('\n🧪 Testando Cache de Classificação...');
  
  const message = 'Preciso de ajuda com matemática';
  
  // Primeira chamada (sem cache)
  console.log('📤 Primeira chamada (sem cache)...');
  const result1 = await testEndpoint(message, 'Sem Cache');
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Segunda chamada (com cache)
  console.log('📤 Segunda chamada (com cache)...');
  const result2 = await testEndpoint(message, 'Com Cache');
  
  return { result1, result2 };
}

async function runPerformanceTests() {
  console.log('🚀 Iniciando Testes de Performance');
  console.log('=====================================');
  
  const results = [];
  
  // Teste individual de cada mensagem
  for (let i = 0; i < TEST_MESSAGES.length; i++) {
    const message = TEST_MESSAGES[i];
    console.log(`\n📝 Teste ${i + 1}/${TEST_MESSAGES.length}: "${message.substring(0, 30)}..."`);
    
    const result = await testEndpoint(message, `Teste ${i + 1}`);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Sucesso - Tempo total: ${result.totalTime}ms, Primeiro token: ${result.timeToFirstToken}ms`);
    } else {
      console.log(`❌ Erro: ${result.error}`);
    }
    
    // Aguardar entre testes para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Teste de cache
  const cacheTest = await testClassificationCache();
  
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
  }
  
  console.log('\n🏁 Testes concluídos!');
}

// Executar testes
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { testEndpoint, testClassificationCache, runPerformanceTests };
