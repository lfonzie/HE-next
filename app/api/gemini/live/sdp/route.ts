import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();
    
    const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY!;

    if (!API_KEY) {
      return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
    }

    // Para WebSockets, retornamos a URL e chave para o cliente conectar diretamente
    if (action === 'get_websocket_url') {
      const wsUrl = `wss://generativelanguage.googleapis.com/v1beta/models/gemini-live-2.5-flash-preview:streamGenerateContent?key=${API_KEY}`;
      return NextResponse.json({ 
        websocket_url: wsUrl,
        api_key: API_KEY // Em produção, use ephemeral tokens
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    console.error('[Gemini Live] Server error:', e);
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}