/**
 * TRI Calculator Web Worker
 * 
 * This worker handles TRI calculations in the background to avoid blocking the main thread.
 * It implements the Item Response Theory algorithms for proficiency estimation and scoring.
 */

// Worker message types
const MESSAGE_TYPES = {
  CALCULATE_PROFICIENCY: 'CALCULATE_PROFICIENCY',
  CALCULATE_SCORE: 'CALCULATE_SCORE',
  CALIBRATE_ITEM: 'CALIBRATE_ITEM',
  CALCULATE_INFORMATION: 'CALCULATE_INFORMATION',
  BATCH_CALCULATIONS: 'BATCH_CALCULATIONS'
}

// Default IRT parameters
const DEFAULT_PARAMETERS = {
  discrimination: 1.0,
  difficulty: 0.0,
  guessing: 0.2
}

// Constants
const MAX_ITERATIONS = 50
const CONVERGENCE_THRESHOLD = 0.001

/**
 * Calculate item response probability using 3PL model
 * P(θ) = c + (1-c) * exp(a(θ-b)) / (1 + exp(a(θ-b)))
 */
function calculateItemProbability(proficiency, parameters) {
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
function calculateItemInformation(proficiency, parameters) {
  const { discrimination, guessing } = parameters
  const probability = calculateItemProbability(proficiency, parameters)
  const q = 1 - probability
  
  const numerator = Math.pow(discrimination, 2) * probability * q * Math.pow(probability - guessing, 2)
  const denominator = Math.pow(1 - guessing, 2)
  
  return numerator / denominator
}

/**
 * Estimate proficiency using Maximum Likelihood Estimation (MLE)
 */
function estimateProficiency(responses, initialProficiency = 0) {
  let proficiency = initialProficiency
  let iterations = 0
  let convergence = false

  while (iterations < MAX_ITERATIONS && !convergence) {
    const oldProficiency = proficiency
    
    // Calculate first and second derivatives
    let firstDerivative = 0
    let secondDerivative = 0
    
    responses.forEach(({ response, parameters }) => {
      const probability = calculateItemProbability(proficiency, parameters)
      const information = calculateItemInformation(proficiency, parameters)
      
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
    if (Math.abs(proficiency - oldProficiency) < CONVERGENCE_THRESHOLD) {
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
 * Convert proficiency to ENEM score (0-1000 scale)
 */
function proficiencyToScore(proficiency) {
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
 * Calculate test information function
 */
function calculateTestInformation(proficiency, items) {
  return items.reduce((total, parameters) => {
    return total + calculateItemInformation(proficiency, parameters)
  }, 0)
}

/**
 * Calculate ENEM score with TRI
 */
function calculateEnemScore(items, responses) {
  const responsePatterns = items.map(item => {
    const response = responses.find(r => r.item_id === item.item_id)
    
    // Convert difficulty level to IRT difficulty
    const difficultyMap = {
      'EASY': -1.0,
      'MEDIUM': 0.0,
      'HARD': 1.0
    }
    
    const parameters = {
      discrimination: DEFAULT_PARAMETERS.discrimination,
      difficulty: difficultyMap[item.estimated_difficulty] || DEFAULT_PARAMETERS.difficulty,
      guessing: DEFAULT_PARAMETERS.guessing
    }
    
    return {
      itemId: item.item_id,
      response: response ? response.is_correct : false,
      timeSpent: response ? response.time_spent : 0,
      parameters
    }
  })

  const proficiencyResult = estimateProficiency(responsePatterns)
  const score = proficiencyToScore(proficiencyResult.proficiency)
  
  return {
    score,
    proficiency: proficiencyResult.proficiency,
    confidenceInterval: proficiencyResult.confidenceInterval,
    reliability: proficiencyResult.reliability,
    standardError: proficiencyResult.standardError
  }
}

/**
 * Calibrate item parameters using EM algorithm
 */
function calibrateItem(itemId, responses, initialParameters = DEFAULT_PARAMETERS) {
  let parameters = { ...initialParameters }
  let iterations = 0
  let convergence = false

  while (iterations < MAX_ITERATIONS && !convergence) {
    const oldParameters = { ...parameters }
    
    // E-step: Calculate expected responses
    const expectedResponses = responses.map(({ proficiency, response }) => {
      const probability = calculateItemProbability(proficiency, parameters)
      return {
        proficiency,
        expected: probability,
        observed: response ? 1 : 0
      }
    })
    
    // M-step: Update parameters
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
    
    if (diff < CONVERGENCE_THRESHOLD) {
      convergence = true
    }
    
    iterations++
  }

  // Calculate fit statistics
  const fitStatistics = calculateFitStatistics(responses, parameters)
  
  // Determine quality
  let quality = 'poor'
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
    quality,
    iterations,
    convergence
  }
}

/**
 * Calculate fit statistics for item calibration
 */
function calculateFitStatistics(responses, parameters) {
  const n = responses.length
  let chiSquare = 0
  let rmse = 0
  
  responses.forEach(({ proficiency, response }) => {
    const expected = calculateItemProbability(proficiency, parameters)
    const observed = response ? 1 : 0
    
    // Chi-square
    chiSquare += Math.pow(observed - expected, 2) / (expected * (1 - expected))
    
    // RMSE
    rmse += Math.pow(observed - expected, 2)
  })
  
  rmse = Math.sqrt(rmse / n)
  
  // Simplified infit/outfit
  const infit = 1 - rmse
  const outfit = infit
  
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
 * Handle worker messages
 */
self.onmessage = function(e) {
  const { type, data, id } = e.data
  
  try {
    let result
    
    switch (type) {
      case MESSAGE_TYPES.CALCULATE_PROFICIENCY:
        result = estimateProficiency(data.responses, data.initialProficiency)
        break
        
      case MESSAGE_TYPES.CALCULATE_SCORE:
        result = calculateEnemScore(data.items, data.responses)
        break
        
      case MESSAGE_TYPES.CALIBRATE_ITEM:
        result = calibrateItem(data.itemId, data.responses, data.initialParameters)
        break
        
      case MESSAGE_TYPES.CALCULATE_INFORMATION:
        result = calculateTestInformation(data.proficiency, data.items)
        break
        
      case MESSAGE_TYPES.BATCH_CALCULATIONS:
        result = data.calculations.map(calc => {
          switch (calc.type) {
            case 'proficiency':
              return estimateProficiency(calc.data.responses, calc.data.initialProficiency)
            case 'score':
              return calculateEnemScore(calc.data.items, calc.data.responses)
            case 'information':
              return calculateTestInformation(calc.data.proficiency, calc.data.items)
            default:
              throw new Error(`Unknown calculation type: ${calc.type}`)
          }
        })
        break
        
      default:
        throw new Error(`Unknown message type: ${type}`)
    }
    
    // Send result back to main thread
    self.postMessage({
      id,
      type: 'SUCCESS',
      result
    })
    
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      type: 'ERROR',
      error: {
        message: error.message,
        stack: error.stack
      }
    })
  }
}

// Export message types for main thread
self.MESSAGE_TYPES = MESSAGE_TYPES

