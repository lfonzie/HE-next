import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth'


import { authOptions } from '@/lib/auth'


import { prisma } from '@/lib/db'


import { PROFESSIONAL_PACING_LESSON_PROMPT, validateProfessionalPacing, calculatePacingMetrics } from '@/lib/system-prompts/lessons-professional-pacing'


import { populateLessonWithImages } from '@/lib/unsplash-integration'


import { AutoImageService } from '@/lib/autoImageService'



// Função para usar o multi-provider router
async function generateWithMultiProvider(prompt: string, provider: string = 'google', complexity: string = 'simple') {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/chat/multi-provider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em educação. Responda APENAS com JSON válido, sem texto adicional, explicações ou formatação markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        module: 'aulas',
        provider: provider,
        complexity: complexity
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()
    return data.text || '{}'
  } catch (error) {
    console.error('Erro no multi-provider:', error)
    throw error
  }
}

// Função para popular imagens com tradução automática
async function populateLessonWithImagesTranslated(lessonData: any, topic: string): Promise<any> {
  try {
    console.log('🖼️ Populando imagens apenas no primeiro e último slide para:', topic)
    
    const slidesWithImages = await Promise.all(
      lessonData.slides.map(async (slide: any, index: number) => {
        // Adicionar imagem apenas no primeiro e último slide
        if (index === 0 || index === lessonData.slides.length - 1) {
          try {
            const imageService = new AutoImageService()
            const imageResult = await AutoImageService.getImageForLesson(
              slide.imagePrompt || slide.title,
              topic
            )
            const imageUrl = imageResult.image?.urls?.regular
            
            return {
              ...slide,
              imageUrl: imageUrl
            }
          } catch (imageError) {
            console.warn(`Erro ao gerar imagem para slide ${index}:`, imageError)
            return slide
          }
        }
        return slide
      })
    )

    return {
      ...lessonData,
      slides: slidesWithImages
    }
  } catch (error) {
    console.error('Erro ao popular imagens:', error)
    return lessonData
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { topic, provider = 'google', complexity = 'simple' } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Tópico é obrigatório' }, { status: 400 })
    }

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Você precisa estar logado para gerar aulas' }, { status: 401 })
    }

    console.log(`🚀 Gerando aula com ${provider} (${complexity}) para: ${topic}`)

    // Check if it's a single slide generation request
    const url = new URL(request.url)
    const generateSingleSlide = url.searchParams.get('generateSingleSlide')
    
    if (generateSingleSlide) {
      const slidePrompt = `${PROFESSIONAL_PACING_LESSON_PROMPT}

Para o tópico: "${topic}"

Slide ${generateSingleSlide} - Conteúdo:
- Título: Título apropriado para o slide ${generateSingleSlide}
- Conteúdo: Conteúdo educativo relevante
- Tipo: "explanation"
- Estimativa de tempo: 4 minutos

Retorne APENAS um objeto JSON com a estrutura do slide:
{
  "slideNumber": ${generateSingleSlide},
  "type": "tipo_do_slide",
  "title": "Título do slide",
  "content": "Conteúdo detalhado do slide",
  "timeEstimate": tempo_em_minutos
}`

      const slideContent = await generateWithMultiProvider(slidePrompt, provider, complexity)
      const slideData = JSON.parse(slideContent)
      
      return NextResponse.json({
        success: true,
        slide: slideData
      })
    }

    // Use professional pacing prompt for consistent 9-slide format
    const prompt = `${PROFESSIONAL_PACING_LESSON_PROMPT}

Para o tópico: "${topic}"

Primeiro, analise o tópico e determine automaticamente:
1. A matéria/disciplina apropriada (ex: Matemática, Ciências, História, Geografia, Português, etc.) - DEVE estar em PORTUGUÊS
2. A série apropriada (1º ao 12º ano) baseada na complexidade e conteúdo - DEVE ser um número entre 1 e 12
3. O contexto educacional e pré-requisitos
4. Objetivos de aprendizagem apropriados para a série inferida

Crie uma aula seguindo EXATAMENTE a estrutura de 9 slides especificada acima com pacing profissional.

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional, explicações ou formatação markdown.`

    const lessonContent = await generateWithMultiProvider(prompt, provider, complexity)
    
    console.log('Conteúdo bruto da IA:', lessonContent.substring(0, 200) + '...')
    
    // Clean up markdown formatting if present
    let cleanedContent = lessonContent
    if (lessonContent.includes('```json')) {
      cleanedContent = lessonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }

    let lessonData
    try {
      lessonData = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      console.log('Conteúdo que falhou no parse:', cleanedContent.substring(0, 500))
      return NextResponse.json({ 
        error: 'Erro ao processar resposta da IA',
        details: parseError instanceof Error ? parseError.message : 'Parse error'
      }, { status: 500 })
    }

    // Validate professional pacing
    const validation = validateProfessionalPacing(lessonData)
    if (!validation.isValid) {
      console.warn('⚠️ Problemas de pacing detectados:', validation.issues)
    }

    // Calculate pacing metrics
    const pacingMetrics = calculatePacingMetrics(lessonData)
    console.log('📊 Métricas de pacing:', pacingMetrics)

    // Generate unique lesson ID
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    lessonData.id = lessonId

    // Add metadata
    lessonData.metadata = {
      subject: lessonData.subject || 'Educação',
      grade: lessonData.grade || '6º ano',
      duration: lessonData.estimatedDuration || '45 minutos',
      difficulty: 'Intermediário',
      tags: lessonData.tags || [lessonData.subject || 'educação']
    }

    // Add feedback structure
    lessonData.feedback = {
      pacing: pacingMetrics,
      validation: validation,
      provider: provider,
      complexity: complexity,
      generatedAt: new Date().toISOString()
    }

    // Populate with images using the existing service
    try {
      console.log('🖼️ Populando imagens para aula...')
      lessonData = await populateLessonWithImages(lessonData)
      console.log('✅ Imagens populadas com sucesso')
    } catch (imageError) {
      console.error('Erro ao popular imagens:', imageError)
      // Continue sem imagens se houver erro
    }

    let lesson = null
    
    // Save to database (user is authenticated)
    if (session?.user?.id) {
      try {
        console.log('Saving lesson to database with ID:', lessonId, 'for user:', session.user.id)
        
        // Save lesson to database
        lesson = await prisma.lessons.create({
          data: {
            id: lessonId,
            title: lessonData.title,
            subject: lessonData.subject,
            level: lessonData.grade,
            objective: lessonData.objectives?.join(', ') || '',
            outline: lessonData.stages.map((stage: any) => ({
              etapa: stage.etapa,
              type: stage.type,
              route: stage.route
            })),
            cards: lessonData.stages.map((stage: any) => ({
              type: stage.type,
              title: stage.etapa,
              content: stage.activity?.content || '',
              prompt: stage.activity?.prompt || '',
              questions: stage.activity?.questions || [],
              time: stage.activity?.time || 5,
              points: stage.activity?.points || 0
            })),
            user_id: session.user.id
          }
        })
        
        console.log('Lesson saved successfully:', lesson.id)

        // Log the AI request
        await prisma.ai_requests.create({
          data: {
            tenant_id: 'default',
            user_id: session.user.id,
            session_id: `lesson_gen_${Date.now()}`,
            provider: provider,
            model: provider === 'google' ? 'gemini-2.0-flash-exp' : 'gpt-4o-mini',
            prompt_tokens: 0, // Multi-provider doesn't provide detailed token usage
            completion_tokens: 0,
            total_tokens: 0,
            cost_brl: '0.00', // Free for now
            latency_ms: 0,
            success: true,
            cache_hit: false
          }
        })
      } catch (dbError) {
        console.warn('Operação de banco de dados falhou, continuando em modo demo:', dbError instanceof Error ? dbError.message : String(dbError))
        // Continue with demo mode if database fails
      }
    }

    return NextResponse.json({
      success: true,
      lesson: lessonData,
      pacingMetrics: pacingMetrics,
      warnings: validation.isValid ? null : validation.issues,
      provider: provider,
      complexity: complexity
    })

  } catch (error) {
    console.error('Erro na geração de aula:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
