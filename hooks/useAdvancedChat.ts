"use client"

import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ModuleType } from '@/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  module?: ModuleType
  isStreaming?: boolean
  tokens?: number
  model?: string
  tier?: "IA" | "IA_SUPER" | "IA_ECO"
  originalQuery?: string
  structured?: boolean
  webSearchUsed?: boolean
  citations?: any[]
  searchTime?: number
  attachment?: any
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  selectedModule: ModuleType
  conversationId?: string
  tokenCount: number
}

export function useAdvancedChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    selectedModule: 'professor',
    tokenCount: 0
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const { toast } = useToast()

  const sendMessage = useCallback(async (message: string, module: ModuleType) => {
    if (!message.trim() || chatState.isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
      module
    }

    // Add user message immediately
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      isStreaming: true
    }))

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          module,
          conversationId: chatState.conversationId
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        module,
        isStreaming: true
      }

      // Add assistant message placeholder
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage]
      }))

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              // Streaming complete
              setChatState(prev => ({
                ...prev,
                isLoading: false,
                isStreaming: false,
                messages: prev.messages.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              }))
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage.content += parsed.content
                
                // Update the streaming message
                setChatState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                }))
              }

              if (parsed.metadata) {
                assistantMessage.tokens = parsed.metadata.tokens
                assistantMessage.model = parsed.metadata.model
                
                setChatState(prev => ({
                  ...prev,
                  tokenCount: prev.tokenCount + (parsed.metadata.tokens || 0)
                }))
              }
            } catch (error) {
              console.error('Error parsing streaming data:', error)
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Error sending message:', error)
      
      if (error.name === 'AbortError') {
        toast({
          title: "Mensagem cancelada",
          description: "A requisição foi cancelada pelo usuário.",
          variant: "default"
        })
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente para continuar.",
          variant: "destructive"
        })
        // Redirecionar para login
        window.location.href = '/login'
      } else {
        toast({
          title: "Erro ao enviar mensagem",
          description: error.message || "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
          variant: "destructive"
        })
      }

      // Remove the assistant message on error
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        messages: prev.messages.filter(msg => msg.role !== 'assistant' || !msg.isStreaming)
      }))
    }
  }, [chatState.isLoading, chatState.conversationId, toast])

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const clearMessages = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      conversationId: undefined,
      tokenCount: 0
    }))
  }, [])

  const setSelectedModule = useCallback((module: ModuleType) => {
    setChatState(prev => ({ ...prev, selectedModule: module }))
  }, [])

  return {
    ...chatState,
    sendMessage,
    cancelStreaming,
    clearMessages,
    setSelectedModule
  }
}
