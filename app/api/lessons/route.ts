import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth'


import { authOptions } from '@/lib/auth'


import { prisma } from '@/lib/db'



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lessons = await prisma.lessons.findMany({
      where: {
        user_id: session.user.id
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ lessons })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch lessons',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lessonData = await request.json()

    // Validate required fields
    if (!lessonData.title || !lessonData.subject) {
      return NextResponse.json({ 
        error: 'Title and subject are required' 
      }, { status: 400 })
    }

    const lesson = await prisma.lessons.create({
      data: {
        id: lessonData.id || `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: lessonData.title,
        subject: lessonData.subject,
        level: lessonData.level || '',
        objective: lessonData.objectives?.join(', ') || '',
        outline: lessonData.stages || [],
        cards: lessonData.stages?.map((stage: any) => ({
          type: stage.type,
          title: stage.etapa,
          content: stage.activity?.content || '',
          prompt: stage.activity?.prompt || '',
          questions: stage.activity?.questions || [],
          time: stage.activity?.time || 5,
          points: stage.activity?.points || 0
        })) || [],
        user_id: session.user.id
      }
    })

    return NextResponse.json({ 
      success: true,
      lesson 
    })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ 
      error: 'Failed to create lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
