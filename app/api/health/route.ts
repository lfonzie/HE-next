import { NextResponse } from 'next/server';

export async function GET() {
  // Simple health check that doesn't depend on external services
  // This endpoint is used by Render for deployment health checks
  console.log('Health check accessed:', new Date().toISOString());
  
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HubEdu.ai',
    version: '1.0.0'
  }, { status: 200 });
}