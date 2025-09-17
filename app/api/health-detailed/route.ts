import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Detailed health check for APP ONLY - no external dependencies
    // This endpoint is for monitoring purposes, not for Render deployment checks
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
        port: !!process.env.PORT,
        // Environment variables check (no external API calls)
        openai: !!process.env.OPENAI_API_KEY,
        unsplash: !!process.env.UNSPLASH_ACCESS_KEY,
        nextauth: !!process.env.NEXTAUTH_SECRET,
        database: !!process.env.DATABASE_URL
      },
      endpoints: {
        health: '/api/health',
        healthz: '/api/healthz',
        healthDetailed: '/api/health-detailed',
        enemQuestions: '/api/enem/questions',
        enemProgressive: '/api/enem/progressive',
        auth: '/api/auth',
        chat: '/api/chat',
        interactive: '/test-hubedu-interactive'
      }
    };

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    // Return 200 - this is for app monitoring only
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Detailed health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'HubEdu.ai',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - Date.now()
    }, { status: 500 });
  }
}
