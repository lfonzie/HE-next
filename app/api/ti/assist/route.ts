import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'

export const runtime = 'nodejs'

const requestSchema = z.object({
  message: z.string(),
  sessionId: z.string().optional(),
  issue: z.string().optional(),
  deviceLabel: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sessionId, issue, deviceLabel } = requestSchema.parse(body)

    console.log('TI Assist API called with:', { message, sessionId, issue, deviceLabel })

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API not configured',
        message: 'A chave da API OpenAI não está configurada. Verifique as variáveis de ambiente.'
      }, { status: 500 })
    }

    // Enhanced system prompt for AI-powered TI support
    const systemPrompt = `Você é um técnico de TI especializado em ambiente educacional brasileiro. Seu nome é TechEdu e você trabalha especificamente com escolas públicas e privadas.

CONTEXTO ESPECÍFICO:
- Ambiente: Escola brasileira (pública ou privada)
- Usuário: ${deviceLabel ? `Funcionário usando ${deviceLabel}` : 'Funcionário da escola'}
- Problema: ${issue ? `Categoria: ${issue}` : 'Problema técnico geral'}
- Urgência: Resolver rapidamente para não afetar as aulas

METODOLOGIA PERSONALIZADA:
1. Analise o problema específico mencionado: "${message}"
2. Considere o contexto educacional brasileiro
3. Forneça soluções práticas que funcionem em escolas
4. Use terminologia técnica simples mas precisa
5. Inclua verificações específicas para equipamentos escolares
6. Sugira alternativas quando necessário

FORMATO DE RESPOSTA:
🔧 **DIAGNÓSTICO RÁPIDO**
[Análise específica do problema mencionado]

⚡ **SOLUÇÃO IMEDIATA** 
[Passo a passo específico para resolver AGORA]

🔍 **VERIFICAÇÕES ESPECÍFICAS**
[Checagens específicas para o problema]

📋 **PRÓXIMOS PASSOS**
[O que fazer se não resolver]

⚠️ **ESCALAÇÃO**
[Quando chamar o técnico da escola]

IMPORTANTE: Seja específico sobre o problema mencionado. Não dê respostas genéricas. Foque na situação exata descrita pelo usuário.`

    // AI-powered response
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: message,
    })

    return NextResponse.json({
      success: true,
      message: result.text,
      sessionId: sessionId || 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      aiPowered: true
    })

  } catch (error) {
    console.error('TI Assist API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'TI Assist API with AI is working',
    timestamp: new Date().toISOString(),
    features: ['AI-powered responses', 'Educational context'],
    openaiConfigured: !!process.env.OPENAI_API_KEY
  })
}