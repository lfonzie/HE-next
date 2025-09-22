import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PATCH /api/chat/conversations/[id] - Update a conversation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id
    const body = await request.json()

    // Verify the conversation belongs to the user
    const existingConversation = await prisma.conversations.findFirst({
      where: {
        id: conversationId,
        user_id: session.user.id
      }
    })

    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date()
    }

    if (body.title !== undefined) {
      updateData.subject = body.title
    }
    if (body.module !== undefined) {
      updateData.module = body.module
    }
    if (body.messages !== undefined) {
      updateData.messages = body.messages
    }
    if (body.tokenCount !== undefined) {
      updateData.token_count = body.tokenCount
    }

    const updatedConversation = await prisma.conversations.update({
      where: {
        id: conversationId
      },
      data: updateData
    })

    return NextResponse.json({
      id: updatedConversation.id,
      title: updatedConversation.subject,
      module: updatedConversation.module,
      messages: updatedConversation.messages,
      tokenCount: updatedConversation.token_count,
      createdAt: updatedConversation.created_at,
      updatedAt: updatedConversation.updated_at
    })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}

// DELETE /api/chat/conversations/[id] - Delete a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id

    // Verify the conversation belongs to the user
    const existingConversation = await prisma.conversations.findFirst({
      where: {
        id: conversationId,
        user_id: session.user.id
      }
    })

    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    await prisma.conversations.delete({
      where: {
        id: conversationId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}
