import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Ditado por Voz API funcionando corretamente',
      endpoints: {
        transcribe: '/api/dictation/transcribe',
        process: '/api/dictation/process'
      },
      features: {
        transcription: 'Gemini 2.5 Flash',
        polishing: 'Grok 4 Fast Reasoning',
        audioFormats: ['webm', 'mp3', 'wav', 'ogg']
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
        message: 'Pong! Ditado por Voz API está funcionando',
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
