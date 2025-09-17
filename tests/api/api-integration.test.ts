import { NextRequest } from 'next/server'
import { POST as classifyPOST } from '@/app/api/router/classify/route'
import { POST as professorPOST } from '@/app/api/professor/generate/route'
import { POST as enemPOST } from '@/app/api/enem/route'
import { GET as imageGET } from '@/app/api/image/route'

// Mock external services
jest.mock('openai')
jest.mock('@/lib/unsplash')

describe('API Integration Tests', () => {
  describe('Classification API Fallbacks', () => {
    test('should handle OpenAI rate limit gracefully', async () => {
      // Mock OpenAI rate limit error
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('Rate limit exceeded'))
          }
        }
      }))

      const request = new NextRequest('http://localhost:3000/api/router/classify', {
        method: 'POST',
        body: JSON.stringify({ message: 'fotossíntese' })
      })

      const response = await classifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.classification).toBe('simples') // Should fallback to simple
    })

    test('should handle OpenAI timeout gracefully', async () => {
      // Mock OpenAI timeout
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockImplementation(() => 
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 100)
              )
            )
          }
        }
      }))

      const request = new NextRequest('http://localhost:3000/api/router/classify', {
        method: 'POST',
        body: JSON.stringify({ message: 'matemática' })
      })

      const response = await classifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.classification).toBe('simples') // Should fallback to simple
    })

    test('should handle invalid classification responses', async () => {
      // Mock invalid response
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'invalid_response' } }]
            })
          }
        }
      }))

      const request = new NextRequest('http://localhost:3000/api/router/classify', {
        method: 'POST',
        body: JSON.stringify({ message: 'história' })
      })

      const response = await classifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.classification).toBe('simples') // Should fallback to simple
    })
  })

  describe('Professor API Fallbacks', () => {
    test('should fallback to simple response when gamified fails', async () => {
      // Mock gamified generation failure
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn()
              .mockRejectedValueOnce(new Error('Gamified generation failed'))
              .mockResolvedValueOnce({
                choices: [{ message: { content: 'Simple lesson content' } }]
              })
          }
        }
      }))

      const request = new NextRequest('http://localhost:3000/api/professor/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          topic: 'fotossíntese',
          level: 'medio',
          gamified: true
        })
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.type).toBe('simple') // Should fallback to simple
    })

    test('should handle quota exceeded error', async () => {
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('quota exceeded'))
          }
        }
      }))

      const request = new NextRequest('http://localhost:3000/api/professor/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          topic: 'matemática',
          level: 'medio'
        })
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Cota de tokens excedida')
    })

    test('should handle network errors gracefully', async () => {
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('network error'))
          }
        }
      }))

      const request = new NextRequest('http://localhost:3000/api/professor/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          topic: 'história',
          level: 'medio'
        })
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Erro de conexão')
    })
  })

  describe('ENEM API Fallbacks', () => {
    test('should generate fallback items when AI generation fails', async () => {
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('AI generation failed'))
          }
        }
      }))

      const request = new NextRequest('http://localhost:3000/api/enem', {
        method: 'POST',
        body: JSON.stringify({
          startIndex: 0,
          count: 5,
          area: 'matematica'
        })
      })

      const response = await enemPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.source).toBe('fallback')
      expect(data.items).toHaveLength(1) // Should generate 1 fallback item
    })

    test('should handle invalid request parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/enem', {
        method: 'POST',
        body: JSON.stringify({
          startIndex: 0,
          count: 15, // Invalid count > 10
          area: 'matematica'
        })
      })

      const response = await enemPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid request parameters')
    })
  })

  describe('Image API Fallbacks', () => {
    test('should fallback to placeholder when Unsplash fails', async () => {
      // Mock Unsplash failure
      const mockUnsplash = require('@/lib/unsplash').unsplashService
      mockUnsplash.searchPhotos.mockRejectedValue(new Error('Unsplash API error'))
      mockUnsplash.getEducationPhotos.mockRejectedValue(new Error('Unsplash API error'))

      const request = new NextRequest('http://localhost:3000/api/image?prompt=fotossíntese')

      const response = await imageGET(request)

      // Should redirect to placeholder
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('via.placeholder.com')
    })

    test('should handle empty prompt gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/image')

      const response = await imageGET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Prompt is required')
    })

    test('should clean and optimize prompts', async () => {
      const mockUnsplash = require('@/lib/unsplash').unsplashService
      mockUnsplash.searchPhotos.mockResolvedValue({
        results: [{ urls: { regular: 'https://example.com/image.jpg' } }]
      })

      const request = new NextRequest('http://localhost:3000/api/image?prompt=FOTOSSÍNTESE!!!')

      const response = await imageGET(request)

      expect(response.status).toBe(302)
      // Verify that the cleaned prompt was used
      expect(mockUnsplash.searchPhotos).toHaveBeenCalledWith('fotossintese', 1, 1)
    })
  })

  describe('Circuit Breaker Pattern', () => {
    test('should implement circuit breaker for OpenAI failures', async () => {
      // Mock consecutive failures
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('Service unavailable'))
          }
        }
      }))

      const requests = Array(5).fill(null).map(() => 
        new NextRequest('http://localhost:3000/api/professor/generate', {
          method: 'POST',
          body: JSON.stringify({ 
            topic: 'test',
            level: 'medio'
          })
        })
      )

      const responses = await Promise.all(requests.map(req => professorPOST(req)))
      
      // All should fail gracefully
      responses.forEach(response => {
        expect(response.status).toBe(500)
      })
    })
  })

  describe('Retry Logic', () => {
    test('should retry on transient failures', async () => {
      let attemptCount = 0
      const mockOpenAI = require('openai').OpenAI
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockImplementation(() => {
              attemptCount++
              if (attemptCount < 3) {
                throw new Error('Temporary failure')
              }
              return Promise.resolve({
                choices: [{ message: { content: 'Success after retry' } }]
              })
            })
          }
        }
      }))

      const request = new NextRequest('http://localhost:3000/api/professor/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          topic: 'test',
          level: 'medio'
        })
      })

      const response = await professorPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(attemptCount).toBe(3) // Should have retried
    })
  })
})
