'use client'

import { useCallback, useRef, useEffect } from 'react'
import { EnemItem, EnemResponse } from '@/types/enem'

// Worker Message Types
const MESSAGE_TYPES = {
  CALCULATE_PROFICIENCY: 'CALCULATE_PROFICIENCY',
  CALCULATE_SCORE: 'CALCULATE_SCORE',
  CALIBRATE_ITEM: 'CALIBRATE_ITEM',
  CALCULATE_INFORMATION: 'CALCULATE_INFORMATION',
  BATCH_CALCULATIONS: 'BATCH_CALCULATIONS'
}

// Worker Response Interface
interface WorkerResponse<T = any> {
  id: string
  type: 'SUCCESS' | 'ERROR'
  result?: T
  error?: {
    message: string
    stack?: string
  }
}

// TRI Calculation Results
interface ProficiencyResult {
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

interface ScoreResult {
  score: number
  proficiency: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  reliability: number
  standardError: number
}

interface CalibrationResult {
  itemId: string
  parameters: {
    discrimination: number
    difficulty: number
    guessing: number
  }
  fitStatistics: {
    chiSquare: number
    df: number
    pValue: number
    rmse: number
    infit: number
    outfit: number
  }
  quality: 'excellent' | 'good' | 'acceptable' | 'poor'
  iterations: number
  convergence: boolean
}

// Hook for TRI Worker
export function useTRIWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRequestsRef = useRef<Map<string, {
    resolve: (value: any) => void
    reject: (error: Error) => void
  }>>(new Map())

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      workerRef.current = new Worker('/workers/tri-calculator.js')
      
      workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const { id, type, result, error } = e.data
        const pendingRequest = pendingRequestsRef.current.get(id)
        
        if (pendingRequest) {
          pendingRequestsRef.current.delete(id)
          
          if (type === 'SUCCESS') {
            pendingRequest.resolve(result)
          } else {
            pendingRequest.reject(new Error(error?.message || 'Unknown worker error'))
          }
        }
      }
      
      workerRef.current.onerror = (error) => {
        console.error('TRI Worker error:', error)
        // Reject all pending requests
        pendingRequestsRef.current.forEach(({ reject }) => {
          reject(new Error('Worker error'))
        })
        pendingRequestsRef.current.clear()
      }
    } catch (error) {
      console.error('Failed to initialize TRI worker:', error)
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
      pendingRequestsRef.current.clear()
    }
  }, [])

  // Send message to worker
  const sendMessage = useCallback(<T>(type: string, data: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      pendingRequestsRef.current.set(id, { resolve, reject })
      
      workerRef.current.postMessage({
        id,
        type,
        data
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        const pendingRequest = pendingRequestsRef.current.get(id)
        if (pendingRequest) {
          pendingRequestsRef.current.delete(id)
          reject(new Error('Worker request timeout'))
        }
      }, 30000)
    })
  }, [])

  // Calculate proficiency
  const calculateProficiency = useCallback(async (
    responses: Array<{
      response: boolean
      parameters: {
        discrimination: number
        difficulty: number
        guessing: number
      }
    }>,
    initialProficiency: number = 0
  ): Promise<ProficiencyResult> => {
    return sendMessage<ProficiencyResult>(MESSAGE_TYPES.CALCULATE_PROFICIENCY, {
      responses,
      initialProficiency
    })
  }, [sendMessage])

  // Calculate ENEM score
  const calculateScore = useCallback(async (
    items: EnemItem[],
    responses: EnemResponse[]
  ): Promise<ScoreResult> => {
    return sendMessage<ScoreResult>(MESSAGE_TYPES.CALCULATE_SCORE, {
      items,
      responses
    })
  }, [sendMessage])

  // Calibrate item
  const calibrateItem = useCallback(async (
    itemId: string,
    responses: Array<{
      proficiency: number
      response: boolean
    }>,
    initialParameters?: {
      discrimination: number
      difficulty: number
      guessing: number
    }
  ): Promise<CalibrationResult> => {
    return sendMessage<CalibrationResult>(MESSAGE_TYPES.CALIBRATE_ITEM, {
      itemId,
      responses,
      initialParameters
    })
  }, [sendMessage])

  // Calculate test information
  const calculateInformation = useCallback(async (
    proficiency: number,
    items: Array<{
      discrimination: number
      difficulty: number
      guessing: number
    }>
  ): Promise<number> => {
    return sendMessage<number>(MESSAGE_TYPES.CALCULATE_INFORMATION, {
      proficiency,
      items
    })
  }, [sendMessage])

  // Batch calculations
  const batchCalculations = useCallback(async (
    calculations: Array<{
      type: 'proficiency' | 'score' | 'information'
      data: any
    }>
  ): Promise<any[]> => {
    return sendMessage<any[]>(MESSAGE_TYPES.BATCH_CALCULATIONS, {
      calculations
    })
  }, [sendMessage])

  // Check if worker is available
  const isWorkerAvailable = useCallback((): boolean => {
    return workerRef.current !== null
  }, [])

  // Get worker status
  const getWorkerStatus = useCallback(() => {
    return {
      isAvailable: isWorkerAvailable(),
      pendingRequests: pendingRequestsRef.current.size
    }
  }, [isWorkerAvailable])

  return {
    calculateProficiency,
    calculateScore,
    calibrateItem,
    calculateInformation,
    batchCalculations,
    isWorkerAvailable,
    getWorkerStatus
  }
}

