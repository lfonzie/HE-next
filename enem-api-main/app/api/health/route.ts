import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ENEM API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '11000',
      endpoints: {
        health: '/api/health',
        exams: '/v1/exams',
        questions: '/v1/exams/[year]/questions'
      }
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'ENEM API',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
