import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export interface ValidatedQuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

/**
 * Ensures quiz questions are in the correct format
 */
export function ensureQuizFormat(questions: any[]): ValidatedQuizQuestion[] {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.map((question, index) => {
    // Ensure all required fields exist
    const validatedQuestion: ValidatedQuizQuestion = {
      q: question.q || question.question || `Pergunta ${index + 1}`,
      options: Array.isArray(question.options) ? question.options : [
        'Opção A',
        'Opção B', 
        'Opção C',
        'Opção D'
      ],
      correct: typeof question.correct === 'number' && question.correct >= 0 && question.correct <= 3 
        ? question.correct 
        : 0,
      explanation: question.explanation || 'Explicação não disponível'
    };

    // Ensure options array has exactly 4 items
    if (validatedQuestion.options.length !== 4) {
      validatedQuestion.options = [
        'Opção A',
        'Opção B',
        'Opção C', 
        'Opção D'
      ];
    }

    return validatedQuestion;
  });
}

// Schema para validação de respostas do quiz
const QuizValidationSchema = z.object({
  allQuestionsAnswered: z.boolean().describe('Se todas as questões foram respondidas'),
  unansweredQuestions: z.array(z.number()).describe('Índices das questões não respondidas'),
  incompleteAnswers: z.array(z.object({
    questionIndex: z.number(),
    reason: z.string()
  })).describe('Questões com respostas incompletas ou inadequadas'),
  canProceed: z.boolean().describe('Se o usuário pode prosseguir para o próximo slide'),
  recommendations: z.array(z.string()).describe('Recomendações para melhorar as respostas')
});

export type QuizValidationResult = z.infer<typeof QuizValidationSchema>;

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'open-ended' | 'true-false';
  options?: string[];
  correctAnswer?: string | number;
  required?: boolean;
}

interface UserAnswer {
  questionId: string;
  answer: string | number;
  timestamp: number;
}

/**
 * Valida se todas as questões do quiz foram respondidas adequadamente usando AI SDK
 */
export async function validateQuizCompletion(
  questions: Question[],
  userAnswers: Record<string, UserAnswer>,
  context?: {
    subject?: string;
    difficulty?: string;
    timeLimit?: number;
  }
): Promise<QuizValidationResult> {
  try {
    // Preparar dados para análise
    const questionsData = questions.map((q, index) => ({
      index,
      id: q.id,
      question: q.question,
      type: q.type,
      required: q.required !== false, // Padrão é obrigatório
      hasAnswer: !!userAnswers[q.id],
      answer: userAnswers[q.id]?.answer || null,
      answerLength: userAnswers[q.id]?.answer?.toString().length || 0
    }));

    const prompt = `Analise as respostas do quiz educacional e determine se o usuário pode prosseguir.

CONTEXTO:
- Disciplina: ${context?.subject || 'Não especificada'}
- Dificuldade: ${context?.difficulty || 'Média'}
- Limite de tempo: ${context?.timeLimit ? `${context.timeLimit} minutos` : 'Não especificado'}

QUESTÕES E RESPOSTAS:
${questionsData.map(q => `
Questão ${q.index + 1} (${q.type}):
"${q.question}"
Obrigatória: ${q.required ? 'Sim' : 'Não'}
Resposta fornecida: ${q.hasAnswer ? `"${q.answer}"` : 'Não respondida'}
Tamanho da resposta: ${q.answerLength} caracteres
`).join('\n')}

CRITÉRIOS DE VALIDAÇÃO:
1. Todas as questões obrigatórias devem ter respostas
2. Respostas de múltipla escolha devem ser válidas (índice numérico)
3. Respostas abertas devem ter pelo menos 10 caracteres
4. Respostas verdadeiro/falso devem ser "true" ou "false"
5. Respostas muito curtas ou genéricas podem ser consideradas inadequadas

INSTRUÇÕES:
- Se alguma questão obrigatória não foi respondida, canProceed deve ser false
- Se respostas são muito curtas ou inadequadas, marque como incompleteAnswers
- Forneça recomendações específicas para melhorar as respostas
- Seja rigoroso mas justo na avaliação`;

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: QuizValidationSchema,
      prompt,
      temperature: 0.1, // Baixa temperatura para consistência
    });

    return result.object;
  } catch (error) {
    console.error('Erro na validação do quiz:', error);
    
    // Fallback: validação simples sem AI
    const unansweredQuestions: number[] = [];
    const incompleteAnswers: Array<{ questionIndex: number; reason: string }> = [];
    
    questions.forEach((question, index) => {
      const answer = userAnswers[question.id];
      
      if (!answer) {
        unansweredQuestions.push(index);
      } else if (question.type === 'open-ended' && answer.answer.toString().length < 10) {
        incompleteAnswers.push({
          questionIndex: index,
          reason: 'Resposta muito curta para questão aberta'
        });
      }
    });

    return {
      allQuestionsAnswered: unansweredQuestions.length === 0,
      unansweredQuestions,
      incompleteAnswers,
      canProceed: unansweredQuestions.length === 0 && incompleteAnswers.length === 0,
      recommendations: [
        'Responda todas as questões obrigatórias',
        'Forneça respostas mais detalhadas para questões abertas'
      ]
    };
  }
}

/**
 * Valida uma resposta específica usando AI SDK
 */
export async function validateSingleAnswer(
  question: Question,
  answer: string | number,
  context?: {
    subject?: string;
    expectedLength?: number;
  }
): Promise<{
  isValid: boolean;
  isComplete: boolean;
  feedback: string;
  suggestions: string[];
}> {
  try {
    const prompt = `Analise a resposta fornecida para a questão educacional:

QUESTÃO:
"${question.question}"
Tipo: ${question.type}
${question.options ? `Opções: ${question.options.join(', ')}` : ''}

RESPOSTA FORNECIDA:
"${answer}"

CONTEXTO:
- Disciplina: ${context?.subject || 'Não especificada'}
- Comprimento esperado: ${context?.expectedLength || 'Adequado ao tipo de questão'}

AVALIE:
1. Se a resposta é válida para o tipo de questão
2. Se a resposta está completa e adequada
3. Forneça feedback construtivo
4. Sugira melhorias se necessário

Responda em formato JSON:
{
  "isValid": boolean,
  "isComplete": boolean,
  "feedback": "string",
  "suggestions": ["string"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um tutor educacional especializado em avaliação de respostas. Seja construtivo e específico.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Limpar possível formatação markdown
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Erro na validação da resposta:', error);
    
    // Fallback: validação simples
    const isValid = question.type === 'open-ended' ? 
      answer.toString().length >= 5 : 
      answer !== null && answer !== undefined;
    
    return {
      isValid,
      isComplete: answer.toString().length >= 10,
      feedback: isValid ? 'Resposta válida' : 'Resposta inválida ou muito curta',
      suggestions: isValid ? [] : ['Forneça uma resposta mais detalhada']
    };
  }
}

/**
 * Hook para usar a validação de quiz em componentes React
 */
export function useQuizValidation() {
  const validateQuiz = async (
    questions: Question[],
    userAnswers: Record<string, UserAnswer>,
    context?: {
      subject?: string;
      difficulty?: string;
      timeLimit?: number;
    }
  ) => {
    return await validateQuizCompletion(questions, userAnswers, context);
  };

  const validateAnswer = async (
    question: Question,
    answer: string | number,
    context?: {
      subject?: string;
      expectedLength?: number;
    }
  ) => {
    return await validateSingleAnswer(question, answer, context);
  };

  return {
    validateQuiz,
    validateAnswer
  };
}