import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se a chave está configurada
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'Gemini API key not configured',
        hasKey: false
      }, { status: 500 });
    }

    // Retornar apenas se a chave está configurada (não expor a chave real)
    return NextResponse.json({
      hasKey: true,
      configured: true,
      message: 'Gemini API key is configured'
    });

  } catch (error: any) {
    console.error('Error checking Gemini API key:', error);
    return NextResponse.json({
      error: 'Failed to check API key configuration',
      details: error.message
    }, { status: 500 });
  }
}
