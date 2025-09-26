import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'Zephyr', speed = 1.0, pitch = 0.0 } = await request.json()

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Check if Gemini API key is configured
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    console.log(`🎤 [GEMINI-NATIVE-AUDIO] Generating audio for: "${text.substring(0, 50)}..."`)

    // For now, return a simple text response indicating the feature is not yet available
    // This prevents the empty response error
    return NextResponse.json({
      message: 'Gemini Native Audio is not yet available in this implementation',
      suggestion: 'Please use Google TTS or OpenAI TTS instead',
      text: text.trim(),
      voice: voice
    }, { status: 501 })

  } catch (error) {
    console.error('Gemini Native Audio Error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate audio with Gemini Native Audio' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
