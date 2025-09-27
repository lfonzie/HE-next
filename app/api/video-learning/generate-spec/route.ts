import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SPEC_FROM_VIDEO_PROMPT } from '@/lib/video-learning-prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL do vídeo é obrigatória' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    let result
    try {
      result = await model.generateContent([
        SPEC_FROM_VIDEO_PROMPT,
        {
          fileData: {
            mimeType: 'video/mp4',
            fileUri: videoUrl,
          },
        },
      ])
    } catch (tokenError) {
      // If token limit exceeded, try with a text-only approach
      if (tokenError.message.includes('token count exceeds') || tokenError.message.includes('maximum number of tokens')) {
        console.log('Token limit exceeded, trying text-only approach...')
        
        // Fallback: Ask user to provide video description instead
        return NextResponse.json(
          { 
            error: 'Vídeo muito grande para processar diretamente. Por favor, forneça uma descrição do conteúdo do vídeo.',
            requiresDescription: true 
          },
          { status: 413 }
        )
      }
      throw tokenError
    }

    const response = await result.response
    const text = response.text()

    if (!text) {
      return NextResponse.json(
        { error: 'Falha ao gerar especificação' },
        { status: 500 }
      )
    }

    // Parse JSON response
    try {
      // Try multiple approaches to extract JSON
      let jsonString = null
      
      // First, try to find JSON between ```json and ``` markers
      const codeBlockMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/)
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1]
      } else {
        // Fallback: try to find JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonString = jsonMatch[0]
        }
      }

      if (!jsonString) {
        throw new Error('Resposta não contém JSON válido')
      }

      // Clean the JSON string by removing control characters that might cause issues
      let cleanedJson = jsonString
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove problematic control characters (keep \n, \r, \t)
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n') // Convert remaining \r to \n
        .trim() // Remove leading/trailing whitespace

      // Try to parse, if it fails, try additional cleaning
      let parsed
      try {
        parsed = JSON.parse(cleanedJson)
      } catch (firstError) {
        console.log('First parse attempt failed, trying additional cleaning...')
        console.log('Problematic JSON around position 179:', cleanedJson.substring(170, 190))
        
        // More aggressive cleaning - escape all remaining problematic characters
        cleanedJson = cleanedJson
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove all control characters
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\t/g, '\\t') // Escape tabs
          .replace(/\\n/g, '\n') // Convert back to actual newlines
          .replace(/\\t/g, '\t') // Convert back to actual tabs
        
        parsed = JSON.parse(cleanedJson)
      }
      
      if (!parsed.spec) {
        throw new Error('Especificação não encontrada na resposta')
      }

      return NextResponse.json({
        spec: parsed.spec,
        videoUrl
      })

    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError)
      console.error('Texto da resposta:', text.substring(0, 500) + '...')
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro ao gerar especificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
