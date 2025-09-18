"use client"

import { EventEmitter } from 'events'
import { Message as ChatMessageType } from '@/types'

export interface QueueItem {
  id: string
  message: ChatMessageType
  priority: number
  timestamp: number
  retryCount: number
  maxRetries: number
  metadata: Record<string, any>
  timeout: number
}

export interface QueueConfig {
  maxSize: number
  maxConcurrent: number
  defaultPriority: number
  defaultTimeout: number
  defaultMaxRetries: number
  enableRateLimiting: boolean
  rateLimitWindow: number
  rateLimitMaxRequests: number
  enableDeadLetterQueue: boolean
  deadLetterQueueSize: number
  enableMetrics: boolean
}

export interface QueueMetrics {
  totalItems: number
  processedItems: number
  failedItems: number
  retriedItems: number
  averageProcessingTime: number
  averageQueueTime: number
  currentSize: number
  currentConcurrent: number
  rateLimitHits: number
  deadLetterItems: number
}

export interface RateLimitInfo {
  userId: string
  requestCount: number
  windowStart: number
  isLimited: boolean
}

export class QueueSystem extends EventEmitter {
  private config: QueueConfig
  private queue: QueueItem[] = []
  private processing: Set<string> = new Set()
  private deadLetterQueue: QueueItem[] = []
  private rateLimits: Map<string, RateLimitInfo> = new Map()
  private metrics: QueueMetrics
  private isProcessing: boolean = false
  private processingInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<QueueConfig> = {}) {
    super()
    
    this.config = {
      maxSize: 1000,
      maxConcurrent: 5,
      defaultPriority: 5,
      defaultTimeout: 30000,
      defaultMaxRetries: 3,
      enableRateLimiting: true,
      rateLimitWindow: 60000, // 1 minute
      rateLimitMaxRequests: 10,
      enableDeadLetterQueue: true,
      deadLetterQueueSize: 100,
      enableMetrics: true,
      ...config
    }

    this.metrics = {
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      retriedItems: 0,
      averageProcessingTime: 0,
      averageQueueTime: 0,
      currentSize: 0,
      currentConcurrent: 0,
      rateLimitHits: 0,
      deadLetterItems: 0
    }

    this.startProcessing()
  }

  // Public methods
  async enqueue(
    message: ChatMessageType,
    options: {
      priority?: number
      timeout?: number
      maxRetries?: number
      userId?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<string> {
    const itemId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Check rate limiting
    if (this.config.enableRateLimiting && options.userId) {
      if (this.isRateLimited(options.userId)) {
        this.metrics.rateLimitHits++
        throw new Error('Rate limit exceeded')
      }
      this.updateRateLimit(options.userId)
    }

    // Check queue size
    if (this.queue.length >= this.config.maxSize) {
      throw new Error('Queue is full')
    }

    const item: QueueItem = {
      id: itemId,
      message,
      priority: options.priority ?? this.config.defaultPriority,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries ?? this.config.defaultMaxRetries,
      metadata: options.metadata ?? {},
      timeout: options.timeout ?? this.config.defaultTimeout
    }

    // Insert item in priority order
    this.insertByPriority(item)
    this.metrics.totalItems++
    this.metrics.currentSize = this.queue.length

    this.emit('itemEnqueued', { item, queueSize: this.queue.length })
    
    return itemId
  }

  async dequeue(): Promise<QueueItem | null> {
    if (this.queue.length === 0) {
      return null
    }

    // Check concurrent limit
    if (this.processing.size >= this.config.maxConcurrent) {
      return null
    }

    const item = this.queue.shift()!
    this.processing.add(item.id)
    this.metrics.currentSize = this.queue.length
    this.metrics.currentConcurrent = this.processing.size

    this.emit('itemDequeued', { item })
    
    return item
  }

  async processItem(item: QueueItem): Promise<boolean> {
    const startTime = Date.now()
    
    try {
      this.emit('itemProcessing', { item })
      
      // Simulate processing (replace with actual processing logic)
      await this.simulateProcessing(item)
      
      const processingTime = Date.now() - startTime
      this.updateMetrics('processed', processingTime, Date.now() - item.timestamp)
      
      this.processing.delete(item.id)
      this.metrics.currentConcurrent = this.processing.size
      
      this.emit('itemProcessed', { item, processingTime })
      
      return true
    } catch (error) {
      const processingTime = Date.now() - startTime
      this.updateMetrics('failed', processingTime, Date.now() - item.timestamp)
      
      // Handle retry or dead letter
      await this.handleProcessingError(item, error)
      
      this.processing.delete(item.id)
      this.metrics.currentConcurrent = this.processing.size
      
      this.emit('itemFailed', { item, error })
      
      return false
    }
  }

  async retryItem(itemId: string): Promise<boolean> {
    const item = this.queue.find(i => i.id === itemId) || 
                 this.deadLetterQueue.find(i => i.id === itemId)
    
    if (!item) {
      return false
    }

    if (item.retryCount >= item.maxRetries) {
      return false
    }

    item.retryCount++
    item.timestamp = Date.now()
    
    this.metrics.retriedItems++
    
    // Move from dead letter queue back to main queue
    if (this.deadLetterQueue.includes(item)) {
      this.deadLetterQueue = this.deadLetterQueue.filter(i => i.id !== itemId)
      this.insertByPriority(item)
      this.metrics.deadLetterItems = this.deadLetterQueue.length
    }

    this.emit('itemRetried', { item })
    
    return true
  }

  async removeItem(itemId: string): Promise<boolean> {
    const itemIndex = this.queue.findIndex(i => i.id === itemId)
    if (itemIndex !== -1) {
      this.queue.splice(itemIndex, 1)
      this.metrics.currentSize = this.queue.length
      this.emit('itemRemoved', { itemId })
      return true
    }

    const deadLetterIndex = this.deadLetterQueue.findIndex(i => i.id === itemId)
    if (deadLetterIndex !== -1) {
      this.deadLetterQueue.splice(deadLetterIndex, 1)
      this.metrics.deadLetterItems = this.deadLetterQueue.length
      this.emit('itemRemoved', { itemId })
      return true
    }

    return false
  }

  // Private methods
  private insertByPriority(item: QueueItem): void {
    let insertIndex = this.queue.length
    
    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].priority < item.priority) {
        insertIndex = i
        break
      }
    }
    
    this.queue.splice(insertIndex, 0, item)
  }

  private async simulateProcessing(item: QueueItem): Promise<void> {
    // Simulate processing time based on message length
    const processingTime = Math.min(item.message.content.length * 10, 5000)
    await new Promise(resolve => setTimeout(resolve, processingTime))
    
    // Simulate occasional failures
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('Simulated processing error')
    }
  }

  private async handleProcessingError(item: QueueItem, error: any): Promise<void> {
    if (item.retryCount < item.maxRetries) {
      // Retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, item.retryCount), 10000)
      setTimeout(() => {
        this.insertByPriority(item)
        this.metrics.currentSize = this.queue.length
      }, delay)
    } else {
      // Move to dead letter queue
      if (this.config.enableDeadLetterQueue) {
        this.deadLetterQueue.push(item)
        if (this.deadLetterQueue.length > this.config.deadLetterQueueSize) {
          this.deadLetterQueue.shift() // Remove oldest
        }
        this.metrics.deadLetterItems = this.deadLetterQueue.length
        this.emit('itemMovedToDeadLetter', { item, error })
      }
    }
  }

  private startProcessing(): void {
    this.isProcessing = true
    
    this.processingInterval = setInterval(() => {
      this.processNextItem()
    }, 100)
  }

  private async processNextItem(): Promise<void> {
    if (!this.isProcessing) return
    
    const item = await this.dequeue()
    if (!item) return
    
    // Check for timeout
    if (Date.now() - item.timestamp > item.timeout) {
      this.processing.delete(item.id)
      this.metrics.currentConcurrent = this.processing.size
      this.emit('itemTimeout', { item })
      return
    }
    
    await this.processItem(item)
  }

  private updateMetrics(
    type: 'processed' | 'failed',
    processingTime: number,
    queueTime: number
  ): void {
    if (type === 'processed') {
      this.metrics.processedItems++
    } else {
      this.metrics.failedItems++
    }

    // Update averages
    const totalProcessed = this.metrics.processedItems + this.metrics.failedItems
    this.metrics.averageProcessingTime = (
      (this.metrics.averageProcessingTime * (totalProcessed - 1) + processingTime) / totalProcessed
    )
    this.metrics.averageQueueTime = (
      (this.metrics.averageQueueTime * (totalProcessed - 1) + queueTime) / totalProcessed
    )
  }

  private isRateLimited(userId: string): boolean {
    const rateLimit = this.rateLimits.get(userId)
    if (!rateLimit) {
      return false
    }

    const now = Date.now()
    if (now - rateLimit.windowStart > this.config.rateLimitWindow) {
      // Reset window
      rateLimit.requestCount = 0
      rateLimit.windowStart = now
      return false
    }

    return rateLimit.requestCount >= this.config.rateLimitMaxRequests
  }

  private updateRateLimit(userId: string): void {
    const now = Date.now()
    const rateLimit = this.rateLimits.get(userId) || {
      userId,
      requestCount: 0,
      windowStart: now,
      isLimited: false
    }

    if (now - rateLimit.windowStart > this.config.rateLimitWindow) {
      rateLimit.requestCount = 0
      rateLimit.windowStart = now
    }

    rateLimit.requestCount++
    rateLimit.isLimited = rateLimit.requestCount >= this.config.rateLimitMaxRequests
    
    this.rateLimits.set(userId, rateLimit)
  }

  // Public getters
  getQueueSize(): number {
    return this.queue.length
  }

  getProcessingCount(): number {
    return this.processing.size
  }

  getDeadLetterQueueSize(): number {
    return this.deadLetterQueue.length
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics }
  }

  getConfig(): QueueConfig {
    return { ...this.config }
  }

  getQueueItems(): QueueItem[] {
    return [...this.queue]
  }

  getDeadLetterItems(): QueueItem[] {
    return [...this.deadLetterQueue]
  }

  getProcessingItems(): string[] {
    return Array.from(this.processing)
  }

  getRateLimitInfo(userId: string): RateLimitInfo | null {
    return this.rateLimits.get(userId) || null
  }

  // Configuration methods
  updateConfig(newConfig: Partial<QueueConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  pauseProcessing(): void {
    this.isProcessing = false
    this.emit('processingPaused')
  }

  resumeProcessing(): void {
    this.isProcessing = true
    this.emit('processingResumed')
  }

  clearQueue(): void {
    this.queue = []
    this.metrics.currentSize = 0
    this.emit('queueCleared')
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue = []
    this.metrics.deadLetterItems = 0
    this.emit('deadLetterQueueCleared')
  }

  // Cleanup
  destroy(): void {
    this.isProcessing = false
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    this.queue = []
    this.deadLetterQueue = []
    this.processing.clear()
    this.rateLimits.clear()
    this.removeAllListeners()
  }
}
