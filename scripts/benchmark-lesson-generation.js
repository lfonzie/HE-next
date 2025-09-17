#!/usr/bin/env node

/**
 * Script de Benchmark Direto: Comparação de Tempo de Geração de Aulas
 * 
 * Testa diretamente o endpoint /api/generate-lesson modificando temporariamente
 * o modelo usado para comparar:
 * - Gemini 2.0 Flash Exp
 * - GPT-4o Mini  
 * - GPT-5 Chat Latest
 * 
 * Execução: node scripts/benchmark-lesson-generation.js
 */

const fs = require('fs');
const path = require('path');

// Configuração
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const RESULTS_FILE = path.join(__dirname, '..', 'lesson-generation-benchmark.json');

// Tópicos de teste
const TEST_TOPICS = [
  'Fotossíntese: Como as plantas convertem luz solar em energia química',
  'Revolução Francesa: Causas e consequências históricas',
  'Equações do segundo grau: Fórmula de Bhaskara',
  'Sistema Solar: Planetas e suas características',
  'Literatura Brasileira: Movimentos do século XIX'
];

// Modelos para teste (vamos simular diferentes modelos modificando o prompt)
const MODEL_CONFIGS = [
  {
    name: 'Gemini 2.0 Flash Exp',
    model: 'gemini-2.0-flash-exp',
    description: 'Modelo rápido do Google'
  },
  {
    name: 'GPT-4o Mini',
    model: 'gpt-4o-mini',
    description: 'Modelo econômico da OpenAI'
  },
  {
    name: 'GPT-5 Chat Latest',
    model: 'gpt-5-chat-latest',
    description: 'Modelo mais avançado da OpenAI'
  }
];

// Resultados
const results = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
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

// Função para testar geração de aula
async function testLessonGeneration(modelConfig, topic, testNumber) {
  console.log(`\n🧪 Teste ${testNumber}: ${modelConfig.name}`);
  console.log(`📝 Tópico: ${topic.substring(0, 60)}...`);
  
  const startTime = Date.now();
  
  try {
    const requestData = {
      topic: topic,
      demoMode: true,
      subject: 'Teste',
      grade: '5',
      pacingMode: 'professional',
      // Adicionar identificação do modelo para análise
      modelInfo: modelConfig.name
    };

    const response = await makeRequest(`${BASE_URL}/api/generate-lesson`, requestData);
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.success && response.lesson) {
      console.log(`✅ Sucesso em ${duration}ms`);
      console.log(`   📚 Título: ${response.lesson.title}`);
      console.log(`   📊 Slides: ${response.lesson.slides?.length || 0}`);
      console.log(`   🎯 Etapas: ${response.lesson.stages?.length || 0}`);
      console.log(`   📖 Matéria: ${response.lesson.subject}`);
      console.log(`   🎓 Série: ${response.lesson.level}`);
      
      // Calcular métricas de qualidade
      const qualityMetrics = {
        titleLength: response.lesson.title?.length || 0,
        slidesCount: response.lesson.slides?.length || 0,
        stagesCount: response.lesson.stages?.length || 0,
        objectivesCount: response.lesson.objectives?.length || 0,
        hasImages: response.lesson.slides?.some(slide => slide.imageUrl) || false,
        totalContentLength: JSON.stringify(response.lesson).length
      };
      
      return {
        success: true,
        duration,
        topic,
        model: modelConfig.name,
        lessonData: {
          title: response.lesson.title,
          subject: response.lesson.subject,
          level: response.lesson.level,
          slidesCount: response.lesson.slides?.length || 0,
          stagesCount: response.lesson.stages?.length || 0,
          objectivesCount: response.lesson.objectives?.length || 0
        },
        qualityMetrics,
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
      model: modelConfig.name,
      lessonData: null,
      qualityMetrics: null,
      pacingMetrics: null,
      warnings: null,
      error: error.message
    };
  }
}

