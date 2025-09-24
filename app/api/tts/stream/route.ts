import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      text, 
      voice = 'shimmer', 
      model = 'tts-1',
      speed = 1.0,
      format = 'mp3',
      chunkSize = 100 // Number of characters per audio chunk
    } = await request.json()

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate voice parameter
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    if (!validVoices.includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice. Must be one of: ${validVoices.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate model parameter
    const validModels = ['tts-1', 'tts-1-hd']
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Must be one of: ${validModels.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate speed parameter
    if (speed < 0.25 || speed > 4.0) {
      return NextResponse.json(
        { error: 'Speed must be between 0.25 and 4.0' },
        { status: 400 }
      )
    }

    // Validate format parameter
    const validFormats = ['mp3', 'opus', 'aac', 'flac']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Split text into chunks for streaming
    const textChunks = []
    const words = text.trim().split(' ')
    let currentChunk = ''
    
    for (const word of words) {
      if (currentChunk.length + word.length + 1 <= chunkSize) {
        currentChunk += (currentChunk ? ' ' : '') + word
      } else {
        if (currentChunk) {
          textChunks.push(currentChunk)
        }
        currentChunk = word
      }
    }
    
    if (currentChunk) {
      textChunks.push(currentChunk)
    }

    // Create streaming response
    const encoder = new TextEncoder()
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'metadata',
            totalChunks: textChunks.length,
            voice,
            model,
            speed,
            format
          })}\n\n`))

          // Generate audio for each chunk
          for (let i = 0; i < textChunks.length; i++) {
            const chunk = textChunks[i]
            
            try {
              // Generate audio for this chunk
              const mp3 = await openai.audio.speech.create({
                model,
                voice: voice as any,
                input: chunk,
                response_format: format,
                speed: speed
              })

              // Convert to buffer
              const buffer = Buffer.from(await mp3.arrayBuffer())
              
              // Send chunk data
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'audio_chunk',
                chunkIndex: i,
                text: chunk,
                audioData: buffer.toString('base64'),
                isLast: i === textChunks.length - 1
              })}\n\n`))

            } catch (chunkError) {
              console.error(`Error generating audio for chunk ${i}:`, chunkError)
              // Send error for this chunk but continue with others
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'chunk_error',
                chunkIndex: i,
                text: chunk,
                error: 'Failed to generate audio for this chunk'
              })}\n\n`))
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'complete',
            totalChunks: textChunks.length
          })}\n\n`))
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

        } catch (error) {
          console.error('Streaming TTS Error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error',
            error: 'Failed to generate streaming audio'
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-TTS-Config': JSON.stringify({ voice, model, speed, format, chunkSize })
      },
    })

  } catch (error) {
    console.error('TTS Streaming Error:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key' },
          { status: 401 }
        )
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded' },
          { status: 429 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'OpenAI API rate limit exceeded' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate streaming audio' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
