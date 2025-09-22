import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Proxy para enviar traces do browser para o Collector
export async function POST(req: NextRequest) {
  try {
    const collectorUrl = process.env.OTEL_COLLECTOR_URL || 'http://localhost:4318';
    const tracesEndpoint = `${collectorUrl}/v1/traces`;
    
    // Obter o corpo da requisição
    const body = await req.text();
    
    // Headers necessários para o Collector
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-protobuf',
      'Content-Encoding': 'gzip',
    };

    // Adicionar headers de CORS para o browser
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Content-Encoding',
    };

    // Fazer proxy da requisição para o Collector
    const response = await fetch(tracesEndpoint, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      console.error('Collector error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to send traces to collector' },
        { 
          status: response.status,
          headers: corsHeaders
        }
      );
    }

    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('OTel proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Content-Encoding',
        }
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Content-Encoding',
    },
  });
}
