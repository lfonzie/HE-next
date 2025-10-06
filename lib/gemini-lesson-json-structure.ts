// lib/gemini-lesson-json-structure.ts
// Estrutura JSON completa para o sistema de geração de imagens com Google Gemini

export interface GeminiImageGenerationConfig {
  betaSystem: {
    enabled: boolean;
    model: string;
    imageSlides: number[];
    maxRetries: number;
    timeout: number;
    apiKey?: string;
  };
  prompts: {
    language: 'english';
    translationEnabled: boolean;
    optimizationEnabled: boolean;
  };
  fallback: {
    enabled: boolean;
    placeholderImages: {
      [slideNumber: number]: string;
    };
  };
}

export interface LessonImageSlide {
  slideNumber: number;
  title: string;
  content: string;
  type: 'introduction' | 'explanation' | 'quiz' | 'closing' | 'summary';
  imageGeneration: {
    prompt: string;
    englishPrompt: string;
    generatedBy: 'gemini' | 'fallback' | 'none';
    imageUrl?: string;
    imageData?: string;
    imageMimeType?: string;
    generationTime?: number;
    error?: string;
  };
  metadata: {
    timeEstimate: number;
    tokenEstimate: number;
    hasImage: boolean;
  };
}

export interface LessonImageResponse {
  success: boolean;
  lesson: {
    id: string;
    title: string;
    topic: string;
    subject: string;
    grade: number;
    objectives: string[];
    introduction: string;
    slides: LessonImageSlide[];
    summary: string;
    nextSteps: string[];
  };
  betaStatus: {
    enabled: boolean;
    model: string;
    totalGenerated: number;
    totalFailed: number;
    generationTime: number;
  };
  metadata: {
    topic: string;
    subject?: string;
    grade?: string;
    totalSlides: number;
    slidesWithImages: number;
    timestamp: string;
    version: string;
  };
}

export interface BetaSystemStatus {
  enabled: boolean;
  model: string;
  imageSlides: number[];
  maxRetries: number;
  timeout: number;
  lastUpdated: string;
  stats: {
    totalRequests: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageGenerationTime: number;
  };
}

// Configuração padrão do sistema
export const DEFAULT_GEMINI_CONFIG: GeminiImageGenerationConfig = {
  betaSystem: {
    enabled: true,
    model: 'gemini-2.0-flash-exp',
    imageSlides: [1, 3, 6, 8, 11, 14],
    maxRetries: 3,
    timeout: 30000,
    apiKey: process.env.GOOGLE_GEMINI_API_KEY
  },
  prompts: {
    language: 'english',
    translationEnabled: true,
    optimizationEnabled: true
  },
  fallback: {
    enabled: true,
    placeholderImages: {
      1: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&crop=center',
      3: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center',
      6: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
      8: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
      11: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
      14: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center'
    }
  }
};

// Estrutura JSON para resposta da API
export const createLessonImageResponse = (
  lesson: any,
  betaStatus: any,
  metadata: any
): LessonImageResponse => {
  return {
    success: true,
    lesson: {
      id: lesson.id || `lesson-${Date.now()}`,
      title: lesson.title,
      topic: lesson.topic,
      subject: lesson.subject,
      grade: lesson.grade,
      objectives: lesson.objectives,
      introduction: lesson.introduction,
      slides: lesson.slides.map((slide: any) => ({
        slideNumber: slide.slideNumber,
        title: slide.title,
        content: slide.content,
        type: slide.type,
        imageGeneration: {
          prompt: slide.imagePrompt || '',
          englishPrompt: slide.englishPrompt || '',
          generatedBy: slide.generatedBy || 'none',
          imageUrl: slide.imageUrl,
          imageData: slide.imageData,
          imageMimeType: slide.imageMimeType,
          generationTime: slide.generationTime,
          error: slide.error
        },
        metadata: {
          timeEstimate: slide.timeEstimate || 5,
          tokenEstimate: slide.tokenEstimate || 0,
          hasImage: !!slide.imageUrl
        }
      })),
      summary: lesson.summary,
      nextSteps: lesson.nextSteps
    },
    betaStatus: {
      enabled: betaStatus.enabled,
      model: betaStatus.model,
      totalGenerated: betaStatus.totalGenerated,
      totalFailed: betaStatus.totalFailed,
      generationTime: betaStatus.generationTime || 0
    },
    metadata: {
      topic: metadata.topic,
      subject: metadata.subject,
      grade: metadata.grade,
      totalSlides: metadata.totalSlides,
      slidesWithImages: metadata.slidesWithImages,
      timestamp: metadata.timestamp,
      version: '1.0.0'
    }
  };
};

