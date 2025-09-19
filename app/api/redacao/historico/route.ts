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
    const sessions = await prisma.essay_sessions.findMany({
      where: {
        user_id: session.user.id
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Buscar pontuações para cada sessão
    const history = await Promise.all(
      sessions.map(async (session) => {
        const scores = await prisma.essay_overall_scores.findFirst({
          where: {
            session_id: session.id
          }
        })

        const issues = scores?.issues as any || {}

        return {
          id: session.id,
          theme: session.topic_prompt,
          themeYear: issues.themeYear || 2024,
          wordCount: issues.wordCount || 0,
          totalScore: scores?.total || 0,
          createdAt: session.created_at.toISOString(),
          status: session.status
        }
      })
    )

    return NextResponse.json({
      success: true,
      history: history
    })

  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
