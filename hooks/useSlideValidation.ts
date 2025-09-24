import { useCallback, useState } from 'react';

export interface SlideValidationState {
  isQuestionSlide: boolean;
  hasAnsweredAllQuestions: boolean;
  canAdvance: boolean;
  validationMessage: string;
  unansweredQuestions: number[];
}

export interface SlideValidationOptions {
  currentSlide: any;
  userAnswers: Record<string, any>;
  questions: any[];
  requireAllQuestionsAnswered?: boolean;
}

/**
 * Hook para validar se o usuário pode avançar para o próximo slide
 * Implementa a regra: não permitir avançar slide sem completar todas as perguntas
 */
export function useSlideValidation() {
  const [validationState, setValidationState] = useState<SlideValidationState>({
    isQuestionSlide: false,
    hasAnsweredAllQuestions: false,
    canAdvance: false,
    validationMessage: '',
    unansweredQuestions: []
  });

  /**
   * Valida se o slide atual tem perguntas e se todas foram respondidas
   */
  const validateSlide = useCallback((options: SlideValidationOptions): SlideValidationState => {
    const { currentSlide, userAnswers, questions, requireAllQuestionsAnswered = true } = options;
    
    // Verificar se é um slide de pergunta
    const isQuestionSlide = currentSlide?.type === 'question' || 
                           currentSlide?.activity?.questions?.length > 0 ||
                           questions?.length > 0;

    if (!isQuestionSlide) {
      // Se não é slide de pergunta, pode avançar livremente
      return {
        isQuestionSlide: false,
        hasAnsweredAllQuestions: true,
        canAdvance: true,
        validationMessage: '',
        unansweredQuestions: []
      };
    }

    // Obter perguntas do slide atual
    const slideQuestions = currentSlide?.activity?.questions || questions || [];
    
    if (slideQuestions.length === 0) {
      return {
        isQuestionSlide: false,
        hasAnsweredAllQuestions: true,
        canAdvance: true,
        validationMessage: '',
        unansweredQuestions: []
      };
    }

    // Verificar quais perguntas não foram respondidas
    const unansweredQuestions: number[] = [];
    
    slideQuestions.forEach((question: any, index: number) => {
      const questionId = question.id || `question_${index}`;
      const answer = userAnswers[questionId];
      
      if (!answer || answer === null || answer === undefined) {
        unansweredQuestions.push(index);
      } else if (typeof answer === 'string' && answer.trim() === '') {
        unansweredQuestions.push(index);
      }
    });

    const hasAnsweredAllQuestions = unansweredQuestions.length === 0;
    const canAdvance = requireAllQuestionsAnswered ? hasAnsweredAllQuestions : true;
    
    let validationMessage = '';
    if (!canAdvance && unansweredQuestions.length > 0) {
      if (unansweredQuestions.length === 1) {
        validationMessage = `Você precisa responder a pergunta ${unansweredQuestions[0] + 1} antes de avançar.`;
      } else {
        validationMessage = `Você precisa responder ${unansweredQuestions.length} perguntas antes de avançar: ${unansweredQuestions.map(q => q + 1).join(', ')}.`;
      }
    }

    const newState: SlideValidationState = {
      isQuestionSlide: true,
      hasAnsweredAllQuestions,
      canAdvance,
      validationMessage,
      unansweredQuestions
    };

    setValidationState(newState);
    return newState;
  }, []);

  /**
   * Verifica se pode avançar para o próximo slide
   */
  const canAdvanceToNext = useCallback((options: SlideValidationOptions): boolean => {
    const validation = validateSlide(options);
    return validation.canAdvance;
  }, [validateSlide]);

  /**
   * Obtém mensagem de validação para exibir ao usuário
   */
  const getValidationMessage = useCallback((options: SlideValidationOptions): string => {
    const validation = validateSlide(options);
    return validation.validationMessage;
  }, [validateSlide]);

  /**
   * Reseta o estado de validação
   */
  const resetValidation = useCallback(() => {
    setValidationState({
      isQuestionSlide: false,
      hasAnsweredAllQuestions: false,
      canAdvance: false,
      validationMessage: '',
      unansweredQuestions: []
    });
  }, []);

  return {
    validationState,
    validateSlide,
    canAdvanceToNext,
    getValidationMessage,
    resetValidation
  };
}
