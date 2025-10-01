// app/api/content/classify/route.ts
// API endpoint para classificação de conteúdo por IA

import { NextRequest, NextResponse } from 'next/server';
import { classifyContentWithAI } from '@/lib/ai-content-classifier';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Classificar conteúdo usando IA
    const classification = await classifyContentWithAI(topic);

    return NextResponse.json({
      success: true,
      isInappropriate: classification.isInappropriate,
      confidence: classification.confidence,
      categories: classification.categories,
      reasoning: classification.reasoning,
      educationalAlternative: classification.educationalAlternative,
      suggestedResponse: classification.suggestedResponse
    });

  } catch (error) {
    console.error('Error in content classification:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        success: false 
      },
      { status: 500 }
    );
  }
}
