import {
  sanitizeQuestion,
  sanitizeQuestions,
  createFallbackQuestion,
  validateImageUrl,
  cleanAlternativeText,
  validateDifficulty
} from '@/lib/enem-data-sanitizer'

// Mock fetch for image validation
global.fetch = jest.fn()

describe('enem-data-sanitizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sanitizeQuestion', () => {
    const validQuestion = {
      id: 'test-1',
      stem: 'Qual é a resposta?',
      alternatives: ['Opção A', 'Opção B', 'Opção C', 'Opção D', 'Opção E'],
      correct: 'A',
      rationale: 'Explicação da resposta',
      difficulty: 'MEDIUM',
      area: 'Matemática',
      disciplina: 'Álgebra',
      skill_tag: ['tag1', 'tag2'],
      year: 2023,
      source: 'DATABASE'
    }

    it('sanitizes valid question correctly', () => {
      const result = sanitizeQuestion(validQuestion)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.sanitizedData).toBeDefined()
      expect(result.sanitizedData?.id).toBe('test-1')
      expect(result.sanitizedData?.alternatives).toHaveLength(5)
      expect(result.sanitizedData?.correct).toBe('A')
    })

    it('handles old format with individual fields', () => {
      const oldFormatQuestion = {
        id: 'test-2',
        stem: 'Qual é a resposta?',
        a: 'Opção A',
        b: 'Opção B',
        c: 'Opção C',
        d: 'Opção D',
        e: 'Opção E',
        correct: 'A',
        rationale: 'Explicação',
        difficulty: 'EASY',
        area: 'Português',
        disciplina: 'Literatura',
        year: 2022
      }

      const result = sanitizeQuestion(oldFormatQuestion)
      
      expect(result.isValid).toBe(true)
      expect(result.sanitizedData?.alternatives).toHaveLength(5)
      expect(result.sanitizedData?.alternatives[0].text).toBe('Opção A')
    })

    it('cleans alternative text from duplicate labels', () => {
      const questionWithDuplicateLabels = {
        ...validQuestion,
        alternatives: ['A) Opção A', 'B) Opção B', 'C) Opção C', 'D) Opção D', 'E) Opção E']
      }

      const result = sanitizeQuestion(questionWithDuplicateLabels)
      
      expect(result.isValid).toBe(true)
      expect(result.sanitizedData?.alternatives[0].text).toBe('Opção A')
      expect(result.sanitizedData?.alternatives[1].text).toBe('Opção B')
    })

    it('validates required fields', () => {
      const invalidQuestion = {
        stem: 'Qual é a resposta?',
        // Missing id, correct, etc.
      }

      const result = sanitizeQuestion(invalidQuestion)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Question ID is required')
      expect(result.errors).toContain('Correct answer is required')
    })

    it('validates correct answer format', () => {
      const invalidCorrectAnswer = {
        ...validQuestion,
        correct: 'X' // Invalid answer
      }

      const result = sanitizeQuestion(invalidCorrectAnswer)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid correct answer: X')
    })

    it('handles missing rationale with warning', () => {
      const questionWithoutRationale = {
        ...validQuestion,
        rationale: undefined
      }

      const result = sanitizeQuestion(questionWithoutRationale)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Question lacks explanation')
      expect(result.sanitizedData?.rationale).toBe('Explicação não disponível')
    })

    it('normalizes difficulty levels', () => {
      const testCases = [
        { input: 'FÁCIL', expected: 'EASY' },
        { input: 'facil', expected: 'EASY' },
        { input: '1', expected: 'EASY' },
        { input: 'MÉDIO', expected: 'MEDIUM' },
        { input: 'medio', expected: 'MEDIUM' },
        { input: '2', expected: 'MEDIUM' },
        { input: 'DIFÍCIL', expected: 'HARD' },
        { input: 'dificil', expected: 'HARD' },
        { input: '3', expected: 'HARD' },
        { input: 'unknown', expected: 'MEDIUM' }
      ]

      testCases.forEach(({ input, expected }) => {
        const question = { ...validQuestion, difficulty: input }
        const result = sanitizeQuestion(question)
        expect(result.sanitizedData?.difficulty).toBe(expected)
      })
    })
  })

  describe('sanitizeQuestions', () => {
    it('processes multiple questions correctly', () => {
      const questions = [
        validQuestion,
        { ...validQuestion, id: 'test-2' },
        { id: 'invalid' } // Invalid question
      ]

      const result = sanitizeQuestions(questions)
      
      expect(result.summary.total).toBe(3)
      expect(result.summary.valid).toBe(2)
      expect(result.summary.invalid).toBe(1)
      expect(result.valid).toHaveLength(2)
      expect(result.invalid).toHaveLength(1)
    })
  })

  describe('createFallbackQuestion', () => {
    it('creates valid fallback question', () => {
      const originalQuestion = { id: 'test-fallback' }
      const fallback = createFallbackQuestion(originalQuestion)
      
      expect(fallback.id).toBe('test-fallback')
      expect(fallback.stem).toBe('Questão não disponível')
      expect(fallback.alternatives).toHaveLength(5)
      expect(fallback.correct).toBe('A')
      expect(fallback.source).toBe('FALLBACK')
    })
  })

  describe('validateImageUrl', () => {
    it('validates accessible image URL', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/jpeg')
        }
      })

      const isValid = await validateImageUrl('https://example.com/image.jpg')
      
      expect(isValid).toBe(true)
      expect(fetch).toHaveBeenCalledWith('https://example.com/image.jpg', { method: 'HEAD' })
    })

    it('handles inaccessible image URL', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      })

      const isValid = await validateImageUrl('https://example.com/invalid.jpg')
      
      expect(isValid).toBe(false)
    })

    it('handles non-image content type', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('text/html')
        }
      })

      const isValid = await validateImageUrl('https://example.com/page.html')
      
      expect(isValid).toBe(false)
    })

    it('handles fetch errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const isValid = await validateImageUrl('https://example.com/image.jpg')
      
      expect(isValid).toBe(false)
    })

    it('handles empty URL', async () => {
      const isValid = await validateImageUrl('')
      
      expect(isValid).toBe(false)
    })
  })

  describe('cleanAlternativeText', () => {
    it('removes various label patterns', () => {
      expect(cleanAlternativeText('A) Texto')).toBe('Texto')
      expect(cleanAlternativeText('B. Texto')).toBe('Texto')
      expect(cleanAlternativeText('C Texto')).toBe('Texto')
      expect(cleanAlternativeText('D)Texto')).toBe('Texto')
    })

    it('handles text without labels', () => {
      expect(cleanAlternativeText('Texto sem label')).toBe('Texto sem label')
    })

    it('handles empty text', () => {
      expect(cleanAlternativeText('')).toBe('')
    })
  })

  describe('validateDifficulty', () => {
    it('validates difficulty levels correctly', () => {
      expect(validateDifficulty('EASY')).toBe('EASY')
      expect(validateDifficulty('FÁCIL')).toBe('EASY')
      expect(validateDifficulty('1')).toBe('EASY')
      expect(validateDifficulty('MEDIUM')).toBe('MEDIUM')
      expect(validateDifficulty('MÉDIO')).toBe('MEDIUM')
      expect(validateDifficulty('2')).toBe('MEDIUM')
      expect(validateDifficulty('HARD')).toBe('HARD')
      expect(validateDifficulty('DIFÍCIL')).toBe('HARD')
      expect(validateDifficulty('3')).toBe('HARD')
      expect(validateDifficulty('unknown')).toBe('MEDIUM')
      expect(validateDifficulty(null)).toBe('MEDIUM')
    })
  })
})
