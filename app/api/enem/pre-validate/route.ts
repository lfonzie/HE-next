import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { auth } from '@/lib/auth';


import { enemLocalDB } from '@/lib/enem-local-database';



/**
 * Endpoint para inicializar validação prévia de questões ENEM
 * POST /api/enem/pre-validate
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { year, discipline } = body;

    if (!year) {
      return NextResponse.json({ 
        error: 'Year is required' 
      }, { status: 400 });
    }

    if (!enemLocalDB.isAvailable()) {
      return NextResponse.json({ 
        error: 'Local ENEM database not available' 
      }, { status: 503 });
    }

    console.log(`🚀 Iniciando validação prévia para ${year} ${discipline || 'todas disciplinas'}`);

    // Executa validação prévia
    await enemLocalDB.preValidateQuestions(year, discipline);

    // Obtém estatísticas da validação
    const validQuestions = enemLocalDB.getValidQuestions(year, discipline || undefined);
    
    return NextResponse.json({
      success: true,
      message: `Validação prévia concluída para ${year} ${discipline || 'todas disciplinas'}`,
      stats: {
        year,
        discipline: discipline || 'all',
        validQuestionsCount: validQuestions.length,
        validatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in pre-validation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Endpoint para obter estatísticas de validação
 * GET /api/enem/pre-validate?year=2023&discipline=matematica
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2023');
    const discipline = searchParams.get('discipline');

    if (!enemLocalDB.isAvailable()) {
      return NextResponse.json({ 
        error: 'Local ENEM database not available' 
      }, { status: 503 });
    }

    const validQuestions = enemLocalDB.getValidQuestions(year, discipline || undefined);
    
    return NextResponse.json({
      success: true,
      stats: {
        year,
        discipline: discipline || 'all',
        validQuestionsCount: validQuestions.length,
        validQuestions: validQuestions.slice(0, 10), // Primeiras 10 para preview
        hasMore: validQuestions.length > 10
      }
    });

  } catch (error) {
    console.error('Error getting validation stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
