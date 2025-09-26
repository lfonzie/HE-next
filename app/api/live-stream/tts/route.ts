import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'Gemini API key not configured'
      }, { status: 500 })
    }

    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    console.log(`🔊 [TTS] Converting text to speech: ${text.substring(0, 100)}...`)

    // Use Gemini to generate audio response with native support
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp" })

    try {
      // Generate audio using Gemini's audio capabilities
      const result = await model.generateContent([
        {
          text: `Convert this text to speech in a natural, conversational tone: "${text}"`
        }
      ])

      const response = await result.response
      const audioData = response.text()

      // For now, we'll return the text and let the frontend handle TTS
      // In a full implementation, we'd use Google Cloud TTS or similar
      return NextResponse.json({
        success: true,
        text: audioData,
        audioUrl: null // Will be handled by browser TTS
      })

    } catch (error: any) {
      console.error('❌ [TTS] Error generating audio:', error)
      return NextResponse.json({
        error: 'Failed to generate audio response',
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ [TTS] Processing error:', error)
    return NextResponse.json({
      error: 'Failed to process TTS request',
      details: error.message
    }, { status: 500 })
  }
}
