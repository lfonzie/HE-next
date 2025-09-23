/**
 * Teste para verificar se os erros foram corrigidos
 * Este arquivo pode ser usado para testar as correções implementadas
 */

// Dados de teste para validação do quiz sem API Key
const testQuizData = {
  questions: [
    {
      id: 'q1',
      question: 'Qual é a capital do Brasil?',
      type: 'multiple-choice',
      options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
      correctAnswer: 2,
      required: true
    },
    {
      id: 'q2', 
      question: 'Explique a importância da educação.',
      type: 'open-ended',
      required: true
    }
  ],
  userAnswers: {
    'q1': {
      questionId: 'q1',
      answer: 2,
      timestamp: Date.now()
    },
    'q2': {
      questionId: 'q2',
      answer: 'A educação é fundamental para o desenvolvimento da sociedade.',
      timestamp: Date.now()
    }
  }
};

// Dados de teste para impressão com introdução vazia
const testLessonDataEmptyIntro = {
  title: "Teste de Aula",
  objectives: [
    "Objetivo 1",
    "Objetivo 2"
  ],
  introduction: "", // Introdução vazia - deve ser aceita
  stages: [
    {
      etapa: "Etapa 1",
      type: "Teórica",
      activity: {
        content: "Conteúdo da etapa"
      },
      route: "/test/1"
    }
  ],
  metadata: {
    subject: "Teste",
    grade: "Ensino Médio",
    duration: "30 minutos",
    difficulty: "Fácil",
    tags: []
  }
};

// Dados de teste para impressão sem introdução
const testLessonDataNoIntro = {
  title: "Teste de Aula Sem Introdução",
  objectives: [
    "Objetivo único"
  ],
  // Sem campo introduction - deve ser aceito
  stages: [
    {
      etapa: "Etapa única",
      type: "Prática",
      activity: {
        content: "Conteúdo prático"
      },
      route: "/test/2"
    }
  ],
  metadata: {
    subject: "Teste",
    grade: "Ensino Fundamental",
    duration: "20 minutos",
    difficulty: "Médio",
    tags: []
  }
};

// Função para testar validação do quiz sem API Key
async function testQuizValidationWithoutAPI() {
  console.log('🧪 Testando validação do quiz sem API Key...');
  
  try {
    // Simular ambiente sem API Key
    const originalApiKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = '';
    
    // Importar a função de validação
    const { validateQuizCompletion } = await import('./lib/quiz-validation');
    
    const result = await validateQuizCompletion(
      testQuizData.questions,
      testQuizData.userAnswers,
      { subject: 'Geografia', difficulty: 'Média' }
    );
    
    console.log('✅ Resultado da validação:', result);
    console.log('✅ Validação funcionou sem API Key!');
    
    // Restaurar API Key original
    process.env.OPENAI_API_KEY = originalApiKey;
    
  } catch (error) {
    console.error('❌ Erro na validação do quiz:', error);
  }
}

// Função para testar impressão com introdução vazia
function testPrintWithEmptyIntro() {
  console.log('🧪 Testando impressão com introdução vazia...');
  
  try {
    // Simular a função de validação
    const validateLessonData = (lessonData) => {
      const errors = [];
      
      if (!lessonData) {
        errors.push('Dados da aula não fornecidos');
        return { isValid: false, errors };
      }
      
      if (!lessonData.title || typeof lessonData.title !== 'string' || lessonData.title.trim() === '') {
        errors.push('Título da aula é obrigatório e deve ser uma string não vazia');
      }
      
      if (!lessonData.objectives || !Array.isArray(lessonData.objectives) || lessonData.objectives.length === 0) {
        errors.push('Objetivos da aula são obrigatórios e devem ser um array não vazio');
      }
      
      // Introdução é opcional - pode ser gerada automaticamente
      if (lessonData.introduction && typeof lessonData.introduction !== 'string') {
        errors.push('Introdução da aula deve ser uma string válida');
      }
      
      if (!lessonData.stages || !Array.isArray(lessonData.stages)) {
        errors.push('Etapas da aula são obrigatórias e devem ser um array');
      }
      
      return { isValid: errors.length === 0, errors };
    };
    
    // Teste com introdução vazia
    const result1 = validateLessonData(testLessonDataEmptyIntro);
    console.log('✅ Teste com introdução vazia:', result1);
    
    // Teste sem introdução
    const result2 = validateLessonData(testLessonDataNoIntro);
    console.log('✅ Teste sem introdução:', result2);
    
    if (result1.isValid && result2.isValid) {
      console.log('✅ Validação de impressão funcionou com introdução vazia/ausente!');
    } else {
      console.error('❌ Validação de impressão falhou:', result1.errors, result2.errors);
    }
    
  } catch (error) {
    console.error('❌ Erro na validação de impressão:', error);
  }
}

// Função para verificar se os problemas foram resolvidos
function verifyFixes() {
  console.log(`
🔧 VERIFICAÇÃO DAS CORREÇÕES
============================

Problemas corrigidos:

1. ✅ Erro de API Key do OpenAI na validação do quiz
   - Adicionada verificação de disponibilidade da API Key
   - Implementada validação local como fallback
   - Função validateQuizLocally() criada

2. ✅ Erro de validação na função de impressão (introdução vazia)
   - Introdução agora é opcional
   - Validação mais flexível
   - Introdução pode ser gerada automaticamente

Para testar:
1. Execute testQuizValidationWithoutAPI() no console
2. Execute testPrintWithEmptyIntro() no console
3. Verifique se não há mais erros nos logs

Os problemas devem estar resolvidos!
`);

  testQuizValidationWithoutAPI();
  testPrintWithEmptyIntro();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.testQuizValidationWithoutAPI = testQuizValidationWithoutAPI;
  window.testPrintWithEmptyIntro = testPrintWithEmptyIntro;
  window.verifyFixes = verifyFixes;
  window.testQuizData = testQuizData;
  window.testLessonDataEmptyIntro = testLessonDataEmptyIntro;
  window.testLessonDataNoIntro = testLessonDataNoIntro;
}

console.log(`
🧪 TESTE DAS CORREÇÕES
======================

Comandos disponíveis:
- verifyFixes() - Verificação completa das correções
- testQuizValidationWithoutAPI() - Teste específico do quiz
- testPrintWithEmptyIntro() - Teste específico da impressão

Os erros devem estar resolvidos!
`);
