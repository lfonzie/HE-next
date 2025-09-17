#!/usr/bin/env node

/**
 * Script de Benchmark: Comparação de Tempo de Geração entre Modelos de IA
 * 
 * Testa especificamente os modelos:
 * - Gemini 2.0 Flash Exp
 * - GPT-4o Mini  
 * - GPT-5 Chat Latest
 * 
 * Usa o endpoint /api/chat/multi-provider para testar diferentes modelos
 * 
 * Execução: node scripts/benchmark-models-comparison.js
 */

const fs = require('fs');
const path = require('path');

// Configuração
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const RESULTS_FILE = path.join(__dirname, '..', 'model-comparison-results.json');

// Tópicos de teste para geração de aulas
const TEST_TOPICS = [
  'Fotossíntese: Como as plantas convertem luz solar em energia química',
  'Revolução Francesa: Causas e consequências históricas', 
  'Equações do segundo grau: Fórmula de Bhaskara e aplicações',
  'Sistema Solar: Planetas e suas características orbitais',
  'Literatura Brasileira: Movimentos literários do século XIX'
];

// Configurações dos modelos
const MODEL_CONFIGS = [
  {
    name: 'Gemini 2.0 Flash Exp',
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
    complexity: 'simple'
  },
  {
    name: 'GPT-4o Mini',
    provider: 'openai',
    model: 'gpt-4o-mini', 
    complexity: 'simple'
  },
  {
    name: 'GPT-5 Chat Latest',
    provider: 'openai',
    model: 'gpt-5-chat-latest',
    complexity: 'complex'
  }
];

// Prompt para geração de aula
const LESSON_GENERATION_PROMPT = `Você é um especialista em educação. Crie uma aula estruturada sobre o tópico fornecido.

Estrutura necessária:
1. Título da aula
2. Objetivos de aprendizagem (3-4 objetivos)
3. Introdução ao tema
4. Conteúdo principal dividido em 3 seções
5. Atividade prática
6. Quiz de fixação com 4 opções
7. Resumo e próximos passos

Responda em formato JSON estruturado.`;

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

// Função para testar um modelo específico
async function testModel(modelConfig, topic, testNumber) {
  console.log(`\n🧪 Teste ${testNumber}: ${modelConfig.name}`);
  console.log(`📝 Tópico: ${topic.substring(0, 60)}...`);
  
  const startTime = Date.now();
  
  try {
    const requestData = {
      messages: [
        {
          role: 'system',
          content: LESSON_GENERATION_PROMPT
        },
        {
          role: 'user', 
          content: `Crie uma aula sobre: ${topic}`
        }
      ],
      module: 'aulas',
      provider: modelConfig.provider,
      complexity: modelConfig.complexity
    };

    const response = await makeRequest(`${BASE_URL}/api/chat/multi-provider`, requestData);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verificar se a resposta contém conteúdo válido
    if (response && response.text) {
      console.log(`✅ Sucesso em ${duration}ms`);
      console.log(`   📝 Resposta: ${response.text.substring(0, 100)}...`);
      
      // Tentar extrair informações da resposta
      let lessonData = null;
      try {
        // Procurar por JSON na resposta
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          lessonData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Se não conseguir fazer parse do JSON, usar dados básicos
        lessonData = {
          title: topic,
          contentLength: response.text.length,
          hasJson: false
        };
      }
      
      return {
        success: true,
        duration,
        topic,
        model: modelConfig.name,
        responseData: {
          textLength: response.text.length,
          lessonData,
          hasValidJson: !!lessonData && typeof lessonData === 'object'
        },
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
      responseData: null,
      error: error.message
    };
  }
}

// Função principal de benchmark
async function runBenchmark() {
  console.log('🚀 BENCHMARK DE COMPARAÇÃO DE MODELOS DE IA');
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
      totalResponseLength: 0,
      averageResponseLength: 0
    };
  });

  let testCounter = 1;

  // Executar testes
  for (const modelConfig of MODEL_CONFIGS) {
    console.log(`\n🤖 Testando: ${modelConfig.name}`);
    console.log('-'.repeat(60));

    const modelResults = results.models[modelConfig.name];

    for (const topic of TEST_TOPICS) {
      results.totalTests++;
      modelResults.totalTests++;

      const result = await testModel(modelConfig, topic, testCounter);
      testCounter++;

      if (result.success) {
        results.successfulTests++;
        modelResults.successfulTests++;
        modelResults.totalDuration += result.duration;
        modelResults.minDuration = Math.min(modelResults.minDuration, result.duration);
        modelResults.maxDuration = Math.max(modelResults.maxDuration, result.duration);
        modelResults.totalResponseLength += result.responseData?.textLength || 0;
        
        modelResults.topics.push({
          topic: result.topic,
          duration: result.duration,
          responseLength: result.responseData?.textLength || 0,
          hasValidJson: result.responseData?.hasValidJson || false
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

      // Pausa entre testes para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Calcular estatísticas do modelo
    if (modelResults.successfulTests > 0) {
      modelResults.averageDuration = modelResults.totalDuration / modelResults.successfulTests;
      modelResults.averageResponseLength = modelResults.totalResponseLength / modelResults.successfulTests;
    }
  }

  // Gerar relatório
  generateReport();
}

// Função para gerar relatório
function generateReport() {
  console.log('\n📊 RELATÓRIO DE COMPARAÇÃO DE MODELOS');
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
    console.log(`   📝 Resposta média: ${model.averageResponseLength.toFixed(0)} caracteres`);
    
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

  // Ranking de qualidade (baseado no tamanho da resposta)
  console.log('\n🎯 RANKING DE QUALIDADE (tamanho da resposta):');
  console.log('-'.repeat(60));
  
  const qualityRanking = modelStats
    .filter(m => m.successfulTests > 0)
    .sort((a, b) => b.averageResponseLength - a.averageResponseLength);

  qualityRanking.forEach((model, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📝';
    console.log(`${emoji} ${model.name}: ${model.averageResponseLength.toFixed(0)} caracteres`);
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
    console.log(`📝 Maior qualidade: ${highestQuality.name} (${highestQuality.averageResponseLength.toFixed(0)} chars)`);
    
    // Determinar melhor modelo geral
    const bestOverall = modelStats.find(m => 
      m.successRate >= 90 && 
      m.averageDuration <= 10000 && 
      m.averageResponseLength >= 500
    );
    
    if (bestOverall) {
      console.log(`\n🏆 MELHOR MODELO GERAL: ${bestOverall.name}`);
      console.log(`   ✅ Combina velocidade, confiabilidade e qualidade`);
    } else {
      console.log(`\n⚖️  Considere usar diferentes modelos para diferentes necessidades:`);
      console.log(`   - ${fastest.name} para respostas rápidas`);
      console.log(`   - ${mostReliable.name} para máxima confiabilidade`);
      console.log(`   - ${highestQuality.name} para conteúdo detalhado`);
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
