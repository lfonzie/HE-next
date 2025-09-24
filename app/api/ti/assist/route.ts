import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

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
    const systemPrompt = `Você é um técnico de TI especializado em ambiente educacional. Seu objetivo é resolver problemas técnicos de forma rápida e eficiente.

CONTEXTO:
- Ambiente: Escola/instituição educacional
- Usuário: Funcionário da escola (professor, coordenador, secretário)
- Objetivo: Resolver problemas técnicos de forma rápida e eficiente
- Metodologia: Diagnóstico passo a passo com soluções práticas

INSTRUÇÕES:
1. Seja objetivo e didático
2. Use linguagem simples e clara
3. Forneça passos específicos e acionáveis
4. Priorize soluções que o usuário pode executar
5. Se necessário, sugira escalação para suporte técnico
6. Mantenha o foco na resolução do problema

Problema relatado: "${message}"
Tipo de problema: ${issue || 'não especificado'}
Dispositivo: ${deviceLabel || 'não especificado'}

Responda de forma estruturada, incluindo:
- Diagnóstico do problema
- Passos específicos para resolução
- Verificações adicionais se necessário
- Próximos passos ou escalação se apropriado`

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