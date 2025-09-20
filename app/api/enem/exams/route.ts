import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateExamSchema = z.object({
  area: z.enum(['matematica', 'linguagens', 'ciencias_natureza', 'ciencias_humanas']),
  mode: z.enum(['REAL', 'AI', 'MIXED']).default('MIXED'),
  total_questions: z.number().min(1).max(100).default(20),
  duration_sec: z.number().min(60).max(14400).default(3600), // 1 hour default
  config_json: z.object({
    years: z.array(z.number()).optional(),
    difficulty: z.array(z.string()).optional(),
    skill_tags: z.array(z.string()).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const examData = CreateExamSchema.parse(body);

    // Create exam record
    const exam = await prisma.enemExam.create({
      data: {
        user_id: session.user.id,
        area: examData.area,
        mode: examData.mode,
        total_questions: examData.total_questions,
        duration_sec: examData.duration_sec,
        config_json: examData.config_json || {}
      }
    });

    return NextResponse.json({
      exam_id: exam.id,
      success: true,
      exam: {
        id: exam.id,
        area: exam.area,
        mode: exam.mode,
        total_questions: exam.total_questions,
        duration_sec: exam.duration_sec,
        created_at: exam.created_at
      }
    });

  } catch (error) {
    console.error('Error creating exam:', error);
    
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (examId) {
      // Get specific exam with items
      const exam = await prisma.enemExam.findUnique({
        where: { id: examId },
        include: {
          exam_items: {
            orderBy: { index: 'asc' }
          }
        }
      });

      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }

      return NextResponse.json({
        exam,
        success: true
      });
    } else {
      // Get user's exams
      const exams = await prisma.enemExam.findMany({
        where: { user_id: session.user.id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: { exam_items: true }
          }
        }
      });

      return NextResponse.json({
        exams,
        success: true,
        pagination: {
          limit,
          offset,
          has_more: exams.length === limit
        }
      });
    }

  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}