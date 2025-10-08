import { NextRequest, NextResponse } from 'next/server';
import { callGrok } from '@/lib/providers/grok';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs are required' },
        { status: 400 }
      );
    }

    // Create a prompt to generate initial suggestions based on the URLs
    const urlContext = urls.map((url: string) => `URL: ${url}`).join('\n');
    
    const prompt = `Com base nas seguintes URLs de documentação, gere 4 sugestões de perguntas úteis que um usuário poderia fazer:

${urlContext}

Por favor, responda com um objeto JSON contendo um array de sugestões:
{
  "suggestions": [
    "Pergunta 1",
    "Pergunta 2", 
    "Pergunta 3",
    "Pergunta 4"
  ]
}

Torne as perguntas específicas, úteis e relevantes para o conteúdo da documentação. Responda em português brasileiro.`;

    const result = await callGrok(
      'grok-4-fast-reasoning',
      [],
      prompt,
      'Você é um assistente especializado em análise de documentação técnica. Sempre forneça sugestões de perguntas úteis e específicas em português brasileiro.'
    );

    const text = result.text;

    // Try to parse the JSON response
    try {
      let jsonStr = text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json(parsed);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return NextResponse.json({
        suggestions: [
          "What is this documentation about?",
          "How do I get started?",
          "What are the main features?",
          "How do I configure this?"
        ]
      });
    }

  } catch (error) {
    console.error('Error in chat-docs suggestions API:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
