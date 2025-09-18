"use client"

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react'
import { Message as ChatMessageType } from '@/types'

// Types
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
}

export interface StreamingConfig {
  bufferSize: number
  flushInterval: number
  maxRetries: number
  retryDelay: number
  enableCompression: boolean
  enableEncryption: boolean
}

export interface StreamingState {
  activeStreams: Map<string, StreamChunk[]>
  streamingQueue: string[]
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastError: string | null
  config: StreamingConfig
  metrics: {
    totalChunks: number
    totalBytes: number
    averageLatency: number
    errorCount: number
  }
}

// Action Types
type StreamingAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connecting' | 'connected' | 'disconnected' | 'error' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_STREAM_CHUNK'; payload: StreamChunk }
  | { type: 'COMPLETE_STREAM'; payload: { messageId: string; conversationId: string } }
  | { type: 'CLEAR_STREAM'; payload: { messageId: string; conversationId: string } }
  | { type: 'ADD_TO_QUEUE'; payload: string }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'UPDATE_CONFIG'; payload: Partial<StreamingConfig> }
  | { type: 'UPDATE_METRICS'; payload: Partial<StreamingState['metrics']> }
  | { type: 'RESET_METRICS' }

// Initial State
const initialState: StreamingState = {
  activeStreams: new Map(),
  streamingQueue: [],
  isConnected: false,
  connectionStatus: 'disconnected',
  lastError: null,
  config: {
    bufferSize: 1024,
    flushInterval: 100,
    maxRetries: 3,
    retryDelay: 1000,
    enableCompression: true,
    enableEncryption: false
  },
  metrics: {
    totalChunks: 0,
    totalBytes: 0,
    averageLatency: 0,
    errorCount: 0
  }
}

// Reducer
function streamingReducer(state: StreamingState, action: StreamingAction): StreamingState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
        isConnected: action.payload === 'connected'
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        lastError: action.payload,
        metrics: {
          ...state.metrics,
          errorCount: action.payload ? state.metrics.errorCount + 1 : state.metrics.errorCount
        }
      }
    
    case 'ADD_STREAM_CHUNK': {
      const newStreams = new Map(state.activeStreams)
      const streamKey = `${action.payload.conversationId}-${action.payload.messageId}`
      const existingChunks = newStreams.get(streamKey) || []
      
      newStreams.set(streamKey, [...existingChunks, action.payload])
      
      return {
        ...state,
        activeStreams: newStreams,
        metrics: {
          ...state.metrics,
          totalChunks: state.metrics.totalChunks + 1,
          totalBytes: state.metrics.totalBytes + action.payload.content.length
        }
      }
    }
    
    case 'COMPLETE_STREAM': {
      const newStreams = new Map(state.activeStreams)
      const streamKey = `${action.payload.conversationId}-${action.payload.messageId}`
      
      if (newStreams.has(streamKey)) {
        const chunks = newStreams.get(streamKey) || []
        const lastChunk = chunks[chunks.length - 1]
        if (lastChunk) {
          const updatedChunk = { ...lastChunk, isComplete: true }
          chunks[chunks.length - 1] = updatedChunk
          newStreams.set(streamKey, chunks)
        }
      }
      
      return { ...state, activeStreams: newStreams }
    }
    
    case 'CLEAR_STREAM': {
      const newStreams = new Map(state.activeStreams)
      const streamKey = `${action.payload.conversationId}-${action.payload.messageId}`
      newStreams.delete(streamKey)
      return { ...state, activeStreams: newStreams }
    }
    
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        streamingQueue: [...state.streamingQueue, action.payload]
      }
    
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        streamingQueue: state.streamingQueue.filter(id => id !== action.payload)
      }
    
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      }
    
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload }
      }
    
    case 'RESET_METRICS':
      return {
        ...state,
        metrics: {
          totalChunks: 0,
          totalBytes: 0,
          averageLatency: 0,
          errorCount: 0
        }
      }
    
    default:
      return state
  }
}

// Context
interface StreamingContextType {
  state: StreamingState
  dispatch: React.Dispatch<StreamingAction>
  
  // Actions
  addStreamChunk: (chunk: StreamChunk) => void
  completeStream: (messageId: string, conversationId: string) => void
  clearStream: (messageId: string, conversationId: string) => void
  addToQueue: (id: string) => void
  removeFromQueue: (id: string) => void
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
  setError: (error: string | null) => void
  updateConfig: (config: Partial<StreamingConfig>) => void
  resetMetrics: () => void
  
