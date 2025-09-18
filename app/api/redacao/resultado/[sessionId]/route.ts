import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { sessionId } = params

    // Buscar resultado da redação
    const result = await prisma.redacaoSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      },
      select: {
        id: true,
        theme: true,
        themeYear: true,
        content: true,
        wordCount: true,
        scores: true,
        totalScore: true,
        feedback: true,
        suggestions: true,
        highlights: true,
        createdAt: true,
        status: true
      }
    })

    if (!result) {
      return NextResponse.json({ error: 'Resultado não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      result: {
        id: result.id,
        theme: result.theme,
        themeYear: result.themeYear,
        content: result.content,
        wordCount: result.wordCount,
        scores: result.scores as any,
        totalScore: result.totalScore,
        feedback: result.feedback,
        suggestions: result.suggestions as string[],
        highlights: result.highlights as any,
        createdAt: result.createdAt.toISOString(),
        status: result.status
      }
    })

  } catch (error) {
    console.error('Erro ao buscar resultado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