// Hook for ENEM-specific TRI calculations
export function useEnemTRI() {
  const triWorker = useTRIWorker()

  // Calculate ENEM score with enhanced error handling
  const calculateEnemScore = useCallback(async (
    items: EnemItem[],
    responses: EnemResponse[]
  ): Promise<{
    success: boolean
    score?: ScoreResult
    error?: string
  }> => {
    try {
      if (!triWorker.isWorkerAvailable()) {
        throw new Error('TRI worker not available')
      }

      const score = await triWorker.calculateScore(items, responses)
      
      return {
        success: true,
        score
      }
    } catch (error) {
      console.error('Error calculating ENEM score:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, [triWorker])

  // Calculate proficiency for a specific area
  const calculateAreaProficiency = useCallback(async (
    areaItems: EnemItem[],
    areaResponses: EnemResponse[]
  ): Promise<{
    success: boolean
    proficiency?: ProficiencyResult
    error?: string
  }> => {
    try {
      if (!triWorker.isWorkerAvailable()) {
        throw new Error('TRI worker not available')
      }

      const responsePatterns = areaItems.map(item => {
        const response = areaResponses.find(r => r.item_id === item.item_id)
        
        const difficultyMap = {
          'EASY': -1.0,
          'MEDIUM': 0.0,
          'HARD': 1.0
        }
        
        const parameters = {
          discrimination: 1.0,
          difficulty: difficultyMap[item.estimated_difficulty as keyof typeof difficultyMap] || 0.0,
          guessing: 0.2
        }
        
        return {
          response: response ? response.is_correct : false,
          parameters
        }
      })

      const proficiency = await triWorker.calculateProficiency(responsePatterns)
      
      return {
        success: true,
        proficiency
      }
    } catch (error) {
      console.error('Error calculating area proficiency:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, [triWorker])

  // Batch calculate proficiencies for all areas
  const calculateAllAreaProficiencies = useCallback(async (
    items: EnemItem[],
    responses: EnemResponse[]
  ): Promise<Record<string, ProficiencyResult>> => {
    const areas = ['CN', 'CH', 'LC', 'MT']
    const results: Record<string, ProficiencyResult> = {}

    const calculations = areas.map(area => ({
      type: 'proficiency' as const,
      data: {
        responses: items
          .filter(item => item.area === area)
          .map(item => {
            const response = responses.find(r => r.item_id === item.item_id)
            
            const difficultyMap = {
              'EASY': -1.0,
              'MEDIUM': 0.0,
              'HARD': 1.0
            }
            
            const parameters = {
              discrimination: 1.0,
              difficulty: difficultyMap[item.estimated_difficulty as keyof typeof difficultyMap] || 0.0,
              guessing: 0.2
            }
            
            return {
              response: response ? response.is_correct : false,
              parameters
            }
          })
      }
    }))

    try {
      const batchResults = await triWorker.batchCalculations(calculations)
      
      areas.forEach((area, index) => {
        results[area] = batchResults[index]
      })
      
      return results
    } catch (error) {
      console.error('Error in batch calculation:', error)
      throw error
    }
  }, [triWorker])

  return {
    calculateEnemScore,
    calculateAreaProficiency,
    calculateAllAreaProficiencies,
    isWorkerAvailable: triWorker.isWorkerAvailable,
    getWorkerStatus: triWorker.getWorkerStatus
  }
}

