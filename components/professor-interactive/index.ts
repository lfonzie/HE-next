// Professor Interactive Module - Main Exports

// Main Components
export { default as EnhancedLessonModule } from './lesson/EnhancedLessonModule';
export { default as ProfessorInteractiveContent } from './chat/ProfessorInteractiveContent';
export { default as ProfessorInteractiveContentFixed } from './chat/ProfessorInteractiveContent-fixed';

// Lesson Components
export { default as LessonHeader } from './lesson/LessonHeader';
export { default as LessonProgress } from './lesson/LessonProgress';
export { default as LessonLoadingScreen } from './lesson/LessonLoadingScreen';
export { default as LessonStats } from './lesson/LessonStats';
export { default as LessonNavigation } from './lesson/LessonNavigation';

// Quiz Components
export { default as QuestionCard } from './quiz/QuestionCard';
export { default as EnhancedQuestionCard } from './quiz/EnhancedQuestionCard';

// Chat Components
export { default as MessageRenderer } from './chat/MessageRenderer';

// Hooks
export { useLessonState } from './hooks/useLessonState';
export { useLessonLoading } from './hooks/useLessonLoading';
export { useLessonGeneration } from './hooks/useLessonGeneration';

// Services
export { lessonGenerationService } from './services/lessonGenerationService';

// Types
export interface InteractiveStep {
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content: string;
  question?: string;
  expectedAnswer?: string;
  helpMessage?: string;
  correctAnswer?: string;
  options?: string[];
  correctOption?: number;
}

export interface InteractiveLesson {
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

export interface LessonState {
  currentStep: number;
  userAnswers: { [key: number]: string | number | undefined; final?: number };
  showHelp: { [key: number]: boolean; final?: boolean };
  completed: boolean;
  score: number;
  showNavigationButtons: { [key: number]: boolean };
  currentQuestionIndex: { [key: number]: number };
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  startTime: number;
  showStats: boolean;
  achievements: string[];
  questionTimer: { [key: number]: number };
  currentQuestionStartTime: number;
}
