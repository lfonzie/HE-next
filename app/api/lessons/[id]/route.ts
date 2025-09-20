import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


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
    
    console.log('Fetching lesson:', id, 'for user:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('No session found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      console.log('Searching for lesson with ID:', id, 'and user_id:', session.user.id)
      
      // First, try to find the lesson with user_id filter
      let lesson = await prisma.lessons.findUnique({
        where: {
          id,
          user_id: session.user.id
        }
      })

      if (!lesson) {
        console.log('Lesson not found with user_id filter, trying without user_id filter')
        
        // Try to find the lesson without user_id filter to see if it exists
        const lessonWithoutUser = await prisma.lessons.findUnique({
          where: { id }
        })
        
        if (lessonWithoutUser) {
          console.log('Lesson exists but belongs to different user or has no user_id:', lessonWithoutUser.user_id)
          
          // If the lesson has no user_id (null), allow access for demo purposes
          if (lessonWithoutUser.user_id === null) {
            console.log('Lesson has no user_id, allowing access for demo purposes')
            lesson = lessonWithoutUser
          } else {
            console.log('Lesson belongs to different user, denying access')
            return NextResponse.json({ 
              error: 'Lesson not found',
              details: 'Lesson exists but belongs to different user'
            }, { status: 404 })
          }
        } else {
          console.log('Lesson does not exist in database at all')
          
          // Check if this might be a lesson being generated (starts with lesson_)
          if (id.startsWith('lesson_')) {
            console.log('This appears to be a lesson being generated, returning loading state')
            return NextResponse.json({ 
              error: 'Lesson not found',
              details: 'Lesson is being generated, please try again in a moment',
              status: 'generating'
            }, { status: 404 })
          }
          
          return NextResponse.json({ 
            error: 'Lesson not found',
            details: 'Lesson does not exist in database'
          }, { status: 404 })
        }
      }

      if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      }

      console.log('Lesson found:', lesson.title)
      return NextResponse.json({ lesson })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'Database temporarily unavailable',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }
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
