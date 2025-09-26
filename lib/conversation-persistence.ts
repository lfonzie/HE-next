import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

export interface ConversationData {
  id: string
  userId: string
  module: string
  subject?: string
  grade?: string
  messages: ConversationMessage[]
  tokenCount: number
  model?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Salva uma conversa completa no banco de dados
 */
export async function saveConversationToDatabase(
  conversationData: ConversationData
): Promise<void> {
  try {
    // Verificar se a conversa já existe
    const existingConversation = await prisma.conversations.findUnique({
      where: { id: conversationData.id }
    })

    if (existingConversation) {
      // Atualizar conversa existente
      await prisma.conversations.update({
        where: { id: conversationData.id },
        data: {
          messages: conversationData.messages,
          token_count: conversationData.tokenCount,
          model: conversationData.model,
          updated_at: new Date()
        }
      })
    } else {
      // Criar nova conversa
      await prisma.conversations.create({
        data: {
          id: conversationData.id,
          user_id: conversationData.userId,
          module: conversationData.module,
          subject: conversationData.subject,
          grade: conversationData.grade,
          messages: conversationData.messages,
          token_count: conversationData.tokenCount,
          model: conversationData.model
        }
      })
    }

    console.log(`✅ [CONVERSATION-PERSISTENCE] Saved conversation ${conversationData.id}`)
  } catch (error) {
    console.error('❌ [CONVERSATION-PERSISTENCE] Error saving conversation:', error)
    // Não falhar a operação principal se o salvamento falhar
  }
}

/**
 * Recupera o histórico de uma conversa do banco de dados
 */
export async function getConversationHistory(
  conversationId: string,
  userId: string,
  limit: number = 20
): Promise<ConversationMessage[]> {
  try {
    const conversation = await prisma.conversations.findFirst({
      where: {
        id: conversationId,
        user_id: userId
      }
    })

    if (!conversation) {
      return []
    }

    const messages = conversation.messages as any[]
    if (!Array.isArray(messages)) {
      return []
    }

    // Retornar as últimas N mensagens
    return messages
      .slice(-limit)
      .map((msg: any) => ({
        id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        module: msg.module,
        model: msg.model,
        tokens: msg.tokens,
        metadata: msg.metadata
      }))
  } catch (error) {
    console.error('❌ [CONVERSATION-PERSISTENCE] Error retrieving conversation history:', error)
    return []
  }
}

/**
 * Recupera o histórico recente de um usuário para um módulo específico
 */
export async function getRecentUserHistory(
  userId: string,
  module: string,
  limit: number = 10
): Promise<ConversationMessage[]> {
  try {
    const conversations = await prisma.conversations.findMany({
      where: {
        user_id: userId,
        module: module
      },
      orderBy: {
        updated_at: 'desc'
      },
      take: 3 // Últimas 3 conversas
    })

    const allMessages: ConversationMessage[] = []

    for (const conversation of conversations) {
      const messages = conversation.messages as any[]
      if (Array.isArray(messages)) {
        allMessages.push(...messages.map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          module: msg.module,
          model: msg.model,
          tokens: msg.tokens,
          metadata: msg.metadata
        })))
      }
    }

    // Ordenar por timestamp e retornar as últimas N mensagens
    return allMessages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit)
  } catch (error) {
    console.error('❌ [CONVERSATION-PERSISTENCE] Error retrieving user history:', error)
    return []
  }
}

/**
 * Adiciona uma nova mensagem a uma conversa existente
 */
export async function addMessageToConversation(
  conversationId: string,
  userId: string,
  message: ConversationMessage
): Promise<void> {
  try {
    const conversation = await prisma.conversations.findFirst({
      where: {
        id: conversationId,
        user_id: userId
      }
    })

    if (!conversation) {
      console.warn(`⚠️ [CONVERSATION-PERSISTENCE] Conversation ${conversationId} not found`)
      return
    }

    const existingMessages = conversation.messages as any[]
    const updatedMessages = [...(existingMessages || []), message]

    await prisma.conversations.update({
      where: { id: conversationId },
      data: {
        messages: updatedMessages,
        updated_at: new Date()
      }
    })

    console.log(`✅ [CONVERSATION-PERSISTENCE] Added message to conversation ${conversationId}`)
  } catch (error) {
    console.error('❌ [CONVERSATION-PERSISTENCE] Error adding message to conversation:', error)
  }
}

/**
 * Middleware para salvar automaticamente conversas após interações
 */
export async function autoSaveConversation(
  conversationId: string,
  userId: string,
  messages: ConversationMessage[],
  module: string,
  subject?: string,
  grade?: string,
  tokenCount: number = 0,
  model?: string
): Promise<void> {
  try {
    const conversationData: ConversationData = {
      id: conversationId,
      userId,
      module,
      subject,
      grade,
      messages,
      tokenCount,
      model,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await saveConversationToDatabase(conversationData)
  } catch (error) {
    console.error('❌ [CONVERSATION-PERSISTENCE] Error in auto-save:', error)
  }
}

/**
 * Utilitário para converter mensagens do formato local para o formato do banco
 */
export function convertLocalMessagesToDatabase(
  localMessages: any[]
): ConversationMessage[] {
  return localMessages.map((msg: any) => ({
    id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    module: msg.module,
    model: msg.model,
    tokens: msg.tokens,
    metadata: {
      isStreaming: msg.isStreaming,
      blocks: msg.blocks,
      actions: msg.actions,
      trace: msg.trace,
      image: msg.image,
      attachment: msg.attachment
    }
  }))
}

/**
 * Utilitário para converter mensagens do banco para o formato local
 */
export function convertDatabaseMessagesToLocal(
  dbMessages: ConversationMessage[]
): any[] {
  return dbMessages.map((msg: ConversationMessage) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    module: msg.module,
    model: msg.model,
    tokens: msg.tokens,
    isStreaming: false,
    blocks: msg.metadata?.blocks || [],
    actions: msg.metadata?.actions || [],
    trace: msg.metadata?.trace || {},
    image: msg.metadata?.image,
    attachment: msg.metadata?.attachment
  }))
}
