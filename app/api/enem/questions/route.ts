import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth'


import { authOptions } from '@/lib/auth'


import { prisma } from '@/lib/db'


import { enemApi, ENEM_AREAS } from '@/lib/enem-api'


import { openai, selectModel, getModelConfig } from '@/lib/openai'


import { apiConfig } from '@/lib/api-config'



// Cache para evitar chamadas duplicadas
const questionCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Handler para requisições GET
export async function GET(request: NextRequest) {
  try {
    // Verificação de sessão com fallback para desenvolvimento
    const session = await getServerSession(authOptions)
    console.log('🔐 Session check (GET):', session ? 'Authenticated' : 'Not authenticated')
    
    // Permitir acesso sem autenticação em desenvolvimento
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const area = searchParams.get('area')
    const numQuestions = parseInt(searchParams.get('numQuestions') || '1')
    const useRealQuestions = searchParams.get('useRealQuestions') !== 'false'
    const limit = parseInt(searchParams.get('limit') || '1')

    // Use limit if numQuestions is not provided
    const questionCount = numQuestions || limit

    if (!area) {
      return NextResponse.json({ error: 'Area parameter is required' }, { status: 400 })
    }

    return await processQuestionsRequest(area, questionCount, useRealQuestions)
  } catch (error) {
    console.error('ENEM API GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handler para requisições POST
export async function POST(request: NextRequest) {
  try {
    // Verificação de sessão com fallback para desenvolvimento
    const session = await getServerSession(authOptions)
    console.log('🔐 Session check (POST):', session ? 'Authenticated' : 'Not authenticated')
    
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

    return await processQuestionsRequest(area, numQuestions, useRealQuestions)
  } catch (error) {
    console.error('ENEM API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Função comum para processar requisições de questões
async function processQuestionsRequest(area: string, numQuestions: number, useRealQuestions: boolean) {
  try {
    // Validate input
    if (!area || !numQuestions || numQuestions <= 0) {
      return NextResponse.json({ 
        error: 'Invalid parameters: area and numQuestions are required' 
      }, { status: 400 })
    }

    // Verificar cache primeiro
    const cacheKey = `${area}-${numQuestions}-${useRealQuestions}`
    const cached = questionCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`📦 Returning cached questions for ${area}`)
      return NextResponse.json(cached.data)
    }

    let questions = []
    let source = 'database'

    // Use API configuration to determine priority - apenas questões reais
    const shouldUseApi = apiConfig.shouldUseEnemApi() && useRealQuestions
    const shouldUseDatabase = apiConfig.shouldUseEnemDatabase()
    const shouldUseAi = false // Desabilitado - apenas questões reais do ENEM

    if (shouldUseApi) {
      // Verificar se a API está disponível primeiro (com cache inteligente)
      try {
        console.log(`🔍 Attempting to load ${numQuestions} questions for area: ${area}`)
        
        // Tentar buscar questões reais da API enem.dev
        try {
          // Tratar área "geral" especificamente
          let apiArea = area
          if (area.toLowerCase() === 'geral') {
            console.log('🎯 Area "geral" detected, will search across all ENEM areas')
            apiArea = 'geral' // O método getRandomQuestions já trata isso
          } else {
            apiArea = Object.keys(ENEM_AREAS).find(key => 
              key.toLowerCase().includes(area.toLowerCase()) || 
              area.toLowerCase().includes(key.toLowerCase())
            ) || area
          }

          console.log(`🎯 Mapped area "${area}" to API area "${apiArea}"`)
          const realQuestions = await enemApi.getRandomQuestions(apiArea, numQuestions)
          
          if (realQuestions.length > 0) {
            questions = realQuestions.map(q => enemApi.convertToInternalFormat(q))
            source = 'enem.dev'
            console.log(`✅ Loaded ${questions.length} real ENEM questions from API`)
          } else {
            console.log('📵 No real questions returned from API, falling back to database/AI generation')
          }
        } catch (error) {
          console.error('❌ Failed to fetch real ENEM questions:', error)
          // Continue to fallback options
        }
      } catch (error) {
        console.error('❌ Error in API availability check:', error)
        // Continue to fallback options
      }
    }

    // Se não conseguiu questões reais ou não foi solicitado, buscar do banco
    if (questions.length === 0 && shouldUseDatabase) {
      try {
        // Tratar área "geral" no banco de dados
        let whereClause: any = { area }
        if (area.toLowerCase() === 'geral') {
          // Para área geral, buscar de todas as áreas
          whereClause = {
            area: {
              in: ['linguagens', 'matematica', 'natureza', 'humanas']
            }
          }
        }
        
        const dbQuestions = await prisma.enemQuestion.findMany({
          where: whereClause,
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

    // Ensure we have at least some questions - apenas questões reais do ENEM
    if (questions.length === 0) {
      console.log('❌ Nenhuma questão real do ENEM disponível')
      return NextResponse.json({ 
        error: 'Nenhuma questão real do ENEM disponível. Apenas questões oficiais são permitidas.',
        questions: [],
        source: 'none',
        total: 0
      }, { status: 404 })
    }

    const responseData = { 
      questions: questions.slice(0, numQuestions),
      source,
      total: questions.length
    }

    // Armazenar no cache
    questionCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })

    // Limpar cache antigo (manter apenas últimos 100 itens)
    if (questionCache.size > 100) {
      const oldestKey = questionCache.keys().next().value
      if (oldestKey) {
        questionCache.delete(oldestKey)
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('ENEM API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateMockQuestions(area: string, count: number) {
  const mockQuestions = []
  
  for (let i = 1; i <= count; i++) {
    mockQuestions.push({
      id: `mock-${area}-${i}`,
      subject: area,
      area: area,
      difficulty: 'Médio',
      year: new Date().getFullYear(),
      question: `Esta é uma questão de exemplo da área de ${area}. Questão ${i} de ${count}.`,
      options: [
        'Alternativa A',
        'Alternativa B', 
        'Alternativa C',
        'Alternativa D',
        'Alternativa E'
      ],
      correctAnswer: 'A',
      explanation: `Explicação da questão ${i} da área de ${area}.`,
      source: 'mock'
    })
  }
  
  return mockQuestions
}

async function generateQuestions(area: string, count: number) {
  try {
    // Use GPT-4o mini as fallback model for question generation
    const fallbackModel = process.env.ENEM_FALLBACK_MODEL || "gpt-4o-mini"
    
    // Limit count to prevent timeout issues - batch generation strategy
    const maxCount = Math.min(count, 2) // Generate in batches of 2
    if (count > maxCount) {
      console.log(`Limiting question generation to ${maxCount} to prevent timeouts (batch strategy)`)
    }

    // Enhanced prompt using the system prompt from the architectural guide
    const prompt = `Generate ${maxCount} ENEM-style questions for the area "${area}". 
    Each question must have:
    - A clear and objective statement
    - 5 alternatives (A, B, C, D, E)
    - One correct alternative
    - Detailed explanation
    
    IMPORTANT: Return ONLY valid JSON, no markdown, no additional text.
    Format must be exactly:
    [
      {
        "stem": "question statement",
        "a": "alternative A",
        "b": "alternative B", 
        "c": "alternative C",
        "d": "alternative D",
        "e": "alternative E",
        "correct": "A",
        "disciplina": "${area}",
        "explanation": "detailed explanation of the correct answer"
      }
    ]`

    console.log(`Using fallback model: ${fallbackModel} for ENEM questions generation`)
    
    // Add timeout and retry logic with shorter timeout for batch generation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log('AI generation timeout - aborting request')
    }, 20000) // 20 seconds timeout for batch generation
    
    const completion = await openai.chat.completions.create({
      model: fallbackModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500, // Reduced for batch generation
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
    
    console.log(`✅ Generated ${questions.length} questions using ${fallbackModel}`)
    
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
      explanation: q.explanation || 'Explicação não disponível',
      source: 'AI Generated (GPT-4o mini)'
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
