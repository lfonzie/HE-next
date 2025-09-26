import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConversationHistory, getRecentUserHistory } from '@/lib/conversation-persistence'

export const dynamic = 'force-dynamic'

/**
 * GET /api/chat/history - Recupera histórico de conversas
 * Query params:
 * - conversationId: ID da conversa específica
 * - module: Módulo para histórico recente
 * - limit: Número máximo de mensagens (padrão: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const module = searchParams.get('module')
    const limit = parseInt(searchParams.get('limit') || '20')

    let messages = []

    if (conversationId) {
      // Recuperar histórico de uma conversa específica
      messages = await getConversationHistory(conversationId, session.user.id, limit)
    } else if (module) {
      // Recuperar histórico recente do usuário para um módulo
      messages = await getRecentUserHistory(session.user.id, module, limit)
    } else {
      return NextResponse.json(
        { error: 'Either conversationId or module parameter is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      messages,
      count: messages.length,
      conversationId,
      module
    })
  } catch (error) {
    console.error('❌ [CHAT-HISTORY] Error retrieving history:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve conversation history' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/history - Salva histórico de conversa
 * Body: { conversationId, messages, module, subject, grade, tokenCount, model }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      conversationId,
      messages,
      module,
      subject,
      grade,
      tokenCount = 0,
      model
    } = body

    if (!conversationId || !messages || !module) {
      return NextResponse.json(
        { error: 'conversationId, messages, and module are required' },
        { status: 400 }
      )
    }

    // Importar função de salvamento
    const { autoSaveConversation, convertLocalMessagesToDatabase } = await import('@/lib/conversation-persistence')
    
    // Converter mensagens para formato do banco
    const dbMessages = convertLocalMessagesToDatabase(messages)

    // Salvar conversa
    await autoSaveConversation(
      conversationId,
      session.user.id,
      dbMessages,
      module,
      subject,
      grade,
      tokenCount,
      model
    )

    return NextResponse.json({
      success: true,
      conversationId,
      messageCount: messages.length
    })
  } catch (error) {
    console.error('❌ [CHAT-HISTORY] Error saving history:', error)
    return NextResponse.json(
      { error: 'Failed to save conversation history' },
      { status: 500 }
    )
  }
}
