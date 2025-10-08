// Step 2: Searching for Curiosities for the Loading Screen
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json()

    if (!theme || typeof theme !== 'string') {
      return NextResponse.json(
        { error: 'Theme is required' },
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

    console.log('💡 Step 2: Searching curiosities for:', theme)

    // Call Grok to get curiosities
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
            content: `Você é um especialista em criar curiosidades educacionais fascinantes.

Sua tarefa é gerar EXATAMENTE 5 curiosidades interessantes e surpreendentes sobre o tema fornecido.

REQUISITOS:
1. Cada curiosidade deve ter entre 15-25 palavras
2. Use fatos verificáveis e surpreendentes
3. Inclua dados numéricos quando possível
4. Torne cada curiosidade única e memorável
5. Use linguagem acessível e envolvente
6. Adicione emojis relevantes no início de cada curiosidade

FORMATO DE RESPOSTA (JSON):
{
  "curiosities": [
    "🌟 Primeira curiosidade fascinante...",
    "🎯 Segunda curiosidade interessante...",
    "⚡ Terceira curiosidade surpreendente...",
    "🔬 Quarta curiosidade científica...",
    "💡 Quinta curiosidade educativa..."
  ]
}

Responda APENAS com JSON válido.`
          },
          {
            role: 'user',
            content: `Tema: ${theme}`
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Grok API error:', response.status, errorText)
      throw new Error(`Grok API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from Grok')
    }

    const parsed = JSON.parse(content)
    const curiosities = parsed.curiosities || []

    console.log(`✅ Found ${curiosities.length} curiosities`)

    return NextResponse.json({
      success: true,
      curiosities,
      theme,
      provider: 'grok-2-1212'
    })

  } catch (error) {
    console.error('❌ Error fetching curiosities:', error)
    
    // Fallback curiosities
    const fallbackCuriosities = [
      '🧠 O cérebro humano processa informações 200.000 vezes mais rápido que um computador',
      '📚 A leitura regular pode aumentar a expectativa de vida em até 2 anos',
      '🎯 Objetivos claros aumentam a probabilidade de sucesso em até 40%',
      '⚡ Aprendizagem ativa é 6 vezes mais eficaz que aprendizagem passiva',
      '💡 Cada pessoa tem um estilo de aprendizado único - visual, auditivo ou cinestésico'
    ]

    return NextResponse.json({
      success: true,
      curiosities: fallbackCuriosities,
      theme: '',
      provider: 'fallback'
    })
  }
}

