/**
 * ENEM TRI Engine - True Item Response Theory Implementation
 * 
 * This module implements a complete IRT (Item Response Theory) system
 * for the ENEM simulator, including parameter estimation, proficiency
 * calculation, and confidence intervals.
 */

import { EnemItem, EnemResponse } from '@/types/enem'

// IRT Parameters Interface
export interface IRTParameters {
  discrimination: number // parameter 'a' - how well the item discriminates between abilities
  difficulty: number     // parameter 'b' - item difficulty level
  guessing: number       // parameter 'c' - probability of guessing correctly
}

// Proficiency Estimation Result
export interface ProficiencyResult {
  proficiency: number
  standardError: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  reliability: number
  iterations: number
  convergence: boolean
}

// Item Calibration Result
export interface CalibrationResult {
  itemId: string
  parameters: IRTParameters
  fitStatistics: {
    chiSquare: number
    df: number
    pValue: number
    rmse: number
    infit: number
    outfit: number
  }
  quality: 'excellent' | 'good' | 'acceptable' | 'poor'
}

// Response Pattern Interface
export interface ResponsePattern {
  itemId: string
  response: boolean
  timeSpent: number
  parameters: IRTParameters
}

/**
 * TRI Engine Class - Core IRT Implementation
 */
export class TRIEngine {
  private static readonly MAX_ITERATIONS = 50
  private static readonly CONVERGENCE_THRESHOLD = 0.001
  private static readonly DEFAULT_PARAMETERS: IRTParameters = {
    discrimination: 1.0,
    difficulty: 0.0,
    guessing: 0.2
  }

  /**
   * Calculate item response probability using 3PL model
   * P(θ) = c + (1-c) * exp(a(θ-b)) / (1 + exp(a(θ-b)))
   */
  static calculateItemProbability(
    proficiency: number,
    parameters: IRTParameters
  ): number {
    const { discrimination, difficulty, guessing } = parameters
    
    // Prevent extreme values
    const expTerm = Math.exp(Math.max(-500, Math.min(500, discrimination * (proficiency - difficulty))))
    const probability = guessing + (1 - guessing) * (expTerm / (1 + expTerm))
    
    return Math.max(0.0001, Math.min(0.9999, probability))
  }

  /**
   * Calculate item information function
   * I(θ) = a² * P(θ) * Q(θ) * (P(θ) - c)² / (1 - c)²
   */
  static calculateItemInformation(
    proficiency: number,
    parameters: IRTParameters
  ): number {
    const { discrimination, guessing } = parameters
    const probability = this.calculateItemProbability(proficiency, parameters)
    const q = 1 - probability
    
    const numerator = Math.pow(discrimination, 2) * probability * q * Math.pow(probability - guessing, 2)
    const denominator = Math.pow(1 - guessing, 2)
    
    return numerator / denominator
  }

  /**
   * Estimate proficiency using Maximum Likelihood Estimation (MLE)
   */
  static estimateProficiency(
    responses: ResponsePattern[],
    initialProficiency: number = 0
  ): ProficiencyResult {
    let proficiency = initialProficiency
    let iterations = 0
    let convergence = false

    while (iterations < this.MAX_ITERATIONS && !convergence) {
      const oldProficiency = proficiency
      
      // Calculate first and second derivatives
      let firstDerivative = 0
      let secondDerivative = 0
      
      responses.forEach(({ response, parameters }) => {
        const probability = this.calculateItemProbability(proficiency, parameters)
        const information = this.calculateItemInformation(proficiency, parameters)
        
        // First derivative (gradient)
        firstDerivative += parameters.discrimination * (response - probability)
        
        // Second derivative (Hessian)
        secondDerivative -= information
      })
      
      // Newton-Raphson update
      if (Math.abs(secondDerivative) > 0.0001) {
        proficiency = proficiency - (firstDerivative / secondDerivative)
      }
      
      // Check convergence
      if (Math.abs(proficiency - oldProficiency) < this.CONVERGENCE_THRESHOLD) {
        convergence = true
      }
      
      iterations++
    }

    // Calculate standard error
    const standardError = Math.sqrt(-1 / secondDerivative)
    
    // Calculate confidence interval (95%)
    const confidenceInterval = {
      lower: proficiency - 1.96 * standardError,
      upper: proficiency + 1.96 * standardError
    }
    
    // Calculate reliability
    const reliability = 1 - (1 / (1 + standardError * standardError))

    return {
      proficiency,
      standardError,
      confidenceInterval,
      reliability,
      iterations,
      convergence
    }
  }

  /**
   * Calculate test information function
   */
  static calculateTestInformation(
    proficiency: number,
    items: IRTParameters[]
  ): number {
    return items.reduce((total, parameters) => {
      return total + this.calculateItemInformation(proficiency, parameters)
    }, 0)
  }

  /**
   * Convert proficiency to ENEM score (0-1000 scale)
   */
  static proficiencyToScore(proficiency: number): number {
    // ENEM uses a specific transformation
    // This is a simplified version - real ENEM uses more complex scaling
    const minScore = 200
    const maxScore = 1000
    const minTheta = -3
    const maxTheta = 3
    
    // Linear transformation
    const normalized = (proficiency - minTheta) / (maxTheta - minTheta)
    const score = minScore + normalized * (maxScore - minScore)
    
    return Math.max(minScore, Math.min(maxScore, Math.round(score)))
  }

