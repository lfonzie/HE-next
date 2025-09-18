"use client"

import { EventEmitter } from 'events'
import { Message as ChatMessageType } from '@/types'

export interface WebSocketConfig {
  url: string
  protocols?: string[]
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectDelay: number
  maxReconnectDelay: number
  heartbeatInterval: number
  heartbeatTimeout: number
  enableCompression: boolean
  enableEncryption: boolean
  bufferSize: number
  flushInterval: number
}

export interface StreamChunk {
  id: string
  conversationId: string
  messageId: string
  content: string
  isComplete: boolean
  timestamp: number
  model: string
  provider: string
  tokens?: number
  tier?: 'IA' | 'IA_SUPER' | 'IA_ECO'
  complexity?: string
  metadata?: Record<string, any>
}

export interface WebSocketMessage {
  type: 'stream_chunk' | 'stream_complete' | 'stream_error' | 'message_sent' | 'heartbeat' | 'error' | 'info'
  data?: any
  chunk?: StreamChunk
  message?: ChatMessageType
  error?: string
  info?: string
  timestamp: number
}

export interface ConnectionMetrics {
  connected: boolean
  connectionTime: number
  lastHeartbeat: number
  reconnectAttempts: number
  totalMessages: number
  totalBytes: number
  averageLatency: number
  errorCount: number
  lastError?: string
}

