import { NextRequest, NextResponse } from 'next/server'
import { aiFallbackManager } from '@/lib/ai-fallback-manager'

export const dynamic = 'force-dynamic'

/**
 * Endpoint para monitorar o status do sistema de fallback de IA
 */
export async function GET(request: NextRequest) {
  try {
    const providerStatus = aiFallbackManager.getProviderStatus()
    
    // Calcular estatísticas gerais
    const totalProviders = Object.keys(providerStatus).length
    const healthyProviders = Object.values(providerStatus).filter(p => p.healthy).length
    const unhealthyProviders = totalProviders - healthyProviders
    
    // Verificar variáveis de ambiente
    const envStatus = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      GOOGLE_GENERATIVE_AI_API_KEY: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      GOOGLE_GEMINI_API_KEY: !!process.env.GOOGLE_GEMINI_API_KEY,
      GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      PERPLEXITY_API_KEY: !!process.env.PERPLEXITY_API_KEY
    }
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      summary: {
        totalProviders,
        healthyProviders,
        unhealthyProviders,
        systemHealth: healthyProviders > 0 ? 'healthy' : 'critical'
      },
      providers: providerStatus,
      environment: envStatus,
      recommendations: generateRecommendations(providerStatus, envStatus)
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error getting AI fallback status:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
}

/**
 * Endpoint para resetar o status de um provedor específico
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, action } = body
    
    if (!providerId) {
      return NextResponse.json({
        error: 'Provider ID is required'
      }, { status: 400 })
    }
    
    if (action === 'reset') {
      aiFallbackManager.resetProviderStatus(providerId)
      
      return NextResponse.json({
        success: true,
        message: `Provider ${providerId} status reset successfully`,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      error: 'Invalid action. Supported actions: reset'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Error resetting provider status:', error)
    
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}

/**
 * Gera recomendações baseadas no status dos provedores
 */
function generateRecommendations(providerStatus: any, envStatus: any): string[] {
  const recommendations: string[] = []
  
  // Verificar provedores não saudáveis
  const unhealthyProviders = Object.entries(providerStatus)
    .filter(([_, status]: [string, any]) => !status.healthy)
    .map(([id, _]) => id)
  
  if (unhealthyProviders.length > 0) {
    recommendations.push(`Provedores não saudáveis detectados: ${unhealthyProviders.join(', ')}. Considere verificar suas configurações.`)
  }
  
  // Verificar configuração de API keys
  if (!envStatus.OPENAI_API_KEY && !envStatus.GOOGLE_GENERATIVE_AI_API_KEY && !envStatus.GOOGLE_GEMINI_API_KEY && !envStatus.GOOGLE_API_KEY && !envStatus.PERPLEXITY_API_KEY) {
    recommendations.push('Nenhuma API key de IA configurada. Configure pelo menos uma API key para usar o sistema.')
  }
  
  // Verificar se há apenas um provedor configurado
  const configuredProviders = Object.values(envStatus).filter(Boolean).length
  if (configuredProviders === 1) {
    recommendations.push('Apenas um provedor de IA configurado. Configure múltiplos provedores para melhor redundância.')
  }
  
  // Verificar se há muitos provedores falhando
  const failingProviders = Object.values(providerStatus).filter((p: any) => p.failures > 3).length
  if (failingProviders > 0) {
    recommendations.push(`${failingProviders} provedor(es) com muitas falhas recentes. Considere verificar suas configurações ou limites de quota.`)
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Sistema funcionando normalmente. Todos os provedores configurados estão saudáveis.')
  }
  
  return recommendations
}
