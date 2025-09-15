import { NextRequest } from 'next/server'
import { POST as classifyPOST } from '@/app/api/router/classify/route'
import { POST as professorPOST } from '@/app/api/professor/generate/route'
import { POST as enemPOST } from '@/app/api/enem/route'
import { GET as imageGET } from '@/app/api/image/route'
import { POST as telemetryPOST } from '@/app/api/telemetry/route'
import { 
  createMockRequest, 
  createMockGetRequest,
  TestDataFactory,
  ErrorSimulator,
  MockServiceWorker,
  PerformanceTestHelper
} from '../utils/test-helpers'

// Mock external services
jest.mock('openai')
jest.mock('@/lib/unsplash')
jest.mock('@prisma/client')

describe('API Routes Integration Tests', () => {
  let mockOpenAI: any
  let mockUnsplash: any
  let mockPrisma: any

  beforeEach(() => {
    // Setup mocks
    mockOpenAI = MockServiceWorker.mockOpenAI()
    mockUnsplash = MockServiceWorker.mockUnsplash()
    mockPrisma = MockServiceWorker.mockDatabase()

    // Mock OpenAI module
    const OpenAI = require('openai').OpenAI
    OpenAI.mockImplementation(() => mockOpenAI)

    // Mock Unsplash module
    const unsplashService = require('@/lib/unsplash').unsplashService
    Object.assign(unsplashService, mockUnsplash)

    // Mock Prisma module
    const PrismaClient = require('@prisma/client').PrismaClient
    PrismaClient.mockImplementation(() => mockPrisma)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Classification API', () => {
    test('should classify educational topics correctly', async () => {
      const request = createMockRequest({
        message: 'fotossíntese'
      })

      const response = await classifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.classification).toBeDefined()
      expect(typeof data.classification).toBe('string')
    })

    test('should handle different subject areas', async () => {
      const testCases = [
        { input: 'equação do segundo grau', expected: 'matematica' },
        { input: 'segunda guerra mundial', expected: 'historia' },
        { input: 'como fazer uma redação', expected: 'portugues' },
        { input: 'sistema digestório', expected: 'ciencias' }
      ]

      for (const testCase of testCases) {
        const request = createMockRequest({
          message: testCase.input
        })

        const response = await classifyPOST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.classification).toBeDefined()
      }
    })

    test('should handle rate limiting gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        ErrorSimulator.simulateRateLimit()
      )

      const request = createMockRequest({
        message: 'test topic'
      })

      const response = await classifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.classification).toBe('simples') // Should fallback
    })

    test('should meet performance requirements', async () => {
      const request = createMockRequest({
        message: 'performance test'
      })

      const { duration } = await PerformanceTestHelper.measureAsync(async () => {
        return await classifyPOST(request)
      })

      expect(duration).toBeLessThan(3000) // Should complete in < 3 seconds
    })
  })

  describe('Professor Generation API', () => {
    test('should generate lesson content successfully', async () => {
      const request = createMockRequest({
        topic: 'fotossíntese',
        level: 'medio',
        gamified: false
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.response).toBeDefined()
    })

    test('should generate gamified content when requested', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(TestDataFactory.createLesson())
          }
        }]
      })

      const request = createMockRequest({
        topic: 'matemática',
        level: 'medio',
        gamified: true
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.type).toBe('gamified')
    })

    test('should fallback to simple content when gamified fails', async () => {
      mockOpenAI.chat.completions.create
        .mockRejectedValueOnce(new Error('Gamified generation failed'))
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: 'Simple lesson content'
            }
          }]
        })

      const request = createMockRequest({
        topic: 'história',
        level: 'medio',
        gamified: true
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.type).toBe('simple')
    })

    test('should handle quota exceeded error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        ErrorSimulator.simulateQuotaExceeded()
      )

      const request = createMockRequest({
        topic: 'química',
        level: 'medio'
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Cota de tokens excedida')
    })

    test('should meet performance requirements', async () => {
      const request = createMockRequest({
        topic: 'performance test',
        level: 'medio'
      })

      const { duration } = await PerformanceTestHelper.measureAsync(async () => {
        return await professorPOST(request)
      })

      expect(duration).toBeLessThan(8000) // Should complete in < 8 seconds
    })
  })

  describe('ENEM API', () => {
    test('should generate ENEM items successfully', async () => {
      const request = createMockRequest({
        startIndex: 0,
        count: 5,
        area: 'matematica'
      })

      const response = await enemPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.items)).toBe(true)
    })

    test('should validate request parameters', async () => {
      const request = createMockRequest({
        startIndex: 0,
        count: 15, // Invalid count > 10
        area: 'matematica'
      })

      const response = await enemPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid request parameters')
    })

    test('should generate fallback items when AI fails', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('AI generation failed')
      )

      const request = createMockRequest({
        startIndex: 0,
        count: 5,
        area: 'ciencias'
      })

      const response = await enemPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.source).toBe('fallback')
    })

    test('should handle different subject areas', async () => {
      const areas = ['matematica', 'ciencias', 'historia', 'portugues']

      for (const area of areas) {
        const request = createMockRequest({
          startIndex: 0,
          count: 3,
          area
        })

        const response = await enemPOST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      }
    })
  })

  describe('Image API', () => {
    test('should return image URL for valid prompt', async () => {
      const request = createMockGetRequest({
        prompt: 'fotossíntese'
      })

      const response = await imageGET(request)

      expect(response.status).toBe(302) // Redirect to image
      expect(response.headers.get('location')).toContain('example.com')
    })

    test('should handle empty prompt', async () => {
      const request = createMockGetRequest({})

      const response = await imageGET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Prompt is required')
    })

    test('should clean and optimize prompts', async () => {
      const request = createMockGetRequest({
        prompt: 'FOTOSSÍNTESE!!!'
      })

      await imageGET(request)

      expect(mockUnsplash.searchPhotos).toHaveBeenCalledWith(
        'fotossintese',
        1,
        1
      )
    })

    test('should fallback to placeholder when Unsplash fails', async () => {
      mockUnsplash.searchPhotos.mockRejectedValue(
        new Error('Unsplash API error')
      )
      mockUnsplash.getEducationPhotos.mockRejectedValue(
        new Error('Unsplash API error')
      )

      const request = createMockGetRequest({
        prompt: 'test prompt'
      })

      const response = await imageGET(request)

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('via.placeholder.com')
    })

    test('should meet performance requirements', async () => {
      const request = createMockGetRequest({
        prompt: 'performance test'
      })

      const { duration } = await PerformanceTestHelper.measureAsync(async () => {
        return await imageGET(request)
      })

      expect(duration).toBeLessThan(2000) // Should complete in < 2 seconds
    })
  })

  describe('Telemetry API', () => {
    test('should accept valid telemetry events', async () => {
      const event = {
        event: 'user_interaction',
        timestamp: Date.now(),
        sessionId: 'test-session',
        properties: {
          action: 'click',
          target: 'button'
        },
        metadata: {
          userAgent: 'test-agent',
          url: 'http://localhost:3000',
          viewport: { width: 1920, height: 1080 }
        }
      }

      const request = createMockRequest(event)

      const response = await telemetryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    test('should validate event structure', async () => {
      const invalidEvent = {
        // Missing required fields
        properties: {}
      }

      const request = createMockRequest(invalidEvent)

      const response = await telemetryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid event structure')
    })

    test('should sanitize sensitive data', async () => {
      const event = {
        event: 'lesson_generation',
        timestamp: Date.now(),
        sessionId: 'test-session',
        properties: {
          input: 'a'.repeat(200), // Long input
          prompt: 'b'.repeat(100) // Long prompt
        },
        metadata: {
          userAgent: 'test-agent',
          url: 'http://localhost:3000',
          referrer: 'sensitive-referrer',
          viewport: { width: 1920, height: 1080 }
        }
      }

      const request = createMockRequest(event)

      const response = await telemetryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle network timeouts consistently', async () => {
      mockOpenAI.chat.completions.create.mockImplementation(() =>
        ErrorSimulator.simulateTimeout()
      )

      const request = createMockRequest({
        message: 'timeout test'
      })

      const response = await classifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.classification).toBe('simples') // Should fallback
    })

    test('should handle network errors consistently', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        ErrorSimulator.simulateNetworkError()
      )

      const request = createMockRequest({
        topic: 'network test',
        level: 'medio'
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Erro de conexão')
    })

    test('should handle invalid responses gracefully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'invalid_response_format'
          }
        }]
      })

      const request = createMockRequest({
        message: 'invalid response test'
      })

      const response = await classifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.classification).toBe('simples') // Should fallback
    })
  })

  describe('Performance Integration', () => {
    test('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        createMockRequest({
          message: `concurrent test ${i}`
        })
      )

      const startTime = Date.now()
      const responses = await Promise.all(
        requests.map(req => classifyPOST(req))
      )
      const totalTime = Date.now() - startTime

      expect(responses).toHaveLength(10)
      expect(totalTime).toBeLessThan(10000) // Should handle 10 requests in < 10 seconds

      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })

    test('should maintain performance under load', async () => {
      const request = createMockRequest({
        topic: 'load test',
        level: 'medio'
      })

      // Simulate multiple requests
      const promises = Array.from({ length: 5 }, () =>
        PerformanceTestHelper.measureAsync(async () => {
          return await professorPOST(request)
        })
      )

      const results = await Promise.all(promises)

      results.forEach(({ duration }) => {
        expect(duration).toBeLessThan(8000) // Each request should complete in < 8 seconds
      })
    })
  })
})
