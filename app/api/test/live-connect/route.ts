import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Store active sessions in memory (in production, use Redis or similar)
const activeSessions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured' 
      }, { status: 500 })
    }

    // Generate session ID
    const sessionId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store session info
    activeSessions.set(sessionId, {
      createdAt: Date.now(),
      status: 'active'
    })

    console.log(`🔗 [LIVE-CHAT-TEST] Session created: ${sessionId}`)

    // Test Gemini API connection
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      })

      // Test basic connection
      const model = 'models/gemini-2.5-flash-native-audio-preview-09-2025'
      
      return NextResponse.json({ 
        sessionId,
        status: 'connected',
        geminiTest: 'success',
        message: 'Conexão com Gemini Live estabelecida com sucesso!'
      })
    } catch (geminiError: any) {
      console.error('❌ [LIVE-CHAT-TEST] Gemini connection error:', geminiError)
      return NextResponse.json({ 
        error: 'Failed to connect to Gemini Live',
        details: geminiError.message,
        sessionId
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ [LIVE-CHAT-TEST] Connection error:', error)
    return NextResponse.json({ 
      error: 'Failed to establish connection',
      details: error.message 
    }, { status: 500 })
  }
}
