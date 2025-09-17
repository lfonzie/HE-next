#!/usr/bin/env node

/**
 * Script de Execução Rápida: Benchmark de Aulas
 * 
 * Executa o benchmark mais prático e gera um relatório resumido
 * 
 * Execução: node scripts/run-benchmark.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 EXECUTANDO BENCHMARK DE AULAS');
console.log('=' .repeat(50));
console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
console.log('=' .repeat(50));

// Verificar se o servidor está rodando
console.log('🔍 Verificando servidor...');
try {
  const { default: fetch } = await import('node-fetch');
  const response = await fetch('http://localhost:3000/api/health');
  if (response.ok) {
    console.log('✅ Servidor está rodando');
  } else {
    throw new Error('Servidor não respondeu corretamente');
  }
} catch (error) {
  console.error('❌ Servidor não está acessível');
  console.error('   Certifique-se de que está rodando com: npm run dev');
  process.exit(1);
}

// Executar benchmark
console.log('\n🧪 Executando benchmark...');
try {
  execSync('node scripts/benchmark-aulas-final.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('\n✅ Benchmark concluído com sucesso!');
  
  // Mostrar resumo dos resultados
  const resultsFile = path.join(__dirname, '..', 'aulas-benchmark-final.json');
  if (fs.existsSync(resultsFile)) {
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    console.log('\n📊 RESUMO DOS RESULTADOS:');
    console.log('-'.repeat(40));
    console.log(`Total de testes: ${results.totalTests}`);
    console.log(`Taxa de sucesso: ${results.summary.averageSuccessRate}`);
    console.log(`Mais rápido: ${results.summary.fastestModel}`);
    console.log(`Mais confiável: ${results.summary.mostReliableModel}`);
    console.log(`Maior qualidade: ${results.summary.highestQualityModel}`);
    console.log(`Mais eficiente: ${results.summary.mostEfficientModel}`);
    
    console.log('\n💾 Relatório completo salvo em: aulas-benchmark-final.json');
  }
  
} catch (error) {
  console.error('❌ Erro durante o benchmark:', error.message);
  process.exit(1);
}

console.log('\n🎉 Execução concluída!');
