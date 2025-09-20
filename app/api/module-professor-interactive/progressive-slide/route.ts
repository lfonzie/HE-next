import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query, subject, slideNumber, slideInfo } = await request.json();

    if (!query || !slideNumber || !slideInfo) {
      return NextResponse.json(
        { success: false, error: 'Query, slideNumber e slideInfo são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`📚 Gerando slide ${slideNumber} para: ${query}`);

    const isQuestionSlide = slideNumber === 4 || slideNumber === 7;
    const isClosingSlide = slideNumber === 8;
    const slideType = isQuestionSlide ? 'question' : 'explanation';

    let systemPrompt = '';
    let userPrompt = '';

    if (isQuestionSlide) {
      systemPrompt = `Você é um professor especializado em criar perguntas educativas sobre ${query}.

Crie uma pergunta de múltipla escolha ÚNICA com 4 opções (A, B, C, D) seguindo esta estrutura:
- Pergunta contextualizada e desafiadora específica para o slide ${slideNumber}
- 4 opções de resposta bem elaboradas e únicas
- Uma resposta correta bem fundamentada
- Explicação detalhada da resposta correta
- Foque no objetivo específico: ${slideInfo.objective}

IMPORTANTE: Use formatação markdown no conteúdo:
- Use **texto** para negrito
- Use *texto* para itálico  
- Use ## para subtítulos
- Use - para listas
- Use quebras de linha duplas (\\n\\n) para separar parágrafos
- Cada parágrafo deve ter 2-3 frases bem estruturadas

Responda APENAS com JSON válido:
{
  "type": "question",
  "title": "${slideInfo.title}",
  "content": "Texto da pergunta detalhada com **formatação markdown**",
  "options": ["Opção A detalhada", "Opção B detalhada", "Opção C detalhada", "Opção D detalhada"],
  "correctOption": 0,
  "helpMessage": "Dica para ajudar na resposta",
  "correctAnswer": "Explicação detalhada da resposta correta com **formatação markdown**",
  "imagePrompt": "${slideInfo.imagePrompt || query}"
}`;

      userPrompt = `Crie uma pergunta ÚNICA sobre ${query} para o slide ${slideNumber}.

Objetivo: ${slideInfo.objective}
Resumo do conteúdo: ${slideInfo.contentSummary}

A pergunta deve:
- Ser específica para este momento da aula
- Testar conhecimentos específicos do slide ${slideNumber}
- Ter nível de dificuldade apropriado
- Incluir formatação markdown adequada
- Ter explicação detalhada da resposta correta`;
    } else {
      systemPrompt = `Você é um professor especializado em criar conteúdo educativo sobre ${query}.

Crie um slide de ${slideType} seguindo esta estrutura:
- Card 1: Conteúdo principal detalhado e educativo
- Card 2: Conteúdo complementar ou aplicação prática
- Foque no objetivo específico: ${slideInfo.objective}
- Conteúdo deve ser extenso e educativo (200-300 palavras por card)

IMPORTANTE: Use formatação markdown no conteúdo:
- Use **texto** para negrito
- Use *texto* para itálico  
- Use ## para subtítulos
- Use - para listas
- Use quebras de linha duplas (\\n\\n) para separar parágrafos
- Cada parágrafo deve ter 2-3 frases bem estruturadas
- Inclua exemplos práticos e aplicações reais

Responda APENAS com JSON válido:
{
  "type": "explanation",
  "title": "${slideInfo.title}",
  "content": "Conteúdo principal detalhado com **formatação markdown** e quebras de linha adequadas",
  "imagePrompt": "${slideInfo.imagePrompt || query}"
}`;

      userPrompt = `Crie um slide de ${slideType} sobre ${query} para o slide ${slideNumber}.

Objetivo: ${slideInfo.objective}
Resumo do conteúdo: ${slideInfo.contentSummary}

O slide deve:
- Ser específico para este momento da aula
- Ter conteúdo extenso e educativo (200-300 palavras)
- Incluir exemplos práticos e aplicações reais
- Usar formatação markdown adequada
- Ter quebras de linha para melhor legibilidade
- ${isClosingSlide ? 'Ser um resumo completo e motivacional' : 'Desenvolver o conteúdo de forma progressiva'}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Limpar possível formatação markdown
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Tentar fazer parse do JSON
    let slide;
    try {
      slide = JSON.parse(cleanedResponse);
      console.log(`✅ Slide ${slideNumber} gerado com sucesso`);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      
      // Fallback para slide básico
      slide = {
        type: slideType,
        title: slideInfo.title,
        content: isQuestionSlide 
          ? `## Pergunta sobre ${query}\n\nAgora vamos testar nosso entendimento com uma pergunta prática sobre **${query}**. Esta pergunta foi elaborada para avaliar nossa compreensão dos conceitos estudados.\n\n**Contexto:** ${slideInfo.contentSummary}\n\n**Objetivo:** ${slideInfo.objective}`
          : `## ${slideInfo.title}\n\nVamos explorar os aspectos fundamentais de **${query}** neste slide ${slideNumber}. Este conteúdo foi elaborado para proporcionar uma compreensão sólida dos conceitos estudados.\n\n**Objetivo:** ${slideInfo.objective}\n\n**Conteúdo:** ${slideInfo.contentSummary}`,
        ...(isQuestionSlide && {
          options: [
            'Opção A: Conceito fundamental relacionado ao tema',
            'Opção B: Aplicação prática do conceito',
            'Opção C: Exemplo específico do contexto',
            'Opção D: Definição técnica avançada'
          ],
          correctOption: 0,
          helpMessage: `Pense no que aprendemos sobre ${query} e considere o objetivo deste slide.`,
          correctAnswer: `A resposta correta é a **Opção A**, pois representa uma compreensão sólida dos conceitos fundamentais de ${query}.`
        }),
        imagePrompt: slideInfo.imagePrompt || query
      };
    }

    return NextResponse.json({
      success: true,
      slide: slide
    });

  } catch (error: any) {
    console.error('❌ Erro na API progressive-slide:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
