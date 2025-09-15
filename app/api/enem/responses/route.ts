import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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
    const { session_id, item_id, selected_answer, time_spent } = body;

    // Validate request
    if (!session_id || !item_id || !selected_answer) {
      return NextResponse.json({ 
        error: 'Missing required fields: session_id, item_id, selected_answer' 
      }, { status: 400 });
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

    // Get the correct answer for the item
    const item = await prisma.enem_item.findUnique({
      where: { item_id }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const is_correct = selected_answer === item.correct_answer;

    // Check if response already exists
    const existingResponse = await prisma.enem_response.findFirst({
      where: {
        session_id,
        item_id
      }
    });

    let response;
    if (existingResponse) {
      // Update existing response
      response = await prisma.enem_response.update({
        where: {
          response_id: existingResponse.response_id
        },
        data: {
          selected_answer,
          time_spent: time_spent || 0,
          is_correct,
          timestamp: new Date()
        }
      });
    } else {
      // Create new response
      response = await prisma.enem_response.create({
        data: {
          session_id,
          item_id,
          selected_answer,
          time_spent: time_spent || 0,
          is_correct
        }
      });
    }

    return NextResponse.json({
      response,
      success: true,
      is_correct
    });

  } catch (error) {
    console.error('Error saving ENEM response:', error);
    return NextResponse.json({ 
      error: 'Failed to save response',
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

    // Get responses for session
    const responses = await prisma.enem_response.findMany({
      where: { session_id: sessionId },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({
      responses,
      success: true
    });

  } catch (error) {
    console.error('Error fetching ENEM responses:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch responses',
      success: false 
    }, { status: 500 });
  }
}