export class ChatWebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts: number = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private heartbeatTimeout: NodeJS.Timeout | null = null
  private messageBuffer: WebSocketMessage[] = []
  private flushTimeout: NodeJS.Timeout | null = null
  private metrics: ConnectionMetrics
  private isDestroyed: boolean = false

  constructor(config: Partial<WebSocketConfig> = {}) {
    super()
    
    this.config = {
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws',
      protocols: ['chat-v1'],
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      maxReconnectDelay: 10000,
      heartbeatInterval: 30000,
      heartbeatTimeout: 5000,
      enableCompression: true,
      enableEncryption: false,
      bufferSize: 1024,
      flushInterval: 100,
      ...config
    }

    this.metrics = {
      connected: false,
      connectionTime: 0,
      lastHeartbeat: 0,
      reconnectAttempts: 0,
      totalMessages: 0,
      totalBytes: 0,
      averageLatency: 0,
      errorCount: 0
    }
  }

  // Public methods
  async connect(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('WebSocket manager has been destroyed')
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols)
        
        const connectTimeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 10000)

        this.ws.onopen = () => {
          clearTimeout(connectTimeout)
          this.handleOpen()
          resolve()
        }

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout)
          this.handleClose(event)
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout)
          this.handleError(error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.isDestroyed = true
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
      this.flushTimeout = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.metrics.connected = false
    this.emit('disconnected')
  }

  sendMessage(message: ChatMessageType): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected')
    }

    const wsMessage: WebSocketMessage = {
      type: 'message_sent',
      message,
      timestamp: Date.now()
    }

    this.send(wsMessage)
  }

  sendStreamChunk(chunk: StreamChunk): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected')
    }

    const wsMessage: WebSocketMessage = {
      type: 'stream_chunk',
      chunk,
      timestamp: Date.now()
    }

    this.send(wsMessage)
  }

  sendHeartbeat(): void {
    if (!this.isConnected()) {
      return
    }

    const wsMessage: WebSocketMessage = {
      type: 'heartbeat',
      timestamp: Date.now()
    }

    this.send(wsMessage)
  }

  // Event handlers
  private handleOpen(): void {
    console.log('🔌 WebSocket connected')
    
    this.metrics.connected = true
    this.metrics.connectionTime = Date.now()
    this.metrics.reconnectAttempts = 0
    this.reconnectAttempts = 0

    this.startHeartbeat()
    this.flushMessageBuffer()
    
    this.emit('connected', this.metrics)
  }

  private handleClose(event: CloseEvent): void {
    console.log('🔌 WebSocket disconnected:', event.code, event.reason)
    
    this.metrics.connected = false
    this.stopHeartbeat()
    
    this.emit('disconnected', { code: event.code, reason: event.reason })

    if (!this.isDestroyed && event.code !== 1000) {
      this.handleReconnection()
    }
  }

  private handleError(error: Event): void {
    console.error('🔌 WebSocket error:', error)
    
    this.metrics.errorCount++
    this.metrics.lastError = 'WebSocket error'
    
    this.emit('error', error)
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage
      
      this.metrics.totalMessages++
      this.metrics.totalBytes += event.data.length
      this.metrics.lastHeartbeat = Date.now()

      switch (data.type) {
        case 'stream_chunk':
          if (data.chunk) {
            this.emit('streamChunk', data.chunk)
          }
          break
          
        case 'stream_complete':
          this.emit('streamComplete', data.data)
          break
          
        case 'stream_error':
          this.emit('streamError', data.error)
          break
          
        case 'heartbeat':
          this.handleHeartbeatResponse()
          break
          
        case 'error':
          this.emit('serverError', data.error)
          break
          
        case 'info':
          this.emit('serverInfo', data.info)
          break
          
        default:
          console.warn('Unknown message type:', data.type)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
      this.metrics.errorCount++
    }
  }

  private handleHeartbeatResponse(): void {
    // Clear heartbeat timeout
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  private handleReconnection(): void {
    if (this.isDestroyed || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      this.emit('maxReconnectAttemptsReached')
      return
    }

    this.reconnectAttempts++
    this.metrics.reconnectAttempts = this.reconnectAttempts

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    )

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error)
        this.handleReconnection()
      })
    }, delay)

    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay })
  }

  // Private methods
  private send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Buffer message for later
      this.messageBuffer.push(message)
      return
    }

    try {
      const data = JSON.stringify(message)
      this.ws.send(data)
    } catch (error) {
      console.error('Error sending WebSocket message:', error)
      this.metrics.errorCount++
      this.messageBuffer.push(message)
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat()
      
      // Set timeout for heartbeat response
      this.heartbeatTimeout = setTimeout(() => {
        console.warn('Heartbeat timeout')
        this.handleHeartbeatTimeout()
      }, this.config.heartbeatTimeout)
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  private handleHeartbeatTimeout(): void {
    console.warn('Heartbeat timeout - reconnecting')
    this.disconnect()
    this.handleReconnection()
  }

  private flushMessageBuffer(): void {
    if (this.messageBuffer.length === 0) return

    const messages = [...this.messageBuffer]
    this.messageBuffer = []

    messages.forEach(message => {
      this.send(message)
    })

    console.log(`Flushed ${messages.length} buffered messages`)
  }

  // Public getters
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics }
  }

  getConfig(): WebSocketConfig {
    return { ...this.config }
  }

  // Utility methods
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  getMessageBufferSize(): number {
    return this.messageBuffer.length
  }

  clearMessageBuffer(): void {
    this.messageBuffer = []
  }

  // Event listener management
  onStreamChunk(callback: (chunk: StreamChunk) => void): void {
    this.on('streamChunk', callback)
  }

  onStreamComplete(callback: (data: any) => void): void {
    this.on('streamComplete', callback)
  }

  onStreamError(callback: (error: string) => void): void {
    this.on('streamError', callback)
  }

  onConnected(callback: (metrics: ConnectionMetrics) => void): void {
    this.on('connected', callback)
  }

  onDisconnected(callback: (event: { code: number; reason: string }) => void): void {
    this.on('disconnected', callback)
  }

  onError(callback: (error: Event) => void): void {
    this.on('error', callback)
  }

  onReconnecting(callback: (data: { attempt: number; delay: number }) => void): void {
    this.on('reconnecting', callback)
  }

  onMaxReconnectAttemptsReached(callback: () => void): void {
    this.on('maxReconnectAttemptsReached', callback)
  }

  // Cleanup
  destroy(): void {
    this.disconnect()
    this.removeAllListeners()
  }
}

// Singleton instance
let wsManagerInstance: ChatWebSocketManager | null = null

export function getWebSocketManager(config?: Partial<WebSocketConfig>): ChatWebSocketManager {
  if (!wsManagerInstance) {
    wsManagerInstance = new ChatWebSocketManager(config)
  }
  return wsManagerInstance
}

export function destroyWebSocketManager(): void {
  if (wsManagerInstance) {
    wsManagerInstance.destroy()
    wsManagerInstance = null
  }
}



