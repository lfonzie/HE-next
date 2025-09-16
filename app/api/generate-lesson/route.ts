import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'
import { STRUCTURED_LESSON_PROMPT } from '@/lib/system-prompts/lessons-structured'
import { populateLessonWithImages } from '@/lib/unsplash-integration'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { topic, demoMode, subject, grade, generateSingleSlide } = await request.json()

    if (!topic) {
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 })
    }

    // Check if demo mode is enabled or if user is authenticated
    if (!demoMode && !session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Se for geração de slide único, usar prompt específico
    if (generateSingleSlide) {
      const slidePrompt = `Crie APENAS o slide ${generateSingleSlide} para uma aula sobre "${topic}".

${generateSingleSlide === 1 ? `
Slide 1 - Introdução:
- Título: Introdução ao tópico
- Conteúdo: Apresentação do tema, objetivos e importância
- Tipo: "introduction"
- Estimativa de tempo: 3 minutos
` : generateSingleSlide === 2 ? `
Slide 2 - Conceito Principal:
- Título: Conceito principal do tópico
- Conteúdo: Explicação detalhada do conceito principal
- Tipo: "explanation"
- Estimativa de tempo: 5 minutos
` : `
Slide ${generateSingleSlide} - Conteúdo:
- Título: Título apropriado para o slide ${generateSingleSlide}
- Conteúdo: Conteúdo educativo relevante
- Tipo: "explanation"
- Estimativa de tempo: 4 minutos
`}

Retorne APENAS um objeto JSON com a estrutura do slide:
{
  "slideNumber": ${generateSingleSlide},
  "type": "tipo_do_slide",
  "title": "Título do slide",
  "content": "Conteúdo detalhado do slide",
  "timeEstimate": tempo_em_minutos
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: slidePrompt }],
        temperature: 0.7,
        max_tokens: 2000
      })

      let slideContent = completion.choices[0].message.content || '{}'
      slideContent = slideContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      const slideData = JSON.parse(slideContent)
      
      return NextResponse.json({
        success: true,
        slide: slideData
      })
    }

    // Use structured lesson prompt for consistent 9-slide format
    const prompt = `${STRUCTURED_LESSON_PROMPT}

Para o tópico: "${topic}"

Primeiro, analise o tópico e determine automaticamente:
1. A matéria/disciplina apropriada (ex: Matemática, Ciências, História, Geografia, Português, etc.) - DEVE estar em PORTUGUÊS
2. A série apropriada (1º ao 12º ano) baseada na complexidade e conteúdo - DEVE ser um número entre 1 e 12
3. O contexto educacional e pré-requisitos
4. Objetivos de aprendizagem apropriados para a série inferida

Crie uma aula seguindo EXATAMENTE a estrutura de 9 slides especificada acima.

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional, explicações ou formatação markdown.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000
    })

    let lessonContent = completion.choices[0].message.content || '{}'
    
    console.log('Conteúdo bruto da IA:', lessonContent.substring(0, 200) + '...')
    
    // Clean up markdown formatting if present
    if (lessonContent.includes('```json')) {
      lessonContent = lessonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    
    // Remove any leading/trailing whitespace
    lessonContent = lessonContent.trim()
    
    // Check if the content looks like JSON
    if (!lessonContent.startsWith('{') && !lessonContent.startsWith('[')) {
      console.error('Resposta da IA não é JSON válido:', lessonContent.substring(0, 500))
      throw new Error('A IA retornou uma resposta em formato inválido. Tente novamente.')
    }
    
    let lessonData
    try {
      lessonData = JSON.parse(lessonContent)
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      console.error('Conteúdo que causou erro:', lessonContent.substring(0, 1000))
      throw new Error('Erro ao processar resposta da IA. Tente novamente.')
    }

    // Validate the generated lesson structure
    if (!lessonData.title || !lessonData.slides || !Array.isArray(lessonData.slides)) {
      throw new Error('Estrutura de aula inválida gerada')
    }
    
    // Ensure we have exactly 8 slides
    if (lessonData.slides.length !== 8) {
      throw new Error('Aula deve ter exatamente 8 slides')
    }
    
    // Ensure grade is a valid number
    if (!lessonData.grade || isNaN(lessonData.grade)) {
      lessonData.grade = 5 // Default to 5th grade if not specified
    }
    
    // Ensure subject is specified
    if (!lessonData.subject) {
      lessonData.subject = 'Geral' // Default subject
    }

    // Convert slides to stages format for compatibility
    const stages = lessonData.slides.map((slide: any, index: number) => {
      const stageType = slide.type === 'question' ? 'quiz' : 
                       slide.type === 'closing' ? 'summary' : 'explanation'
      
      return {
        etapa: slide.title,
        type: stageType,
        activity: {
          component: slide.type === 'question' ? 'QuizComponent' : 'AnimationSlide',
          content: slide.content,
          prompt: slide.question || slide.content,
          questions: slide.type === 'question' ? [{
            q: slide.question,
            options: slide.options,
            correct: slide.correctAnswer,
            explanation: slide.explanation
          }] : [],
          media: [], // Will be populated with Unsplash images
          time: slide.timeEstimate || 5,
          points: slide.type === 'question' ? 10 : 5,
          feedback: slide.explanation || 'Bom trabalho!',
          imagePrompt: slide.imagePrompt,
          imageUrl: slide.imageUrl // Include the imageUrl from the populated lesson
        },
        route: `/lessons/${topic.toLowerCase().replace(/\s+/g, '-')}/slide-${index + 1}`
      }
    })

    // Add stages to lessonData for compatibility
    lessonData.stages = stages

    // Don't populate all images at once - let progressive loading handle it
    const lessonWithImages = lessonData

    // Generate lesson ID
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    let lesson = null
    
    // Only save to database if not in demo mode and user is authenticated
    if (!demoMode && session?.user?.id) {
      try {
        // Save lesson to database
        lesson = await prisma.lessons.create({
          data: {
            id: lessonId,
            title: lessonWithImages.title,
            subject: lessonWithImages.subject,
            level: lessonWithImages.grade,
            objective: lessonWithImages.objectives?.join(', ') || '',
            outline: lessonWithImages.stages.map((stage: any) => ({
              etapa: stage.etapa,
              type: stage.type,
              route: stage.route
            })),
            cards: lessonWithImages.stages.map((stage: any) => ({
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

        // Log the AI request
        await prisma.ai_requests.create({
          data: {
            tenant_id: 'default',
            user_id: session.user.id,
            session_id: `lesson_gen_${Date.now()}`,
            provider: 'openai',
            model: 'gpt-4o',
            prompt_tokens: completion.usage?.prompt_tokens || 0,
            completion_tokens: completion.usage?.completion_tokens || 0,
            total_tokens: completion.usage?.total_tokens || 0,
            cost_brl: ((completion.usage?.total_tokens || 0) * 0.00003).toString(),
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
      lesson: {
        id: lesson?.id || lessonId,
        title: lessonWithImages.title,
        subject: lessonWithImages.subject,
        level: lessonWithImages.grade,
        objectives: lessonWithImages.objectives,
        introduction: lessonWithImages.introduction,
        slides: lessonWithImages.slides,
        stages: lessonWithImages.stages,
        summary: lessonWithImages.summary,
        nextSteps: lessonWithImages.nextSteps,
        demoMode: demoMode || !lesson
      }
    })

  } catch (error) {
    console.error('Erro na geração da aula:', error)
    return NextResponse.json({ 
      error: 'Falha ao gerar aula',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
