import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Simple health check that doesn't depend on external services
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
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      responseTime: 0,
      checks: {
        application: true,
        environment: !!process.env.NODE_ENV,
        port: !!process.env.PORT
      },
      endpoints: {
        health: '/api/health',
        healthz: '/api/healthz',
        enemHealth: '/api/enem/health',
        enemQuestions: '/api/enem/questions',
        enemExams: '/api/enem/exams',
        auth: '/api/auth',
        chat: '/api/chat',
        interactive: '/test-hubedu-interactive'
      }
    };

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    // Always return 200 for basic health check
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'HubEdu.ai',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - Date.now()
    }, { status: 500 });
  }
}