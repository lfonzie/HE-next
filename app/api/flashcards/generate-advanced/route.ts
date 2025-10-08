import { NextRequest, NextResponse } from 'next/server'
import { callGrok } from '@/lib/providers/grok'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface AdvancedFlashcard {
  term: string
  definition: string
  category: string
  difficulty: 'básico' | 'intermediário' | 'avançado'
  examples?: string[]
  relatedConcepts?: string[]
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json({
        error: 'Grok API key not configured'
      }, { status: 500 })
    }

    const { topic, level = 'intermediário', count = 10, focus = 'conceitos-principais' } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Tópico é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`📚 [FLASHCARDS-ADVANCED] Generating advanced flashcards with Grok 4 Fast:`, {
      topic,
      level,
      count,
      focus
    })

    const prompt = `Crie flashcards educacionais avançados para o tópico "${topic}" com foco em "${focus}".

ESPECIFICAÇÕES:
- Nível: ${level}
- Quantidade: ${count} flashcards
- Foco: ${focus}

INSTRUÇÕES DETALHADAS:
1. **CONTEÚDO PRINCIPAL**: Cada flashcard deve cobrir conceitos fundamentais e essenciais
2. **PROGRESSÃO PEDAGÓGICA**: Organize do básico ao avançado
3. **DEFINIÇÕES PRECISAS**: Máximo 2-3 frases, sem informações desnecessárias
4. **EXEMPLOS PRÁTICOS**: Inclua exemplos reais quando relevante
5. **CONCEITOS RELACIONADOS**: Mencione conceitos conectados
6. **CATEGORIZAÇÃO**: Classifique por área de conhecimento

FORMATO DE SAÍDA JSON:
{
  "flashcards": [
    {
      "term": "Termo específico",
      "definition": "Definição concisa e educativa",
      "category": "Categoria do conhecimento",
      "difficulty": "básico/intermediário/avançado",
      "examples": ["Exemplo 1", "Exemplo 2"],
      "relatedConcepts": ["Conceito 1", "Conceito 2"]
    }
  ]
}

Gere ${count} flashcards de alta qualidade para "${topic}".`

    try {
      const result = await callGrok(
        'grok-4-fast-reasoning',
        [],
        prompt,
        'Você é um especialista em educação e criação de materiais didáticos avançados. Sua especialidade é criar flashcards que maximizam o aprendizado através de conteúdo focado, pedagogicamente estruturado e pedagogicamente eficaz. Sempre priorize conceitos fundamentais e informações essenciais.'
      )

      const text = result.text

      console.log(`✅ [FLASHCARDS-ADVANCED] Advanced flashcards generated successfully with Grok 4 Fast`)

      // Tentar extrair JSON da resposta
      let flashcardsData;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          flashcardsData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback se não conseguir fazer parse do JSON
          flashcardsData = {
            flashcards: [{
              term: 'Conceito não identificado',
              definition: 'Definição não disponível',
              category: 'Geral',
              difficulty: level,
              examples: [],
              relatedConcepts: [],
              rawResponse: text
            }]
          };
        }
      } catch (parseError) {
        flashcardsData = {
          flashcards: [{
            term: 'Conceito não identificado',
            definition: 'Definição não disponível',
            category: 'Geral',
            difficulty: level,
            examples: [],
            relatedConcepts: [],
            rawResponse: text
          }]
        };
      }

      return NextResponse.json({
        success: true,
        flashcards: flashcardsData.flashcards,
        topic,
        level,
        count: flashcardsData.flashcards.length,
        focus,
        timestamp: new Date().toISOString(),
        aiProvider: 'grok-4-fast-reasoning'
      })

    } catch (error: any) {
      console.error('❌ [FLASHCARDS-ADVANCED] Error generating advanced flashcards:', error)
      return NextResponse.json({
        error: 'Failed to generate advanced flashcards',
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ [FLASHCARDS-ADVANCED] Processing error:', error)
    return NextResponse.json({
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 })
  }
}
