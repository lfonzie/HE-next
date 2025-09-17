#!/usr/bin/env node

/**
 * Script de Benchmark: Comparação de Tempo de Geração de Aulas
 * 
 * Compara o tempo de geração entre:
 * - Gemini 2.0 Flash Exp
 * - GPT-4o Mini  
 * - GPT-5 Chat Latest
 * 
 * Execução: node scripts/benchmark-aulas-generation.js
 */

const fs = require('fs');
const path = require('path');

// Configuração dos modelos para teste
const MODELS_TO_TEST = [
  {
    name: 'Gemini 2.0 Flash Exp',
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    endpoint: '/api/chat/multi-provider'
  },
  {
    name: 'GPT-4o Mini',
    provider: 'openai', 
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: '/api/chat/multi-provider'
  },
  {
    name: 'GPT-5 Chat Latest',
    provider: 'openai',
    model: 'gpt-5-chat-latest', 
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: '/api/chat/multi-provider'
  }
];

// Tópicos de teste variados para obter dados estatísticos confiáveis
const TEST_TOPICS = [
  'Fotossíntese: Como as plantas convertem luz solar em energia química',
  'Revolução Francesa: Causas, eventos principais e consequências históricas',
  'Equações do segundo grau: Fórmula de Bhaskara e aplicações práticas',
  'Sistema Solar: Planetas, suas características e órbitas',
  'Literatura Brasileira: Movimentos literários do século XIX',
  'Química Orgânica: Hidrocarbonetos e suas propriedades',
  'Geografia Física: Formação de montanhas e processos geológicos',
  'História do Brasil: Período Colonial e Independência',
  'Física: Leis de Newton e aplicações no cotidiano',
  'Biologia Celular: Estrutura e função das organelas celulares'
];

// Configuração do servidor local
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Resultados do benchmark
const benchmarkResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  successfulTests: 0,
  failedTests: 0,
  models: {}
};

