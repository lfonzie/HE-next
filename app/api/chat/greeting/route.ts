import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { appendMessage, ensureConversation } from '@/lib/chat-repository';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || randomUUID();

    const body = await req.json();
    let { conversationId, greeting } = body;

    if (!conversationId || !greeting) {
      return NextResponse.json({ error: 'Conversation ID and greeting are required' }, { status: 400 });
    }

    // Se o conversationId começar com 'temp-', criar um UUID real
    if (conversationId.startsWith('temp-')) {
      conversationId = randomUUID();
    }

    // Garantir que a conversa existe antes de adicionar a mensagem
    await ensureConversation(conversationId, userId, 'chat');

    // Salvar saudação no banco de dados
    await appendMessage(conversationId, 'assistant', greeting, 'grok', 'grok-4-fast-reasoning');

    return NextResponse.json({ success: true, conversationId });
  } catch (error) {
    console.error('❌ [GREETING-API] Error saving greeting:', error);
    return NextResponse.json({ error: 'Failed to save greeting' }, { status: 500 });
  }
}
