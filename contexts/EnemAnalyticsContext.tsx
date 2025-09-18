'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { EnemItem, EnemResponse, EnemScore } from '@/types/enem'

// Analytics Event Types
type AnalyticsEventType = 
  | 'session_start'
  | 'session_end'
  | 'question_view'
  | 'question_answer'
  | 'question_flag'
  | 'navigation'
  | 'time_warning'
  | 'tab_switch'
  | 'error'
  | 'performance_metric'

// Analytics Event Interface
interface AnalyticsEvent {
  id: string
  type: AnalyticsEventType
  timestamp: Date
  sessionId: string
  userId?: string
  metadata: Record<string, any>
}

// Performance Metrics Interface
interface PerformanceMetrics {
  responseTime: number
  memoryUsage: number
  networkLatency: number
  errorRate: number
  userEngagement: number
  sessionDuration: number
  questionsPerMinute: number
  accuracyRate: number
}

// Learning Analytics Interface
interface LearningAnalytics {
  subjectPerformance: Record<string, {
    correct: number
    total: number
    averageTime: number
    difficultyBreakdown: {
      easy: { correct: number; total: number }
      medium: { correct: number; total: number }
      hard: { correct: number; total: number }
    }
  }>
  topicMastery: Record<string, number>
  learningVelocity: number
  retentionRate: number
  improvementAreas: string[]
  strengths: string[]
}

// Predictive Analytics Interface
interface PredictiveAnalytics {
  predictedScore: number
  confidence: number
  recommendedFocus: string[]
  estimatedStudyTime: number
  successProbability: number
  riskFactors: string[]
}

// Context Interface
interface EnemAnalyticsContextType {
  // State
  events: AnalyticsEvent[]
  metrics: PerformanceMetrics
  learningAnalytics: LearningAnalytics | null
  predictiveAnalytics: PredictiveAnalytics | null
  
  // Actions
  trackEvent: (type: AnalyticsEventType, metadata?: Record<string, any>) => void
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void
  analyzeLearning: (responses: EnemResponse[], items: EnemItem[]) => Promise<void>
  generatePredictions: (responses: EnemResponse[], items: EnemItem[]) => Promise<void>
  exportAnalytics: () => Promise<string>
  clearAnalytics: () => void
  
  // Insights
  getInsights: () => {
    performance: string[]
    learning: string[]
    recommendations: string[]
  }
}

// Initial State
const initialMetrics: PerformanceMetrics = {
  responseTime: 0,
  memoryUsage: 0,
  networkLatency: 0,
  errorRate: 0,
  userEngagement: 0,
  sessionDuration: 0,
  questionsPerMinute: 0,
  accuracyRate: 0
}

// Context
const EnemAnalyticsContext = createContext<EnemAnalyticsContextType | null>(null)

