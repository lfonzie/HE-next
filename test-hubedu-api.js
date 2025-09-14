// Test script for HubEdu Interactive API endpoints
// Run with: node test-hubedu-api.js

const BASE_URL = 'http://localhost:3000';

async function testHubEduAPI() {
  console.log('🧪 Testando APIs do HubEdu Interactive...\n');

  try {
    // Test 1: Generate initial slides (1 and 2)
    console.log('1️⃣ Testando geração de slides iniciais...');
    const initialResponse = await fetch(`${BASE_URL}/api/module-professor-interactive/hubedu-initial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: 'fotossíntese' }),
    });

    if (!initialResponse.ok) {
      throw new Error(`HTTP ${initialResponse.status}: ${initialResponse.statusText}`);
    }

    const initialData = await initialResponse.json();
    console.log('✅ Slides iniciais gerados com sucesso!');
    console.log('📊 Dados recebidos:', {
      success: initialData.success,
      slidesCount: Object.keys(initialData.slides).length,
      slide1Title: initialData.slides.slide1?.title,
      slide2Title: initialData.slides.slide2?.title,
    });

    // Test 2: Generate individual slide (slide 3)
    console.log('\n2️⃣ Testando geração de slide individual...');
    const slideResponse = await fetch(`${BASE_URL}/api/module-professor-interactive/hubedu-slide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        theme: 'fotossíntese',
        slideNumber: 3 
      }),
    });

    if (!slideResponse.ok) {
      throw new Error(`HTTP ${slideResponse.status}: ${slideResponse.statusText}`);
    }

    const slideData = await slideResponse.json();
    console.log('✅ Slide individual gerado com sucesso!');
    console.log('📊 Dados recebidos:', {
      success: slideData.success,
      slideNumber: slideData.slide?.slide,
      title: slideData.slide?.title,
      type: slideData.slide?.type,
      hasImagePrompt: !!slideData.slide?.image_prompt,
    });

    // Test 3: Generate question slide (slide 4)
    console.log('\n3️⃣ Testando geração de slide de pergunta...');
    const questionResponse = await fetch(`${BASE_URL}/api/module-professor-interactive/hubedu-slide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        theme: 'fotossíntese',
        slideNumber: 4 
      }),
    });

    if (!questionResponse.ok) {
      throw new Error(`HTTP ${questionResponse.status}: ${questionResponse.statusText}`);
    }

    const questionData = await questionResponse.json();
    console.log('✅ Slide de pergunta gerado com sucesso!');
    console.log('📊 Dados recebidos:', {
      success: questionData.success,
      slideNumber: questionData.slide?.slide,
      title: questionData.slide?.title,
      type: questionData.slide?.type,
      optionsCount: questionData.slide?.options?.length,
      hasAnswer: !!questionData.slide?.answer,
    });

    // Test 4: Generate closing slide (slide 8)
    console.log('\n4️⃣ Testando geração de slide de encerramento...');
    const closingResponse = await fetch(`${BASE_URL}/api/module-professor-interactive/hubedu-slide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        theme: 'fotossíntese',
        slideNumber: 8 
      }),
    });

    if (!closingResponse.ok) {
      throw new Error(`HTTP ${closingResponse.status}: ${closingResponse.statusText}`);
    }

    const closingData = await closingResponse.json();
    console.log('✅ Slide de encerramento gerado com sucesso!');
    console.log('📊 Dados recebidos:', {
      success: closingData.success,
      slideNumber: closingData.slide?.slide,
      title: closingData.slide?.title,
      type: closingData.slide?.type,
      hasImagePrompt: !!closingData.slide?.image_prompt,
    });

    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('\n📋 Resumo dos testes:');
    console.log('✅ Geração de slides iniciais (1 e 2)');
    console.log('✅ Geração de slide individual (3)');
    console.log('✅ Geração de slide de pergunta (4)');
    console.log('✅ Geração de slide de encerramento (8)');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    console.log('\n💡 Dicas para resolver:');
    console.log('1. Certifique-se de que o servidor está rodando (npm run dev)');
    console.log('2. Verifique se a variável OPENAI_API_KEY está configurada');
    console.log('3. Verifique se as rotas da API estão acessíveis');
  }
}

// Test with different themes
async function testMultipleThemes() {
  console.log('\n🎨 Testando diferentes temas...\n');

  const themes = ['frações', 'revolução francesa', 'células', 'literatura'];
  
  for (const theme of themes) {
    try {
      console.log(`🧪 Testando tema: ${theme}`);
      const response = await fetch(`${BASE_URL}/api/module-professor-interactive/hubedu-initial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${theme}: ${data.slides.slide1.title}`);
      } else {
        console.log(`❌ ${theme}: Erro ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${theme}: ${error.message}`);
    }
  }
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  testHubEduAPI().then(() => {
    return testMultipleThemes();
  }).catch(console.error);
} else {
  // Browser environment
  console.log('Para testar no navegador, abra o console e execute:');
  console.log('testHubEduAPI()');
}
