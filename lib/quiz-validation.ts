// lib/quiz-validation.ts - Validação e correção de questões de quiz

export interface QuizQuestion {
  q?: string;
  question?: string;
  options: string[] | Record<string, string>;
  correct: number | string;
  explanation?: string;
}

export interface ValidatedQuizQuestion {
  q: string;
  options: string[];
  correct: string; // Sempre 'A', 'B', 'C', ou 'D'
  explanation: string;
  isValid: boolean;
  errors: string[];
}

export function validateAndFixQuizQuestion(question: QuizQuestion): ValidatedQuizQuestion {
  console.log('🔍 DEBUG validateAndFixQuizQuestion - Input question:', question);
  
  const errors: string[] = [];
  let fixedQuestion: ValidatedQuizQuestion = {
    q: '',
    options: [],
    correct: 'A',
    explanation: '',
    isValid: false,
    errors: []
  };

  // 1. Validar e corrigir pergunta
  const questionText = question.q || question.question || '';
  if (!questionText || questionText.trim().length === 0) {
    errors.push('Pergunta está em branco');
    fixedQuestion.q = 'Pergunta não disponível - erro na geração';
  } else if (questionText.trim().length < 10) {
    errors.push('Pergunta muito curta');
    fixedQuestion.q = questionText.trim();
  } else {
    fixedQuestion.q = questionText.trim();
  }

  // 2. Validar e corrigir opções
  let options: string[] = [];
  
  if (Array.isArray(question.options)) {
    // Formato: ["A) Opção A", "B) Opção B", ...]
    options = question.options.map(opt => {
      if (typeof opt === 'string') {
        // Remover prefixos A), B), C), D) se existirem
        return opt.replace(/^[A-D]\)\s*/, '').trim();
      }
      return String(opt).trim();
    });
  } else if (typeof question.options === 'object' && question.options !== null) {
    // Formato: { "a": "Opção A", "b": "Opção B", ... }
    const optionKeys = Object.keys(question.options).sort();
    options = optionKeys.map(key => String(question.options[key]).trim());
  }

  // Garantir que temos exatamente 4 opções
  if (options.length < 4) {
    errors.push(`Apenas ${options.length} opções encontradas, necessário 4`);
    // Adicionar opções padrão se necessário
    while (options.length < 4) {
      options.push(`Opção ${String.fromCharCode(65 + options.length)}`);
    }
  } else if (options.length > 4) {
    errors.push(`${options.length} opções encontradas, limitando a 4`);
    options = options.slice(0, 4);
  }

  // Garantir que todas as opções tenham conteúdo
  options = options.map((opt, index) => {
    if (!opt || opt.trim().length === 0) {
      errors.push(`Opção ${String.fromCharCode(65 + index)} está vazia`);
      return `Opção ${String.fromCharCode(65 + index)}`;
    }
    return opt.trim();
  });

  fixedQuestion.options = options;

  // 3. Validar e corrigir resposta correta
  let correctAnswer = question.correct;
  
  if (typeof correctAnswer === 'number') {
    // Converter índice numérico para letra
    if (correctAnswer >= 0 && correctAnswer < 4) {
      fixedQuestion.correct = String.fromCharCode(65 + correctAnswer); // A, B, C, D
    } else {
      errors.push(`Índice de resposta inválido: ${correctAnswer}`);
      fixedQuestion.correct = 'A';
    }
  } else if (typeof correctAnswer === 'string') {
    const normalizedAnswer = correctAnswer.toLowerCase().trim();
    if (['a', 'b', 'c', 'd'].includes(normalizedAnswer)) {
      fixedQuestion.correct = normalizedAnswer.toUpperCase();
    } else if (['0', '1', '2', '3'].includes(normalizedAnswer)) {
      fixedQuestion.correct = String.fromCharCode(65 + parseInt(normalizedAnswer));
    } else {
      errors.push(`Resposta correta inválida: ${correctAnswer}`);
      fixedQuestion.correct = 'A';
    }
  } else {
    errors.push('Resposta correta não especificada');
    fixedQuestion.correct = 'A';
  }

  // 4. Validar explicação
  const explanation = question.explanation || '';
  if (!explanation || explanation.trim().length === 0) {
    errors.push('Explicação está em branco');
    fixedQuestion.explanation = 'Explicação não disponível';
  } else if (explanation.trim().length < 20) {
    errors.push('Explicação muito curta');
    fixedQuestion.explanation = explanation.trim();
  } else {
    fixedQuestion.explanation = explanation.trim();
  }

  // 5. Determinar se a questão é válida
  fixedQuestion.isValid = errors.length === 0;
  fixedQuestion.errors = errors;

  return fixedQuestion;
}

