import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/chat/conversations - List user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversations = await prisma.conversations.findMany({
      where: {
        user_id: session.user.id
      },
      orderBy: {
        updated_at: 'desc'
      }
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/chat/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, module = 'ATENDIMENTO' } = body

    const conversation = await prisma.conversations.create({
      data: {
        user_id: session.user.id,
        module: module,
        subject: title || 'Nova Conversa',
        messages: [],
        token_count: 0,
        model: 'gpt-4o-mini'
      }
    })

    return NextResponse.json({
      id: conversation.id,
      title: conversation.subject,
      module: conversation.module,
      messages: conversation.messages,
      tokenCount: conversation.token_count,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
