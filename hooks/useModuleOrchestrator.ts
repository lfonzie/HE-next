"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useModuleContext } from '@/contexts/ModuleContext'
import { useChatContext } from '@/contexts/ChatContext'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { ModuleType, Message as ChatMessageType } from '@/types'

export interface ModuleOrchestratorConfig {
  enableAutoClassification: boolean
  enableUserAdaptation: boolean
  enableModuleSwitching: boolean
  classificationThreshold: number
  maxHistoryLength: number
  enableCaching: boolean
  enableAnalytics: boolean
}

export interface ClassificationResult {
  module: string
  confidence: number
  reasoning: string
  suggestedModels: string[]
  alternatives: Array<{
    module: string
    confidence: number
    reasoning: string
  }>
}

export interface ModulePerformance {
  moduleId: string
  usageCount: number
  successRate: number
  averageResponseTime: number
  userSatisfaction: number
  lastUsed: number
  trends: {
    usage: number[]
    satisfaction: number[]
    responseTime: number[]
  }
}

export function useModuleOrchestrator(config: ModuleOrchestratorConfig = {
  enableAutoClassification: true,
  enableUserAdaptation: true,
  enableModuleSwitching: true,
  classificationThreshold: 0.7,
  maxHistoryLength: 10,
  enableCaching: true,
  enableAnalytics: true
}) {
  const {
    state: moduleState,
    classifyMessage,
    getModuleById,
    getEnabledModules,
    getModuleMetrics,
    updateModuleMetrics,
    getUserProfile,
    updateUserPreferences,
    findBestModule
  } = useModuleContext()

  const { setSelectedModule, setLastClassification } = useChatContext()
  const { notifyClassification, notifySuccess, notifyError } = useNotificationContext()

  const [isClassifying, setIsClassifying] = useState(false)
  const [classificationHistory, setClassificationHistory] = useState<ClassificationResult[]>([])
  const [userBehaviorPatterns, setUserBehaviorPatterns] = useState<Map<string, any>>(new Map())

  // Computed values
  const availableModules = useMemo(() => getEnabledModules(), [getEnabledModules])
  const modulePerformance = useMemo(() => {
    const performance: Record<string, ModulePerformance> = {}
    
    availableModules.forEach(module => {
      const metrics = getModuleMetrics(module.id)
      if (metrics) {
        performance[module.id] = {
          moduleId: module.id,
          usageCount: metrics.usageCount,
          successRate: metrics.successRate,
          averageResponseTime: metrics.averageResponseTime,
          userSatisfaction: metrics.userSatisfaction,
          lastUsed: metrics.lastUsed,
          trends: {
            usage: [metrics.usageCount],
            satisfaction: [metrics.userSatisfaction],
            responseTime: [metrics.averageResponseTime]
          }
        }
      }
    })
    
    return performance
  }, [availableModules, getModuleMetrics])

  // Actions
  const classifyUserMessage = useCallback(async (
    message: string,
    history: ChatMessageType[],
    userId?: string
  ): Promise<ClassificationResult> => {
    try {
      if (!config.enableAutoClassification) {
        return {
          module: 'atendimento',
          confidence: 1.0,
          reasoning: 'Auto-classification disabled',
          suggestedModels: ['gpt-3.5-turbo'],
          alternatives: []
        }
      }

      setIsClassifying(true)

      // Prepare history for classification
      const recentHistory = history.slice(-config.maxHistoryLength)
      
      // Call classification
      const result = await classifyMessage(message, recentHistory, userId)
      
      // Enhance result with alternatives
      const alternatives = availableModules
        .filter(m => m.id !== result.module)
        .map(module => ({
          module: module.id,
          confidence: Math.random() * 0.3, // Placeholder - should be calculated
          reasoning: `Alternative: ${module.description}`
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)

      const classificationResult: ClassificationResult = {
        ...result,
        alternatives
      }

      // Cache result if enabled
      if (config.enableCaching) {
        setClassificationHistory(prev => [classificationResult, ...prev.slice(0, 9)])
      }

      // Update user behavior patterns
      if (config.enableUserAdaptation && userId) {
        updateUserBehaviorPatterns(userId, message, classificationResult)
      }

      // Notify classification
      if (config.enableAnalytics) {
        notifyClassification(result.module, result.confidence)
      }

      return classificationResult
    } catch (error) {
      console.error('Error classifying message:', error)
      setIsClassifying(false)
      
      // Fallback classification
      return {
        module: 'atendimento',
        confidence: 0.5,
        reasoning: 'Fallback due to classification error',
        suggestedModels: ['gpt-3.5-turbo'],
        alternatives: []
      }
    } finally {
      setIsClassifying(false)
    }
  }, [
    config,
    classifyMessage,
    availableModules,
    notifyClassification
  ])

  const selectOptimalModule = useCallback(async (
    message: string,
    history: ChatMessageType[],
    userId?: string
  ): Promise<string> => {
    try {
      // Get user preferences
      let userPreferences: string[] = []
      if (userId && config.enableUserAdaptation) {
        const userProfile = getUserProfile(userId)
        userPreferences = userProfile?.preferredModules || []
      }

      // Classify message
      const classification = await classifyUserMessage(message, history, userId)
      
      // Check if confidence meets threshold
      if (classification.confidence >= config.classificationThreshold) {
        // Use classified module
        const selectedModule = classification.module
        
        // Update metrics
        if (config.enableAnalytics) {
          updateModuleMetrics(selectedModule, {
            usageCount: (getModuleMetrics(selectedModule)?.usageCount || 0) + 1
          })
        }

        return selectedModule
      } else {
        // Use user preferences or fallback
        if (userPreferences.length > 0) {
          return userPreferences[0]
        }
        
        // Use best module based on context
        const bestModule = findBestModule({ message, history, userId })
        return bestModule?.id || 'atendimento'
      }
    } catch (error) {
      console.error('Error selecting optimal module:', error)
      return 'atendimento'
    }
  }, [
    config,
    classifyUserMessage,
    getUserProfile,
    updateModuleMetrics,
    getModuleMetrics,
    findBestModule
  ])

  const switchModule = useCallback(async (
    fromModule: string,
    toModule: string,
    reason: string,
    userId?: string
  ) => {
    try {
      if (!config.enableModuleSwitching) {
        throw new Error('Module switching is disabled')
      }

      // Validate module exists
      const targetModule = getModuleById(toModule)
      if (!targetModule) {
        throw new Error(`Module ${toModule} not found`)
      }

      // Switch module
      setSelectedModule(toModule as ModuleType)
      
      // Update metrics
      if (config.enableAnalytics) {
        updateModuleMetrics(toModule, {
          usageCount: (getModuleMetrics(toModule)?.usageCount || 0) + 1
        })
      }

      // Update user preferences
      if (userId && config.enableUserAdaptation) {
        updateUserPreferences(userId, {
          preferredModules: [toModule, ...(getUserProfile(userId)?.preferredModules || [])]
            .filter((id, index, arr) => arr.indexOf(id) === index)
            .slice(0, 5)
        })
      }

      notifySuccess('Módulo Alterado', `Mudou de ${fromModule} para ${toModule}: ${reason}`)
      return true
    } catch (error) {
      console.error('Error switching module:', error)
      notifyError('Erro', 'Falha ao alterar módulo')
      throw error
    }
  }, [
    config,
    getModuleById,
    setSelectedModule,
    updateModuleMetrics,
    getModuleMetrics,
    updateUserPreferences,
    getUserProfile,
    notifySuccess,
    notifyError
  ])

  const updateUserBehaviorPatterns = useCallback((
    userId: string,
    message: string,
    classification: ClassificationResult
  ) => {
    try {
      const currentPatterns = userBehaviorPatterns.get(userId) || {
        messageTypes: [],
        preferredModules: [],
        interactionTimes: [],
        messageLengths: []
      }

      const updatedPatterns = {
        ...currentPatterns,
        messageTypes: [...currentPatterns.messageTypes, classification.module],
        preferredModules: [...currentPatterns.preferredModules, classification.module],
        interactionTimes: [...currentPatterns.interactionTimes, Date.now()],
        messageLengths: [...currentPatterns.messageLengths, message.length]
      }

      setUserBehaviorPatterns(prev => new Map(prev.set(userId, updatedPatterns)))

      // Update user profile
      updateUserPreferences(userId, {
        interactionPatterns: updatedPatterns.messageTypes,
        customSettings: {
          ...getUserProfile(userId)?.customSettings,
          behaviorPatterns: updatedPatterns
        }
      })
    } catch (error) {
      console.error('Error updating user behavior patterns:', error)
    }
  }, [userBehaviorPatterns, updateUserPreferences, getUserProfile])

  const getModuleRecommendations = useCallback((userId?: string) => {
    try {
      const recommendations = availableModules.map(module => {
        const metrics = getModuleMetrics(module.id)
        const userProfile = userId ? getUserProfile(userId) : null
        
        // Calculate recommendation score
        let score = 0
        
        // Base score from module performance
        if (metrics) {
          score += metrics.successRate * 0.4
          score += metrics.userSatisfaction * 0.3
          score += Math.max(0, 1 - (metrics.averageResponseTime / 5000)) * 0.2
        }
        
        // User preference bonus
        if (userProfile?.preferredModules.includes(module.id)) {
          score += 0.1
        }
        
        return {
          module,
          score,
          metrics,
          isRecommended: score > 0.7
        }
      })

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    } catch (error) {
      console.error('Error getting module recommendations:', error)
      return []
    }
  }, [availableModules, getModuleMetrics, getUserProfile])

  const analyzeModulePerformance = useCallback((moduleId: string) => {
    try {
      const metrics = getModuleMetrics(moduleId)
      if (!metrics) return null

      const performance: ModulePerformance = {
        moduleId,
        usageCount: metrics.usageCount,
        successRate: metrics.successRate,
        averageResponseTime: metrics.averageResponseTime,
        userSatisfaction: metrics.userSatisfaction,
        lastUsed: metrics.lastUsed,
        trends: {
          usage: [metrics.usageCount],
          satisfaction: [metrics.userSatisfaction],
          responseTime: [metrics.averageResponseTime]
        }
      }

      return performance
    } catch (error) {
      console.error('Error analyzing module performance:', error)
      return null
    }
  }, [getModuleMetrics])

  const optimizeModuleSelection = useCallback(async (
    message: string,
    history: ChatMessageType[],
    userId?: string
  ) => {
    try {
      // Get classification
      const classification = await classifyUserMessage(message, history, userId)
      
      // Get recommendations
      const recommendations = getModuleRecommendations(userId)
      
      // Find best match
      const bestMatch = recommendations.find(rec => 
        rec.module.id === classification.module && rec.isRecommended
      )
      
      if (bestMatch) {
        return {
          module: bestMatch.module.id,
          confidence: classification.confidence,
          reasoning: `Optimized selection based on performance and user preferences`,
          alternatives: recommendations.slice(0, 3).map(rec => ({
            module: rec.module.id,
            confidence: rec.score,
            reasoning: `Performance score: ${rec.score.toFixed(2)}`
          }))
        }
      }
      
      return classification
    } catch (error) {
      console.error('Error optimizing module selection:', error)
      return {
        module: 'atendimento',
        confidence: 0.5,
        reasoning: 'Fallback due to optimization error',
        suggestedModels: ['gpt-3.5-turbo'],
        alternatives: []
      }
    }
  }, [classifyUserMessage, getModuleRecommendations])

  // Initialize user behavior patterns
  useEffect(() => {
    if (config.enableUserAdaptation) {
      // Load existing patterns from localStorage
      const savedPatterns = localStorage.getItem('user-behavior-patterns')
      if (savedPatterns) {
        try {
          const parsed = JSON.parse(savedPatterns)
          setUserBehaviorPatterns(new Map(Object.entries(parsed)))
        } catch (error) {
          console.error('Error loading user behavior patterns:', error)
        }
      }
    }
  }, [config.enableUserAdaptation])

  // Save user behavior patterns
  useEffect(() => {
    if (config.enableUserAdaptation && userBehaviorPatterns.size > 0) {
      const patternsObj = Object.fromEntries(userBehaviorPatterns)
      localStorage.setItem('user-behavior-patterns', JSON.stringify(patternsObj))
    }
  }, [userBehaviorPatterns, config.enableUserAdaptation])

  return {
    // State
    availableModules,
    modulePerformance,
    isClassifying,
    classificationHistory,
    userBehaviorPatterns,
    
    // Actions
    classifyUserMessage,
    selectOptimalModule,
    switchModule,
    getModuleRecommendations,
    analyzeModulePerformance,
    optimizeModuleSelection,
    
    // Utilities
    getModuleById,
    getModuleMetrics,
    updateModuleMetrics
  }
}


