import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
  isOfficial?: boolean
  isAIGenerated?: boolean
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API key da OpenAI não configurada' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { count = 5, category } = body

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em temas de redação do ENEM. Gere ${count} temas de redação inéditos e relevantes para o Brasil contemporâneo, seguindo o padrão dos temas oficiais do ENEM.

Cada tema deve:
- Ser relevante para a sociedade brasileira atual
- Permitir argumentação e proposta de intervenção
- Seguir o formato: "Desafios para [tópico] no Brasil" ou similar
- Ser adequado para estudantes do ensino médio
- Não repetir temas já utilizados oficialmente
- ${category ? `Focar na categoria: ${category}` : 'Abordar diferentes áreas sociais'}

Responda apenas com um JSON array contendo objetos com as propriedades: theme, description.`
        },
        {
          role: "user",
          content: `Gere ${count} temas de redação para o ENEM seguindo os critérios mencionados.${category ? ` Foque na categoria: ${category}.` : ''}`
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Resposta vazia da IA')
    }

    const aiThemes = JSON.parse(response)
    
    // Validar e formatar os temas gerados
    const formattedThemes: EnemTheme[] = aiThemes.map((theme: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      year: 2025,
      theme: theme.theme || theme.title || 'Tema gerado por IA',
      description: theme.description || 'Tema gerado por IA para prática',
      isAIGenerated: true
    }))

    return NextResponse.json({
      success: true,
      themes: formattedThemes,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao gerar temas com IA:', error)
    
    // Retornar temas de fallback se IA falhar
    const fallbackThemes: EnemTheme[] = [
      {
        id: `ai-fallback-${Date.now()}`,
        year: 2025,
        theme: 'Desafios para a sustentabilidade ambiental nas cidades brasileiras',
        description: 'Tema gerado por IA para prática',
        isAIGenerated: true
      },
      {
        id: `ai-fallback-${Date.now()}-2`,
        year: 2025,
        theme: 'Impactos da inteligência artificial na educação brasileira',
        description: 'Tema gerado por IA para prática',
        isAIGenerated: true
      },
      {
        id: `ai-fallback-${Date.now()}-3`,
        year: 2025,
        theme: 'Desafios para a inclusão digital de idosos no Brasil',
        description: 'Tema gerado por IA para prática',
        isAIGenerated: true
      }
    ]

    return NextResponse.json({
      success: true,
      themes: fallbackThemes,
      generatedAt: new Date().toISOString(),
      note: 'Temas de fallback utilizados devido a erro na IA'
    })
  }
}
