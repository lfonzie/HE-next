import { NextRequest, NextResponse } from 'next/server'
import { callGrok } from '@/lib/providers/grok'

interface Flashcard {
  term: string
  definition: string
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Tópico é obrigatório' },
        { status: 400 }
      )
    }

    const prompt = `Crie EXATAMENTE 12 flashcards educacionais de alta qualidade para o tópico "${topic}". 

INSTRUÇÕES IMPORTANTES:
1. **EXATAMENTE 12 FLASHCARDS**: Não mais, não menos. Sempre 12 flashcards.
2. **FOQUE NO CONTEÚDO PRINCIPAL**: Cada flashcard deve cobrir conceitos fundamentais e essenciais
3. **TERMOS CLAROS**: Use termos específicos e precisos (não genéricos)
4. **DEFINIÇÕES CONCISAS**: Máximo 2-3 frases por definição
5. **CONTEÚDO EDUCATIVO**: Priorize informações que realmente ajudam no aprendizado
6. **EXEMPLOS PRÁTICOS**: Inclua exemplos quando relevante
7. **DIFICULDADE PROGRESSIVA**: Comece com conceitos básicos e avance para mais complexos

FORMATO DE SAÍDA:
Termo: Definição concisa e educativa

EXEMPLO DE QUALIDADE:
Fotossíntese: Processo pelo qual plantas convertem luz solar em energia química, produzindo glicose e liberando oxigênio
Mitocôndria: Organela celular responsável pela respiração celular e produção de ATP

Gere EXATAMENTE 12 flashcards de alta qualidade para "${topic}".`

    const result = await callGrok(
      'grok-4-fast-reasoning',
      [],
      prompt,
      'Você é um especialista em educação e criação de materiais didáticos. Sua especialidade é criar flashcards que maximizam o aprendizado através de conteúdo focado, preciso e pedagogicamente eficaz. Sempre priorize conceitos fundamentais e informações essenciais que realmente importam para o aprendizado.'
    )

    const text = result.text

    if (!text) {
      return NextResponse.json(
        { error: 'Falha ao gerar flashcards' },
        { status: 500 }
      )
    }

    // Parse the response to extract flashcards
    const flashcards: Flashcard[] = text
      .split('\n')
      .map((line) => {
        const parts = line.split(':')
        if (parts.length >= 2 && parts[0].trim()) {
          const term = parts[0].trim()
          const definition = parts.slice(1).join(':').trim()
          if (definition) {
            return { term, definition }
          }
        }
        return null
      })
      .filter((card): card is Flashcard => card !== null)

    if (flashcards.length === 0) {
      return NextResponse.json(
        { error: 'Não foi possível gerar flashcards válidos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      flashcards,
      topic,
      count: flashcards.length
    })

  } catch (error) {
    console.error('Erro ao gerar flashcards:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
