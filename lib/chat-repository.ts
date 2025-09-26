import { prisma } from '@/lib/prisma';
import { ChatMessage, convertDbMessagesToChatMessages, convertChatMessageToDb } from './chat-history';
import { randomUUID } from 'crypto';

export async function ensureConversation(
  conversationId?: string, 
  userId?: string, 
  provider?: string,
  module?: string
) {
  if (conversationId) {
    const found = await prisma.conversations.findUnique({ 
      where: { id: conversationId } 
    });
    if (found) return found;
  }
  
  return prisma.conversations.create({ 
    data: { 
      ...(conversationId && { id: conversationId }),
      user_id: userId || randomUUID(),
      module: module || "chat",
      messages: [] // Mantém compatibilidade com schema antigo
    } 
  });
}

export async function getHistory(conversationId: string): Promise<ChatMessage[]> {
  const msgs = await prisma.conversation_message.findMany({
    where: { conversationId },
    orderBy: { index: "asc" }
  });
  
  return convertDbMessagesToChatMessages(msgs);
}

// Função para sanitizar objetos removendo funções
function sanitizeForJson(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'function') return '[Function]';
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForJson);
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'function') {
      sanitized[key] = '[Function]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForJson(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export async function appendMessage(
  conversationId: string, 
  role: string, 
  content: any, 
  provider?: string,
  model?: string,
  providerRaw?: any
) {
  // Contar mensagens existentes para determinar o índice
  const count = await prisma.conversation_message.count({ 
    where: { conversationId } 
  });
  
  const messageData = convertChatMessageToDb(
    { role: role as any, content },
    conversationId,
    count,
    provider,
    model
  );
  
  if (providerRaw) {
    messageData.providerRaw = sanitizeForJson(providerRaw);
  }
  
  return prisma.conversation_message.create({
    data: messageData
  });
}

export async function updateConversation(
  conversationId: string,
  updates: {
    title?: string;
    token_count?: number;
    model?: string;
    updated_at?: Date;
  }
) {
  return prisma.conversations.update({
    where: { id: conversationId },
    data: updates
  });
}

export async function getConversation(conversationId: string) {
  return prisma.conversations.findUnique({
    where: { id: conversationId },
    include: {
      conversation_messages: {
        orderBy: { index: "asc" }
      }
    }
  });
}

export async function deleteConversation(conversationId: string) {
  return prisma.conversations.delete({
    where: { id: conversationId }
  });
}

export async function getUserConversations(userId: string, limit = 20) {
  return prisma.conversations.findMany({
    where: { user_id: userId },
    orderBy: { updated_at: "desc" },
    take: limit,
    include: {
      conversation_messages: {
        orderBy: { index: "asc" },
        take: 1 // Apenas a primeira mensagem para preview
      }
    }
  });
}

export async function getConversationStats(conversationId: string) {
  const [messageCount, totalTokens] = await Promise.all([
    prisma.conversation_message.count({
      where: { conversationId }
    }),
    prisma.conversation_message.aggregate({
      where: { conversationId },
      _sum: { tokenCount: true }
    })
  ]);
  
  return {
    messageCount,
    totalTokens: totalTokens._sum.tokenCount || 0
  };
}
