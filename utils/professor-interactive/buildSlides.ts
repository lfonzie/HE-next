interface Slide {
  id: string;
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content: string;
  question?: string;
  options?: string[];
  correctOption?: number;
}

export function dedupeSlides(slides: Slide[]): Slide[] {
  const seen = new Set<string>();
  const uniqueSlides: Slide[] = [];
  
  for (const slide of slides) {
    // Create a unique key based on type and content identifier
    const key = `${slide.type}-${slide.content.substring(0, 50).replace(/\s+/g, '-')}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSlides.push(slide);
    }
  }
  
  return uniqueSlides;
}

export function buildSlides(lessonData: any): Slide[] {
  const slides: Slide[] = [];
  
  // Add introduction slide
  if (lessonData.introduction) {
    slides.push({
      id: 'intro',
      type: 'explanation',
      content: lessonData.introduction
    });
  }
  
  // Add step slides
  if (lessonData.steps && Array.isArray(lessonData.steps)) {
    lessonData.steps.forEach((step: any, index: number) => {
      slides.push({
        id: `step-${index}`,
        type: step.type || 'explanation',
        content: step.content || '',
        question: step.question,
        options: step.options,
        correctOption: step.correctOption
      });
    });
  }
  
  // Add final test slide
  if (lessonData.finalTest) {
    slides.push({
      id: 'final-test',
      type: 'question',
      content: lessonData.finalTest.question || '',
      question: lessonData.finalTest.question,
      options: lessonData.finalTest.options,
      correctOption: lessonData.finalTest.correctOption
    });
  }
  
  // Add summary slide
  if (lessonData.summary) {
    slides.push({
      id: 'summary',
      type: 'explanation',
      content: lessonData.summary
    });
  }
  
  return dedupeSlides(slides);
}

export function validateSlides(slides: Slide[]): boolean {
  if (!slides || slides.length === 0) return false;
  
  for (const slide of slides) {
    if (!slide.id || !slide.type || !slide.content) {
      return false;
    }
    
    if (slide.type === 'question' && (!slide.question || !slide.options)) {
      return false;
    }
  }
  
  return true;
}
