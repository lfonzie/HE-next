#!/usr/bin/env node

/**
 * Script para testar a performance do endpoint otimizado
 * Compara o tempo de resposta entre o endpoint antigo e o novo
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testEndpoint(endpoint, message, iterations = 3) {
  console.log(`\n🧪 Testando endpoint: ${endpoint}`);
  console.log(`📝 Mensagem: "${message}"`);
  console.log(`🔄 Iterações: ${iterations}`);
  
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          module: 'auto',
          history: [],
          useCache: true,
          forceProvider: 'auto'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Ler o stream até o final
      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      times.push(duration);
      
      console.log(`  ✅ Iteração ${i + 1}: ${duration}ms`);
      
    } catch (error) {
      console.error(`  ❌ Iteração ${i + 1} falhou:`, error.message);
    }
    
    // Pequeno delay entre iterações
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`\n📊 Estatísticas para ${endpoint}:`);
    console.log(`  ⏱️  Tempo médio: ${avgTime.toFixed(0)}ms`);
    console.log(`  🚀 Tempo mínimo: ${minTime}ms`);
    console.log(`  🐌 Tempo máximo: ${maxTime}ms`);
    console.log(`  📈 Sucessos: ${times.length}/${iterations}`);
    
    return {
      endpoint,
      avgTime,
      minTime,
      maxTime,
      successRate: times.length / iterations
    };
  }
  
  return null;
}

async function runPerformanceTest() {
  console.log('🚀 Iniciando teste de performance dos endpoints de chat');
  console.log(`🌐 URL base: ${BASE_URL}`);
  
  const testMessages = [
    'oi td bem',
    'como resolver uma equação de segundo grau?',
    'me ajude com dúvida de matemática',
    'problema com o wifi',
    'quero saber sobre férias',
    'como funciona a fotossíntese?'
  ];
  
  const results = [];
  
  for (const message of testMessages) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Testando mensagem: "${message}"`);
    console.log(`${'='.repeat(60)}`);
    
    // Testar endpoint antigo
    const oldResult = await testEndpoint('/api/chat/stream', message, 2);
    if (oldResult) results.push(oldResult);
    
    // Testar endpoint otimizado
    const newResult = await testEndpoint('/api/chat/stream-optimized', message, 2);
    if (newResult) results.push(newResult);
    
    // Pequeno delay entre mensagens
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Análise comparativa
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 ANÁLISE COMPARATIVA FINAL');
  console.log(`${'='.repeat(80)}`);
  
  const oldResults = results.filter(r => r.endpoint === '/api/chat/stream');
  const newResults = results.filter(r => r.endpoint === '/api/chat/stream-optimized');
  
  if (oldResults.length > 0 && newResults.length > 0) {
    const oldAvg = oldResults.reduce((sum, r) => sum + r.avgTime, 0) / oldResults.length;
    const newAvg = newResults.reduce((sum, r) => sum + r.avgTime, 0) / newResults.length;
    const improvement = ((oldAvg - newAvg) / oldAvg) * 100;
    
    console.log(`\n🎯 RESULTADOS:`);
    console.log(`  📊 Endpoint antigo (/api/chat/stream): ${oldAvg.toFixed(0)}ms (média)`);
    console.log(`  ⚡ Endpoint otimizado (/api/chat/stream-optimized): ${newAvg.toFixed(0)}ms (média)`);
    console.log(`  🚀 Melhoria de performance: ${improvement.toFixed(1)}%`);
    
    if (improvement > 0) {
      console.log(`  ✅ Endpoint otimizado é ${improvement.toFixed(1)}% mais rápido!`);
    } else {
      console.log(`  ⚠️  Endpoint antigo ainda é mais rápido por ${Math.abs(improvement).toFixed(1)}%`);
    }
  }
  
  console.log(`\n🏁 Teste concluído!`);
}

// Executar teste
if (require.main === module) {
  runPerformanceTest().catch(console.error);
}

module.exports = { testEndpoint, runPerformanceTest };
