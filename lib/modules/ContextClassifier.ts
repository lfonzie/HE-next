"use client"

import { EventEmitter } from 'events'
import { ModulePlugin } from '@/contexts/ModuleContext'

export interface ClassificationRequest {
  message: string
  history: any[]
  userId?: string
  context?: Record<string, any>
  availableModules: ModulePlugin[]
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
  metadata: {
    processingTime: number
    algorithm: string
    version: string
    timestamp: number
  }
}

export interface ClassificationConfig {
  enableCaching: boolean
  cacheTimeout: number
  enableFallback: boolean
  fallbackModule: string
  enableAnalytics: boolean
  enableML: boolean
  mlModelUrl?: string
  confidenceThreshold: number
  maxAlternatives: number
}

export interface ClassificationMetrics {
  totalClassifications: number
  successfulClassifications: number
  failedClassifications: number
  averageConfidence: number
  averageProcessingTime: number
  cacheHitRate: number
  moduleDistribution: Record<string, number>
  accuracyScore: number
}

export interface UserBehaviorPattern {
  userId: string
  preferredModules: string[]
  messagePatterns: string[]
  interactionTimes: number[]
  moduleUsage: Record<string, number>
  lastUpdated: number
}

export class ContextClassifier extends EventEmitter {
  private config: ClassificationConfig
  private metrics: ClassificationMetrics
  private cache: Map<string, ClassificationResult> = new Map()
  private userPatterns: Map<string, UserBehaviorPattern> = new Map()
  private mlModel: any = null

  constructor(config: Partial<ClassificationConfig> = {}) {
    super()
    
    this.config = {
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableFallback: true,
      fallbackModule: 'atendimento',
      enableAnalytics: true,
      enableML: false,
      confidenceThreshold: 0.7,
      maxAlternatives: 3,
      ...config
    }

    this.metrics = {
      totalClassifications: 0,
      successfulClassifications: 0,
      failedClassifications: 0,
      averageConfidence: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      moduleDistribution: {},
      accuracyScore: 0
    }

    this.initializeMLModel()
  }

