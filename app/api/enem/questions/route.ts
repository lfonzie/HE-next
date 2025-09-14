import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { enemApi, ENEM_AREAS } from '@/lib/enem-api'
import { openai, selectModel, getModelConfig } from '@/lib/openai'
import { apiConfig } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    // Verificação de sessão com fallback para desenvolvimento
    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', session ? 'Authenticated' : 'Not authenticated')
    
    // Permitir acesso sem autenticação em desenvolvimento
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body with better error handling
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 })
    }

    const { area, numQuestions, useRealQuestions = true } = requestBody

    // Validate input
    if (!area || !numQuestions || numQuestions <= 0) {
      return NextResponse.json({ 
        error: 'Invalid parameters: area and numQuestions are required' 
      }, { status: 400 })
    }

    let questions = []
    let source = 'database'

    // Use API configuration to determine priority
    const shouldUseApi = apiConfig.shouldUseEnemApi() && useRealQuestions
    const shouldUseDatabase = apiConfig.shouldUseEnemDatabase()
    const shouldUseAi = apiConfig.shouldUseEnemAi()

    if (shouldUseApi) {
      // Verificar se a API está disponível primeiro (com cache inteligente)
      try {
        const isApiAvailable = await enemApi.checkApiAvailability()
        
        if (isApiAvailable) {
          // Tentar buscar questões reais da API enem.dev
          try {
            const apiArea = Object.keys(ENEM_AREAS).find(key => 
              key.toLowerCase().includes(area.toLowerCase()) || 
              area.toLowerCase().includes(key.toLowerCase())
            ) || area

            const realQuestions = await enemApi.getRandomQuestions(apiArea, numQuestions)
            
            if (realQuestions.length > 0) {
              questions = realQuestions.map(q => enemApi.convertToInternalFormat(q))
              source = 'enem.dev'
              console.log(`✅ Loaded ${questions.length} real ENEM questions from API (API Priority Mode)`)
            } else {
              console.log('📵 No real questions returned from API, falling back to database/AI generation')
            }
          } catch (error) {
            console.error('Failed to fetch real ENEM questions:', error)
            // Continue to fallback options
          }
        } else {
          console.log('📵 ENEM API not available (cached), falling back to database/AI generation')
        }
      } catch (error) {
        console.error('Error checking API availability:', error)
        // Continue to fallback options
      }
    }

    // Se não conseguiu questões reais ou não foi solicitado, buscar do banco
    if (questions.length === 0 && shouldUseDatabase) {
      try {
        const dbQuestions = await prisma.enemQuestion.findMany({
          where: { area },
          take: numQuestions,
          orderBy: { created_at: 'desc' }
        })

        questions = dbQuestions.map(q => ({
          id: q.id,
          subject: q.disciplina,
          area: q.area,
          difficulty: 'Médio',
          year: new Date().getFullYear(),
          question: q.stem,
          options: [q.a, q.b, q.c, q.d, q.e],
          correctAnswer: q.correct,
          explanation: 'Explicação não disponível',
          topics: [],
          competencies: []
        }))
        
        if (questions.length > 0) {
          source = 'database'
          console.log(`✅ Loaded ${questions.length} questions from database (API Priority Mode)`)
        }
      } catch (error) {
        console.error('Error fetching questions from database:', error)
      }
    }

    // Se ainda não tem questões suficientes, gerar com IA
    if (questions.length < numQuestions && shouldUseAi) {
      try {
        const remaining = numQuestions - questions.length
        console.log(`🤖 Generating ${remaining} questions with AI for area: ${area} (API Priority Mode)`)
        
        const generatedQuestions = await generateQuestions(area, remaining)
        
        if (generatedQuestions.length > 0) {
          console.log(`✅ Generated ${generatedQuestions.length} questions successfully`)
          
          // Save generated questions to database
          for (const question of generatedQuestions) {
            try {
              await prisma.enemQuestion.create({
                data: question
              })
            } catch (dbError) {
              console.error('Error saving generated question to database:', dbError)
              // Continue even if saving fails
            }
          }
          
          const formattedGenerated = generatedQuestions.map((q: any) => ({
            id: `generated_${Date.now()}_${Math.random()}`,
            subject: q.disciplina || area,
            area: q.area,
            difficulty: 'Médio',
            year: new Date().getFullYear(),
            question: q.stem,
            options: [q.a, q.b, q.c, q.d, q.e],
            correctAnswer: q.correct,
            explanation: 'Questão gerada por IA',
            topics: [],
            competencies: []
          }))
          
          questions.push(...formattedGenerated)
          source = source === 'database' ? 'database+ai' : 'ai'
        } else {
          console.log('⚠️ No questions were generated by AI')
        }
      } catch (error) {
        console.error('Error generating questions:', error)
        // If it's a connection error, we might want to retry with a smaller batch
        if (error instanceof Error && error.message.includes('aborted')) {
          console.log('🔄 Connection aborted during AI generation, will try with smaller batch')
          try {
            const smallerBatch = Math.max(1, Math.floor((numQuestions - questions.length) / 2))
            const retryQuestions = await generateQuestions(area, smallerBatch)
            if (retryQuestions.length > 0) {
              const formattedRetry = retryQuestions.map((q: any) => ({
                id: `generated_${Date.now()}_${Math.random()}`,
                subject: q.disciplina || area,
                area: q.area,
                difficulty: 'Médio',
                year: new Date().getFullYear(),
                question: q.stem,
                options: [q.a, q.b, q.c, q.d, q.e],
                correctAnswer: q.correct,
                explanation: 'Questão gerada por IA',
                topics: [],
                competencies: []
              }))
              questions.push(...formattedRetry)
              source = source === 'database' ? 'database+ai' : 'ai'
            }
          } catch (retryError) {
            console.error('Retry generation also failed:', retryError)
          }
        }
      }
    }

    // Ensure we have at least some questions
    if (questions.length === 0) {
      return NextResponse.json({ 
        error: 'Unable to load or generate questions. Please try again later.' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      questions: questions.slice(0, numQuestions),
      source,
      total: questions.length
    })

  } catch (error) {
    console.error('ENEM API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateQuestions(area: string, count: number) {
  try {
    // Limit count to prevent timeout issues
    const maxCount = Math.min(count, 5)
    if (count > maxCount) {
      console.log(`Limiting question generation to ${maxCount} to prevent timeouts`)
    }

    const prompt = `Gere ${maxCount} questões do ENEM para a área de ${area}. 
    Cada questão deve ter:
    - Um enunciado claro e objetivo
    - 5 alternativas (A, B, C, D, E)
    - Uma alternativa correta
    - Formato JSON com campos: stem, a, b, c, d, e, correct, disciplina
    
    IMPORTANTE: Retorne APENAS um JSON válido, sem markdown, sem texto adicional. 
    O formato deve ser exatamente assim:
    [
      {
        "stem": "enunciado da questão",
        "a": "alternativa A",
        "b": "alternativa B", 
        "c": "alternativa C",
        "d": "alternativa D",
        "e": "alternativa E",
        "correct": "A",
        "disciplina": "${area}"
      }
    ]`

    // Selecionar modelo baseado na complexidade da tarefa de geração de questões
    const selectedModel = selectModel(prompt, 'enem')
    const modelConfig = getModelConfig(selectedModel)
    
    console.log(`Using model: ${selectedModel} for ENEM questions generation`)
    
    // Add timeout and retry logic
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log('AI generation timeout - aborting request')
    }, 30000) // 30 seconds timeout
    
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
    })
    
    clearTimeout(timeoutId)

    const response = completion.choices[0]?.message?.content
    if (!response) return []

    // Clean the response to extract JSON from markdown if present
    let cleanResponse = response.trim()
    
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    let questions
    try {
      questions = JSON.parse(cleanResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Raw response:', response)
      return []
    }
    return questions.map((q: any) => ({
      area,
      disciplina: q.disciplina || area,
      stem: q.stem,
      a: q.a,
      b: q.b,
      c: q.c,
      d: q.d,
      e: q.e,
      correct: q.correct,
      source: 'AI Generated'
    }))
  } catch (error) {
    console.error('Error generating questions:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        console.log('AI generation was aborted due to timeout or connection issue')
      } else if (error.message.includes('rate limit')) {
        console.log('AI generation hit rate limit')
      } else {
        console.log('AI generation failed with error:', error.message)
      }
    }
    
    return []
  }
}
