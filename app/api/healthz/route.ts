import { NextResponse } from 'next/server';
import { enemApi } from '@/lib/enem-api';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'HubEdu.ai',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '10000',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      enemApiStatus: await enemApi.checkApiAvailability(),
      endpoints: {
        health: '/api/health',
        healthz: '/api/healthz',
        enemHealth: '/api/enem/health',
        enemQuestions: '/api/enem/questions',
        enemExams: '/api/enem/exams',
        auth: '/api/auth',
        chat: '/api/chat'
      }
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'HubEdu.ai',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
