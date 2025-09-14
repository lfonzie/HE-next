import { NextRequest, NextResponse } from 'next/server'
import { enemApi } from '@/lib/enem-api'

export async function GET(request: NextRequest) {
  try {
    // Endpoint público para verificar saúde do servidor ENEM
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: 'ENEM Local Server',
      version: '1.0.0',
      localServerEnabled: enemApi.isUsingLocalServer(),
      endpoints: {
        exams: '/api/enem/exams',
        questions: '/api/enem/questions',
        realQuestions: '/api/enem/real-questions',
        session: '/api/enem/session',
        simulator: '/api/enem/simulator',
        test: '/api/enem/test'
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
