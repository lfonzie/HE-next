// test-gemini-quality-validation-disabled.js
// Script de teste para validar se as aulas funcionam sem validação de qualidade

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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

async function testLessonGenerationWithoutQualityValidation() {
  logSection('Testando Geração de Aula sem Validação de Qualidade');
  
  const testTopic = 'Fotossíntese nas Plantas';
  
  try {
    log(`🎯 Testando geração de aula completa para: ${testTopic}`, 'blue');
    
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
      logTest('Conexão com API', 'FAIL', `Erro ${response.status}: ${errorData.error}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success || !data.slides || data.slides.length === 0) {
      logTest('Resposta da API', 'FAIL', 'Resposta inválida ou sem slides');
      return false;
    }
    
    logTest('Aula gerada com sucesso', 'PASS', `${data.slides.length} slides gerados`);
    
    // Verificar se não há métricas de qualidade
    if (data.metrics && data.metrics.quality) {
      logTest('Métricas de qualidade removidas', 'FAIL', 'Ainda contém métricas de qualidade');
      return false;
    } else {
      logTest('Métricas de qualidade removidas', 'PASS', 'Métricas de qualidade não encontradas');
    }
    
    // Verificar estrutura básica dos slides
    const slides = data.slides;
    let validSlides = 0;
    let quizSlides = 0;
    
    slides.forEach((slide, index) => {
      if (slide.title && slide.content && slide.type) {
        validSlides++;
        
        if (slide.type === 'quiz') {
          quizSlides++;
          if (slide.questions && slide.questions.length > 0) {
            log(`📊 Quiz ${quizSlides}: "${slide.title}" com ${slide.questions.length} questão(ões)`, 'green');
          } else {
            log(`⚠️ Quiz ${quizSlides}: "${slide.title}" sem questões`, 'yellow');
          }
        } else {
          log(`📄 Slide ${slide.number}: "${slide.title}" (${slide.type})`, 'blue');
        }
      } else {
        log(`❌ Slide ${index + 1}: Estrutura inválida`, 'red');
      }
    });
    
    logTest('Estrutura dos slides', 'PASS', `${validSlides}/${slides.length} slides válidos`);
    logTest('Slides de quiz', 'PASS', `${quizSlides} quiz(zes) encontrado(s)`);
    
    // Verificar se não há validação de qualidade nos logs
    const hasQualityValidation = JSON.stringify(data).includes('quality') || 
                                JSON.stringify(data).includes('validSlides') ||
                                JSON.stringify(data).includes('qualityScore');
    
    if (hasQualityValidation) {
      logTest('Validação de qualidade nos dados', 'WARN', 'Ainda contém referências à qualidade');
    } else {
      logTest('Validação de qualidade nos dados', 'PASS', 'Nenhuma referência à qualidade encontrada');
    }
    
    // Verificar métricas disponíveis
    if (data.metrics) {
      const availableMetrics = Object.keys(data.metrics);
      logTest('Métricas disponíveis', 'PASS', `Métricas: ${availableMetrics.join(', ')}`);
      
      if (availableMetrics.includes('content') && availableMetrics.includes('images')) {
        logTest('Métricas essenciais', 'PASS', 'Métricas de conteúdo e imagens presentes');
      } else {
        logTest('Métricas essenciais', 'FAIL', 'Métricas essenciais ausentes');
      }
    } else {
      logTest('Métricas disponíveis', 'FAIL', 'Nenhuma métrica encontrada');
    }
    
    return validSlides === slides.length && !hasQualityValidation;
    
  } catch (error) {
    logTest('Teste de geração', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function testNextSlideGenerationWithoutQualityValidation() {
  logSection('Testando Geração de Próximo Slide sem Validação de Qualidade');
  
  const testTopic = 'Eletricidade e Corrente Elétrica';
  
  try {
    log(`🎯 Testando geração de próximo slide para: ${testTopic}`, 'blue');
    
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
      logTest('Conexão com API', 'FAIL', `Erro ${response.status}: ${errorData.error}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success || !data.slide) {
      logTest('Resposta da API', 'FAIL', 'Resposta inválida ou sem slide');
      return false;
    }
    
    logTest('Slide gerado com sucesso', 'PASS', `Slide ${data.slide.number}: "${data.slide.title}"`);
    
    // Verificar se não há validação de qualidade
    const hasQualityValidation = JSON.stringify(data).includes('quality') || 
                                JSON.stringify(data).includes('validSlides') ||
                                JSON.stringify(data).includes('qualityScore');
    
    if (hasQualityValidation) {
      logTest('Validação de qualidade nos dados', 'WARN', 'Ainda contém referências à qualidade');
    } else {
      logTest('Validação de qualidade nos dados', 'PASS', 'Nenhuma referência à qualidade encontrada');
    }
    
    // Verificar estrutura do slide
    const slide = data.slide;
    if (slide.title && slide.content && slide.type) {
      logTest('Estrutura do slide', 'PASS', 'Slide com estrutura válida');
      
      if (slide.type === 'quiz' && slide.questions) {
        logTest('Questões do quiz', 'PASS', `${slide.questions.length} questão(ões) encontrada(s)`);
        
        // Verificar se as questões não foram validadas manualmente
        let hasManualValidation = false;
        slide.questions.forEach((question, index) => {
          if (question.hasOwnProperty('originalCorrect') || question.hasOwnProperty('validated')) {
            hasManualValidation = true;
            log(`⚠️ Questão ${index + 1}: Contém validação manual`, 'yellow');
          }
        });
        
        if (!hasManualValidation) {
          logTest('Validação manual das questões', 'PASS', 'Nenhuma validação manual encontrada');
        } else {
          logTest('Validação manual das questões', 'WARN', 'Ainda contém validação manual');
        }
      }
    } else {
      logTest('Estrutura do slide', 'FAIL', 'Slide com estrutura inválida');
      return false;
    }
    
    return !hasQualityValidation;
    
  } catch (error) {
    logTest('Teste de próximo slide', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function runQualityValidationTests() {
  logSection('INICIANDO TESTES SEM VALIDAÇÃO DE QUALIDADE - GEMINI');
  
  const startTime = Date.now();
  
  // Run tests
  const tests = [
    { name: 'Geração de Aula Completa sem Validação', fn: testLessonGenerationWithoutQualityValidation },
    { name: 'Geração de Próximo Slide sem Validação', fn: testNextSlideGenerationWithoutQualityValidation }
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
  logSection('RESUMO DOS TESTES SEM VALIDAÇÃO DE QUALIDADE');
  
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
    log('\n🎉 TODOS OS TESTES PASSARAM! Validação de qualidade desabilitada!', 'green');
    log('✅ As aulas funcionam perfeitamente sem validação de qualidade!', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima para detalhes.', 'yellow');
  }
  
  console.log('='.repeat(60));
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runQualityValidationTests().catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

export {
  testLessonGenerationWithoutQualityValidation,
  testNextSlideGenerationWithoutQualityValidation,
  runQualityValidationTests
};
