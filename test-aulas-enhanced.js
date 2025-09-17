// test-aulas-enhanced.js
// Script de teste para o sistema de aulas aprimorado

import fetch from 'node-fetch';

async function testAulasEnhanced() {
  console.log('🧪 Testando Sistema de Aulas Aprimorado...\n');

  const baseUrl = 'http://localhost:3000/api';
  const topic = 'Física dos esportes';

  try {
    // 1. Testar geração de esqueleto
    console.log('1️⃣ Testando geração de esqueleto...');
    const skeletonResponse = await fetch(`${baseUrl}/aulas/skeleton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!skeletonResponse.ok) {
      throw new Error(`Erro ao gerar esqueleto: ${skeletonResponse.status}`);
    }

    const skeletonData = await skeletonResponse.json();
    console.log('✅ Esqueleto gerado:', skeletonData.skeleton.id);
    console.log(`   📊 Etapas: ${skeletonData.skeleton.stages.length}`);
    console.log(`   📝 Título: ${skeletonData.skeleton.title}\n`);

    // 2. Testar geração de slides iniciais
    console.log('2️⃣ Testando geração de slides iniciais...');
    const initialSlidesResponse = await fetch(`${baseUrl}/aulas/initial-slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!initialSlidesResponse.ok) {
      throw new Error(`Erro ao gerar slides iniciais: ${initialSlidesResponse.status}`);
    }

    const initialSlidesData = await initialSlidesResponse.json();
    console.log('✅ Slides iniciais gerados:', initialSlidesData.slides.length);
    console.log(`   📄 Slide 1: ${initialSlidesData.slides[0]?.title}`);
    console.log(`   📄 Slide 2: ${initialSlidesData.slides[1]?.title}\n`);

    // 3. Testar carregamento de próximo slide
    console.log('3️⃣ Testando carregamento de próximo slide...');
    const nextSlideResponse = await fetch(`${baseUrl}/aulas/next-slide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        slideNumber: 3,
        previousSlides: initialSlidesData.slides.slice(0, 2)
      })
    });

    if (!nextSlideResponse.ok) {
      throw new Error(`Erro ao carregar próximo slide: ${nextSlideResponse.status}`);
    }

    const nextSlideData = await nextSlideResponse.json();
    console.log('✅ Próximo slide carregado:', nextSlideData.slide.title);
    console.log(`   📄 Tipo: ${nextSlideData.slide.type}\n`);

    // 4. Testar atualização de progresso
    console.log('4️⃣ Testando atualização de progresso...');
    const progressResponse = await fetch(`${baseUrl}/aulas/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: skeletonData.skeleton.id,
        etapa: 1,
        completed: true,
        points: 5
      })
    });

    if (!progressResponse.ok) {
      throw new Error(`Erro ao atualizar progresso: ${progressResponse.status}`);
    }

    const progressData = await progressResponse.json();
    console.log('✅ Progresso atualizado:', progressData.message);
    console.log(`   📊 Etapa ${progressData.data.etapa} concluída\n`);

    // 5. Testar busca de progresso
    console.log('5️⃣ Testando busca de progresso...');
    const getProgressResponse = await fetch(`${baseUrl}/aulas/progress?lessonId=${skeletonData.skeleton.id}`);

    if (!getProgressResponse.ok) {
      throw new Error(`Erro ao buscar progresso: ${getProgressResponse.status}`);
    }

    const getProgressData = await getProgressResponse.json();
    console.log('✅ Progresso buscado:', getProgressData.success);
    console.log(`   📊 Aula encontrada: ${getProgressData.lesson ? 'Sim' : 'Não'}\n`);

    console.log('🎉 Todos os testes passaram com sucesso!');
    console.log('\n📋 Resumo das funcionalidades testadas:');
    console.log('   ✅ Geração de esqueleto da aula');
    console.log('   ✅ Carregamento de slides iniciais');
    console.log('   ✅ Carregamento sob demanda');
    console.log('   ✅ Atualização de progresso');
    console.log('   ✅ Busca de progresso');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('\n🔧 Verificações necessárias:');
    console.log('   1. Servidor está rodando em http://localhost:3000');
    console.log('   2. Variáveis de ambiente configuradas');
    console.log('   3. OpenAI API Key válida');
    console.log('   4. Neo4j configurado (opcional)');
  }
}

// Executar testes
testAulasEnhanced();