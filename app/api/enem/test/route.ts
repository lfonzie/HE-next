import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { enemApi } from '@/lib/enem-api'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Testar integração ENEM API pública
    const tests: any = {
      serverStatus: 'running',
      apiAvailability: await enemApi.checkApiAvailability(),
      timestamp: new Date().toISOString()
    }

    // Testar endpoint de provas
    try {
      const exams = await enemApi.getExams()
      tests.examsEndpoint = {
        status: 'success',
        count: exams.length,
        source: exams.length > 0 ? 'enem-dev-api' : 'mock-data'
      }
    } catch (error) {
      tests.examsEndpoint = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Testar endpoint de questões
    try {
      const questions = await enemApi.getRandomQuestions('matematica', 3)
      tests.questionsEndpoint = {
        status: 'success',
        count: questions.length,
        source: questions.length > 0 ? 'enem-dev-api' : 'ai-fallback'
      }
    } catch (error) {
      tests.questionsEndpoint = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ENEM Local Server Test Results',
      tests,
      recommendations: [
        tests.localServerEnabled ? '✅ Servidor local está habilitado' : '⚠️ Servidor local não está habilitado',
        tests.apiAvailability ? '✅ API está disponível' : '⚠️ API não está disponível',
        tests.examsEndpoint?.status === 'success' ? '✅ Endpoint de provas funcionando' : '❌ Endpoint de provas com problemas',
        tests.questionsEndpoint?.status === 'success' ? '✅ Endpoint de questões funcionando' : '❌ Endpoint de questões com problemas'
      ]
    })

  } catch (error) {
    console.error('ENEM test API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    switch (action) {
      case 'reset-status':
        enemApi.resetApiStatus()
        return NextResponse.json({
          success: true,
          message: 'API status reset',
          currentMode: 'enem-dev-api'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('ENEM test API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
