import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { area, numQuestions, durationMs, questions, answers, score } = await request.json()

    const enemSession = await prisma.enemSession.create({
      data: {
        userId: session.user.id,
        area,
        numQuestions,
        durationMs,
        startedAt: new Date(),
        finishedAt: new Date(),
        questions: questions,
        answers: answers,
        score: score
      }
    })

    return NextResponse.json({ session: enemSession })

  } catch (error) {
    console.error('ENEM Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.enemSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ sessions })

  } catch (error) {
    console.error('ENEM Session GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