  // Public methods
  async classifyIntent(request: ClassificationRequest): Promise<ClassificationResult> {
    const startTime = Date.now()
    
    try {
      this.metrics.totalClassifications++

      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.getCachedResult(request)
        if (cached) {
          this.metrics.cacheHitRate = (
            (this.metrics.cacheHitRate * (this.metrics.totalClassifications - 1) + 1) / 
            this.metrics.totalClassifications
          )
          this.emit('classificationCached', { request, result: cached })
          return cached
        }
      }

      // Perform classification
      const result = await this.performClassification(request)
      
      // Update metrics
      const processingTime = Date.now() - startTime
      this.updateMetrics(result, processingTime)
      
      // Cache result
      if (this.config.enableCaching) {
        this.cacheResult(request, result)
      }

      // Update user behavior patterns
      if (request.userId && this.config.enableAnalytics) {
        this.updateUserBehaviorPattern(request.userId, request.message, result)
      }

      this.emit('classificationCompleted', { request, result, processingTime })
      return result
    } catch (error) {
      this.metrics.failedClassifications++
      this.emit('classificationError', { request, error })
      
      // Return fallback result
      if (this.config.enableFallback) {
        return this.createFallbackResult(request, startTime)
      }
      
      throw error
    }
  }

  async adaptToUserBehavior(userId: string, interactions: any[]): Promise<UserBehaviorPattern> {
    try {
      const pattern = this.analyzeUserBehavior(userId, interactions)
      this.userPatterns.set(userId, pattern)
      
      this.emit('userBehaviorUpdated', { userId, pattern })
      return pattern
    } catch (error) {
      console.error('Error adapting to user behavior:', error)
      throw error
    }
  }

  getUserBehaviorPattern(userId: string): UserBehaviorPattern | null {
    return this.userPatterns.get(userId) || null
  }

  getClassificationMetrics(): ClassificationMetrics {
    return { ...this.metrics }
  }

  clearCache(): void {
    this.cache.clear()
    this.emit('cacheCleared')
  }

  // Private methods
  private async performClassification(request: ClassificationRequest): Promise<ClassificationResult> {
    const algorithms = [
      () => this.keywordBasedClassification(request),
      () => this.contextBasedClassification(request),
      () => this.historyBasedClassification(request),
      () => this.userPreferenceClassification(request)
    ]

    if (this.config.enableML && this.mlModel) {
      algorithms.unshift(() => this.mlBasedClassification(request))
    }

    const results: ClassificationResult[] = []
    
    for (const algorithm of algorithms) {
      try {
        const result = await algorithm()
        results.push(result)
      } catch (error) {
        console.warn('Classification algorithm failed:', error)
      }
    }

    // Combine results using ensemble method
    return this.combineResults(results, request)
  }

  private async keywordBasedClassification(request: ClassificationRequest): Promise<ClassificationResult> {
    const messageLower = request.message.toLowerCase()
    const scoredModules: Array<{ module: ModulePlugin; score: number; matchedKeywords: string[] }> = []

    for (const module of request.availableModules) {
      const matchedKeywords = module.keywords.filter(keyword =>
        messageLower.includes(keyword.toLowerCase())
      )
      
      if (matchedKeywords.length > 0) {
        const score = matchedKeywords.length / module.keywords.length
        scoredModules.push({ module, score, matchedKeywords })
      }
    }

    if (scoredModules.length === 0) {
      return this.createFallbackResult(request, Date.now())
    }

    // Sort by score
    scoredModules.sort((a, b) => b.score - a.score)
    const bestMatch = scoredModules[0]

    return {
      module: bestMatch.module.id,
      confidence: bestMatch.score,
      reasoning: `Matched ${bestMatch.matchedKeywords.length} keywords: ${bestMatch.matchedKeywords.join(', ')}`,
      suggestedModels: bestMatch.module.models,
      alternatives: scoredModules.slice(1, this.config.maxAlternatives + 1).map(item => ({
        module: item.module.id,
        confidence: item.score,
        reasoning: `Matched ${item.matchedKeywords.length} keywords`
      })),
      metadata: {
        processingTime: 0,
        algorithm: 'keyword-based',
        version: '1.0.0',
        timestamp: Date.now()
      }
    }
  }

  private async contextBasedClassification(request: ClassificationRequest): Promise<ClassificationResult> {
    // Analyze message context (length, complexity, intent)
    const messageLength = request.message.length
    const hasQuestion = request.message.includes('?')
    const hasExclamation = request.message.includes('!')
    const wordCount = request.message.split(' ').length

    // Simple heuristics
    let suggestedModule = 'atendimento'
    let confidence = 0.5
    let reasoning = 'Context-based classification'

    if (hasQuestion && wordCount > 10) {
      suggestedModule = 'professor'
      confidence = 0.7
      reasoning = 'Complex question detected'
    } else if (hasExclamation && wordCount < 5) {
      suggestedModule = 'atendimento'
      confidence = 0.6
      reasoning = 'Short exclamation detected'
    } else if (messageLength > 200) {
      suggestedModule = 'professor'
      confidence = 0.6
      reasoning = 'Long message suggests academic content'
    }

    return {
      module: suggestedModule,
      confidence,
      reasoning,
      suggestedModels: ['gpt-3.5-turbo'],
      alternatives: [],
      metadata: {
        processingTime: 0,
        algorithm: 'context-based',
        version: '1.0.0',
        timestamp: Date.now()
      }
    }
  }

  private async historyBasedClassification(request: ClassificationRequest): Promise<ClassificationResult> {
    if (request.history.length === 0) {
      return this.createFallbackResult(request, Date.now())
    }

    // Analyze recent conversation history
    const recentMessages = request.history.slice(-5)
    const moduleCounts: Record<string, number> = {}

    recentMessages.forEach(msg => {
      if (msg.module) {
        moduleCounts[msg.module] = (moduleCounts[msg.module] || 0) + 1
      }
    })

    const mostUsedModule = Object.keys(moduleCounts).reduce((a, b) =>
      moduleCounts[a] > moduleCounts[b] ? a : b
    )

    const confidence = moduleCounts[mostUsedModule] / recentMessages.length

    return {
      module: mostUsedModule,
      confidence,
      reasoning: `Based on recent conversation history (${moduleCounts[mostUsedModule]} recent uses)`,
      suggestedModels: ['gpt-3.5-turbo'],
      alternatives: Object.keys(moduleCounts)
        .filter(m => m !== mostUsedModule)
        .map(m => ({
          module: m,
          confidence: moduleCounts[m] / recentMessages.length,
          reasoning: 'Recent usage pattern'
        })),
      metadata: {
        processingTime: 0,
        algorithm: 'history-based',
        version: '1.0.0',
        timestamp: Date.now()
      }
    }
  }

  private async userPreferenceClassification(request: ClassificationRequest): Promise<ClassificationResult> {
    if (!request.userId) {
      return this.createFallbackResult(request, Date.now())
    }

    const userPattern = this.userPatterns.get(request.userId)
    if (!userPattern || userPattern.preferredModules.length === 0) {
      return this.createFallbackResult(request, Date.now())
    }

    const preferredModule = userPattern.preferredModules[0]
    const confidence = 0.8

    return {
      module: preferredModule,
      confidence,
      reasoning: `Based on user preference (${userPattern.preferredModules.length} preferred modules)`,
      suggestedModels: ['gpt-3.5-turbo'],
      alternatives: userPattern.preferredModules.slice(1, this.config.maxAlternatives + 1).map(module => ({
        module,
        confidence: 0.6,
        reasoning: 'User preference'
      })),
      metadata: {
        processingTime: 0,
        algorithm: 'user-preference',
        version: '1.0.0',
        timestamp: Date.now()
      }
    }
  }

  private async mlBasedClassification(request: ClassificationRequest): Promise<ClassificationResult> {
    if (!this.mlModel) {
      throw new Error('ML model not available')
    }

    try {
      // Prepare input for ML model
      const input = {
        message: request.message,
        history: request.history.slice(-3), // Last 3 messages
        userId: request.userId,
        availableModules: request.availableModules.map(m => ({
          id: m.id,
          keywords: m.keywords,
          category: m.category
        }))
      }

      // Call ML model (placeholder - replace with actual ML inference)
      const prediction = await this.callMLModel(input)
      
      return {
        module: prediction.module,
        confidence: prediction.confidence,
        reasoning: `ML-based classification using ${this.mlModel.name}`,
        suggestedModels: prediction.suggestedModels || ['gpt-3.5-turbo'],
        alternatives: prediction.alternatives || [],
        metadata: {
          processingTime: prediction.processingTime || 0,
          algorithm: 'ml-based',
          version: this.mlModel.version || '1.0.0',
          timestamp: Date.now()
        }
      }
    } catch (error) {
      console.error('ML classification failed:', error)
      throw error
    }
  }

  private async callMLModel(input: any): Promise<any> {
    // Placeholder for actual ML model call
    // This would typically call a REST API or use a WebAssembly model
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          module: 'professor',
          confidence: 0.8,
          suggestedModels: ['gpt-3.5-turbo'],
          alternatives: [],
          processingTime: 100
        })
      }, 100)
    })
  }

  private combineResults(results: ClassificationResult[], request: ClassificationRequest): ClassificationResult {
    if (results.length === 0) {
      return this.createFallbackResult(request, Date.now())
    }

    if (results.length === 1) {
      return results[0]
    }

    // Weighted ensemble
    const weights = {
      'ml-based': 0.4,
      'keyword-based': 0.3,
      'history-based': 0.2,
      'user-preference': 0.1,
      'context-based': 0.1
    }

    const moduleScores: Record<string, number> = {}
    const moduleReasons: Record<string, string[]> = {}
    const moduleModels: Record<string, string[]> = {}

    results.forEach(result => {
      const weight = weights[result.metadata.algorithm as keyof typeof weights] || 0.1
      const score = result.confidence * weight

      moduleScores[result.module] = (moduleScores[result.module] || 0) + score
      moduleReasons[result.module] = moduleReasons[result.module] || []
      moduleReasons[result.module].push(result.reasoning)
      moduleModels[result.module] = moduleModels[result.module] || []
      moduleModels[result.module].push(...result.suggestedModels)
    })

    // Find best module
    const bestModule = Object.keys(moduleScores).reduce((a, b) =>
      moduleScores[a] > moduleScores[b] ? a : b
    )

    const confidence = moduleScores[bestModule]
    const reasoning = `Ensemble classification: ${moduleReasons[bestModule].join('; ')}`
    const suggestedModels = [...new Set(moduleModels[bestModule])]

    // Create alternatives
    const alternatives = Object.keys(moduleScores)
      .filter(m => m !== bestModule)
      .map(m => ({
        module: m,
        confidence: moduleScores[m],
        reasoning: `Ensemble score: ${moduleScores[m].toFixed(2)}`
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxAlternatives)

    return {
      module: bestModule,
      confidence,
      reasoning,
      suggestedModels,
      alternatives,
      metadata: {
        processingTime: results.reduce((sum, r) => sum + r.metadata.processingTime, 0),
        algorithm: 'ensemble',
        version: '1.0.0',
        timestamp: Date.now()
      }
    }
  }

  private createFallbackResult(request: ClassificationRequest, startTime: number): ClassificationResult {
    return {
      module: this.config.fallbackModule,
      confidence: 0.5,
      reasoning: 'Fallback classification due to insufficient data',
      suggestedModels: ['gpt-3.5-turbo'],
      alternatives: [],
      metadata: {
        processingTime: Date.now() - startTime,
        algorithm: 'fallback',
        version: '1.0.0',
        timestamp: Date.now()
      }
    }
  }

  private getCachedResult(request: ClassificationRequest): ClassificationResult | null {
    if (!this.config.enableCaching) return null

    const cacheKey = this.generateCacheKey(request)
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.metadata.timestamp < this.config.cacheTimeout) {
      return cached
    }
    
    if (cached) {
      this.cache.delete(cacheKey)
    }
    
    return null
  }

  private cacheResult(request: ClassificationRequest, result: ClassificationResult): void {
    if (!this.config.enableCaching) return

    const cacheKey = this.generateCacheKey(request)
    this.cache.set(cacheKey, result)
  }

  private generateCacheKey(request: ClassificationRequest): string {
    const messageHash = this.hashString(request.message)
    const historyHash = this.hashString(JSON.stringify(request.history.slice(-3)))
    const userId = request.userId || 'anonymous'
    return `classification-${messageHash}-${historyHash}-${userId}`
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  private updateMetrics(result: ClassificationResult, processingTime: number): void {
    this.metrics.successfulClassifications++
    
    // Update average confidence
    const totalSuccessful = this.metrics.successfulClassifications
    this.metrics.averageConfidence = (
      (this.metrics.averageConfidence * (totalSuccessful - 1) + result.confidence) / totalSuccessful
    )
    
    // Update average processing time
    this.metrics.averageProcessingTime = (
      (this.metrics.averageProcessingTime * (totalSuccessful - 1) + processingTime) / totalSuccessful
    )
    
    // Update module distribution
    this.metrics.moduleDistribution[result.module] = 
      (this.metrics.moduleDistribution[result.module] || 0) + 1
  }

  private updateUserBehaviorPattern(userId: string, message: string, result: ClassificationResult): void {
    const existing = this.userPatterns.get(userId) || {
      userId,
      preferredModules: [],
      messagePatterns: [],
      interactionTimes: [],
      moduleUsage: {},
      lastUpdated: Date.now()
    }

    // Update preferred modules
    if (!existing.preferredModules.includes(result.module)) {
      existing.preferredModules.unshift(result.module)
      existing.preferredModules = existing.preferredModules.slice(0, 5) // Keep top 5
    }

    // Update message patterns
    existing.messagePatterns.push(message.slice(0, 50)) // First 50 chars
    existing.messagePatterns = existing.messagePatterns.slice(-20) // Keep last 20

    // Update interaction times
    existing.interactionTimes.push(Date.now())
    existing.interactionTimes = existing.interactionTimes.slice(-100) // Keep last 100

    // Update module usage
    existing.moduleUsage[result.module] = (existing.moduleUsage[result.module] || 0) + 1

    existing.lastUpdated = Date.now()
    this.userPatterns.set(userId, existing)
  }

  private analyzeUserBehavior(userId: string, interactions: any[]): UserBehaviorPattern {
    const pattern: UserBehaviorPattern = {
      userId,
      preferredModules: [],
      messagePatterns: [],
      interactionTimes: [],
      moduleUsage: {},
      lastUpdated: Date.now()
    }

    // Analyze interactions
    interactions.forEach(interaction => {
      if (interaction.module) {
        pattern.moduleUsage[interaction.module] = (pattern.moduleUsage[interaction.module] || 0) + 1
      }
      
      if (interaction.message) {
        pattern.messagePatterns.push(interaction.message.slice(0, 50))
      }
      
      if (interaction.timestamp) {
        pattern.interactionTimes.push(interaction.timestamp)
      }
    })

    // Determine preferred modules
    pattern.preferredModules = Object.keys(pattern.moduleUsage)
      .sort((a, b) => pattern.moduleUsage[b] - pattern.moduleUsage[a])
      .slice(0, 5)

    return pattern
  }

  private async initializeMLModel(): Promise<void> {
    if (!this.config.enableML) return

    try {
      // Load ML model (placeholder)
      this.mlModel = {
        name: 'chat-classifier-v1',
        version: '1.0.0',
        loaded: true
      }
      
      this.emit('mlModelLoaded', { model: this.mlModel })
    } catch (error) {
      console.error('Failed to load ML model:', error)
      this.emit('mlModelError', { error })
    }
  }

  // Cleanup
  destroy(): void {
    this.cache.clear()
    this.userPatterns.clear()
    this.mlModel = null
    this.removeAllListeners()
  }
}

// Singleton instance
let contextClassifierInstance: ContextClassifier | null = null

export function getContextClassifier(config?: Partial<ClassificationConfig>): ContextClassifier {
  if (!contextClassifierInstance) {
    contextClassifierInstance = new ContextClassifier(config)
  }
  return contextClassifierInstance
}

export function destroyContextClassifier(): void {
  if (contextClassifierInstance) {
    contextClassifierInstance.destroy()
    contextClassifierInstance = null
  }
}



