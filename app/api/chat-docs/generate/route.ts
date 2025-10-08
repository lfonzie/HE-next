import { NextRequest, NextResponse } from 'next/server';
import { callGrok } from '@/lib/providers/grok';

export async function POST(request: NextRequest) {
  try {
    const { query, urls } = await request.json();

    if (!query || !urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'Query and URLs are required' },
        { status: 400 }
      );
    }

    // Create a prompt that includes the URLs as context
    const urlContext = urls.map((url: string) => `URL: ${url}`).join('\n');
    
    const prompt = `Você é um assistente útil que pode responder perguntas baseadas na documentação das seguintes URLs:

${urlContext}

Pergunta: ${query}

Por favor, forneça uma resposta abrangente baseada na documentação dessas URLs. Se a informação não estiver disponível nas URLs fornecidas, mencione isso e sugira onde o usuário pode encontrar mais informações. Responda em português brasileiro.`;

    const result = await callGrok(
      'grok-4-fast-reasoning',
      [],
      prompt,
      'Você é um assistente especializado em análise de documentação técnica. Sempre forneça respostas abrangentes e úteis baseadas na documentação fornecida em português brasileiro.'
    );

    const text = result.text;

    return NextResponse.json({
      text,
      urlContextMetadata: {
        urls: urls,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in chat-docs API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
