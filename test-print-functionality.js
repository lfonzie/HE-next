/**
 * Teste da funcionalidade de impressão melhorada
 * Este arquivo pode ser executado no console do navegador para testar a função de impressão
 */

// Dados de teste para a função de impressão
const testLessonData = {
  title: "Causas da Primeira Guerra Mundial",
  objectives: [
    "Compreender os conceitos fundamentais sobre Causas da Primeira Guerra Mundial",
    "Aplicar conhecimentos através de atividades práticas",
    "Desenvolver pensamento crítico sobre o tema",
    "Conectar o aprendizado com situações do cotidiano"
  ],
  introduction: "Esta aula aborda o tema 'Causas da Primeira Guerra Mundial' de forma didática e interativa.",
  stages: [
    {
      etapa: "Introdução Histórica",
      type: "Teórica",
      activity: {
        content: "A Primeira Guerra Mundial foi um conflito global que durou de 1914 a 1918.",
        imageUrl: "https://via.placeholder.com/400x200/667eea/ffffff?text=Primeira+Guerra+Mundial"
      },
      route: "/stage/1"
    },
    {
      etapa: "Causas Principais",
      type: "Interativa",
      activity: {
        content: "As principais causas incluem imperialismo, nacionalismo, alianças militares e o assassinato do arquiduque Franz Ferdinand.",
        questions: [
          {
            q: "Qual foi o evento que desencadeou a Primeira Guerra Mundial?",
            options: [
              "A Revolução Russa",
              "O assassinato do arquiduque Franz Ferdinand",
              "A queda do Império Otomano",
              "A independência da Irlanda"
            ],
            correct: 1,
            explanation: "O assassinato do arquiduque Franz Ferdinand em Sarajevo foi o evento que desencadeou a guerra."
          }
        ]
      },
      route: "/stage/2"
    },
    {
      etapa: "Consequências",
      type: "Reflexão",
      activity: {
        content: "A guerra resultou em milhões de mortes e mudanças significativas no mapa político mundial."
      },
      route: "/stage/3"
    }
  ],
  summary: "A Primeira Guerra Mundial foi causada por uma combinação de fatores políticos, econômicos e sociais que criaram tensões insustentáveis entre as potências europeias.",
  nextSteps: [
    "Estudar as consequências da guerra",
    "Analisar o Tratado de Versalhes",
    "Compreender o período entre guerras"
  ],
  metadata: {
    subject: "História",
    grade: "Ensino Médio",
    duration: "45 minutos",
    difficulty: "Intermediário",
    tags: ["História", "Primeira Guerra Mundial", "Conflitos"]
  }
};

// Função para testar a impressão
function testPrintFunction() {
  console.log('🧪 Iniciando teste da função de impressão...');
  
  try {
    // Simular a importação da função (em um ambiente real, seria importada)
    console.log('📊 Dados de teste:', testLessonData);
    
    // Verificar se a função existe
    if (typeof printLessonImproved === 'function') {
      console.log('✅ Função printLessonImproved encontrada');
      printLessonImproved(testLessonData);
      console.log('🎉 Teste executado com sucesso!');
    } else {
      console.error('❌ Função printLessonImproved não encontrada');
      console.log('💡 Certifique-se de que o arquivo print-lesson-improved.ts foi carregado');
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Função para testar validação de dados
function testDataValidation() {
  console.log('🧪 Testando validação de dados...');
  
  // Teste com dados válidos
  console.log('✅ Teste com dados válidos:');
  testPrintFunction();
  
  // Teste com dados inválidos
  console.log('❌ Teste com dados inválidos:');
  const invalidData = {
    title: "",
    objectives: [],
    introduction: "",
    stages: null
  };
  
  try {
    if (typeof printLessonImproved === 'function') {
      printLessonImproved(invalidData);
    }
  } catch (error) {
    console.log('✅ Erro capturado corretamente:', error.message);
  }
}

// Instruções para usar o teste
console.log(`
🧪 TESTE DA FUNCIONALIDADE DE IMPRESSÃO
=====================================

Para testar a função de impressão:

1. Certifique-se de estar em uma página que carregou o arquivo print-lesson-improved.ts
2. Execute no console: testPrintFunction()
3. Ou execute: testDataValidation() para testar validação

Dados de teste disponíveis:
- Título: ${testLessonData.title}
- Objetivos: ${testLessonData.objectives.length} objetivos
- Etapas: ${testLessonData.stages.length} etapas
- Matéria: ${testLessonData.metadata.subject}

Comandos disponíveis:
- testPrintFunction() - Testa impressão com dados válidos
- testDataValidation() - Testa validação de dados
`);

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.testPrintFunction = testPrintFunction;
  window.testDataValidation = testDataValidation;
  window.testLessonData = testLessonData;
}
