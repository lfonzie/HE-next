import { Question } from '@/lib/stores/enem-simulation-store';
import { questionCache, CacheKeys } from '@/lib/cache/enem-cache';
import { enemGenerator } from '@/lib/ai/enem-generator';
import { prisma } from '@/lib/prisma';

export interface BatchRequest {
  examId: string;
  area: string;
  mode: 'REAL' | 'AI' | 'MIXED';
  totalQuestions: number;
  config: {
    years?: number[];
    difficulty?: string[];
    skill_tags?: string[];
  };
}

export interface BatchProgress {
  batchNumber: number;
  totalBatches: number;
  questionsGenerated: number;
  totalQuestions: number;
  isGenerating: boolean;
  progress: number; // 0-100
  error?: string;
  currentBatch?: Question[];
}

export interface BatchProcessorConfig {
  batchSize: number;
  maxConcurrentBatches: number;
  retryAttempts: number;
  retryDelay: number;
  fallbackThreshold: number;
}

export class EnemBatchProcessor {
  private config: BatchProcessorConfig;
  private activeBatches = new Map<string, AbortController>();
  private batchQueue: Array<{
    request: BatchRequest;
    resolve: (questions: Question[]) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(config: Partial<BatchProcessorConfig> = {}) {
    this.config = {
      batchSize: 3,
      maxConcurrentBatches: 2,
      retryAttempts: 3,
      retryDelay: 1000,
      fallbackThreshold: 0.7,
      ...config
    };
  }

  async processBatch(
    request: BatchRequest,
    batchNumber: number,
    onProgress?: (progress: BatchProgress) => void
  ): Promise<Question[]> {
    const batchKey = CacheKeys.batch(request.examId, batchNumber);
    
    // Check cache first
    const cachedQuestions = questionCache.getBatch(batchKey, batchNumber);
    if (cachedQuestions) {
      onProgress?.({
        batchNumber,
        totalBatches: Math.ceil(request.totalQuestions / this.config.batchSize),
        questionsGenerated: cachedQuestions.length,
        totalQuestions: request.totalQuestions,
        isGenerating: false,
        progress: 100
      });
      return cachedQuestions;
    }

    const controller = new AbortController();
    this.activeBatches.set(batchKey, controller);

    try {
      onProgress?.({
        batchNumber,
        totalBatches: Math.ceil(request.totalQuestions / this.config.batchSize),
        questionsGenerated: 0,
        totalQuestions: request.totalQuestions,
        isGenerating: true,
        progress: 0
      });

      const questions = await this.generateBatchQuestions(request, batchNumber, controller.signal);
      
      // Cache the results
      questionCache.setBatch(batchKey, questions, batchNumber);
      
      onProgress?.({
        batchNumber,
        totalBatches: Math.ceil(request.totalQuestions / this.config.batchSize),
        questionsGenerated: questions.length,
        totalQuestions: request.totalQuestions,
        isGenerating: false,
        progress: 100,
        currentBatch: questions
      });

      return questions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      onProgress?.({
        batchNumber,
        totalBatches: Math.ceil(request.totalQuestions / this.config.batchSize),
        questionsGenerated: 0,
        totalQuestions: request.totalQuestions,
        isGenerating: false,
        progress: 0,
        error: errorMessage
      });

      throw error;
    } finally {
      this.activeBatches.delete(batchKey);
    }
  }

  private async generateBatchQuestions(
    request: BatchRequest,
    batchNumber: number,
    signal: AbortSignal
  ): Promise<Question[]> {
    const { area, mode, config } = request;
    const batchSize = Math.min(this.config.batchSize, request.totalQuestions - (batchNumber * this.config.batchSize));
    
    let questions: Question[] = [];

    // Try database first if mode allows
    if (mode === 'REAL' || mode === 'MIXED') {
      try {
        const dbQuestions = await this.getDatabaseQuestions(area, batchSize, config, signal);
        questions.push(...dbQuestions);
      } catch (error) {
        console.warn('Database questions failed:', error);
      }
    }

    // Generate AI questions if needed
    const remainingCount = batchSize - questions.length;
    if (remainingCount > 0 && (mode === 'AI' || mode === 'MIXED')) {
      try {
        const aiQuestions = await this.generateAIQuestions(area, remainingCount, config, signal);
        questions.push(...aiQuestions);
      } catch (error) {
        console.warn('AI generation failed:', error);
        // Add fallback questions
        const fallbackQuestions = this.generateFallbackQuestions(area, remainingCount);
        questions.push(...fallbackQuestions);
      }
    }

    return questions.slice(0, batchSize);
  }

  private async getDatabaseQuestions(
    area: string,
    count: number,
    config: any,
    signal: AbortSignal
  ): Promise<Question[]> {
    const whereClause: any = { area };
    
    if (config.years?.length > 0) {
      whereClause.year = { in: config.years };
    }
    
    if (config.difficulty?.length > 0) {
      whereClause.difficulty = { in: config.difficulty };
    }
    
    if (config.skill_tags?.length > 0) {
      whereClause.skill_tag = { hasSome: config.skill_tags };
    }

    const dbQuestions = await prisma.enemQuestion.findMany({
      where: whereClause,
      take: count,
      orderBy: { created_at: 'desc' }
    });

    return dbQuestions.map(q => ({
      id: q.id,
      area: q.area,
      year: q.year,
      disciplina: q.disciplina,
      skill_tag: q.skill_tag,
      stem: q.stem,
      a: q.a,
      b: q.b,
      c: q.c,
      d: q.d,
      e: q.e,
      correct: q.correct,
      rationale: q.rationale || 'Explicação não disponível',
      difficulty: q.difficulty,
      image_url: q.image_url || undefined,
      image_alt: q.image_alt || undefined,
      source: 'DATABASE' as const
    }));
  }

  private async generateAIQuestions(
    area: string,
    count: number,
    config: any,
    signal: AbortSignal
  ): Promise<Question[]> {
    const aiRequest = {
      area,
      count,
      skill_tags: config.skill_tags,
      difficulty: config.difficulty,
      years: config.years
    };

    const questions = await enemGenerator.generateQuestions(aiRequest);
    return questions.map(q => ({
      ...q,
      id: q.id || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
  }

  private generateFallbackQuestions(area: string, count: number): Question[] {
    return Array(count).fill(null).map((_, index) => ({
      id: `fallback_${Date.now()}_${index}`,
      area: area,
      year: 2023,
      disciplina: 'Exemplo',
      skill_tag: ['exemplo'],
      stem: `Questão ${index + 1}: Esta é uma questão de exemplo para manter o fluxo do simulador. Qual é a resposta correta?`,
      a: 'Opção A',
      b: 'Opção B',
      c: 'Opção C',
      d: 'Opção D',
      e: 'Opção E',
      correct: 'A',
      rationale: 'Esta é uma questão de exemplo para manter o fluxo do simulador.',
      difficulty: 'MEDIUM' as const,
      source: 'FALLBACK' as const
    }));
  }

  // Proactive batch loading
  async preloadBatches(
    request: BatchRequest,
    currentQuestionIndex: number,
    onProgress?: (progress: BatchProgress) => void
  ): Promise<void> {
    const totalBatches = Math.ceil(request.totalQuestions / this.config.batchSize);
    const currentBatch = Math.floor(currentQuestionIndex / this.config.batchSize);
    
    // Preload next batch if user is approaching the end of current batch
    const nextBatchIndex = currentBatch + 1;
    if (nextBatchIndex < totalBatches) {
      const nextBatchKey = CacheKeys.batch(request.examId, nextBatchIndex);
      
      if (!questionCache.getBatch(nextBatchKey, nextBatchIndex)) {
        // Start preloading in background
        this.processBatch(request, nextBatchIndex, onProgress).catch(error => {
          console.warn('Background preload failed:', error);
        });
      }
    }
  }

  // Cancel batch processing
  cancelBatch(examId: string, batchNumber: number): void {
    const batchKey = CacheKeys.batch(examId, batchNumber);
    const controller = this.activeBatches.get(batchKey);
    
    if (controller) {
      controller.abort();
      this.activeBatches.delete(batchKey);
    }
  }

  // Cancel all batches for an exam
  cancelAllBatches(examId: string): void {
    const keysToDelete: string[] = [];
    this.activeBatches.forEach((controller, key) => {
      if (key.includes(examId)) {
        controller.abort();
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.activeBatches.delete(key));
  }

  // Get processing status
  getProcessingStatus(examId: string): Array<{ batchNumber: number; isProcessing: boolean }> {
    const status: Array<{ batchNumber: number; isProcessing: boolean }> = [];
    
    this.activeBatches.forEach((controller, key) => {
      if (key.includes(examId)) {
        const batchNumber = parseInt(key.split(':').pop() || '0');
        status.push({ batchNumber, isProcessing: true });
      }
    });
    
    return status;
  }

  // Cleanup
  destroy(): void {
    // Cancel all active batches
    this.activeBatches.forEach(controller => {
      controller.abort();
    });
    this.activeBatches.clear();
    this.batchQueue = [];
  }
}

// Singleton instance
export const batchProcessor = new EnemBatchProcessor();
