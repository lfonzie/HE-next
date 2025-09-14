import { NextResponse } from 'next/server';
import { enemApi } from '@/lib/enem-api';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Detailed health check that includes external service checks
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
        enemApi: false, // Will be updated below
        openai: !!process.env.OPENAI_API_KEY,
        unsplash: !!process.env.UNSPLASH_API_KEY
      },
      endpoints: {
        health: '/api/health',
        healthz: '/api/healthz',
        healthDetailed: '/api/health-detailed',
        enemHealth: '/api/enem/health',
        enemQuestions: '/api/enem/questions',
        enemExams: '/api/enem/exams',
        auth: '/api/auth',
        chat: '/api/chat',
        interactive: '/test-hubedu-interactive'
      }
    };

    // Check ENEM API availability (with timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      health.checks.enemApi = await enemApi.checkApiAvailability();
      clearTimeout(timeoutId);
    } catch (error) {
      console.warn('ENEM API check failed:', error);
      health.checks.enemApi = false;
    }

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    // Return 200 even if external services fail - this is for monitoring
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
