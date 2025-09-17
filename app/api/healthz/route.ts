import { NextResponse } from 'next/server';

export async function GET() {
  // Simple health check that doesn't depend on external services
  // This endpoint is used as a fallback health check
  console.log('Healthz check accessed:', new Date().toISOString());
  
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HubEdu.ai',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '10000',
    uptime: process.uptime()
  }, { status: 200 });
}
