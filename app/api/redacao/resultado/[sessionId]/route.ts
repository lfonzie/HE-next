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
    const session = await prisma.essay_sessions.findFirst({
      where: {
        id: sessionId,
        user_id: session.user.id
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Resultado não encontrado' }, { status: 404 })
    }

    // Buscar pontuação e detalhes
    const scores = await prisma.essay_overall_scores.findFirst({
      where: {
        session_id: sessionId
      }
    })

    // Buscar conteúdo da redação
    const paragraphs = await prisma.essay_paragraphs.findMany({
      where: {
        session_id: sessionId
      },
      orderBy: {
        idx: 'asc'
      }
    })

    const content = paragraphs.map(p => p.content).join('\n\n')
    const issues = scores?.issues as any || {}

    return NextResponse.json({
      success: true,
      result: {
        id: session.id,
        theme: session.topic_prompt,
        themeYear: issues.themeYear || 2024,
        content: content,
        wordCount: issues.wordCount || 0,
        scores: {
          comp1: scores?.comp1 || 0,
          comp2: scores?.comp2 || 0,
          comp3: scores?.comp3 || 0,
          comp4: scores?.comp4 || 0,
          comp5: scores?.comp5 || 0
        },
        totalScore: scores?.total || 0,
        feedback: issues.feedback || '',
        suggestions: issues.suggestions || [],
        highlights: issues.highlights || {},
        createdAt: session.created_at.toISOString(),
        status: session.status
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
