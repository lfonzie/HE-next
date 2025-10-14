import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth'


import { authOptions } from '@/lib/auth'


import { prisma } from '@/lib/db'


import OpenAI from 'openai'


import { GoogleGenerativeAI } from '@google/generative-ai'


import { ensureQuizFormat } from '@/lib/quiz-validation'


import { STRUCTURED_LESSON_PROMPT } from '@/lib/system-prompts/lessons-structured'


import { PROFESSIONAL_PACING_LESSON_PROMPT, validateProfessionalPacing, calculatePacingMetrics } from '@/lib/system-prompts/lessons-professional-pacing'
import { populateLessonWithImages } from '@/lib/unsplash-integration'
import { AutoImageService } from '@/lib/autoImageService'
import { CertificateSystem } from '@/lib/certificate-system'



const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

// Google Gemini configuration
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '')
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// Função para popular imagens com tradução automática
async function populateLessonWithImagesTranslated(lessonData: any, topic: string): Promise<any> {
  try {
    console.log('🖼️ Populando imagens com sistema melhorado para:', topic)
    
    const slidesWithImages = await Promise.all(
      lessonData.slides.map(async (slide: any, index: number) => {
        // Apenas primeiro slide (index 0) e último slide (index slides.length - 1)
        const isFirstSlide = index === 0
        const isLastSlide = index === lessonData.slides.length - 1
        
        if (slide.imagePrompt && (isFirstSlide || isLastSlide)) {
          try {
            // Usar nova API de busca melhorada com múltiplas fontes
            const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/images/enhanced-search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: slide.imagePrompt,
                subject: lessonData.subject || 'Geral',
                grade: lessonData.grade || '5',
                count: 1,
                preferredDimensions: {
                  width: 1350,
                  height: 1080
                },
                sources: ['unsplash', 'pixabay', 'wikimedia']
              }),
            })

            if (response.ok) {
              const data = await response.json()
              if (data.success && data.images && data.images.length > 0) {
                const bestImage = data.images[0]
                console.log(`✅ Imagem melhorada para slide ${index + 1} (${isFirstSlide ? 'primeiro' : 'último'}):`, {
                  source: bestImage.source,
                  relevanceScore: bestImage.relevanceScore,
                  educationalSuitability: bestImage.educationalSuitability,
                  dimensions: `${bestImage.width}x${bestImage.height}`,
                  resizedUrl: bestImage.resizedUrl
                })
                return {
                  ...slide,
                  imageUrl: bestImage.resizedUrl || bestImage.url,
                  imageSource: bestImage.source,
                  imageMetrics: {
                    relevanceScore: bestImage.relevanceScore,
                    educationalSuitability: bestImage.educationalSuitability,
                    originalDimensions: `${bestImage.width}x${bestImage.height}`,
                    resizedDimensions: '1350x1080'
                  }
                }
              }
            }
            
            console.warn(`⚠️ Falha na busca melhorada para slide ${index + 1}, usando fallback`)
            return slide
          } catch (error) {
            console.error(`❌ Erro ao buscar imagem melhorada para slide ${index + 1}:`, error)
            return slide
          }
        }
        
        // Para slides intermediários, remover imageUrl se existir
        const { imageUrl, translatedPrompt, ...slideWithoutImage } = slide
        return slideWithoutImage
      })
    )

    return {
      ...lessonData,
      slides: slidesWithImages
    }
  } catch (error) {
    console.error('❌ Erro ao popular imagens com tradução:', error)
    return lessonData
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { topic, subject, grade, generateSingleSlide, pacingMode = 'professional' } = await request.json()

    if (!topic) {
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 })
    }

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Você precisa estar logado para gerar aulas' }, { status: 401 })
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

      // Using Google Gemini instead of OpenAI
      const result = await geminiModel.generateContent(slidePrompt)
      const response = await result.response
      let slideContent = response.text() || '{}'
      slideContent = slideContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
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

Crie uma aula seguindo EXATAMENTE a estrutura de 14 slides especificada acima com pacing profissional.

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional, explicações ou formatação markdown.`

    // Using Google Gemini instead of OpenAI for main lesson generation
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    let lessonContent = response.text() || '{}'
    
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
      
      // Validar pacing profissional
      const validation = validateProfessionalPacing(lessonData)
      if (!validation.isValid) {
        console.warn('Problemas de pacing detectados:', validation.issues)
        // Adicionar warnings ao response mas não falhar
        lessonData.pacingWarnings = validation.issues
      }

      // Adicionar métricas calculadas
      lessonData.pacingMetrics = validation.metrics
      
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
          questions: slide.type === 'question' ? ensureQuizFormat([{
            q: slide.question,
            options: slide.options,
            correct: slide.correctAnswer,
            explanation: slide.explanation
          }]) : [],
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

    // Populate images with translation for better search results
    const lessonWithImages = await populateLessonWithImagesTranslated(lessonData, topic)

    // Generate lesson ID
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    let lesson = null
    
    // Save to database (user is authenticated)
    if (session?.user?.id) {
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

        // Registrar conclusão da aula para sistema de certificados
        await prisma.lesson_completions.create({
          data: {
            user_id: session.user.id,
            lesson_id: lesson.id,
            module: 'aulas',
            title: lessonWithImages.title,
            completed_at: new Date(),
            time_spent: lessonWithImages.stages.reduce((total: number, stage: any) => total + (stage.activity?.time || 5), 0),
            metadata: {
              subject: lessonWithImages.subject,
              grade: lessonWithImages.grade,
              stages: lessonWithImages.stages.length
            }
          }
        })

        // Verificar se deve emitir certificado
        const certificate = await CertificateSystem.checkAndIssueCertificate(
          session.user.id,
          'aulas',
          'lesson_completed',
          {
            lessonId: lesson.id,
            title: lessonWithImages.title,
            subject: lessonWithImages.subject
          }
        )

        if (certificate) {
          console.log(`🎉 Certificado emitido: ${certificate.title}`)
        }

        // Log the AI request
        await prisma.ai_requests.create({
          data: {
            tenant_id: 'default',
            user_id: session.user.id,
            session_id: `lesson_gen_${Date.now()}`,
            provider: 'google',
            model: 'gemini-2.0-flash-exp',
            prompt_tokens: 0, // Gemini doesn't provide detailed token usage
            completion_tokens: 0,
            total_tokens: 0,
            cost_brl: '0.00', // Gemini is free for now
            latency_ms: 0,
            success: true,
            cache_hit: false
          }
        })
      } catch (dbError) {
        console.error('Erro ao salvar aula no banco de dados:', dbError instanceof Error ? dbError.message : String(dbError))
        return NextResponse.json({ 
          error: 'Erro ao salvar aula no banco de dados' 
        }, { status: 500 })
      }
    }

    // Return lesson data
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
        nextSteps: lessonWithImages.nextSteps
      },
      pacingMetrics: lessonWithImages.pacingMetrics || null,
      warnings: lessonWithImages.pacingWarnings || null
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
