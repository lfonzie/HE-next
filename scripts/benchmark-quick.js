#!/usr/bin/env node

/**
 * Script de Benchmark Rápido: Teste Simples de Geração de Aulas
 * 
 * Testa apenas alguns tópicos para verificar se tudo está funcionando
 * 
 * Execução: node scripts/benchmark-quick.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const RESULTS_FILE = path.join(__dirname, '..', 'benchmark-quick-results.json');

// Tópicos de teste reduzidos
const TEST_TOPICS = [
  'Fotossíntese: Como as plantas convertem luz solar em energia química',
  'Revolução Francesa: Causas e consequências históricas',
  'Equações do segundo grau: Fórmula de Bhaskara'
];

// Resultados
const results = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  totalTests: 0,
  successfulTests: 0,
  failedTests: 0,
  tests: []
};

// Função para fazer requisição HTTP
async function makeRequest(url, data) {
  const { default: fetch } = await import('node-fetch');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Função para testar geração de aula
async function testLessonGeneration(topic, testNumber) {
  console.log(`\n🧪 Teste ${testNumber}: ${topic.substring(0, 60)}...`);
  
  const startTime = Date.now();
  
  try {
    const requestData = {
      topic: topic,
      demoMode: true,
      subject: 'Teste',
      grade: '5',
      pacingMode: 'professional'
    };

    const response = await makeRequest(`${BASE_URL}/api/generate-lesson`, requestData);
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.success && response.lesson) {
      console.log(`✅ Sucesso em ${duration}ms`);
      console.log(`   📚 Título: ${response.lesson.title}`);
      console.log(`   📊 Slides: ${response.lesson.slides?.length || 0}`);
      console.log(`   🎯 Etapas: ${response.lesson.stages?.length || 0}`);
      
      return {
        success: true,
        duration,
        topic,
        lessonData: {
          title: response.lesson.title,
          subject: response.lesson.subject,
          level: response.lesson.level,
          slidesCount: response.lesson.slides?.length || 0,
          stagesCount: response.lesson.stages?.length || 0,
          objectivesCount: response.lesson.objectives?.length || 0
        },
        pacingMetrics: response.pacingMetrics,
        warnings: response.warnings,
        error: null
      };
    } else {
      throw new Error('Resposta inválida da API');
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ Falha em ${duration}ms: ${error.message}`);
    
    return {
      success: false,
      duration,
      topic,
      lessonData: null,
      pacingMetrics: null,
      warnings: null,
      error: error.message
    };
  }
}

// Função principal de benchmark
async function runBenchmark() {
  console.log('🚀 BENCHMARK RÁPIDO DE GERAÇÃO DE AULAS');
  console.log('=' .repeat(60));
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🌐 Servidor: ${BASE_URL}`);
  console.log(`📝 Tópicos: ${TEST_TOPICS.length}`);
  console.log('=' .repeat(60));

  // Verificar se o servidor está rodando
  try {
    console.log('🔍 Verificando servidor...');
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      console.log('✅ Servidor está rodando');
    } else {
      throw new Error('Servidor não respondeu corretamente');
    }
  } catch (error) {
    console.error('❌ Servidor não está acessível:', BASE_URL);
    console.error('   Certifique-se de que o servidor está rodando com: npm run dev');
    process.exit(1);
  }

  let testCounter = 1;

  // Executar testes
  for (const topic of TEST_TOPICS) {
    results.totalTests++;

    const result = await testLessonGeneration(topic, testCounter);
    testCounter++;

    if (result.success) {
      results.successfulTests++;
    } else {
      results.failedTests++;
    }

    results.tests.push(result);

    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Gerar relatório
  generateReport();
}

// Função para gerar relatório
function generateReport() {
  console.log('\n📊 RELATÓRIO RÁPIDO');
  console.log('=' .repeat(50));

  // Estatísticas gerais
  console.log('\n📈 ESTATÍSTICAS:');
  console.log(`Total de testes: ${results.totalTests}`);
  console.log(`Testes bem-sucedidos: ${results.successfulTests}`);
  console.log(`Testes falharam: ${results.failedTests}`);
  console.log(`Taxa de sucesso: ${((results.successfulTests / results.totalTests) * 100).toFixed(1)}%`);

  // Análise de tempo
  const successfulTests = results.tests.filter(t => t.success);
  if (successfulTests.length > 0) {
    const durations = successfulTests.map(t => t.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    console.log('\n⏱️ TEMPO DE GERAÇÃO:');
    console.log(`Tempo médio: ${avgDuration.toFixed(0)}ms`);
    console.log(`Tempo mínimo: ${minDuration}ms`);
    console.log(`Tempo máximo: ${maxDuration}ms`);
  }

  // Análise de qualidade
  if (successfulTests.length > 0) {
    const avgSlides = successfulTests.reduce((sum, t) => sum + t.lessonData.slidesCount, 0) / successfulTests.length;
    const avgStages = successfulTests.reduce((sum, t) => sum + t.lessonData.stagesCount, 0) / successfulTests.length;
    const avgObjectives = successfulTests.reduce((sum, t) => sum + t.lessonData.objectivesCount, 0) / successfulTests.length;
    
    console.log('\n🎯 QUALIDADE:');
    console.log(`Slides médios: ${avgSlides.toFixed(1)}`);
    console.log(`Etapas médias: ${avgStages.toFixed(1)}`);
    console.log(`Objetivos médios: ${avgObjectives.toFixed(1)}`);
  }

  // Salvar resultados
  const reportData = {
    ...results,
    generatedAt: new Date().toISOString(),
    summary: {
      averageSuccessRate: ((results.successfulTests / results.totalTests) * 100).toFixed(1) + '%',
      averageDuration: successfulTests.length > 0 ? 
        (successfulTests.reduce((sum, t) => sum + t.duration, 0) / successfulTests.length).toFixed(0) + 'ms' : 'N/A'
    }
  };

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(reportData, null, 2));
  
  console.log(`\n💾 Relatório salvo em: ${RESULTS_FILE}`);
  console.log('\n🎉 Benchmark rápido concluído!');
}

// Executar
async function main() {
  try {
    await runBenchmark();
  } catch (error) {
    console.error('❌ Erro durante o benchmark:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runBenchmark };
