import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { logTokens } from '@/lib/token-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  let body: any;
  
  try {
    console.log('POST /api/enem/explanation called');
    
    body = await request.json();
    const { item_id, session_id, question_text, alternatives, correct_answer, user_answer, area } = body;

    if (!item_id) {
      return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, using fallback explanation');
      return NextResponse.json({
        explanation: generateFallbackExplanation(area, correct_answer, user_answer),
        item_id,
        session_id,
        success: true,
        source: 'fallback'
      });
    }

    // Preparar contexto da questão para a OpenAI
    const questionContext = `
Questão ENEM - Área: ${area || 'Não especificada'}
Enunciado: ${question_text || 'Questão não disponível'}

Alternativas:
${alternatives ? Object.entries(alternatives).map(([key, value]) => `${key}) ${value}`).join('\n') : 'Alternativas não disponíveis'}

Resposta correta: ${correct_answer || 'Não especificada'}
${user_answer ? `Resposta do usuário: ${user_answer}` : 'Usuário não respondeu'}
`;

    // Chamada para OpenAI GPT-4 Mini
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um tutor especializado em preparação para o ENEM. Sua tarefa é explicar questões de forma didática e educativa.

Instruções:
1. Explique por que a resposta correta está certa
2. Se o usuário respondeu errado, explique o erro de forma construtiva
3. Forneça dicas de estudo relacionadas ao tema
4. Use linguagem clara e acessível para estudantes do ensino médio
5. Inclua estratégias de resolução para questões similares
6. Mantenha o tom motivacional e educativo

Formato da resposta:
- Explicação principal (2-3 parágrafos)
- Dica de estudo específica
- Estratégia de resolução
- Motivação para continuar estudando`
        },
        {
          role: "user",
          content: questionContext
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const explanation = completion.choices[0]?.message?.content || generateFallbackExplanation(area, correct_answer, user_answer);

    // Persist token usage for ENEM explanations
    try {
      const session = await getServerSession(authOptions).catch(() => null);
      const totalTokens = (completion as any)?.usage?.total_tokens
        || (((completion as any)?.usage?.prompt_tokens || 0) + ((completion as any)?.usage?.completion_tokens || 0))
        || Math.ceil((explanation?.length || 0) / 4);
      const userId = session?.user?.id;
      if (userId && totalTokens > 0) {
        await logTokens({
          userId,
          moduleGroup: 'ENEM',
          model: 'gpt-4o-mini',
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
      source: 'openai'
    });

  } catch (error) {
    console.error('Error in POST /api/enem/explanation:', error);
    
    // Fallback em caso de erro da OpenAI
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
      source: 'fallback',
      error: 'OpenAI API error, using fallback'
    });
  }
}

// Função de fallback para quando a OpenAI não estiver disponível
function generateFallbackExplanation(area?: string, correctAnswer?: string, userAnswer?: string): string {
  const areaNames: Record<string, string> = {
    'CN': 'Ciências da Natureza',
    'CH': 'Ciências Humanas', 
    'LC': 'Linguagens e Códigos',
    'MT': 'Matemática'
  };

  const areaName = areaNames[area || ''] || 'esta área';

  let explanation = `Esta questão aborda conceitos importantes de ${areaName}. `;
  
  if (userAnswer && userAnswer !== correctAnswer) {
    explanation += `Você respondeu "${userAnswer}", mas a resposta correta é "${correctAnswer}". `;
  } else if (!userAnswer) {
    explanation += `A resposta correta é "${correctAnswer}". `;
  } else {
    explanation += `A resposta correta "${correctAnswer}" está fundamentada em princípios específicos da disciplina. `;
  }

  explanation += `

**Dica de estudo:** Revise os conceitos fundamentais relacionados a esta questão e pratique exercícios similares para consolidar seu aprendizado.

**Estratégia de resolução:** Leia cuidadosamente o enunciado, identifique as informações-chave e elimine as alternativas que claramente não se aplicam ao contexto apresentado.

**Motivação:** Cada questão é uma oportunidade de aprendizado. Continue praticando para melhorar seu desempenho!`;

  return explanation;
}
