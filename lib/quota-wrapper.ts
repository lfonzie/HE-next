import { NextRequest, NextResponse } from 'next/server'
import { QuotaService, QuotaUsage } from '@/lib/quota-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Wrapper para APIs de IA que adiciona verificação de quota
 */
export async function withQuotaWrapper(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    module?: string
    apiEndpoint?: string
    skipQuotaCheck?: boolean
  } = {}
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
    console.error('Erro no wrapper de quota:', error)
    
    // Em caso de erro no wrapper, permitir a requisição mas logar o erro
    return await handler(request)
  }
}

/**
 * Função auxiliar para extrair informações de uso de uma resposta de streaming
 */
export function extractUsageFromResponse(response: string, provider: string, model: string): QuotaUsage {
  // Estimativa básica baseada no tamanho da resposta
  const responseTokens = Math.ceil(response.length / 4)
  const promptTokens = Math.ceil(response.length / 8) // Estimativa conservadora
  const totalTokens = promptTokens + responseTokens

  return {
    provider,
    model,
    promptTokens,
    completionTokens: responseTokens,
    totalTokens,
    costUsd: 0, // Será calculado baseado no modelo
    costBrl: 0,
    success: true
  }
}
