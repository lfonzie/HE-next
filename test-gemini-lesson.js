#!/usr/bin/env node

/**
 * Script de Teste: Geração de Aula com Google Gemini 2.0 Flash Exp
 * 
 * Testa se a mudança de provedor para Google Gemini está funcionando
 * 
 * Execução: node test-gemini-lesson.js
 */

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Tópico de teste
const TEST_TOPIC = 'Fotossíntese: Como as plantas convertem luz solar em energia química';

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
async function testGeminiLessonGeneration() {
  console.log('🚀 TESTE DE GERAÇÃO DE AULA COM GOOGLE GEMINI');
  console.log('=' .repeat(60));
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🌐 Servidor: ${BASE_URL}`);
  console.log(`📝 Tópico: ${TEST_TOPIC}`);
  console.log('=' .repeat(60));

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

  const startTime = Date.now();
  
  try {
    console.log('\n🧪 Testando geração de aula com Google Gemini...');
    console.log(`📝 Tópico: ${TEST_TOPIC}`);
    
    const requestData = {
      topic: TEST_TOPIC,
      demoMode: true, // Usar modo demo para não salvar no banco
      provider: 'google', // Usar Google Gemini
      complexity: 'simple' // Usar complexidade simples para velocidade
    };

    const response = await makeRequest(`${BASE_URL}/api/generate-lesson-multi`, requestData);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verificar se a resposta contém dados válidos
    if (response && response.success && response.lesson) {
      console.log(`✅ Sucesso em ${duration}ms (${(duration/1000).toFixed(1)}s)`);
      
      const lesson = response.lesson;
      console.log('\n📊 DADOS DA AULA GERADA:');
      console.log(`🤖 Provedor: ${response.provider || 'N/A'}`);
      console.log(`⚡ Complexidade: ${response.complexity || 'N/A'}`);
      console.log(`📚 Título: ${lesson.title}`);
      console.log(`🎯 Assunto: ${lesson.subject}`);
      console.log(`📖 Série: ${lesson.grade}`);
      console.log(`🎯 Objetivos: ${lesson.objectives?.length || 0}`);
      console.log(`📋 Slides: ${lesson.slides?.length || 0}`);
      console.log(`🎮 Etapas: ${lesson.stages?.length || 0}`);
      
      if (lesson.slides && lesson.slides.length > 0) {
        console.log('\n📋 PRIMEIROS SLIDES:');
        lesson.slides.slice(0, 3).forEach((slide, index) => {
          console.log(`   ${index + 1}. ${slide.title} (${slide.type})`);
        });
      }
      
      if (lesson.stages && lesson.stages.length > 0) {
        console.log('\n🎮 ETAPAS DA AULA:');
        lesson.stages.forEach((stage, index) => {
          console.log(`   ${index + 1}. ${stage.etapa} (${stage.type})`);
        });
      }
      
      // Verificar métricas de pacing profissional
      if (response.pacingMetrics) {
        console.log('\n⚡ MÉTRICAS DE PACING PROFISSIONAL:');
        console.log(`   📊 Pontuação geral: ${response.pacingMetrics.overallScore || 'N/A'}`);
        console.log(`   ⏱️  Duração estimada: ${response.pacingMetrics.estimatedDuration || 'N/A'} min`);
        console.log(`   🎯 Densidade de conteúdo: ${response.pacingMetrics.contentDensity || 'N/A'}`);
      }
      
      // Verificar warnings
      if (response.warnings && response.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        response.warnings.forEach(warning => {
          console.log(`   - ${warning}`);
        });
      }
      
      console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
      console.log(`⚡ Google Gemini 2.0 Flash Exp funcionando corretamente`);
      console.log(`⏱️  Tempo de geração: ${duration}ms (${(duration/1000).toFixed(1)}s)`);
      
      return {
        success: true,
        duration,
        lesson: response.lesson,
        pacingMetrics: response.pacingMetrics,
        warnings: response.warnings
      };
      
    } else {
      throw new Error('Resposta inválida da API');
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ Falha em ${duration}ms: ${error.message}`);
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('   1. Verificar se GOOGLE_GENERATIVE_AI_API_KEY está configurada no .env.local');
    console.log('   2. Verificar se o servidor está rodando corretamente');
    console.log('   3. Verificar logs do servidor para mais detalhes');
    
    return {
      success: false,
      duration,
      error: error.message
    };
  }
}

// Executar teste
async function main() {
  try {
    const result = await testGeminiLessonGeneration();
    
    if (result.success) {
      console.log('\n✅ RESULTADO: Google Gemini está funcionando!');
      process.exit(0);
    } else {
      console.log('\n❌ RESULTADO: Teste falhou');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testGeminiLessonGeneration };
