/**
 * Utility functions to transform lesson data between different formats
 */

export interface SlideData {
  slideNumber?: number;
  type?: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  imagePrompt?: string;
  timeEstimate?: number;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  questions?: any[];
  prompt?: string;
  points?: number;
  time?: number;
  quizResults?: any;
  keyConcepts?: string[];
  nextSteps?: string[];
}

export interface StageData {
  etapa: string;
  type: string;
  activity: {
    component: string;
    content?: string;
    prompt?: string;
    questions?: any[];
    media?: string[];
    animationSteps?: any[];
    prompts?: string[];
    time?: number;
    points?: number;
    feedback?: string;
    realTime?: boolean;
    imageUrl?: string;
  };
  route: string;
}

/**
 * Transform slide data to stage data format
 */
export function transformSlidesToStages(slides: SlideData[], lessonId: string): StageData[] {
  return slides.map((slide, index) => {
    // Determine component type based on slide data
    let component = 'ContentComponent';
    if (slide.type === 'quiz' || (slide.questions && slide.questions.length > 0)) {
      component = 'QuizComponent';
    } else if (slide.type === 'summary') {
      component = 'QuizSummarySlide';
    } else if (slide.type === 'drawing') {
      component = 'DrawingPrompt';
    } else if (slide.type === 'animation') {
      component = 'AnimationSlide';
    } else if (slide.type === 'discussion') {
      component = 'DiscussionBoard';
    } else if (slide.type === 'open_question') {
      component = 'OpenQuestion';
    } else if (slide.type === 'upload') {
      component = 'UploadTask';
    }

    return {
      etapa: slide.title || `Slide ${index + 1}`,
      type: slide.type || 'content',
      activity: {
        component: component,
        content: slide.content || '',
        prompt: slide.prompt || slide.question || '',
        questions: slide.questions || [],
        media: [],
        animationSteps: [],
        prompts: [],
        time: slide.time || slide.timeEstimate || 5,
        points: slide.points || 0,
        feedback: '',
        realTime: false,
        imageUrl: slide.imageUrl || null,
        quizResults: slide.quizResults || null,
        keyConcepts: slide.keyConcepts || [],
        nextSteps: slide.nextSteps || []
      },
      route: `/aulas/${lessonId}/${index}`
    };
  });
}

/**
 * Transform card data to stage data format (for database cards)
 */
export function transformCardsToStages(cards: any[], lessonId: string): StageData[] {
  return cards.map((card, index) => {
    // Determine component type based on card data
    let component = 'ContentComponent';
    if (card.type === 'quiz' || (card.questions && card.questions.length > 0)) {
      component = 'QuizComponent';
    } else if (card.type === 'drawing') {
      component = 'DrawingPrompt';
    } else if (card.type === 'animation') {
      component = 'AnimationSlide';
    } else if (card.type === 'discussion') {
      component = 'DiscussionBoard';
    } else if (card.type === 'open_question') {
      component = 'OpenQuestion';
    } else if (card.type === 'upload') {
      component = 'UploadTask';
    }

    return {
      etapa: card.title || `Slide ${index + 1}`,
      type: card.type || 'content',
      activity: {
        component: component,
        content: card.content || '',
        prompt: card.prompt || '',
        questions: card.questions || [],
        media: card.media || [],
        animationSteps: card.animationSteps || [],
        prompts: card.prompts || [],
        time: card.time || 5,
        points: card.points || 0,
        feedback: card.feedback || '',
        realTime: card.realTime || false,
        imageUrl: card.imageUrl || null
      },
      route: `/aulas/${lessonId}/${index}`
    };
  });
}

/**
 * Ensure lesson data has proper structure
 */
export function ensureLessonStructure(lessonData: any): any {
  if (!lessonData) {
    console.log('[DEBUG] No lesson data provided');
    return null;
  }

  console.log('[DEBUG] Ensuring lesson structure for:', lessonData.id || 'unknown', {
    hasStages: !!(lessonData.stages && Array.isArray(lessonData.stages)),
    stagesLength: lessonData.stages?.length || 0,
    hasSlides: !!(lessonData.slides && Array.isArray(lessonData.slides)),
    slidesLength: lessonData.slides?.length || 0,
    hasCards: !!(lessonData.cards && Array.isArray(lessonData.cards)),
    cardsLength: lessonData.cards?.length || 0
  });

  // If stages already exist and have proper structure, return as is
  if (lessonData.stages && Array.isArray(lessonData.stages) && lessonData.stages.length > 0) {
    const firstStage = lessonData.stages[0];
    if (firstStage && firstStage.activity && firstStage.activity.component) {
      console.log('[DEBUG] Lesson already has proper stage structure');
      return lessonData;
    }
  }

  // Try to transform from slides
  if (lessonData.slides && Array.isArray(lessonData.slides) && lessonData.slides.length > 0) {
    console.log('[DEBUG] Transforming slides to stages:', lessonData.slides.length, 'slides');
    const transformedStages = transformSlidesToStages(lessonData.slides, lessonData.id);
    console.log('[DEBUG] Generated stages:', transformedStages.length, 'stages');
    return {
      ...lessonData,
      stages: transformedStages
    };
  }

  // Try to transform from cards (database format)
  if (lessonData.cards && Array.isArray(lessonData.cards) && lessonData.cards.length > 0) {
    console.log('[DEBUG] Transforming cards to stages:', lessonData.cards.length, 'cards');
    const transformedStages = transformCardsToStages(lessonData.cards, lessonData.id);
    console.log('[DEBUG] Generated stages:', transformedStages.length, 'stages');
    return {
      ...lessonData,
      stages: transformedStages
    };
  }

  // If no slides/cards, create empty stages
  console.log('[DEBUG] No slides or cards found, creating empty stages');
  return {
    ...lessonData,
    stages: []
  };
}
