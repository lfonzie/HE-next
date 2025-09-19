import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function GET(request: NextRequest) {
  try {
    console.log('API /api/redacao/temas/random chamada - buscando 5 temas aleatórios de IA')
    
    // Buscar todos os temas de IA salvos no banco de dados
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

    console.log(`Encontrados ${savedThemes.length} temas de IA salvos no banco`)

    // Converter para formato EnemTheme e filtrar apenas os válidos
    const aiThemes: EnemTheme[] = savedThemes.map(conversation => {
      try {
        const messages = JSON.parse(conversation.messages)
        const themeData = JSON.parse(messages[0]?.content || '{}')
        
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

    // Se não há temas suficientes, retornar todos os disponíveis
    if (aiThemes.length <= 5) {
      console.log(`Retornando todos os ${aiThemes.length} temas disponíveis`)
      return NextResponse.json({
        success: true,
        themes: aiThemes,
        count: aiThemes.length
      })
    }

    // Selecionar 5 temas aleatórios
    const shuffled = aiThemes.sort(() => 0.5 - Math.random())
    const randomThemes = shuffled.slice(0, 5)

    console.log(`Retornando 5 temas aleatórios de ${aiThemes.length} disponíveis`)

    return NextResponse.json({
      success: true,
      themes: randomThemes,
      count: randomThemes.length
    })

  } catch (error) {
    console.error('Erro ao buscar temas aleatórios:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        themes: [],
        count: 0
      },
      { status: 500 }
    )
  }
}
