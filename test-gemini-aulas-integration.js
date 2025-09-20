// test-gemini-aulas-integration.js
// Script de teste para validar a integração completa do Gemini com o sistema de aulas

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Test topics
const TEST_TOPICS = [
  'Eletricidade e Corrente Elétrica',
  'Fotossíntese nas Plantas',
  'Revolução Francesa',
  'Equações do Segundo Grau',
  'Estrutura do DNA'
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🧪 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function logTest(testName, status, details = '') {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  
  log(`${statusIcon} ${testName}: ${status}`, statusColor);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

async function testGeminiAPIKey() {
  logSection('Verificando Configuração da API do Gemini');
  
  const apiKeys = [
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ];
  
  const hasApiKey = apiKeys.some(key => key && key.length > 0);
  
  if (hasApiKey) {
    logTest('API Key do Gemini', 'PASS', 'Chave de API configurada');
  } else {
    logTest('API Key do Gemini', 'FAIL', 'Nenhuma chave de API do Gemini encontrada');
    log('Configure uma das seguintes variáveis de ambiente:', 'yellow');
    log('  - GOOGLE_GEMINI_API_KEY', 'yellow');
    log('  - GOOGLE_API_KEY', 'yellow');
    log('  - GOOGLE_GENERATIVE_AI_API_KEY', 'yellow');
    return false;
  }
  
  return true;
}

async function testGeminiLessonGeneration() {
  logSection('Testando Geração Completa de Aulas com Gemini');
  
  const testTopic = TEST_TOPICS[0];
  
  try {
    log(`🎯 Testando geração de aula sobre: ${testTopic}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/api/aulas/generate-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: testTopic,
        mode: 'sync'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      logTest('Geração Completa de Aula', 'FAIL', `Erro ${response.status}: ${errorData.error}`);
      return false;
    }
    
    const data = await response.json();
    
    // Validate response structure
    const validations = [
      { test: 'Resposta tem success: true', condition: data.success === true },
      { test: 'Tem campo lesson', condition: data.lesson && typeof data.lesson === 'object' },
      { test: 'Tem campo slides', condition: data.slides && Array.isArray(data.slides) },
      { test: 'Tem 14 slides', condition: data.slides.length === 14 },
      { test: 'Tem campo metrics', condition: data.metrics && typeof data.metrics === 'object' },
      { test: 'Tem campo usage com provider gemini', condition: data.usage && data.usage.provider === 'gemini' },
      { test: 'Tem campo validation', condition: data.validation && typeof data.validation === 'object' }
    ];
    
    let allPassed = true;
    validations.forEach(({ test, condition }) => {
      if (condition) {
        logTest(test, 'PASS');
      } else {
        logTest(test, 'FAIL');
        allPassed = false;
      }
    });
    
    // Validate slides structure
    if (data.slides && data.slides.length > 0) {
      const firstSlide = data.slides[0];
      const slideValidations = [
        { test: 'Slide tem campo number', condition: firstSlide.number !== undefined },
        { test: 'Slide tem campo title', condition: firstSlide.title && typeof firstSlide.title === 'string' },
        { test: 'Slide tem campo content', condition: firstSlide.content && typeof firstSlide.content === 'string' },
        { test: 'Slide tem campo type', condition: firstSlide.type && typeof firstSlide.type === 'string' },
        { test: 'Slide tem campo tokenEstimate', condition: firstSlide.tokenEstimate !== undefined }
      ];
      
      slideValidations.forEach(({ test, condition }) => {
        if (condition) {
          logTest(test, 'PASS');
        } else {
          logTest(test, 'FAIL');
          allPassed = false;
        }
      });
    }
    
    // Check for quiz slides
    const quizSlides = data.slides.filter(slide => slide.type === 'quiz');
    if (quizSlides.length === 2) {
      logTest('Tem 2 slides de quiz', 'PASS');
    } else {
      logTest('Tem 2 slides de quiz', 'FAIL', `Encontrados ${quizSlides.length} slides de quiz`);
      allPassed = false;
    }
    
    // Check quiz structure
    if (quizSlides.length > 0) {
      const quizSlide = quizSlides[0];
      const quizValidations = [
        { test: 'Quiz tem campo questions', condition: quizSlide.questions && Array.isArray(quizSlide.questions) },
        { test: 'Quiz tem campo points', condition: quizSlide.points !== undefined },
        { test: 'Quiz tem pelo menos 1 pergunta', condition: quizSlide.questions && quizSlide.questions.length > 0 }
      ];
      
      quizValidations.forEach(({ test, condition }) => {
        if (condition) {
          logTest(test, 'PASS');
        } else {
          logTest(test, 'FAIL');
          allPassed = false;
        }
      });
      
      // Check question structure
      if (quizSlide.questions && quizSlide.questions.length > 0) {
        const question = quizSlide.questions[0];
        const questionValidations = [
          { test: 'Pergunta tem campo q', condition: question.q && typeof question.q === 'string' },
          { test: 'Pergunta tem campo options', condition: question.options && Array.isArray(question.options) },
          { test: 'Pergunta tem 4 opções', condition: question.options && question.options.length === 4 },
          { test: 'Pergunta tem campo correct', condition: question.correct !== undefined },
          { test: 'Pergunta tem campo explanation', condition: question.explanation && typeof question.explanation === 'string' }
        ];
        
        questionValidations.forEach(({ test, condition }) => {
          if (condition) {
            logTest(test, 'PASS');
          } else {
            logTest(test, 'FAIL');
            allPassed = false;
          }
        });
      }
    }
    
    if (allPassed) {
      logTest('Geração Completa de Aula', 'PASS', `Aula gerada com ${data.slides.length} slides`);
      log(`📊 Métricas: ${data.metrics.quality.score}% de qualidade, ${data.metrics.duration.sync} minutos`, 'green');
      log(`💰 Custo estimado: $${data.usage.costEstimate}`, 'green');
      return true;
    } else {
      logTest('Geração Completa de Aula', 'FAIL', 'Estrutura da resposta inválida');
      return false;
    }
    
  } catch (error) {
    logTest('Geração Completa de Aula', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function testProgressiveLoading() {
  logSection('Testando Carregamento Progressivo com Gemini');
  
  const testTopic = TEST_TOPICS[1];
  
  try {
    // Test skeleton generation
    log(`🎯 Testando geração de esqueleto para: ${testTopic}`, 'blue');
    
    const skeletonResponse = await fetch(`${BASE_URL}/api/aulas/progressive-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: testTopic,
        action: 'skeleton'
      })
    });
    
    if (!skeletonResponse.ok) {
      const errorData = await skeletonResponse.json();
      logTest('Geração de Esqueleto', 'FAIL', `Erro ${skeletonResponse.status}: ${errorData.error}`);
      return false;
    }
    
    const skeletonData = await skeletonResponse.json();
    
    const skeletonValidations = [
      { test: 'Esqueleto tem success: true', condition: skeletonData.success === true },
      { test: 'Esqueleto tem campo skeleton', condition: skeletonData.skeleton && typeof skeletonData.skeleton === 'object' },
      { test: 'Esqueleto tem 14 stages', condition: skeletonData.skeleton.stages && skeletonData.skeleton.stages.length === 14 },
      { test: 'Esqueleto tem provider gemini', condition: skeletonData.provider === 'gemini' }
    ];
    
    let skeletonPassed = true;
    skeletonValidations.forEach(({ test, condition }) => {
      if (condition) {
        logTest(test, 'PASS');
      } else {
        logTest(test, 'FAIL');
        skeletonPassed = false;
      }
    });
    
    if (!skeletonPassed) {
      logTest('Geração de Esqueleto', 'FAIL', 'Estrutura do esqueleto inválida');
      return false;
    }
    
    logTest('Geração de Esqueleto', 'PASS', `Esqueleto gerado com ${skeletonData.skeleton.stages.length} stages`);
    
    // Test initial slides generation
    log(`🎯 Testando geração de slides iniciais para: ${testTopic}`, 'blue');
    
    const slidesResponse = await fetch(`${BASE_URL}/api/aulas/progressive-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: testTopic,
        action: 'initial-slides'
      })
    });
    
    if (!slidesResponse.ok) {
      const errorData = await slidesResponse.json();
      logTest('Geração de Slides Iniciais', 'FAIL', `Erro ${slidesResponse.status}: ${errorData.error}`);
      return false;
    }
    
    const slidesData = await slidesResponse.json();
    
    const slidesValidations = [
      { test: 'Slides têm success: true', condition: slidesData.success === true },
      { test: 'Slides têm campo slides', condition: slidesData.slides && Array.isArray(slidesData.slides) },
      { test: 'Slides têm 2 slides', condition: slidesData.slides && slidesData.slides.length === 2 },
      { test: 'Slides têm provider gemini', condition: slidesData.provider === 'gemini' }
    ];
    
    let slidesPassed = true;
    slidesValidations.forEach(({ test, condition }) => {
      if (condition) {
        logTest(test, 'PASS');
      } else {
        logTest(test, 'FAIL');
        slidesPassed = false;
      }
    });
    
    if (!slidesPassed) {
      logTest('Geração de Slides Iniciais', 'FAIL', 'Estrutura dos slides inválida');
      return false;
    }
    
    logTest('Geração de Slides Iniciais', 'PASS', `Slides iniciais gerados: ${slidesData.slides.length} slides`);
    
    return true;
    
  } catch (error) {
    logTest('Carregamento Progressivo', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function testNextSlideGeneration() {
  logSection('Testando Geração de Próximo Slide com Gemini');
  
  const testTopic = TEST_TOPICS[2];
  
  try {
    log(`🎯 Testando geração de slide 3 para: ${testTopic}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/api/aulas/next-slide-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: testTopic,
        slideNumber: 3,
        previousSlides: [
          {
            number: 1,
            title: 'Abertura: Tema e Objetivos',
            content: 'Conteúdo do slide 1...',
            type: 'content'
          },
          {
            number: 2,
            title: 'Conceitos Fundamentais',
            content: 'Conteúdo do slide 2...',
            type: 'content'
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      logTest('Geração de Próximo Slide', 'FAIL', `Erro ${response.status}: ${errorData.error}`);
      return false;
    }
    
    const data = await response.json();
    
    const validations = [
      { test: 'Resposta tem success: true', condition: data.success === true },
      { test: 'Tem campo slide', condition: data.slide && typeof data.slide === 'object' },
      { test: 'Slide tem número correto', condition: data.slide.number === 3 },
      { test: 'Slide tem título', condition: data.slide.title && typeof data.slide.title === 'string' },
      { test: 'Slide tem conteúdo', condition: data.slide.content && typeof data.slide.content === 'string' },
      { test: 'Slide tem tipo', condition: data.slide.type && typeof data.slide.type === 'string' },
      { test: 'Tem provider gemini', condition: data.provider === 'gemini' }
    ];
    
    let allPassed = true;
    validations.forEach(({ test, condition }) => {
      if (condition) {
        logTest(test, 'PASS');
      } else {
        logTest(test, 'FAIL');
        allPassed = false;
      }
    });
    
    if (allPassed) {
      logTest('Geração de Próximo Slide', 'PASS', `Slide ${data.slide.number} gerado: "${data.slide.title}"`);
      return true;
    } else {
      logTest('Geração de Próximo Slide', 'FAIL', 'Estrutura da resposta inválida');
      return false;
    }
    
  } catch (error) {
    logTest('Geração de Próximo Slide', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function testQuizGeneration() {
  logSection('Testando Geração de Quiz com Gemini');
  
  const testTopic = TEST_TOPICS[3];
  
  try {
    log(`🎯 Testando geração de quiz (slide 7) para: ${testTopic}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/api/aulas/next-slide-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: testTopic,
        slideNumber: 7, // Quiz slide
        previousSlides: [
          {
            number: 1,
            title: 'Abertura: Tema e Objetivos',
            content: 'Conteúdo do slide 1...',
            type: 'content'
          },
          {
            number: 2,
            title: 'Conceitos Fundamentais',
            content: 'Conteúdo do slide 2...',
            type: 'content'
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      logTest('Geração de Quiz', 'FAIL', `Erro ${response.status}: ${errorData.error}`);
      return false;
    }
    
    const data = await response.json();
    
    const validations = [
      { test: 'Resposta tem success: true', condition: data.success === true },
      { test: 'Slide é do tipo quiz', condition: data.slide.type === 'quiz' },
      { test: 'Quiz tem campo questions', condition: data.slide.questions && Array.isArray(data.slide.questions) },
      { test: 'Quiz tem pelo menos 1 pergunta', condition: data.slide.questions && data.slide.questions.length > 0 },
      { test: 'Quiz tem campo points', condition: data.slide.points !== undefined }
    ];
    
    let allPassed = true;
    validations.forEach(({ test, condition }) => {
      if (condition) {
        logTest(test, 'PASS');
      } else {
        logTest(test, 'FAIL');
        allPassed = false;
      }
    });
    
    // Check question structure
    if (data.slide.questions && data.slide.questions.length > 0) {
      const question = data.slide.questions[0];
      const questionValidations = [
        { test: 'Pergunta tem campo q', condition: question.q && typeof question.q === 'string' },
        { test: 'Pergunta tem campo options', condition: question.options && Array.isArray(question.options) },
        { test: 'Pergunta tem 4 opções', condition: question.options && question.options.length === 4 },
        { test: 'Pergunta tem campo correct', condition: question.correct !== undefined },
        { test: 'Pergunta tem campo explanation', condition: question.explanation && typeof question.explanation === 'string' }
      ];
      
      questionValidations.forEach(({ test, condition }) => {
        if (condition) {
          logTest(test, 'PASS');
        } else {
          logTest(test, 'FAIL');
          allPassed = false;
        }
      });
    }
    
    if (allPassed) {
      logTest('Geração de Quiz', 'PASS', `Quiz gerado com ${data.slide.questions.length} pergunta(s)`);
      return true;
    } else {
      logTest('Geração de Quiz', 'FAIL', 'Estrutura do quiz inválida');
      return false;
    }
    
  } catch (error) {
    logTest('Geração de Quiz', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  logSection('INICIANDO TESTES DE INTEGRAÇÃO GEMINI - SISTEMA DE AULAS');
  
  const startTime = Date.now();
  
  // Check API key first
  const hasApiKey = await testGeminiAPIKey();
  if (!hasApiKey) {
    log('\n❌ Testes interrompidos: API key do Gemini não configurada', 'red');
    process.exit(1);
  }
  
  // Run all tests
  const tests = [
    { name: 'Geração Completa de Aulas', fn: testGeminiLessonGeneration },
    { name: 'Carregamento Progressivo', fn: testProgressiveLoading },
    { name: 'Geração de Próximo Slide', fn: testNextSlideGeneration },
    { name: 'Geração de Quiz', fn: testQuizGeneration }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      log(`❌ Erro no teste ${test.name}: ${error.message}`, 'red');
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  logSection('RESUMO DOS TESTES');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(({ name, passed }) => {
    const status = passed ? 'PASS' : 'FAIL';
    const color = passed ? 'green' : 'red';
    logTest(name, status, '', color);
  });
  
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n' + '='.repeat(60));
  log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} testes passaram`, passedTests === totalTests ? 'green' : 'red');
  log(`⏱️  Tempo total: ${totalTime}s`, 'blue');
  
  if (passedTests === totalTests) {
    log('\n🎉 TODOS OS TESTES PASSARAM! Integração Gemini funcionando perfeitamente!', 'green');
    log('✅ Sistema de aulas com Gemini está pronto para uso!', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima para detalhes.', 'yellow');
  }
  
  console.log('='.repeat(60));
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

export {
  testGeminiAPIKey,
  testGeminiLessonGeneration,
  testProgressiveLoading,
  testNextSlideGeneration,
  testQuizGeneration,
  runAllTests
};
