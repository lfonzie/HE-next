import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 [TEST] Test endpoint called');
  return NextResponse.json({
    status: 'ok',
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🧪 [TEST] Test POST called with body:', body);
    return NextResponse.json({
      status: 'ok',
      message: 'Test POST working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [TEST] Error in test POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
