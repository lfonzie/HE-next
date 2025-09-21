import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { vi } from 'vitest';
import { EnemCache, QuestionCache } from '@/lib/cache/enem-cache';
import { EnemBatchProcessor } from '@/lib/batch/enem-batch-processor';
import { EnemAssessmentEngine } from '@/lib/assessment/enem-assessment';
import { EnemExportService } from '@/lib/export/enem-export';

describe('ENEM Integration Tests', () => {
  describe('Cache System', () => {
    let cache: EnemCache;
    let questionCache: QuestionCache;

    beforeEach(() => {
      cache = new EnemCache({ maxSize: 10, defaultTTL: 1000 });
      questionCache = new QuestionCache();
    });

    afterEach(() => {
      cache.destroy();
      questionCache.clear();
    });

    it('should cache and retrieve data correctly', () => {
      const testData = { questions: ['q1', 'q2', 'q3'] };
      const key = 'test-key';

      cache.set(key, testData);
      const retrieved = cache.get(key);

      expect(retrieved).toEqual(testData);
    });

    it('should expire cached data after TTL', async () => {
      const testData = { questions: ['q1', 'q2'] };
      const key = 'test-key';

      cache.set(key, testData, 100); // 100ms TTL

      expect(cache.get(key)).toEqual(testData);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.get(key)).toBeNull();
    });

    it('should handle cache size limits', () => {
      const cache = new EnemCache({ maxSize: 2, defaultTTL: 5000 });

      cache.set('key1', 'data1');
      cache.set('key2', 'data2');
      cache.set('key3', 'data3'); // Should evict key1

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('data2');
      expect(cache.get('key3')).toBe('data3');
    });

    it('should generate correct cache keys for questions', () => {
      const config = {
        area: 'matematica',
        years: [2023, 2022],
        difficulty: ['MEDIUM', 'HARD'],
        skill_tags: ['álgebra', 'geometria'],
        count: 10
      };

      const key = questionCache.generateKey('matematica', config);
      expect(key).toContain('questions:');
      expect(key).toContain('matematica');
    });
  });

  describe('Batch Processing', () => {
    let batchProcessor: EnemBatchProcessor;

    beforeEach(() => {
      batchProcessor = new EnemBatchProcessor({
        batchSize: 2,
        maxConcurrentBatches: 1,
        retryAttempts: 2,
        retryDelay: 100
      });
    });

    afterEach(() => {
      batchProcessor.destroy();
    });

    it('should process batch requests correctly', async () => {
      const mockRequest = {
        examId: 'exam-123',
        area: 'matematica',
        mode: 'MIXED' as const,
        totalQuestions: 6,
        config: {
          years: [2023],
          difficulty: ['MEDIUM']
        }
      };

      // Mock the batch processing
      const mockQuestions = [
        {
          id: 'q1',
          area: 'matematica',
          year: 2023,
          disciplina: 'Matemática',
          skill_tag: ['álgebra'],
          stem: 'Test question 1',
          a: 'A',
          b: 'B',
          c: 'C',
          d: 'D',
          e: 'E',
          correct: 'A',
          rationale: 'Test rationale',
          difficulty: 'MEDIUM' as const,
          source: 'DATABASE' as const
        },
        {
          id: 'q2',
          area: 'matematica',
          year: 2023,
          disciplina: 'Matemática',
          skill_tag: ['geometria'],
          stem: 'Test question 2',
          a: 'A',
          b: 'B',
          c: 'C',
          d: 'D',
          e: 'E',
          correct: 'B',
          rationale: 'Test rationale 2',
          difficulty: 'MEDIUM' as const,
          source: 'AI' as const
        }
      ];

      // Mock the internal methods
      jest.spyOn(batchProcessor as any, 'generateBatchQuestions').mockResolvedValue(mockQuestions);

      const progressUpdates: any[] = [];
      const questions = await batchProcessor.processBatch(
        mockRequest,
        0,
        (progress) => progressUpdates.push(progress)
      );

      expect(questions).toHaveLength(2);
      expect(progressUpdates).toHaveLength(2); // Initial and final progress
      expect(progressUpdates[0].isGenerating).toBe(true);
      expect(progressUpdates[1].isGenerating).toBe(false);
    });

    it('should handle batch cancellation', () => {
      const examId = 'exam-123';
      const batchNumber = 0;

      batchProcessor.cancelBatch(examId, batchNumber);
      
      const status = batchProcessor.getProcessingStatus(examId);
      expect(status).toEqual([]);
    });

    it('should track processing status', () => {
      const examId = 'exam-123';
      
      // Simulate active batch
      const controller = new AbortController();
      (batchProcessor as any).activeBatches.set(`${examId}:${0}`, controller);
      
      const status = batchProcessor.getProcessingStatus(examId);
      expect(status).toHaveLength(1);
      expect(status[0].batchNumber).toBe(0);
      expect(status[0].isProcessing).toBe(true);
    });
  });

  describe('Assessment Engine', () => {
    let assessmentEngine: EnemAssessmentEngine;

    beforeEach(() => {
      assessmentEngine = new EnemAssessmentEngine();
    });

    it('should calculate overall score correctly', async () => {
      const questions = [
        {
          id: 'q1',
          area: 'matematica',
          year: 2023,
          disciplina: 'Matemática',
          skill_tag: ['álgebra'],
          stem: 'Question 1',
          a: 'A',
          b: 'B',
          c: 'C',
          d: 'D',
          e: 'E',
          correct: 'A',
          rationale: 'Rationale 1',
          difficulty: 'EASY' as const,
          source: 'DATABASE' as const
        },
        {
          id: 'q2',
          area: 'matematica',
          year: 2023,
          disciplina: 'Matemática',
          skill_tag: ['geometria'],
          stem: 'Question 2',
          a: 'A',
          b: 'B',
          c: 'C',
          d: 'D',
          e: 'E',
          correct: 'B',
          rationale: 'Rationale 2',
          difficulty: 'HARD' as const,
          source: 'AI' as const
        }
      ];

      const answers = new Map([
        ['q1', { questionId: 'q1', answer: 'A', timestamp: new Date(), timeSpent: 60 }],
        ['q2', { questionId: 'q2', answer: 'B', timestamp: new Date(), timeSpent: 120 }]
      ]);

      const result = await assessmentEngine.assessPerformance(questions, answers, 180);

      expect(result.overall.totalQuestions).toBe(2);
      expect(result.overall.correctAnswers).toBe(2);
      expect(result.overall.incorrectAnswers).toBe(0);
      expect(result.overall.accuracy).toBe(100);
      expect(result.overall.grade).toBe('A');
    });

    it('should calculate difficulty breakdown', async () => {
      const questions = [
        {
          id: 'q1',
          area: 'matematica',
          year: 2023,
          disciplina: 'Matemática',
          skill_tag: ['álgebra'],
          stem: 'Easy question',
          a: 'A',
          b: 'B',
          c: 'C',
          d: 'D',
          e: 'E',
          correct: 'A',
          rationale: 'Easy rationale',
          difficulty: 'EASY' as const,
          source: 'DATABASE' as const
        },
        {
          id: 'q2',
          area: 'matematica',
          year: 2023,
          disciplina: 'Matemática',
          skill_tag: ['geometria'],
          stem: 'Hard question',
          a: 'A',
          b: 'B',
          c: 'C',
          d: 'D',
          e: 'E',
          correct: 'B',
          rationale: 'Hard rationale',
          difficulty: 'HARD' as const,
          source: 'AI' as const
        }
      ];

      const answers = new Map([
        ['q1', { questionId: 'q1', answer: 'A', timestamp: new Date(), timeSpent: 30 }],
        ['q2', { questionId: 'q2', answer: 'C', timestamp: new Date(), timeSpent: 150 }] // Wrong answer
      ]);

      const result = await assessmentEngine.assessPerformance(questions, answers, 180);

      expect(result.difficulty.easy.total).toBe(1);
      expect(result.difficulty.easy.correct).toBe(1);
      expect(result.difficulty.easy.accuracy).toBe(100);

      expect(result.difficulty.hard.total).toBe(1);
      expect(result.difficulty.hard.correct).toBe(0);
      expect(result.difficulty.hard.accuracy).toBe(0);
    });

    it('should generate recommendations', async () => {
      const questions = [
        {
          id: 'q1',
          area: 'matematica',
          year: 2023,
          disciplina: 'Matemática',
          skill_tag: ['álgebra'],
          stem: 'Question 1',
          a: 'A',
          b: 'B',
          c: 'C',
          d: 'D',
          e: 'E',
          correct: 'A',
          rationale: 'Rationale 1',
          difficulty: 'MEDIUM' as const,
          source: 'DATABASE' as const
        }
      ];

      const answers = new Map([
        ['q1', { questionId: 'q1', answer: 'B', timestamp: new Date(), timeSpent: 200 }] // Wrong answer, slow
      ]);

      const result = await assessmentEngine.assessPerformance(questions, answers, 200);

      expect(result.recommendations).toHaveLength(2); // Low accuracy + slow time
      expect(result.recommendations[0].type).toBe('study');
      expect(result.recommendations[1].type).toBe('time');
    });
  });

  describe('Export Service', () => {
    let exportService: EnemExportService;

    beforeEach(() => {
      exportService = new EnemExportService();
    });

    it('should export to JSON format', async () => {
      const exportData = {
        examInfo: {
          id: 'exam-123',
          area: 'matematica',
          totalQuestions: 2,
          completedAt: new Date(),
          duration: 180
        },
        questions: [
          {
            id: 'q1',
            area: 'matematica',
            year: 2023,
            disciplina: 'Matemática',
            skill_tag: ['álgebra'],
            stem: 'Test question',
            a: 'A',
            b: 'B',
            c: 'C',
            d: 'D',
            e: 'E',
            correct: 'A',
            rationale: 'Test rationale',
            difficulty: 'MEDIUM' as const,
            source: 'DATABASE' as const
          }
        ],
        answers: [
          { questionId: 'q1', answer: 'A', timestamp: new Date(), timeSpent: 90 }
        ],
        stats: {
          correctAnswers: 1,
          incorrectAnswers: 0,
          skippedAnswers: 0,
          averageTimePerQuestion: 90,
          accuracy: 100,
          timeSpent: 180,
          difficultyBreakdown: {
            easy: { correct: 0, total: 0 },
            medium: { correct: 1, total: 1 },
            hard: { correct: 0, total: 0 }
          },
          skillBreakdown: {
            'álgebra': { correct: 1, total: 1 }
          }
        }
      };

      const options = {
        format: 'json' as const,
        includeQuestions: true,
        includeAnswers: true,
        includeRationale: true,
        includeImages: false,
        includeStats: true,
        includeRecommendations: false
      };

      const blob = await exportService.exportToJSON(exportData, options);
      const text = await blob.text();
      const data = JSON.parse(text);

      expect(data.examInfo).toBeDefined();
      expect(data.questions).toHaveLength(1);
      expect(data.answers).toHaveLength(1);
      expect(data.stats).toBeDefined();
    });

    it('should export to CSV format', async () => {
      const exportData = {
        examInfo: {
          id: 'exam-123',
          area: 'matematica',
          totalQuestions: 1,
          completedAt: new Date(),
          duration: 90
        },
        questions: [
          {
            id: 'q1',
            area: 'matematica',
            year: 2023,
            disciplina: 'Matemática',
            skill_tag: ['álgebra'],
            stem: 'Test question',
            a: 'A',
            b: 'B',
            c: 'C',
            d: 'D',
            e: 'E',
            correct: 'A',
            rationale: 'Test rationale',
            difficulty: 'MEDIUM' as const,
            source: 'DATABASE' as const
          }
        ],
        answers: [
          { questionId: 'q1', answer: 'A', timestamp: new Date(), timeSpent: 90 }
        ],
        stats: {
          correctAnswers: 1,
          incorrectAnswers: 0,
          skippedAnswers: 0,
          averageTimePerQuestion: 90,
          accuracy: 100,
          timeSpent: 90,
          difficultyBreakdown: {
            easy: { correct: 0, total: 0 },
            medium: { correct: 1, total: 1 },
            hard: { correct: 0, total: 0 }
          },
          skillBreakdown: {
            'álgebra': { correct: 1, total: 1 }
          }
        }
      };

      const options = {
        format: 'csv' as const,
        includeQuestions: true,
        includeAnswers: true,
        includeRationale: false,
        includeImages: false,
        includeStats: true,
        includeRecommendations: false
      };

      const blob = await exportService.exportToCSV(exportData, options);
      const text = await blob.text();

      expect(text).toContain('Questão,Área,Ano');
      expect(text).toContain('Questão 1');
      expect(text).toContain('matematica');
      expect(text).toContain('Resumo,Valor');
    });
  });
});
