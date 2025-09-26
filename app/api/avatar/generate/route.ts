import { NextRequest, NextResponse } from 'next/server'

// D-ID API configuration
const DID_API_URL = 'https://api.d-id.com'
const DID_API_KEY = process.env.DID_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'Zephyr', model = 'tts-1' } = await request.json()

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Check if D-ID API key is configured
    if (!DID_API_KEY) {
      return NextResponse.json(
        { error: 'D-ID API key not configured. Please set DID_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // Map OpenAI voices to D-ID voices
    const voiceMapping = {
      'alloy': 'amy',
      'echo': 'david',
      'fable': 'sarah',
      'onyx': 'michael',
      'nova': 'emma',
      'shimmer': 'lily'
    }

    const didVoice = voiceMapping[voice] || 'amy'

    // Create talking avatar video
    const response = await fetch(`${DID_API_URL}/talks`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text.trim(),
          provider: {
            type: 'microsoft',
            voice_id: didVoice
          }
        },
        source_url: 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg', // Default avatar
        config: {
          fluent: true,
          pad_audio: 0.0
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create talking avatar')
    }

    const result = await response.json()
    
    // Return the video creation result
    return NextResponse.json({
      success: true,
      videoId: result.id,
      status: result.status,
      message: 'Talking avatar video created successfully',
      // Note: The actual video URL will be available after processing
      // You'll need to poll the status endpoint to get the final video URL
    })

  } catch (error) {
    console.error('Talking Avatar Creation Error:', error)
    
    // Handle specific D-ID errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid D-ID API key' },
          { status: 401 }
        )
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'D-ID API quota exceeded' },
          { status: 429 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'D-ID API rate limit exceeded' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create talking avatar' },
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
