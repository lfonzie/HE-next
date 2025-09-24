import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

    // Simple response without AI for now
    const response = {
      success: true,
      message: `Recebido seu problema: "${message}"`,
      sessionId: sessionId || 'session-' + Date.now(),
      issue: issue || 'não especificado',
      deviceLabel: deviceLabel || 'não especificado',
      timestamp: new Date().toISOString(),
      nextSteps: [
        '1. Verificar conexões físicas',
        '2. Reiniciar o dispositivo',
        '3. Verificar configurações',
        '4. Contatar suporte técnico se necessário'
      ],
      note: 'API funcionando - integração com IA será adicionada quando as variáveis de ambiente estiverem configuradas'
    }

    return NextResponse.json(response)

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
    message: 'TI Assist API is working',
    timestamp: new Date().toISOString()
  })
}