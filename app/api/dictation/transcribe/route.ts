import { NextRequest, NextResponse } from 'next/server'
import { callGrok } from '@/lib/providers/grok'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log(`🎤 [DICTATION] Processing audio file: ${audioFile.name} (${audioFile.size} bytes)`)

    // Verificar se temos as chaves de API necessárias
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'Gemini API key not configured for audio transcription'
      }, { status: 500 })
    }

    // Converter arquivo de áudio para base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Determinar o tipo MIME correto
    let mimeType = audioFile.type
    if (!mimeType || mimeType === '') {
      // Tentar detectar pelo nome do arquivo
      const fileName = audioFile.name.toLowerCase()
      if (fileName.includes('.webm')) mimeType = 'audio/webm'
      else if (fileName.includes('.mp3')) mimeType = 'audio/mpeg'
      else if (fileName.includes('.wav')) mimeType = 'audio/wav'
      else if (fileName.includes('.ogg')) mimeType = 'audio/ogg'
      else mimeType = 'audio/webm' // Padrão
    }

    console.log(`🔗 [DICTATION] Transcribing audio with Gemini 2.5... (${mimeType})`)

    // Usar Gemini para transcrição (suporta áudio)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio
        }
      },
      'Transcreva este áudio em português brasileiro. Seja preciso e mantenha a formatação natural da fala.'
    ])

    const response = await result.response
    const transcriptionText = response.text()

    if (!transcriptionText || transcriptionText.trim() === '') {
      console.log('⚠️ [DICTATION] Empty transcription received from Gemini')
      return NextResponse.json({
        error: 'Falha na transcrição do áudio - resposta vazia',
        details: 'O áudio pode estar muito curto ou com qualidade insuficiente'
      }, { status: 500 })
    }

    console.log(`✅ [DICTATION] Audio transcribed successfully with Gemini 2.5 (${transcriptionText.length} chars)`)

    // Se temos Grok disponível, usar para polir a transcrição
    let polishedText = transcriptionText
    if (process.env.GROK_API_KEY) {
      try {
        console.log('🚀 [DICTATION] Polishing transcription with Grok 4 Fast...')
        
        const polishResult = await callGrok(
          'grok-4-fast-reasoning',
          [],
          `Polir esta transcrição de áudio para torná-la mais clara e organizada, mantendo todo o conteúdo original:

${transcriptionText}

Instruções:
- Remova palavras de preenchimento (um, uh, né, tipo)
- Corrija repetições desnecessárias
- Mantenha a formatação natural
- Organize em parágrafos quando apropriado
- Preserve todo o conteúdo original`,
          'Você é um especialista em edição de transcrições. Sempre mantenha o conteúdo original enquanto melhora a clareza e organização do texto.'
        )

        polishedText = polishResult.text
        console.log('✅ [DICTATION] Transcription polished successfully with Grok 4 Fast')
      } catch (grokError) {
        console.log('⚠️ [DICTATION] Grok polishing failed, using raw transcription:', grokError)
        // Continuar com a transcrição original se Grok falhar
      }
    }

    return NextResponse.json({
      success: true,
      transcription: polishedText,
      rawTranscription: transcriptionText,
      audioInfo: {
        name: audioFile.name,
        size: audioFile.size,
        type: audioFile.type
      },
      timestamp: new Date().toISOString(),
      aiProviders: {
        transcription: 'gemini-2.5-flash',
        polishing: process.env.GROK_API_KEY ? 'grok-4-fast-reasoning' : 'none'
      }
    })

  } catch (error: any) {
    console.error('❌ [DICTATION] Processing error:', error)
    return NextResponse.json({
      error: 'Failed to process audio',
      details: error.message
    }, { status: 500 })
  }
}
