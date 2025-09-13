import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Message, ModuleType, Conversation } from '@/types'

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const { data: session } = useSession()

  const sendMessage = useCallback(async (
    message: string,
    module: string,
    subject?: string,
    grade?: string,
    conversationId?: string,
    image?: string,
    attachment?: File,
    useWebSearch?: boolean
  ) => {
    // Temporariamente desabilitado para desenvolvimento
    // if (!session) throw new Error("User not authenticated")

    setIsStreaming(true)
    
    try {
      // Temporariamente desabilitado para desenvolvimento
      // const token = localStorage.getItem("token")
      // if (!token) throw new Error("No auth token available")

      // Include conversation history for context
      const conversationHistory = currentConversation?.messages || []

      const requestBody = {
        message,
        module: module || "ATENDIMENTO",
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
      
      // Retry logic for network failures
      let response: Response | undefined
      let retryCount = 0
      const maxRetries = 2
      
      while (retryCount <= maxRetries) {
        try {
          response = await fetch('/api/chat/stream', {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              // Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          })
          break // Success, exit retry loop
        } catch (networkError: any) {
          retryCount++
          if (retryCount > maxRetries) {
            console.error('[Chat] Max retries exceeded:', networkError)
            throw new Error(`Falha de rede após ${maxRetries} tentativas: ${networkError.message}`)
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
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
      let finalTier: "IA" | "IA_SUPER" | undefined = undefined
      let receivedDone = false

      // Create unique message IDs for proper tracking
      const userMessageId = `user-${Date.now()}`
      const assistantMessageId = `assistant-${Date.now()}`

      // Create assistant message immediately to ensure it appears
      setCurrentConversation(prev => {
        if (!prev) {
          // Create new conversation if it doesn't exist
          const newConversation = {
            id: conversationId || `conv-${Date.now()}`,
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
            module: module || "ATENDIMENTO",
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
              isStreaming: true
            })
          }
          
          return {
            ...prev,
            messages: updatedMessages,
            updatedAt: new Date()
          }
        }
      })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataString = line.slice(6)
            
            // Check for [DONE] signal first
            if (dataString === '[DONE]') {
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
            
            try {
              const data = JSON.parse(dataString)
              
              // Filter metadata information to not display in UI
              if (data.metadata) {
                if (data.metadata.model) {
                  finalModel = data.metadata.model
                }
                if (data.metadata.tokens) {
                  tokenCount = data.metadata.tokens
                }
                if (data.metadata.tier) {
                  finalTier = data.metadata.tier
                }
                continue // Don't process as content
              }
              
              if (data.content) {
                // Ensure content is in UTF-8
                const utf8Content = new TextDecoder('utf-8').decode(
                  new TextEncoder().encode(data.content)
                )
                assistantMessage += utf8Content
                
                // Capture received model
                if (data.model) {
                  finalModel = data.model
                }
                
                // Update streaming content in real-time
                setCurrentConversation(prev => {
                  if (!prev) return prev
                  
                  const updatedMessages = prev.messages.map(msg => {
                    if (msg.id === assistantMessageId) {
                      return {
                        ...msg,
                        content: assistantMessage,
                        model: data.model || finalModel,
                        isStreaming: true,
                        webSearchUsed: data.webSearchUsed,
                        citations: data.citations,
                        searchTime: data.searchTime,
                        structured: data.structured || msg.structured
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
              
              if (data.error) {
                console.error('[Chat] Server error received:', data.error)
                setCurrentConversation(prev => {
                  if (!prev) return prev
                  
                  const updatedMessages = prev.messages.map(msg => {
                    if (msg.id === assistantMessageId) {
                      return {
                        ...msg,
                        content: `❌ Erro: ${data.error}`,
                        isStreaming: false,
                        hasError: true
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
                
                setIsStreaming(false)
                return
              }
            } catch (parseError: any) {
              console.error('[Chat] Failed to parse streaming data:', parseError)
              continue
            }
          }
        }
      }

      // If stream ends without sending [DONE] signal, finalize message
      if (!receivedDone) {
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
      }

      return {
        conversationId: finalConversationId,
        response: assistantMessage,
        tokens: tokenCount,
        model: finalModel,
      }
      
    } catch (error) {
      setIsStreaming(false)
      throw error
    } finally {
      setIsStreaming(false)
    }
  }, [session, currentConversation])

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
    setCurrentConversation({
      id: "",
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

  return {
    conversations,
    currentConversation,
    isStreaming,
    sendMessage,
    fetchConversations,
    startNewConversation,
    loadConversation,
    setCurrentConversation,
  }
}