// Função para fazer requisição HTTP
async function makeRequest(url, data) {
  const fetch = (await import('node-fetch')).default;
  
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

// Função para testar geração de aula com um modelo específico
async function testModelGeneration(model, topic, testNumber) {
  console.log(`\n🧪 Teste ${testNumber}: ${model.name} - "${topic.substring(0, 50)}..."`);
  
  const startTime = Date.now();
  let success = false;
  let error = null;
  let responseData = null;
  let tokensUsed = 0;

  try {
    // Testar usando o endpoint de aulas
    const response = await makeRequest(`${BASE_URL}/api/generate-lesson`, {
      topic: topic,
      demoMode: true,
      subject: 'Teste',
      grade: '5',
      pacingMode: 'professional'
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.success && response.lesson) {
      success = true;
      responseData = {
        title: response.lesson.title,
        slidesCount: response.lesson.slides?.length || 0,
        stagesCount: response.lesson.stages?.length || 0
      };
      
      console.log(`✅ Sucesso em ${duration}ms`);
      console.log(`   📚 Título: ${response.lesson.title}`);
      console.log(`   📊 Slides: ${response.lesson.slides?.length || 0}`);
      
      return {
        success: true,
        duration,
        topic,
        model: model.name,
        responseData,
        tokensUsed,
        error: null
      };
    } else {
      throw new Error('Resposta inválida da API');
    }

  } catch (err) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    error = err.message;
    console.log(`❌ Falha em ${duration}ms: ${error}`);
    
    return {
      success: false,
      duration,
      topic,
      model: model.name,
      responseData: null,
      tokensUsed: 0,
      error
    };
  }
}

// Função para executar benchmark completo
async function runBenchmark() {
  console.log('🚀 Iniciando Benchmark de Geração de Aulas');
  console.log('=' .repeat(60));
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🌐 Servidor: ${BASE_URL}`);
  console.log(`📝 Tópicos de teste: ${TEST_TOPICS.length}`);
  console.log(`🤖 Modelos: ${MODELS_TO_TEST.length}`);
  console.log('=' .repeat(60));

  // Verificar se o servidor está rodando
  try {
    const healthCheck = await makeRequest(`${BASE_URL}/api/health`);
    console.log('✅ Servidor está rodando');
  } catch (error) {
    console.error('❌ Servidor não está acessível. Certifique-se de que está rodando em:', BASE_URL);
    process.exit(1);
  }

  // Inicializar resultados por modelo
  MODELS_TO_TEST.forEach(model => {
    benchmarkResults.models[model.name] = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      errors: [],
      topics: []
    };
  });

  let testCounter = 1;

  // Executar testes para cada modelo e tópico
  for (const model of MODELS_TO_TEST) {
    console.log(`\n🤖 Testando modelo: ${model.name}`);
    console.log('-'.repeat(40));

    const modelResults = benchmarkResults.models[model.name];

    for (const topic of TEST_TOPICS) {
      benchmarkResults.totalTests++;
      modelResults.totalTests++;

      const result = await testModelGeneration(model, topic, testCounter);
      testCounter++;

      if (result.success) {
        benchmarkResults.successfulTests++;
        modelResults.successfulTests++;
        modelResults.totalDuration += result.duration;
        modelResults.minDuration = Math.min(modelResults.minDuration, result.duration);
        modelResults.maxDuration = Math.max(modelResults.maxDuration, result.duration);
        modelResults.topics.push({
          topic: result.topic,
          duration: result.duration,
          slidesCount: result.responseData?.slidesCount || 0
        });
      } else {
        benchmarkResults.failedTests++;
        modelResults.failedTests++;
        modelResults.errors.push({
          topic: result.topic,
          error: result.error,
          duration: result.duration
        });
      }

      // Pequena pausa entre testes para não sobrecarregar o servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calcular estatísticas do modelo
    if (modelResults.successfulTests > 0) {
      modelResults.averageDuration = modelResults.totalDuration / modelResults.successfulTests;
    }
  }

  // Gerar relatório final
  generateReport();
}

// Função para gerar relatório detalhado
function generateReport() {
  console.log('\n📊 RELATÓRIO DE BENCHMARK');
  console.log('=' .repeat(80));

  // Estatísticas gerais
  console.log('\n📈 ESTATÍSTICAS GERAIS:');
  console.log(`Total de testes: ${benchmarkResults.totalTests}`);
  console.log(`Testes bem-sucedidos: ${benchmarkResults.successfulTests}`);
  console.log(`Testes falharam: ${benchmarkResults.failedTests}`);
  console.log(`Taxa de sucesso: ${((benchmarkResults.successfulTests / benchmarkResults.totalTests) * 100).toFixed(1)}%`);

  // Comparação por modelo
  console.log('\n🏆 COMPARAÇÃO POR MODELO:');
  console.log('-'.repeat(80));
  
  const modelStats = Object.entries(benchmarkResults.models)
    .map(([name, stats]) => ({
      name,
      ...stats,
      successRate: stats.totalTests > 0 ? (stats.successfulTests / stats.totalTests) * 100 : 0
    }))
    .sort((a, b) => b.successRate - a.successRate || a.averageDuration - b.averageDuration);

  modelStats.forEach((model, index) => {
    console.log(`\n${index + 1}. ${model.name}`);
    console.log(`   ✅ Taxa de sucesso: ${model.successRate.toFixed(1)}%`);
    console.log(`   ⏱️  Tempo médio: ${model.averageDuration.toFixed(0)}ms`);
    console.log(`   🚀 Tempo mínimo: ${model.minDuration === Infinity ? 'N/A' : model.minDuration + 'ms'}`);
    console.log(`   🐌 Tempo máximo: ${model.maxDuration}ms`);
    console.log(`   📊 Testes: ${model.successfulTests}/${model.totalTests}`);
    
    if (model.errors.length > 0) {
      console.log(`   ❌ Erros: ${model.errors.length}`);
    }
  });

  // Ranking de velocidade
  console.log('\n⚡ RANKING DE VELOCIDADE (tempo médio):');
  console.log('-'.repeat(50));
  
  const speedRanking = modelStats
    .filter(m => m.successfulTests > 0)
    .sort((a, b) => a.averageDuration - b.averageDuration);

  speedRanking.forEach((model, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏃';
    console.log(`${emoji} ${model.name}: ${model.averageDuration.toFixed(0)}ms`);
  });

  // Análise de qualidade (baseada no número de slides gerados)
  console.log('\n🎯 ANÁLISE DE QUALIDADE (slides gerados):');
  console.log('-'.repeat(50));
  
  modelStats.forEach(model => {
    if (model.successfulTests > 0) {
      const avgSlides = model.topics.reduce((sum, t) => sum + t.slidesCount, 0) / model.topics.length;
      console.log(`${model.name}: ${avgSlides.toFixed(1)} slides em média`);
    }
  });

  // Salvar resultados em arquivo
  const reportData = {
    ...benchmarkResults,
    generatedAt: new Date().toISOString(),
    summary: {
      fastestModel: speedRanking[0]?.name || 'N/A',
      mostReliableModel: modelStats[0]?.name || 'N/A',
      averageSuccessRate: ((benchmarkResults.successfulTests / benchmarkResults.totalTests) * 100).toFixed(1) + '%'
    }
  };

  const reportPath = path.join(__dirname, '..', 'benchmark-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`\n💾 Relatório salvo em: ${reportPath}`);
  console.log('\n🎉 Benchmark concluído!');
}

// Função principal
async function main() {
  try {
    await runBenchmark();
  } catch (error) {
    console.error('❌ Erro durante o benchmark:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { runBenchmark, testModelGeneration };
