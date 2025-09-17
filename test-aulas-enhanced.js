#!/usr/bin/env node
// test-aulas-enhanced.js
// Script de teste para o Sistema de Aulas Aprimorado

const axios = require('axios');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Configurações de teste
const TEST_CONFIGS = [
  {
    name: 'Teste Básico - Fotossíntese',
    data: {
      topic: 'Fotossíntese',
      mode: 'sync'
    }
  },
  {
    name: 'Teste Assíncrono - Matemática',
    data: {
      topic: 'Equações Quadráticas',
      mode: 'async'
    }
  },
  {
    name: 'Teste Customizado - História',
    data: {
      topic: 'Revolução Francesa',
      mode: 'sync',
      schoolId: 'test-school-123',
      customPrompt: 'Foque em causas econômicas e sociais'
    }
  }
];

// Função para testar geração de aula
async function testLessonGeneration(config) {
  console.log(`\n🧪 ${config.name}`);
  console.log('=' .repeat(50));
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${BASE_URL}/api/aulas/generate`, config.data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 60 segundos
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (response.data.success) {
      console.log('✅ Sucesso!');
      console.log(`⏱️  Tempo: ${duration}ms`);
      console.log(`📊 Duração: ${response.data.metrics.duration.sync} min (sync), ${response.data.metrics.duration.async} min (async)`);
      console.log(`📝 Tokens: ${response.data.metrics.content.totalTokens.toLocaleString()}`);
      console.log(`🎯 Qualidade: ${response.data.metrics.quality.score}%`);
      console.log(`🖼️  Imagens: ${response.data.metrics.images.count} (~${response.data.metrics.images.estimatedSizeMB} MB)`);
      console.log(`💰 Custo: R$ ${response.data.usage.costEstimate}`);
      
      // Validar estrutura
      if (response.data.slides.length === 9) {
        console.log('✅ Estrutura: 9 slides ✓');
      } else {
        console.log(`❌ Estrutura: ${response.data.slides.length} slides (esperado: 9)`);
      }
      
      // Validar quizzes
      const quizSlides = response.data.slides.filter(slide => slide.type === 'quiz');
      if (quizSlides.length === 2) {
        console.log('✅ Quizzes: 2 quizzes ✓');
      } else {
        console.log(`❌ Quizzes: ${quizSlides.length} quizzes (esperado: 2)`);
      }
      
      // Validar tokens por slide
      const shortSlides = response.data.slides.filter(slide => {
        const tokens = estimateTokens(slide.content);
        return tokens < 500;
      });
      
      if (shortSlides.length === 0) {
        console.log('✅ Tokens: Todos os slides com 500+ tokens ✓');
      } else {
        console.log(`⚠️  Tokens: ${shortSlides.length} slides com menos de 500 tokens`);
      }
      
      // Mostrar warnings se houver
      if (response.data.validation.issues.length > 0) {
        console.log('⚠️  Problemas:');
        response.data.validation.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
      
      // Mostrar recomendações
      if (response.data.validation.recommendations.length > 0) {
        console.log('💡 Recomendações:');
        response.data.validation.recommendations.forEach(rec => {
          console.log(`   - ${rec.message}`);
        });
      }
      
      return {
        success: true,
        duration,
        metrics: response.data.metrics,
        validation: response.data.validation
      };
      
    } else {
      console.log('❌ Falha na geração');
      console.log('Erro:', response.data.error);
      return { success: false, error: response.data.error };
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Erro:', error.response.data.error || error.response.data);
    } else {
      console.log('Erro:', error.message);
    }
    return { success: false, error: error.message };
  }
}

// Função para testar estatísticas admin
async function testAdminStats() {
  console.log('\n📊 Testando Estatísticas Admin');
  console.log('=' .repeat(50));
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/stats-enhanced`);
    
    if (response.data.success) {
      console.log('✅ Estatísticas carregadas');
      console.log(`👥 Usuários: ${response.data.stats.users.total}`);
      console.log(`📚 Aulas: ${response.data.stats.lessons.total}`);
      console.log(`💬 Chats: ${response.data.stats.chats.total}`);
      
      if (response.data.stats.pacing) {
        console.log(`📊 Métricas de Pacing:`);
        console.log(`   - Aulas com métricas: ${response.data.stats.pacing.totalLessonsWithMetrics}`);
        console.log(`   - Duração média: ${response.data.stats.pacing.averageDuration} min`);
        console.log(`   - Tokens médios: ${response.data.stats.pacing.averageTokens.toLocaleString()}`);
        console.log(`   - Qualidade média: ${response.data.stats.pacing.averageQuality}%`);
      }
      
      return { success: true };
    } else {
      console.log('❌ Falha ao carregar estatísticas');
      return { success: false };
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição de estatísticas');
    console.log('Erro:', error.message);
    return { success: false };
  }
}

// Função auxiliar para estimar tokens (simplificada)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando Testes do Sistema de Aulas Aprimorado');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Testar geração de aulas
  for (const config of TEST_CONFIGS) {
    const result = await testLessonGeneration(config);
    results.push({ test: config.name, ...result });
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Testar estatísticas admin
  const adminResult = await testAdminStats();
  results.push({ test: 'Admin Stats', ...adminResult });
  
  // Resumo dos resultados
  console.log('\n📋 Resumo dos Testes');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Sucessos: ${successful}/${total}`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
    
    if (result.success && result.metrics) {
      console.log(`   📊 Qualidade: ${result.metrics.quality.score}%`);
      console.log(`   ⏱️  Duração: ${result.metrics.duration.sync} min`);
    }
  });
  
  // Estatísticas gerais
  const successfulTests = results.filter(r => r.success && r.metrics);
  if (successfulTests.length > 0) {
    const avgQuality = Math.round(
      successfulTests.reduce((sum, r) => sum + r.metrics.quality.score, 0) / successfulTests.length
    );
    const avgDuration = Math.round(
      successfulTests.reduce((sum, r) => sum + r.metrics.duration.sync, 0) / successfulTests.length
    );
    
    console.log('\n📈 Estatísticas Gerais');
    console.log(`🎯 Qualidade média: ${avgQuality}%`);
    console.log(`⏱️  Duração média: ${avgDuration} min`);
    console.log(`💰 Custo total estimado: R$ ${successfulTests.reduce((sum, r) => sum + parseFloat(r.metrics.content.totalTokens * 0.00003), 0).toFixed(4)}`);
  }
  
  console.log('\n🎉 Testes concluídos!');
  
  if (successful === total) {
    console.log('🎊 Todos os testes passaram! Sistema funcionando perfeitamente.');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os logs acima.');
    process.exit(1);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testLessonGeneration, testAdminStats };
