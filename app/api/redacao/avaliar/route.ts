import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth'


import { authOptions } from '@/lib/auth'


import { prisma } from '@/lib/prisma'


import { OpenAI } from 'openai'


import { logTokens } from '@/lib/token-logger'
import { saveRedacaoToNeo4j, saveRedacaoEvaluationToNeo4j } from '@/lib/neo4j'

// Cache simples em memória para avaliações similares
const evaluationCache = new Map<string, { evaluation: RedacaoEvaluation, timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutos



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Função para gerar chave de cache baseada no conteúdo e tema
function generateCacheKey(content: string, theme: string): string {
  // Normalizar conteúdo: remover espaços extras, converter para minúsculas
  const normalizedContent = content.toLowerCase().replace(/\s+/g, ' ').trim()
  const normalizedTheme = theme.toLowerCase().replace(/\s+/g, ' ').trim()
  
  // Criar hash simples baseado no conteúdo e tema
  const contentHash = normalizedContent.slice(0, 200) // Primeiros 200 caracteres
  const themeHash = normalizedTheme.slice(0, 100) // Primeiros 100 caracteres
  
  return `${themeHash}_${contentHash}`.replace(/[^a-z0-9_]/g, '')
}

// Função para verificar cache
function getCachedEvaluation(content: string, theme: string): { evaluation: RedacaoEvaluation, cacheHit: boolean } | null {
  const cacheKey = generateCacheKey(content, theme)
  const cached = evaluationCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('🎯 [CACHE] Avaliação encontrada no cache para tema similar')
    return { evaluation: cached.evaluation, cacheHit: true }
  }
  
  // Limpar cache expirado
  if (cached) {
    evaluationCache.delete(cacheKey)
  }
  
  return null
}

// Função para salvar no cache
function setCachedEvaluation(content: string, theme: string, evaluation: RedacaoEvaluation): void {
  const cacheKey = generateCacheKey(content, theme)
  evaluationCache.set(cacheKey, {
    evaluation,
    timestamp: Date.now()
  })
  
  // Limitar tamanho do cache (manter apenas 100 entradas)
  if (evaluationCache.size > 100) {
    const firstKey = evaluationCache.keys().next().value
    evaluationCache.delete(firstKey)
  }
}

interface RedacaoSubmission {
  theme: string
  themeText?: string // Texto completo do tema para temas de IA
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
    const { theme, themeText, content, wordCount, uploadedFileName, uploadedFileSize } = body

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
    let finalThemeText = themeText
    if (!finalThemeText) {
      const selectedTheme = await getThemeById(theme)
      if (!selectedTheme) {
        return NextResponse.json({ error: 'Tema não encontrado' }, { status: 404 })
      }
      finalThemeText = selectedTheme.theme
    }

    // Avaliar redação com IA
    const evaluationStartTime = Date.now()
    const evaluationResult = await evaluateRedacao(content, finalThemeText)
    const evaluationEndTime = Date.now()
    const totalEvaluationTime = evaluationEndTime - evaluationStartTime
    
    const { evaluation, cacheHit } = evaluationResult

    // Gerar ID da sessão e salvar no banco de dados
    const sessionId = crypto.randomUUID()

    // Salvar resultado no banco de dados
    const selectedTheme = await getThemeById(theme)
    
    // Criar sessão de redação
    await prisma.essay_sessions.create({
      data: {
        id: sessionId,
        user_id: session.user.id,
        topic_prompt: finalThemeText,
        area: 'Linguagens',
        status: 'completed'
      }
    })

    // Salvar pontuação geral
    await prisma.essay_overall_scores.create({
      data: {
        session_id: sessionId,
        total: evaluation.totalScore,
        comp1: evaluation.scores.comp1,
        comp2: evaluation.scores.comp2,
        comp3: evaluation.scores.comp3,
        comp4: evaluation.scores.comp4,
        comp5: evaluation.scores.comp5,
        issues: {
          feedback: evaluation.feedback,
          suggestions: evaluation.suggestions,
          highlights: evaluation.highlights || {},
          wordCount: wordCount,
          themeYear: selectedTheme?.year || 2024
        }
      }
    })

    // Salvar conteúdo da redação como parágrafo único
    await prisma.essay_paragraphs.create({
      data: {
        session_id: sessionId,
        idx: 0,
        content: content
      }
    })

    // Persistir uso de tokens (aproximação baseada no tamanho do conteúdo)
    try {
      const estimatedTokens = Math.ceil((content?.length || 0) / 4)
      await logTokens({
        userId: session.user.id,
        moduleGroup: 'Redacao',
        model: 'grok-4-fast-reasoning',
        totalTokens: estimatedTokens,
        subject: finalThemeText,
        messages: { wordCount, uploadedFileName, uploadedFileSize }
      })
    } catch (e) {
      console.warn('⚠️ [REDACAO] Failed to log tokens:', e)
    }

