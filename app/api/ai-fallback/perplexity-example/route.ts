import { NextRequest, NextResponse } from 'next/server'
import { withAIFallback, AIMiddlewareOptions } from '@/lib/ai-middleware'

export const dynamic = 'force-dynamic'

/**
 * Exemplo de endpoint que usa Perplexity como fallback
 * Demonstra como o sistema automaticamente usa Perplexity quando outros provedores falham
 */

// Handler original que será executado primeiro
async function originalHandler(request: NextRequest, options: AIMiddlewareOptions) {
  const body = await request.json()
  const { message, module = 'professor' } = body
  
  if (!message?.trim()) {
    throw new Error('Message is required')
  }
  
  // Simular falha ocasional para demonstrar fallback
  if (Math.random() < 0.4) { // 40% de chance de falha
    throw new Error('Simulated provider failure - testing Perplexity fallback')
  }
  
  return NextResponse.json({
    success: true,
    message: 'Original handler executed successfully',
    provider: 'original',
    content: `Resposta do handler original para: "${message}"`,
    timestamp: new Date().toISOString()
  })
}

// Função POST principal que usa o middleware de fallback
// Configurado para usar Perplexity como fallback preferido
export const POST = withAIFallback(originalHandler, {
  module: 'professor',
  complexity: 'simple',
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 15000,
  maxRetries: 2,
  preferredProvider: 'perplexity', // Preferir Perplexity como fallback
  enableCaching: false
})

/**
 * Endpoint para testar especificamente o Perplexity
 */
export async function GET() {
  return NextResponse.json({
    message: 'Sistema de Fallback com Perplexity - Endpoint de Exemplo',
    description: 'Este endpoint demonstra o uso do Perplexity como fallback automático',
    usage: {
      method: 'POST',
      body: {
        message: 'string (required)',
        module: 'string (optional, default: professor)'
      }
    },
    features: [
      'Fallback automático para Perplexity quando outros provedores falham',
      'Detecção inteligente de erros de quota e API',
      'Retry com backoff exponencial',
      'Monitoramento de saúde de todos os provedores',
      'Logs detalhados de debug'
    ],
    providers: [
      'OpenAI GPT-4o Mini (prioridade 1)',
      'Google Gemini (prioridade 2)', 
      'Perplexity AI (prioridade 3)',
      'Anthropic Claude (prioridade 4, opcional)'
    ],
    fallbackOrder: [
      '1. OpenAI GPT-4o Mini',
      '2. Google Gemini', 
      '3. Perplexity AI ← Fallback preferido',
      '4. Anthropic Claude (se configurado)'
    ],
    timestamp: new Date().toISOString()
  })
}
