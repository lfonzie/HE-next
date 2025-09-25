#!/usr/bin/env node

// Script para testar a performance dos endpoints otimizados
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testMessages = [
  'oi tudo bem?',
  'Me ajude com uma dúvida de matemática',
  'Como funciona a fotossíntese?',
  'Preciso de ajuda com um problema técnico',
  'Quero fazer um simulado do ENEM',
  'Bom dia! Preciso de informações sobre pagamento',
  'Estou com problemas no computador',
  'Como posso melhorar minha redação?',
  'Preciso de uma imagem para minha apresentação',
  'Estou me sentindo ansioso com os estudos'
];

async function testEndpoint(endpoint, message, iterations = 3) {
  console.log(`\n🧪 Testando ${endpoint} com: "${message}"`);
  
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          module: 'auto',
          history: [],
          useCache: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Ler a resposta para simular uso real
      const text = await response.text();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      times.push(duration);
      
      console.log(`  Tentativa ${i + 1}: ${duration}ms`);
      
    } catch (error) {
      console.error(`  ❌ Erro na tentativa ${i + 1}:`, error.message);
    }
  }
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`  📊 Média: ${avgTime.toFixed(0)}ms | Min: ${minTime}ms | Max: ${maxTime}ms`);
    return { avgTime, minTime, maxTime, times };
  }
  
  return null;
}

async function runPerformanceTest() {
  console.log('🚀 Iniciando teste de performance dos endpoints otimizados\n');
  console.log(`📍 URL base: ${BASE_URL}`);
  
  const results = {
    'ai-sdk-multi': [],
    'ultra-fast': []
  };
  
  for (const message of testMessages) {
    // Testar endpoint atual otimizado
    const multiResult = await testEndpoint('/api/chat/ai-sdk-multi', message);
    if (multiResult) {
      results['ai-sdk-multi'].push(multiResult);
    }
    
    // Testar novo endpoint ultra-rápido
    const ultraResult = await testEndpoint('/api/chat/ultra-fast', message);
    if (ultraResult) {
      results['ultra-fast'].push(ultraResult);
    }
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Calcular estatísticas finais
  console.log('\n📈 RESULTADOS FINAIS:');
  console.log('='.repeat(50));
  
  for (const [endpoint, endpointResults] of Object.entries(results)) {
    if (endpointResults.length === 0) {
      console.log(`\n❌ ${endpoint}: Nenhum resultado válido`);
      continue;
    }
    
    const allTimes = endpointResults.flatMap(r => r.times);
    const avgTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    
    console.log(`\n🎯 ${endpoint}:`);
    console.log(`   Média geral: ${avgTime.toFixed(0)}ms`);
    console.log(`   Tempo mínimo: ${minTime}ms`);
    console.log(`   Tempo máximo: ${maxTime}ms`);
    console.log(`   Testes válidos: ${endpointResults.length}/${testMessages.length}`);
  }
  
  // Comparação
  if (results['ai-sdk-multi'].length > 0 && results['ultra-fast'].length > 0) {
    const multiAvg = results['ai-sdk-multi'].flatMap(r => r.times).reduce((a, b) => a + b, 0) / results['ai-sdk-multi'].flatMap(r => r.times).length;
    const ultraAvg = results['ultra-fast'].flatMap(r => r.times).reduce((a, b) => a + b, 0) / results['ultra-fast'].flatMap(r => r.times).length;
    
    const improvement = ((multiAvg - ultraAvg) / multiAvg) * 100;
    
    console.log('\n🏆 COMPARAÇÃO:');
    console.log(`   Melhoria do ultra-fast: ${improvement.toFixed(1)}%`);
    console.log(`   Redução de tempo: ${(multiAvg - ultraAvg).toFixed(0)}ms`);
  }
  
  console.log('\n✅ Teste de performance concluído!');
}

// Executar teste
runPerformanceTest().catch(console.error);