    // Salvar no Neo4j se configurado
    if (process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD) {
      try {
        console.log('💾 [NEO4J] Salvando redação e avaliação no Neo4j...')
        
        // Preparar dados da redação para Neo4j
        const redacaoData = {
          id: sessionId,
          title: `Redação sobre ${finalThemeText}`,
          theme: finalThemeText,
          themeYear: selectedTheme?.year || new Date().getFullYear(),
          content: content,
          wordCount: wordCount
        }
        
        // Salvar redação no Neo4j
        const neo4jRedacaoId = await saveRedacaoToNeo4j(redacaoData, session.user.id)
        console.log('✅ [NEO4J] Redação salva com ID:', neo4jRedacaoId)
        
        // Preparar dados da avaliação para Neo4j
        const evaluationData = {
          id: `eval_${sessionId}`,
          totalScore: evaluation.totalScore,
          scores: evaluation.scores,
          feedback: evaluation.feedback,
          suggestions: evaluation.suggestions,
          highlights: evaluation.highlights
        }
        
        // Salvar avaliação no Neo4j
        const neo4jEvaluationId = await saveRedacaoEvaluationToNeo4j(evaluationData, sessionId, session.user.id)
        console.log('✅ [NEO4J] Avaliação salva com ID:', neo4jEvaluationId)
        
      } catch (neo4jError) {
        console.warn('⚠️ [NEO4J] Erro ao salvar no Neo4j (continuando):', neo4jError)
        // Não falhar a operação se o Neo4j não estiver disponível
      }
    } else {
      console.log('ℹ️ [NEO4J] Neo4j não configurado, pulando salvamento')
    }

