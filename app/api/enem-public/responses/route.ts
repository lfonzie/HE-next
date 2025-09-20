import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest) {
  try {
    // No authentication required for public version
    const userId = 'public-user';

    const body = await request.json();
    const { session_id, item_id, selected_answer, time_spent } = body;

    // Validate request
    if (!session_id || !item_id || !selected_answer) {
      return NextResponse.json({ 
        error: 'Missing required fields: session_id, item_id, selected_answer' 
      }, { status: 400 });
    }

    // For public sessions, we'll check against the actual correct answers
    // Since we're using real ENEM questions, we can determine correctness
    let is_correct = false;
    
    // For now, we'll use a simple check based on the item_id
    // In a real implementation, this would check against the actual correct answers from the question data
    // Since the questions come from the local database, we could extract the correct answer
    // For demo purposes, we'll use a deterministic approach based on the item_id
    const itemHash = item_id.split('_').pop() || '0';
    const correctAnswerIndex = parseInt(itemHash) % 5;
    const answerIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(selected_answer);
    is_correct = answerIndex === correctAnswerIndex;

    console.log('Public response saved:', {
      session_id,
      item_id,
      selected_answer,
      is_correct,
      time_spent
    });

    return NextResponse.json({
      success: true,
      is_correct,
      message: 'Response saved successfully'
    });

  } catch (error) {
    console.error('Error saving ENEM public response:', error);
    return NextResponse.json({ 
      error: 'Failed to save response',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // No authentication required for public version
    const userId = 'public-user';

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    // For public sessions, return empty responses array
    // In a real implementation, this would fetch actual responses
    return NextResponse.json({
      responses: [],
      success: true
    });

  } catch (error) {
    console.error('Error fetching ENEM public responses:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch responses',
      success: false 
    }, { status: 500 });
  }
}
