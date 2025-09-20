// test-gemini-markdown-linebreaks.js
// Script de teste para validar quebras de linha em markdown no Gemini

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

async function testMarkdownLineBreaks() {
  logSection('Testando Quebras de Linha em Markdown no Gemini');
  
  const testTopic = 'Fotossíntese nas Plantas';
  
  try {
    log(`🎯 Testando geração de slide com quebras de linha markdown para: ${testTopic}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/api/aulas/initial-slides-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: testTopic
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
    
    logTest('Conexão com API', 'PASS', 'API respondendo corretamente');
    logTest('Slides gerados', 'PASS', `${data.slides.length} slides gerados`);
    
    // Verificar quebras de linha em markdown
    let markdownLineBreaksFound = false;
    let doubleLineBreaksFound = false;
    
    data.slides.forEach((slide, index) => {
      if (slide.content) {
        // Verificar se tem quebras de linha simples (\n)
        if (slide.content.includes('\n')) {
          markdownLineBreaksFound = true;
          log(`📝 Slide ${index + 1}: Contém quebras de linha simples (\\n)`, 'green');
        }
        
        // Verificar se tem quebras de linha duplas (\n\n)
        if (slide.content.includes('\n\n')) {
          doubleLineBreaksFound = true;
          log(`📝 Slide ${index + 1}: Contém quebras de linha duplas (\\n\\n)`, 'green');
        }
        
        // Mostrar exemplo do conteúdo
        const contentPreview = slide.content.substring(0, 200) + '...';
        log(`📄 Conteúdo do slide ${index + 1}:`, 'blue');
        log(`   "${contentPreview}"`, 'yellow');
        
        // Contar quebras de linha
        const singleBreaks = (slide.content.match(/\n/g) || []).length;
        const doubleBreaks = (slide.content.match(/\n\n/g) || []).length;
        log(`   Quebras simples: ${singleBreaks}, Quebras duplas: ${doubleBreaks}`, 'blue');
      }
    });
    
    // Validações
    if (markdownLineBreaksFound) {
      logTest('Quebras de linha simples (\\n)', 'PASS', 'Encontradas quebras de linha em markdown');
    } else {
      logTest('Quebras de linha simples (\\n)', 'FAIL', 'Nenhuma quebra de linha simples encontrada');
    }
    
    if (doubleLineBreaksFound) {
      logTest('Quebras de linha duplas (\\n\\n)', 'PASS', 'Encontradas quebras de linha duplas para parágrafos');
    } else {
      logTest('Quebras de linha duplas (\\n\\n)', 'WARN', 'Nenhuma quebra de linha dupla encontrada (pode ser normal)');
    }
    
    // Verificar se não tem quebras antigas (\\n\\n)
    let oldFormatFound = false;
    data.slides.forEach((slide, index) => {
      if (slide.content && slide.content.includes('\\n\\n')) {
        oldFormatFound = true;
        log(`⚠️ Slide ${index + 1}: Contém formato antigo (\\\\n\\\\n)`, 'yellow');
      }
    });
    
    if (!oldFormatFound) {
      logTest('Formato antigo removido', 'PASS', 'Nenhum formato antigo (\\\\n\\\\n) encontrado');
    } else {
      logTest('Formato antigo removido', 'FAIL', 'Ainda contém formato antigo (\\\\n\\\\n)');
    }
    
    return markdownLineBreaksFound && !oldFormatFound;
    
  } catch (error) {
    logTest('Teste de quebras de linha', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function testCompleteLessonMarkdown() {
  logSection('Testando Aula Completa com Quebras de Linha Markdown');
  
  const testTopic = 'Equações do Segundo Grau';
  
  try {
    log(`🎯 Testando geração de aula completa com markdown para: ${testTopic}`, 'blue');
    
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
    
    // Analisar quebras de linha em todos os slides
    let slidesWithMarkdown = 0;
    let slidesWithOldFormat = 0;
    
    data.slides.forEach((slide, index) => {
      if (slide.content) {
        const hasMarkdownBreaks = slide.content.includes('\n');
        const hasOldFormat = slide.content.includes('\\n\\n');
        
        if (hasMarkdownBreaks) {
          slidesWithMarkdown++;
        }
        
        if (hasOldFormat) {
          slidesWithOldFormat++;
          log(`⚠️ Slide ${index + 1}: Contém formato antigo`, 'yellow');
        }
        
        // Mostrar estatísticas do slide
        const singleBreaks = (slide.content.match(/\n/g) || []).length;
        const doubleBreaks = (slide.content.match(/\n\n/g) || []).length;
        
        if (index < 3) { // Mostrar apenas os primeiros 3 slides
          log(`📄 Slide ${index + 1} (${slide.title}):`, 'blue');
          log(`   Quebras simples: ${singleBreaks}, Quebras duplas: ${doubleBreaks}`, 'yellow');
        }
      }
    });
    
    // Validações finais
    const markdownPercentage = Math.round((slidesWithMarkdown / data.slides.length) * 100);
    
    if (markdownPercentage >= 80) {
      logTest('Cobertura de markdown', 'PASS', `${markdownPercentage}% dos slides têm quebras de linha markdown`);
    } else {
      logTest('Cobertura de markdown', 'WARN', `Apenas ${markdownPercentage}% dos slides têm quebras de linha markdown`);
    }
    
    if (slidesWithOldFormat === 0) {
      logTest('Formato antigo eliminado', 'PASS', 'Nenhum slide com formato antigo');
    } else {
      logTest('Formato antigo eliminado', 'FAIL', `${slidesWithOldFormat} slides ainda têm formato antigo`);
    }
    
    return slidesWithMarkdown > 0 && slidesWithOldFormat === 0;
    
  } catch (error) {
    logTest('Teste de aula completa', 'FAIL', `Erro: ${error.message}`);
    return false;
  }
}

async function runMarkdownTests() {
  logSection('INICIANDO TESTES DE QUEBRAS DE LINHA MARKDOWN - GEMINI');
  
  const startTime = Date.now();
  
  // Run tests
  const tests = [
    { name: 'Quebras de Linha em Slides Individuais', fn: testMarkdownLineBreaks },
    { name: 'Quebras de Linha em Aula Completa', fn: testCompleteLessonMarkdown }
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
  logSection('RESUMO DOS TESTES DE MARKDOWN');
  
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
    log('\n🎉 TODOS OS TESTES PASSARAM! Quebras de linha markdown funcionando!', 'green');
    log('✅ Gemini agora usa \\n para quebras de linha em markdown!', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima para detalhes.', 'yellow');
  }
  
  console.log('='.repeat(60));
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMarkdownTests().catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

export {
  testMarkdownLineBreaks,
  testCompleteLessonMarkdown,
  runMarkdownTests
};
