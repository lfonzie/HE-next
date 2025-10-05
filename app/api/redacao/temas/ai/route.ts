import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { prisma } from '@/lib/prisma'
import { callGrok } from '@/lib/providers/grok'



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

// Usando Grok 4 Fast Reasoning para geração de temas

// Função para limpar resposta da IA removendo markdown code blocks
function cleanAIResponse(response: string): string {
  // Remove markdown code blocks se existirem
  let cleaned = response
    .replace(/^```json\s*/i, '')  // Remove início do bloco
    .replace(/^```\s*/i, '')      // Remove início do bloco sem especificar linguagem
    .replace(/\s*```$/i, '')       // Remove fim do bloco
    .trim()
  
  // Primeiro, tentar encontrar um objeto JSON
  const firstBrace = cleaned.indexOf('{')
  const firstBracket = cleaned.indexOf('[')
  
  // Se encontrar um objeto antes de um array, usar o objeto
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace)
    }
    const lastBrace = cleaned.lastIndexOf('}')
    if (lastBrace > 0 && lastBrace < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBrace + 1)
    }
  } else if (firstBracket !== -1) {
    // Se encontrar um array, extrair o primeiro objeto
    if (firstBracket > 0) {
      cleaned = cleaned.substring(firstBracket)
    }
    const lastBracket = cleaned.lastIndexOf(']')
    if (lastBracket > 0 && lastBracket < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBracket + 1)
    }
  }
  
  return cleaned.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { count = 3 } = body // Sempre retornar 3 temas aleatórios

    console.log('Buscando temas aleatórios do banco de dados...')

    // Buscar todos os temas salvos no banco de dados
    const savedThemes = await prisma.conversations.findMany({
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

    console.log(`Encontrados ${savedThemes.length} temas salvos no banco`)

    // Se não há temas salvos, gerar novos temas com IA
    if (savedThemes.length === 0) {
      console.log('Nenhum tema salvo encontrado. Gerando novos temas com Grok 4 Fast Reasoning...')
      
      const prompt = `Gere 3 temas de redação para o ENEM seguindo os padrões oficiais. Cada tema deve ser atual, relevante e adequado para uma dissertação-argumentativa.

Responda APENAS com um JSON válido no formato:
{
  "themes": [
    {
      "themeId": "ai-${Date.now()}-1",
      "year": 2025,
      "theme": "Tema da redação aqui",
      "description": "Descrição detalhada do tema e contexto",
      "isAIGenerated": true,
      "createdAt": "${new Date().toISOString()}"
    },
    {
      "themeId": "ai-${Date.now()}-2", 
      "year": 2025,
      "theme": "Segundo tema aqui",
      "description": "Descrição do segundo tema",
      "isAIGenerated": true,
      "createdAt": "${new Date().toISOString()}"
    },
    {
      "themeId": "ai-${Date.now()}-3",
      "year": 2025, 
      "theme": "Terceiro tema aqui",
      "description": "Descrição do terceiro tema",
      "isAIGenerated": true,
      "createdAt": "${new Date().toISOString()}"
    }
  ]
}

IMPORTANTE: Responda APENAS com JSON válido, sem formatação markdown ou texto adicional.`

      const systemPrompt = `Você é um especialista em temas de redação do ENEM. Gere temas atuais, relevantes e adequados para dissertação-argumentativa.`

      const result = await callGrok(
        'grok-4-fast-reasoning',
        [],
        prompt,
        systemPrompt
      )

      const response = result.text
      if (!response) {
        throw new Error('Resposta vazia do Grok')
      }

      const cleanedResponse = cleanAIResponse(response)
      const themeData = JSON.parse(cleanedResponse)
      
      if (!themeData.themes || !Array.isArray(themeData.themes)) {
        throw new Error('Formato de resposta inválido da IA')
      }

      // Salvar os novos temas no banco de dados
      const savedThemes = []
      for (const theme of themeData.themes) {
        try {
          const savedTheme = await prisma.conversations.create({
            data: {
              user_id: '00000000-0000-0000-0000-000000000000',
              module: 'redacao',
              subject: `Tema: ${theme.theme}`,
              grade: 'ENEM',
              messages: JSON.stringify([{
                role: 'system',
                content: JSON.stringify({
                  type: 'redacao_theme',
                  themeId: theme.themeId,
                  year: theme.year,
                  theme: theme.theme,
                  description: theme.description,
                  isAIGenerated: theme.isAIGenerated,
                  createdAt: theme.createdAt
                })
              }]),
              token_count: 0,
              model: 'redacao-theme-generator',
              created_at: new Date(),
              updated_at: new Date()
            }
          })
          savedThemes.push(savedTheme)
          console.log(`Tema salvo: ${theme.theme}`)
        } catch (error) {
          console.warn('Erro ao salvar tema:', error)
        }
      }

      console.log(`${savedThemes.length} novos temas gerados e salvos`)

      return NextResponse.json({
        success: true,
        themes: themeData.themes,
        totalAvailable: themeData.themes.length,
        selectedAt: new Date().toISOString(),
        message: 'Novos temas gerados com Grok 4 Fast Reasoning'
      })
    }

    // Converter para formato EnemTheme e filtrar válidos
    const allThemes = savedThemes.map(conversation => {
      try {
        const messages = JSON.parse(conversation.messages as string)
        const themeData = JSON.parse((messages[0]?.content as string) || '{}')
        
        return {
          id: themeData.themeId || conversation.id,
          year: themeData.year || 2025,
          theme: themeData.theme || conversation.subject?.replace('Tema: ', '') || 'Tema gerado por IA',
          description: themeData.description || 'Tema gerado por IA',
          isAIGenerated: themeData.isAIGenerated || true,
          createdAt: themeData.createdAt || conversation.created_at.toISOString()
        }
      } catch (error) {
        console.warn('Erro ao processar tema salvo:', error)
        return null
      }
    }).filter(Boolean)

    console.log(`${allThemes.length} temas válidos encontrados`)

    if (allThemes.length === 0) {
      return NextResponse.json(
        { 
          error: 'Nenhum tema válido encontrado',
          message: 'Todos os temas salvos estão corrompidos'
        },
        { status: 404 }
      )
    }

    // Selecionar 3 temas aleatórios
    const randomThemes = []
    const availableThemes = [...allThemes] // Copiar array para não modificar o original
    
    for (let i = 0; i < Math.min(3, availableThemes.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableThemes.length)
      randomThemes.push(availableThemes[randomIndex])
      availableThemes.splice(randomIndex, 1) // Remover para evitar duplicatas
    }

    console.log('Temas aleatórios selecionados:', randomThemes.map(t => t.theme))

    const responseData = {
      success: true,
      themes: randomThemes,
      totalAvailable: allThemes.length,
      selectedAt: new Date().toISOString()
    }

    console.log('Dados da resposta:', responseData)

    return NextResponse.json(responseData)

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
        error: 'Erro ao gerar temas com Grok 4 Fast Reasoning',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
