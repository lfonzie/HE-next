import { NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


export async function GET() {
  // ENEM API health check endpoint
  // This endpoint is used for ENEM-specific health monitoring
  console.log('ENEM health check accessed:', new Date().toISOString());
  
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HubEdu.ai ENEM API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '10000',
    uptime: process.uptime(),
    endpoints: {
      questions: '/api/enem/questions',
      progressive: '/api/enem/progressive',
      exams: '/api/enem/exams',
      explanations: '/api/enem/explanations',
      simulator: '/api/enem/simulator'
    }
  }, { status: 200 });
}