// Provider Component
export function EnemAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics>(initialMetrics)
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics | null>(null)
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics | null>(null)

  // Track Event
  const trackEvent = useCallback((type: AnalyticsEventType, metadata: Record<string, any> = {}) => {
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      sessionId: metadata.sessionId || 'unknown',
      userId: metadata.userId,
      metadata
    }

    setEvents(prev => [...prev, event])

    // Send to analytics service (if configured)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', type, {
        event_category: 'enem_simulator',
        event_label: metadata.label || type,
        value: metadata.value || 0,
        ...metadata
      })
    }
  }, [])

  // Update Metrics
  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }))
  }, [])

  // Analyze Learning
  const analyzeLearning = useCallback(async (responses: EnemResponse[], items: EnemItem[]) => {
    try {
      const subjectPerformance: Record<string, any> = {}
      const topicMastery: Record<string, number> = {}
      
      // Group responses by subject
      responses.forEach(response => {
        const item = items.find(i => i.item_id === response.item_id)
        if (!item) return

        const subject = item.area
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = {
            correct: 0,
            total: 0,
            averageTime: 0,
            difficultyBreakdown: {
              easy: { correct: 0, total: 0 },
              medium: { correct: 0, total: 0 },
              hard: { correct: 0, total: 0 }
            }
          }
        }

        const perf = subjectPerformance[subject]
        perf.total++
        if (response.is_correct) {
          perf.correct++
        }
        perf.averageTime += response.time_spent

        // Difficulty breakdown
        const difficulty = item.estimated_difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
        perf.difficultyBreakdown[difficulty].total++
        if (response.is_correct) {
          perf.difficultyBreakdown[difficulty].correct++
        }

        // Topic mastery
        const topic = item.topic
        if (!topicMastery[topic]) {
          topicMastery[topic] = 0
        }
        topicMastery[topic] += response.is_correct ? 1 : -0.5
      })

      // Calculate averages
      Object.keys(subjectPerformance).forEach(subject => {
        const perf = subjectPerformance[subject]
        perf.averageTime = perf.averageTime / perf.total
      })

      // Calculate learning velocity (questions per minute)
      const totalTime = responses.reduce((sum, r) => sum + r.time_spent, 0)
      const learningVelocity = totalTime > 0 ? (responses.length / (totalTime / 60)) : 0

      // Calculate retention rate (based on recent performance)
      const recentResponses = responses.slice(-10)
      const recentCorrect = recentResponses.filter(r => r.is_correct).length
      const retentionRate = recentResponses.length > 0 ? recentCorrect / recentResponses.length : 0

      // Identify improvement areas and strengths
      const improvementAreas: string[] = []
      const strengths: string[] = []

      Object.entries(subjectPerformance).forEach(([subject, perf]) => {
        const accuracy = perf.correct / perf.total
        if (accuracy < 0.6) {
          improvementAreas.push(subject)
        } else if (accuracy > 0.8) {
          strengths.push(subject)
        }
      })

      const analytics: LearningAnalytics = {
        subjectPerformance,
        topicMastery,
        learningVelocity,
        retentionRate,
        improvementAreas,
        strengths
      }

      setLearningAnalytics(analytics)
      trackEvent('learning_analysis', { analytics })
    } catch (error) {
      console.error('Error analyzing learning:', error)
      trackEvent('error', { error: error.message, context: 'learning_analysis' })
    }
  }, [trackEvent])

  // Generate Predictions
  const generatePredictions = useCallback(async (responses: EnemResponse[], items: EnemItem[]) => {
    try {
      // Simple prediction algorithm (can be enhanced with ML)
      const totalQuestions = items.length
      const answeredQuestions = responses.length
      const correctAnswers = responses.filter(r => r.is_correct).length
      
      if (answeredQuestions === 0) {
        setPredictiveAnalytics(null)
        return
      }

      const currentAccuracy = correctAnswers / answeredQuestions
      const estimatedTotalCorrect = currentAccuracy * totalQuestions
      
      // Simple score prediction (0-1000 scale)
      const predictedScore = Math.round((estimatedTotalCorrect / totalQuestions) * 1000)
      
      // Confidence based on number of answered questions
      const confidence = Math.min(answeredQuestions / totalQuestions, 1)
      
      // Identify areas needing focus
      const subjectAccuracy: Record<string, number> = {}
      responses.forEach(response => {
        const item = items.find(i => i.item_id === response.item_id)
        if (!item) return

        const subject = item.area
        if (!subjectAccuracy[subject]) {
          subjectAccuracy[subject] = { correct: 0, total: 0 }
        }
        subjectAccuracy[subject].total++
        if (response.is_correct) {
          subjectAccuracy[subject].correct++
        }
      })

      const recommendedFocus = Object.entries(subjectAccuracy)
        .filter(([_, acc]) => acc.total > 0 && (acc.correct / acc.total) < 0.6)
        .map(([subject, _]) => subject)

      // Estimate study time needed (in hours)
      const estimatedStudyTime = recommendedFocus.length * 2

      // Calculate success probability
      const successProbability = Math.min(currentAccuracy * 1.2, 1)

      // Identify risk factors
      const riskFactors: string[] = []
      if (currentAccuracy < 0.5) riskFactors.push('Low accuracy rate')
      if (answeredQuestions < totalQuestions * 0.5) riskFactors.push('Incomplete responses')
      if (recommendedFocus.length > 2) riskFactors.push('Multiple weak areas')

      const predictions: PredictiveAnalytics = {
        predictedScore,
        confidence,
        recommendedFocus,
        estimatedStudyTime,
        successProbability,
        riskFactors
      }

      setPredictiveAnalytics(predictions)
      trackEvent('prediction_generated', { predictions })
    } catch (error) {
      console.error('Error generating predictions:', error)
      trackEvent('error', { error: error.message, context: 'prediction_generation' })
    }
  }, [trackEvent])

  // Export Analytics
  const exportAnalytics = useCallback(async (): Promise<string> => {
    const exportData = {
      events,
      metrics,
      learningAnalytics,
      predictiveAnalytics,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(exportData, null, 2)
  }, [events, metrics, learningAnalytics, predictiveAnalytics])

  // Clear Analytics
  const clearAnalytics = useCallback(() => {
    setEvents([])
    setMetrics(initialMetrics)
    setLearningAnalytics(null)
    setPredictiveAnalytics(null)
  }, [])

  // Get Insights
  const getInsights = useCallback(() => {
    const performance: string[] = []
    const learning: string[] = []
    const recommendations: string[] = []

    // Performance insights
    if (metrics.responseTime > 2000) {
      performance.push('Response time is slower than optimal')
    }
    if (metrics.errorRate > 0.05) {
      performance.push('Error rate is higher than expected')
    }
    if (metrics.accuracyRate > 0.8) {
      performance.push('Excellent accuracy rate!')
    }

    // Learning insights
    if (learningAnalytics) {
      if (learningAnalytics.retentionRate > 0.8) {
        learning.push('Strong retention rate indicates good learning')
      }
      if (learningAnalytics.improvementAreas.length > 0) {
        learning.push(`Focus needed on: ${learningAnalytics.improvementAreas.join(', ')}`)
      }
      if (learningAnalytics.strengths.length > 0) {
        learning.push(`Strengths identified: ${learningAnalytics.strengths.join(', ')}`)
      }
    }

    // Recommendations
    if (predictiveAnalytics) {
      if (predictiveAnalytics.confidence < 0.5) {
        recommendations.push('Complete more questions for better predictions')
      }
      if (predictiveAnalytics.recommendedFocus.length > 0) {
        recommendations.push(`Study more: ${predictiveAnalytics.recommendedFocus.join(', ')}`)
      }
      if (predictiveAnalytics.successProbability > 0.8) {
        recommendations.push('High probability of success! Keep up the good work!')
      }
    }

    return { performance, learning, recommendations }
  }, [metrics, learningAnalytics, predictiveAnalytics])

  // Performance monitoring
  useEffect(() => {
    const startTime = Date.now()
    
    const updatePerformanceMetrics = () => {
      const currentTime = Date.now()
      const responseTime = currentTime - startTime
      
      // Memory usage (if available)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0
      
      updateMetrics({
        responseTime,
        memoryUsage,
        sessionDuration: currentTime - startTime
      })
    }

    const interval = setInterval(updatePerformanceMetrics, 5000)
    return () => clearInterval(interval)
  }, [updateMetrics])

  const contextValue: EnemAnalyticsContextType = {
    events,
    metrics,
    learningAnalytics,
    predictiveAnalytics,
    trackEvent,
    updateMetrics,
    analyzeLearning,
    generatePredictions,
    exportAnalytics,
    clearAnalytics,
    getInsights
  }

  return (
    <EnemAnalyticsContext.Provider value={contextValue}>
      {children}
    </EnemAnalyticsContext.Provider>
  )
}

// Hook
export function useEnemAnalytics() {
  const context = useContext(EnemAnalyticsContext)
  if (!context) {
    throw new Error('useEnemAnalytics must be used within an EnemAnalyticsProvider')
  }
  return context
}

