import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FREEPIK_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'Not found',
    message: apiKey ? 'API key is loaded' : 'API key not found'
  });
}
