import { NextResponse } from 'next/server';

export async function GET() {
  // Simple health check endpoint for Render deployment
  // This endpoint is specifically for Render's health check at /health
  console.log('Health check accessed:', new Date().toISOString());
  
  return NextResponse.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'HubEdu.ai',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '10000'
  }, { status: 200 });
}
