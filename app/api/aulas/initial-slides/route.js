// app/api/aulas/initial-slides/route.js
// Endpoint para gerar os 2 primeiros slides da aula

import { NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import OpenAI from 'openai';



const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Gera os 2 primeiros slides da aula
 * @param {string} topic - Tópico da aula
 * @returns {Array} Array com os 2 primeiros slides
 */
async function generateInitialSlides(topic) {
  const prompt = `Você é um professor especialista em ${topic}. Crie apenas os 2 primeiros slides de uma aula estruturada.

REGRAS IMPORTANTES:
- Responda APENAS com JSON válido, sem texto adicional
- Cada slide deve ter conteúdo educativo direto e objetivo
- Use linguagem clara e didática em português brasileiro
- Use \\n\\n para quebras de linha entre parágrafos no conteúdo dos slides
- CADA SLIDE DEVE TER MÍNIMO 500 TOKENS DE CONTEÚDO

ESTRUTURA DOS 2 PRIMEIROS SLIDES:
1. Abertura: Tema e Objetivos (Conteúdo)
2. Conceitos Fundamentais (Conteúdo)

FORMATO JSON OBRIGATÓRIO:
{
  "slides": [
    {
      "number": 1,
      "title": "Abertura: Tema e Objetivos",
      "content": "Conteúdo educativo detalhado com quebras de linha usando \\n\\n para parágrafos\\n\\nExemplo de segundo parágrafo com mais informações detalhadas.\\n\\nTerceiro parágrafo com exemplos práticos e aplicações reais.",
      "type": "content",
      "imageQuery": "eletricidade corrente introdução conceito",
      "tokenEstimate": 500
    },
    {
      "number": 2,
      "title": "Conceitos Fundamentais",
      "content": "Conteúdo educativo detalhado sem imagem.",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    }
  ]
}

IMPORTANTE: 
- O campo "content" deve conter APENAS conteúdo educativo
- Use \\n\\n para separar parágrafos no conteúdo
- NÃO inclua instruções como "imagine uma tabela" ou "crie um gráfico"
- Use linguagem direta e objetiva
- Foque em explicações claras e exemplos práticos
- CADA SLIDE DEVE TER MÍNIMO 500 TOKENS DE CONTEÚDO
- O campo "imageQuery" deve ser específico e relevante ao conteúdo do slide
- APENAS slide 1 deve ter imageQuery (slide 2 deve ter imageQuery: null)
- Para slide 1: use termos específicos do tema sem palavras genéricas
- TODOS os textos devem estar em PORTUGUÊS BRASILEIRO
- Responda APENAS com JSON válido. Não inclua formatação markdown, blocos de código ou texto adicional.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Crie os 2 primeiros slides para uma aula sobre: ${topic}` }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return parsedContent.slides;
  } catch (error) {
    console.error('Erro ao gerar slides iniciais:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 });
    }

    const slides = await generateInitialSlides(topic);

    return NextResponse.json({
      success: true,
      slides,
      message: 'Slides iniciais gerados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao gerar slides iniciais:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}
