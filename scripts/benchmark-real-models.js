#!/usr/bin/env node

/**
 * Script de Benchmark Prático: Comparação Real de Modelos de IA
 * 
 * Este script modifica temporariamente o arquivo de geração de aulas
 * para testar diferentes modelos e depois restaura o arquivo original.
 * 
 * Testa:
 * - Gemini 2.0 Flash Exp
 * - GPT-4o Mini  
 * - GPT-5 Chat Latest
 * 
 * Execução: node scripts/benchmark-real-models.js
 */

const fs = require('fs');
const path = require('path');

// Configuração
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const RESULTS_FILE = path.join(__dirname, '..', 'real-models-benchmark.json');
const LESSON_ROUTE_FILE = path.join(__dirname, '..', 'app', 'api', 'generate-lesson', 'route.ts');
const BACKUP_FILE = path.join(__dirname, '..', 'app', 'api', 'generate-lesson', 'route.ts.backup');

// Tópicos de teste
const TEST_TOPICS = [
  'Fotossíntese: Como as plantas convertem luz solar em energia química',
  'Revolução Francesa: Causas e consequências históricas',
  'Equações do segundo grau: Fórmula de Bhaskara',
  'Sistema Solar: Planetas e suas características',
  'Literatura Brasileira: Movimentos do século XIX'
];

// Modelos para teste
const MODEL_CONFIGS = [
  {
    name: 'Gemini 2.0 Flash Exp',
    model: 'gemini-2.0-flash-exp',
    provider: 'google',
    importStatement: `import { google } from '@ai-sdk/google'`,
    clientCreation: `const client = google({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })`,
    modelCall: 'gemini-2.0-flash-exp'
  },
  {
    name: 'GPT-4o Mini',
    model: 'gpt-4o-mini',
    provider: 'openai',
    importStatement: `import OpenAI from 'openai'`,
    clientCreation: `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`,
    modelCall: 'gpt-4o-mini'
  },
  {
    name: 'GPT-5 Chat Latest',
    model: 'gpt-5-chat-latest',
    provider: 'openai',
    importStatement: `import OpenAI from 'openai'`,
    clientCreation: `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`,
    modelCall: 'gpt-5-chat-latest'
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

// Função para fazer backup do arquivo original
function backupOriginalFile() {
  if (fs.existsSync(LESSON_ROUTE_FILE)) {
    fs.copyFileSync(LESSON_ROUTE_FILE, BACKUP_FILE);
    console.log('✅ Backup do arquivo original criado');
    return true;
  }
  return false;
}

// Função para restaurar arquivo original
function restoreOriginalFile() {
  if (fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(BACKUP_FILE, LESSON_ROUTE_FILE);
    fs.unlinkSync(BACKUP_FILE);
    console.log('✅ Arquivo original restaurado');
    return true;
  }
  return false;
}

// Função para modificar o arquivo para usar um modelo específico
function modifyFileForModel(modelConfig) {
  const originalContent = fs.readFileSync(LESSON_ROUTE_FILE, 'utf8');
  
  // Criar conteúdo modificado
  const modifiedContent = originalContent
    .replace(/import OpenAI from 'openai'/, modelConfig.importStatement)
    .replace(/const openai = new OpenAI\(\{[\s\S]*?\}\)/, modelConfig.clientCreation)
    .replace(/model: 'gpt-4o-mini'/, `model: '${modelConfig.modelCall}'`)
    .replace(/model: 'gpt-4o-mini'/, `model: '${modelConfig.modelCall}'`)
    .replace(/model: 'gpt-5-chat-latest'/, `model: '${modelConfig.modelCall}'`);
  
  fs.writeFileSync(LESSON_ROUTE_FILE, modifiedContent);
  console.log(`✅ Arquivo modificado para usar ${modelConfig.name}`);
}

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
        model: modelConfig.name,
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
      model: modelConfig.name,
      lessonData: null,
      pacingMetrics: null,
      warnings: null,
      error: error.message
    };
  }
}

