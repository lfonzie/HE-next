// Teste para reproduzir e corrigir o problema do quiz
// Este arquivo testa a lógica de processamento de respostas

const testQuizLogic = () => {
  console.log('🧪 Testando lógica do quiz...\n');

  // Simular dados do quiz como mostrado na imagem
  const mockQuestions = [
    {
      q: "Qual das afirmativas a seguir melhor descreve o Modernismo?",
      options: [
        "A) O Modernismo é um movimento que busca preservar as tradições artísticas e literárias do passado.",
        "B) O Modernismo se caracteriza pela inovação e pela ruptura com as normas estabelecidas.",
        "C) O Modernismo surgiu exclusivamente na Europa, sem influências de outros continentes.",
        "D) O Modernismo é um movimento que se limita à pintura e não impacta a literatura."
      ],
      correct: 1, // Deveria ser B (índice 1)
      explanation: "A resposta correta é a opção B. O Modernismo é, de fato, um movimento que se caracteriza pela inovação e pela ruptura com as normas estabelecidas, desafiando as tradições anteriores em busca de novas formas de expressão."
    }
  ];

  // Função normalizeCorrectAnswer do QuizComponent
  const normalizeCorrectAnswer = (correct) => {
    if (typeof correct === 'string') {
      const normalizedCorrect = correct.toLowerCase();
      if (normalizedCorrect === 'a') return 0;
      if (normalizedCorrect === 'b') return 1;
      if (normalizedCorrect === 'c') return 2;
      if (normalizedCorrect === 'd') return 3;
      return normalizedCorrect.charCodeAt(0) - 97;
    }
    return correct;
  };

  // Teste 1: Verificar normalização de diferentes formatos
  console.log('📋 Teste 1: Normalização de respostas corretas');
  
  const testCases = [
    { input: 1, expected: 1, description: 'Número 1 (deveria ser B)' },
    { input: 'B', expected: 1, description: 'String B maiúscula' },
    { input: 'b', expected: 1, description: 'String b minúscula' },
    { input: 'A', expected: 0, description: 'String A maiúscula' },
    { input: 'C', expected: 2, description: 'String C maiúscula' },
    { input: 'D', expected: 3, description: 'String D maiúscula' }
  ];

  testCases.forEach(testCase => {
    const result = normalizeCorrectAnswer(testCase.input);
    const passed = result === testCase.expected;
    console.log(`${passed ? '✅' : '❌'} ${testCase.description}: ${testCase.input} → ${result} (esperado: ${testCase.expected})`);
  });

  // Teste 2: Simular cenário do problema
  console.log('\n📋 Teste 2: Simulação do problema do quiz');
  
  const userAnswer = 1; // Usuário selecionou B (índice 1)
  const correctAnswer = mockQuestions[0].correct; // 1 (B)
  const normalizedCorrect = normalizeCorrectAnswer(correctAnswer);
  
  console.log(`Usuário selecionou: ${userAnswer} (B)`);
  console.log(`Resposta correta: ${correctAnswer}`);
  console.log(`Normalizada: ${normalizedCorrect}`);
  console.log(`Match: ${userAnswer === normalizedCorrect}`);
  
  if (userAnswer === normalizedCorrect) {
    console.log('✅ CORRETO: A resposta deveria ser considerada correta');
  } else {
    console.log('❌ PROBLEMA: A resposta não está sendo reconhecida como correta');
  }

  // Teste 3: Verificar diferentes formatos de dados
  console.log('\n📋 Teste 3: Diferentes formatos de dados do quiz');
  
  const quizFormats = [
    { correct: 1, description: 'Número (índice)' },
    { correct: 'B', description: 'String maiúscula' },
    { correct: 'b', description: 'String minúscula' },
    { correct: '1', description: 'String numérica' }
  ];

  quizFormats.forEach(format => {
    const normalized = normalizeCorrectAnswer(format.correct);
    console.log(`${format.description}: ${format.correct} → ${normalized}`);
  });

  // Teste 4: Verificar se há problema na comparação
  console.log('\n📋 Teste 4: Verificação de comparação');
  
  const answers = [1]; // Usuário respondeu B (índice 1)
  const questions = mockQuestions;
  
  const correctAnswers = answers.filter((answer, index) => {
    const correctIndex = normalizeCorrectAnswer(questions[index].correct);
    console.log(`Question ${index + 1}: User answer: ${answer}, Correct answer: ${questions[index].correct}, Normalized: ${correctIndex}, Match: ${answer === correctIndex}`);
    return answer === correctIndex;
  }).length;
  
  console.log(`Total de respostas corretas: ${correctAnswers}/${questions.length}`);
  
  if (correctAnswers === 1) {
    console.log('✅ CORRETO: O quiz deveria mostrar 1/1 correto');
  } else {
    console.log('❌ PROBLEMA: O quiz está mostrando 0/1 incorreto');
  }

  // Teste 5: Verificar se o problema está na estrutura dos dados
  console.log('\n📋 Teste 5: Verificação da estrutura dos dados');
  
  console.log('Estrutura da pergunta:');
  console.log(JSON.stringify(mockQuestions[0], null, 2));
  
  // Verificar se o campo 'correct' está sendo passado corretamente
  const question = mockQuestions[0];
  console.log(`Campo 'correct': ${question.correct} (tipo: ${typeof question.correct})`);
  console.log(`Opções: ${question.options.length}`);
  console.log(`Opção B: ${question.options[1]}`);

  console.log('\n🏁 Teste de lógica do quiz concluído!');
};

// Executar o teste se este arquivo for chamado diretamente
if (typeof window === 'undefined') {
  testQuizLogic();
}

module.exports = { testQuizLogic };
