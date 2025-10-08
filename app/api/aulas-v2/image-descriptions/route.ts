// Step 4: Parallel Creation of JSON for Gemini 2.5 Image Prompts
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

    console.log('🎨 Step 4: Creating Gemini 2.5 image prompts for:', theme)

    // Call Grok to generate detailed prompts for Gemini 2.5
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
            content: `Você é um especialista em criar prompts detalhados para geração de imagens educacionais usando Gemini 2.5.

Sua tarefa é criar EXATAMENTE 6 prompts detalhados e específicos para o Gemini 2.5 gerar imagens educacionais sobre o tema fornecido.

REQUISITOS CRÍTICOS PARA GEMINI 2.5:
1. Prompts devem ser EXTREMAMENTE detalhados e específicos
2. Use linguagem descritiva rica em detalhes visuais
3. Especifique estilo, composição, iluminação, cores
4. Inclua contexto educacional claro
5. Cada prompt deve ter 50-100 palavras
6. Foque em elementos visuais concretos e educativos
7. Use termos técnicos de fotografia quando apropriado
8. NÃO inclua texto, palavras ou números nas imagens
9. Prompts devem ser em inglês para melhor resultado

DISTRIBUIÇÃO DAS 6 IMAGENS:
- Prompt 1 (Slide 1): Introdução visual ao tema
- Prompt 2 (Slide 3): Desenvolvimento conceitual
- Prompt 3 (Slide 6): Variações e casos especiais
- Prompt 4 (Slide 9): Exemplos práticos
- Prompt 5 (Slide 11): Síntese visual
- Prompt 6 (Slide 14): Conclusão e aplicação

EXEMPLOS DE PROMPTS DETALHADOS PARA GEMINI 2.5:
✅ "A detailed macro photograph of vibrant green plant leaves with visible chlorophyll structures, soft natural lighting from a window, shallow depth of field, educational laboratory setting, scientific accuracy, high resolution, professional photography style, warm color temperature, intricate cellular details visible"

✅ "A comprehensive diagram-style illustration showing interconnected concepts with flowing lines and geometric shapes, clean minimalist design, professional color palette of blues and greens, educational poster aesthetic, clear visual hierarchy, modern flat design style, high contrast elements, suitable for classroom display"

✅ "A realistic 3D rendered scene of students in a modern classroom environment, natural daylight streaming through large windows, diverse group of students engaged in learning, contemporary educational furniture, warm and inviting atmosphere, professional photography lighting, high detail and clarity"

FORMATO DE RESPOSTA (JSON):
{
  "prompts": [
    "Prompt detalhado e específico para Gemini 2.5 - Introdução",
    "Prompt detalhado e específico para Gemini 2.5 - Desenvolvimento",
    "Prompt detalhado e específico para Gemini 2.5 - Variações",
    "Prompt detalhado e específico para Gemini 2.5 - Exemplos",
    "Prompt detalhado e específico para Gemini 2.5 - Síntese",
    "Prompt detalhado e específico para Gemini 2.5 - Conclusão"
  ]
}

Responda APENAS com JSON válido.`
          },
          {
            role: 'user',
            content: `Tema: ${theme}\n\nCrie 6 prompts extremamente detalhados para o Gemini 2.5 gerar imagens educacionais sobre este tema. Cada prompt deve ser específico, rico em detalhes visuais e adequado para educação.`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
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
    const prompts = parsed.prompts || []

    if (prompts.length !== 6) {
      console.warn('⚠️ Expected 6 prompts, got:', prompts.length)
    }

    console.log(`✅ Created ${prompts.length} detailed Gemini 2.5 prompts`)

    return NextResponse.json({
      success: true,
      prompts,
      theme,
      provider: 'grok-2-1212',
      count: prompts.length
    })

  } catch (error) {
    console.error('❌ Error creating Gemini prompts:', error)
    
    // Fallback prompts
    const fallbackPrompts = [
      'A detailed educational illustration showing the main concept with clear visual elements, professional design, high quality, educational poster style, clean composition, vibrant colors, suitable for learning materials',
      'A comprehensive visual representation of the topic with detailed elements, scientific accuracy, professional photography style, clear lighting, educational context, high resolution, modern design',
      'An engaging educational scene depicting practical applications, realistic setting, natural lighting, professional quality, clear visual hierarchy, educational poster aesthetic, warm colors',
      'A detailed diagram-style illustration with interconnected elements, clean minimalist design, professional color palette, educational materials style, high contrast, modern flat design',
      'A synthesis visual showing key concepts integration, professional composition, educational poster style, clear visual flow, high quality rendering, suitable for classroom display',
      'A comprehensive conclusion visual with final elements, professional photography style, educational context, clear composition, high resolution, engaging visual design'
    ]

    return NextResponse.json({
      success: true,
      prompts: fallbackPrompts,
      theme: '',
      provider: 'fallback',
      count: 6
    })
  }
}

