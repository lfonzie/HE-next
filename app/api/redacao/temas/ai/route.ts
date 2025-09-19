import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
  isOfficial?: boolean
  isAIGenerated?: boolean
  isSessionGenerated?: boolean
  createdAt?: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Função para limpar resposta da IA removendo markdown code blocks
function cleanAIResponse(response: string): string {
  // Remove markdown code blocks se existirem
  let cleaned = response
    .replace(/^```json\s*/i, '')  // Remove início do bloco
    .replace(/^```\s*/i, '')      // Remove início do bloco sem especificar linguagem
    .replace(/\s*```$/i, '')       // Remove fim do bloco
    .trim()
  
  // Remove texto antes do primeiro [ se existir
  const firstBracket = cleaned.indexOf('[')
  if (firstBracket > 0) {
    cleaned = cleaned.substring(firstBracket)
  }
  
  // Remove texto após o último ] se existir
  const lastBracket = cleaned.lastIndexOf(']')
  if (lastBracket > 0 && lastBracket < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastBracket + 1)
  }
  
  return cleaned.trim()
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API key da OpenAI não configurada' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { count = 3, category } = body

    // Gerar elementos aleatórios para diversificar os temas
    const randomElements = [
      ['sustentabilidade', 'tecnologia', 'educação', 'saúde', 'cultura', 'economia', 'política', 'meio ambiente'],
      ['jovens', 'idosos', 'mulheres', 'crianças', 'trabalhadores', 'estudantes', 'famílias', 'comunidades'],
      ['digitais', 'urbanas', 'rurais', 'sociais', 'econômicas', 'ambientais', 'culturais', 'políticas'],
      ['contemporâneas', 'modernas', 'emergentes', 'críticas', 'urgentes', 'complexas', 'desafiadoras', 'transformadoras']
    ]

    const randomTopic = randomElements[0][Math.floor(Math.random() * randomElements[0].length)]
    const randomGroup = randomElements[1][Math.floor(Math.random() * randomElements[1].length)]
    const randomContext = randomElements[2][Math.floor(Math.random() * randomElements[2].length)]
    const randomAdjective = randomElements[3][Math.floor(Math.random() * randomElements[3].length)]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em temas de redação do ENEM. Gere ${count} temas de redação ÚNICOS e DIVERSOS para o Brasil contemporâneo.

IMPORTANTE: Cada chamada deve gerar temas COMPLETAMENTE DIFERENTES dos anteriores. Use criatividade e varie:
- Áreas: educação, saúde, tecnologia, meio ambiente, cultura, economia, política, sociedade
- Grupos: jovens, idosos, mulheres, crianças, trabalhadores, estudantes, famílias, comunidades
- Contextos: urbanos, rurais, digitais, sociais, econômicos, ambientais, culturais
- Perspectivas: desafios, oportunidades, impactos, transformações, inclusão, exclusão

Cada tema deve:
- Ser relevante para o Brasil atual (2024-2025)
- Permitir argumentação e proposta de intervenção
- Ser adequado para estudantes do ensino médio
- Ter formato variado: "Desafios para...", "Impactos da...", "A importância de...", etc.
- ${category ? `Focar na categoria: ${category}` : 'Abordar diferentes áreas sociais'}

Elementos inspiradores desta geração: ${randomTopic}, ${randomGroup}, ${randomContext}, ${randomAdjective}

Responda apenas com um JSON array contendo objetos com as propriedades: theme, description.`
        },
        {
          role: "user",
          content: `Gere ${count} temas de redação ÚNICOS e DIVERSOS para o ENEM. Use os elementos inspiradores: ${randomTopic}, ${randomGroup}, ${randomContext}, ${randomAdjective}.${category ? ` Foque na categoria: ${category}.` : ''} Seja criativo e varie os formatos dos temas!`
        }
      ],
      temperature: 1.2, // Aumentei a temperatura para mais criatividade
      max_tokens: 1500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Resposta vazia da IA')
    }

    console.log('Resposta bruta da IA:', response)

    const cleanedResponse = cleanAIResponse(response)
    console.log('Resposta limpa da IA:', cleanedResponse)

    let aiThemes
    try {
      aiThemes = JSON.parse(cleanedResponse)
      console.log('JSON parseado com sucesso:', aiThemes)
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      console.error('Conteúdo que falhou no parse:', cleanedResponse)
      
      // Tentar extrair JSON de forma mais robusta
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          aiThemes = JSON.parse(jsonMatch[0])
          console.log('JSON extraído com regex:', aiThemes)
        } catch (regexError) {
          console.error('Erro ao fazer parse com regex:', regexError)
          throw new Error(`Erro ao fazer parse do JSON da IA: ${parseError.message}`)
        }
      } else {
        throw new Error(`Erro ao fazer parse do JSON da IA: ${parseError.message}`)
      }
    }

    // Validar se é um array
    if (!Array.isArray(aiThemes)) {
      console.error('Resposta da IA não é um array:', aiThemes)
      throw new Error('Resposta da IA não é um array válido')
    }

    // Validar e formatar os temas gerados
    const formattedThemes: EnemTheme[] = aiThemes.map((theme: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      year: 2025,
      theme: theme.theme || theme.title || 'Tema gerado por IA',
      description: theme.description || 'Tema gerado por IA para prática',
      isAIGenerated: true
    }))

    // Salvar temas no banco de dados usando uma tabela simples
    try {
      // Usar a tabela de conversas para armazenar temporariamente os temas
      // Em uma implementação completa, seria uma tabela específica
      for (const theme of formattedThemes) {
        await prisma.conversations.create({
          data: {
            // Não definir id, deixar o Prisma gerar um UUID
            user_id: '00000000-0000-0000-0000-000000000000', // UUID especial para temas do sistema
            module: 'redacao',
            subject: `Tema: ${theme.theme}`,
            grade: 'ENEM',
            messages: JSON.stringify([{
              role: 'system',
              content: JSON.stringify({
                type: 'redacao_theme',
                themeId: theme.id, // Manter o ID original do tema no conteúdo
                year: theme.year,
                theme: theme.theme,
                description: theme.description,
                isAIGenerated: theme.isAIGenerated,
                createdAt: new Date().toISOString()
              })
            }]),
            token_count: 0,
            model: 'redacao-theme-generator',
            created_at: new Date(),
            updated_at: new Date()
          }
        }).catch((error) => {
          console.warn('Erro ao salvar tema individual:', theme.id, error.message)
        })
      }
    } catch (error) {
      console.warn('Erro ao salvar temas no banco:', error)
    }

    console.log('Temas formatados:', formattedThemes)

    const responseData = {
      success: true,
      themes: formattedThemes,
      generatedAt: new Date().toISOString()
    }

    console.log('Dados da resposta:', responseData)

    try {
      const response = NextResponse.json(responseData)
      console.log('Resposta NextResponse criada com sucesso')
      return response
    } catch (responseError) {
      console.error('Erro ao criar NextResponse:', responseError)
      throw responseError
    }

  } catch (error) {
    console.error('=== ERRO CAPTURADO NO CATCH ===')
    console.error('Tipo do erro:', typeof error)
    console.error('Erro:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A')
    console.error('Mensagem:', error instanceof Error ? error.message : 'N/A')
    console.error('================================')
    
    // Retornar erro se IA falhar - sem fallback
    return NextResponse.json(
      { 
        error: 'Erro ao gerar temas com IA',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
