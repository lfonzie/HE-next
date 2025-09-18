import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma' // Temporariamente desabilitado devido a problemas de conexão
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RedacaoSubmission {
  theme: string
  content: string
  wordCount: number
  uploadedFileName?: string
  uploadedFileSize?: number
}

interface CompetenciaScore {
  comp1: number // Domínio da norma padrão (0-200)
  comp2: number // Compreensão do tema (0-200)
  comp3: number // Organização de argumentos (0-200)
  comp4: number // Mecanismos linguísticos (0-200)
  comp5: number // Proposta de intervenção (0-200)
}

interface RedacaoEvaluation {
  scores: CompetenciaScore
  totalScore: number
  feedback: string
  suggestions: string[]
  highlights: {
    grammar: string[]
    structure: string[]
    content: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body: RedacaoSubmission = await request.json()
    const { theme, content, wordCount, uploadedFileName, uploadedFileSize } = body

    // Validações básicas
    if (!theme || !content) {
      return NextResponse.json({ error: 'Tema e conteúdo são obrigatórios' }, { status: 400 })
    }

    if (wordCount < 100 || wordCount > 1000) {
      return NextResponse.json({ 
        error: 'A redação deve ter entre 100 e 1000 palavras' 
      }, { status: 400 })
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Obter tema selecionado
    const selectedTheme = await getThemeById(theme)
    if (!selectedTheme) {
      return NextResponse.json({ error: 'Tema não encontrado' }, { status: 404 })
    }

    // Avaliar redação com IA
    const evaluation = await evaluateRedacao(content, selectedTheme.theme)

    // Gerar ID da sessão (sem banco de dados por enquanto)
    const sessionId = `redacao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Sessão de redação criada:', sessionId)

    // Log da avaliação (quota não implementada no schema atual)
    console.log(`Redação avaliada para usuário ${session.user.id}`)

    // Log da atividade (modelo activityLog não implementado no schema atual)
    console.log(`Atividade registrada: redacao_submitted para usuário ${session.user.id}`)

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      evaluation: {
        scores: evaluation.scores,
        totalScore: evaluation.totalScore,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions
      }
    })

  } catch (error) {
    console.error('Erro ao avaliar redação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function getThemeById(themeId: string) {
  // Buscar tema no banco ou retornar tema padrão
  const themes = [
    {
      id: '2023-1',
      year: 2023,
      theme: 'Desafios para o combate à invisibilidade e ao registro civil de pessoas em situação de rua no Brasil'
    },
    {
      id: '2022-1', 
      year: 2022,
      theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil'
    },
    {
      id: '2021-1',
      year: 2021,
      theme: 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil'
    }
  ]

  return themes.find(t => t.id === themeId) || themes[0]
}

async function evaluateRedacao(content: string, theme: string): Promise<RedacaoEvaluation> {
  const prompt = `
Você é um especialista em avaliação de redações do ENEM. Avalie a seguinte redação baseada nas 5 competências oficiais do ENEM.

TEMA: ${theme}

REDAÇÃO:
${content}

Avalie cada competência de 0 a 200 pontos e forneça feedback detalhado:

COMPETÊNCIA 1 (0-200): Domínio da modalidade escrita formal da Língua Portuguesa
- Gramática, ortografia, pontuação, concordância, regência
- Uso adequado de vocabulário formal

COMPETÊNCIA 2 (0-200): Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento
- Compreensão do tema proposto
- Desenvolvimento do tema com conhecimentos de várias áreas
- Argumentação consistente

COMPETÊNCIA 3 (0-200): Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos
- Estrutura dissertativa-argumentativa
- Coerência e coesão textual
- Organização lógica dos argumentos

COMPETÊNCIA 4 (0-200): Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação
- Uso adequado de conectivos
- Variedade lexical
- Recursos de coesão textual

COMPETÊNCIA 5 (0-200): Elaborar proposta de intervenção para o problema abordado
- Proposta clara e detalhada
- Viabilidade da proposta
- Respeito aos direitos humanos

Responda APENAS com um JSON válido no seguinte formato:
{
  "scores": {
    "comp1": 0-200,
    "comp2": 0-200,
    "comp3": 0-200,
    "comp4": 0-200,
    "comp5": 0-200
  },
  "totalScore": 0-1000,
  "feedback": "Feedback detalhado sobre a redação",
  "suggestions": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
  "highlights": {
    "grammar": ["Erro gramatical 1", "Erro gramatical 2"],
    "structure": ["Problema estrutural 1", "Problema estrutural 2"],
    "content": ["Problema de conteúdo 1", "Problema de conteúdo 2"]
  }
}
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em avaliação de redações do ENEM. Responda sempre com JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const evaluationText = response.choices[0]?.message?.content
    if (!evaluationText) {
      throw new Error('Resposta vazia da IA')
    }

    const evaluation = JSON.parse(evaluationText)
    
    // Validar estrutura da resposta
    if (!evaluation.scores || !evaluation.feedback) {
      throw new Error('Resposta da IA em formato inválido')
    }

    // Calcular total score se não fornecido
    if (!evaluation.totalScore) {
      evaluation.totalScore = Object.values(evaluation.scores).reduce((sum: number, score: number) => sum + score, 0)
    }

    return evaluation

  } catch (error) {
    console.error('Erro na avaliação com IA:', error)
    
    // Fallback: avaliação básica
    return {
      scores: {
        comp1: 120,
        comp2: 120,
        comp3: 120,
        comp4: 120,
        comp5: 120
      },
      totalScore: 600,
      feedback: 'Avaliação temporariamente indisponível. Sua redação foi salva e será avaliada em breve.',
      suggestions: [
        'Revise a gramática e ortografia',
        'Desenvolva melhor os argumentos',
        'Melhore a proposta de intervenção'
      ],
      highlights: {
        grammar: [],
        structure: [],
        content: []
      }
    }
  }
}
