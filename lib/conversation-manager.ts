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
 * Sistema melhorado de persistência de conversas com contexto inteligente
 */
export class ConversationManager {
  private static instance: ConversationManager
  private contextCache = new Map<string, ConversationMessage[]>()
  private readonly MAX_CONTEXT_MESSAGES = 20
  private readonly MAX_CONTEXT_CHARS = 15000

  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager()
    }
    return ConversationManager.instance
  }

  /**
   * Garante que uma conversa existe e retorna seu ID
   */
  async ensureConversation(
    conversationId: string | undefined,
    userId: string,
    module: string = 'chat'
  ): Promise<{ id: string; isNew: boolean }> {
    if (conversationId) {
      // Verificar se a conversa existe
      const existing = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          user_id: userId
        }
      })
      
      if (existing) {
        return { id: conversationId, isNew: false }
      }
    }

    // Criar nova conversa
    const newConversation = await prisma.conversations.create({
      data: {
        user_id: userId,
        module: module,
        messages: [],
        token_count: 0
      }
    })

    console.log(`✅ [CONVERSATION-MANAGER] Created new conversation: ${newConversation.id}`)
    return { id: newConversation.id, isNew: true }
  }

  /**
   * Recupera histórico com contexto inteligente
   */
  async getConversationHistory(
    conversationId: string,
    userId: string,
    limit: number = this.MAX_CONTEXT_MESSAGES
  ): Promise<ConversationMessage[]> {
    try {
      // Verificar cache primeiro
      const cacheKey = `${conversationId}-${userId}`
      if (this.contextCache.has(cacheKey)) {
        const cached = this.contextCache.get(cacheKey)!
        console.log(`📚 [CONVERSATION-MANAGER] Using cached history: ${cached.length} messages`)
        return cached.slice(-limit)
      }

      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          user_id: userId
        }
      })

      if (!conversation) {
        console.log(`⚠️ [CONVERSATION-MANAGER] Conversation ${conversationId} not found`)
        return []
      }

      const messages = conversation.messages as any[]
      if (!Array.isArray(messages)) {
        return []
      }

      const formattedMessages = messages.map((msg: any) => ({
        id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        module: msg.module,
        model: msg.model,
        tokens: msg.tokens,
        metadata: msg.metadata
      }))

      // Cache o resultado
      this.contextCache.set(cacheKey, formattedMessages)

      console.log(`📚 [CONVERSATION-MANAGER] Loaded history: ${formattedMessages.length} messages`)
      return formattedMessages.slice(-limit)
    } catch (error) {
      console.error('❌ [CONVERSATION-MANAGER] Error retrieving conversation history:', error)
      return []
    }
  }

  /**
   * Adiciona mensagem com contexto inteligente
   */
  async addMessage(
    conversationId: string,
    userId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): Promise<void> {
    try {
      const message: ConversationMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        role,
        content,
        timestamp: new Date(),
        metadata
      }

      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          user_id: userId
        }
      })

      if (!conversation) {
        console.warn(`⚠️ [CONVERSATION-MANAGER] Conversation ${conversationId} not found`)
        return
      }

      const existingMessages = conversation.messages as any[]
      const updatedMessages = [...(existingMessages || []), message]

      await prisma.conversations.update({
        where: { id: conversationId },
        data: {
          messages: updatedMessages as any,
          updated_at: new Date(),
          token_count: this.calculateTokenCount(updatedMessages)
        }
      })

      // Atualizar cache
      const cacheKey = `${conversationId}-${userId}`
      if (this.contextCache.has(cacheKey)) {
        const cached = this.contextCache.get(cacheKey)!
        cached.push(message)
        this.contextCache.set(cacheKey, cached)
      }

      console.log(`✅ [CONVERSATION-MANAGER] Added ${role} message to conversation ${conversationId}`)
    } catch (error) {
      console.error('❌ [CONVERSATION-MANAGER] Error adding message:', error)
    }
  }

  /**
   * Gera contexto inteligente para a IA
   */
  generateIntelligentContext(
    messages: ConversationMessage[],
    currentMessage: string
  ): ConversationMessage[] {
    if (messages.length === 0) {
      return []
    }

    // Detectar se é uma continuação de qualquer conversa (não apenas matemática)
    const hasHistory = messages.length > 1;
    const isContinuation = hasHistory && messages.some(m => 
      m.role === 'user' || m.role === 'assistant'
    );

    // Se é continuação de qualquer tema, ser mais específico sobre contexto
    if (isContinuation) {
      // Encontrar a última mensagem do sistema que define o contexto
      const lastSystemMessage = messages.filter(m => m.role === 'system').pop()
      
      // Pegar as últimas 6 mensagens para manter contexto focado
      const recentMessages = messages.filter(m => m.role !== 'system').slice(-6)
      
      const contextMessages: ConversationMessage[] = []
      
      // Adicionar contexto de continuidade específico se não existir
      if (!lastSystemMessage || !lastSystemMessage.content.includes('CONTINUAÇÃO')) {
        contextMessages.push({
          id: 'continuation-context',
          role: 'system',
          content: 'CONTEXTO: Esta é uma conversa em andamento. Seja direto e focado. Não repita introduções.',
          timestamp: new Date(),
          tokens: 20,
          module: 'chat',
          model: 'context'
        })
      } else {
        contextMessages.push(lastSystemMessage)
      }
      
      contextMessages.push(...recentMessages)
      console.log(`🔄 [CONVERSATION-MANAGER] Continuation context: ${contextMessages.length} messages`)
      return contextMessages
    }

    // Para novas conversas, usar lógica padrão otimizada
    if (messages.length <= 8) {
      return messages
    }

    // Encontrar mensagens relevantes baseadas no contexto atual
    const relevantMessages = this.findRelevantMessages(messages, currentMessage)
    
    // Garantir que temos pelo menos as últimas 5 mensagens
    const recentMessages = messages.slice(-5)
    const combinedMessages = [...new Set([...relevantMessages, ...recentMessages])]
    
    // Ordenar por timestamp
    const sortedMessages = combinedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    
    console.log(`📚 [CONVERSATION-MANAGER] Standard context: ${sortedMessages.length} messages`)
    return sortedMessages
  }

  /**
   * Encontra mensagens relevantes baseadas no contexto atual
   */
  private findRelevantMessages(
    messages: ConversationMessage[],
    currentMessage: string
  ): ConversationMessage[] {
    const keywords = this.extractKeywords(currentMessage)
    const relevantMessages: ConversationMessage[] = []

    for (const message of messages) {
      if (this.isMessageRelevant(message, keywords)) {
        relevantMessages.push(message)
      }
    }

    return relevantMessages
  }

  /**
   * Extrai palavras-chave da mensagem atual
   */
  private extractKeywords(text: string): string[] {
    // Remover palavras comuns e extrair termos importantes
    const commonWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'sobre', 'entre', 'que', 'qual', 'quando', 'onde', 'como', 'porque', 'então', 'mas', 'e', 'ou', 'se', 'não', 'sim', 'também', 'já', 'ainda', 'sempre', 'nunca', 'muito', 'pouco', 'mais', 'menos', 'bem', 'mal']
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10) // Máximo 10 palavras-chave
  }

  /**
   * Verifica se uma mensagem é relevante baseada nas palavras-chave
   */
  private isMessageRelevant(message: ConversationMessage, keywords: string[]): boolean {
    const content = message.content.toLowerCase()
    return keywords.some(keyword => content.includes(keyword))
  }

  /**
   * Calcula contagem de tokens aproximada
   */
  private calculateTokenCount(messages: any[]): number {
    return messages.reduce((total, msg) => {
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      return total + Math.ceil(content.length / 4) // ~4 caracteres por token
    }, 0)
  }

  /**
   * Limpa cache para uma conversa específica
   */
  clearCache(conversationId: string, userId: string): void {
    const cacheKey = `${conversationId}-${userId}`
    this.contextCache.delete(cacheKey)
  }

  /**
   * Limpa todo o cache
   */
  clearAllCache(): void {
    this.contextCache.clear()
  }
}

