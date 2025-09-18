"use client"

import { EventEmitter } from 'events'
import { ChatWebSocketManager, StreamChunk } from './ChatWebSocketManager'
import { AIModel } from '@/contexts/ChatContext'

export interface ParallelStreamingConfig {
  models: AIModel[]
  strategy: 'fastest' | 'best' | 'consensus'
  maxConcurrent: number
  timeout: number
  enableFallback: boolean
  enableComparison: boolean
  enableCaching: boolean
}

export interface StreamingRequest {
  id: string
  message: string
  conversationId: string
  models: AIModel[]
  config: ParallelStreamingConfig
  startTime: number
  timeout: NodeJS.Timeout
  results: Map<string, StreamChunk[]>
  completed: Set<string>
  errors: Map<string, string>
  isComplete: boolean
}

export interface StreamingResult {
  requestId: string
  model: string
  content: string
  chunks: StreamChunk[]
  isComplete: boolean
  error?: string
  metrics: {
    startTime: number
    endTime: number
    duration: number
    tokens: number
    latency: number
  }
}

export interface ConsensusResult {
  requestId: string
  selectedModel: string
  selectedContent: string
  confidence: number
  alternatives: Array<{
    model: string
    content: string
    confidence: number
  }>
  reasoning: string
}

export class ParallelStreamingManager extends EventEmitter {
  private wsManager: ChatWebSocketManager
  private config: ParallelStreamingConfig
  private activeRequests: Map<string, StreamingRequest> = new Map()
  private requestQueue: StreamingRequest[] = []
  private metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageLatency: number
    averageTokens: number
    cacheHits: number
    cacheMisses: number
  }

  constructor(wsManager: ChatWebSocketManager, config: Partial<ParallelStreamingConfig> = {}) {
    super()
    
    this.wsManager = wsManager
    this.config = {
      models: [],
      strategy: 'fastest',
      maxConcurrent: 3,
      timeout: 30000,
      enableFallback: true,
      enableComparison: true,
      enableCaching: true,
      ...config
    }

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      averageTokens: 0,
      cacheHits: 0,
      cacheMisses: 0
    }

    this.setupEventListeners()
  }

  // Public methods
  async streamMessage(
    message: string,
    conversationId: string,
    models: AIModel[],
    customConfig?: Partial<ParallelStreamingConfig>
  ): Promise<string> {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const config = { ...this.config, ...customConfig }
    
    // Check cache first
    if (config.enableCaching) {
      const cached = this.getCachedResponse(message, models)
      if (cached) {
        this.metrics.cacheHits++
        this.emit('cachedResponse', { requestId, cached })
        return cached
      }
      this.metrics.cacheMisses++
    }

    // Create streaming request
    const request: StreamingRequest = {
      id: requestId,
      message,
      conversationId,
      models: models.slice(0, config.maxConcurrent),
      config,
      startTime: Date.now(),
      timeout: setTimeout(() => {
        this.handleRequestTimeout(requestId)
      }, config.timeout),
      results: new Map(),
      completed: new Set(),
      errors: new Map(),
      isComplete: false
    }

    this.activeRequests.set(requestId, request)
    this.metrics.totalRequests++

    // Start streaming for each model
    await this.startParallelStreaming(request)

    return requestId
  }

  async getBestResponse(requestId: string): Promise<ConsensusResult | null> {
    const request = this.activeRequests.get(requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    // Wait for completion or timeout
    await this.waitForCompletion(requestId)

    const results = Array.from(request.results.entries()).map(([model, chunks]) => ({
      model,
      content: chunks.map(chunk => chunk.content).join(''),
      chunks,
      isComplete: chunks.length > 0 && chunks[chunks.length - 1]?.isComplete
    }))

    if (results.length === 0) {
      return null
    }

    // Apply strategy
    const consensus = await this.applyStrategy(request, results)
    
    // Cache result if enabled
    if (request.config.enableCaching) {
      this.cacheResponse(request.message, request.models, consensus.selectedContent)
    }

    // Update metrics
    this.updateMetrics(request, consensus)

    return consensus
  }

  cancelRequest(requestId: string): boolean {
    const request = this.activeRequests.get(requestId)
    if (!request) {
      return false
    }

    clearTimeout(request.timeout)
    request.isComplete = true
    
    this.activeRequests.delete(requestId)
    this.emit('requestCancelled', { requestId })
    
    return true
  }

  // Private methods
  private async startParallelStreaming(request: StreamingRequest): Promise<void> {
    const promises = request.models.map(async (model) => {
      try {
        await this.streamWithModel(request, model)
      } catch (error) {
        console.error(`Error streaming with model ${model.id}:`, error)
        request.errors.set(model.id, error instanceof Error ? error.message : 'Unknown error')
        request.completed.add(model.id)
      }
    })

    await Promise.allSettled(promises)
  }

  private async streamWithModel(request: StreamingRequest, model: AIModel): Promise<void> {
    const modelRequestId = `${request.id}-${model.id}`
    const chunks: StreamChunk[] = []

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Model ${model.id} timeout`))
      }, request.config.timeout)

      const onChunk = (chunk: StreamChunk) => {
        if (chunk.messageId === modelRequestId) {
          chunks.push(chunk)
          request.results.set(model.id, [...chunks])
          
          this.emit('modelChunk', {
            requestId: request.id,
            model: model.id,
            chunk
          })

          if (chunk.isComplete) {
            clearTimeout(timeout)
            request.completed.add(model.id)
            this.wsManager.off('streamChunk', onChunk)
            resolve()
          }
        }
      }

      this.wsManager.on('streamChunk', onChunk)

      // Send message to model
      this.wsManager.sendMessage({
        id: modelRequestId,
        role: 'user',
        content: request.message,
        timestamp: Date.now(),
        conversationId: request.conversationId,
        model: model.id,
        provider: model.provider
      })
    })
  }

  private async applyStrategy(
    request: StreamingRequest,
    results: Array<{ model: string; content: string; chunks: StreamChunk[]; isComplete: boolean }>
  ): Promise<ConsensusResult> {
    switch (request.config.strategy) {
      case 'fastest':
        return this.selectFastest(request, results)
      
      case 'best':
        return this.selectBest(request, results)
      
      case 'consensus':
        return this.selectConsensus(request, results)
      
      default:
        return this.selectFastest(request, results)
    }
  }

  private async selectFastest(
    request: StreamingRequest,
    results: Array<{ model: string; content: string; chunks: StreamChunk[]; isComplete: boolean }>
  ): Promise<ConsensusResult> {
    const fastest = results.reduce((fastest, current) => {
      const fastestTime = fastest.chunks.length > 0 ? fastest.chunks[0].timestamp : Infinity
      const currentTime = current.chunks.length > 0 ? current.chunks[0].timestamp : Infinity
      return currentTime < fastestTime ? current : fastest
    })

    return {
      requestId: request.id,
      selectedModel: fastest.model,
      selectedContent: fastest.content,
      confidence: 0.8,
      alternatives: results
        .filter(r => r.model !== fastest.model)
        .map(r => ({
          model: r.model,
          content: r.content,
          confidence: 0.6
        })),
      reasoning: 'Selected fastest response based on first chunk timestamp'
    }
  }

  private async selectBest(
    request: StreamingRequest,
    results: Array<{ model: string; content: string; chunks: StreamChunk[]; isComplete: boolean }>
  ): Promise<ConsensusResult> {
    // Simple heuristic: prefer longer, more complete responses
    const best = results.reduce((best, current) => {
      const bestScore = this.calculateQualityScore(best)
      const currentScore = this.calculateQualityScore(current)
      return currentScore > bestScore ? current : best
    })

    return {
      requestId: request.id,
      selectedModel: best.model,
      selectedContent: best.content,
      confidence: 0.9,
      alternatives: results
        .filter(r => r.model !== best.model)
        .map(r => ({
          model: r.model,
          content: r.content,
          confidence: this.calculateQualityScore(r) / 100
        })),
      reasoning: 'Selected best response based on quality score'
    }
  }

  private async selectConsensus(
    request: StreamingRequest,
    results: Array<{ model: string; content: string; chunks: StreamChunk[]; isComplete: boolean }>
  ): Promise<ConsensusResult> {
    // Simple consensus: find the most common response pattern
    const contentLengths = results.map(r => r.content.length)
    const avgLength = contentLengths.reduce((sum, len) => sum + len, 0) / contentLengths.length
    
    const consensus = results.find(r => 
      Math.abs(r.content.length - avgLength) < avgLength * 0.2
    ) || results[0]

    return {
      requestId: request.id,
      selectedModel: consensus.model,
      selectedContent: consensus.content,
      confidence: 0.7,
      alternatives: results
        .filter(r => r.model !== consensus.model)
        .map(r => ({
          model: r.model,
          content: r.content,
          confidence: 0.5
        })),
      reasoning: 'Selected consensus response based on content length similarity'
    }
  }

  private calculateQualityScore(result: { model: string; content: string; chunks: StreamChunk[]; isComplete: boolean }): number {
    let score = 0
    
    // Length score (prefer longer responses)
    score += Math.min(result.content.length / 100, 50)
    
    // Completeness score
    score += result.isComplete ? 30 : 0
    
    // Chunk count score (prefer more chunks for streaming)
    score += Math.min(result.chunks.length, 20)
    
    return score
  }

  private async waitForCompletion(requestId: string): Promise<void> {
    const request = this.activeRequests.get(requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (request.isComplete || request.completed.size >= request.models.length) {
          resolve()
        } else {
          setTimeout(checkCompletion, 100)
        }
      }
      
      checkCompletion()
    })
  }

  private handleRequestTimeout(requestId: string): void {
    const request = this.activeRequests.get(requestId)
    if (!request) {
      return
    }

    request.isComplete = true
    this.activeRequests.delete(requestId)
    
    this.emit('requestTimeout', { requestId })
  }

  private updateMetrics(request: StreamingRequest, consensus: ConsensusResult): void {
    const duration = Date.now() - request.startTime
    
    if (consensus.selectedContent) {
      this.metrics.successfulRequests++
    } else {
      this.metrics.failedRequests++
    }

    // Update average latency
    const totalRequests = this.metrics.successfulRequests + this.metrics.failedRequests
    this.metrics.averageLatency = (
      (this.metrics.averageLatency * (totalRequests - 1) + duration) / totalRequests
    )
  }

  private setupEventListeners(): void {
    this.wsManager.on('streamChunk', (chunk: StreamChunk) => {
      // Handle incoming chunks
      this.emit('chunkReceived', chunk)
    })

    this.wsManager.on('streamComplete', (data: any) => {
      this.emit('streamComplete', data)
    })

    this.wsManager.on('streamError', (error: string) => {
      this.emit('streamError', error)
    })
  }

  // Cache methods
  private getCachedResponse(message: string, models: AIModel[]): string | null {
    if (typeof window === 'undefined') return null
    
    const cacheKey = this.generateCacheKey(message, models)
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      try {
        const data = JSON.parse(cached)
        // Check if cache is still valid (1 hour)
        if (Date.now() - data.timestamp < 3600000) {
          return data.content
        }
      } catch (error) {
        console.error('Error parsing cached response:', error)
      }
    }
    
    return null
  }

  private cacheResponse(message: string, models: AIModel[], content: string): void {
    if (typeof window === 'undefined') return
    
    const cacheKey = this.generateCacheKey(message, models)
    const data = {
      content,
      timestamp: Date.now(),
      models: models.map(m => m.id)
    }
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error caching response:', error)
    }
  }

  private generateCacheKey(message: string, models: AIModel[]): string {
    const modelIds = models.map(m => m.id).sort().join(',')
    const messageHash = this.hashString(message)
    return `streaming-cache-${messageHash}-${modelIds}`
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Public getters
  getActiveRequests(): string[] {
    return Array.from(this.activeRequests.keys())
  }

  getMetrics() {
    return { ...this.metrics }
  }

  getConfig(): ParallelStreamingConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<ParallelStreamingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Cleanup
  destroy(): void {
    // Cancel all active requests
    this.activeRequests.forEach((request, requestId) => {
      this.cancelRequest(requestId)
    })

    this.activeRequests.clear()
    this.requestQueue = []
    this.removeAllListeners()
  }
}



