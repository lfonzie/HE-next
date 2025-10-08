// Step 1: Theme Filtering Using Grok 4 Fast Reasoning
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const XAI_API_KEY = process.env.XAI_API_KEY

    if (!XAI_API_KEY) {
      console.error('❌ XAI_API_KEY not configured')
      return NextResponse.json(
        { error: 'XAI API key not configured' },
        { status: 500 }
      )
    }

    console.log('🔍 Step 1: Filtering theme with Grok 4 Fast')
    console.log('📝 Original topic:', topic)

    // Call Grok 4 Fast for theme extraction
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise e filtragem de temas educacionais.

Sua tarefa é extrair o tema PRINCIPAL e ESSENCIAL de uma descrição de tópico educacional.

REGRAS:
1. Extraia APENAS o conceito central, removendo detalhes extras
2. Retorne uma palavra-chave ou frase curta (máximo 3-4 palavras)
3. Use substantivos concretos quando possível
4. Mantenha em português
5. Foque no que pode ser visualmente representado

EXEMPLOS:
"Como funciona a fotossíntese nas plantas" → "fotossíntese"
"Entendendo as leis de Newton e suas aplicações" → "leis de Newton"
"História do Brasil no período colonial" → "Brasil colonial"
"Matemática: equações do segundo grau" → "equações segundo grau"

Responda APENAS com o tema filtrado, sem explicações adicionais.`
          },
          {
            role: 'user',
            content: topic
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Grok API error:', response.status, errorText)
      throw new Error(`Grok API error: ${response.status}`)
    }

    const data = await response.json()
    const filteredTheme = data.choices[0]?.message?.content?.trim() || topic

    console.log('✅ Filtered theme:', filteredTheme)

    return NextResponse.json({
      success: true,
      filteredTheme,
      originalTopic: topic,
      provider: 'grok-2-1212'
    })

  } catch (error) {
    console.error('❌ Error in theme filtering:', error)
    return NextResponse.json(
      { 
        error: 'Failed to filter theme',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

