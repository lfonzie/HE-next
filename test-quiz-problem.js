// Teste específico para reproduzir o problema do quiz mostrado na imagem
// Este arquivo testa o cenário exato onde a resposta B está correta mas o score é 0/1

const testQuizProblem = () => {
  console.log('🧪 Testando problema específico do quiz...\n');

  // Dados exatos do quiz mostrado na imagem
  const mockQuizData = {
    question: "Qual das afirmativas a seguir melhor descreve o Modernismo?",
    options: [
      "A) O Modernismo é um movimento que busca preservar as tradições artísticas e literárias do passado.",
      "B) O Modernismo se caracteriza pela inovação e pela ruptura com as normas estabelecidas.",
      "C) O Modernismo surgiu exclusivamente na Europa, sem influências de outros continentes.",
      "D) O Modernismo é um movimento que se limita à pintura e não impacta a literatura."
    ],
    correctAnswer: 1, // B (índice 1)
    explanation: "A resposta correta é a opção B. O Modernismo é, de fato, um movimento que se caracteriza pela inovação e pela ruptura com as normas estabelecidas, desafiando as tradições anteriores em busca de novas formas de expressão."
  };

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

  // Simular diferentes cenários de resposta do usuário
  console.log('📋 Teste 1: Simulação do problema específico');
  
  const scenarios = [
    { userAnswer: 0, description: 'Usuário selecionou A (incorreto)' },
    { userAnswer: 1, description: 'Usuário selecionou B (correto)' },
    { userAnswer: 2, description: 'Usuário selecionou C (incorreto)' },
    { userAnswer: 3, description: 'Usuário selecionou D (incorreto)' },
    { userAnswer: null, description: 'Usuário não respondeu' }
  ];

  scenarios.forEach(scenario => {
    const correctIndex = normalizeCorrectAnswer(mockQuizData.correctAnswer);
    const isCorrect = scenario.userAnswer === correctIndex;
    
    console.log(`\n   ${scenario.description}:`);
    console.log(`   Resposta do usuário: ${scenario.userAnswer}`);
    console.log(`   Resposta correta: ${mockQuizData.correctAnswer} (normalizada: ${correctIndex})`);
    console.log(`   Está correto: ${isCorrect ? '✅' : '❌'}`);
    
    if (scenario.userAnswer === 1 && !isCorrect) {
      console.log(`   🚨 PROBLEMA: Usuário selecionou B mas não foi reconhecido como correto!`);
    }
  });

  // Teste 2: Verificar se há problema na estrutura dos dados
  console.log('\n📋 Teste 2: Verificação da estrutura dos dados');
  
  console.log('Estrutura da pergunta:');
  console.log(`Pergunta: ${mockQuizData.question}`);
  console.log(`Opções: ${mockQuizData.options.length}`);
  console.log(`Resposta correta: ${mockQuizData.correctAnswer} (tipo: ${typeof mockQuizData.correctAnswer})`);
  
  mockQuizData.options.forEach((option, index) => {
    console.log(`   ${index}: ${option}`);
  });

  // Teste 3: Simular o fluxo completo do QuizComponent
  console.log('\n📋 Teste 3: Simulação do fluxo completo');
  
  const simulateQuizFlow = (userAnswer) => {
    console.log(`\n   Simulando quiz com resposta do usuário: ${userAnswer}`);
    
    // Simular array de respostas (como no QuizComponent)
    const answers = [userAnswer]; // Array com uma resposta
    const questions = [mockQuizData]; // Array com uma pergunta
    
    // Simular handleComplete do QuizComponent
    const correctAnswers = answers.filter((answer, index) => {
      const correctIndex = normalizeCorrectAnswer(questions[index].correctAnswer);
      console.log(`     Question ${index + 1}: User answer: ${answer}, Correct answer: ${questions[index].correctAnswer}, Normalized: ${correctIndex}, Match: ${answer === correctIndex}`);
      return answer === correctIndex;
    }).length;
    
    console.log(`     Resultado: ${correctAnswers}/${questions.length} correto(s)`);
    
    if (userAnswer === 1 && correctAnswers === 0) {
      console.log(`     🚨 PROBLEMA IDENTIFICADO: Resposta B não foi reconhecida como correta!`);
    }
    
    return correctAnswers;
  };

  // Testar com resposta B (correta)
  const result = simulateQuizFlow(1);
  
  if (result === 0) {
    console.log('\n🚨 PROBLEMA CONFIRMADO: O quiz está retornando 0/1 mesmo com resposta correta!');
    
    // Investigar possíveis causas
    console.log('\n📋 Possíveis causas:');
    console.log('1. Problema na função normalizeCorrectAnswer()');
    console.log('2. Problema na estrutura dos dados (correctAnswer vs correct)');
    console.log('3. Problema na comparação de tipos (number vs string)');
    console.log('4. Problema no array de respostas (null vs undefined)');
    console.log('5. Problema na lógica de filtro');
  } else {
    console.log('\n✅ Quiz funcionando corretamente');
  }

  // Teste 4: Verificar se o problema está na estrutura dos dados da API
  console.log('\n📋 Teste 4: Verificação da estrutura da API');
  
  // Simular dados como vêm da API
  const apiData = {
    questions: [
      {
        q: mockQuizData.question,
        options: mockQuizData.options,
        correct: mockQuizData.correctAnswer, // Note: 'correct' não 'correctAnswer'
        explanation: mockQuizData.explanation
      }
    ]
  };
  
  console.log('Dados da API:');
  console.log(JSON.stringify(apiData, null, 2));
  
  // Testar com dados da API
  const apiResult = simulateQuizFlowWithApiData(1, apiData);
  
  if (apiResult === 0) {
    console.log('🚨 PROBLEMA: Dados da API também têm o problema!');
  } else {
    console.log('✅ Dados da API funcionam corretamente');
  }

  console.log('\n🏁 Teste do problema específico concluído!');
};

// Função auxiliar para testar com dados da API
const simulateQuizFlowWithApiData = (userAnswer, apiData) => {
  const answers = [userAnswer];
  const questions = apiData.questions;
  
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
  
  const correctAnswers = answers.filter((answer, index) => {
    const correctIndex = normalizeCorrectAnswer(questions[index].correct);
    return answer === correctIndex;
  }).length;
  
  return correctAnswers;
};

// Executar o teste se este arquivo for chamado diretamente
if (typeof window === 'undefined') {
  testQuizProblem();
}

module.exports = { testQuizProblem };
