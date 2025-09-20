import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { enemApi } from '@/lib/enem-api'


import { prisma } from '@/lib/db'



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const area = searchParams.get('area') || 'matematica'
    const count = parseInt(searchParams.get('count') || '3')

    const results: any = {
      message: 'ENEM Public Test - No Authentication Required',
      timestamp: new Date().toISOString(),
      parameters: { area, count },
      tests: {}
    }

    // Teste 1: Verificar disponibilidade da API
    try {
      const isAvailable = await enemApi.checkApiAvailability()
      results.tests.apiAvailability = {
        status: isAvailable ? 'success' : 'warning',
        message: isAvailable ? 'API is available' : 'API not available, using fallback',
        apiSource: 'enem-dev-api'
      }
    } catch (error) {
      results.tests.apiAvailability = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Teste 2: Buscar questões do banco de dados diretamente
    try {
      const dbQuestions = await prisma.enemQuestion.findMany({
        where: { area },
        take: count,
        orderBy: { created_at: 'desc' }
      })

      results.tests.databaseQuestions = {
        status: 'success',
        count: dbQuestions.length,
        message: `Found ${dbQuestions.length} questions in database`,
        questions: dbQuestions.map(q => ({
          id: q.id,
          area: q.area,
          disciplina: q.disciplina,
          stem: q.stem.substring(0, 100) + '...', // Primeiros 100 caracteres
          correct: q.correct,
          source: q.source
        }))
      }
    } catch (error) {
      results.tests.databaseQuestions = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Teste 3: Tentar usar o cliente ENEM (pode falhar por autenticação)
    try {
      const questions = await enemApi.getRandomQuestions(area, count)
      results.tests.enemClient = {
        status: 'success',
        count: questions.length,
        message: `ENEM client returned ${questions.length} questions`,
        source: 'enem-client'
      }
    } catch (error) {
      results.tests.enemClient = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        note: 'This is expected if authentication is required'
      }
    }

    // Teste 4: Verificar configuração
    results.configuration = {
      apiSource: 'enem-dev-api',
      databaseConnected: true, // Se chegou até aqui, o banco está conectado
      endpoints: {
        health: '/api/enem/health',
        demo: '/api/enem/demo',
        publicTest: '/api/enem/public-test'
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
