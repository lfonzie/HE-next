import { NextRequest, NextResponse } from 'next/server'

// Google Cloud Text-to-Speech configuration
const GOOGLE_TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'
const GOOGLE_API_KEY = process.env.GOOGLE_TTS_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'pt-BR-Wavenet-C', speed = 1.0, pitch = 0.0 } = await request.json()

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Check if Google API key is configured
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured. Please set GOOGLE_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // Google Cloud TTS request
    const ttsRequest = {
      input: { text: text.trim() },
      voice: {
        languageCode: 'pt-BR',
        name: voice,
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speed,
        pitch: pitch,
        volumeGainDb: 0.0
      }
    }

    const response = await fetch(`${GOOGLE_TTS_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsRequest)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to generate speech')
    }

    const result = await response.json()
    
    // Return the audio data
    return new NextResponse(Buffer.from(result.audioContent, 'base64'), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="speech.mp3"',
      },
    })

  } catch (error) {
    console.error('Google TTS Error:', error)
    
    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid Google API key' },
          { status: 401 }
        )
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Google TTS quota exceeded' },
          { status: 429 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Google TTS rate limit exceeded' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate speech' },
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
