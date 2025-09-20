import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';


import { HUBEDU_SLIDE_PROMPTS, generateImagePrompt } from '@/lib/system-prompts/hubedu-interactive';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();

    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Theme é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🎓 Gerando slides iniciais (1 e 2) para tema:`, theme);

    // Generate both slides 1 and 2 in parallel
    const slide1Config = HUBEDU_SLIDE_PROMPTS[1];
    const slide2Config = HUBEDU_SLIDE_PROMPTS[2];

    const imagePrompt1 = generateImagePrompt(theme, 1, slide1Config.type);
    const imagePrompt2 = generateImagePrompt(theme, 2, slide2Config.type);

    const systemPrompt = `Você é um professor especializado em criar conteúdo educativo sobre ${theme}.

Crie slides explicativos seguindo esta estrutura:
- Conteúdo principal claro e educativo específico para cada slide
- Máximo 120 palavras de conteúdo bem estruturado por slide
- Incluir exemplos práticos únicos e explicações claras específicas
- Usar linguagem didática e envolvente
- Cada slide deve ser autônomo e focado em seu contexto específico

Responda APENAS com JSON válido contendo ambos os slides:
{
  "slide1": {
    "slide": 1,
    "title": "Título do Slide 1",
    "type": "explanation",
    "content": "Conteúdo do slide 1 (máximo 120 palavras)",
    "image_prompt": "${imagePrompt1}"
  },
  "slide2": {
    "slide": 2,
    "title": "Título do Slide 2", 
    "type": "explanation",
    "content": "Conteúdo do slide 2 (máximo 120 palavras)",
    "image_prompt": "${imagePrompt2}"
  }
}`;

    const userPrompt = `Crie os slides 1 e 2 sobre ${theme}:

Slide 1 (${slide1Config.context}): Apresente o conceito de forma clara e motivadora, explicando o que é e por que é importante. Use exemplos simples e contextualizados.

Slide 2 (${slide2Config.context}): Aprofunde o conceito apresentado no slide 1 com um exemplo prático detalhado. Mostre como o conceito funciona na prática.

Cada slide deve ser autônomo, educativo, claro (máximo 120 palavras) e não repetir conteúdo entre eles.`;

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
      max_tokens: 1500,
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
    let slides;
    try {
      slides = JSON.parse(cleanedResponse);
      console.log(`✅ Slides 1 e 2 gerados com sucesso`);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      
      // Fallback para slides básicos
      slides = {
        slide1: {
          slide: 1,
          title: `Introdução ao ${theme}`,
          type: 'explanation',
          content: `Vamos começar nossa jornada de aprendizado sobre ${theme}. Este conceito é fundamental e tem aplicações importantes em diversas áreas.`,
          image_prompt: imagePrompt1
        },
        slide2: {
          slide: 2,
          title: `Exemplo Prático de ${theme}`,
          type: 'explanation',
          content: `Agora vamos ver como ${theme} funciona na prática através de um exemplo concreto que ilustra seus princípios fundamentais.`,
          image_prompt: imagePrompt2
        }
      };
    }

    return NextResponse.json({
      success: true,
      slides: slides
    });

  } catch (error: any) {
    console.error('❌ Erro na API hubedu-initial:', error);
    
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
