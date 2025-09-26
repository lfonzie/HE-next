import { useState, useCallback, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useSession } from 'next-auth/react'
import { Conversation as ChatConversation, Message as ChatMessageType } from '@/types'
import { useGlobalLoading } from '@/hooks/useGlobalLoading'

export function useChat(onStreamingStart?: () => void) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [firstTokenReceived, setFirstTokenReceived] = useState(false)
  
  const { data: session } = useSession()
  const { startLoading, stopLoading } = useGlobalLoading()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Inicializar conversa automaticamente se não houver uma ativa
  useEffect(() => {
    if (!currentConversation && session?.user?.id) {
      const initialConversation: ChatConversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        title: 'Nova conversa',
        module: 'auto',
        messages: [],
        subject: undefined,
        grade: undefined,
        tokenCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setCurrentConversation(initialConversation)
      console.log('🆕 [useChat] Conversa inicial criada automaticamente:', initialConversation.id)
    }
  }, [currentConversation, session?.user?.id])

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
    if (!message?.trim()) {
      throw new Error('Message is required')
    }

    const trimmedMessage = message.trim()
    setIsStreaming(true)
    setError(null)
    setRetryCount(0)
    setFirstTokenReceived(false)
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new AbortController
    abortControllerRef.current = new AbortController()
    
    startLoading("Enviando mensagem...", "data")
    onStreamingStart?.() // Hide global loading overlay when streaming starts
    
    try {
      // Use provided module or 'auto' for automatic classification
      let finalModule = moduleParam || "auto"
      console.log(`🎯 Usando módulo: ${finalModule}`)

      // Include conversation history for context
      const conversationHistory = currentConversation?.messages || []
      
      // Garantir que sempre temos um conversationId válido
      const finalConversationId = conversationId || currentConversation?.id || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

      const requestBody = {
        message: trimmedMessage,
        module: finalModule,
        conversationId: finalConversationId,
        history: conversationHistory.slice(-3), // AI SDK Multi uses only last 3 messages for speed
        useCache: true, // Enable cache for better performance
        forceProvider: 'auto' // Let AI SDK choose the best provider automatically
      }

      // Final validation before sending
      if (!requestBody.message || requestBody.message.length === 0) {
        console.error('[Chat] Request body validation failed:', requestBody);
        throw new Error('Request body validation failed: message is empty after trimming');
      }

      console.debug('[Chat] Request body:', {
        message: requestBody.message.substring(0, 50) + '...',
        module: requestBody.module,
        conversationId: requestBody.conversationId,
        historyLength: requestBody.history.length,
        useCache: requestBody.useCache,
        forceProvider: requestBody.forceProvider
      });
      
      // Retry logic optimized for network failures
      let response: Response | undefined
      let currentRetryCount = 0
      const maxRetries = 1 // Reduced from 3 to 1
      
      // Create unique message IDs for proper tracking with additional randomness
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const userMessageId = `user-${timestamp}-${randomSuffix}`
      const assistantMessageId = `assistant-${timestamp}-${randomSuffix}`
      
      while (currentRetryCount <= maxRetries) {
        try {
          response = await fetch('/api/chat/stream-optimized', {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(requestBody),
            signal: abortControllerRef.current.signal
          })
          
          if (!response.ok) {
            // Try to get error details from server
            let errorDetails = response.statusText
            try {
              const errorData = await response.json()
              errorDetails = errorData.error || errorData.message || response.statusText
            } catch {
              // If can't parse JSON, use statusText
            }
            throw new Error(`HTTP ${response.status}: ${errorDetails}`)
          }
          
          break // Success, exit retry loop
        } catch (networkError: any) {
          // If cancelled by AbortController, don't retry
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
          
          // Optimized delay - maximum 3 seconds instead of 10
          const delay = Math.min(1000 * Math.pow(1.5, currentRetryCount) + Math.random() * 500, 3000)
          console.log(`🔄 [RETRY] Tentativa ${currentRetryCount}/${maxRetries} em ${delay}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      if (!response || !response.ok) {
        const error = response ? await response.json() : { message: "No response received" }
        throw new Error(error.message || "Chat request failed")
      }

      const decoder = new TextDecoder('utf-8')
      
      // Capture metadata from multi-provider
      const provider = response.headers.get('X-Provider') || 'unknown'
      const model = response.headers.get('X-Model') || 'unknown'
      const complexity = response.headers.get('X-Complexity') || 'unknown'
      const latency = parseInt(response.headers.get('X-Latency') || '0')
      
      console.log(`🎯 [MULTI-PROVIDER] Using ${provider}:${model} (complexity: ${complexity}, latency: ${latency}ms)`)

      // Check if response is streaming (text/event-stream) or JSON
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('text/event-stream')) {
        // Process streaming response
        console.log('[Chat] Processing streaming response')
        
        // Create initial assistant message for streaming
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
                  content: '',
                  timestamp: new Date(),
                  isStreaming: true
                }
              ],
              module: moduleParam || "auto",
              subject,
              grade,
              createdAt: new Date(),
              updatedAt: new Date()
            }
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
            
            // Add initial assistant message for streaming
            updatedMessages.push({
              id: assistantMessageId,
              role: "assistant" as const,
              content: '',
              timestamp: new Date(),
              isStreaming: true
            })
            
            return {
              ...prev,
              messages: updatedMessages,
              updatedAt: new Date()
            }
          }
        })
        
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

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  
                  if (parsed.content) {
                    // Content chunk - real streaming
                    fullResponse += parsed.content
                    
                    // Debug logging
                    console.log('[Chat] Streaming chunk received:', {
                      chunk: parsed.content,
                      fullResponse: fullResponse.substring(0, 50) + '...',
                      assistantMessageId
                    })
                    
                    // Mark first token as received
                    if (!firstTokenReceived) {
                      setFirstTokenReceived(true)
                      stopLoading() // Hide loading overlay when first token arrives
                    }
                    
                    // Update UI with partial content - force immediate update
                    flushSync(() => {
                      setCurrentConversation(prev => {
                        if (!prev) {
                          console.warn('[Chat] No previous conversation found during streaming')
                          return prev
                        }
                        
                        const updatedMessages = prev.messages.map(msg => {
                          if (msg.id === assistantMessageId) {
                            console.log('[Chat] Updating message:', {
                              id: msg.id,
                              oldContent: msg.content?.substring(0, 20) + '...',
                              newContent: fullResponse.substring(0, 20) + '...'
                            })
                            return { ...msg, content: fullResponse, isStreaming: true }
                          }
                          return msg
                        })
                        
                        return {
                          ...prev,
                          messages: updatedMessages
                        }
                      })
                    })
                    
                    // Force a small delay to ensure UI updates
                    await new Promise(resolve => setTimeout(resolve, 10))
                  } else if (parsed.metadata) {
                    // Final metadata received
                    console.log('[Chat] Received metadata:', parsed.metadata)
                    
                    // Finalize streaming and update with metadata
                    setCurrentConversation(prev => {
                      if (!prev) return prev
                      return {
                        ...prev,
                        messages: prev.messages.map(msg => 
                          msg.id === assistantMessageId 
                            ? { 
                                ...msg, 
                                content: fullResponse, 
                                isStreaming: false,
                                model: parsed.metadata.model,
                                tier: parsed.metadata.tier,
                                provider: parsed.metadata.provider,
                                complexity: parsed.metadata.complexity,
                                module: parsed.metadata.module
                              }
                            : msg
                        )
                      }
                    })
                  } else if (parsed.trace) {
                    // Trace information received
                    console.log('[Chat] Received trace:', parsed.trace)
                    
                    // Update module if detected
                    if (parsed.trace.module) {
                      try {
                        autoSwitchModule(parsed.trace.module)
                      } catch (e) {
                        console.warn('[Chat] Failed to switch module:', e)
                      }
                    }
                  }
                } catch (e) {
                  // Ignore malformed lines
                  console.warn('[Chat] Failed to parse streaming data:', e)
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
          setIsStreaming(false)
        }
        
        return // Streaming processed, exit function
        
      } else if (contentType?.includes('application/json')) {
        const jsonData = await response.json()
        
        // Check if it's an error response
        if (jsonData.error) {
          console.error('[Chat] Received JSON error response:', jsonData)
          throw new Error(jsonData.error || jsonData.message || 'Erro desconhecido do servidor')
        }
        
        // It's a valid structured response (orchestrator format)
        console.log('[Chat] Received structured response:', jsonData)
        
        // Handle structured response with blocks and actions
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const userMessageId = `user-${timestamp}-${randomSuffix}`
        const assistantMessageId = `assistant-${timestamp}-${randomSuffix}`
        
        // Create conversation with structured response
        setCurrentConversation(prev => {
          if (!prev) {
            const newConversation = {
              id: finalConversationId,
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
                  content: jsonData.text || '',
                  timestamp: new Date(),
                  isStreaming: false,
                  blocks: jsonData.blocks || [],
                  actions: jsonData.actions || [],
                  trace: jsonData.trace || {}
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
            
            // Add assistant message
            updatedMessages.push({
              id: assistantMessageId,
              role: "assistant" as const,
              content: jsonData.text || '',
              timestamp: new Date(),
              isStreaming: false,
              blocks: jsonData.blocks || [],
              actions: jsonData.actions || [],
              trace: jsonData.trace || {}
            })
            
            return {
              ...prev,
              messages: updatedMessages,
              updatedAt: new Date()
            }
          }
        })
        
        // Update module if detected
        if (jsonData.trace?.module) {
          try {
            autoSwitchModule(jsonData.trace.module)
          } catch (e) {
            console.warn('[Chat] Failed to switch module:', e)
          }
        }

        // Auto-save conversation to database
        try {
          const currentConv = currentConversation
          if (currentConv && session?.user?.id) {
            const saveResponse = await fetch('/api/chat/history', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                conversationId: finalConversationId,
                messages: currentConv.messages,
                module: currentConv.module,
                subject: currentConv.subject,
                grade: currentConv.grade,
                tokenCount: currentConv.tokenCount,
                model: jsonData.trace?.model || 'gpt-4o-mini'
              })
            })
            
            if (saveResponse.ok) {
              console.log('✅ [Chat] Conversation auto-saved to database')
            } else {
              console.warn('⚠️ [Chat] Failed to auto-save conversation')
            }
          }
        } catch (saveError) {
          console.warn('⚠️ [Chat] Error auto-saving conversation:', saveError)
        }
        
        return // Exit early since we handled the structured response
      }

      // If we get here, it's an unsupported response type
      console.error('[Chat] Unsupported response type:', contentType)
      throw new Error(`Tipo de resposta não suportado: ${contentType}`)
      
    } catch (error) {
      setIsStreaming(false)
      stopLoading()
      throw error
    } finally {
      setIsStreaming(false)
      // Ensure loading is hidden even on error
      stopLoading()
    }
  }, [session, currentConversation, startLoading, stopLoading])

  const fetchConversations = useCallback(async () => {
    if (!session) return

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch('/api/chat/conversations', {
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
      console.error('Error fetching conversations:', error)
    }
  }, [session])

  const createConversation = useCallback(async (title?: string) => {
    if (!session) return

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || 'Nova Conversa',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newConversation = {
          ...data.conversation,
          createdAt: new Date(data.conversation.createdAt),
          updatedAt: new Date(data.conversation.updatedAt),
          messages: data.conversation.messages ? data.conversation.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          })) : []
        }
        
        setConversations(prev => [newConversation, ...prev])
        setCurrentConversation(newConversation)
        return newConversation
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }, [session])

  const deleteConversation = useCallback(async (id: string) => {
    if (!session) return

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== id))
        if (currentConversation?.id === id) {
          setCurrentConversation(null)
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  }, [session, currentConversation])

  const updateConversation = useCallback(async (id: string, updates: Partial<ChatConversation>) => {
    if (!session) return

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        const updatedConversation = {
          ...data.conversation,
          createdAt: new Date(data.conversation.createdAt),
          updatedAt: new Date(data.conversation.updatedAt),
          messages: data.conversation.messages ? data.conversation.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          })) : []
        }
        
        setConversations(prev => prev.map(conv => conv.id === id ? updatedConversation : conv))
        if (currentConversation?.id === id) {
          setCurrentConversation(updatedConversation)
        }
      }
    } catch (error) {
      console.error('Error updating conversation:', error)
      throw error
    }
  }, [session, currentConversation])

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null)
  }, [])

  const refreshConversations = useCallback(async () => {
    await fetchConversations()
  }, [fetchConversations])

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const retry = useCallback(() => {
    if (error) {
      setError(null)
      setRetryCount(0)
    }
  }, [error])

  return {
    conversations,
    currentConversation,
    sendMessage,
    createConversation,
    deleteConversation,
    updateConversation,
    clearCurrentConversation,
    setCurrentConversation,
    refreshConversations,
    isStreaming,
    cancelStream,
    error,
    retry
  }
}

// Helper function to auto-switch module
function autoSwitchModule(module: string) {
  // This function would be implemented based on your module switching logic
  console.log(`[Chat] Auto-switching to module: ${module}`)
}