// Estrutura JSON para status do sistema beta
export const createBetaSystemStatus = (
  config: GeminiImageGenerationConfig,
  stats: any = {}
): BetaSystemStatus => {
  return {
    enabled: config.betaSystem.enabled,
    model: config.betaSystem.model,
    imageSlides: config.betaSystem.imageSlides,
    maxRetries: config.betaSystem.maxRetries,
    timeout: config.betaSystem.timeout,
    lastUpdated: new Date().toISOString(),
    stats: {
      totalRequests: stats.totalRequests || 0,
      successfulGenerations: stats.successfulGenerations || 0,
      failedGenerations: stats.failedGenerations || 0,
      averageGenerationTime: stats.averageGenerationTime || 0
    }
  };
};

// Validação da estrutura JSON
export const validateLessonImageResponse = (response: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!response) {
    errors.push('Response is required');
    return { isValid: false, errors };
  }

  if (!response.success && typeof response.success !== 'boolean') {
    errors.push('Success field is required and must be boolean');
  }

  if (!response.lesson) {
    errors.push('Lesson object is required');
  } else {
    if (!response.lesson.id || typeof response.lesson.id !== 'string') {
      errors.push('Lesson ID is required and must be string');
    }
    if (!response.lesson.title || typeof response.lesson.title !== 'string') {
      errors.push('Lesson title is required and must be string');
    }
    if (!response.lesson.slides || !Array.isArray(response.lesson.slides)) {
      errors.push('Lesson slides is required and must be array');
    }
  }

  if (!response.betaStatus) {
    errors.push('Beta status is required');
  } else {
    if (typeof response.betaStatus.enabled !== 'boolean') {
      errors.push('Beta status enabled must be boolean');
    }
    if (!response.betaStatus.model || typeof response.betaStatus.model !== 'string') {
      errors.push('Beta status model is required and must be string');
    }
  }

  if (!response.metadata) {
    errors.push('Metadata is required');
  } else {
    if (!response.metadata.timestamp || typeof response.metadata.timestamp !== 'string') {
      errors.push('Metadata timestamp is required and must be string');
    }
  }

  return { isValid: errors.length === 0, errors };
};

// Utilitários para manipulação JSON
export const extractImageSlides = (lesson: any): LessonImageSlide[] => {
  return lesson.slides.filter((slide: any) => slide.imageGeneration?.hasImage);
};

export const calculateImageStats = (lesson: any): {
  totalSlides: number;
  slidesWithImages: number;
  geminiGenerated: number;
  fallbackUsed: number;
  noImages: number;
} => {
  const slides = lesson.slides || [];
  const totalSlides = slides.length;
  const slidesWithImages = slides.filter((s: any) => s.imageGeneration?.imageUrl).length;
  const geminiGenerated = slides.filter((s: any) => s.imageGeneration?.generatedBy === 'gemini').length;
  const fallbackUsed = slides.filter((s: any) => s.imageGeneration?.generatedBy === 'fallback').length;
  const noImages = slides.filter((s: any) => s.imageGeneration?.generatedBy === 'none').length;

  return {
    totalSlides,
    slidesWithImages,
    geminiGenerated,
    fallbackUsed,
    noImages
  };
};

export const formatLessonForExport = (lesson: any): any => {
  return {
    ...lesson,
    exportMetadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      system: 'Gemini Image Generation Beta',
      imageStats: calculateImageStats(lesson)
    }
  };
};
