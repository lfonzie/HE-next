import { NextResponse } from 'next/server';
import { enemApi } from '@/lib/enem-api';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Basic health check
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
        database: false,
        enemApi: false,
        openai: false
      },
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

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
      health.checks.database = false;
    }

    // Check ENEM API availability
    try {
      health.checks.enemApi = await enemApi.checkApiAvailability();
    } catch (error) {
      console.error('ENEM API health check failed:', error);
      health.checks.enemApi = false;
    }

    // Check OpenAI API key
    try {
      health.checks.openai = !!process.env.OPENAI_API_KEY;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      health.checks.openai = false;
    }

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    // Determine overall health status
    const criticalChecks = [health.checks.database, health.checks.openai];
    const allCriticalHealthy = criticalChecks.every(check => check === true);
    
    if (!allCriticalHealthy) {
      health.status = 'degraded';
    }

    const statusCode = allCriticalHealthy ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'HubEdu.ai',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - Date.now()
    }, { status: 500 });
  }
}