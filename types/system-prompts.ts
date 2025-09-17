// types/system-prompts.ts
export type SystemPromptRole = 'system' | 'user' | 'assistant';

export interface SystemPromptMessage {
  role: SystemPromptRole;
  content: string;
}

export interface SystemPromptConfig {
  key: string;
  scope: 'production' | 'development' | 'testing';
  model: string;
  json: {
    type: string;
    role: SystemPromptRole;
    content: string;
    [key: string]: any;
  };
  description: string;
  version?: number;
  status?: 'active' | 'inactive' | 'deprecated';
  createdBy?: string;
}

export interface ModuleClassificationResult {
  module: string;
  confidence: number;
  rationale: string;
  needsImages?: boolean;
}

export interface VisualClassificationResult {
  shouldShowImages: boolean;
  confidence: number;
  reason: string;
  suggestedQuery?: string;
}

export interface TroubleshootingStep {
  type: 'check' | 'action' | 'verify';
  title: string;
  content: string;
  instructions: string[];
  expectedResult?: string;
  nextSteps?: string[];
  isCritical?: boolean;
}

export interface TroubleshootingResponse {
  success: boolean;
  steps: TroubleshootingStep[];
  metadata: {
    problemType: string;
    estimatedTime: string;
    difficulty: string;
    prerequisites: string[];
  };
  error?: string;
}

export interface InteractiveStep {
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content: string;
  question?: string;
  expectedAnswer?: string;
  helpMessage?: string;
  correctAnswer?: string;
  nextQuestion?: string;
  options?: string[];
  correctOption?: number;
  questionPool?: Array<{
    question: string;
    options: string[];
    correctOption: number;
    helpMessage: string;
    correctAnswer: string;
  }>;
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

export interface ENEMEssayEvaluation {
  comp1: number;
  comp2: number;
  comp3: number;
  comp4: number;
  comp5: number;
  summaryNote?: string;
  suggestions?: Array<{
    focus: string;
    tip: string;
    example_fix?: string;
  }>;
  issues?: string[];
  improvements?: string[];
}

export interface LessonCard {
  type: 'reading' | 'math' | 'quiz' | 'flashcards' | 'video' | 'code' | 'whiteboard' | 'assignment';
  title?: string;
  html?: string;
  latex?: string;
  question?: string;
  choices?: string[];
  correctIndex?: number;
  explanation?: string;
  items?: Array<{ front: string; back: string }>;
  provider?: string;
  src?: string;
  language?: string;
  starterCode?: string;
  tests?: string[];
  prompt?: string;
  rubric?: string;
}

export interface LessonDoc {
  id: string;
  title: string;
  subject: string;
  level: string;
  objective: string;
  outline: string[];
  cards: LessonCard[];
  htmlSnapshot?: string;
  userId?: string;
}
