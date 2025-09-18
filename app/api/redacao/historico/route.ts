import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar histórico de redações do usuário
    const history = await prisma.redacaoSession.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        theme: true,
        themeYear: true,
        wordCount: true,
        totalScore: true,
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      history: history.map(item => ({
        id: item.id,
        theme: item.theme,
        themeYear: item.themeYear,
        wordCount: item.wordCount,
        totalScore: item.totalScore,
        createdAt: item.createdAt.toISOString(),
        status: item.status
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
