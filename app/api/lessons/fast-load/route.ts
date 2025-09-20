import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth'


import { authOptions } from '@/lib/auth'


import { prisma } from '@/lib/db'



interface FastLoadRequest {
  lessonId: string;
  includeImages?: boolean;
  includeQuestions?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId, includeImages = true, includeQuestions = true }: FastLoadRequest = await request.json()

    if (!lessonId) {
      return NextResponse.json({ 
        error: 'Lesson ID is required' 
      }, { status: 400 })
    }

    console.log(`🚀 Carregamento rápido da aula: ${lessonId}`)

    // Buscar aula no banco com campos otimizados
    let lesson = await prisma.lessons.findFirst({
      where: {
        id: lessonId,
        user_id: session.user.id
      },
      select: {
        id: true,
        title: true,
        subject: true,
        level: true,
        objective: true,
        outline: true,
        cards: true,
        created_at: true,
        updated_at: true
      }
    })

    // If not found with user_id, try to find lesson without user_id filter for demo purposes
    if (!lesson) {
      console.log('Lesson not found with user_id filter, trying without user_id filter for demo purposes')
      
      lesson = await prisma.lessons.findFirst({
        where: {
          id: lessonId,
          user_id: null  // Demo lessons have user_id: null
        },
        select: {
          id: true,
          title: true,
          subject: true,
          level: true,
          objective: true,
          outline: true,
          cards: true,
          created_at: true,
          updated_at: true
        }
      })
    }

    if (!lesson) {
      // Check if this might be a lesson being generated (starts with lesson_)
      if (lessonId.startsWith('lesson_')) {
        console.log('This appears to be a lesson being generated, returning loading state')
        return NextResponse.json({ 
          error: 'Lesson not found',
          details: 'Lesson is being generated, please try again in a moment',
          status: 'generating'
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: 'Lesson not found' 
      }, { status: 404 })
    }

    // Processar dados para formato otimizado
    const optimizedLesson = {
      id: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      grade: lesson.level,
      objectives: lesson.objective.split(', '),
      stages: Array.isArray(lesson.outline) ? lesson.outline : [],
      slides: Array.isArray(lesson.cards) ? lesson.cards : [],
      metadata: {
        subject: lesson.subject,
        grade: lesson.level,
        duration: '45',
        difficulty: 'medium',
        tags: [lesson.subject.toLowerCase()]
      },
      createdAt: lesson.created_at,
      updatedAt: lesson.updated_at
    }

    // Filtrar imagens se solicitado
    if (!includeImages) {
      optimizedLesson.slides = optimizedLesson.slides.map((slide: any) => {
        const { imageUrl, imageSource, imageClassification, imageMetrics, ...slideWithoutImages } = slide
        return slideWithoutImages
      })
    }

    // Filtrar questões se solicitado
    if (!includeQuestions) {
      optimizedLesson.slides = optimizedLesson.slides.map((slide: any) => {
        const { questions, ...slideWithoutQuestions } = slide
        return slideWithoutQuestions
      })
    }

    // Calcular métricas de performance
    const performanceMetrics = {
      totalSlides: optimizedLesson.slides.length,
      slidesWithImages: optimizedLesson.slides.filter((slide: any) => slide.imageUrl).length,
      slidesWithQuestions: optimizedLesson.slides.filter((slide: any) => slide.questions?.length > 0).length,
      estimatedLoadTime: includeImages ? '2-3s' : '1-2s',
      dataSize: JSON.stringify(optimizedLesson).length
    }

    console.log(`✅ Aula carregada rapidamente: ${lessonId}`, performanceMetrics)

    return NextResponse.json({
      success: true,
      lesson: optimizedLesson,
      performanceMetrics,
      cached: true,
      loadTime: Date.now()
    })

  } catch (error) {
    console.error('❌ Erro no carregamento rápido:', error)
    return NextResponse.json({ 
      error: 'Erro no carregamento rápido',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const includeImages = searchParams.get('includeImages') !== 'false'
    const includeQuestions = searchParams.get('includeQuestions') !== 'false'

    if (!lessonId) {
      return NextResponse.json({ 
        error: 'Lesson ID is required' 
      }, { status: 400 })
    }

    // Buscar aula com campos mínimos para listagem rápida
    let lesson = await prisma.lessons.findFirst({
      where: {
        id: lessonId,
        user_id: session.user.id
      },
      select: {
        id: true,
        title: true,
        subject: true,
        level: true,
        created_at: true
      }
    })

    // If not found with user_id, try to find lesson without user_id filter for demo purposes
    if (!lesson) {
      console.log('Lesson not found with user_id filter, trying without user_id filter for demo purposes')
      
      lesson = await prisma.lessons.findFirst({
        where: {
          id: lessonId,
          user_id: null  // Demo lessons have user_id: null
        },
        select: {
          id: true,
          title: true,
          subject: true,
          level: true,
          created_at: true
        }
      })
    }

    if (!lesson) {
      return NextResponse.json({ 
        error: 'Lesson not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        grade: lesson.level,
        createdAt: lesson.created_at
      },
      cached: true,
      loadTime: Date.now()
    })

  } catch (error) {
    console.error('❌ Erro na listagem rápida:', error)
    return NextResponse.json({ 
      error: 'Erro na listagem rápida',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