// Função principal de benchmark
async function runBenchmark() {
  console.log('🚀 BENCHMARK REAL DE MODELOS DE IA');
  console.log('=' .repeat(70));
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🌐 Servidor: ${BASE_URL}`);
  console.log(`📝 Tópicos: ${TEST_TOPICS.length}`);
  console.log(`🤖 Modelos: ${MODEL_CONFIGS.length}`);
  console.log('=' .repeat(70));

  // Verificar se o arquivo existe
  if (!fs.existsSync(LESSON_ROUTE_FILE)) {
    console.error('❌ Arquivo de rota não encontrado:', LESSON_ROUTE_FILE);
    process.exit(1);
  }

  // Fazer backup do arquivo original
  if (!backupOriginalFile()) {
    console.error('❌ Não foi possível fazer backup do arquivo original');
    process.exit(1);
  }

  // Verificar se o servidor está rodando
  try {
    console.log('🔍 Verificando servidor...');
    const healthResponse = await makeRequest(`${BASE_URL}/api/health`);
    console.log('✅ Servidor está rodando');
  } catch (error) {
    console.error('❌ Servidor não está acessível:', BASE_URL);
    console.error('   Certifique-se de que o servidor está rodando com: npm run dev');
    restoreOriginalFile();
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
      topics: []
    };
  });

  let testCounter = 1;

  try {
    // Executar testes
    for (const modelConfig of MODEL_CONFIGS) {
      console.log(`\n🤖 Testando: ${modelConfig.name}`);
      console.log(`📋 Provider: ${modelConfig.provider}`);
      console.log('-'.repeat(60));

      // Modificar arquivo para usar o modelo atual
      modifyFileForModel(modelConfig);
      
      // Aguardar um pouco para o servidor recarregar
      console.log('⏳ Aguardando servidor recarregar...');
      await new Promise(resolve => setTimeout(resolve, 5000));

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
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Calcular estatísticas do modelo
      if (modelResults.successfulTests > 0) {
        modelResults.averageDuration = modelResults.totalDuration / modelResults.successfulTests;
      }
    }

  } finally {
    // Sempre restaurar o arquivo original
    console.log('\n🔄 Restaurando arquivo original...');
    restoreOriginalFile();
  }

  // Gerar relatório
  generateReport();
}

// Função para gerar relatório
function generateReport() {
  console.log('\n📊 RELATÓRIO DE BENCHMARK REAL');
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
      const avgSlides = model.topics.reduce((sum, t) => sum + t.slidesCount, 0) / model.successfulTests;
      const avgStages = model.topics.reduce((sum, t) => sum + t.stagesCount, 0) / model.successfulTests;
      console.log(`   📚 Slides médios: ${avgSlides.toFixed(1)}`);
      console.log(`   🎯 Etapas médias: ${avgStages.toFixed(1)}`);
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

  // Ranking de qualidade
  console.log('\n🎯 RANKING DE QUALIDADE:');
  console.log('-'.repeat(50));
  
  const qualityRanking = modelStats
    .filter(m => m.successfulTests > 0)
    .sort((a, b) => {
      const aScore = a.topics.reduce((sum, t) => sum + t.slidesCount + t.stagesCount, 0) / a.successfulTests;
      const bScore = b.topics.reduce((sum, t) => sum + t.slidesCount + t.stagesCount, 0) / b.successfulTests;
      return bScore - aScore;
    });

  qualityRanking.forEach((model, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📝';
    const avgSlides = model.topics.reduce((sum, t) => sum + t.slidesCount, 0) / model.successfulTests;
    const avgStages = model.topics.reduce((sum, t) => sum + t.stagesCount, 0) / model.successfulTests;
    console.log(`${emoji} ${model.name}: ${avgSlides.toFixed(1)} slides, ${avgStages.toFixed(1)} etapas`);
  });

  // Recomendações finais
  console.log('\n💡 RECOMENDAÇÕES:');
  console.log('-'.repeat(50));
  
  if (speedRanking.length > 0) {
    const fastest = speedRanking[0];
    const mostReliable = modelStats[0];
    const highestQuality = qualityRanking[0];
    
    console.log(`🚀 Mais rápido: ${fastest.name} (${fastest.averageDuration.toFixed(0)}ms)`);
    console.log(`🛡️  Mais confiável: ${mostReliable.name} (${mostReliable.successRate.toFixed(1)}% sucesso)`);
    console.log(`📝 Maior qualidade: ${highestQuality.name}`);
    
    if (fastest.name === mostReliable.name && fastest.name === highestQuality.name) {
      console.log(`\n🏆 ${fastest.name} é o melhor modelo geral!`);
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
      mostReliableModel: modelStats[0]?.name || 'N/A',
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
    // Tentar restaurar arquivo original em caso de erro
    restoreOriginalFile();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runBenchmark };
