// ENEM Simulator Types - Offline-First Architecture

export interface EnemManifest {
  dataset_version: string;
  years_available: number[];
  areas: string[];
  checksums: Record<string, string>;
  metadata: {
    total_items: number;
    last_updated: string;
    import_status: 'pending' | 'in_progress' | 'completed' | 'failed';
    validation_status: 'pending' | 'validated' | 'failed';
  };
}

export interface EnemItem {
  item_id: string; // Format: {year}-{booklet}-{question_number}
  year: number;
  area: 'CN' | 'CH' | 'LC' | 'MT';
  text: string;
  alternatives: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  topic: string;
  estimated_difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  asset_refs: string[];
  content_hash: string;
  dataset_version: string;
  metadata: {
    bncc_codes?: string[];
    competencies?: string[];
    source?: 'DATABASE' | 'LOCAL_DATABASE' | 'AI';
    is_official_enem?: boolean;
    is_ai_generated?: boolean;
    has_image?: boolean;
    original_year?: number;
    formatted_at?: string;
    [key: string]: any;
  };
}

export interface EnemGabarito {
  year: number;
  booklet: string;
  answers: Record<string, string>;
  metadata: {
    total_questions: number;
    areas: string[];
    created_at: string;
    version: string;
  };
}

export interface EnemExamTemplate {
  template_id: string;
  name: string;
  items: string[]; // Array of item_ids
  metadata: {
    description?: string;
    estimated_duration?: number;
    difficulty_distribution?: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

export interface EnemSession {
  session_id: string;
  user_id: string;
  mode: 'QUICK' | 'CUSTOM' | 'OFFICIAL' | 'ADAPTIVE';
  area: string[];
  config: {
    num_questions: number;
    time_limit?: number; // in minutes
    difficulty_distribution?: {
      easy: number;
      medium: number;
      hard: number;
    };
    random_seed?: string;
  };
  start_time: Date;
  end_time?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
}

export interface EnemResponse {
  response_id: string;
  session_id: string;
  item_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  time_spent: number; // in seconds
  is_correct: boolean;
  timestamp: Date;
}

export interface EnemScore {
  score_id: string;
  session_id: string;
  area_scores: Record<string, {
    raw_score: number;
    percentage: number;
    correct: number;
    total: number;
  }>;
  total_score: number;
  tri_estimated: {
    score: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
    disclaimer: string;
  };
  stats: {
    total_time_spent: number;
    average_time_per_question: number;
    accuracy_by_topic: Record<string, number>;
    difficulty_breakdown: {
      easy: { correct: number; total: number };
      medium: { correct: number; total: number };
      hard: { correct: number; total: number };
    };
  };
}

export interface EnemRedacao {
  redacao_id: string;
  session_id: string;
  prompt: string;
  submission: string; // encrypted
  rubrics: {
    comp1: number; // Demonstrar domínio da modalidade escrita formal da Língua Portuguesa
    comp2: number; // Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento
    comp3: number; // Selecionar, relacionar, organizar e interpretar informações
    comp4: number; // Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação
    comp5: number; // Elaborar proposta de intervenção para o problema abordado
  };
  estimated_score: number;
  ai_feedback?: string;
}

// API Request/Response Types
export interface EnemBatchRequest {
  startIndex: number;
  count: number;
  area: string;
  filters?: {
    year?: number;
    difficulty?: string;
    topic?: string;
  };
}

export interface EnemBatchResponse {
  items: EnemItem[];
  success: boolean;
  source: 'database' | 'ai' | 'fallback';
  metadata?: {
    total_available?: number;
    batch_info?: string;
  };
}

export interface EnemSessionRequest {
  mode: 'QUICK' | 'CUSTOM' | 'OFFICIAL' | 'ADAPTIVE';
  area: string[];
  config: {
    num_questions: number;
    time_limit?: number;
    difficulty_distribution?: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

export interface EnemSessionResponse {
  session_id: string;
  items: EnemItem[];
  success: boolean;
  metadata: {
    estimated_duration: number;
    difficulty_breakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

// Utility Types
export type EnemArea = 'CN' | 'CH' | 'LC' | 'MT';
export type EnemDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type EnemMode = 'QUICK' | 'CUSTOM' | 'OFFICIAL' | 'ADAPTIVE';
export type EnemAnswer = 'A' | 'B' | 'C' | 'D' | 'E';

// Export/Import Types
export interface EnemExportData {
  session: EnemSession;
  responses: EnemResponse[];
  score: EnemScore;
  items: EnemItem[];
  metadata: {
    export_date: string;
    format_version: string;
    user_id: string;
  };
}

export interface EnemImportResult {
  success: boolean;
  imported_items: number;
  skipped_items: number;
  errors: string[];
  validation_report: {
    missing_assets: string[];
    duplicate_items: string[];
    invalid_items: string[];
  };
}
