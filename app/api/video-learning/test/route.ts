import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Video Learning API funcionando corretamente',
      endpoints: {
        generateSpec: '/api/video-learning/generate-spec',
        generateCode: '/api/video-learning/generate-code',
        generateSpecFromText: '/api/video-learning/generate-spec-from-text'
      },
      features: {
        videoProcessing: 'Gemini 1.5 Flash',
        codeGeneration: 'Grok 4 Fast Reasoning',
        supportedFormats: ['mp4', 'webm', 'mov']
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check API status',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test } = body;

    if (test === 'ping') {
      return NextResponse.json({
        success: true,
        message: 'Pong! Video Learning API está funcionando',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      error: 'Invalid test parameter'
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to process test request',
      details: error.message
    }, { status: 500 });
  }
}
