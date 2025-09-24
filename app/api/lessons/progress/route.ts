import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      lessonId, 
      stageIndex, 
      completed, 
      quizResults = {}, 
      timeSpent = 0 
    } = await request.json();

    if (!userId || !lessonId || stageIndex === undefined) {
      return NextResponse.json(
        { error: 'userId, lessonId e stageIndex são obrigatórios' },
        { status: 400 }
      );
    }

    // Simular sucesso sem banco de dados
    return NextResponse.json({
      success: true,
      progress: {
        id: `progress_${Date.now()}`,
        currentStage: stageIndex,
        completedStages: completed ? [stageIndex] : [],
        totalTimeSpent: timeSpent,
        isCompleted: false,
        quizResults: quizResults
      }
    });

  } catch (error: any) {
    console.error('Erro ao salvar progresso da aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Simular dados sem banco de dados
    return NextResponse.json({
      success: true,
      progress: []
    });

  } catch (error: any) {
    console.error('Erro ao buscar progresso da aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}