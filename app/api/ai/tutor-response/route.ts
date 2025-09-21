import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { openai } from '@ai-sdk/openai';


import { generateText } from 'ai';



export async function POST(request: NextRequest) {
  try {
    const { prompt, userId } = await request.json();

    if (!prompt || !userId) {
      return NextResponse.json(
        { error: 'Prompt e userId são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação básica de segurança
    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt muito longo' },
        { status: 400 }
      );
    }

    const model = openai('gpt-4o-mini');

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    // Log da interação para análise (sem dados pessoais)
    console.log(`Tutor IA - Usuário: ${userId}, Tokens: ${result.usage?.totalTokens}`);

    return NextResponse.json({
      response: result.text,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro na API do tutor IA:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        response: 'Desculpe, estou com dificuldades técnicas. Vamos tentar uma abordagem diferente?'
      },
      { status: 500 }
    );
  }
}
