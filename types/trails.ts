export interface Trail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: number; // in minutes
  prerequisites: string[];
  learningObjectives: string[];
  modules: TrailModule[];
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    version: string;
    tags: string[];
    language: string;
    targetAudience: string[];
  };
  progress?: TrailProgress;
  isRecommended?: boolean;
  recommendationScore?: number;
}

export interface TrailModule {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'exercise' | 'project' | 'assessment';
  duration: number; // in minutes
  content: TrailContent;
  prerequisites: string[];
  learningOutcomes: string[];
  order: number;
  isOptional: boolean;
  metadata: Record<string, any>;
}

export interface TrailContent {
  slides?: TrailSlide[];
  questions?: TrailQuestion[];
  exercises?: TrailExercise[];
  resources?: TrailResource[];
  assessments?: TrailAssessment[];
}

export interface TrailSlide {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'interactive' | 'audio';
  order: number;
  duration: number;
  metadata: Record<string, any>;
}

export interface TrailQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay' | 'code';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: number;
  points: number;
  metadata: Record<string, any>;
}

export interface TrailExercise {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'writing' | 'design' | 'analysis' | 'simulation';
  instructions: string;
  expectedOutput?: string;
  hints: string[];
  solution?: string;
  points: number;
  metadata: Record<string, any>;
}

export interface TrailResource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'tool';
  url: string;
  description: string;
  isRequired: boolean;
  metadata: Record<string, any>;
}

export interface TrailAssessment {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'project' | 'presentation' | 'peer-review';
  questions: TrailQuestion[];
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  metadata: Record<string, any>;
}

export interface TrailProgress {
  trailId: string;
  userId: string;
  currentModule: string;
  completedModules: string[];
  overallProgress: number; // percentage
  timeSpent: number; // in minutes
  lastAccessed: string;
  startedAt: string;
  completedAt?: string;
  moduleProgress: Record<string, ModuleProgress>;
  achievements: string[];
  notes: TrailNote[];
  bookmarks: string[];
}

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  progress: number; // percentage
  timeSpent: number;
  lastAccessed: string;
  startedAt: string;
  completedAt?: string;
  attempts: number;
  score?: number;
  feedback?: string;
}

export interface TrailNote {
  id: string;
  moduleId: string;
  content: string;
  timestamp: string;
  isPrivate: boolean;
  tags: string[];
}

export interface TrailRecommendation {
  trail: Trail;
  score: number;
  reasons: string[];
  personalizedFor: string;
  generatedAt: string;
}

export interface TrailAnalytics {
  trailId: string;
  totalEnrollments: number;
  completionRate: number;
  averageTimeToComplete: number;
  averageScore: number;
  difficultyRating: number;
  userFeedback: TrailFeedback[];
  popularModules: string[];
  dropOffPoints: Array<{
    moduleId: string;
    dropOffRate: number;
  }>;
}

export interface TrailFeedback {
  userId: string;
  rating: number;
  comment: string;
  timestamp: string;
  helpful: boolean;
  categories: string[];
}
