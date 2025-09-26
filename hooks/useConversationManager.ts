"use client"

import { useCallback, useEffect, useMemo } from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import { useStreamingContext } from '@/contexts/StreamingContext'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { Conversation as ChatConversation, Message as ChatMessageType } from '@/types'

export interface ConversationManagerConfig {
  autoSave: boolean
  maxConversations: number
  enableHistory: boolean
  enableExport: boolean
  enableSearch: boolean
}

export function useConversationManager(config: ConversationManagerConfig = {
  autoSave: true,
  maxConversations: 50,
  enableHistory: true,
  enableExport: true,
  enableSearch: true
}) {
  const {
    state: chatState,
    setActiveConversation,
    addMessage,
    updateMessage,
    clearConversation,
    setError
  } = useChatContext()
  
  const { notifySuccess, notifyError } = useNotificationContext()
  const { clearStream } = useStreamingContext()

  // Computed values
  const conversations = useMemo(() => chatState.conversations, [chatState.conversations])
  const currentConversation = useMemo(() => {
    return conversations.find(conv => conv.id === chatState.activeConversation) || null
  }, [conversations, chatState.activeConversation])

  const hasActiveConversation = useMemo(() => {
    return !!chatState.activeConversation && !!currentConversation
  }, [chatState.activeConversation, currentConversation])

  const conversationCount = useMemo(() => conversations.length, [conversations])

  // Actions
  const createConversation = useCallback(async (module: string, title?: string) => {
    try {
      const newConversation: ChatConversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title || `Nova conversa - ${module}`,
        module,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tokenCount: 0,
        userId: 'current-user' // TODO: Get from auth context
      }

      // Add to conversations list
      const updatedConversations = [newConversation, ...conversations]
        .slice(0, config.maxConversations)

      // Update state
      setActiveConversation(newConversation.id)
      
      // Save to localStorage if enabled
      if (config.autoSave) {
        localStorage.setItem('chat-conversations', JSON.stringify(updatedConversations))
      }

      notifySuccess('Nova Conversa', 'Conversa criada com sucesso!')
      return newConversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      setError('Falha ao criar conversa')
      notifyError('Erro', 'Falha ao criar conversa')
      throw error
    }
  }, [conversations, config, setActiveConversation, notifySuccess, notifyError, setError])

  const loadConversations = useCallback(async () => {
    try {
      if (config.enableHistory && typeof window !== 'undefined') {
        const saved = localStorage.getItem('chat-conversations')
        if (saved) {
          const parsedConversations = JSON.parse(saved)
          // Validate and filter conversations, converting timestamps back to Date objects
          const validConversations = parsedConversations.filter((conv: any) => 
            conv.id && conv.title && conv.module && Array.isArray(conv.messages)
          ).map((conv: any) => ({
            ...conv,
            createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
            updatedAt: conv.updatedAt ? new Date(conv.updatedAt) : new Date(),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
            }))
          }))
          return validConversations
        }
      }
      return []
    } catch (error) {
      console.error('Error loading conversations:', error)
      setError('Falha ao carregar histórico')
      return []
    }
  }, [config.enableHistory, setError])

  const saveConversation = useCallback(async (conversation: ChatConversation) => {
    try {
      if (!config.autoSave) return

      const updatedConversations = conversations.map(conv =>
        conv.id === conversation.id ? conversation : conv
      )

      if (typeof window !== 'undefined') {
        localStorage.setItem('chat-conversations', JSON.stringify(updatedConversations))
      }

      return conversation
    } catch (error) {
      console.error('Error saving conversation:', error)
      setError('Falha ao salvar conversa')
      throw error
    }
  }, [conversations, config.autoSave, setError])

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId)
      
      // Clear active conversation if it was deleted
      if (chatState.activeConversation === conversationId) {
        setActiveConversation(null)
      }

      // Save to localStorage
      if (config.autoSave && typeof window !== 'undefined') {
        localStorage.setItem('chat-conversations', JSON.stringify(updatedConversations))
      }

      notifySuccess('Conversa Excluída', 'Conversa removida com sucesso!')
      return true
    } catch (error) {
      console.error('Error deleting conversation:', error)
      setError('Falha ao excluir conversa')
      notifyError('Erro', 'Falha ao excluir conversa')
      throw error
    }
  }, [conversations, chatState.activeConversation, setActiveConversation, config.autoSave, notifySuccess, notifyError, setError])

  const exportConversation = useCallback(async (conversationId: string) => {
    try {
      if (!config.enableExport) {
        throw new Error('Export is disabled')
      }

      const conversation = conversations.find(conv => conv.id === conversationId)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const exportData = {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          module: conversation.module,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          tokenCount: conversation.tokenCount
        },
        messages: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          model: msg.model,
          tokens: msg.tokens,
          tier: msg.tier
        })),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversa-${conversation.id}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      notifySuccess('Exportação Concluída', 'Conversa exportada com sucesso!')
      return true
    } catch (error) {
      console.error('Error exporting conversation:', error)
      setError('Falha ao exportar conversa')
      notifyError('Erro', 'Falha ao exportar conversa')
      throw error
    }
  }, [conversations, config.enableExport, notifySuccess, notifyError, setError])

  const searchConversations = useCallback((query: string) => {
    if (!config.enableSearch || !query.trim()) {
      return conversations
    }

    const searchTerm = query.toLowerCase()
    return conversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Search in module
      if (conv.module.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Search in messages
      return conv.messages.some(msg => 
        msg.content.toLowerCase().includes(searchTerm)
      )
    })
  }, [conversations, config.enableSearch])

  const addMessageToConversation = useCallback(async (
    conversationId: string,
    message: ChatMessageType
  ) => {
    try {
      addMessage(conversationId, message)
      
      // Update conversation timestamp
      const conversation = conversations.find(conv => conv.id === conversationId)
      if (conversation) {
        const updatedConversation = {
          ...conversation,
          updatedAt: new Date().toISOString(),
          tokenCount: conversation.tokenCount + (message.tokens || 0)
        }
        await saveConversation(updatedConversation)
      }

      return message
    } catch (error) {
      console.error('Error adding message to conversation:', error)
      setError('Falha ao adicionar mensagem')
      throw error
    }
  }, [addMessage, conversations, saveConversation, setError])

  const updateMessageInConversation = useCallback(async (
    conversationId: string,
    messageId: string,
    updates: Partial<ChatMessageType>
  ) => {
    try {
      updateMessage(conversationId, messageId, updates)
      
      // Save conversation if auto-save is enabled
      if (config.autoSave) {
        const conversation = conversations.find(conv => conv.id === conversationId)
        if (conversation) {
          await saveConversation(conversation)
        }
      }

      return true
    } catch (error) {
      console.error('Error updating message in conversation:', error)
      setError('Falha ao atualizar mensagem')
      throw error
    }
  }, [updateMessage, conversations, config.autoSave, saveConversation, setError])

  const clearConversationMessages = useCallback(async (conversationId: string) => {
    try {
      clearConversation(conversationId)
      
      // Clear any active streams for this conversation
      const conversation = conversations.find(conv => conv.id === conversationId)
      if (conversation) {
        conversation.messages.forEach(msg => {
          clearStream(msg.id, conversationId)
        })
      }

      // Save conversation
      if (config.autoSave) {
        const updatedConversation = {
          ...conversation!,
          messages: [],
          updatedAt: new Date().toISOString(),
          tokenCount: 0
        }
        await saveConversation(updatedConversation)
      }

      notifySuccess('Conversa Limpa', 'Mensagens removidas com sucesso!')
      return true
    } catch (error) {
      console.error('Error clearing conversation:', error)
      setError('Falha ao limpar conversa')
      notifyError('Erro', 'Falha ao limpar conversa')
      throw error
    }
  }, [clearConversation, conversations, clearStream, config.autoSave, saveConversation, notifySuccess, notifyError, setError])

  const duplicateConversation = useCallback(async (conversationId: string) => {
    try {
      const originalConversation = conversations.find(conv => conv.id === conversationId)
      if (!originalConversation) {
        throw new Error('Conversation not found')
      }

      const duplicatedConversation: ChatConversation = {
        ...originalConversation,
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${originalConversation.title} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: originalConversation.messages.map(msg => ({
          ...msg,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      }

      const updatedConversations = [duplicatedConversation, ...conversations]
        .slice(0, config.maxConversations)

      if (config.autoSave && typeof window !== 'undefined') {
        localStorage.setItem('chat-conversations', JSON.stringify(updatedConversations))
      }

      notifySuccess('Conversa Duplicada', 'Conversa duplicada com sucesso!')
      return duplicatedConversation
    } catch (error) {
      console.error('Error duplicating conversation:', error)
      setError('Falha ao duplicar conversa')
      notifyError('Erro', 'Falha ao duplicar conversa')
      throw error
    }
  }, [conversations, config, notifySuccess, notifyError, setError])

  // Load conversations on mount
  useEffect(() => {
    if (config.enableHistory) {
      loadConversations()
    }
  }, [config.enableHistory, loadConversations])

  return {
    // State
    conversations,
    currentConversation,
    hasActiveConversation,
    conversationCount,
    
    // Actions
    createConversation,
    loadConversations,
    saveConversation,
    deleteConversation,
    exportConversation,
    searchConversations,
    addMessageToConversation,
    updateMessageInConversation,
    clearConversationMessages,
    duplicateConversation,
    
    // Utilities
    setActiveConversation,
    config
  }
}



