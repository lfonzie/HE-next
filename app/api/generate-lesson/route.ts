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
      
      // Tentar corrigir problemas comuns de JSON
      let fixedContent = lessonContent
      
      // Remover caracteres de controle problemáticos
      fixedContent = fixedContent.replace(/[\x00-\x1F\x7F]/g, '')
      
      // Tentar encontrar JSON válido dentro do texto
      const jsonMatch = fixedContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        fixedContent = jsonMatch[0]
      }
      
      try {
        lessonData = JSON.parse(fixedContent)
        console.log('JSON corrigido com sucesso')
      } catch (secondParseError) {
        console.error('Segunda tentativa de parse também falhou:', secondParseError)
        
        // Fallback: criar uma aula básica estruturada
        lessonData = {
          title: `Aula sobre ${topic}`,
          subject: subject || 'Geral',
          grade: grade || '5',
          objectives: [`Compreender os conceitos básicos de ${topic}`],
          introduction: `Nesta aula vamos explorar ${topic}.`,
          slides: Array.from({ length: 8 }, (_, i) => ({
            title: `Slide ${i + 1}`,
            content: `Conteúdo da etapa ${i + 1} sobre ${topic}`,
            type: i % 3 === 0 ? 'question' : 'explanation'
          })),
          feedback: 'Aula gerada com estrutura básica devido a erro na IA.'
        }
        
        console.log('Usando fallback de aula básica')
      }
    }

    // Validate the generated lesson structure
    if (!lessonData.title || !lessonData.slides || !Array.isArray(lessonData.slides)) {
      console.error('Estrutura de aula inválida:', lessonData)
      
      // Tentar corrigir estrutura inválida
      if (!lessonData.slides || !Array.isArray(lessonData.slides)) {
        lessonData.slides = Array.from({ length: 8 }, (_, i) => ({
          title: `Slide ${i + 1}`,
          content: `Conteúdo da etapa ${i + 1} sobre ${topic}`,
          type: i % 3 === 0 ? 'question' : 'explanation'
        }))
        console.log('Slides corrigidos automaticamente')
      }
      
      if (!lessonData.title) {
        lessonData.title = `Aula sobre ${topic}`
        console.log('Título corrigido automaticamente')
      }
    }
    
    // Ensure we have exactly 8 slides (pad with empty slides if needed)
    if (lessonData.slides.length < 8) {
      const missingSlides = 8 - lessonData.slides.length
      for (let i = 0; i < missingSlides; i++) {
        lessonData.slides.push({
          title: `Slide ${lessonData.slides.length + 1}`,
          content: `Conteúdo adicional sobre ${topic}`,
          type: 'explanation'
        })
      }
      console.log(`Adicionados ${missingSlides} slides para completar 8 slides`)
    } else if (lessonData.slides.length > 8) {
      lessonData.slides = lessonData.slides.slice(0, 8)
      console.log('Reduzidos slides para 8 slides máximo')
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
        console.log('Saving lesson to database with ID:', lessonId, 'for user:', session.user.id)
        
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
        
        console.log('Lesson saved successfully:', lesson.id)

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

    // If in demo mode, save lesson to localStorage on the client side
    const responseData = {
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
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Erro na geração da aula:', error)
    
    // Preparar erro amigável baseado no tipo de erro
    let friendlyError = 'Falha ao gerar aula. Tente novamente.'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        friendlyError = 'Limite de uso da IA excedido. Tente novamente em alguns minutos.'
        statusCode = 429
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        friendlyError = 'Erro de conexão. Verifique sua internet e tente novamente.'
        statusCode = 503
      } else if (error.message.includes('Unauthorized') || error.message.includes('API key')) {
        friendlyError = 'Problema de configuração da IA. Entre em contato com o suporte.'
        statusCode = 500
      } else if (error.message.includes('Tópico é obrigatório')) {
        friendlyError = 'Por favor, forneça um tópico para a aula.'
        statusCode = 400
      }
    }
    
    return NextResponse.json({ 
      error: friendlyError,
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: statusCode })
  }
}
