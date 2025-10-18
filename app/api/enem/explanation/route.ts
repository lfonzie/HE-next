import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';


import { logTokens } from '@/lib/token-logger';


import { getServerSession } from 'next-auth';


import { authOptions } from '@/lib/auth';

import { callGrok } from '@/lib/providers/grok';



// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  let body: any;
  
  try {
    console.log('POST /api/enem/explanation called');
    
    body = await request.json();
    const { item_id, session_id, question_text, alternatives, correct_answer, user_answer, area, question_number } = body;

    if (!item_id) {
      return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
    }

    if (!process.env.GROK_API_KEY) {
      console.warn('Grok API key not found, using fallback explanation');
      return NextResponse.json({
        explanation: generateFallbackExplanation(area, correct_answer, user_answer),
        item_id,
        session_id,
        success: true,
        source: 'fallback'
      });
    }

    // Preparar contexto da questão para o Grok
const questionContext = `
Questão ENEM ${question_number ? `#${question_number}` : ''} - Área: ${area || 'Não especificada'}
Enunciado: ${question_text || 'Questão não disponível'}

Alternativas:
${alternatives ? Object.entries(alternatives).map(([key, value]) => `${key}) ${value}`).join('\n') : 'Alternativas não disponíveis'}

Resposta correta: ${correct_answer || 'Não especificada'}
${user_answer ? `Resposta do usuário: ${user_answer}` : 'Usuário não respondeu'}
`;

    const systemPrompt = `Você é um tutor especializado em preparação para o ENEM. Sua tarefa é explicar questões de forma didática e CONCISA.

Instruções:
1. Seja DIRETO e OBJETIVO - máximo 2 parágrafos para a explicação principal
2. SEMPRE mencione o número da questão no início da explicação (ex: "Na Questão #4...")
3. Explique por que a resposta correta está certa de forma clara
4. Se o usuário respondeu errado, explique o erro de forma construtiva e breve
5. Forneça UMA dica de estudo específica e prática
6. Use linguagem clara e acessível para estudantes do ensino médio
7. Evite explicações longas e repetitivas
8. Foque no essencial para o aprendizado
9. NÃO inclua mensagens genéricas de motivação ou frases como "persista para arrasar no ENEM"

Formato da resposta (MÁXIMO 150 palavras):
- Explicação principal (1-2 parágrafos curtos) - SEMPRE começando com "Na Questão #X..."
- Uma dica de estudo específica

IMPORTANTE: Seja conciso! O estudante precisa entender rapidamente o conceito, não uma dissertação. NÃO inclua mensagens genéricas de motivação.`

    // Chamada para Grok 4 Fast Reasoning
    const result = await callGrok(
      'grok-4-fast-reasoning',
      [],
      questionContext,
      systemPrompt
    );

    const explanation = result.text || generateFallbackExplanation(area, correct_answer, user_answer);

    // Persist token usage for ENEM explanations
    try {
      const session = await getServerSession(authOptions).catch(() => null);
      const totalTokens = result.usage?.total_tokens || Math.ceil((explanation?.length || 0) / 4);
      const userId = session?.user?.id;
      if (userId && totalTokens > 0) {
        await logTokens({
          userId,
          moduleGroup: 'ENEM',
          model: 'grok-4-fast-reasoning',
          totalTokens,
          subject: area,
          messages: { item_id, session_id }
        })
      }
    } catch (e) {
      console.warn('⚠️ [ENEM/EXPLANATION] Failed to log tokens:', e)
    }

    return NextResponse.json({
      explanation,
      item_id,
      session_id,
      success: true,
      source: 'grok'
    });

  } catch (error) {
    console.error('Error in POST /api/enem/explanation:', error);
    
    // Tentar fallback com GPT-4o Mini se disponível
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🔄 Tentando fallback com GPT-4o Mini...');
        
        const questionContext = `
Questão ENEM ${body.question_number ? `#${body.question_number}` : ''} - Área: ${body.area || 'Não especificada'}
Enunciado: ${body.question_text || 'Questão não disponível'}

Alternativas:
${body.alternatives ? Object.entries(body.alternatives).map(([key, value]) => `${key}) ${value}`).join('\n') : 'Alternativas não disponíveis'}

Resposta correta: ${body.correct_answer || 'Não especificada'}
${body.user_answer ? `Resposta do usuário: ${body.user_answer}` : 'Usuário não respondeu'}
`;

        const systemPrompt = `Você é um tutor especializado em preparação para o ENEM. Sua tarefa é explicar questões de forma didática e CONCISA.

Instruções:
1. Seja DIRETO e OBJETIVO - máximo 2 parágrafos para a explicação principal
2. SEMPRE mencione o número da questão no início da explicação (ex: "Na Questão #4...")
3. Explique por que a resposta correta está certa de forma clara
4. Se o usuário respondeu errado, explique o erro de forma construtiva e breve
5. Forneça UMA dica de estudo específica e prática
6. Use linguagem clara e acessível para estudantes do ensino médio
7. Evite explicações longas e repetitivas
8. Foque no essencial para o aprendizado
9. NÃO inclua mensagens genéricas de motivação ou frases como "persista para arrasar no ENEM"

Formato da resposta (MÁXIMO 150 palavras):
- Explicação principal (1-2 parágrafos curtos) - SEMPRE começando com "Na Questão #X..."
- Uma dica de estudo específica

IMPORTANTE: Seja conciso! O estudante precisa entender rapidamente o conceito, não uma dissertação. NÃO inclua mensagens genéricas de motivação.`;

        const gptResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: questionContext }
          ],
          max_tokens: 300,
          temperature: 0.7
        });

        const explanation = gptResponse.choices[0]?.message?.content || generateFallbackExplanation(body.area, body.correct_answer, body.user_answer);

        // Log tokens do GPT-4o Mini
        try {
          const session = await getServerSession(authOptions).catch(() => null);
          const totalTokens = gptResponse.usage?.total_tokens || Math.ceil((explanation?.length || 0) / 4);
          const userId = session?.user?.id;
          if (userId && totalTokens > 0) {
            await logTokens({
              userId,
              moduleGroup: 'ENEM',
              model: 'gpt-4o-mini',
              totalTokens,
              subject: body.area,
              messages: { item_id: body.item_id, session_id: body.session_id }
            })
          }
        } catch (e) {
          console.warn('⚠️ [ENEM/EXPLANATION] Failed to log GPT tokens:', e)
        }

        return NextResponse.json({
          explanation,
          item_id: body.item_id,
          session_id: body.session_id,
          success: true,
          source: 'gpt-4o-mini'
        });

      } catch (gptError) {
        console.error('GPT-4o Mini fallback also failed:', gptError);
      }
    }
    
    // Fallback final com explicação genérica
    const fallbackExplanation = generateFallbackExplanation(
      body.area, 
      body.correct_answer, 
      body.user_answer
    );
    
    return NextResponse.json({
      explanation: fallbackExplanation,
      item_id: body.item_id,
      session_id: body.session_id,
      success: true,
      source: 'fallback'
    });
  }
}

// Função de fallback para quando ambas as APIs não estiverem disponíveis
function generateFallbackExplanation(area?: string, correctAnswer?: string, userAnswer?: string): string {
  const areaNames: Record<string, string> = {
    'CN': 'Ciências da Natureza',
    'CH': 'Ciências Humanas', 
    'LC': 'Linguagens e Códigos',
    'MT': 'Matemática'
  };

  const areaName = areaNames[area || ''] || 'esta área';

  let explanation = `Na Questão #${Math.floor(Math.random() * 100) + 1}, esta questão aborda conceitos importantes de ${areaName}. `;
  
  if (userAnswer && userAnswer !== correctAnswer) {
    explanation += `Você respondeu "${userAnswer}", mas a resposta correta é "${correctAnswer}". `;
    explanation += `É importante revisar os conceitos fundamentais relacionados a esta questão para evitar erros similares. `;
  } else if (!userAnswer) {
    explanation += `A resposta correta é "${correctAnswer}". `;
    explanation += `Para questões similares, leia cuidadosamente o enunciado e identifique as informações-chave. `;
  } else {
    explanation += `A resposta correta "${correctAnswer}" está fundamentada em princípios específicos da disciplina. `;
    explanation += `Continue praticando para consolidar seu conhecimento nesta área. `;
  }

  explanation += `\n\n**Dica de estudo:** Revise os conceitos fundamentais relacionados a esta questão e pratique exercícios similares para consolidar seu aprendizado.`;

  return explanation;
}
