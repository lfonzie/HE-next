import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assessmentEngine } from '@/lib/assessment/enem-assessment';
import { z } from 'zod';

const AssessmentRequestSchema = z.object({
  examId: z.string().uuid(),
  includeRecommendations: z.boolean().default(true),
  includeTrends: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, includeRecommendations, includeTrends } = AssessmentRequestSchema.parse(body);

    // Get exam data
    const exam = await prisma.enemExam.findFirst({
      where: {
        id: examId,
        user_id: session.user.id
      },
      include: {
        exam_items: {
          orderBy: { index: 'asc' }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Get exam items with answers
    const examItems = exam.exam_items;
    const questions = examItems.map(item => {
      if (item.source === 'DATABASE' && item.question_id) {
        // For database questions, we'd need to fetch from enemQuestion table
        // For now, we'll use the payload_json
        const payload = item.payload_json as any;
        return {
          id: item.question_id,
          area: exam.area,
          year: 2023, // Default year
          disciplina: 'Geral',
          skill_tag: ['geral'],
          stem: payload?.stem || 'Questão não disponível',
          a: payload?.a || 'A',
          b: payload?.b || 'B',
          c: payload?.c || 'C',
          d: payload?.d || 'D',
          e: payload?.e || 'E',
          correct: payload?.correct || 'A',
          rationale: payload?.rationale || 'Explicação não disponível',
          difficulty: payload?.difficulty || 'MEDIUM',
          source: item.source
        };
      } else {
        // For AI-generated questions
        const aiPayload = item.payload_json as any;
        return {
          id: item.id,
          area: exam.area,
          year: 2023,
          disciplina: 'Geral',
          skill_tag: aiPayload?.skill_tag || ['geral'],
          stem: aiPayload?.stem || 'Questão não disponível',
          a: aiPayload?.a || 'A',
          b: aiPayload?.b || 'B',
          c: aiPayload?.c || 'C',
          d: aiPayload?.d || 'D',
          e: aiPayload?.e || 'E',
          correct: aiPayload?.correct || 'A',
          rationale: aiPayload?.rationale || 'Explicação não disponível',
          difficulty: aiPayload?.difficulty || 'MEDIUM',
          source: item.source
        };
      }
    });

    // Get user answers
    const answers = new Map();
    examItems.forEach(item => {
      if (item.answer_user) {
        answers.set(item.id, {
          questionId: item.id,
          answer: item.answer_user,
          timestamp: item.updated_at,
          timeSpent: 0 // We don't track time per question in the current schema
        });
      }
    });

    // Calculate basic stats
    const totalQuestions = questions.length;
    const correctAnswers = Array.from(answers.values()).filter(
      answer => questions.find(q => q.id === answer.questionId)?.correct === answer.answer
    ).length;
    const incorrectAnswers = Array.from(answers.values()).filter(
      answer => questions.find(q => q.id === answer.questionId)?.correct !== answer.answer
    ).length;
    const skippedAnswers = totalQuestions - answers.size;

    const stats = {
      correctAnswers,
      incorrectAnswers,
      skippedAnswers,
      averageTimePerQuestion: 0,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      timeSpent: 0,
      difficultyBreakdown: {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 }
      },
      skillBreakdown: {} as Record<string, { correct: number; total: number }>
    };

    // Calculate difficulty breakdown
    questions.forEach(question => {
      const difficulty = question.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
      stats.difficultyBreakdown[difficulty].total++;
      
      const answer = answers.get(question.id);
      if (answer && answer.answer === question.correct) {
        stats.difficultyBreakdown[difficulty].correct++;
      }
    });

    // Calculate skill breakdown
    questions.forEach(question => {
      question.skill_tag.forEach((skill: string) => {
        if (!stats.skillBreakdown[skill]) {
          stats.skillBreakdown[skill] = { correct: 0, total: 0 };
        }
        stats.skillBreakdown[skill].total++;
        
        const answer = answers.get(question.id);
        if (answer && answer.answer === question.correct) {
          stats.skillBreakdown[skill].correct++;
        }
      });
    });

    // Generate assessment
    const assessment = await assessmentEngine.assessPerformance(
      questions,
      answers,
      exam.duration_sec,
      undefined // No previous stats for now
    );

    // Save assessment to database
    await prisma.enemExam.update({
      where: { id: examId },
      data: {
        stats_json: JSON.parse(JSON.stringify({
          stats,
          assessment: includeRecommendations ? assessment : undefined,
          generatedAt: new Date().toISOString()
        }))
      }
    });

    return NextResponse.json({
      assessment,
      stats,
      exam: {
        id: exam.id,
        area: exam.area,
        mode: exam.mode,
        total_questions: exam.total_questions,
        duration_sec: exam.duration_sec,
        created_at: exam.created_at
      },
      success: true
    });

  } catch (error) {
    console.error('Error generating assessment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request parameters',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('exam_id');

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    // Get exam with stats
    const exam = await prisma.enemExam.findFirst({
      where: {
        id: examId,
        user_id: session.user.id
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({
      exam: {
        id: exam.id,
        area: exam.area,
        mode: exam.mode,
        total_questions: exam.total_questions,
        duration_sec: exam.duration_sec,
        stats_json: exam.stats_json,
        created_at: exam.created_at
      },
      success: true
    });

  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}
