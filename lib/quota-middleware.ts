import { NextRequest, NextResponse } from 'next/server'
import { QuotaService, QuotaUsage } from '@/lib/quota-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface QuotaMiddlewareOptions {
  skipQuotaCheck?: boolean
  module?: string
  apiEndpoint?: string
}

/**
 * Middleware para verificar quotas antes de processar requisições de IA
 */
export async function withQuotaCheck(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: QuotaMiddlewareOptions = {}
): Promise<NextResponse> {
  try {
    // Se skipQuotaCheck estiver habilitado, pular verificação
    if (options.skipQuotaCheck) {
      return await handler(request)
    }

    // Obter sessão do usuário
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Extrair informações da requisição para estimar uso de tokens
    const body = await request.json().catch(() => ({}))
    const message = body.message || ''
    
    // Estimativa básica de tokens (1 token ≈ 4 caracteres em português)
    const estimatedTokens = Math.ceil(message.length / 4) + 100 // +100 para resposta estimada

    // Verificar quota antes de processar
    const quotaCheck = await QuotaService.checkQuota(userId, {
      provider: 'unknown', // Será atualizado após a requisição
      model: 'unknown', // Será atualizado após a requisição
      promptTokens: estimatedTokens,
      completionTokens: 0,
      totalTokens: estimatedTokens,
      module: options.module,
      apiEndpoint: options.apiEndpoint
    })

    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Quota excedida',
          message: quotaCheck.message,
          remainingTokens: quotaCheck.remainingTokens,
          quotaExceeded: quotaCheck.quotaExceeded,
          dailyLimitExceeded: quotaCheck.dailyLimitExceeded,
          hourlyLimitExceeded: quotaCheck.hourlyLimitExceeded,
          costLimitExceeded: quotaCheck.costLimitExceeded
        },
        { status: 429 }
      )
    }

    // Processar a requisição
    const response = await handler(request)

    // Se a resposta foi bem-sucedida, registrar o uso real
    if (response.ok) {
      // Tentar extrair informações reais de uso dos headers da resposta
      const provider = response.headers.get('X-Provider') || 'unknown'
      const model = response.headers.get('X-Model') || 'unknown'
      const actualTokens = parseInt(response.headers.get('X-Tokens') || '0') || estimatedTokens
      const costUsd = parseFloat(response.headers.get('X-Cost-USD') || '0')
      const costBrl = parseFloat(response.headers.get('X-Cost-BRL') || '0')

      // Registrar uso real (assíncrono, não bloquear resposta)
      QuotaService.recordUsage(userId, {
        provider,
        model,
        promptTokens: Math.floor(actualTokens * 0.7), // Estimativa: 70% prompt, 30% completion
        completionTokens: Math.floor(actualTokens * 0.3),
        totalTokens: actualTokens,
        costUsd,
        costBrl,
        module: options.module,
        apiEndpoint: options.apiEndpoint,
        success: true
      }).catch(error => {
        console.error('Erro ao registrar uso de quota:', error)
      })
    }

    return response

  } catch (error) {
    console.error('Erro no middleware de quota:', error)
    
    // Em caso de erro no middleware, permitir a requisição mas logar o erro
    return await handler(request)
  }
}

/**
 * Middleware específico para APIs de chat
 */
export async function withChatQuotaCheck(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withQuotaCheck(request, handler, {
    module: 'chat',
    apiEndpoint: request.nextUrl.pathname
  })
}

/**
 * Middleware específico para APIs de aulas
 */
export async function withAulasQuotaCheck(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withQuotaCheck(request, handler, {
    module: 'aulas',
    apiEndpoint: request.nextUrl.pathname
  })
}

/**
 * Middleware específico para APIs de professor
 */
export async function withProfessorQuotaCheck(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withQuotaCheck(request, handler, {
    module: 'professor',
    apiEndpoint: request.nextUrl.pathname
  })
}

/**
 * Middleware específico para APIs de suporte
 */
export async function withSupportQuotaCheck(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withQuotaCheck(request, handler, {
    module: 'support',
    apiEndpoint: request.nextUrl.pathname
  })
}

/**
 * Hook para usar em componentes React para verificar quota
 */
export function useQuotaStatus() {
  const checkQuota = async () => {
    try {
      const response = await fetch('/api/quota/status')
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Erro ao verificar status da quota:', error)
      return null
    }
  }

  return { checkQuota }
}
