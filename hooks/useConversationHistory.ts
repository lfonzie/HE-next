import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  module?: string
  model?: string
  tokens?: number
  metadata?: any
}

export interface ConversationHistory {
  conversationId: string
  messages: ConversationMessage[]
  module: string
  lastUpdated: Date
}

/**
 * Hook para gerenciar histórico de conversas com persistência no banco
 */
export function useConversationHistory() {
  const { data: session } = useSession()
  const [histories, setHistories] = useState<Map<string, ConversationHistory>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Carrega histórico de uma conversa específica
   */
  const loadConversationHistory = useCallback(async (
    conversationId: string,
    limit: number = 20
  ): Promise<ConversationMessage[]> => {
    if (!session?.user?.id) {
      console.warn('⚠️ [CONVERSATION-HISTORY] No session available')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/chat/history?conversationId=${conversationId}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error(`Failed to load history: ${response.statusText}`)
      }

      const data = await response.json()
      const messages = data.messages || []

      // Atualizar cache local
      setHistories(prev => {
        const newMap = new Map(prev)
        newMap.set(conversationId, {
          conversationId,
          messages,
          module: data.module || 'auto',
          lastUpdated: new Date()
        })
        return newMap
      })

      return messages
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ [CONVERSATION-HISTORY] Error loading history:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  /**
   * Carrega histórico recente de um módulo
   */
  const loadModuleHistory = useCallback(async (
    module: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> => {
    if (!session?.user?.id) {
      console.warn('⚠️ [CONVERSATION-HISTORY] No session available')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/chat/history?module=${module}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error(`Failed to load module history: ${response.statusText}`)
      }

      const data = await response.json()
      return data.messages || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ [CONVERSATION-HISTORY] Error loading module history:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  /**
   * Salva histórico de uma conversa
   */
  const saveConversationHistory = useCallback(async (
    conversationId: string,
    messages: ConversationMessage[],
    module: string,
    subject?: string,
    grade?: string,
    tokenCount: number = 0,
    model?: string
  ): Promise<boolean> => {
    if (!session?.user?.id) {
      console.warn('⚠️ [CONVERSATION-HISTORY] No session available')
      return false
    }

    try {
      const response = await fetch('/api/chat/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          messages,
          module,
          subject,
          grade,
          tokenCount,
          model
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to save history: ${response.statusText}`)
      }

      // Atualizar cache local
      setHistories(prev => {
        const newMap = new Map(prev)
        newMap.set(conversationId, {
          conversationId,
          messages,
          module,
          lastUpdated: new Date()
        })
        return newMap
      })

      return true
    } catch (err) {
      console.error('❌ [CONVERSATION-HISTORY] Error saving history:', err)
      return false
    }
  }, [session?.user?.id])

  /**
   * Obtém histórico do cache local
   */
  const getCachedHistory = useCallback((conversationId: string): ConversationMessage[] => {
    const history = histories.get(conversationId)
    return history?.messages || []
  }, [histories])

  /**
   * Limpa cache de uma conversa
   */
  const clearCachedHistory = useCallback((conversationId: string) => {
    setHistories(prev => {
      const newMap = new Map(prev)
      newMap.delete(conversationId)
      return newMap
    })
  }, [])

  /**
   * Limpa todo o cache
   */
  const clearAllCache = useCallback(() => {
    setHistories(new Map())
  }, [])

  /**
   * Verifica se uma conversa está no cache
   */
  const hasCachedHistory = useCallback((conversationId: string): boolean => {
    return histories.has(conversationId)
  }, [histories])

  /**
   * Obtém histórico com fallback para cache
   */
  const getHistoryWithFallback = useCallback(async (
    conversationId: string,
    limit: number = 20
  ): Promise<ConversationMessage[]> => {
    // Primeiro tenta o cache
    const cached = getCachedHistory(conversationId)
    if (cached.length > 0) {
      return cached.slice(-limit)
    }

    // Se não tem cache, carrega do banco
    return await loadConversationHistory(conversationId, limit)
  }, [getCachedHistory, loadConversationHistory])

  return {
    // Estados
    loading,
    error,
    histories: Array.from(histories.values()),

    // Métodos
    loadConversationHistory,
    loadModuleHistory,
    saveConversationHistory,
    getCachedHistory,
    getHistoryWithFallback,
    clearCachedHistory,
    clearAllCache,
    hasCachedHistory
  }
}
