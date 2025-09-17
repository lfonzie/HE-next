import { NextRequest, NextResponse } from 'next/server'
import { processMessageWithImageGeneration } from '@/lib/gemini-integration'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        error: 'Mensagem é obrigatória' 
      }, { status: 400 })
    }

    console.log('🔄 Processando mensagem com comandos de imagem:', message)

    // Process the message and detect image generation commands
    const result = await processMessageWithImageGeneration(message)

    console.log('✅ Processamento concluído:', {
      originalMessage: message,
      processedMessage: result.processedMessage,
      imagesGenerated: result.generatedImages.length
    })

    return NextResponse.json({
      success: true,
      originalMessage: message,
      processedMessage: result.processedMessage,
      generatedImages: result.generatedImages,
      commandsDetected: result.generatedImages.length
    })

  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error)
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
