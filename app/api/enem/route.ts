import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { auth } from '@/lib/auth';


import { withTimeout } from '@/lib/async';


import { openai, selectModel, getModelConfig } from '@/lib/openai';


import { ENEMItem, ENEMBatchRequest, ENEMBatchResponse } from '@/types/slides';



const GENERATION_TIMEOUT_MS = 15_000;

async function generateENEMItems(area: string, count: number): Promise<ENEMItem[]> {
  const prompt = `Gere ${count} questões no estilo ENEM para a área ${area}, com 5 alternativas (A–E, apenas uma correta). Retorne um array JSON com: area, year_hint (opcional, estilo ENEM 2023), content (enunciado), options, answer, rationale (1–3 frases), tags (subassuntos variados, ex.: função, genética), difficulty (easy|medium|hard). Use linguagem clara, brasileira, sem jargões. Evite repetir subassuntos no mesmo lote.`;

  const messages = [
    { role: 'system', content: 'Você é um especialista em questões do ENEM. Sempre retorne JSON válido com array de questões.' },
    { role: 'user', content: prompt }
  ];

  try {
    const model = selectModel(prompt, 'enem-interativo');
    const { temperature = 0.7, max_tokens = 2000 } = getModelConfig(model);

    const response = await openai.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      max_tokens: Math.min(max_tokens ?? 2000, 2000),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    let items: ENEMItem[];
    try {
      items = JSON.parse(content) as ENEMItem[];
    } catch (parseError) {
      throw new Error('Failed to parse ENEM items from OpenAI response');
    }

    // Validate and fix items
    return items.map((item, index) => ({
      ...item,
      area: area as ENEMItem['area'],
      options: item.options || [],
      answer: item.answer || 'A',
      rationale: item.rationale || 'Explicação não disponível',
      tags: item.tags || [],
      difficulty: item.difficulty || 'medium',
      year_hint: item.year_hint || `ENEM ${2020 + (index % 4)} style`
    }));
  } catch (error) {
    console.error('Error generating ENEM items:', error);
    throw error;
  }
}

async function generateFallbackItems(startIndex: number, count: number): Promise<ENEMItem[]> {
  // Generate single fallback item to maintain flow
  const fallbackItem: ENEMItem = {
    area: 'matematica',
    year_hint: 'ENEM 2023 style',
    content: `Questão ${startIndex + 1}: Esta é uma questão de exemplo gerada automaticamente. Qual é a resposta correta?`,
    options: [
      'A) Opção A',
      'B) Opção B', 
      'C) Opção C',
      'D) Opção D',
      'E) Opção E'
    ],
    answer: 'A',
    rationale: 'Esta é uma questão de exemplo para manter o fluxo do simulador.',
    tags: ['exemplo'],
    difficulty: 'medium'
  };

  return Array(count).fill(null).map((_, i) => ({
    ...fallbackItem,
    content: fallbackItem.content.replace(`${startIndex + 1}`, `${startIndex + i + 1}`)
  }));
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startIndex = 0, count, area }: ENEMBatchRequest = await request.json();

    if (!area || typeof area !== 'string' || !count || typeof count !== 'number' || count < 1 || count > 10) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    try {
      const items = await withTimeout(
        generateENEMItems(area, count),
        GENERATION_TIMEOUT_MS,
        'Generation timed out'
      );

      const response: ENEMBatchResponse = {
        items,
        success: true,
        source: 'ai'
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error generating ENEM items:', error);

      // Fallback to single item if this is the first batch
      if (startIndex === 0) {
        const fallbackItems = await generateFallbackItems(startIndex, 1);
        return NextResponse.json({
          items: fallbackItems,
          success: true,
          source: 'fallback'
        });
      }
      
      return NextResponse.json({ 
        error: 'Failed to generate ENEM items',
        success: false 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in ENEM API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}
