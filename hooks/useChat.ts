import { useState, useCallback, useRef, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Message, ModuleType, Conversation } from '@/types'
import { useChatContext } from '@/components/providers/ChatContext'
import { useGlobalLoading } from '@/hooks/useGlobalLoading'
import { encodeMessage, decodeMessage, normalizeUnicode } from '@/utils/unicode'

// Função para converter módulo da API para formato do sistema
function convertApiModuleToSystem(apiModule: string): string {
  const moduleMapping: Record<string, string> = {
    'PROFESSOR': 'professor',
    'AULA_EXPANDIDA': 'aula-expandida',
    'ENEM_INTERATIVO': 'enem-interativo',
    'AULA_INTERATIVA': 'aula_interativa',
    'ENEM': 'enem',
    'TI_TROUBLESHOOTING': 'ti_troubleshooting',
    'FAQ_ESCOLA': 'faq_escola',
    'FINANCEIRO': 'financeiro',
    'RH': 'rh',
    'COORDENACAO': 'coordenacao',
    'BEM_ESTAR': 'bem-estar',
    'SOCIAL_MEDIA': 'social-media',
    'CONTEUDO_MIDIA': 'conteudo_midia',
    'ATENDIMENTO': 'atendimento'
  }
  
  return moduleMapping[apiModule] || 'auto'
}