    // Log da atividade (modelo activityLog não implementado no schema atual)

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      evaluation: {
        scores: evaluation.scores,
        totalScore: evaluation.totalScore,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions
      },
      performance: {
        evaluationTimeMs: totalEvaluationTime,
        wordCount: wordCount,
        characterCount: content.length,
        cacheHit: cacheHit
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
  // Se for um tema de IA, buscar no banco de dados
  if (themeId.startsWith('ai-')) {
    try {
      const savedTheme = await prisma.conversations.findFirst({
        where: {
          user_id: '00000000-0000-0000-0000-000000000000',
          module: 'redacao',
          subject: {
            startsWith: 'Tema:'
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      })

      if (savedTheme) {
        try {
          const messages = savedTheme.messages as any[]
          const themeData = JSON.parse((messages[0]?.content as string) || '{}')
          
          // Verificar se é o tema correto pelo ID
          if (themeData.themeId === themeId) {
            return {
              id: themeData.themeId,
              year: themeData.year || 2025,
              theme: themeData.theme || 'Tema gerado por IA'
            }
          }
        } catch (error) {
          console.warn('Erro ao processar tema de IA:', error)
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar tema de IA no banco:', error)
    }
    
    // Fallback se não encontrar
    return {
      id: themeId,
      year: 2025,
      theme: `Tema gerado por IA (${themeId})`
    }
  }

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

async function evaluateRedacao(content: string, theme: string): Promise<{ evaluation: RedacaoEvaluation, cacheHit: boolean }> {
  // Verificar cache primeiro
  const cachedResult = getCachedEvaluation(content, theme)
  if (cachedResult) {
    return cachedResult
  }

  const startTime = Date.now()
  console.log('🚀 [GROK] Iniciando avaliação de redação...')
  
  const prompt = `
Você é um corretor especialista do ENEM com anos de experiência. Sua tarefa é avaliar esta redação seguindo RIGOROSAMENTE os critérios oficiais do ENEM, fornecendo feedback PERSONALIZADO baseado no conteúdo específico da redação.

TEMA: ${theme}

REDAÇÃO PARA AVALIAÇÃO:
${content}

## INSTRUÇÕES CRÍTICAS:
1. Analise CADA palavra, frase e parágrafo da redação
2. Identifique erros específicos e problemas concretos
3. Forneça feedback detalhado e personalizado
4. NÃO use feedback genérico ou padrão
5. Baseie suas observações no conteúdo REAL da redação

## CRITÉRIOS DE AVALIAÇÃO DO ENEM:

### COMPETÊNCIA 1 (0-200): Domínio da Modalidade Escrita Formal da Língua Portuguesa
**Aspectos avaliados:**
- Ortografia e acentuação (erros sistemáticos reduzem nota)
- Concordância nominal e verbal (consistência entre sujeito, verbo e complementos)
- Regência nominal e verbal (uso apropriado de preposições e complementos)
- Pontuação (emprego correto de vírgulas, pontos, dois-pontos)
- Vocabulário formal adequado

**Níveis de desempenho:**
- 0-40: Ausência total de domínio, muitos erros graves
- 41-80: Domínio insuficiente, erros frequentes
- 81-120: Domínio mediano, alguns erros
- 121-160: Bom domínio, poucos desvios
- 161-200: Domínio excelente, sem erros ou desvios isolados

### COMPETÊNCIA 2 (0-200): Compreender a Proposta e Aplicar Conceitos das Várias Áreas
**Aspectos avaliados:**
- Compreensão do tema proposto (adesão direta, sem tangenciar)
- Estrutura dissertativa-argumentativa (introdução, desenvolvimento, conclusão)
- Integração de conhecimentos interdisciplinares (história, sociologia, filosofia, ciências)
- Desenvolvimento amplo e integrado do tema

**Níveis de desempenho:**
- 0-40: Fuga total ao tema ou não atendimento ao gênero
- 41-80: Tangenciamento ou desenvolvimento superficial
- 81-120: Desenvolvimento adequado do tema
- 121-160: Bom desenvolvimento com conhecimentos interdisciplinares
- 161-200: Desenvolvimento amplo e integrado, estrutura impecável

### COMPETÊNCIA 3 (0-200): Selecionar, Relacionar, Organizar e Interpretar Informações
**Aspectos avaliados:**
- Seleção de argumentos relevantes e diversos
- Organização lógica com progressão do raciocínio
- Interpretação crítica das informações
- Relação entre fatos, dados, opiniões e exemplos
- Defesa consistente de uma tese clara

**Níveis de desempenho:**
- 0-40: Ausência de argumentos ou organização
- 41-80: Argumentos fracos ou mal organizados
- 81-120: Argumentação adequada
- 121-160: Boa argumentação com interpretação crítica
- 161-200: Argumentação sofisticada, repertório amplo, interpretação profunda

### COMPETÊNCIA 4 (0-200): Demonstrar Conhecimento dos Mecanismos Linguísticos
**Aspectos avaliados:**
- Coesão referencial (pronomes, sinônimos, elipses)
- Coesão sequencial (conectores: "portanto", "entretanto", "além disso")
- Coerência global (consistência temática, ausência de contradições)
- Variedade lexical e sintática
- Mecanismos linguísticos avançados

**Níveis de desempenho:**
- 0-40: Falta de conexão entre ideias
- 41-80: Conexões inadequadas ou repetitivas
- 81-120: Coesão e coerência adequadas
- 121-160: Boa articulação textual
- 161-200: Construção argumentativa coesa e coerente, mecanismos avançados

### COMPETÊNCIA 5 (0-200): Elaborar Proposta de Intervenção
**Aspectos avaliados:**
- Detalhamento da proposta (ações, agentes, meios, efeitos)
- Viabilidade e originalidade da proposta
- Respeito aos direitos humanos
- Articulação lógica com a argumentação anterior
- Proposta específica e não genérica

**Níveis de desempenho:**
- 0-40: Ausência de proposta ou violação de direitos humanos
- 41-80: Proposta vaga ou inviável
- 81-120: Proposta adequada mas genérica
- 121-160: Boa proposta com detalhamento
- 161-200: Proposta detalhada, articulada e alinhada a valores éticos

## FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "scores": {
    "comp1": 0-200,
    "comp2": 0-200,
    "comp3": 0-200,
    "comp4": 0-200,
    "comp5": 0-200
  },
  "totalScore": 0-1000,
  "feedback": "Feedback detalhado e PERSONALIZADO baseado no conteúdo específico desta redação. Mencione problemas concretos encontrados, pontos fortes específicos e análise detalhada do desenvolvimento do tema.\n\nIMPORTANTE: Use quebras de linha (\\n) para separar parágrafos e melhorar a legibilidade do feedback.",
  "suggestions": [
    "Sugestão específica baseada em problemas reais encontrados na redação",
    "Segunda sugestão concreta e personalizada",
    "Terceira sugestão direcionada ao conteúdo específico"
  ],
  "highlights": {
    "grammar": ["Erro gramatical específico encontrado na redação", "Segundo erro gramatical específico"],
    "structure": ["Problema estrutural específico identificado", "Segundo problema estrutural específico"],
    "content": ["Problema de conteúdo específico encontrado", "Segundo problema de conteúdo específico"]
  }
}

IMPORTANTE: 
1. Analise esta redação específica e forneça feedback único e personalizado. NÃO use feedback genérico.
2. FORMATO DO FEEDBACK: Use quebras de linha (\\n) para separar parágrafos e melhorar a legibilidade:
   - Primeiro parágrafo: Análise geral da redação
   - Segundo parágrafo: Pontos fortes específicos encontrados
   - Terceiro parágrafo: Problemas e pontos de melhoria identificados
   - Quarto parágrafo: Avaliação da proposta de intervenção (se aplicável)
3. Seja específico: mencione linhas, parágrafos ou trechos específicos da redação.
4. Use linguagem clara e didática para o estudante.
`

  try {
    // Usar Grok Fast 4 para avaliação mais precisa e rápida
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-fast-reasoning',
        messages: [
          {
            role: 'system',
            content: 'Você é um corretor especialista do ENEM com anos de experiência. Sempre forneça feedback personalizado e detalhado baseado no conteúdo específico da redação. Responda sempre com JSON válido conforme solicitado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Baixa temperatura para maior consistência
        max_tokens: 3000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro na API do Grok:', errorText)
      throw new Error(`Grok API error: ${response.status} - ${errorText}`)
    }

    const grokData = await response.json()
    const evaluationText = grokData.choices[0]?.message?.content

    if (!evaluationText) {
      throw new Error('Resposta vazia do Grok')
    }

    console.log('🤖 [GROK] Avaliação recebida:', evaluationText.length, 'caracteres')

    // Extrair JSON da resposta
    let evaluation
    try {
      // Tentar encontrar JSON na resposta
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON não encontrado na resposta do Grok')
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta do Grok:', parseError)
      throw new Error('Falha ao processar resposta do Grok')
    }
    
    // Validar estrutura da resposta
    if (!evaluation.scores || !evaluation.feedback) {
      throw new Error('Resposta do Grok em formato inválido')
    }

    // Calcular total score se não fornecido
    if (!evaluation.totalScore) {
      evaluation.totalScore = Object.values(evaluation.scores).reduce((sum: number, score: number) => sum + score, 0)
    }

    // Garantir que highlights exista
    if (!evaluation.highlights) {
      evaluation.highlights = {
        grammar: [],
        structure: [],
        content: []
      }
    }

    const endTime = Date.now()
    const processingTime = endTime - startTime
    
    console.log('✅ [GROK] Avaliação processada com sucesso. Nota total:', evaluation.totalScore)
    console.log('⏱️ [PERFORMANCE] Tempo de processamento:', processingTime, 'ms')
    
    // Salvar no cache para futuras avaliações similares
    setCachedEvaluation(content, theme, evaluation)
    
    return { evaluation, cacheHit: false }

  } catch (error) {
    console.error('❌ Erro na avaliação com Grok:', error)
    
    // Tentar novamente com GROK se for erro de rede
    if (error instanceof Error && error.message.includes('fetch')) {
      console.log('🔄 Tentando novamente com GROK (erro de rede)...')
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Aguardar 2 segundos
        
        const retryResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-4-fast-reasoning',
            messages: [
              {
                role: 'system',
                content: 'Você é um corretor especialista do ENEM com anos de experiência. Sempre forneça feedback personalizado e detalhado baseado no conteúdo específico da redação. Responda sempre com JSON válido conforme solicitado.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1,
            max_tokens: 3000
          })
        })

        if (retryResponse.ok) {
          const retryData = await retryResponse.json()
          const retryEvaluationText = retryData.choices[0]?.message?.content
          
          if (retryEvaluationText) {
            const jsonMatch = retryEvaluationText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const evaluation = JSON.parse(jsonMatch[0])
              if (evaluation.scores && evaluation.feedback) {
                if (!evaluation.totalScore) {
                  evaluation.totalScore = Object.values(evaluation.scores).reduce((sum: number, score: number) => sum + score, 0)
                }
                if (!evaluation.highlights) {
                  evaluation.highlights = { grammar: [], structure: [], content: [] }
                }
                
                console.log('✅ [GROK RETRY] Avaliação processada com sucesso na segunda tentativa')
                setCachedEvaluation(content, theme, evaluation)
                return { evaluation, cacheHit: false }
              }
            }
          }
        }
      } catch (retryError) {
        console.error('❌ Erro na segunda tentativa com GROK:', retryError)
      }
    }
    
    // Fallback para OpenAI em caso de erro
    console.log('🔄 Tentando fallback para OpenAI...')
    try {
      const fallbackResponse = await openai.chat.completions.create({
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

      const evaluationText = fallbackResponse.choices[0]?.message?.content
    if (!evaluationText) {
      throw new Error('Resposta vazia da IA')
    }

    const evaluation = JSON.parse(evaluationText)
    
    if (!evaluation.scores || !evaluation.feedback) {
      throw new Error('Resposta da IA em formato inválido')
    }

    if (!evaluation.totalScore) {
      evaluation.totalScore = Object.values(evaluation.scores).reduce((sum: number, score: number) => sum + score, 0)
    }

    return { evaluation, cacheHit: false }
    } catch (fallbackError) {
      console.error('❌ Erro no fallback OpenAI:', fallbackError)
      throw error // Re-throw o erro original do Grok
    }
  }
}
