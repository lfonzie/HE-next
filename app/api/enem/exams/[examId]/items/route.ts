import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const AddExamItemSchema = z.object({
  exam_id: z.string().uuid(),
  index: z.number().min(0),
  source: z.enum(['DATABASE', 'AI', 'FALLBACK']),
  question_id: z.string().uuid().optional(),
  payload_json: z.object({
    area: z.string(),
    stem: z.string(),
    options: z.object({
      a: z.string(),
      b: z.string(),
      c: z.string(),
      d: z.string(),
      e: z.string()
    }),
    correct: z.string(),
    rationale: z.string().optional(),
    difficulty: z.string().optional(),
    skill_tag: z.array(z.string()).optional()
  }).optional(),
  image_url: z.string().url().optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const itemData = AddExamItemSchema.parse(body);

    // Verify exam exists and belongs to user
    const exam = await prisma.enemExam.findFirst({
      where: {
        id: itemData.exam_id,
        user_id: session.user.id
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Create exam item
    const examItem = await prisma.enemExamItem.create({
      data: {
        exam_id: itemData.exam_id,
        index: itemData.index,
        source: itemData.source,
        question_id: itemData.question_id,
        payload_json: itemData.payload_json,
        image_url: itemData.image_url
      }
    });

    return NextResponse.json({
      exam_item: examItem,
      success: true
    });

  } catch (error) {
    console.error('Error adding exam item:', error);
    
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

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exam_id, index, answer_user } = body;

    if (!exam_id || index === undefined || !answer_user) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify exam exists and belongs to user
    const exam = await prisma.enemExam.findFirst({
      where: {
        id: exam_id,
        user_id: session.user.id
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Update exam item with user answer
    const examItem = await prisma.enemExamItem.updateMany({
      where: {
        exam_id: exam_id,
        index: index
      },
      data: {
        answer_user: answer_user,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      updated: examItem.count > 0,
      success: true
    });

  } catch (error) {
    console.error('Error updating exam item:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}
