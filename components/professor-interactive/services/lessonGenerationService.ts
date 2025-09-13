import { detectSubject } from '@/utils/professor-interactive/subjectDetection';

interface InteractiveStep {
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content: string;
  question?: string;
  expectedAnswer?: string;
  helpMessage?: string;
  correctAnswer?: string;
  options?: string[];
  correctOption?: number;
}

interface InteractiveLesson {
  title: string;
  subject: string;
  introduction: string;
  steps: InteractiveStep[];
  finalTest: {
    question: string;
    expectedAnswer: string;
    helpMessage: string;
    correctAnswer: string;
    options?: string[];
    correctOption?: number;
  };
  summary: string;
  nextSteps: string[];
}

export class LessonGenerationService {
  private static instance: LessonGenerationService;
  
  private constructor() {}
  
  public static getInstance(): LessonGenerationService {
    if (!LessonGenerationService.instance) {
      LessonGenerationService.instance = new LessonGenerationService();
    }
    return LessonGenerationService.instance;
  }

  async generateLesson(query: string, subject?: string): Promise<InteractiveLesson> {
    try {
      // Detect subject if not provided
      const detectedSubject = subject || await detectSubject(query);
      
      const response = await fetch('/api/module-professor-interactive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query,
          subject: detectedSubject
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.lesson) {
        return data.lesson;
      } else {
        throw new Error('Resposta da API inválida');
      }
    } catch (error) {
      console.error('Erro ao gerar aula:', error);
      // Fallback to mock lesson
      return this.generateMockLesson(query, subject);
    }
  }

  generateMockLesson(query: string, subject: string = 'Geral'): InteractiveLesson {
    return {
      title: `Aula Interativa: ${query}`,
      subject: subject,
      introduction: `Vamos explorar o tema "${query}" de forma interativa e envolvente!`,
      steps: [
        {
          type: 'explanation',
          content: `Este é o primeiro passo para entender "${query}". Aqui você aprenderá os conceitos fundamentais.`,
          question: `Qual é o conceito principal relacionado a "${query}"?`,
          expectedAnswer: 'Conceito fundamental',
          helpMessage: 'Pense nos elementos básicos que compõem este tema.',
          correctAnswer: 'O conceito principal é...',
          options: ['Conceito fundamental', 'Aplicação prática', 'Exemplo específico', 'Definição técnica'],
          correctOption: 0
        },
        {
          type: 'question',
          content: `Agora vamos praticar com "${query}". Este exercício ajudará você a consolidar o conhecimento.`,
          question: `Como você aplicaria "${query}" em uma situação prática?`,
          expectedAnswer: 'Aplicação prática',
          helpMessage: 'Considere como este conceito pode ser usado no mundo real.',
          correctAnswer: 'A aplicação prática seria...',
          options: ['Aplicação prática', 'Teoria abstrata', 'Exemplo histórico', 'Definição formal'],
          correctOption: 0
        },
        {
          type: 'example',
          content: `Vamos ver um exemplo prático de "${query}" para consolidar o aprendizado.`,
          question: `Qual característica deste exemplo é mais importante?`,
          expectedAnswer: 'Característica principal',
          helpMessage: 'Identifique o aspecto mais relevante do exemplo.',
          correctAnswer: 'A característica principal é...',
          options: ['Característica principal', 'Detalhe secundário', 'Contexto histórico', 'Aplicação futura'],
          correctOption: 0
        }
      ],
      finalTest: {
        question: `Qual é a importância de "${query}"?`,
        expectedAnswer: 'Importância fundamental',
        helpMessage: 'Pense nos benefícios e impactos deste conceito.',
        correctAnswer: 'A importância é fundamental porque...',
        options: ['Importância fundamental', 'Relevância secundária', 'Aplicação limitada', 'Uso específico'],
        correctOption: 0
      },
      summary: `Você completou a aula interativa sobre "${query}"! Parabéns pelo progresso.`,
      nextSteps: [
        'Continue praticando com exercícios similares',
        'Explore tópicos relacionados',
        'Aplique o conhecimento em projetos práticos'
      ]
    };
  }

  async validateLesson(lesson: InteractiveLesson): Promise<boolean> {
    try {
      // Basic validation
      if (!lesson.title || !lesson.subject || !lesson.introduction) {
        return false;
      }
      
      if (!lesson.steps || lesson.steps.length === 0) {
        return false;
      }
      
      if (!lesson.finalTest || !lesson.finalTest.question) {
        return false;
      }
      
      // Validate steps
      for (const step of lesson.steps) {
        if (!step.type || !step.content) {
          return false;
        }
        
        if (step.type === 'question' && (!step.question || !step.options)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro na validação da aula:', error);
      return false;
    }
  }

  async optimizeLesson(lesson: InteractiveLesson): Promise<InteractiveLesson> {
    try {
      // Remove duplicate steps
      const uniqueSteps = this.removeDuplicateSteps(lesson.steps);
      
      // Ensure proper step sequence
      const optimizedSteps = this.optimizeStepSequence(uniqueSteps);
      
      return {
        ...lesson,
        steps: optimizedSteps
      };
    } catch (error) {
      console.error('Erro na otimização da aula:', error);
      return lesson;
    }
  }

  private removeDuplicateSteps(steps: InteractiveStep[]): InteractiveStep[] {
    const seen = new Set<string>();
    return steps.filter(step => {
      const key = `${step.type}-${step.content.substring(0, 50)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private optimizeStepSequence(steps: InteractiveStep[]): InteractiveStep[] {
    // Ensure we have at least one explanation step
    const hasExplanation = steps.some(step => step.type === 'explanation');
    if (!hasExplanation && steps.length > 0) {
      steps[0].type = 'explanation';
    }
    
    // Ensure we have at least one question step
    const hasQuestion = steps.some(step => step.type === 'question');
    if (!hasQuestion && steps.length > 1) {
      steps[1].type = 'question';
    }
    
    return steps;
  }
}

// Export singleton instance
export const lessonGenerationService = LessonGenerationService.getInstance();