export function validateQuizQuestions(questions: QuizQuestion[]): ValidatedQuizQuestion[] {
  return questions.map((question, index) => {
    const validated = validateAndFixQuizQuestion(question);
    
    if (!validated.isValid) {
      console.warn(`⚠️ Questão ${index + 1} tem problemas:`, validated.errors);
    }
    
    return validated;
  });
}

export function generateFallbackQuizQuestion(topic: string): ValidatedQuizQuestion {
  return {
    q: `Qual é a característica principal relacionada a ${topic}?`,
    options: [
      'Característica fundamental',
      'Aplicação prática',
      'Exemplo específico',
      'Definição técnica'
    ],
    correct: 'A',
    explanation: `A característica principal de ${topic} é fundamental para compreender o conceito básico. As outras opções são importantes, mas não representam a característica principal.`,
    isValid: true,
    errors: []
  };
}

export function ensureQuizFormat(questions: any[]): ValidatedQuizQuestion[] {
  console.log('🔍 DEBUG ensureQuizFormat - Input questions:', questions);
  
  if (!Array.isArray(questions) || questions.length === 0) {
    console.warn('⚠️ Nenhuma questão encontrada, gerando questão de fallback');
    return [generateFallbackQuizQuestion('o tópico')];
  }

  const validatedQuestions = validateQuizQuestions(questions);
  console.log('🔍 DEBUG ensureQuizFormat - Validated questions:', validatedQuestions);
  
  // Se todas as questões são inválidas, gerar uma questão de fallback
  if (validatedQuestions.every(q => !q.isValid)) {
    console.warn('⚠️ Todas as questões são inválidas, gerando questão de fallback');
    return [generateFallbackQuizQuestion('o tópico')];
  }

  // Randomizar as alternativas de cada questão válida
  const randomizedQuestions = validatedQuestions.map(question => {
    if (!question.isValid) return question;
    
    return randomizeQuizQuestion(question);
  });

  console.log('🔍 DEBUG ensureQuizFormat - Final randomized questions:', randomizedQuestions);
  return randomizedQuestions;
}

/**
 * Randomizes the order of quiz question options while maintaining the correct answer
 * @param question - The original quiz question
 * @returns A new question with randomized options and updated correct answer index
 */
function randomizeQuizQuestion(question: ValidatedQuizQuestion): ValidatedQuizQuestion {
  console.log('🔍 DEBUG randomizeQuizQuestion - Input question:', question);
  
  // Create a copy of the options array
  const options = [...question.options];
  
  // Find the original correct answer index
  let originalCorrectIndex: number;
  if (typeof question.correct === 'string') {
    const normalizedCorrect = question.correct.toLowerCase();
    if (normalizedCorrect === 'a') originalCorrectIndex = 0;
    else if (normalizedCorrect === 'b') originalCorrectIndex = 1;
    else if (normalizedCorrect === 'c') originalCorrectIndex = 2;
    else if (normalizedCorrect === 'd') originalCorrectIndex = 3;
    else originalCorrectIndex = normalizedCorrect.charCodeAt(0) - 97;
  } else {
    originalCorrectIndex = parseInt(question.correct.toString());
  }
  
  console.log('🔍 DEBUG randomizeQuizQuestion - Original correct index:', originalCorrectIndex);
  
  // Store the correct answer text
  const correctAnswerText = options[originalCorrectIndex];
  
  // Create array of indices and shuffle them
  const indices = [0, 1, 2, 3];
  const shuffledIndices = shuffleArray(indices);
  
  // Create new options array with shuffled order
  const shuffledOptions = shuffledIndices.map(index => options[index]);
  
  // Find the new index of the correct answer
  const newCorrectIndex = shuffledOptions.findIndex(option => option === correctAnswerText);
  
  const result = {
    ...question,
    options: shuffledOptions,
    correct: String.fromCharCode(65 + newCorrectIndex), // Convert back to letter (A, B, C, D)
    isValid: true,
    errors: []
  };
  
  console.log('🔍 DEBUG randomizeQuizQuestion - Result:', result);
  return result;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  console.log('🔍 DEBUG shuffleArray - Input array:', array);
  
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  console.log('🔍 DEBUG shuffleArray - Output array:', shuffled);
  return shuffled;
}
