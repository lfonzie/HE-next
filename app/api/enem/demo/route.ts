import { NextRequest, NextResponse } from 'next/server'
import { enemApi } from '@/lib/enem-api'

export async function GET(request: NextRequest) {
  try {
    // Endpoint público para demonstração da integração ENEM
    const demo: any = {
      message: 'ENEM Public API Integration Demo',
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Teste 1: Verificar disponibilidade da API
    try {
      const isAvailable = await enemApi.checkApiAvailability()
      demo.tests.apiAvailability = {
        status: isAvailable ? 'success' : 'warning',
        message: isAvailable ? 'API is available' : 'API not available, using fallback',
        apiSource: 'enem-dev-api'
      }
    } catch (error) {
      demo.tests.apiAvailability = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Teste 2: Tentar buscar provas (mock data)
    try {
      const exams = await enemApi.getExams()
      demo.tests.examsEndpoint = {
        status: 'success',
        count: exams.length,
        message: `Found ${exams.length} exams`,
        sampleExam: exams[0] || null
      }
    } catch (error) {
      demo.tests.examsEndpoint = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Teste 3: Verificar configuração do cliente
    demo.configuration = {
      apiSource: 'enem-dev-api',
      baseUrl: 'https://api.enem.dev/v1',
      rateLimitDelay: 1000,
      cacheInterval: 300000
    }

    // Teste 4: Informações do servidor
    demo.serverInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    }

    return NextResponse.json(demo)
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
