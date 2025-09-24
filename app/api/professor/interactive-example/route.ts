// app/api/professor/interactive-example/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';


import { PromptRequest } from '@/lib/system-prompts';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query, subject } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('📚 Professor interactive module request:', query, 'Subject:', subject);

    // Construir requisição do prompt
    const promptRequest: PromptRequest = {
      key: 'professor.interactive.system',
      userMessage: `Disciplina: ${subject || 'Não especificada'}\n\nPergunta do aluno: ${query}\n\nTransforme esta pergunta em uma aula interativa extensa e detalhada com pontos de interação, feedback de erro e verificação de aprendizado.`,
      context: {
        subject: subject || 'Não especificada',
        timestamp: new Date().toISOString()
      }
    };

    // Construir mensagens para OpenAI
    const messages = promptManager.buildMessages(promptRequest);
    const modelConfig = promptManager.getModelConfig(promptRequest.key);

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      messages: messages as any,
      max_completion_tokens: 3000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    console.log('✅ Professor interactive response generated');

    try {
      // Tentar fazer parse do JSON retornado
      const interactiveLesson = JSON.parse(response || '{}');

      // Validar estrutura básica
      if (!interactiveLesson.title || !interactiveLesson.steps || !interactiveLesson.finalTest) {
        throw new Error('Invalid lesson structure');
      }

      return NextResponse.json({
        success: true,
        lesson: interactiveLesson,
        model: modelConfig.model,
        timestamp: new Date().toISOString()
      });

    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('Raw response:', response);

      // Fallback: retornar resposta simples se JSON inválido
      return NextResponse.json({
        success: false,
        response: response,
        error: 'Failed to parse structured response',
        model: modelConfig.model,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('❌ Teacher interactive response error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate interactive response',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
