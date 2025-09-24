import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Buscar ou criar progresso da aula
    let progress = await prisma.lesson_progress.findUnique({
      where: {
        user_id_lesson_id: {
          user_id: userId,
          lesson_id: lessonId
        }
      }
    });

    if (!progress) {
      progress = await prisma.lesson_progress.create({
        data: {
          user_id: userId,
          lesson_id: lessonId,
          current_stage: stageIndex,
          completed_stages: completed ? [stageIndex] : [],
          quiz_results: quizResults,
          total_time_spent: timeSpent,
          is_completed: false
        }
      });
    } else {
      // Atualizar progresso existente
      const updatedCompletedStages = completed 
        ? [...new Set([...progress.completed_stages, stageIndex])]
        : progress.completed_stages;

      const updatedQuizResults = {
        ...progress.quiz_results as any,
        ...quizResults
      };

      progress = await prisma.lesson_progress.update({
        where: { id: progress.id },
        data: {
          current_stage: Math.max(progress.current_stage, stageIndex),
          completed_stages: updatedCompletedStages,
          quiz_results: updatedQuizResults,
          total_time_spent: progress.total_time_spent + timeSpent,
          updated_at: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        id: progress.id,
        currentStage: progress.current_stage,
        completedStages: progress.completed_stages,
        totalTimeSpent: progress.total_time_spent,
        isCompleted: progress.is_completed,
        quizResults: progress.quiz_results
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

    let whereClause: any = { user_id: userId };
    if (lessonId) {
      whereClause.lesson_id = lessonId;
    }

    const progress = await prisma.lesson_progress.findMany({
      where: whereClause,
      orderBy: { updated_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      progress: progress.map(p => ({
        id: p.id,
        lessonId: p.lesson_id,
        currentStage: p.current_stage,
        completedStages: p.completed_stages,
        totalTimeSpent: p.total_time_spent,
        isCompleted: p.is_completed,
        completionDate: p.completion_date,
        quizResults: p.quiz_results,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }))
    });

  } catch (error: any) {
    console.error('Erro ao buscar progresso da aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, lessonId, isCompleted, completionDate } = await request.json();

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId e lessonId são obrigatórios' },
        { status: 400 }
      );
    }

    const progress = await prisma.lesson_progress.findUnique({
      where: {
        user_id_lesson_id: {
          user_id: userId,
          lesson_id: lessonId
        }
      }
    });

    if (!progress) {
      return NextResponse.json(
        { error: 'Progresso da aula não encontrado' },
        { status: 404 }
      );
    }

    const updatedProgress = await prisma.lesson_progress.update({
      where: { id: progress.id },
      data: {
        is_completed: isCompleted,
        completion_date: completionDate ? new Date(completionDate) : new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      progress: {
        id: updatedProgress.id,
        isCompleted: updatedProgress.is_completed,
        completionDate: updatedProgress.completion_date
      }
    });

  } catch (error: any) {
    console.error('Erro ao atualizar conclusão da aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
