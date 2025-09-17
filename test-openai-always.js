// test-openai-always.js
// Script para testar a integração OpenAI sempre ativa

const testCases = [
  {
    message: "Preciso de ajuda com matemática",
    expectedModule: "PROFESSOR",
    description: "Dúvida acadêmica básica"
  },
  {
    message: "Quero uma aula expandida sobre fotossíntese",
    expectedModule: "AULA_EXPANDIDA", 
    description: "Solicitação de aula completa"
  },
  {
    message: "Simulado ENEM com explicações detalhadas",
    expectedModule: "ENEM_INTERATIVO",
    description: "Simulado interativo"
  },
  {
    message: "Problema no computador da sala",
    expectedModule: "TI",
    description: "Suporte técnico"
  },
  {
    message: "Informações sobre mensalidade",
    expectedModule: "FINANCEIRO",
    description: "Questão financeira"
  },
  {
    message: "Benefícios para funcionários",
    expectedModule: "RH",
    description: "Recursos humanos"
  },
  {
    message: "Criar post para Instagram",
    expectedModule: "SOCIAL_MEDIA",
    description: "Marketing digital"
  },
  {
    message: "Documentos de matrícula",
    expectedModule: "SECRETARIA",
    description: "Documentação escolar"
  },
  {
    message: "Ansiedade antes da prova",
    expectedModule: "BEM_ESTAR",
    description: "Suporte emocional"
  },
  {
    message: "Planejamento pedagógico",
    expectedModule: "COORDENACAO",
    description: "Gestão pedagógica"
  },
  {
    message: "Olá, como posso ajudar?",
    expectedModule: "ATENDIMENTO",
    description: "Chat geral"
  }
];

async function testClassification(message) {
  try {
    const response = await fetch('http://localhost:3000/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userMessage: message }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testando Integração OpenAI Sempre Ativa\n');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Teste ${i + 1}/${totalTests}: ${testCase.description}`);
    console.log(`Mensagem: "${testCase.message}"`);
    console.log(`Módulo esperado: ${testCase.expectedModule}`);
    
    const result = await testClassification(testCase.message);
    
    if (result && result.success) {
      const classification = result.classification;
      const actualModule = classification.module;
      const confidence = Math.round(classification.confidence * 100);
      
      console.log(`Módulo classificado: ${actualModule}`);
      console.log(`Confiança: ${confidence}%`);
      console.log(`Rationale: ${classification.rationale}`);
      
      if (actualModule === testCase.expectedModule) {
        console.log('✅ PASSOU - Classificação correta!');
        passedTests++;
      } else {
        console.log('❌ FALHOU - Módulo incorreto');
      }
    } else {
      console.log('❌ FALHOU - Erro na classificação');
    }
    
    // Aguardar mais tempo entre testes para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 RESULTADOS FINAIS:`);
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Integração OpenAI funcionando perfeitamente.');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('👍 Integração funcionando bem, com algumas melhorias necessárias.');
  } else {
    console.log('⚠️ Integração precisa de ajustes significativos.');
  }
}

// Executar testes se o script for chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests().catch(console.error);
} else {
  // Browser environment
  console.log('Execute este script no terminal com: node test-openai-always.js');
}

module.exports = { testCases, testClassification, runTests };
