import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Buscar temas salvos na tabela de conversas
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
      },
      take: 50 // Limitar a 50 temas mais recentes
    })

    // Converter para formato EnemTheme
    const themes = savedThemes.map(conversation => {
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

    return NextResponse.json({
      success: true,
      themes,
      count: themes.length
    })

  } catch (error) {
    console.error('Erro ao buscar temas salvos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const themeId = searchParams.get('themeId')

    if (!themeId) {
      return NextResponse.json(
        { error: 'ID do tema é obrigatório' },
        { status: 400 }
      )
    }

    // Deletar tema salvo
    await prisma.conversations.deleteMany({
      where: {
        id: themeId,
        user_id: '00000000-0000-0000-0000-000000000000'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tema removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar tema:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
