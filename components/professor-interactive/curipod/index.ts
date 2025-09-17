// Componentes da metodologia Curipod aprimorada
export { default as HookComponent } from './HookComponent';
export { default as InteractiveCheckpoint } from './InteractiveCheckpoint';
export { default as AuthenticTask } from './AuthenticTask';
export { default as ExitTicket } from './ExitTicket';
export { default as CuripodLessonModule } from './CuripodLessonModule';
export { default as InstructionSlides } from './InstructionSlides';

// Tipos e interfaces
export interface CuripodLesson {
  title: string;
  subject: string;
  introduction: string;
  themeImage: string;
  timing: {
    hook: string;
    instruction: string;
    task: string;
    exit: string;
  };
  steps: Array<{
    type: 'hook' | 'explanation' | 'checkpoint' | 'task';
    card1: {
      title: string;
      content: string;
    };
    card2: {
      title: string;
      content: string;
      imageUrl?: string;
      options?: string[];
      correctOption?: number;
      helpMessage?: string;
      correctAnswer?: string;
    };
  }>;
  finalTest: {
    questions: Array<{
      question: string;
      options: string[];
      correctOption: number;
      explanation: string;
    }>;
  };
  summary: string;
  nextSteps: string[];
}

export interface HookData {
  title: string;
  content: string;
  type: 'question' | 'scenario' | 'image' | 'video';
  duration: number;
  engagementLevel: 'high' | 'medium' | 'low';
}

export interface CheckpointData {
  title: string;
  content: string;
  question: string;
  options: string[];
  correctOption: number;
  helpMessage?: string;
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

export interface AuthenticTaskData {
  title: string;
  content: string;
  scenario: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  realWorldConnection: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

export interface ExitTicketQuestion {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export type LessonPhase = 'hook' | 'instruction' | 'instruction-checkpoint' | 'task' | 'exit' | 'completed';

export interface LessonResults {
  hookCompleted: boolean;
  checkpointsPassed: number;
  taskCompleted: boolean;
  exitScore: number;
  totalTime: number;
}
