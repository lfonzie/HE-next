import { useState, useCallback, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  metadata?: {
    provider?: string
    model?: string
    tokens?: number
    trace?: any
    blocks?: any[]
    actions?: any[]
    image?: string
    attachment?: any
  }
}

export interface ConversationContext {
  conversationId: string | null
  messages: ChatMessage[]
  isStreaming: boolean
  isLoading: boolean
  error: string | null
  contextSummary: string
}

export interface ConversationManagerConfig {
  autoSave: boolean
  maxContextMessages: number
  enableIntelligentContext: boolean
  enableContextSummary: boolean
  persistConversations: boolean
}

const DEFAULT_CONFIG: ConversationManagerConfig = {
  autoSave: true,
  maxContextMessages: 20,
  enableIntelligentContext: true,
  enableContextSummary: true,
  persistConversations: true
}

export function useConversationManager(config: ConversationManagerConfig = DEFAULT_CONFIG) {
  const { data: session } = useSession()
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    conversationId: null,
    messages: [],
    isStreaming: false,
    isLoading: false,
    error: null,
    contextSummary: ''
  })

  const contextRef = useRef<ConversationContext>(conversationContext)
  const messageBufferRef = useRef<ChatMessage[]>([])
  const lastContextUpdateRef = useRef<number>(0)

  // Atualizar ref quando o contexto muda
  useEffect(() => {
    contextRef.current = conversationContext
  }, [conversationContext])

  /**
   * Inicia uma nova conversa
   */
  const startNewConversation = useCallback(async (): Promise<string> => {
    try {
      setConversationContext(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }))

      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module: 'chat',
          subject: 'Nova conversa'
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao criar nova conversa')
      }

      const { conversationId } = await response.json()
      
      setConversationContext(prev => ({
        ...prev,
        conversationId,
        messages: [],
        contextSummary: '',
        isLoading: false
      }))

      console.log(`✅ [CONVERSATION-MANAGER] Started new conversation: ${conversationId}`)
      return conversationId
    } catch (error) {
      console.error('❌ [CONVERSATION-MANAGER] Error starting conversation:', error)
      setConversationContext(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false
      }))
      throw error
    }
  }, [])

  /**
   * Carrega uma conversa existente
   */
  const loadConversation = useCallback(async (conversationId: string): Promise<void> => {
    try {
      setConversationContext(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }))

      const response = await fetch(`/api/chat/conversations/${conversationId}`)
      if (!response.ok) {
        throw new Error('Conversa não encontrada')
      }

      const conversation = await response.json()
      
      setConversationContext(prev => ({
        ...prev,
        conversationId,
        messages: conversation.messages || [],
        contextSummary: conversation.contextSummary || '',
        isLoading: false
      }))

      console.log(`✅ [CONVERSATION-MANAGER] Loaded conversation: ${conversationId}`)
    } catch (error) {
      console.error('❌ [CONVERSATION-MANAGER] Error loading conversation:', error)
      setConversationContext(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false
      }))
    }
  }, [])

  /**
   * Adiciona uma mensagem à conversa atual
   */
  const addMessage = useCallback(async (
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: ChatMessage['metadata']
  ): Promise<void> => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      role,
      content,
      timestamp: new Date(),
      metadata
    }

    setConversationContext(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))

    // Salvar no banco se configurado
    if (config.persistConversations && conversationContext.conversationId && session?.user?.id) {
      try {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: conversationContext.conversationId,
            message
          })
        })
      } catch (error) {
        console.warn('⚠️ [CONVERSATION-MANAGER] Failed to save message:', error)
      }
    }
  }, [config.persistConversations, conversationContext.conversationId, session?.user?.id])

  /**
   * Envia uma mensagem do usuário e obtém resposta da IA
   */
  const sendMessage = useCallback(async (
    content: string,
    options: {
      provider?: string
      model?: string
      module?: string
      useStreaming?: boolean
    } = {}
  ): Promise<void> => {
    if (!conversationContext.conversationId) {
      await startNewConversation()
    }

    try {
      setConversationContext(prev => ({
        ...prev,
        isStreaming: options.useStreaming !== false,
        error: null
      }))

      // Adicionar mensagem do usuário
      await addMessage('user', content)

      // Preparar contexto inteligente
      const intelligentContext = generateIntelligentContext(
        conversationContext.messages,
        content,
        config.maxContextMessages
      )

      // Enviar para a IA
      const response = await fetch('/api/chat/unified/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: options.provider || 'grok',
          model: options.model || 'grok-4-fast-reasoning',
          input: content,
          module: options.module || 'chat',
          conversationId: conversationContext.conversationId,
          history: intelligentContext
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao obter resposta da IA')
      }

      if (options.useStreaming !== false) {
        // Processar streaming
        await processStreamingResponse(response)
      } else {
        // Processar resposta completa
        const result = await response.json()
        await addMessage('assistant', result.text, {
          provider: options.provider,
          model: options.model,
          tokens: result.usage?.total_tokens
        })
      }

    } catch (error) {
      console.error('❌ [CONVERSATION-MANAGER] Error sending message:', error)
      setConversationContext(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isStreaming: false
      }))
    }
  }, [conversationContext.conversationId, conversationContext.messages, addMessage, startNewConversation, config.maxContextMessages])

  /**
   * Processa resposta em streaming
   */
  const processStreamingResponse = useCallback(async (response: Response): Promise<void> => {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Stream não disponível')
    }

    let assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }

    // Adicionar mensagem vazia para streaming
    setConversationContext(prev => ({
      ...prev,
      messages: [...prev.messages, assistantMessage]
    }))

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              // Finalizar streaming
              setConversationContext(prev => ({
                ...prev,
                messages: prev.messages.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, isStreaming: false }
                    : msg
                ),
                isStreaming: false
              }))
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage.content += parsed.content
                
                // Atualizar mensagem em tempo real
                setConversationContext(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                }))
              }
            } catch (e) {
              console.warn('⚠️ [CONVERSATION-MANAGER] Failed to parse streaming data:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }, [])

  /**
   * Gera contexto inteligente para a IA
   */
  const generateIntelligentContext = useCallback((
    messages: ChatMessage[],
    currentMessage: string,
    maxMessages: number
  ): ChatMessage[] => {
    if (!config.enableIntelligentContext) {
      return messages.slice(-maxMessages)
    }

    // Extrair palavras-chave da mensagem atual
    const keywords = extractKeywords(currentMessage)
    
    // Encontrar mensagens relevantes
    const relevantMessages = messages.filter(msg => 
      isMessageRelevant(msg, keywords)
    )

    // Combinar mensagens relevantes com mensagens recentes
    const recentMessages = messages.slice(-5)
    const combinedMessages = [...new Set([...relevantMessages, ...recentMessages])]
    
    // Ordenar por timestamp e limitar
    return combinedMessages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-maxMessages)
  }, [config.enableIntelligentContext])

  /**
   * Extrai palavras-chave de um texto
   */
  const extractKeywords = useCallback((text: string): string[] => {
    const commonWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'sobre', 'entre', 'que', 'qual', 'quando', 'onde', 'como', 'porque', 'então', 'mas', 'e', 'ou', 'se', 'não', 'sim', 'também', 'já', 'ainda', 'sempre', 'nunca', 'muito', 'pouco', 'mais', 'menos', 'bem', 'mal']
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10)
  }, [])

  /**
   * Verifica se uma mensagem é relevante baseada nas palavras-chave
   */
  const isMessageRelevant = useCallback((message: ChatMessage, keywords: string[]): boolean => {
    const content = message.content.toLowerCase()
    return keywords.some(keyword => content.includes(keyword))
  }, [])

  /**
   * Gera resumo do contexto da conversa
   */
  const generateContextSummary = useCallback((): string => {
    if (!config.enableContextSummary) {
      return ''
    }

    const userMessages = conversationContext.messages.filter(m => m.role === 'user')
    if (userMessages.length === 0) {
      return ''
    }

    const topics = userMessages.slice(0, 3).map(m => 
      m.content.substring(0, 100)
    )
    
    return `Resumo da conversa: ${topics.join('; ')}${userMessages.length > 3 ? '...' : ''}`
  }, [conversationContext.messages, config.enableContextSummary])

  /**
   * Limpa a conversa atual
   */
  const clearConversation = useCallback(() => {
    setConversationContext(prev => ({
      ...prev,
      messages: [],
      contextSummary: '',
      error: null
    }))
  }, [])

  /**
   * Limpa mensagens antigas para manter performance
   */
  const trimOldMessages = useCallback(() => {
    setConversationContext(prev => ({
      ...prev,
      messages: prev.messages.slice(-config.maxContextMessages)
    }))
  }, [config.maxContextMessages])

  // Atualizar resumo do contexto quando necessário
  useEffect(() => {
    const now = Date.now()
    if (now - lastContextUpdateRef.current > 5000) { // A cada 5 segundos
      const summary = generateContextSummary()
      if (summary !== conversationContext.contextSummary) {
        setConversationContext(prev => ({
          ...prev,
          contextSummary: summary
        }))
        lastContextUpdateRef.current = now
      }
    }
  }, [conversationContext.messages, generateContextSummary, conversationContext.contextSummary])

  return {
    // Estado
    conversationContext,
    
    // Ações principais
    startNewConversation,
    loadConversation,
    sendMessage,
    addMessage,
    
    // Utilitários
    clearConversation,
    trimOldMessages,
    generateContextSummary,
    
    // Configuração
    config
  }
}