export function useChat(onStreamingStart?: () => void) {
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
  const { startLoading, stopLoading, updateProgress } = useGlobalLoading()
  
  // Refs para otimização
  const abortControllerRef = useRef<AbortController | null>(null)
  const messageQueueRef = useRef<Message[]>([])
  const lastMessageIdRef = useRef<string | null>(null)
  
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
    moduleParam: string,
    subject?: string,
    grade?: string,
    conversationId?: string,
    image?: string,
    attachment?: File,
    useWebSearch?: boolean,
    provider?: 'auto' | 'openai' | 'google' | 'anthropic' | 'mistral' | 'groq',
    complexity?: 'simple' | 'complex' | 'fast'
  ) => {
    // Limpar erros anteriores
    setError(null)
    setFirstTokenReceived(false)
    
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Criar novo AbortController
    abortControllerRef.current = new AbortController()
    
    // Temporariamente desabilitado para desenvolvimento
    // if (!session) throw new Error("User not authenticated")

    // Mostrar loading global
    startLoading("Carregando…", 'data')

    setIsStreaming(true)
    onStreamingStart?.() // Hide global loading overlay when streaming starts
    
    try {
      // Temporariamente desabilitado para desenvolvimento
      // const token = localStorage.getItem("token")
      // if (!token) throw new Error("No auth token available")

      // Usar módulo fornecido ou 'auto' para classificação automática
      let finalModule = moduleParam || "auto"
      console.log(`🎯 Usando módulo: ${finalModule}`)

      // Include conversation history for context
      const conversationHistory = currentConversation?.messages || []

      const requestBody = {
        message,
        module: finalModule,
        subject,
        grade,
        conversationId,
        history: conversationHistory.slice(-10), // Last 10 messages for context
        image,
        attachment: attachment ? {
          name: attachment.name,
          type: attachment.type,
          size: attachment.size
        } : undefined,
        useWebSearch
      }
      
      // Retry logic otimizado para network failures
      let response: Response | undefined
      let currentRetryCount = 0
      const maxRetries = 1 // Reduzido de 3 para 1
      
      while (currentRetryCount <= maxRetries) {
        try {
          // Preparar mensagens para o multi-provider
          const messages = [
            ...conversationHistory.slice(-10).map(msg => ({
              role: msg.role,
              content: decodeMessage(msg.content) // Decodificar mensagens do histórico
            })),
            {
              role: 'user' as const,
              content: encodeMessage(message) // Codificar mensagem atual
            }
          ]

          response = await fetch('/api/chat/multi-provider', {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              // Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              messages,
              module: finalModule,
              provider: 'auto',
              complexity: 'simple'
            }),
            signal: abortControllerRef.current.signal
          })
          
          if (!response.ok) {
            // Tentar obter detalhes do erro do servidor
            let errorDetails = response.statusText
            try {
              const errorData = await response.json()
              errorDetails = errorData.error || errorData.message || response.statusText
            } catch {
              // Se não conseguir parsear JSON, usar statusText
            }
            throw new Error(`HTTP ${response.status}: ${errorDetails}`)
          }
          
          break // Success, exit retry loop
        } catch (networkError: any) {
          // Se foi cancelado pelo AbortController, não tentar novamente
          if (networkError.name === 'AbortError') {
            throw networkError
          }
          
          currentRetryCount++
          setRetryCount(currentRetryCount)
          
          if (currentRetryCount > maxRetries) {
            console.error('[Chat] Max retries exceeded:', networkError)
            setError(`Falha de rede após ${maxRetries} tentativas: ${networkError.message}`)
            throw new Error(`Falha de rede após ${maxRetries} tentativas: ${networkError.message}`)
          }
          
          // Delay otimizado - máximo 3 segundos em vez de 10
          const delay = Math.min(1000 * Math.pow(1.5, currentRetryCount) + Math.random() * 500, 3000)
          console.log(`🔄 [RETRY] Tentativa ${currentRetryCount}/${maxRetries} em ${delay}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      if (!response || !response.ok) {
        const error = response ? await response.json() : { message: "No response received" }
        throw new Error(error.message || "Chat request failed")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        console.error('[Chat] No response reader available')
        throw new Error("No response reader - verifique a conexão com o servidor")
      }

      const decoder = new TextDecoder('utf-8')
      let assistantMessage = ""
      let finalConversationId = conversationId
      let tokenCount = 0
      let finalModel = ""
      let finalTier: "IA" | "IA_SUPER" | "IA_ECO" | undefined = undefined
      let receivedDone = false

      // Create unique message IDs for proper tracking with additional randomness
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const userMessageId = `user-${timestamp}-${randomSuffix}`
      const assistantMessageId = `assistant-${timestamp}-${randomSuffix}`

      // Create assistant message immediately to ensure it appears
      setCurrentConversation(prev => {
        if (!prev) {
          // Create new conversation if it doesn't exist
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
          // Add messages to existing conversation
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
              module: undefined // Garantir que não há módulo inicial
            })
          }
          
          return {
            ...prev,
            messages: updatedMessages,
            updatedAt: new Date()
          }
        }
      })

      // Extrair informações do provedor dos headers
      const provider = response.headers.get('X-Provider') || 'unknown'
      const model = response.headers.get('X-Model') || 'unknown'
      const module = response.headers.get('X-Module') || finalModule
      const complexity = response.headers.get('X-Complexity') || 'simple'
      const tier = response.headers.get('X-Tier') as "IA" | "IA_SUPER" | "IA_ECO" | undefined
      const routingReasoning = response.headers.get('X-Routing-Reasoning') || ''
      
      finalModel = model
      finalTier = tier
      finalModule = convertApiModuleToSystem(module)

      // Atualizar o módulo ativo no sidebar para refletir o módulo detectado
      // Chamamos uma única vez por resposta, antes do loop de streaming, para evitar múltiplas trocas
      try {
        if (finalModule) {
          autoSwitchModule(finalModule)
        }
      } catch (e) {
        // Em caso de falha, apenas segue sem quebrar o fluxo de streaming
        console.warn('[Chat] Falha ao alternar módulo automaticamente:', e)
      }

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
                  complexity: complexity,
                  routingReasoning: routingReasoning,
                  isStreaming: false
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

        const chunk = decoder.decode(value)
        
        // Multi-provider retorna texto simples, não JSON
        assistantMessage += decodeMessage(chunk) // Decodificar chunk Unicode
        
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
      }
      
    } catch (error) {
      setIsStreaming(false)
      stopLoading()
      throw error
    } finally {
      setIsStreaming(false)
      // Garantir que o loading seja escondido mesmo em caso de erro
      if (!firstTokenReceived) {
        stopLoading()
      }
    }
  }, [session, currentConversation, setSelectedModule, startLoading, stopLoading])

  const fetchConversations = useCallback(async () => {
    if (!session) return

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch('/api/conversations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Convert timestamp strings to Date objects for all conversations
        const conversations = (data.conversations || []).map((conv: any) => ({
          ...conv,
          createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
          updatedAt: conv.updatedAt ? new Date(conv.updatedAt) : new Date(),
          messages: conv.messages ? conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          })) : []
        }))
        
        setConversations(conversations)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    }
  }, [session])

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

  const loadConversation = useCallback(async (conversationId: string) => {
    if (!session) return

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Convert timestamp strings to Date objects for messages
        if (data.conversation && data.conversation.messages) {
          data.conversation.messages = data.conversation.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }))
        }
        
        // Convert conversation dates
        if (data.conversation.createdAt) {
          data.conversation.createdAt = new Date(data.conversation.createdAt)
        }
        if (data.conversation.updatedAt) {
          data.conversation.updatedAt = new Date(data.conversation.updatedAt)
        }
        
        setCurrentConversation(data.conversation)
      } else {
        console.error("Failed to load conversation:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to load conversation:", error)
    }
  }, [session])

  // Função para cancelar requisição atual
  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
    }
  }, [])

  // Função para limpar erros
  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  // Função para buscar conversas com filtros
  const searchConversations = useCallback((query: string) => {
    if (!query.trim()) return conversations
    
    const searchTerm = query.toLowerCase()
    return conversations.filter(conv => 
      (conv.title ?? '').toLowerCase().includes(searchTerm) ||
      conv.messages.some(msg => 
        msg.content.toLowerCase().includes(searchTerm)
      )
    )
  }, [conversations])

  // Função para obter estatísticas das conversas
  const getConversationStats = useCallback(() => {
    const totalTokens = conversations.reduce((total, conv) => 
      total + (conv.tokenCount || 0), 0
    )
    
    const avgMessagesPerConversation = conversations.length > 0 
      ? totalMessages / conversations.length 
      : 0
    
    const mostUsedModule = conversations.reduce((acc, conv) => {
      acc[conv.module] = (acc[conv.module] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topModule = Object.entries(mostUsedModule)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum'
    
    return {
      totalConversations: conversations.length,
      totalMessages,
      totalTokens,
      avgMessagesPerConversation: Math.round(avgMessagesPerConversation * 10) / 10,
      mostUsedModule: topModule
    }
  }, [conversations, totalMessages])

  // Função para exportar conversa atual
  const exportCurrentConversation = useCallback(() => {
    if (!currentConversation) return null
    
    const exportData = {
      conversation: {
        id: currentConversation.id,
        title: currentConversation.title,
        module: currentConversation.module,
        createdAt: currentConversation.createdAt,
        updatedAt: currentConversation.updatedAt,
        tokenCount: currentConversation.tokenCount
      },
      messages: currentConversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        model: msg.model,
        tokens: msg.tokens,
        tier: msg.tier
      }))
    }
    
    return exportData
  }, [currentConversation])

  // Função para importar conversa
  const importConversation = useCallback((importData: any) => {
    try {
      const newConversation: Conversation = {
        id: importData.conversation.id || `imported-${Date.now()}`,
        title: importData.conversation.title || 'Conversa Importada',
        module: importData.conversation.module || 'ATENDIMENTO',
        messages: importData.messages.map((msg: any) => ({
          id: `imported-${Date.now()}-${Math.random()}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          model: msg.model,
          tokens: msg.tokens,
          tier: msg.tier
        })),
        tokenCount: importData.conversation.tokenCount || 0,
        createdAt: new Date(importData.conversation.createdAt),
        updatedAt: new Date(importData.conversation.updatedAt)
      }
      
      setConversations(prev => [newConversation, ...prev])
      setCurrentConversation(newConversation)
      
      return true
    } catch (error) {
      console.error('Erro ao importar conversa:', error)
      return false
    }
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
    fetchConversations,
    startNewConversation,
    loadConversation,
    setCurrentConversation,
    
    // Funções de controle
    cancelCurrentRequest,
    clearError,
    
    // Funções de busca e análise
    searchConversations,
    getConversationStats,
    
    // Funções de importação/exportação
    exportCurrentConversation,
    importConversation,
  }
}
