// app/api/aulas/initial-slides-gemini/route.js
// Endpoint para gerar os 2 primeiros slides da aula usando Gemini com Vercel AI SDK

import { NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { generateText } from 'ai';


import { google } from '@ai-sdk/google';


import { log } from '@/lib/lesson-logger';



// Initialize Gemini client via Vercel AI SDK
const geminiModel = google('gemini-1.5-flash', {
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Gera os 2 primeiros slides da aula usando Gemini
 * @param {string} topic - Tópico da aula
 * @returns {Array} Array com os 2 primeiros slides
 */
async function generateInitialSlidesWithGemini(topic) {
  const prompt = `Você é um professor especialista em ${topic}. Crie apenas os 2 primeiros slides de uma aula estruturada usando Google Gemini.

REGRAS CRÍTICAS:
- Responda APENAS com JSON válido, sem texto adicional, markdown ou formatação
- Cada slide deve ter conteúdo educativo direto e objetivo
- Use linguagem clara e didática em português brasileiro
- OBRIGATÓRIO: Use \n para quebras de linha entre parágrafos (formato markdown)
- OBRIGATÓRIO: Cada parágrafo deve ser separado por \n para melhor legibilidade
- CADA SLIDE DEVE TER MÍNIMO 500 TOKENS DE CONTEÚDO
- Para imageQuery, use termos específicos do tema traduzidos para inglês

ESTRUTURA DOS 2 PRIMEIROS SLIDES:
1. Abertura: Tema e Objetivos (Conteúdo)
2. Conceitos Fundamentais (Conteúdo)

FORMATO JSON OBRIGATÓRIO:
{
  "slides": [
    {
      "number": 1,
      "title": "Abertura: Tema e Objetivos",
      "content": "Conteúdo educativo detalhado com quebras de linha usando \n para parágrafos\n\nExemplo de segundo parágrafo com mais informações detalhadas.\n\nTerceiro parágrafo com exemplos práticos e aplicações reais.\n\nCada seção deve ser claramente separada para facilitar a compreensão.",
      "type": "content",
      "imageQuery": "electricity current introduction concept",
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
- OBRIGATÓRIO: Use \n para separar parágrafos no conteúdo (formato markdown)
- OBRIGATÓRIO: Cada parágrafo deve ser separado por \n para melhor legibilidade
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
    const response = await generateText({
      model: geminiModel,
      prompt: prompt,
      maxTokens: 4000,
      temperature: 0.7,
    });
    
    const content = response.text;
    
    // Clean the content to extract JSON
    let cleanContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }
    
    const parsedContent = JSON.parse(cleanContent);
    
    return parsedContent.slides;
  } catch (error) {
    console.error('Erro ao gerar slides iniciais com Gemini:', error);
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

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured' 
      }, { status: 500 });
    }

    const slides = await generateInitialSlidesWithGemini(topic);

    return NextResponse.json({
      success: true,
      slides,
      message: 'Slides iniciais gerados com sucesso usando Gemini',
      provider: 'gemini'
    });

  } catch (error) {
    console.error('Erro ao gerar slides iniciais com Gemini:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}
