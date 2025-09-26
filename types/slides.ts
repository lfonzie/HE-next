// TypeScript interfaces for the optimized Professor module and ENEM simulator

export interface Slide {
  type: 'explanation' | 'question';
  title: string; // Unique, concise (e.g., "Definição", "Exemplo Prático")
  content: string; // 120–150 words, clear and focused
  key_points?: string[]; // 3 distinct bullets for explanations
  question_stem?: string; // Question text (for type: 'question')
  options?: string[]; // ['A) ...', 'B) ...', 'C) ...', 'D) ...']
  answer?: 'A' | 'B' | 'C' | 'D'; // Correct option
  rationale?: string; // 1–2 sentence explanation for correct answer
  image_prompt?: string; // Prompt for image generation
  image_confidence?: number; // 0–1, display only if ≥ 0.7
  // For quiz slides with multiple questions
  questions?: Array<{
    question_stem: string;
    options: string[];
    answer: 'A' | 'B' | 'C' | 'D';
    rationale: string;
  }>;
}

export interface ENEMItem {
  area: 'matematica' | 'linguagens' | 'natureza' | 'humanas';
  year_hint?: string; // e.g., "ENEM 2023 style"
  content: string; // Contextualized question stem
  options: string[]; // ['A) ...', 'B) ...', ..., 'E) ...']
  answer: 'A' | 'B' | 'C' | 'D' | 'E';
  rationale: string; // 1–3 sentences
  tags: string[]; // e.g., ['função', 'quadrática']
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SlideGenerationRequest {
  topic: string;
  position: number; // 1-14
  previousSlides: Slide[];
}

export interface ENEMBatchRequest {
  startIndex: number;
  count: number; // Usually 3
  area: 'matematica' | 'linguagens' | 'natureza' | 'humanas';
}

export interface SlideGenerationResponse {
  slide: Slide;
  success: boolean;
  error?: string;
}

export interface ENEMBatchResponse {
  items: ENEMItem[];
  success: boolean;
  error?: string;
  source: 'api' | 'ai' | 'fallback';
}
