// app/api/generate-lesson-professional/route.ts
// API endpoint para geração de aulas com pacing profissional

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'
import { 
  PROFESSIONAL_PACING_LESSON_PROMPT, 
  PHOTOSYNTHESIS_PROFESSIONAL_TEMPLATE,
  calculatePacingMetrics,
  validateProfessionalPacing 
} from '@/lib/system-prompts/lessons-professional-pacing'
import { populateLessonWithImages } from '@/lib/unsplash-integration'
import { AutoImageService } from '@/lib/autoImageService'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { 
      topic, 
      subject, 
      grade, 
      pacingMode = 'professional', // 'professional' | 'photosynthesis' | 'custom'
      customPacing,
      generateSingleSlide 
    } = await request.json()

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
      const slidePrompt = `Crie APENAS o slide ${generateSingleSlide} para uma aula profissional sobre "${topic}" com pacing otimizado.

${generateSingleSlide === 1 ? `
Slide 1 - Abertura (4 min):
- Título: Abertura: [Tema] e sua Importância
- Conteúdo: Ativação de conhecimentos prévios + objetivos + motivação
- Micro-pausa: Pergunta reflexiva integrada
- MÍNIMO 500 tokens (≈375 palavras)
- Tipo: "introduction"
` : generateSingleSlide === 2 ? `
Slide 2 - Conceito Principal (5 min):
- Título: Conceito Principal: [Tema Central]
- Conteúdo: Explicação detalhada com fundamentos teóricos
- Micro-pausa: Checagem de compreensão
- MÍNIMO 500 tokens (≈375 palavras)
- Tipo: "explanation"
` : generateSingleSlide >= 4 && generateSingleSlide <= 8 ? `
Slide ${generateSingleSlide} - ${generateSingleSlide === 4 || generateSingleSlide === 8 ? 'Quiz' : 'Explicação'} (${generateSingleSlide === 4 || generateSingleSlide === 8 ? '4' : '5'} min):
- Título: ${generateSingleSlide === 4 ? 'Quiz 1: Verificação de Compreensão' : generateSingleSlide === 8 ? 'Quiz 2: Análise Situacional' : 'Título apropriado'}
- Conteúdo: ${generateSingleSlide === 4 || generateSingleSlide === 8 ? 'Pergunta analítica com feedback rico' : 'Conteúdo educativo detalhado'}
- MÍNIMO ${generateSingleSlide === 4 || generateSingleSlide === 8 ? '400' : '500'} tokens
- Tipo: "${generateSingleSlide === 4 || generateSingleSlide === 8 ? 'question' : 'explanation'}"
` : `
Slide ${generateSingleSlide} - Encerramento (3 min):
- Título: Encerramento: Síntese e Próximos Passos
- Conteúdo: Síntese + erro comum + mini-desafio aplicado
- MÍNIMO 400 tokens (≈300 palavras)
- Tipo: "closing"
`}

Retorne APENAS um objeto JSON com a estrutura do slide:
{
  "slideNumber": ${generateSingleSlide},
  "type": "tipo_do_slide",
  "title": "Título do slide",
  "content": "Conteúdo detalhado do slide (mínimo 375 palavras)",
  "microPause": "Pergunta reflexiva integrada",
  "imagePrompt": "Prompt específico para imagem educativa do Unsplash",
  "timeEstimate": tempo_em_minutos,
  "tokenTarget": 500
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: slidePrompt }],
        temperature: 0.7,
        max_tokens: 2500
      })

      let slideContent = completion.choices[0].message.content || '{}'
      slideContent = slideContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      const slideData = JSON.parse(slideContent)
      
      return NextResponse.json({
        success: true,
        slide: slideData
      })
    }

    // Selecionar prompt baseado no modo de pacing
    let basePrompt = PROFESSIONAL_PACING_LESSON_PROMPT
    
    if (pacingMode === 'photosynthesis') {
      basePrompt = PHOTOSYNTHESIS_PROFESSIONAL_TEMPLATE
    } else if (pacingMode === 'custom' && customPacing) {
      basePrompt = customPacing
    }

    // Use structured lesson prompt for consistent 9-slide format
    const prompt = `${basePrompt}

Para o tópico: "${topic}"

Primeiro, analise o tópico e determine automaticamente:
1. A matéria/disciplina apropriada (ex: Matemática, Ciências, História, Geografia, Português, etc.) - DEVE estar em PORTUGUÊS
2. A série apropriada (1º ao 12º ano) baseada na complexidade e conteúdo - DEVE ser um número entre 1 e 12
3. O contexto educacional e pré-requisitos
4. Objetivos de aprendizagem apropriados para a série inferida

Crie uma aula seguindo EXATAMENTE a estrutura de 9 slides especificada acima com pacing profissional.

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional, explicações ou formatação markdown.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 10000 // Aumentado para acomodar conteúdo mais extenso
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
      throw new Error('Erro ao processar resposta da IA. Formato JSON inválido.')
    }

    // Validar pacing profissional
    const validation = validateProfessionalPacing(lessonData)
    if (!validation.isValid) {
      console.warn('Problemas de pacing detectados:', validation.issues)
      // Adicionar warnings ao response mas não falhar
      lessonData.pacingWarnings = validation.issues
    }

    // Adicionar métricas calculadas
    lessonData.pacingMetrics = validation.metrics

    // Populate with images using the existing service
    try {
      console.log('🖼️ Populando imagens para aula profissional...')
      lessonData = await populateLessonWithImages(lessonData)
      console.log('✅ Imagens populadas com sucesso')
    } catch (imageError) {
      console.error('Erro ao popular imagens:', imageError)
      // Continue sem imagens se houver erro
    }

    // Save to database (user is authenticated)
    if (session?.user?.id) {
      try {
        const savedLesson = await prisma.lessons.create({
          data: {
            id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: lessonData.title,
            subject: lessonData.subject,
            level: lessonData.grade,
            objective: lessonData.objectives?.join(', ') || 'Objetivo da aula',
            outline: lessonData.outline || {},
            cards: lessonData.slides || [],
            user_id: session.user.id
          }
        })
        
        console.log('✅ Aula salva no banco de dados:', savedLesson.id)
        lessonData.id = savedLesson.id
      } catch (dbError) {
        console.error('Erro ao salvar no banco:', dbError)
        // Continue mesmo se não conseguir salvar
      }
    }

    return NextResponse.json({
      success: true,
      lesson: lessonData,
      pacingMetrics: validation.metrics,
      warnings: validation.isValid ? null : validation.issues
    })

  } catch (error) {
    console.error('Erro na geração de aula profissional:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
