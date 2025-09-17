// Teste para verificar se há problema específico com o estado do React
// Este arquivo testa cenários específicos que podem causar o problema do quiz

const testReactStateIssue = () => {
  console.log('🧪 Testando problemas específicos de estado do React...\n');

  // Simular o comportamento do QuizComponent
  let answers = [null]; // Estado inicial
  let currentQuestion = 0;
  let pendingAnswer = null;
  let selectedAnswer = null;

  const questions = [
    {
      q: "Qual das afirmativas a seguir melhor descreve o Modernismo?",
      options: [
        "A) O Modernismo é um movimento que busca preservar as tradições artísticas e literárias do passado.",
        "B) O Modernismo se caracteriza pela inovação e pela ruptura com as normas estabelecidas.",
        "C) O Modernismo surgiu exclusivamente na Europa, sem influências de outros continentes.",
        "D) O Modernismo é um movimento que se limita à pintura e não impacta a literatura."
      ],
      correct: 1,
      explanation: "A resposta correta é a opção B."
    }
  ];

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

  // Simular handleAnswerSelect
  const handleAnswerSelect = (answerIndex) => {
    console.log(`🔍 DEBUG: handleAnswerSelect chamado com ${answerIndex}`);
    pendingAnswer = answerIndex;
    console.log(`🔍 DEBUG: pendingAnswer definido como ${pendingAnswer}`);
  };

  // Simular confirmAnswer
  const confirmAnswer = () => {
    if (pendingAnswer === null) {
      console.log('🔍 DEBUG: confirmAnswer chamado mas pendingAnswer é null');
      return;
    }
    
    console.log('🔍 DEBUG: confirmAnswer chamado');
    console.log('🔍 DEBUG: pendingAnswer:', pendingAnswer);
    console.log('🔍 DEBUG: currentQuestion:', currentQuestion);
    
    selectedAnswer = pendingAnswer;
    const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1);
    answers[safeCurrentQuestion] = pendingAnswer;
    
    console.log('🔍 DEBUG: answers após confirmação:', answers);
    
    pendingAnswer = null;
    
    // Simular auto-advance
    if (safeCurrentQuestion < questions.length - 1) {
      currentQuestion = currentQuestion + 1;
      selectedAnswer = null;
    } else {
      console.log('🔍 DEBUG: Última pergunta respondida, chamando handleComplete');
      handleComplete();
    }
  };

  // Simular handleComplete
  const handleComplete = () => {
    console.log('🔍 DEBUG: handleComplete chamado');
    console.log('🔍 DEBUG: answers array:', answers);
    console.log('🔍 DEBUG: questions array:', questions);
    
    const correctAnswers = answers.filter((answer, index) => {
      const correctIndex = normalizeCorrectAnswer(questions[index].correct);
      console.log(`🔍 DEBUG Question ${index + 1}: User answer: ${answer}, Correct answer: ${questions[index].correct}, Normalized: ${correctIndex}, Match: ${answer === correctIndex}`);
      return answer === correctIndex;
    }).length;
    
    console.log(`🔍 DEBUG: Quiz completed: ${correctAnswers}/${questions.length} correct answers`);
    
    return correctAnswers;
  };

  // Teste 1: Simular fluxo normal
  console.log('📋 Teste 1: Fluxo normal do quiz');
  
  // Usuário seleciona B (índice 1)
  handleAnswerSelect(1);
  
  // Usuário confirma a resposta
  const result = confirmAnswer();
  
  console.log(`Resultado final: ${result}/1`);
  
  if (result === 0) {
    console.log('🚨 PROBLEMA: Score 0 mesmo com resposta correta!');
  } else {
    console.log('✅ Quiz funcionando corretamente');
  }

  // Teste 2: Verificar se há problema com valores null/undefined
  console.log('\n📋 Teste 2: Verificação de valores null/undefined');
  
  const testValues = [null, undefined, 0, 1, 2, 3];
  
  testValues.forEach(value => {
    const correctIndex = normalizeCorrectAnswer(1);
    const isCorrect = value === correctIndex;
    console.log(`Valor: ${value} (tipo: ${typeof value}), Correto: ${correctIndex}, Match: ${isCorrect}`);
  });

  // Teste 3: Verificar se há problema com comparação estrita
  console.log('\n📋 Teste 3: Verificação de comparação estrita');
  
  const comparisons = [
    { a: 1, b: 1, strict: 1 === 1, loose: 1 == 1 },
    { a: '1', b: 1, strict: '1' === 1, loose: '1' == 1 },
    { a: null, b: 1, strict: null === 1, loose: null == 1 },
    { a: undefined, b: 1, strict: undefined === 1, loose: undefined == 1 }
  ];
  
  comparisons.forEach(comp => {
    console.log(`${comp.a} === ${comp.b}: ${comp.strict}, ${comp.a} == ${comp.b}: ${comp.loose}`);
  });

  // Teste 4: Verificar se há problema com array de respostas
  console.log('\n📋 Teste 4: Verificação do array de respostas');
  
  const testAnswers = [
    [null],
    [undefined],
    [1],
    [0, 1, 2, 3],
    []
  ];
  
  testAnswers.forEach((answerArray, index) => {
    console.log(`\nArray ${index + 1}: ${JSON.stringify(answerArray)}`);
    
    const correctAnswers = answerArray.filter((answer, index) => {
      const correctIndex = normalizeCorrectAnswer(1);
      const isCorrect = answer === correctIndex;
      console.log(`  Resposta ${index}: ${answer} === ${correctIndex} = ${isCorrect}`);
      return isCorrect;
    }).length;
    
    console.log(`  Resultado: ${correctAnswers}/${answerArray.length}`);
  });

  console.log('\n🏁 Teste de problemas de estado concluído!');
};

// Executar o teste se este arquivo for chamado diretamente
if (typeof window === 'undefined') {
  testReactStateIssue();
}

module.exports = { testReactStateIssue };
