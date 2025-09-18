import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { orchestrate } from '@/lib/orchestrator'
import '@/lib/orchestrator-modules' // ensure modules are registered

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação usando NextAuth (desabilitado temporariamente para desenvolvimento)
    const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { message, context } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const result = await orchestrate({ text: message, context })
    return NextResponse.json(result)

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
