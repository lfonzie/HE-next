import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lesson = await prisma.lessons.findUnique({
      where: {
        id,
        user_id: session.user.id
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updateData = await request.json()

    const lesson = await prisma.lessons.update({
      where: {
        id,
        user_id: session.user.id
      },
      data: {
        title: updateData.title,
        subject: updateData.subject,
        level: updateData.level,
        objective: updateData.objectives?.join(', ') || '',
        outline: updateData.stages || [],
        cards: updateData.stages?.map((stage: any) => ({
          type: stage.type,
          title: stage.etapa,
          content: stage.activity?.content || '',
          prompt: stage.activity?.prompt || '',
          questions: stage.activity?.questions || [],
          time: stage.activity?.time || 5,
          points: stage.activity?.points || 0
        })) || [],
        updated_at: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      lesson 
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json({ 
      error: 'Failed to update lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.lessons.delete({
      where: {
        id,
        user_id: session.user.id
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Lesson deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ 
      error: 'Failed to delete lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
