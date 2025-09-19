// app/api/aulas/next-slide/route.js
// Endpoint para carregar próximo slide sob demanda

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { randomizeQuizQuestions } from '@/lib/quiz-randomization';
import { ensureQuizFormat } from '@/lib/quiz-validation';
import { logTokens } from '@/lib/token-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Gera o próximo slide da aula baseado no número e contexto
 * @param {string} topic - Tópico da aula
 * @param {number} slideNumber - Número do slide a ser gerado
 * @param {Array} previousSlides - Slides anteriores para contexto
 * @returns {Object} Slide gerado
 */
async function generateNextSlide(topic, slideNumber, previousSlides = []) {
  const slideTitles = {
    1: 'Abertura: Tema e Objetivos',
    2: 'Conceitos Fundamentais',
    3: 'Desenvolvimento dos Processos',
    4: 'Aplicações Práticas',
    5: 'Variações e Adaptações',
    6: 'Conexões Avançadas',
    7: 'Quiz: Conceitos Básicos',
    8: 'Aprofundamento',
    9: 'Exemplos Práticos',
    10: 'Análise Crítica',
    11: 'Síntese Intermediária',
    12: 'Quiz: Análise Situacional',
    13: 'Aplicações Futuras',
    14: 'Encerramento: Síntese Final'
  };

  const slideType = slideNumber === 7 || slideNumber === 12 ? 'quiz' : 'content';
  const slideTitle = slideTitles[slideNumber];

  let prompt = `Você é um professor especialista em ${topic}. Crie apenas o slide ${slideNumber} de uma aula estruturada.

REGRAS IMPORTANTES:
- Responda APENAS com JSON válido, sem texto adicional
- Cada slide deve ter conteúdo educativo direto e objetivo
- Use linguagem clara e didática em português brasileiro
- Use \\n\\n para quebras de linha entre parágrafos no conteúdo dos slides
- CADA SLIDE DEVE TER MÍNIMO 500 TOKENS DE CONTEÚDO

SLIDE A SER GERADO:
${slideNumber}. ${slideTitle} (${slideType === 'quiz' ? 'Avaliação, 0 pontos' : 'Conteúdo'})`;

  if (previousSlides.length > 0) {
    prompt += `\n\nCONTEXTO DOS SLIDES ANTERIORES:`;
    previousSlides.forEach((slide, index) => {
      // Filtrar conteúdo para remover alternativas de questões
      let filteredContent = slide.content;
      
      // Se for um slide de quiz, extrair apenas o título e contexto, não as alternativas
      if (slide.type === 'quiz' && slide.questions) {
        // Criar um resumo do quiz sem as alternativas
        const questionCount = slide.questions.length;
        filteredContent = `Quiz com ${questionCount} questão${questionCount > 1 ? 'ões' : ''} sobre ${slide.title.toLowerCase()}`;
      } else {
        // Para slides de conteúdo, usar apenas os primeiros 200 caracteres
        filteredContent = slide.content.substring(0, 200);
      }
      
      prompt += `\n${index + 1}. ${slide.title}: ${filteredContent}...`;
    });
  }

  if (slideType === 'quiz') {
    prompt += `\n\nFORMATO JSON PARA SLIDE DE QUIZ:
{
  "number": ${slideNumber},
  "title": "${slideTitle}",
  "content": "Conteúdo educativo detalhado do quiz",
  "type": "quiz",
  "imageQuery": null,
  "tokenEstimate": 500,
  "points": 0,
  "questions": [
    {
      "q": "Pergunta clara e objetiva?",
      "options": ["A) Alternativa A detalhada", "B) Alternativa B detalhada", "C) Alternativa C detalhada", "D) Alternativa D detalhada"],
      "correct": 0,
      "explanation": "Explicação detalhada da resposta correta"
    }
  ]
}`;
  } else {
    const hasImage = slideNumber === 1 || slideNumber === 14;
    prompt += `\n\nFORMATO JSON PARA SLIDE DE CONTEÚDO:
{
  "number": ${slideNumber},
  "title": "${slideTitle}",
  "content": "Conteúdo educativo detalhado com quebras de linha usando \\n\\n para parágrafos\\n\\nExemplo de segundo parágrafo com mais informações detalhadas.\\n\\nTerceiro parágrafo com exemplos práticos e aplicações reais.",
  "type": "content",
  "imageQuery": ${hasImage ? '"eletricidade corrente introdução conceito"' : 'null'},
  "tokenEstimate": 500
}`;
  }

  prompt += `\n\nIMPORTANTE: 
- O campo "content" deve conter APENAS conteúdo educativo
- Use \\n\\n para separar parágrafos no conteúdo
- NÃO inclua instruções como "imagine uma tabela" ou "crie um gráfico"
- Use linguagem direta e objetiva
- Foque em explicações claras e exemplos práticos
- CADA SLIDE DEVE TER MÍNIMO 500 TOKENS DE CONTEÚDO
- Para quiz, INCLUA o campo "correct" como índice 0, 1, 2 ou 3 indicando a alternativa correta; "options" deve conter exatamente 4 strings
- Para imageQuery: use termos específicos do tema sem palavras genéricas como "education", "classroom", "learning"
- TODOS os textos devem estar em PORTUGUÊS BRASILEIRO
- Responda APENAS com JSON válido. Não inclua formatação markdown, blocos de código ou texto adicional.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Crie o slide ${slideNumber} para uma aula sobre: ${topic}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return parsedContent;
  } catch (error) {
    console.error('Erro ao gerar próximo slide:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { topic, slideNumber, previousSlides = [] } = await request.json();
    const session = await getServerSession(authOptions).catch(() => null);

    if (!topic || !slideNumber) {
      return NextResponse.json({ 
        error: 'Tópico e número do slide são obrigatórios' 
      }, { status: 400 });
    }

    if (slideNumber < 1 || slideNumber > 14) {
      return NextResponse.json({ 
        error: 'Número do slide deve estar entre 1 e 14' 
      }, { status: 400 });
    }

    const slide = await generateNextSlide(topic, slideNumber, previousSlides);
    
    // Normalize and randomize quiz questions if this is a quiz slide
    if (slide.type === 'quiz' && slide.questions) {
      try {
        const normalized = ensureQuizFormat(slide.questions);
        slide.questions = randomizeQuizQuestions(normalized);
        console.log(`🎲 Quiz questions randomized for slide ${slideNumber}`);
      } catch (error) {
        console.warn(`⚠️ Failed to randomize quiz questions for slide ${slideNumber}:`, error.message);
      }
    }

    try {
      // Estimate tokens by content length when using this endpoint
      const content = typeof slide?.content === 'string' ? slide.content : JSON.stringify(slide || {});
      const estimatedTokens = Math.ceil((content?.length || 0) / 4);
      const userId = session?.user?.id;
      if (userId && estimatedTokens > 0) {
        logTokens({
          userId,
          moduleGroup: 'Aulas',
          model: 'gpt-4o-mini',
          totalTokens: estimatedTokens,
          subject: topic,
          messages: { slideNumber }
        });
      }
    } catch (e) {
      console.warn('⚠️ [AULAS/NEXT-SLIDE] Failed to log tokens:', e);
    }

    return NextResponse.json({
      success: true,
      slide,
      message: `Slide ${slideNumber} gerado com sucesso`
    });

  } catch (error) {
    console.error('Erro ao gerar próximo slide:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}
