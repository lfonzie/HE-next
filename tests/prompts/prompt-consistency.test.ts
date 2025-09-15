import { OpenAI } from 'openai'

// Mock OpenAI for testing
jest.mock('openai')

describe('Prompt Consistency Tests', () => {
  let mockOpenAI: jest.Mocked<OpenAI>

  beforeEach(() => {
    mockOpenAI = new OpenAI() as jest.Mocked<OpenAI>
  })

  describe('Classification Consistency', () => {
    const testCases = [
      {
        input: 'fotossíntese',
        expectedClassification: 'ciencias',
        expectedLevel: 'medio',
        description: 'Biology topic should be classified as science/medium'
      },
      {
        input: 'equação do segundo grau',
        expectedClassification: 'matematica',
        expectedLevel: 'medio',
        description: 'Math topic should be classified as mathematics/medium'
      },
      {
        input: 'segunda guerra mundial',
        expectedClassification: 'historia',
        expectedLevel: 'medio',
        description: 'History topic should be classified as history/medium'
      },
      {
        input: 'como fazer uma redação',
        expectedClassification: 'portugues',
        expectedLevel: 'medio',
        description: 'Writing topic should be classified as Portuguese/medium'
      }
    ]

    testCases.forEach(({ input, expectedClassification, expectedLevel, description }) => {
      test(`should consistently classify "${input}" as ${expectedClassification}/${expectedLevel}`, async () => {
        // Test multiple times to ensure consistency
        const classifications = []
        
        for (let i = 0; i < 5; i++) {
          const response = await classifyTopic(input)
          classifications.push(response)
        }

        // All classifications should be identical
        const uniqueClassifications = new Set(classifications.map(c => `${c.subject}/${c.level}`))
        expect(uniqueClassifications.size).toBe(1)
        
        const classification = classifications[0]
        expect(classification.subject).toBe(expectedClassification)
        expect(classification.level).toBe(expectedLevel)
      })
    })
  })

  describe('Anti-Repetition System', () => {
    test('should generate distinct content for similar inputs', async () => {
      const similarInputs = [
        'fotossíntese',
        'processo de fotossíntese',
        'como funciona a fotossíntese',
        'fotossíntese nas plantas'
      ]

      const responses = await Promise.all(
        similarInputs.map(input => generateLessonContent(input))
      )

      // Check that responses are sufficiently different
      const responseTexts = responses.map(r => r.content)
      const similarityThreshold = 0.8 // 80% similarity threshold

      for (let i = 0; i < responseTexts.length; i++) {
        for (let j = i + 1; j < responseTexts.length; j++) {
          const similarity = calculateSimilarity(responseTexts[i], responseTexts[j])
          expect(similarity).toBeLessThan(similarityThreshold)
        }
      }
    })

    test('should respect length limitations', async () => {
      const longInput = 'fotossíntese ' + 'muito importante '.repeat(50)
      
      const response = await generateLessonContent(longInput)
      
      // Content should be truncated appropriately
      expect(response.content.length).toBeLessThanOrEqual(4000) // Max tokens limit
      expect(response.content).toContain('fotossíntese') // Should still contain core topic
    })
  })

  describe('Quality Scoring', () => {
    test('should score high-quality educational content appropriately', async () => {
      const highQualityInputs = [
        'fotossíntese',
        'equação quadrática',
        'segunda guerra mundial',
        'sistema digestório'
      ]

      for (const input of highQualityInputs) {
        const response = await generateLessonContent(input)
        const qualityScore = await calculateQualityScore(response.content)
        
        expect(qualityScore).toBeGreaterThanOrEqual(0.8) // High quality threshold
        expect(qualityScore).toBeLessThanOrEqual(1.0)
      }
    })

    test('should detect and score low-quality content appropriately', async () => {
      const lowQualityInputs = [
        'asdfghjkl', // Random characters
        'teste teste teste', // Repetitive content
        'a', // Too short
        'x'.repeat(1000) // Repetitive long content
      ]

      for (const input of lowQualityInputs) {
        const response = await generateLessonContent(input)
        const qualityScore = await calculateQualityScore(response.content)
        
        expect(qualityScore).toBeLessThan(0.5) // Low quality threshold
      }
    })
  })

  describe('Edge Case Handling', () => {
    test('should handle empty input gracefully', async () => {
      const response = await generateLessonContent('')
      
      expect(response.success).toBe(false)
      expect(response.error).toContain('invalid input')
    })

    test('should handle very long input appropriately', async () => {
      const veryLongInput = 'fotossíntese '.repeat(1000)
      
      const response = await generateLessonContent(veryLongInput)
      
      expect(response.success).toBe(true)
      expect(response.content.length).toBeLessThanOrEqual(4000)
    })

    test('should handle special characters and emojis', async () => {
      const specialInputs = [
        'fotossíntese 🌱',
        'matemática + física = 🧮',
        'história do Brasil 🇧🇷',
        'química orgânica ⚗️'
      ]

      for (const input of specialInputs) {
        const response = await generateLessonContent(input)
        
        expect(response.success).toBe(true)
        expect(response.content).toBeDefined()
      }
    })
  })
})

// Helper functions for testing
async function classifyTopic(input: string) {
  // Mock implementation - in real tests, this would call the actual API
  const mockResponse = {
    subject: 'ciencias',
    level: 'medio',
    confidence: 0.9
  }
  
  return mockResponse
}

async function generateLessonContent(input: string) {
  // Mock implementation - in real tests, this would call the actual API
  const mockResponse = {
    success: true,
    content: `Lesson about ${input}: This is educational content about the topic.`,
    qualityScore: 0.85
  }
  
  return mockResponse
}

function calculateSimilarity(text1: string, text2: string): number {
  // Simple similarity calculation using Jaccard similarity
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  return intersection.size / union.size
}

async function calculateQualityScore(content: string): Promise<number> {
  // Mock quality scoring - in real implementation, this would use AI or heuristics
  const factors = {
    length: content.length > 100 ? 1 : 0.5,
    structure: content.includes('1.') && content.includes('2.') ? 1 : 0.5,
    educationalTerms: /aprendizado|ensino|educação|conceito/i.test(content) ? 1 : 0.5,
    coherence: content.split('.').length > 3 ? 1 : 0.5
  }
  
  return Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length
}