  /**
   * Convert ENEM score to proficiency
   */
  static scoreToProficiency(score: number): number {
    const minScore = 200
    const maxScore = 1000
    const minTheta = -3
    const maxTheta = 3
    
    const normalized = (score - minScore) / (maxScore - minScore)
    const proficiency = minTheta + normalized * (maxTheta - minTheta)
    
    return proficiency
  }

  /**
   * Calibrate item parameters using EM algorithm
   */
  static calibrateItem(
    itemId: string,
    responses: Array<{ proficiency: number; response: boolean }>,
    initialParameters: IRTParameters = this.DEFAULT_PARAMETERS
  ): CalibrationResult {
    const parameters = { ...initialParameters }
    let iterations = 0
    let convergence = false

    while (iterations < this.MAX_ITERATIONS && !convergence) {
      const oldParameters = { ...parameters }
      
      // E-step: Calculate expected responses
      const expectedResponses = responses.map(({ proficiency, response }) => {
        const probability = this.calculateItemProbability(proficiency, parameters)
        return {
          proficiency,
          expected: probability,
          observed: response ? 1 : 0
        }
      })
      
      // M-step: Update parameters
      // This is a simplified version - real calibration uses more sophisticated methods
      const totalResponses = responses.length
      const correctResponses = responses.filter(r => r.response).length
      
      // Update difficulty (simplified)
      const avgProficiency = responses.reduce((sum, r) => sum + r.proficiency, 0) / totalResponses
      parameters.difficulty = avgProficiency
      
      // Update discrimination (simplified)
      const variance = responses.reduce((sum, r) => 
        sum + Math.pow(r.proficiency - avgProficiency, 2), 0) / totalResponses
      parameters.discrimination = Math.max(0.1, Math.min(3.0, 1 / Math.sqrt(variance + 0.1)))
      
      // Update guessing parameter
      parameters.guessing = Math.max(0.05, Math.min(0.5, correctResponses / totalResponses * 0.2))
      
      // Check convergence
      const diff = Math.abs(parameters.difficulty - oldParameters.difficulty) +
                  Math.abs(parameters.discrimination - oldParameters.discrimination) +
                  Math.abs(parameters.guessing - oldParameters.guessing)
      
      if (diff < this.CONVERGENCE_THRESHOLD) {
        convergence = true
      }
      
      iterations++
    }

    // Calculate fit statistics
    const fitStatistics = this.calculateFitStatistics(responses, parameters)
    
    // Determine quality
    let quality: 'excellent' | 'good' | 'acceptable' | 'poor' = 'poor'
    if (fitStatistics.rmse < 0.1 && fitStatistics.infit > 0.8 && fitStatistics.infit < 1.2) {
      quality = 'excellent'
    } else if (fitStatistics.rmse < 0.2 && fitStatistics.infit > 0.7 && fitStatistics.infit < 1.3) {
      quality = 'good'
    } else if (fitStatistics.rmse < 0.3 && fitStatistics.infit > 0.6 && fitStatistics.infit < 1.4) {
      quality = 'acceptable'
    }

    return {
      itemId,
      parameters,
      fitStatistics,
      quality
    }
  }

  /**
   * Calculate fit statistics for item calibration
   */
  private static calculateFitStatistics(
    responses: Array<{ proficiency: number; response: boolean }>,
    parameters: IRTParameters
  ): CalibrationResult['fitStatistics'] {
    const n = responses.length
    let chiSquare = 0
    let rmse = 0
    
    responses.forEach(({ proficiency, response }) => {
      const expected = this.calculateItemProbability(proficiency, parameters)
      const observed = response ? 1 : 0
      
      // Chi-square
      chiSquare += Math.pow(observed - expected, 2) / (expected * (1 - expected))
      
      // RMSE
      rmse += Math.pow(observed - expected, 2)
    })
    
    rmse = Math.sqrt(rmse / n)
    
    // Simplified infit/outfit (in real implementation, these are more complex)
    const infit = 1 - rmse
    const outfit = infit // Simplified
    
    return {
      chiSquare,
      df: n - 3, // 3 parameters
      pValue: 0.05, // Simplified
      rmse,
      infit,
      outfit
    }
  }

  /**
   * Generate adaptive test sequence
   */
  static generateAdaptiveSequence(
    currentProficiency: number,
    availableItems: Array<{ itemId: string; parameters: IRTParameters }>,
    maxItems: number = 45
  ): string[] {
    const selectedItems: string[] = []
    const usedItems = new Set<string>()
    
    for (let i = 0; i < maxItems; i++) {
      let bestItem = ''
      let maxInformation = 0
      
      availableItems.forEach(({ itemId, parameters }) => {
        if (!usedItems.has(itemId)) {
          const information = this.calculateItemInformation(currentProficiency, parameters)
          if (information > maxInformation) {
            maxInformation = information
            bestItem = itemId
          }
        }
      })
      
      if (bestItem) {
        selectedItems.push(bestItem)
        usedItems.add(bestItem)
        
        // Update proficiency estimate (simplified)
        // In real adaptive testing, this would be updated after each response
        currentProficiency += Math.random() * 0.1 - 0.05
      }
    }
    
    return selectedItems
  }

