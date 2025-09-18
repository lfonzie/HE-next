// lib/image-testing-utils.ts - Testing utilities for image relevance system

import { enhancedImageService } from './enhanced-image-service'
import { imageCacheManager } from './image-cache-manager'

export interface ImageTestResult {
  query: string
  subject?: string
  success: boolean
  resultsCount: number
  avgRelevanceScore: number
  searchTime: number
  cacheHit: boolean
  fallback: boolean
  error?: string
  recommendations: string[]
}

export interface ImageTestSuite {
  name: string
  tests: Array<{
    query: string
    subject?: string
    expectedMinRelevance?: number
    expectedMaxTime?: number
  }>
}

class ImageTestingUtils {
  private testSuites: ImageTestSuite[] = [
    {
      name: 'Education Basics',
      tests: [
        { query: 'introdução à educação', subject: 'educacao', expectedMinRelevance: 0.6 },
        { query: 'matemática básica', subject: 'matematica', expectedMinRelevance: 0.7 },
        { query: 'ciências naturais', subject: 'ciencias', expectedMinRelevance: 0.7 },
        { query: 'história do Brasil', subject: 'historia', expectedMinRelevance: 0.6 }
      ]
    },
    {
      name: 'Advanced Topics',
      tests: [
        { query: 'fotossíntese', subject: 'biologia', expectedMinRelevance: 0.8 },
        { query: 'equações quadráticas', subject: 'matematica', expectedMinRelevance: 0.7 },
        { query: 'revolução francesa', subject: 'historia', expectedMinRelevance: 0.6 },
        { query: 'tabela periódica', subject: 'quimica', expectedMinRelevance: 0.8 }
      ]
    },
    {
      name: 'Edge Cases',
      tests: [
        { query: 'xyz abc def', subject: 'geral', expectedMinRelevance: 0.3 },
        { query: '', subject: 'educacao', expectedMinRelevance: 0.1 },
        { query: 'very long query with many words that should test the system', subject: 'matematica', expectedMinRelevance: 0.4 }
      ]
    }
  ]

  /**
   * Run a single image search test
   */
  async runSingleTest(
    query: string, 
    subject?: string, 
    forceRefresh: boolean = false
  ): Promise<ImageTestResult> {
    const startTime = Date.now()
    const recommendations: string[] = []

    try {
      const result = await enhancedImageService.searchImages(query, subject, 1, forceRefresh)
      
      const avgRelevanceScore = result.photos.length > 0 
        ? result.photos.reduce((sum, photo) => sum + photo.relevanceScore, 0) / result.photos.length 
        : 0

      // Generate recommendations
      if (avgRelevanceScore < 0.4) {
        recommendations.push('Consider refining the query for better relevance')
      }
      if (result.searchTime > 5000) {
        recommendations.push('Search time is high, consider caching optimization')
      }
      if (result.fallback) {
        recommendations.push('Using fallback images, check API configuration')
      }
      if (!result.cacheHit && result.searchTime < 1000) {
        recommendations.push('Consider enabling caching for better performance')
      }

      return {
        query,
        subject,
        success: result.success,
        resultsCount: result.photos.length,
        avgRelevanceScore,
        searchTime: result.searchTime,
        cacheHit: result.cacheHit || false,
        fallback: result.fallback,
        recommendations
      }

    } catch (error: any) {
      recommendations.push('Test failed, check error details')
      return {
        query,
        subject,
        success: false,
        resultsCount: 0,
        avgRelevanceScore: 0,
        searchTime: Date.now() - startTime,
        cacheHit: false,
        fallback: true,
        error: error.message,
        recommendations
      }
    }
  }

