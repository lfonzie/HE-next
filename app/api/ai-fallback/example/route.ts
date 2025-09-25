import { NextRequest, NextResponse } from 'next/server'
import { withAIFallback, AIMiddlewareOptions } from '@/lib/ai-middleware'

export const dynamic = 'force-dynamic'

/**
 * Exemplo de endpoint que usa o sistema de fallback universal
 * Este endpoint demonstra como qualquer API pode usar o fallback automático
 */

// Handler original que será executado primeiro
async function originalHandler(request: NextRequest, options: AIMiddlewareOptions) {
  const body = await request.json()
  const { message, module = 'professor' } = body
  
  if (!message?.trim()) {
    throw new Error('Message is required')
  }
  
  // Aqui você implementaria sua lógica específica
  // Por exemplo, validações, processamento especial, etc.
  
  // Para demonstração, vamos simular uma falha ocasional
  if (Math.random() < 0.3) { // 30% de chance de falha
    throw new Error('Simulated provider failure for testing fallback')
  }
  
  // Se chegou até aqui, o handler original funcionou
  // Retornar uma resposta de sucesso
  return NextResponse.json({
    success: true,
    message: 'Original handler executed successfully',
    provider: 'original',
    content: `Resposta do handler original para: "${message}"`,
    timestamp: new Date().toISOString()
  })
}

// Função POST principal que usa o middleware de fallback
export const POST = withAIFallback(originalHandler, {
  module: 'professor',
  complexity: 'simple',
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 15000,
  maxRetries: 2,
  enableCaching: false
})

/**
 * Endpoint para testar o sistema de fallback
 */
export async function GET() {
  return NextResponse.json({
    message: 'Sistema de Fallback Universal - Endpoint de Exemplo',
    description: 'Este endpoint demonstra o uso do sistema de fallback automático',
    usage: {
      method: 'POST',
      body: {
        message: 'string (required)',
        module: 'string (optional, default: professor)'
      }
    },
    features: [
      'Fallback automático entre provedores',
      'Detecção de erros de quota',
      'Retry com backoff exponencial',
      'Monitoramento de saúde dos provedores',
      'Logs detalhados de debug'
    ],
    providers: ['OpenAI GPT-4o Mini', 'Google Gemini', 'Anthropic Claude (opcional)'],
    timestamp: new Date().toISOString()
  })
}
