#!/usr/bin/env node

/**
 * Script para executar testes de regressão do sistema de geração de aulas
 * 
 * Uso:
 *   npm run test:regression
 *   node scripts/run-regression-tests.js
 */

import { runRegressionTests } from '../tests/regression-tests.js';

async function main() {
  console.log('🚀 Iniciando testes de regressão do sistema de aulas...\n');
  
  try {
    const results = await runRegressionTests();
    
    console.log('\n📊 Resumo dos resultados:');
    console.log('='.repeat(50));
    
    // Teste de deduplicação de imagens
    console.log('\n📸 Teste de Deduplicação de Imagens:');
    console.log(`Status: ${results.imageDeduplication.passed ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Mensagem: ${results.imageDeduplication.message}`);
    if (!results.imageDeduplication.passed && results.imageDeduplication.details) {
      console.log('Detalhes:', JSON.stringify(results.imageDeduplication.details, null, 2));
    }
    
    // Teste de performance
    console.log('\n⚡ Teste de Performance:');
    console.log(`Status: ${results.performance.passed ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Mensagem: ${results.performance.message}`);
    if (results.performance.details) {
      console.log(`Duração: ${results.performance.details.duration}ms`);
      console.log(`Meta: <${results.performance.details.threshold}ms`);
    }
    
    // Resultado geral
    console.log('\n🎯 Resultado Geral:');
    console.log(`Status: ${results.overallPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
    
    // Exit code baseado no resultado
    process.exit(results.overallPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erro durante execução dos testes:', error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