// Instância singleton
export const conversationManager = ConversationManager.getInstance()

// Funções de compatibilidade para manter a API existente
export async function ensureConversation(
  conversationId: string | undefined,
  userId: string,
  module: string = 'chat'
): Promise<{ id: string; isNew: boolean }> {
  return conversationManager.ensureConversation(conversationId, userId, module)
}

export async function getHistory(
  conversationId: string,
  userId: string,
  limit: number = 20
): Promise<ConversationMessage[]> {
  return conversationManager.getConversationHistory(conversationId, userId, limit)
}

export async function appendMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  provider?: string,
  model?: string,
  metadata?: any
): Promise<void> {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id || 'anonymous'
  
  return conversationManager.addMessage(conversationId, userId, role, content, {
    provider,
    model,
    ...metadata
  })
}

// Funções legadas mantidas para compatibilidade
export async function saveConversationToDatabase(conversationData: ConversationData): Promise<void> {
  try {
    const existingConversation = await prisma.conversations.findUnique({
      where: { id: conversationData.id }
    })

    if (existingConversation) {
      await prisma.conversations.update({
        where: { id: conversationData.id },
        data: {
          messages: conversationData.messages as any,
          token_count: conversationData.tokenCount,
          model: conversationData.model,
          updated_at: new Date()
        }
      })
    } else {
      await prisma.conversations.create({
        data: {
          id: conversationData.id,
          user_id: conversationData.userId,
          module: conversationData.module,
          subject: conversationData.subject,
          grade: conversationData.grade,
          messages: conversationData.messages as any,
          token_count: conversationData.tokenCount,
          model: conversationData.model
        }
      })
    }

    console.log(`✅ [CONVERSATION-PERSISTENCE] Saved conversation ${conversationData.id}`)
  } catch (error) {
    console.error('❌ [CONVERSATION-PERSISTENCE] Error saving conversation:', error)
  }
}

export async function getConversationHistory(
  conversationId: string,
  userId: string,
  limit: number = 20
): Promise<ConversationMessage[]> {
  return conversationManager.getConversationHistory(conversationId, userId, limit)
}

export async function addMessageToConversation(
  conversationId: string,
  userId: string,
  message: ConversationMessage
): Promise<void> {
  return conversationManager.addMessage(
    conversationId,
    userId,
    message.role,
    message.content,
    message.metadata
  )
}

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

export function convertLocalMessagesToDatabase(localMessages: any[]): ConversationMessage[] {
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

export function convertDatabaseMessagesToLocal(dbMessages: ConversationMessage[]): any[] {
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
