import { NextRequest, NextResponse } from 'next/server'
import { generateCuriosities, generateTopicIntroduction } from '@/lib/providers/gemini'

export async function POST(request: NextRequest) {
  try {
    const { topic, type = 'curiosities' } = await request.json()

    if (!topic || typeof topic !== 'string' || topic.trim().length < 5) {
      return NextResponse.json(
        { error: 'Tópico inválido. Deve ter pelo menos 5 caracteres.' },
        { status: 400 }
      )
    }

    console.log(`🎯 Gerando ${type} para o tópico:`, topic)

    if (type === 'introduction') {
      // Gerar introdução específica sobre o tópico
      const introduction = await generateTopicIntroduction(topic.trim())
      
      if (!introduction) {
        return NextResponse.json(
          { error: 'Não foi possível gerar introdução para este tópico.' },
          { status: 500 }
        )
      }

      console.log('✅ Introdução gerada com sucesso')

      return NextResponse.json({
        success: true,
        introduction,
        topic: topic.trim()
      })
    } else {
      // Gerar curiosidades (comportamento padrão)
      const curiosities = await generateCuriosities(topic.trim())

      if (!curiosities || curiosities.length === 0) {
        return NextResponse.json(
          { error: 'Não foi possível gerar curiosidades para este tópico.' },
          { status: 500 }
        )
      }

      console.log('✅ Curiosidades geradas com sucesso:', curiosities.length)

      return NextResponse.json({
        success: true,
        curiosities,
        topic: topic.trim()
      })
    }

  } catch (error) {
    console.error('❌ Erro ao gerar conteúdo:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao gerar conteúdo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
