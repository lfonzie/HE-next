// Standardized types for lesson generation APIs
export interface StandardLessonResponse {
  success: boolean;
  lesson: LessonData;
  metadata: LessonMetadata;
  validation: ValidationResult;
  usage?: UsageInfo;
  error?: string;
  details?: string;
}

export interface LessonData {
  id: string;
  title: string;
  subject: string;
  level: string;
  estimatedDuration: number;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  objective: string;
  introduction?: string;
  stages: LessonStage[];
  slides?: SlideData[];
  steps?: InteractiveStep[];
  feedback?: any;
  metadata: {
    subject: string;
    grade: string;
    duration: string;
    difficulty: string;
    tags: string[];
  };
}

export interface LessonStage {
  etapa: string;
  type: string;
  activity;
  route: string;
  estimatedTime: number;
}

export interface SlideData {
  number: number;
  title: string;
  content: string;
  type: 'content' | 'quiz' | 'closing';
  imageQuery?: string;
  imageUrl?: string;
  tokenEstimate?: number;
  questions?: QuestionData[];
}

export interface InteractiveStep {
  type: 'explanation' | 'question';
  card1: CardData;
  card2: CardData;
}

export interface CardData {
  title: string;
  content: string;
  imageUrl?: string;
  options?: string[];
  correctOption?: number;
  helpMessage?: string;
  correctAnswer?: string;
}

export interface QuestionData {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LessonMetadata {
  duration: {
    sync: number;
    async: number;
  };
  content: {
    totalTokens: number;
    totalWords: number;
    averageTokensPerSlide: number;
  };
  quality: {
    score: number;
    validSlides: number;
    totalSlides: number;
  };
  images: {
    count: number;
    estimatedSizeMB: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  recommendations?: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
  }>;
}

export interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costEstimate: string;
}

// Error response type
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
  timestamp?: string;
}

// Helper function to create standardized responses
export function createSuccessResponse(lesson: LessonData, metadata: LessonMetadata, validation: ValidationResult, usage?: UsageInfo): StandardLessonResponse {
  return {
    success: true,
    lesson,
    metadata,
    validation,
    usage
  };
}

export function createErrorResponse(error: string, details?: string): ErrorResponse {
  return {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  };
}
