import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai, selectModel, getModelConfig } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação usando NextAuth - OBRIGATÓRIO
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('❌ No valid session found')
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }
    
    console.log('✅ Authenticated user:', session.user?.email)

    const { query, subject, sessionInfo } = await request.json()
    
    // Log informações de sessão para debug
    if (sessionInfo) {
      console.log('📊 Session info from frontend:', sessionInfo)
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // System prompt para o Professor IA
    const systemPrompt = `🚨 IDIOMA OBRIGATÓRIO E CRÍTICO: 
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIA e NÃO NEGOCIÁVEL
- Se detectar que está respondendo em outro idioma, pare imediatamente e refaça em português brasileiro

Você é um assistente educacional especializado em pedagogia brasileira. Sua missão é:

1. Fornecer explicações claras, didáticas e adequadas para estudantes brasileiros
2. Usar exemplos práticos e linguagem acessível
3. Alinhar respostas com a BNCC (Base Nacional Comum Curricular)
4. Focar no aprendizado efetivo e compreensão dos conceitos
5. Adaptar o conteúdo para diferentes níveis de ensino

FORMATAÇÃO MATEMÁTICA E QUÍMICA OBRIGATÓRIA:
- Use APENAS símbolos Unicode para matemática e química
- Matemática: x², √, ±, ÷, ×, ½, π, α, β, ∫, ∑, ∞, ≤, ≥, ≠, ≈, ≡
- Símbolos: •, ·, …, ⋯, ∠, △, □, ◇, ℏ, ℵ
- NUNCA use LaTeX, KaTeX, $...$, $$...$$, \\(...\\), \\[...\\]
- Sempre normalize caracteres Unicode para garantir compatibilidade

Quando apropriado, transforme perguntas em aulas gamificadas estruturadas com:
- Introdução clara
- Seções organizadas com explicações
- Exemplos práticos
- Quiz interativo com 4 opções
- Resumo e próximos passos

Sempre mantenha um tom empático, educativo e motivador.`

    // Preparar mensagem com contexto da disciplina
    const contextualizedQuery = subject 
      ? `Disciplina: ${subject}\n\nPergunta: ${query}`
      : query

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextualizedQuery }
    ]

    // Selecionar modelo baseado na complexidade da mensagem
    const selectedModel = selectModel(contextualizedQuery, 'professor')
    const modelConfig = getModelConfig(selectedModel)
    
    console.log(`Using model: ${selectedModel} for professor generation`)
    
    // Tentar gerar aula gamificada primeiro
    try {
      const gamifiedResponse = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${contextualizedQuery}\n\nPor favor, transforme esta pergunta em uma aula gamificada estruturada com introdução, seções explicativas, exemplos práticos, quiz interativo e resumo. Responda em formato JSON com a seguinte estrutura:
          {
            "title": "Título da aula",
            "subject": "disciplina",
            "introduction": "Introdução clara",
            "sections": [
              {
                "title": "Título da seção",
                "content": "Conteúdo explicativo",
                "examples": ["exemplo 1", "exemplo 2"]
              }
            ],
            "quiz": {
              "question": "Pergunta do quiz",
              "options": ["opção A", "opção B", "opção C", "opção D"],
              "correctAnswer": 0,
              "explanation": "Explicação da resposta correta"
            },
            "summary": "Resumo da aula",
            "nextSteps": ["próximo passo 1", "próximo passo 2"]
          }` }
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.max_tokens,
      })

      const gamifiedContent = gamifiedResponse.choices[0]?.message?.content || ''
      
      // Normalizar fórmulas químicas antes do parse
      const { normalizeFormulas, normalizeObjectFormulas } = await import('@/lib/utils/latex-normalization');
      const normalizedContent = normalizeFormulas(gamifiedContent);
      
      // Tentar parsear como JSON
      try {
        const lessonData = JSON.parse(normalizedContent)
        
        // Validar estrutura básica
        if (lessonData.title && lessonData.sections && lessonData.quiz) {
          return NextResponse.json({
            success: true,
            lesson: lessonData,
            type: 'gamified'
          })
        }
      } catch (parseError) {
        console.log('Failed to parse as JSON, falling back to simple response')
      }
    } catch (gamifiedError) {
      console.log('Gamified generation failed, falling back to simple response')
    }

    // Fallback para resposta simples
    const simpleResponse = await openai.chat.completions.create({
      model: selectedModel,
      messages: messages as any,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
    })

    const responseContent = simpleResponse.choices[0]?.message?.content || ''
    
    // Normalizar fórmulas químicas na resposta simples
    const { normalizeFormulas } = await import('@/lib/utils/latex-normalization');
    const normalizedResponse = normalizeFormulas(responseContent);

    return NextResponse.json({
      success: true,
      response: normalizedResponse,
      type: 'simple',
      subject: subject || 'geral'
    })

  } catch (error: any) {
    console.error('Professor API error:', error)
    
    // Preparar erro amigável
    let friendlyError = 'Erro interno do servidor. Tente novamente.'
    
    if (error.message?.includes('rate limit')) {
      friendlyError = 'Limite de taxa excedido. Tente novamente em alguns minutos.'
    } else if (error.message?.includes('quota')) {
      friendlyError = 'Cota de tokens excedida. Verifique seu plano.'
    } else if (error.message?.includes('network')) {
      friendlyError = 'Erro de conexão. Verifique sua internet e tente novamente.'
    }

    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}
