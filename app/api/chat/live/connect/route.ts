import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Store active sessions in memory (in production, use Redis or similar)
const activeSessions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY, GOOGLE_API_KEY, or GEMINI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    // Generate session ID
    const sessionId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store session info (simplified for now - Live API not available)
    activeSessions.set(sessionId, {
      userId: session.user?.id,
      createdAt: Date.now(),
      status: 'active'
    })

    console.log(`🔗 [LIVE-CHAT] Session created: ${sessionId}`)

    return NextResponse.json({ 
      sessionId,
      status: 'connected'
    })

  } catch (error: any) {
    console.error('❌ [LIVE-CHAT] Connection error:', error)
    return NextResponse.json({ 
      error: 'Failed to establish connection',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Remove session
    activeSessions.delete(sessionId)
    console.log(`🔌 [LIVE-CHAT] Session deleted: ${sessionId}`)

    return NextResponse.json({ 
      status: 'disconnected',
      sessionId 
    })

  } catch (error: any) {
    console.error('❌ [LIVE-CHAT] Disconnection error:', error)
    return NextResponse.json({ 
      error: 'Failed to disconnect',
      details: error.message 
    }, { status: 500 })
  }
}