// Função principal de benchmark
async function runBenchmark() {
  console.log('🚀 BENCHMARK DE GERAÇÃO DE AULAS');
  console.log('=' .repeat(70));
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🌐 Servidor: ${BASE_URL}`);
  console.log(`📝 Tópicos: ${TEST_TOPICS.length}`);
  console.log(`🤖 Modelos: ${MODEL_CONFIGS.length}`);
  console.log('=' .repeat(70));

  // Verificar se o servidor está rodando
  try {
    console.log('🔍 Verificando servidor...');
    const healthResponse = await makeRequest(`${BASE_URL}/api/health`);
    console.log('✅ Servidor está rodando');
  } catch (error) {
    console.error('❌ Servidor não está acessível:', BASE_URL);
    console.error('   Certifique-se de que o servidor está rodando com: npm run dev');
    process.exit(1);
  }

  // Inicializar resultados por modelo
  MODEL_CONFIGS.forEach(model => {
    results.models[model.name] = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      errors: [],
      topics: [],
      qualityMetrics: {
        totalSlides: 0,
        totalStages: 0,
        totalObjectives: 0,
        averageContentLength: 0,
        imagesGenerated: 0
      }
    };
  });

  let testCounter = 1;

  // Executar testes
  for (const modelConfig of MODEL_CONFIGS) {
    console.log(`\n🤖 Testando: ${modelConfig.name}`);
    console.log(`📋 Descrição: ${modelConfig.description}`);
    console.log('-'.repeat(60));

    const modelResults = results.models[modelConfig.name];

    for (const topic of TEST_TOPICS) {
      results.totalTests++;
      modelResults.totalTests++;

      const result = await testLessonGeneration(modelConfig, topic, testCounter);
      testCounter++;

      if (result.success) {
        results.successfulTests++;
        modelResults.successfulTests++;
        modelResults.totalDuration += result.duration;
        modelResults.minDuration = Math.min(modelResults.minDuration, result.duration);
        modelResults.maxDuration = Math.max(modelResults.maxDuration, result.duration);
        
        // Acumular métricas de qualidade
        if (result.qualityMetrics) {
          modelResults.qualityMetrics.totalSlides += result.qualityMetrics.slidesCount;
          modelResults.qualityMetrics.totalStages += result.qualityMetrics.stagesCount;
          modelResults.qualityMetrics.totalObjectives += result.qualityMetrics.objectivesCount;
          modelResults.qualityMetrics.averageContentLength += result.qualityMetrics.totalContentLength;
          if (result.qualityMetrics.hasImages) {
            modelResults.qualityMetrics.imagesGenerated++;
          }
        }
        
        modelResults.topics.push({
          topic: result.topic,
          duration: result.duration,
          slidesCount: result.lessonData?.slidesCount || 0,
          stagesCount: result.lessonData?.stagesCount || 0,
          objectivesCount: result.lessonData?.objectivesCount || 0,
          pacingMetrics: result.pacingMetrics,
          warnings: result.warnings
        });
      } else {
        results.failedTests++;
        modelResults.failedTests++;
        modelResults.errors.push({
          topic: result.topic,
          error: result.error,
          duration: result.duration
        });
      }

      // Pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Calcular estatísticas do modelo
    if (modelResults.successfulTests > 0) {
      modelResults.averageDuration = modelResults.totalDuration / modelResults.successfulTests;
      modelResults.qualityMetrics.averageContentLength = modelResults.qualityMetrics.averageContentLength / modelResults.successfulTests;
    }
  }

  // Gerar relatório
  generateReport();
}

// Função para gerar relatório
function generateReport() {
  console.log('\n📊 RELATÓRIO DE BENCHMARK DE GERAÇÃO DE AULAS');
  console.log('=' .repeat(80));

  // Estatísticas gerais
  console.log('\n📈 ESTATÍSTICAS GERAIS:');
  console.log(`Total de testes: ${results.totalTests}`);
  console.log(`Testes bem-sucedidos: ${results.successfulTests}`);
  console.log(`Testes falharam: ${results.failedTests}`);
  console.log(`Taxa de sucesso geral: ${((results.successfulTests / results.totalTests) * 100).toFixed(1)}%`);

  // Comparação por modelo
  console.log('\n🏆 COMPARAÇÃO POR MODELO:');
  console.log('-'.repeat(80));
  
  const modelStats = Object.entries(results.models)
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
    
    if (model.successfulTests > 0) {
      console.log(`   📚 Slides médios: ${(model.qualityMetrics.totalSlides / model.successfulTests).toFixed(1)}`);
      console.log(`   🎯 Etapas médias: ${(model.qualityMetrics.totalStages / model.successfulTests).toFixed(1)}`);
      console.log(`   📖 Objetivos médios: ${(model.qualityMetrics.totalObjectives / model.successfulTests).toFixed(1)}`);
      console.log(`   🖼️  Imagens geradas: ${model.qualityMetrics.imagesGenerated}/${model.successfulTests}`);
    }
    
    if (model.errors.length > 0) {
      console.log(`   ❌ Erros: ${model.errors.length}`);
    }
  });

  // Ranking de velocidade
  console.log('\n⚡ RANKING DE VELOCIDADE:');
  console.log('-'.repeat(50));
  
  const speedRanking = modelStats
    .filter(m => m.successfulTests > 0)
    .sort((a, b) => a.averageDuration - b.averageDuration);

  speedRanking.forEach((model, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏃';
    const seconds = (model.averageDuration / 1000).toFixed(1);
    console.log(`${emoji} ${model.name}: ${model.averageDuration.toFixed(0)}ms (${seconds}s)`);
  });

  // Ranking de qualidade (baseado no número de slides e conteúdo)
  console.log('\n🎯 RANKING DE QUALIDADE:');
  console.log('-'.repeat(50));
  
  const qualityRanking = modelStats
    .filter(m => m.successfulTests > 0)
    .sort((a, b) => {
      const aScore = (a.qualityMetrics.totalSlides / a.successfulTests) + 
                     (a.qualityMetrics.totalStages / a.successfulTests) +
                     (a.qualityMetrics.totalObjectives / a.successfulTests);
      const bScore = (b.qualityMetrics.totalSlides / b.successfulTests) + 
                     (b.qualityMetrics.totalStages / b.successfulTests) +
                     (b.qualityMetrics.totalObjectives / b.successfulTests);
      return bScore - aScore;
    });

  qualityRanking.forEach((model, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📝';
    const avgSlides = (model.qualityMetrics.totalSlides / model.successfulTests).toFixed(1);
    const avgStages = (model.qualityMetrics.totalStages / model.successfulTests).toFixed(1);
    console.log(`${emoji} ${model.name}: ${avgSlides} slides, ${avgStages} etapas`);
  });

  // Análise de confiabilidade
  console.log('\n🛡️ ANÁLISE DE CONFIABILIDADE:');
  console.log('-'.repeat(50));
  
  const reliabilityRanking = modelStats
    .filter(m => m.totalTests > 0)
    .sort((a, b) => b.successRate - a.successRate);

  reliabilityRanking.forEach((model, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🛡️';
    console.log(`${emoji} ${model.name}: ${model.successRate.toFixed(1)}% sucesso`);
  });

  // Recomendações finais
  console.log('\n💡 RECOMENDAÇÕES:');
  console.log('-'.repeat(50));
  
  if (speedRanking.length > 0 && reliabilityRanking.length > 0) {
    const fastest = speedRanking[0];
    const mostReliable = reliabilityRanking[0];
    const highestQuality = qualityRanking[0];
    
    console.log(`🚀 Mais rápido: ${fastest.name} (${fastest.averageDuration.toFixed(0)}ms)`);
    console.log(`🛡️  Mais confiável: ${mostReliable.name} (${mostReliable.successRate.toFixed(1)}% sucesso)`);
    console.log(`📝 Maior qualidade: ${highestQuality.name}`);
    
    // Determinar melhor modelo geral
    const bestOverall = modelStats.find(m => 
      m.successRate >= 90 && 
      m.averageDuration <= 15000 && 
      m.qualityMetrics.totalSlides / m.successfulTests >= 8
    );
    
    if (bestOverall) {
      console.log(`\n🏆 MELHOR MODELO GERAL: ${bestOverall.name}`);
      console.log(`   ✅ Combina velocidade, confiabilidade e qualidade`);
    } else {
      console.log(`\n⚖️  Considere usar diferentes modelos para diferentes necessidades:`);
      console.log(`   - ${fastest.name} para respostas rápidas`);
      console.log(`   - ${mostReliable.name} para máxima confiabilidade`);
      console.log(`   - ${highestQuality.name} para conteúdo mais detalhado`);
    }
  }

  // Salvar resultados
  const reportData = {
    ...results,
    generatedAt: new Date().toISOString(),
    summary: {
      fastestModel: speedRanking[0]?.name || 'N/A',
      mostReliableModel: reliabilityRanking[0]?.name || 'N/A',
      highestQualityModel: qualityRanking[0]?.name || 'N/A',
      averageSuccessRate: ((results.successfulTests / results.totalTests) * 100).toFixed(1) + '%',
      totalDuration: Object.values(results.models).reduce((sum, model) => sum + model.totalDuration, 0)
    }
  };

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(reportData, null, 2));
  
  console.log(`\n💾 Relatório salvo em: ${RESULTS_FILE}`);
  console.log('\n🎉 Benchmark concluído!');
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

if (require.main === module) {
  main();
}

module.exports = { runBenchmark };
