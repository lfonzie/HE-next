import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { HUBEDU_SLIDE_PROMPTS, generateImagePrompt } from '@/lib/system-prompts/hubedu-interactive';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { theme, slideNumber } = await request.json();

    if (!theme || !slideNumber) {
      return NextResponse.json(
        { success: false, error: 'Theme e slideNumber são obrigatórios' },
        { status: 400 }
      );
    }

    if (slideNumber < 1 || slideNumber > 8) {
      return NextResponse.json(
        { success: false, error: 'slideNumber deve estar entre 1 e 8' },
        { status: 400 }
      );
    }

    console.log(`🎓 Gerando slide ${slideNumber} para tema:`, theme);

    const slideConfig = HUBEDU_SLIDE_PROMPTS[slideNumber as keyof typeof HUBEDU_SLIDE_PROMPTS];
    if (!slideConfig) {
      return NextResponse.json(
        { success: false, error: 'Configuração de slide não encontrada' },
        { status: 400 }
      );
    }

    const isQuestionSlide = slideConfig.type === 'question';
    const isClosingSlide = slideConfig.type === 'closing';

    // Generate image prompt
    const imagePrompt = generateImagePrompt(theme, slideNumber, slideConfig.type);

    let systemPrompt = '';
    let userPrompt = '';

    if (isQuestionSlide) {
      systemPrompt = `Você é um professor especializado em criar perguntas educativas sobre ${theme}.

Crie uma pergunta de múltipla escolha ÚNICA com 4 opções (A, B, C, D) seguindo esta estrutura:
- Pergunta contextualizada e desafiadora específica para o slide ${slideNumber}
- 4 opções de resposta bem elaboradas e únicas
- Uma resposta correta bem fundamentada
- Pergunta deve testar conhecimentos apresentados nos slides anteriores
- Foque em aspectos específicos do slide ${slideNumber}
- Contexto: ${slideConfig.context}

Responda APENAS com JSON válido:
{
  "slide": ${slideNumber},
  "title": "Título da Pergunta",
  "type": "question",
  "content": "Texto da pergunta detalhada e contextualizada",
  "options": ["A) Opção A", "B) Opção B", "C) Opção C", "D) Opção D"],
  "answer": "A",
  "image_prompt": "${imagePrompt}"
}`;

      userPrompt = `Crie uma pergunta ÚNICA sobre ${theme} para o slide ${slideNumber} (contexto: ${slideConfig.context}). Esta pergunta deve ser específica para este momento da aula e testar conhecimentos específicos do slide ${slideNumber}. A pergunta deve ter nível de dificuldade apropriado para o progresso da aula.`;

    } else if (isClosingSlide) {
      systemPrompt = `Você é um professor especializado em criar resumos e conclusões educativas sobre ${theme}.

Crie um slide de conclusão seguindo esta estrutura:
- Resumo abrangente do conteúdo estudado
- Conclusões importantes e aplicações práticas
- Recomendações para continuar aprendendo
- Dica final motivacional
- Contexto: ${slideConfig.context}

Responda APENAS com JSON válido:
{
  "slide": ${slideNumber},
  "title": "Título do Encerramento",
  "type": "closing",
  "content": "Resumo detalhado dos principais pontos aprendidos e dica final",
  "image_prompt": "${imagePrompt}"
}`;

      userPrompt = `Crie um slide de conclusão ÚNICO para ${theme}. Este é o slide final da aula e deve resumir todo o conteúdo estudado de forma específica e não repetitiva. Inclua uma dica final motivacional para continuar o aprendizado.`;

    } else {
      // Explanation slides
      systemPrompt = `Você é um professor especializado em criar conteúdo educativo sobre ${theme}.

Crie um slide explicativo seguindo esta estrutura:
- Conteúdo principal claro e educativo específico para o slide ${slideNumber}
- Informações complementares e aplicações práticas únicas
- Máximo 120 palavras de conteúdo bem estruturado
- Incluir exemplos práticos únicos e explicações claras específicas
- Usar linguagem didática e envolvente
- NÃO repetir conteúdo de slides anteriores
- Focar em aspectos específicos do slide ${slideNumber}
- Contexto: ${slideConfig.context}

Responda APENAS com JSON válido:
{
  "slide": ${slideNumber},
  "title": "Título do Slide",
  "type": "explanation",
  "content": "Conteúdo claro e educativo (máximo 120 palavras)",
  "image_prompt": "${imagePrompt}"
}`;

      userPrompt = `Crie um slide explicativo ÚNICO sobre ${theme} para o slide ${slideNumber} (contexto: ${slideConfig.context}). O conteúdo deve ser específico para este momento da aula, educativo, claro (máximo 120 palavras) e NÃO repetir conteúdo de slides anteriores. Inclua exemplos práticos únicos e explicações concisas específicas para o slide ${slideNumber}.`;
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
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Clean possible markdown formatting
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to parse JSON
    let slide;
    try {
      slide = JSON.parse(cleanedResponse);
      console.log(`✅ Slide ${slideNumber} gerado com sucesso`);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      
      // Fallback para slide básico
      slide = {
        slide: slideNumber,
        title: isQuestionSlide ? 'Pergunta' : isClosingSlide ? 'Conclusão' : 'Conteúdo Principal',
        type: slideConfig.type,
        content: isQuestionSlide 
          ? `Agora vamos testar nosso entendimento com uma pergunta prática sobre ${theme}. Esta pergunta foi elaborada para avaliar nossa compreensão dos conceitos estudados.`
          : isClosingSlide
          ? `Parabéns! Você completou a aula sobre ${theme}. Continue praticando e explorando este tema fascinante!`
          : `Vamos explorar os aspectos fundamentais de ${theme} neste slide ${slideNumber}. Este conteúdo foi elaborado para proporcionar uma compreensão sólida dos conceitos estudados.`,
        ...(isQuestionSlide && {
          options: ['A) Conceito fundamental', 'B) Aplicação prática', 'C) Exemplo específico', 'D) Definição técnica'],
          answer: 'A'
        }),
        image_prompt: imagePrompt
      };
    }

    return NextResponse.json({
      success: true,
      slide: slide
    });

  } catch (error: any) {
    console.error('❌ Erro na API hubedu-slide:', error);
    
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
