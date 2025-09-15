import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemExamGenerator } from '@/lib/enem-exam-generator';
import { EnemSessionRequest, EnemSessionResponse, EnemArea } from '@/types/enem';
import { PrismaClient } from '@prisma/client';
import { enemLocalDB } from '@/lib/enem-local-database';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: EnemSessionRequest = await request.json();
    
    // Validate request
    if (!body.mode || !body.area || !body.config?.num_questions) {
      return NextResponse.json({ 
        error: 'Missing required fields: mode, area, config.num_questions' 
      }, { status: 400 });
    }

    // Generate exam
    console.log('Generating exam with config:', {
      mode: body.mode,
      areas: body.area,
      numQuestions: body.config.num_questions
    });
    
    const examGenerator = new EnemExamGenerator();
    const examResult = await examGenerator.generateExam({
      mode: body.mode,
      areas: body.area as EnemArea[],
      numQuestions: body.config.num_questions,
      timeLimit: body.config.time_limit,
      difficultyDistribution: body.config.difficulty_distribution,
      randomSeed: `session_${Date.now()}`
    });
    
    console.log('Exam generated successfully:', {
      itemsCount: examResult.items.length,
      metadata: examResult.metadata
    });

    // Try to create session in database, fallback to local storage if database fails
    let sessionId: string;
    try {
      const dbSession = await prisma.enem_session.create({
        data: {
          user_id: session?.user?.id || 'anonymous',
          mode: body.mode,
          area: body.area,
          config: body.config,
          status: 'ACTIVE'
        }
      });
      sessionId = dbSession.session_id;
    } catch (dbError) {
      console.warn('Database unavailable, using local storage fallback:', dbError);
      // Generate a unique session ID for local storage
      sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session data in local storage (you could use a file-based storage here)
      // For now, we'll just use the session ID
    }

    const response: EnemSessionResponse = {
      session_id: sessionId,
      items: examResult.items,
      success: true,
      metadata: {
        estimated_duration: examResult.metadata.estimatedDuration,
        difficulty_breakdown: examResult.metadata.difficultyBreakdown
      }
    };

    try {
      await examGenerator.cleanup();
    } catch (cleanupError) {
      console.warn('Cleanup failed:', cleanupError);
    }
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating ENEM session:', error);
    return NextResponse.json({ 
      error: 'Failed to create session',
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

    try {
      if (sessionId) {
        // Get specific session
        const dbSession = await prisma.enem_session.findUnique({
          where: { 
            session_id: sessionId,
            user_id: session.user.id // Ensure user owns the session
          },
          include: {
            responses: true,
            score: true
          }
        });

        if (!dbSession) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({
          session: dbSession,
          success: true
        });
      } else {
        // Get user's sessions
        const sessions = await prisma.enem_session.findMany({
          where: { user_id: session.user.id },
          orderBy: { start_time: 'desc' },
          take: 20 // Limit to recent sessions
        });

        return NextResponse.json({
          sessions,
          success: true
        });
      }
    } catch (dbError) {
      console.warn('Database unavailable for GET request:', dbError);
      return NextResponse.json({ 
        error: 'Database temporarily unavailable',
        success: false 
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error fetching ENEM sessions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sessions',
      success: false 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { session_id, status, end_time } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    try {
      // Update session
      const updatedSession = await prisma.enem_session.update({
        where: { 
          session_id,
          user_id: session.user.id // Ensure user owns the session
        },
        data: {
          status: status || undefined,
          end_time: end_time ? new Date(end_time) : undefined,
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        session: updatedSession,
        success: true
      });
    } catch (dbError) {
      console.warn('Database unavailable for PUT request:', dbError);
      return NextResponse.json({ 
        error: 'Database temporarily unavailable',
        success: false 
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error updating ENEM session:', error);
    return NextResponse.json({ 
      error: 'Failed to update session',
      success: false 
    }, { status: 500 });
  }
}
