import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemScoringEngine } from '@/lib/enem-scoring';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    // Verify session belongs to user
    const dbSession = await prisma.enem_session.findUnique({
      where: { 
        session_id,
        user_id: session.user.id
      }
    });

    if (!dbSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate score
    const scoringEngine = new EnemScoringEngine();
    const scoringResult = await scoringEngine.calculateScore(session_id);

    // Save score to database
    await scoringEngine.saveScore(scoringResult.score);

    // Update session status to completed
    await prisma.enem_session.update({
      where: { session_id },
      data: { 
        status: 'COMPLETED',
        end_time: new Date()
      }
    });

    await scoringEngine.cleanup();

    return NextResponse.json({
      score: scoringResult.score,
      feedback: scoringResult.feedback,
      success: true
    });

  } catch (error) {
    console.error('Error calculating ENEM score:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate score',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    // Verify session belongs to user
    const dbSession = await prisma.enem_session.findUnique({
      where: { 
        session_id: sessionId,
        user_id: session.user.id
      }
    });

    if (!dbSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get score
    const score = await prisma.enem_score.findUnique({
      where: { session_id: sessionId }
    });

    if (!score) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    }

    return NextResponse.json({
      score,
      success: true
    });

  } catch (error) {
    console.error('Error fetching ENEM score:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch score',
      success: false 
    }, { status: 500 });
  }
}
