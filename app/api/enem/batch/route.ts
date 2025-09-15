import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';
import { z } from 'zod';

const BatchRequestSchema = z.object({
  exam_id: z.string().uuid(),
  start_index: z.number().min(0),
  count: z.number().min(1).max(10).default(3),
  area: z.enum(['matematica', 'linguagens', 'ciencias_natureza', 'ciencias_humanas']),
  mode: z.enum(['REAL', 'AI', 'MIXED']).default('MIXED'),
  config: z.object({
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
    const batchData = BatchRequestSchema.parse(body);

    // Verify exam exists and belongs to user
    const exam = await prisma.enemExam.findFirst({
      where: {
        id: batchData.exam_id,
        user_id: session.user.id
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const { exam_id, start_index, count, area, mode, config } = batchData;

    // Check if items already exist for this range
    const existingItems = await prisma.enemExamItem.findMany({
      where: {
        exam_id: exam_id,
        index: {
          gte: start_index,
          lt: start_index + count
        }
      }
    });

    if (existingItems.length > 0) {
      return NextResponse.json({
        items: existingItems,
        success: true,
        cached: true,
        message: 'Items already exist for this range'
      });
    }

    // Generate questions based on mode
    const questions = await generateBatchQuestions(area, count, mode, config);

    // Create exam items
    const examItems = await Promise.all(
      questions.map(async (question, index) => {
        const examItem = await prisma.enemExamItem.create({
          data: {
            exam_id: exam_id,
            index: start_index + index,
            source: question.source,
            question_id: question.source === 'DATABASE' ? question.id : null,
            payload_json: question.source === 'AI' ? question : null,
            image_url: question.image_url
          }
        });

        return {
          ...examItem,
          question_data: question
        };
      })
    );

    return NextResponse.json({
      items: examItems,
      success: true,
      batch_info: {
        start_index,
        count: examItems.length,
        area,
        mode
      }
    });

  } catch (error) {
    console.error('Error in batch generation:', error);
    
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

async function generateBatchQuestions(
  area: string,
  count: number,
  mode: string,
  config?: any
): Promise<any[]> {
  const questions: any[] = [];

  // Try database first if mode allows
  if (mode === 'REAL' || mode === 'MIXED') {
    const whereClause: any = { area };
    
    if (config?.years?.length > 0) {
      whereClause.year = { in: config.years };
    }
    
    if (config?.difficulty?.length > 0) {
      whereClause.difficulty = { in: config.difficulty };
    }
    
    if (config?.skill_tags?.length > 0) {
      whereClause.skill_tag = { hasSome: config.skill_tags };
    }

    const dbQuestions = await prisma.enemQuestion.findMany({
      where: whereClause,
      take: count,
      orderBy: { created_at: 'desc' }
    });

    questions.push(...dbQuestions.map(q => ({
      ...q,
      source: 'DATABASE'
    })));
  }

  // Generate AI questions if needed
  const remainingCount = count - questions.length;
  if (remainingCount > 0 && (mode === 'AI' || mode === 'MIXED')) {
    try {
      const aiQuestions = await generateAIQuestions(area, remainingCount, config);
      questions.push(...aiQuestions.map(q => ({
        ...q,
        source: 'AI'
      })));
    } catch (error) {
      console.error('AI generation failed:', error);
      // Add fallback questions
      const fallbackQuestions = generateFallbackQuestions(area, remainingCount);
      questions.push(...fallbackQuestions.map(q => ({
        ...q,
        source: 'FALLBACK'
      })));
    }
  }

  return questions.slice(0, count);
}

async function generateAIQuestions(area: string, count: number, config?: any): Promise<any[]> {
  // Get few-shot examples
  const examples = await prisma.enemQuestion.findMany({
    where: {
      area: area,
      ...(config?.skill_tags?.length > 0 ? { skill_tag: { hasSome: config.skill_tags } } : {})
    },
    take: 2,
    orderBy: { created_at: 'desc' }
  });

  const systemPrompt = `Você é um especialista em questões do ENEM. Gere ${count} questões autênticas para a área ${area}.

Formato JSON:
{
  "questions": [
    {
      "area": "${area}",
      "year": 2023,
      "disciplina": "disciplina específica",
      "skill_tag": ["tag1", "tag2"],
      "stem": "Enunciado da questão",
      "a": "Alternativa A",
      "b": "Alternativa B", 
      "c": "Alternativa C",
      "d": "Alternativa D",
      "e": "Alternativa E",
      "correct": "A",
      "rationale": "Explicação detalhada",
      "difficulty": "MEDIUM"
    }
  ]
}`;

  const examplesText = examples.map(ex => `
Enunciado: ${ex.stem}
A) ${ex.a}
B) ${ex.b}
C) ${ex.c}
D) ${ex.d}
E) ${ex.e}
Resposta: ${ex.correct}
`).join('\n---\n');

  const userPrompt = `Baseado nos exemplos abaixo, gere ${count} questões similares:

${examplesText}

${config?.skill_tags ? `Foque nas habilidades: ${config.skill_tags.join(', ')}` : ''}
${config?.difficulty ? `Níveis: ${config.difficulty.join(', ')}` : ''}

Retorne apenas JSON válido.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No content generated');

  const parsed = JSON.parse(content);
  return parsed.questions || [];
}

function generateFallbackQuestions(area: string, count: number): any[] {
  return Array(count).fill(null).map((_, index) => ({
    area: area,
    year: 2023,
    disciplina: 'Exemplo',
    skill_tag: ['exemplo'],
    stem: `Questão ${index + 1}: Esta é uma questão de exemplo para manter o fluxo do simulador. Qual é a resposta correta?`,
    a: 'Opção A',
    b: 'Opção B',
    c: 'Opção C',
    d: 'Opção D',
    e: 'Opção E',
    correct: 'A',
    rationale: 'Esta é uma questão de exemplo para manter o fluxo do simulador.',
    difficulty: 'MEDIUM'
  }));
}
