import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as questionsAdvanced } from '@/app/api/enem/questions/advanced/route';
import { POST as createExam } from '@/app/api/enem/exams/route';
import { POST as assessment } from '@/app/api/enem/assessment/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    enemQuestion: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    enemExam: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn()
    },
    enemExamItem: {
      findMany: vi.fn()
    }
  }
}));

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/openai';

describe('ENEM API Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Advanced Questions API', () => {
    it('should return questions successfully', async () => {
      const mockQuestions = [
        {
          id: 'q1',
          area: 'matematica',
          year: 2023,
          disciplina: 'Matemática',
          skill_tag: ['álgebra'],
          stem: 'Test question',
          a: 'Option A',
          b: 'Option B',
          c: 'Option C',
          d: 'Option D',
          e: 'Option E',
          correct: 'A',
          rationale: 'Test rationale',
          difficulty: 'MEDIUM',
          source: 'DATABASE'
        }
      ];

      (prisma.enemQuestion.count as jest.Mock).mockResolvedValue(10);
      (prisma.enemQuestion.findMany as jest.Mock).mockResolvedValue(mockQuestions);

      const request = new NextRequest('http://localhost:3000/api/enem/questions/advanced', {
        method: 'POST',
        body: JSON.stringify({
          area: 'matematica',
          count: 5,
          mode: 'MIXED',
          years: [2023],
          difficulty: ['MEDIUM']
        })
      });

      const response = await questionsAdvanced(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.questions).toHaveLength(1);
      expect(data.metadata.database_questions).toBe(1);
    });

    it('should handle AI generation when database coverage is low', async () => {
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              questions: [{
                area: 'matematica',
                year: 2023,
                disciplina: 'Matemática',
                skill_tag: ['álgebra'],
                stem: 'AI generated question',
                a: 'Option A',
                b: 'Option B',
                c: 'Option C',
                d: 'Option D',
                e: 'Option E',
                correct: 'A',
                rationale: 'AI rationale',
                difficulty: 'MEDIUM'
              }]
            })
          }
        }]
      };

      (prisma.enemQuestion.count as jest.Mock).mockResolvedValue(0);
      (prisma.enemQuestion.findMany as jest.Mock).mockResolvedValue([]);
      (openai.chat.completions.create as jest.Mock).mockResolvedValue(mockAIResponse);

      const request = new NextRequest('http://localhost:3000/api/enem/questions/advanced', {
        method: 'POST',
        body: JSON.stringify({
          area: 'matematica',
          count: 5,
          mode: 'AI',
          fallback_threshold: 0.7
        })
      });

      const response = await questionsAdvanced(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.ai_questions).toBeGreaterThan(0);
    });

    it('should return 401 for unauthorized requests', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/enem/questions/advanced', {
        method: 'POST',
        body: JSON.stringify({
          area: 'matematica',
          count: 5
        })
      });

      const response = await questionsAdvanced(request);
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/enem/questions/advanced', {
        method: 'POST',
        body: JSON.stringify({
          area: 'invalid_area',
          count: 100 // Too many questions
        })
      });

      const response = await questionsAdvanced(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Exam Creation API', () => {
    it('should create exam successfully', async () => {
      const mockExam = {
        id: 'exam-123',
        user_id: mockUser.id,
        area: 'matematica',
        mode: 'MIXED',
        total_questions: 20,
        duration_sec: 3600,
        config_json: {},
        created_at: new Date()
      };

      (prisma.enemExam.create as jest.Mock).mockResolvedValue(mockExam);

      const request = new NextRequest('http://localhost:3000/api/enem/exams', {
        method: 'POST',
        body: JSON.stringify({
          area: 'matematica',
          mode: 'MIXED',
          total_questions: 20,
          duration_sec: 3600,
          config_json: {
            years: [2023],
            difficulty: ['MEDIUM']
          }
        })
      });

      const response = await createExam(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.exam_id).toBe('exam-123');
    });

    it('should validate exam parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/enem/exams', {
        method: 'POST',
        body: JSON.stringify({
          area: 'invalid_area',
          total_questions: 200, // Too many questions
          duration_sec: 10 // Too short duration
        })
      });

      const response = await createExam(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Assessment API', () => {
    it('should generate assessment successfully', async () => {
      const mockExam = {
        id: 'exam-123',
        user_id: mockUser.id,
        area: 'matematica',
        mode: 'MIXED',
        total_questions: 5,
        duration_sec: 1800,
        exam_items: [
          {
            id: 'item-1',
            index: 0,
            source: 'DATABASE',
            question_id: 'q1',
            payload_json: {
              stem: 'Test question 1',
              a: 'Option A',
              b: 'Option B',
              c: 'Option C',
              d: 'Option D',
              e: 'Option E',
              correct: 'A',
              rationale: 'Test rationale',
              difficulty: 'MEDIUM'
            },
            answer_user: 'A',
            updated_at: new Date()
          },
          {
            id: 'item-2',
            index: 1,
            source: 'AI',
            question_id: null,
            payload_json: {
              stem: 'Test question 2',
              a: 'Option A',
              b: 'Option B',
              c: 'Option C',
              d: 'Option D',
              e: 'Option E',
              correct: 'B',
              rationale: 'Test rationale 2',
              difficulty: 'EASY'
            },
            answer_user: 'B',
            updated_at: new Date()
          }
        ]
      };

      (prisma.enemExam.findFirst as jest.Mock).mockResolvedValue(mockExam);
      (prisma.enemExam.update as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/enem/assessment', {
        method: 'POST',
        body: JSON.stringify({
          examId: 'exam-123',
          includeRecommendations: true
        })
      });

      const response = await assessment(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.assessment).toBeDefined();
      expect(data.stats.correctAnswers).toBe(2);
      expect(data.stats.accuracy).toBe(100);
    });

    it('should return 404 for non-existent exam', async () => {
      (prisma.enemExam.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/enem/assessment', {
        method: 'POST',
        body: JSON.stringify({
          examId: 'non-existent-exam'
        })
      });

      const response = await assessment(request);
      expect(response.status).toBe(404);
    });
  });
});