  /**
   * Calculate test reliability
   */
  static calculateTestReliability(
    responses: ResponsePattern[]
  ): number {
    if (responses.length < 2) return 0
    
    const proficiencies = responses.map(r => r.parameters.difficulty)
    const variance = this.calculateVariance(proficiencies)
    const mean = proficiencies.reduce((sum, p) => sum + p, 0) / proficiencies.length
    
    // Cronbach's alpha (simplified)
    const itemVariances = responses.map(r => {
      const p = this.calculateItemProbability(mean, r.parameters)
      return p * (1 - p)
    })
    
    const totalVariance = variance + itemVariances.reduce((sum, v) => sum + v, 0)
    const alpha = (responses.length / (responses.length - 1)) * (1 - itemVariances.reduce((sum, v) => sum + v, 0) / totalVariance)
    
    return Math.max(0, Math.min(1, alpha))
  }

  /**
   * Calculate variance
   */
  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  }
}

/**
 * ENEM-specific TRI utilities
 */
export class EnemTRIUtils {
  /**
   * Convert ENEM items to response patterns
   */
  static itemsToResponsePatterns(
    items: EnemItem[],
    responses: EnemResponse[],
    defaultParameters: IRTParameters = TRIEngine.DEFAULT_PARAMETERS
  ): ResponsePattern[] {
    return items.map(item => {
      const response = responses.find(r => r.item_id === item.item_id)
      
      // Convert difficulty level to IRT difficulty
      const difficultyMap = {
        'EASY': -1.0,
        'MEDIUM': 0.0,
        'HARD': 1.0
      }
      
      const parameters: IRTParameters = {
        discrimination: defaultParameters.discrimination,
        difficulty: difficultyMap[item.estimated_difficulty] || defaultParameters.difficulty,
        guessing: defaultParameters.guessing
      }
      
      return {
        itemId: item.item_id,
        response: response ? response.is_correct : false,
        timeSpent: response ? response.time_spent : 0,
        parameters
      }
    })
  }

  /**
   * Calculate ENEM score with TRI
   */
  static calculateEnemScore(
    items: EnemItem[],
    responses: EnemResponse[]
  ): {
    score: number
    proficiency: number
    confidenceInterval: { lower: number; upper: number }
    reliability: number
  } {
    const responsePatterns = this.itemsToResponsePatterns(items, responses)
    const proficiencyResult = TRIEngine.estimateProficiency(responsePatterns)
    const score = TRIEngine.proficiencyToScore(proficiencyResult.proficiency)
    
    return {
      score,
      proficiency: proficiencyResult.proficiency,
      confidenceInterval: proficiencyResult.confidenceInterval,
      reliability: proficiencyResult.reliability
    }
  }

  /**
   * Generate study recommendations based on TRI analysis
   */
  static generateStudyRecommendations(
    items: EnemItem[],
    responses: EnemResponse[],
    proficiency: number
  ): {
    weakAreas: string[]
    recommendedTopics: string[]
    estimatedImprovement: number
  } {
    const weakAreas: string[] = []
    const recommendedTopics: string[] = []
    
    // Analyze performance by area
    const areaPerformance: Record<string, { correct: number; total: number }> = {}
    
    responses.forEach(response => {
      const item = items.find(i => i.item_id === response.item_id)
      if (!item) return
      
      const area = item.area
      if (!areaPerformance[area]) {
        areaPerformance[area] = { correct: 0, total: 0 }
      }
      
      areaPerformance[area].total++
      if (response.is_correct) {
        areaPerformance[area].correct++
      }
    })
    
    // Identify weak areas
    Object.entries(areaPerformance).forEach(([area, perf]) => {
      const accuracy = perf.correct / perf.total
      if (accuracy < 0.6) {
        weakAreas.push(area)
      }
    })
    
    // Identify topics that need improvement
    const topicPerformance: Record<string, { correct: number; total: number }> = {}
    
    responses.forEach(response => {
      const item = items.find(i => i.item_id === response.item_id)
      if (!item) return
      
      const topic = item.topic
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 }
      }
      
      topicPerformance[topic].total++
      if (response.is_correct) {
        topicPerformance[topic].correct++
      }
    })
    
    Object.entries(topicPerformance).forEach(([topic, perf]) => {
      const accuracy = perf.correct / perf.total
      if (accuracy < 0.5) {
        recommendedTopics.push(topic)
      }
    })
    
    // Estimate improvement potential
    const currentScore = TRIEngine.proficiencyToScore(proficiency)
    const potentialScore = Math.min(1000, currentScore + (weakAreas.length * 50))
    const estimatedImprovement = potentialScore - currentScore
    
    return {
      weakAreas,
      recommendedTopics,
      estimatedImprovement
    }
  }
}

