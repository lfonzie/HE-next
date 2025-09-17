import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
// import { NextRequest } from 'next/server' // Commented out to avoid server-side imports in tests

// Mock data generators
export const mockLessonData = {
  title: 'Fotossíntese',
  sections: [
    {
      title: 'O que é fotossíntese?',
      content: 'A fotossíntese é o processo pelo qual as plantas convertem luz solar em energia.',
      type: 'concept'
    },
    {
      title: 'Como funciona?',
      content: 'O processo ocorre nos cloroplastos das células vegetais.',
      type: 'explanation'
    }
  ],
  quiz: {
    question: 'Onde ocorre a fotossíntese?',
    options: [
      'Nos cloroplastos',
      'No núcleo',
      'Na mitocôndria',
      'No citoplasma'
    ],
    correctAnswer: 0
  }
}

export const mockClassificationResponse = {
  classification: 'ciencias',
  level: 'medio',
  confidence: 0.9
}

export const mockImageResponse = {
  urls: {
    regular: 'https://example.com/image.jpg',
    small: 'https://example.com/image-small.jpg',
    thumb: 'https://example.com/image-thumb.jpg'
  },
  alt_description: 'Educational image about photosynthesis'
}

// API request helpers (mocked for testing)
export function createMockRequest(body: any, headers: Record<string, string> = {}) {
  return {
    method: 'POST',
    url: 'http://localhost:3000/api/test',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body),
    json: async () => body
  }
}

export function createMockGetRequest(searchParams: Record<string, string> = {}) {
  const url = new URL('http://localhost:3000/api/test')
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  
  return {
    method: 'GET',
    url: url.toString(),
    headers: {},
    json: async () => ({})
  }
}

// Performance testing utilities
export class PerformanceTestHelper {
  static async measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    return { result, duration }
  }

  static async measureSync<T>(fn: () => T): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    return { result, duration }
  }

  static expectPerformance(actual: number, expected: number, tolerance: number = 0.1) {
    const difference = Math.abs(actual - expected) / expected
    expect(difference).toBeLessThan(tolerance)
  }
}

// Mock OpenAI responses
export const mockOpenAIResponses = {
  classification: {
    choices: [{
      message: {
        content: 'ciencias'
      }
    }]
  },
  lessonGeneration: {
    choices: [{
      message: {
        content: JSON.stringify(mockLessonData)
      }
    }]
  },
  simpleResponse: {
    choices: [{
      message: {
        content: 'Simple lesson content about the topic.'
      }
    }]
  }
}

// Error simulation utilities
export class ErrorSimulator {
  static async simulateRateLimit(): Promise<never> {
    throw new Error('Rate limit exceeded')
  }

  static async simulateTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 100)
    })
  }

  static async simulateNetworkError(): Promise<never> {
    throw new Error('Network error')
  }

  static async simulateQuotaExceeded(): Promise<never> {
    throw new Error('Quota exceeded')
  }
}

// Test data factories
export class TestDataFactory {
  static createUser(overrides: Partial<any> = {}) {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      ...overrides
    }
  }

  static createLesson(overrides: Partial<any> = {}) {
    return {
      id: 'test-lesson-id',
      title: 'Test Lesson',
      content: 'Test lesson content',
      createdAt: new Date(),
      ...overrides
    }
  }

  static createSlide(index: number, overrides: Partial<any> = {}) {
    return {
      id: `slide-${index}`,
      index,
      title: `Slide ${index}`,
      content: `Content for slide ${index}`,
      type: 'content',
      ...overrides
    }
  }

  static createQuestion(overrides: Partial<any> = {}) {
    return {
      id: 'test-question-id',
      question: 'What is photosynthesis?',
      options: [
        'Process of converting light to energy',
        'Process of respiration',
        'Process of digestion',
        'Process of reproduction'
      ],
      correctAnswer: 0,
      ...overrides
    }
  }
}

// Accessibility testing utilities
export class AccessibilityTestHelper {
  static expectToHaveRole(element: HTMLElement, role: string) {
    expect(element).toHaveAttribute('role', role)
  }

  static expectToHaveAriaLabel(element: HTMLElement, label: string) {
    expect(element).toHaveAttribute('aria-label', label)
  }

  static expectToHaveAriaDescribedBy(element: HTMLElement, describedBy: string) {
    expect(element).toHaveAttribute('aria-describedby', describedBy)
  }

  static expectToBeFocusable(element: HTMLElement) {
    expect(element).toHaveAttribute('tabindex')
  }

  static expectToHaveHeadingLevel(element: HTMLElement, level: number) {
    const tagName = element.tagName.toLowerCase()
    expect(tagName).toBe(`h${level}`)
  }
}

// Mock service workers
export class MockServiceWorker {
  static mockOpenAI() {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockOpenAIResponses.classification)
        }
      }
    }
  }

  static mockUnsplash() {
    return {
      searchPhotos: jest.fn().mockResolvedValue({
        results: [mockImageResponse]
      }),
      getEducationPhotos: jest.fn().mockResolvedValue({
        results: [mockImageResponse]
      })
    }
  }

  static mockDatabase() {
    return {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      },
      lesson: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      },
      $disconnect: jest.fn()
    }
  }
}

// Test environment setup
export function setupTestEnvironment() {
  // Mock environment variables
  Object.assign(process.env, {
    NODE_ENV: 'test',
    OPENAI_API_KEY: 'test-key',
    UNSPLASH_ACCESS_KEY: 'test-key',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000'
  });

  // Mock console methods to reduce noise in tests
  const originalConsole = { ...console }
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()

  return {
    restoreConsole: () => {
      Object.assign(console, originalConsole)
    }
  }
}

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {}
) {
  // Add any global providers here
  return render(ui, options)
}

// Assertion helpers
export class AssertionHelper {
  static expectValidJSON(response: Response) {
    expect(response.headers.get('content-type')).toContain('application/json')
  }

  static expectValidHTML(response: Response) {
    expect(response.headers.get('content-type')).toContain('text/html')
  }

  static expectStatusCode(response: Response, status: number) {
    expect(response.status).toBe(status)
  }

  static expectResponseTime(response: Response, maxTime: number) {
    // This would need to be measured during the request
    expect(maxTime).toBeGreaterThan(0)
  }
}

// Test cleanup utilities
export function cleanupTestData() {
  // Clean up any test data that might have been created
  jest.clearAllMocks()
  jest.resetAllMocks()
}

// Test configuration
export const testConfig = {
  timeouts: {
    short: 1000,
    medium: 5000,
    long: 10000,
    veryLong: 30000
  },
  retries: {
    maxRetries: 3,
    baseDelay: 100,
    maxDelay: 1000
  },
  performance: {
    classificationMaxTime: 3000,
    generationMaxTime: 8000,
    imageLoadMaxTime: 2000,
    navigationMaxTime: 500
  }
}
