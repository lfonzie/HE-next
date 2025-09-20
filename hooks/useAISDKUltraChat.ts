import { useState, useCallback, useRef, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Message, ModuleType, Conversation } from '@/types'
import { useChatContext } from '@/components/providers/ChatContext'
import { useGlobalLoading } from '@/hooks/useGlobalLoading'
import { encodeMessage, decodeMessage } from '@/utils/unicode'

export function useAISDKUltraChat(onStreamingStart?: () => void) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastClassification, setLastClassification] = useState<{
    module: string
    confidence: number
    rationale: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [firstTokenReceived, setFirstTokenReceived] = useState(false)
  
  const { data: session } = useSession()
  const { setSelectedModule, autoSwitchModule } = useChatContext()
  const { startLoading, stopLoading } = useGlobalLoading()
  
  // Refs para otimização
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Memoized values para performance
  const currentMessages = useMemo(() => 
    currentConversation?.messages || [], 
    [currentConversation?.messages]
  )
  
  const conversationCount = useMemo(() => 
    conversations.length, 
    [conversations.length]
  )
  
  const totalMessages = useMemo(() => 
    conversations.reduce((total, conv) => total + conv.messages.length, 0),
    [conversations]
  )

  const sendMessage = useCallback(async (
    message: string,
    moduleParam: string = 'auto',
    subject?: string,
    grade?: string,
    conversationId?: string,
    image?: string,
    attachment?: File,
    useWebSearch?: boolean,
    provider?: 'auto' | 'openai' | 'google' | 'anthropic' | 'mistral' | 'groq',
    complexity?: 'simple' | 'complex' | 'fast'
  ) => {
    // Validação ultra-rápida
    if (!message?.trim()) {
      throw new Error('Message is required')
    }

    const trimmedMessage = message.trim()
    console.debug('[AISDKUltraChat] Sending message:', { 
      message: message.substring(0, 30) + '...', 
      moduleParam, 
      conversationId 
    })

    // Limpar erros anteriores
    setError(null)
    setFirstTokenReceived(false)
    
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Criar novo AbortController
    abortControllerRef.current = new AbortController()
    
    // Mostrar loading global
    startLoading("Carregando…", 'data')

    setIsStreaming(true)
    onStreamingStart?.()
    
    try {
      let finalModule = moduleParam || "auto"
      console.log(`🎯 Usando módulo: ${finalModule}`)

      // Histórico ultra-reduzido (apenas 2 mensagens para máxima velocidade)
      const conversationHistory = currentConversation?.messages || []

      const requestBody = {
        message: trimmedMessage,
        module: finalModule,
        conversationId,
        history: conversationHistory.slice(-2), // Apenas 2 mensagens
        useCache: true // Cache sempre habilitado para ultra-velocidade
      }

      console.debug('[AISDKUltraChat] Request body:', {
        message: requestBody.message.substring(0, 30) + '...',
        module: requestBody.module,
        conversationId: requestBody.conversationId,
        historyLength: requestBody.history.length
      })
      
      // Requisição ultra-otimizada
      const response = await fetch('/api/chat/ai-sdk-ultra', {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        let errorDetails = response.statusText
        try {
          const errorData = await response.json()
          errorDetails = errorData.error || errorData.message || response.statusText
        } catch {
          // Se não conseguir parsear JSON, usar statusText
        }
        throw new Error(`HTTP ${response.status}: ${errorDetails}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        console.error('[AISDKUltraChat] No response reader available')
        throw new Error("No response reader - verifique a conexão com o servidor")
      }

      const decoder = new TextDecoder('utf-8')
      let assistantMessage = ""
      let finalConversationId = conversationId
      let tokenCount = 0
      let finalModel = ""
      let finalTier: "IA" | "IA_SUPER" | "IA_ECO" | undefined = undefined
      let receivedDone = false

      // Check if response is JSON (error case) instead of streaming
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        console.error('[AISDKUltraChat] Received JSON error response:', errorData)
        throw new Error(errorData.error || errorData.message || 'Erro desconhecido do servidor')
      }

      // Extrair informações dos headers
      const provider = response.headers.get('X-Provider') || 'vercel-ai-sdk-ultra'
      const model = response.headers.get('X-Model') || 'gpt-4o-mini'
      const module = response.headers.get('X-Module') || finalModule
      const isCached = response.headers.get('X-Cached') === 'true'
      const isUltra = response.headers.get('X-Ultra') === 'true'
      
      finalModel = model
      finalModule = module

      // Atualizar o módulo ativo no sidebar
      try {
        if (finalModule && finalModule !== 'auto') {
          autoSwitchModule(finalModule)
        }
      } catch (e) {
        console.warn('[AISDKUltraChat] Falha ao alternar módulo automaticamente:', e)
      }

      // Create unique message IDs
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const userMessageId = `user-${timestamp}-${randomSuffix}`
      const assistantMessageId = `assistant-${timestamp}-${randomSuffix}`

      // Create assistant message immediately
      setCurrentConversation(prev => {
        if (!prev) {
          const newConversation = {
            id: conversationId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            title: message.slice(0, 50),
            messages: [
              { 
                id: userMessageId,
                role: "user" as const, 
                content: message, 
                timestamp: new Date(),
                image: image,
                attachment: attachment
              },
              {
                id: assistantMessageId,
                role: "assistant" as const,
                content: "",
                timestamp: new Date(),
                isStreaming: true
              }
            ],
            module: moduleParam || "auto",
            subject,
            grade,
            tokenCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setConversations(prev => [newConversation, ...prev])
          return newConversation
        } else {
          const updatedMessages = [...prev.messages]
          
          // Add user message if it doesn't exist
          const hasUserMessage = updatedMessages.some(msg => 
            msg.role === "user" && msg.content === message
          )
          
          if (!hasUserMessage) {
            updatedMessages.push({ 
              id: userMessageId,
              role: "user" as const, 
              content: message, 
              timestamp: new Date(),
              image: image,
              attachment: attachment
            })
          }
          
          // Add assistant message if it doesn't exist
          const hasAssistantMessage = updatedMessages.some(msg => 
            msg.role === "assistant" && msg.isStreaming
          )
          
          if (!hasAssistantMessage) {
            updatedMessages.push({
              id: assistantMessageId,
              role: "assistant" as const,
              content: "",
              timestamp: new Date(),
              isStreaming: true,
              module: undefined
            })
          }
          
          return {
            ...prev,
            messages: updatedMessages,
            updatedAt: new Date()
          }
        }
      })

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            receivedDone = true
            
            // Finalize the assistant message
            setCurrentConversation(prev => {
              if (!prev) return prev
              
              const updatedMessages = prev.messages.map(msg => {
                if (msg.id === assistantMessageId) {
                  return {
                    ...msg,
                    content: assistantMessage,
                    model: finalModel,
                    tokens: tokenCount,
                    tier: finalTier,
                    module: finalModule,
                    provider: provider,
                    isStreaming: false,
                    cached: isCached,
                    ultra: isUltra
                  }
                }
                return msg
              })
              
              const finalConversation = {
                ...prev,
                messages: updatedMessages,
                updatedAt: new Date()
              }
              
              // Update conversations list
              setConversations(prevConvs => {
                const existingIndex = prevConvs.findIndex(conv => conv.id === finalConversation.id)
                if (existingIndex >= 0) {
                  const updated = [...prevConvs]
                  updated[existingIndex] = finalConversation
                  return updated
                } else {
                  return [finalConversation, ...prevConvs]
                }
              })
              
              return finalConversation
            })
            
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          assistantMessage += decodeMessage(chunk)
          
          // Atualizar mensagem em tempo real
          setCurrentConversation(prev => {
            if (!prev) return prev
            
            const updatedMessages = prev.messages.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  content: assistantMessage,
                  model: finalModel,
                  module: finalModule
                }
              }
              return msg
            })
            
            return {
              ...prev,
              messages: updatedMessages
            }
          })
        }
      } catch (streamError: any) {
        console.error('[AISDKUltraChat] Streaming error:', streamError)
        
        // If streaming fails, ensure the assistant message is finalized
        setCurrentConversation(prev => {
          if (!prev) return prev
          
          const updatedMessages = prev.messages.map(msg => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                content: assistantMessage || "Desculpe, ocorreu um erro durante o streaming da resposta.",
                model: finalModel,
                tokens: tokenCount,
                tier: finalTier,
                module: finalModule,
                provider: provider,
                isStreaming: false
              }
            }
            return msg
          })
          
          return {
            ...prev,
            messages: updatedMessages,
            updatedAt: new Date()
          }
        })
        
        throw new Error(`Erro no streaming: ${streamError.message}`)
      }
      
      // Hide loading when streaming starts
      if (!firstTokenReceived) {
        setFirstTokenReceived(true)
        setTimeout(() => stopLoading(), 500)
      }

      return {
        conversationId: finalConversationId,
        response: assistantMessage,
        tokens: tokenCount,
        model: finalModel,
        cached: isCached,
        ultra: isUltra
      }
      
    } catch (error) {
      setIsStreaming(false)
      stopLoading()
      throw error
    } finally {
      setIsStreaming(false)
      if (!firstTokenReceived) {
        stopLoading()
      }
    }
  }, [session, currentConversation, setSelectedModule, startLoading, stopLoading])

  const startNewConversation = useCallback((module: string) => {
    const uniqueId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    setCurrentConversation({
      id: uniqueId,
      module,
      messages: [],
      tokenCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }, [])

  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    // Estados principais
    conversations,
    currentConversation,
    currentMessages,
    isStreaming,
    lastClassification,
    error,
    retryCount,
    
    // Estatísticas
    conversationCount,
    totalMessages,
    
    // Funções principais
    sendMessage,
    startNewConversation,
    setCurrentConversation,
    
    // Funções de controle
    cancelCurrentRequest,
    clearError,
  }
}
