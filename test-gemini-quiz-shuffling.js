// test-gemini-quiz-shuffling.js
// Script de teste para validar embaralhamento de questões no Gemini

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

async function testQuizShuffling() {
  logSection('Testando Embaralhamento de Questões no Gemini');
  
  const testTopic = 'Eletricidade e Corrente Elétrica';
  
  try {
    log(`🎯 Testando geração de quiz com embaralhamento para: ${testTopic}`, 'blue');
    
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
    
    if (!data.success || !data.slide || data.slide.type !== 'quiz') {
      logTest('Resposta da API', 'FAIL', 'Resposta inválida ou não é um quiz');
      return false;
    }
    
    logTest('Conexão com API', 'PASS', 'API respondendo corretamente');
    logTest('Quiz gerado', 'PASS', `Quiz gerado: "${data.slide.title}"`);
    
    // Analisar embaralhamento das questões
    if (!data.slide.questions || data.slide.questions.length === 0) {
      logTest('Questões do quiz', 'FAIL', 'Nenhuma questão encontrada');
      return false;
    }
    
    logTest('Questões do quiz', 'PASS', `${data.slide.questions.length} questão(ões) encontrada(s)`);
    
    // Analisar cada questão
    let shuffledQuestions = 0;
    let firstPositionCorrect = 0;
    
    data.slide.questions.forEach((question, index) => {
      if (question.options && question.options.length === 4 && question.correct !== undefined) {
        const correctIndex = question.correct;
        const isShuffled = correctIndex !== 0; // Se a resposta correta não está na primeira posição
        
        if (isShuffled) {
          shuffledQuestions++;
          log(`🎲 Questão ${index + 1}: Embaralhada (resposta correta na posição ${correctIndex + 1})`, 'green');
        } else {
          firstPositionCorrect++;
          log(`⚠️ Questão ${index + 1}: Resposta correta na primeira posição (posição ${correctIndex + 1})`, 'yellow');
        }
        
        // Mostrar as alternativas
        log(`   Alternativas:`, 'blue');
        question.options.forEach((option, optIndex) => {
          const marker = optIndex === correctIndex ? '✅' : '❌';
          log(`     ${optIndex + 1}. ${marker} ${option}`, optIndex === correctIndex ? 'green' : 'yellow');
        });
        
        log(`   Resposta correta: ${correctIndex + 1}`, 'blue');
        log(`   Explicação: ${question.explanation}`, 'blue');
      } else {
        log(`❌ Questão ${index + 1}: Estrutura inválida`, 'red');
      }
    });
    
    // Validações
    const totalQuestions = data.slide.questions.length;
    const shufflePercentage = Math.round((shuffledQuestions / totalQuestions) * 100);
    
    if (shuffledQuestions > 0) {
      logTest('Embaralhamento detectado', 'PASS', `${shuffledQuestions}/${totalQuestions} questões embaralhadas (${shufflePercentage}%)`);
    } else {
      logTest('Embaralhamento detectado', 'FAIL', 'Nenhuma questão embaralhada');
    }
    
    if (firstPositionCorrect === 0) {
      logTest('Resposta sempre na primeira posição', 'PASS', 'Nenhuma resposta na primeira posição');
    } else {
      logTest('Resposta sempre na primeira posição', 'WARN', `${firstPositionCorrect} questão(ões) com resposta na primeira posição`);
    }
    
    // Verificar se não há embaralhamento manual (originalCorrect)
    let hasManualShuffling = false;
    data.slide.questions.forEach((question, index) => {
      if (question.hasOwnProperty('originalCorrect')) {
        hasManualShuffling = true;
        log(`⚠️ Questão ${index + 1}: Contém propriedade originalCorrect (embaralhamento manual)`, 'yellow');
      }
    });
    
    if (!hasManualShuffling) {
      logTest('Embaralhamento manual removido', 'PASS', 'Nenhuma propriedade originalCorrect encontrada');
    } else {
      logTest('Embaralhamento manual removido', 'FAIL', 'Ainda contém propriedades de embaralhamento manual');
    }
    
    return shuffledQuestions > 0 && !hasManualShuffling;
    
  } catch (error) {
    logTest('Teste de embaralhamento', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function testCompleteLessonShuffling() {
  logSection('Testando Embaralhamento em Aula Completa');
  
  const testTopic = 'Fotossíntese nas Plantas';
  
  try {
    log(`🎯 Testando geração de aula completa com embaralhamento para: ${testTopic}`, 'blue');
    
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
    
    logTest('Aula completa gerada', 'PASS', `${data.slides.length} slides gerados`);
    
    // Encontrar slides de quiz
    const quizSlides = data.slides.filter(slide => slide.type === 'quiz');
    
    if (quizSlides.length === 0) {
      logTest('Slides de quiz', 'FAIL', 'Nenhum slide de quiz encontrado');
      return false;
    }
    
    logTest('Slides de quiz', 'PASS', `${quizSlides.length} slide(s) de quiz encontrado(s)`);
    
    // Analisar embaralhamento em todos os quizzes
    let totalQuestions = 0;
    let shuffledQuestions = 0;
    let firstPositionCorrect = 0;
    let hasManualShuffling = false;
    
    quizSlides.forEach((quizSlide, slideIndex) => {
      log(`📊 Analisando quiz ${slideIndex + 1}: "${quizSlide.title}"`, 'blue');
      
      if (quizSlide.questions && quizSlide.questions.length > 0) {
        quizSlide.questions.forEach((question, qIndex) => {
          totalQuestions++;
          
          if (question.options && question.options.length === 4 && question.correct !== undefined) {
            const correctIndex = question.correct;
            const isShuffled = correctIndex !== 0;
            
            if (isShuffled) {
              shuffledQuestions++;
            } else {
              firstPositionCorrect++;
            }
            
            // Verificar embaralhamento manual
            if (question.hasOwnProperty('originalCorrect')) {
              hasManualShuffling = true;
            }
            
            log(`   Questão ${qIndex + 1}: Resposta correta na posição ${correctIndex + 1}`, isShuffled ? 'green' : 'yellow');
          }
        });
      }
    });
    
    // Validações finais
    const shufflePercentage = totalQuestions > 0 ? Math.round((shuffledQuestions / totalQuestions) * 100) : 0;
    
    if (shuffledQuestions > 0) {
      logTest('Embaralhamento em aula completa', 'PASS', `${shuffledQuestions}/${totalQuestions} questões embaralhadas (${shufflePercentage}%)`);
    } else {
      logTest('Embaralhamento em aula completa', 'FAIL', 'Nenhuma questão embaralhada');
    }
    
    if (firstPositionCorrect === 0) {
      logTest('Resposta sempre na primeira posição', 'PASS', 'Nenhuma resposta na primeira posição');
    } else {
      logTest('Resposta sempre na primeira posição', 'WARN', `${firstPositionCorrect} questão(ões) com resposta na primeira posição`);
    }
    
    if (!hasManualShuffling) {
      logTest('Embaralhamento manual removido', 'PASS', 'Nenhuma propriedade originalCorrect encontrada');
    } else {
      logTest('Embaralhamento manual removido', 'FAIL', 'Ainda contém propriedades de embaralhamento manual');
    }
    
    return shuffledQuestions > 0 && !hasManualShuffling;
    
  } catch (error) {
    logTest('Teste de aula completa', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function runShufflingTests() {
  logSection('INICIANDO TESTES DE EMBARALHAMENTO DE QUESTÕES - GEMINI');
  
  const startTime = Date.now();
  
  // Run tests
  const tests = [
    { name: 'Embaralhamento em Quiz Individual', fn: testQuizShuffling },
    { name: 'Embaralhamento em Aula Completa', fn: testCompleteLessonShuffling }
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
  logSection('RESUMO DOS TESTES DE EMBARALHAMENTO');
  
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
    log('\n🎉 TODOS OS TESTES PASSARAM! Embaralhamento funcionando!', 'green');
    log('✅ Gemini agora embaralha as questões automaticamente!', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima para detalhes.', 'yellow');
  }
  
  console.log('='.repeat(60));
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runShufflingTests().catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

export {
  testQuizShuffling,
  testCompleteLessonShuffling,
  runShufflingTests
};
