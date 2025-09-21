import { useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useGlobalLoading } from '@/hooks/useGlobalLoading'

interface MultiProviderChatOptions {
  forceProvider?: 'openai' | 'google' | 'auto'
  useCache?: boolean
  onStreamingStart?: () => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  provider?: string
  model?: string
  complexity?: string
  latency?: number
}

interface MultiProviderChatResult {
  sendMessage: (message: string, module?: string) => Promise<{
    response: string
    provider: string
    model: string
    complexity: string
    latency: number
  }>
  isStreaming: boolean
  lastMessage: ChatMessage | null
  cancelCurrentRequest: () => void
}

export function useMultiProviderChat(options: MultiProviderChatOptions = {}): MultiProviderChatResult {
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null)
  
  // Handle prerendering - don't use useSession during SSR
  let session = null
  if (typeof window !== 'undefined') {
    try {
      const { useSession } = require('next-auth/react')
      const sessionResult = useSession()
      session = sessionResult.data
    } catch (error) {
      // Handle case where useSession fails during prerendering
      session = null
    }
  }
  
  const { startLoading, stopLoading } = useGlobalLoading()
  
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const {
    forceProvider = 'auto',
    useCache = true,
    onStreamingStart
  } = options

  const sendMessage = useCallback(async (
    message: string, 
    module: string = 'auto'
  ) => {
    if (!message?.trim()) {
      throw new Error('Message is required')
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Criar novo AbortController
    abortControllerRef.current = new AbortController()
    
    setIsStreaming(true)
    startLoading('Processando mensagem...', 'data')
    onStreamingStart?.()

    try {
      const response = await fetch('/api/chat/ai-sdk-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          message: message.trim(),
          module,
          useCache,
          forceProvider
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Extrair metadados dos headers
      const provider = response.headers.get('X-Provider') || 'unknown'
      const model = response.headers.get('X-Model') || 'unknown'
      const complexity = response.headers.get('X-Complexity') || 'unknown'
      const latency = parseInt(response.headers.get('X-Latency') || '0')

      // Ler resposta streaming
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      let fullResponse = ''
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
        }
      } finally {
        reader.releaseLock()
      }

      // Criar mensagem com metadados
      const chatMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        provider,
        model,
        complexity,
        latency
      }

      setLastMessage(chatMessage)
      
      return {
        response: fullResponse,
        provider,
        model,
        complexity,
        latency
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled')
        return {
          response: '',
          provider: 'cancelled',
          model: 'none',
          complexity: 'none',
          latency: 0
        }
      }
      
      console.error('Multi-provider chat error:', error)
      throw error
    } finally {
      setIsStreaming(false)
      stopLoading()
    }
  }, [forceProvider, useCache, startLoading, stopLoading, onStreamingStart])

  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    sendMessage,
    isStreaming,
    lastMessage,
    cancelCurrentRequest
  }
}

// Hook para obter estatísticas dos providers
export function useProviderStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat/ai-sdk-multi')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching provider stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    loading,
    fetchStats
  }
}
