"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useStreamingContext } from '@/contexts/StreamingContext'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { useChatContext } from '@/contexts/ChatContext'
import { Message as ChatMessageType } from '@/types'

export interface StreamingConfig {
  bufferSize: number
  flushInterval: number
  maxRetries: number
  retryDelay: number
  enableCompression: boolean
  enableEncryption: boolean
  autoReconnect: boolean
  maxReconnectAttempts: number
}

export interface StreamingMetrics {
  totalChunks: number
  totalBytes: number
  averageLatency: number
  errorCount: number
  successRate: number
  lastStreamTime: number
}

export function useMessageStreaming(config: StreamingConfig = {
  bufferSize: 1024,
  flushInterval: 100,
  maxRetries: 3,
  retryDelay: 1000,
  enableCompression: true,
  enableEncryption: false,
  autoReconnect: true,
  maxReconnectAttempts: 5
}) {
  const {
    state: streamingState,
    addStreamChunk,
    completeStream,
    clearStream,
    addToQueue,
    removeFromQueue,
    setConnectionStatus,
    setError,
    updateConfig,
    resetMetrics,
    getStreamChunks,
    getStreamContent,
    isStreaming,
    isInQueue,
    connect,
    disconnect,
    sendMessage
  } = useStreamingContext()

  const { notifyStreaming, notifyError, notifySuccess } = useNotificationContext()
  const { addMessage, updateMessage } = useChatContext()

  const [isConnecting, setIsConnecting] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const bufferRef = useRef<Map<string, string>>(new Map())
  const flushTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Update streaming config
  useEffect(() => {
    updateConfig(config)
  }, [config, updateConfig])

  // Auto-reconnect logic
  useEffect(() => {
    if (config.autoReconnect && !streamingState.isConnected && reconnectAttempts < config.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000)
      
      const timeout = setTimeout(() => {
        setIsConnecting(true)
        connect().finally(() => {
          setIsConnecting(false)
          setReconnectAttempts(prev => prev + 1)
        })
      }, delay)

      return () => clearTimeout(timeout)
    }
  }, [streamingState.isConnected, reconnectAttempts, config, connect])

  // Reset reconnect attempts when connected
  useEffect(() => {
    if (streamingState.isConnected) {
      setReconnectAttempts(0)
    }
  }, [streamingState.isConnected])

  // Actions
  const startStreaming = useCallback(async (message: ChatMessageType) => {
    try {
      if (!streamingState.isConnected) {
        throw new Error('WebSocket not connected')
      }

      // Add to queue
      addToQueue(message.id)
      
      // Notify streaming start
      notifyStreaming('Streaming Iniciado', `Iniciando streaming para mensagem: ${message.id}`)

      // Send message via WebSocket
      sendMessage(message)

      return true
    } catch (error) {
      console.error('Error starting stream:', error)
      setError(error instanceof Error ? error.message : 'Failed to start streaming')
      notifyError('Erro de Streaming', 'Falha ao iniciar streaming')
      throw error
    }
  }, [streamingState.isConnected, addToQueue, notifyStreaming, sendMessage, setError, notifyError])

  const stopStreaming = useCallback((messageId: string, conversationId: string) => {
    try {
      // Remove from queue
      removeFromQueue(messageId)
      
      // Clear stream
      clearStream(messageId, conversationId)
      
      // Clear buffer
      bufferRef.current.delete(`${conversationId}-${messageId}`)
      
      // Clear flush timeout
      const timeoutKey = `${conversationId}-${messageId}`
      const timeout = flushTimeoutRef.current.get(timeoutKey)
      if (timeout) {
        clearTimeout(timeout)
        flushTimeoutRef.current.delete(timeoutKey)
      }

      notifySuccess('Streaming Interrompido', 'Streaming cancelado com sucesso')
      return true
    } catch (error) {
      console.error('Error stopping stream:', error)
      setError(error instanceof Error ? error.message : 'Failed to stop streaming')
      notifyError('Erro', 'Falha ao interromper streaming')
      throw error
    }
  }, [removeFromQueue, clearStream, notifySuccess, notifyError, setError])

  const handleStreamChunk = useCallback((chunk: any) => {
    try {
      const { messageId, conversationId, content, isComplete } = chunk
      
      // Add chunk to buffer
      const bufferKey = `${conversationId}-${messageId}`
      const currentBuffer = bufferRef.current.get(bufferKey) || ''
      bufferRef.current.set(bufferKey, currentBuffer + content)

      // Add chunk to stream
      addStreamChunk({
        id: `chunk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        messageId,
        content,
        isComplete,
        timestamp: Date.now(),
        model: chunk.model || 'unknown',
        provider: chunk.provider || 'unknown',
        tokens: chunk.tokens,
        tier: chunk.tier,
        complexity: chunk.complexity
      })

      // Flush buffer if complete or buffer is full
      if (isComplete || bufferRef.current.get(bufferKey)!.length >= config.bufferSize) {
        flushBuffer(messageId, conversationId)
      } else {
        // Schedule flush
        const timeoutKey = `${conversationId}-${messageId}`
        const existingTimeout = flushTimeoutRef.current.get(timeoutKey)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
        }

        const timeout = setTimeout(() => {
          flushBuffer(messageId, conversationId)
          flushTimeoutRef.current.delete(timeoutKey)
        }, config.flushInterval)

        flushTimeoutRef.current.set(timeoutKey, timeout)
      }

      // Complete stream if finished
      if (isComplete) {
        completeStream(messageId, conversationId)
        removeFromQueue(messageId)
        
        // Clean up
        bufferRef.current.delete(bufferKey)
        const timeout = flushTimeoutRef.current.get(timeoutKey)
        if (timeout) {
          clearTimeout(timeout)
          flushTimeoutRef.current.delete(timeoutKey)
        }
      }

    } catch (error) {
      console.error('Error handling stream chunk:', error)
      setError(error instanceof Error ? error.message : 'Failed to handle stream chunk')
    }
  }, [addStreamChunk, completeStream, removeFromQueue, config, notifyError, setError])

  const flushBuffer = useCallback((messageId: string, conversationId: string) => {
    try {
      const bufferKey = `${conversationId}-${messageId}`
      const content = bufferRef.current.get(bufferKey)
      
      if (content) {
        // Update message with buffered content
        updateMessage(conversationId, messageId, {
          content: content,
          isStreaming: false
        })

        // Clear buffer
        bufferRef.current.delete(bufferKey)
      }
    } catch (error) {
      console.error('Error flushing buffer:', error)
      setError(error instanceof Error ? error.message : 'Failed to flush buffer')
    }
  }, [updateMessage, setError])

  const retryStreaming = useCallback(async (messageId: string, conversationId: string) => {
    try {
      // Clear existing stream
      clearStream(messageId, conversationId)
      
      // Retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000)
      
      setTimeout(async () => {
        try {
          // Get original message and retry
          const message = { id: messageId, conversationId } as ChatMessageType
          await startStreaming(message)
        } catch (error) {
          console.error('Retry failed:', error)
          setError('Retry failed')
        }
      }, delay)

      return true
    } catch (error) {
      console.error('Error retrying stream:', error)
      setError(error instanceof Error ? error.message : 'Failed to retry streaming')
      throw error
    }
  }, [clearStream, reconnectAttempts, startStreaming, setError])

  const getStreamingStatus = useCallback((messageId: string, conversationId: string) => {
    const chunks = getStreamChunks(messageId, conversationId)
    const content = getStreamContent(messageId, conversationId)
    const streaming = isStreaming(messageId, conversationId)
    const inQueue = isInQueue(messageId)

    return {
      isStreaming: streaming,
      isInQueue: inQueue,
      chunks: chunks,
      content: content,
      progress: chunks.length > 0 ? chunks.length : 0,
      isComplete: chunks.length > 0 && chunks[chunks.length - 1]?.isComplete
    }
  }, [getStreamChunks, getStreamContent, isStreaming, isInQueue])

  const getStreamingMetrics = useCallback((): StreamingMetrics => {
    return {
      totalChunks: streamingState.metrics.totalChunks,
      totalBytes: streamingState.metrics.totalBytes,
      averageLatency: streamingState.metrics.averageLatency,
      errorCount: streamingState.metrics.errorCount,
      successRate: streamingState.metrics.totalChunks > 0 
        ? (streamingState.metrics.totalChunks - streamingState.metrics.errorCount) / streamingState.metrics.totalChunks
        : 0,
      lastStreamTime: Date.now()
    }
  }, [streamingState.metrics])

  const clearAllStreams = useCallback(() => {
    try {
      // Clear all buffers
      bufferRef.current.clear()
      
      // Clear all timeouts
      flushTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
      flushTimeoutRef.current.clear()
      
      // Reset metrics
      resetMetrics()
      
      notifySuccess('Streams Limpos', 'Todos os streams foram limpos')
      return true
    } catch (error) {
      console.error('Error clearing streams:', error)
      setError(error instanceof Error ? error.message : 'Failed to clear streams')
      throw error
    }
  }, [resetMetrics, notifySuccess, setError])

  const connectWebSocket = useCallback(async () => {
    try {
      setIsConnecting(true)
      await connect()
      notifySuccess('Conectado', 'WebSocket conectado com sucesso')
    } catch (error) {
      console.error('Error connecting WebSocket:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect WebSocket')
      notifyError('Erro de Conexão', 'Falha ao conectar WebSocket')
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [connect, notifySuccess, notifyError, setError])

  const disconnectWebSocket = useCallback(() => {
    try {
      disconnect()
      notifySuccess('Desconectado', 'WebSocket desconectado')
    } catch (error) {
      console.error('Error disconnecting WebSocket:', error)
      setError(error instanceof Error ? error.message : 'Failed to disconnect WebSocket')
      notifyError('Erro', 'Falha ao desconectar WebSocket')
    }
  }, [disconnect, notifySuccess, notifyError, setError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      flushTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
      flushTimeoutRef.current.clear()
      
      // Clear buffers
      bufferRef.current.clear()
    }
  }, [])

  return {
    // State
    isConnected: streamingState.isConnected,
    connectionStatus: streamingState.connectionStatus,
    isConnecting,
    lastError: streamingState.lastError,
    metrics: streamingState.metrics,
    
    // Actions
    startStreaming,
    stopStreaming,
    handleStreamChunk,
    retryStreaming,
    clearAllStreams,
    connectWebSocket,
    disconnectWebSocket,
    
    // Getters
    getStreamingStatus,
    getStreamingMetrics,
    
    // Utilities
    isStreaming,
    isInQueue,
    getStreamChunks,
    getStreamContent
  }
}