  // Getters
  getStreamChunks: (messageId: string, conversationId: string) => StreamChunk[]
  getStreamContent: (messageId: string, conversationId: string) => string
  isStreaming: (messageId: string, conversationId: string) => boolean
  isInQueue: (id: string) => boolean
  
  // WebSocket management
  connect: () => Promise<void>
  disconnect: () => void
  sendMessage: (message: ChatMessageType) => void
}

const StreamingContext = createContext<StreamingContextType | null>(null)

// Provider Component
export function StreamingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(streamingReducer, initialState)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Actions
  const addStreamChunk = useCallback((chunk: StreamChunk) => {
    dispatch({ type: 'ADD_STREAM_CHUNK', payload: chunk })
  }, [])

  const completeStream = useCallback((messageId: string, conversationId: string) => {
    dispatch({ type: 'COMPLETE_STREAM', payload: { messageId, conversationId } })
  }, [])

  const clearStream = useCallback((messageId: string, conversationId: string) => {
    dispatch({ type: 'CLEAR_STREAM', payload: { messageId, conversationId } })
  }, [])

  const addToQueue = useCallback((id: string) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: id })
  }, [])

  const removeFromQueue = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id })
  }, [])

  const setConnectionStatus = useCallback((status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: status })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const updateConfig = useCallback((config: Partial<StreamingConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config })
  }, [])

  const resetMetrics = useCallback(() => {
    dispatch({ type: 'RESET_METRICS' })
  }, [])

  // Getters
  const getStreamChunks = useCallback((messageId: string, conversationId: string) => {
    const streamKey = `${conversationId}-${messageId}`
    return state.activeStreams.get(streamKey) || []
  }, [state.activeStreams])

  const getStreamContent = useCallback((messageId: string, conversationId: string) => {
    const chunks = getStreamChunks(messageId, conversationId)
    return chunks.map(chunk => chunk.content).join('')
  }, [getStreamChunks])

  const isStreaming = useCallback((messageId: string, conversationId: string) => {
    const chunks = getStreamChunks(messageId, conversationId)
    return chunks.length > 0 && !chunks[chunks.length - 1]?.isComplete
  }, [getStreamChunks])

  const isInQueue = useCallback((id: string) => {
    return state.streamingQueue.includes(id)
  }, [state.streamingQueue])

  // WebSocket management
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus('connecting')
    
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws'
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('🔌 WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        setError(null)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'stream_chunk') {
            addStreamChunk(data.chunk)
          } else if (data.type === 'stream_complete') {
            completeStream(data.messageId, data.conversationId)
          } else if (data.type === 'error') {
            setError(data.message)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
          setError('Failed to parse message')
        }
      }
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        setConnectionStatus('disconnected')
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          setConnectionStatus('error')
          setError('Max reconnection attempts reached')
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
        setError('WebSocket connection error')
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setConnectionStatus('error')
      setError('Failed to establish connection')
    }
  }, [setConnectionStatus, setError, addStreamChunk, completeStream])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setConnectionStatus('disconnected')
    reconnectAttemptsRef.current = 0
  }, [setConnectionStatus])

  const sendMessage = useCallback((message: ChatMessageType) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        message
      }))
    } else {
      setError('WebSocket not connected')
    }
  }, [setError])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  const contextValue: StreamingContextType = {
    state,
    dispatch,
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
  }

  return (
    <StreamingContext.Provider value={contextValue}>
      {children}
    </StreamingContext.Provider>
  )
}

// Hook
export function useStreamingContext() {
  const context = useContext(StreamingContext)
  if (!context) {
    throw new Error('useStreamingContext must be used within a StreamingProvider')
  }
  return context
}

// Selector hooks
export function useStreamingState() {
  const { state } = useStreamingContext()
  return state
}

export function useStreamingActions() {
  const {
    addStreamChunk,
    completeStream,
    clearStream,
    addToQueue,
    removeFromQueue,
    setConnectionStatus,
    setError,
    updateConfig,
    resetMetrics
  } = useStreamingContext()
  
  return {
    addStreamChunk,
    completeStream,
    clearStream,
    addToQueue,
    removeFromQueue,
    setConnectionStatus,
    setError,
    updateConfig,
    resetMetrics
  }
}

export function useStreamingGetters() {
  const {
    getStreamChunks,
    getStreamContent,
    isStreaming,
    isInQueue
  } = useStreamingContext()
  
  return {
    getStreamChunks,
    getStreamContent,
    isStreaming,
    isInQueue
  }
}

export function useWebSocket() {
  const { connect, disconnect, sendMessage, state } = useStreamingContext()
  
  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    lastError: state.lastError
  }
}
