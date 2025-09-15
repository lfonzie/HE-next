import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/openai';
import { z } from 'zod';

const QuestionFilterSchema = z.object({
  area: z.enum(['matematica', 'linguagens', 'ciencias_natureza', 'ciencias_humanas']),
  years: z.array(z.number().min(2009).max(2023)).optional(),
  difficulty: z.array(z.enum(['EASY', 'MEDIUM', 'HARD'])).optional(),
  skill_tags: z.array(z.string()).optional(),
  count: z.number().min(1).max(50).default(10),
  mode: z.enum(['REAL', 'AI', 'MIXED']).default('MIXED'),
  fallback_threshold: z.number().min(0).max(1).default(0.7)
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const filter = QuestionFilterSchema.parse(body);

    const { area, years, difficulty, skill_tags, count, mode, fallback_threshold } = filter;

    // Build database query
    const whereClause: any = {
      area: area
    };

    if (years && years.length > 0) {
      whereClause.year = { in: years };
    }

    if (difficulty && difficulty.length > 0) {
      whereClause.difficulty = { in: difficulty };
    }

    if (skill_tags && skill_tags.length > 0) {
      whereClause.skill_tag = { hasSome: skill_tags };
    }

    // Try to get questions from database first
    let dbQuestions: any[] = [];
    let dbCoverage = 0;

    if (mode === 'REAL' || mode === 'MIXED') {
      const totalDbQuestions = await prisma.enemQuestion.count({ where: whereClause });
      dbQuestions = await prisma.enemQuestion.findMany({
        where: whereClause,
        take: count,
        orderBy: { created_at: 'desc' }
      });

      dbCoverage = dbQuestions.length / count;
    }

    // Determine if we need AI generation
    const needsAI = mode === 'AI' || (mode === 'MIXED' && dbCoverage < fallback_threshold);
    const aiCount = needsAI ? Math.max(0, count - dbQuestions.length) : 0;

    let aiQuestions: any[] = [];

    if (needsAI && aiCount > 0) {
      try {
        aiQuestions = await generateAIQuestions(area, aiCount, skill_tags, difficulty);
      } catch (error) {
        console.error('AI generation failed:', error);
        // Continue with database questions only
      }
    }

    // Combine and format results
    const allQuestions = [
      ...dbQuestions.map(q => ({
        ...q,
        source: 'DATABASE' as const,
        id: q.id
      })),
      ...aiQuestions.map((q, index) => ({
        ...q,
        source: 'AI' as const,
        id: `ai_${Date.now()}_${index}`
      }))
    ];

    // Shuffle questions to mix sources
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      questions: shuffledQuestions.slice(0, count),
      metadata: {
        total_requested: count,
        database_questions: dbQuestions.length,
        ai_questions: aiQuestions.length,
        coverage_percentage: dbCoverage,
        mode_used: mode,
        fallback_triggered: needsAI
      },
      success: true
    });

  } catch (error) {
    console.error('Error in advanced questions API:', error);
    
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

async function generateAIQuestions(
  area: string, 
  count: number, 
  skill_tags?: string[], 
  difficulty?: string[]
): Promise<any[]> {
  // Get few-shot examples from database
  const examples = await prisma.enemQuestion.findMany({
    where: {
      area: area,
      ...(skill_tags && skill_tags.length > 0 ? { skill_tag: { hasSome: skill_tags } } : {})
    },
    take: 3,
    orderBy: { created_at: 'desc' }
  });

  const systemPrompt = `Você é um especialista em questões do ENEM. Gere ${count} questões autênticas para a área ${area}.

Formato de resposta JSON:
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
      "difficulty": "MEDIUM",
      "source": "AI"
    }
  ]
}`;

  const examplesText = examples.map(ex => `
Área: ${ex.area}
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

${skill_tags ? `Foque nas habilidades: ${skill_tags.join(', ')}` : ''}
${difficulty ? `Níveis de dificuldade: ${difficulty.join(', ')}` : ''}

Retorne apenas JSON válido.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 3000
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No content generated');

  const parsed = JSON.parse(content);
  return parsed.questions || [];
}