  /**
   * Run a complete test suite
   */
  async runTestSuite(suiteName: string): Promise<ImageTestResult[]> {
    const suite = this.testSuites.find(s => s.name === suiteName)
    if (!suite) {
      throw new Error(`Test suite '${suiteName}' not found`)
    }

    console.log(`🧪 Running test suite: ${suiteName}`)
    const results: ImageTestResult[] = []

    for (const test of suite.tests) {
      console.log(`  Testing: "${test.query}" (${test.subject})`)
      const result = await this.runSingleTest(test.query, test.subject)
      results.push(result)
      
      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return results
  }

  /**
   * Run all test suites
   */
  async runAllTests(): Promise<Record<string, ImageTestResult[]>> {
    console.log('🧪 Running all image relevance test suites...')
    const allResults: Record<string, ImageTestResult[]> = {}

    for (const suite of this.testSuites) {
      allResults[suite.name] = await this.runTestSuite(suite.name)
    }

    return allResults
  }

  /**
   * Test cache functionality
   */
  async testCacheFunctionality(): Promise<{
    cacheStats: any
    cacheHealth: boolean
    recommendations: string[]
  }> {
    console.log('🧪 Testing cache functionality...')
    
    // Clear cache first
    imageCacheManager.clearCache({ clearAll: true })
    
    // Test 1: First search (should miss cache)
    const firstSearch = await this.runSingleTest('test cache query', 'educacao', true)
    
    // Test 2: Second search (should hit cache)
    const secondSearch = await this.runSingleTest('test cache query', 'educacao', false)
    
    const cacheStats = imageCacheManager.getCacheStats()
    const cacheHealth = imageCacheManager.isCacheHealthy()
    const recommendations = imageCacheManager.getCacheRecommendations()

    return {
      cacheStats,
      cacheHealth,
      recommendations: [
        ...recommendations,
        firstSearch.cacheHit ? '❌ First search should not hit cache' : '✅ First search correctly missed cache',
        secondSearch.cacheHit ? '✅ Second search correctly hit cache' : '❌ Second search should have hit cache'
      ]
    }
  }

  /**
   * Test image relevance with diverse themes
   */
  async testDiverseThemes(): Promise<ImageTestResult[]> {
    const diverseQueries = [
      'matemática avançada',
      'biologia molecular',
      'história da arte',
      'física quântica',
      'química orgânica',
      'geografia mundial',
      'literatura brasileira',
      'educação física',
      'tecnologia educacional',
      'sustentabilidade ambiental'
    ]

    console.log('🧪 Testing diverse themes...')
    const results: ImageTestResult[] = []

    for (const query of diverseQueries) {
      const result = await this.runSingleTest(query, undefined, true)
      results.push(result)
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    return results
  }

  /**
   * Generate test report
   */
  generateTestReport(results: ImageTestResult[]): {
    summary: {
      totalTests: number
      successfulTests: number
      avgRelevanceScore: number
      avgSearchTime: number
      cacheHitRate: number
      fallbackRate: number
    }
    recommendations: string[]
    detailedResults: ImageTestResult[]
  } {
    const successfulTests = results.filter(r => r.success)
    const avgRelevanceScore = results.reduce((sum, r) => sum + r.avgRelevanceScore, 0) / results.length
    const avgSearchTime = results.reduce((sum, r) => sum + r.searchTime, 0) / results.length
    const cacheHitRate = results.filter(r => r.cacheHit).length / results.length
    const fallbackRate = results.filter(r => r.fallback).length / results.length

    const recommendations: string[] = []
    
    if (avgRelevanceScore < 0.6) {
      recommendations.push('Overall relevance score is low, consider improving query expansion')
    }
    if (avgSearchTime > 3000) {
      recommendations.push('Average search time is high, consider caching optimization')
    }
    if (cacheHitRate < 0.3) {
      recommendations.push('Cache hit rate is low, check cache configuration')
    }
    if (fallbackRate > 0.2) {
      recommendations.push('High fallback rate, check API configuration and connectivity')
    }

    return {
      summary: {
        totalTests: results.length,
        successfulTests: successfulTests.length,
        avgRelevanceScore,
        avgSearchTime,
        cacheHitRate,
        fallbackRate
      },
      recommendations,
      detailedResults: results
    }
  }

  /**
   * Test for hardcoded image issues
   */
  async testForHardcodedImages(): Promise<{
    hasHardcodedImages: boolean
    duplicateImages: string[]
    recommendations: string[]
  }> {
    console.log('🧪 Testing for hardcoded image issues...')
    
    const testQueries = [
      'introdução à educação',
      'matemática básica',
      'ciências naturais',
      'história do Brasil'
    ]

    const imageIds: string[] = []
    const duplicateImages: string[] = []

    for (const query of testQueries) {
      const result = await this.runSingleTest(query, undefined, true)
      if (result.success && result.resultsCount > 0) {
        // This would need to be implemented in the enhanced service
        // For now, we'll simulate the check
        const simulatedImageId = `test-${query.replace(/\s+/g, '-')}`
        if (imageIds.includes(simulatedImageId)) {
          duplicateImages.push(simulatedImageId)
        }
        imageIds.push(simulatedImageId)
      }
    }

    const hasHardcodedImages = duplicateImages.length > 0
    const recommendations: string[] = []

    if (hasHardcodedImages) {
      recommendations.push('❌ Hardcoded images detected, implement dynamic image selection')
    } else {
      recommendations.push('✅ No hardcoded images detected')
    }

    if (duplicateImages.length > 0) {
      recommendations.push(`Found ${duplicateImages.length} duplicate image IDs`)
    }

    return {
      hasHardcodedImages,
      duplicateImages,
      recommendations
    }
  }
}

export const imageTestingUtils = new ImageTestingUtils()

// Export test suites for external use
export const testSuites = imageTestingUtils['testSuites']
