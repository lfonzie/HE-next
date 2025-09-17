import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { log } from '@/lib/lesson-logger';
import { prisma } from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Gera um slide específico para carregamento sob demanda
 * @param {string} topic - Tópico da aula
 * @param {number} slideNumber - Número do slide
 * @param {string} systemPrompt - Prompt customizado
 * @returns {Object} - Slide gerado
 */
function getNextSlidePrompt(topic, slideNumber, systemPrompt = '') {
  const slideTitles = {
    1: "Abertura: Tema e Objetivos",
    2: "Conceitos Fundamentais",
    3: "Desenvolvimento dos Processos",
    4: "Aplicações Práticas",
    5: "Variações e Adaptações",
    6: "Conexões Avançadas",
    7: "Quiz: Conceitos Básicos",
    8: "Aprofundamento",
    9: "Exemplos Práticos",
    10: "Análise Crítica",
    11: "Síntese Intermediária",
    12: "Quiz: Análise Situacional",
    13: "Aplicações Futuras",
    14: "Encerramento: Síntese Final"
  };
  
  const slideType = slideNumber === 7 || slideNumber === 12 ? 'quiz' : 
                   slideNumber === 14 ? 'closing' : 'content';
  
  const title = slideTitles[slideNumber] || `Slide ${slideNumber}`;
  
  if (slideType === 'quiz') {
    return `Crie apenas o slide ${slideNumber} de uma aula sobre "${topic}" em JSON válido.

SLIDE: ${title}
TIPO: Quiz

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional, markdown ou explicações.

FORMATO JSON:
{
  "number": ${slideNumber},
  "title": "${title}",
  "content": "Conteúdo educativo do quiz",
  "type": "quiz",
  "imageQuery": null,
  "tokenEstimate": 500,
  "points": 0,
  "questions": [
    {
      "q": "Pergunta clara sobre ${topic}?",
      "options": ["A) Alternativa A", "B) Alternativa B", "C) Alternativa C", "D) Alternativa D"],
      "correct": "A",
      "explanation": "Explicação da resposta correta"
    }
  ]
}

REGRAS OBRIGATÓRIAS:
- Responda APENAS com JSON válido
- NÃO inclua texto antes ou depois do JSON
- NÃO use markdown ou code blocks
- Conteúdo educativo direto em português brasileiro
- Mínimo 500 tokens
- Quiz: "correct" deve ser A, B, C ou D
- Use \\n\\n para quebras de linha
- Escape aspas duplas dentro de strings com \\"

Tópico: ${topic}
${systemPrompt ? `[CUSTOM: ${systemPrompt}]` : ''}

JSON:`;
  } else {
    return `Crie apenas o slide ${slideNumber} de uma aula sobre "${topic}" em JSON válido.

SLIDE: ${title}
TIPO: ${slideType}

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional, markdown ou explicações.

FORMATO JSON:
{
  "number": ${slideNumber},
  "title": "${title}",
  "content": "Conteúdo educativo detalhado com \\n\\n para parágrafos",
  "type": "${slideType}",
  "imageQuery": ${slideNumber === 1 || slideNumber === 7 || slideNumber === 14 ? '"query específica para imagem"' : 'null'},
  "tokenEstimate": 500
}

REGRAS OBRIGATÓRIAS:
- Responda APENAS com JSON válido
- NÃO inclua texto antes ou depois do JSON
- NÃO use markdown ou code blocks
- Conteúdo educativo direto em português brasileiro
- Mínimo 500 tokens
- Apenas slides 1, 7 e 14 têm imageQuery
- Use \\n\\n para quebras de linha
- Escape aspas duplas dentro de strings com \\"

Tópico: ${topic}
${systemPrompt ? `[CUSTOM: ${systemPrompt}]` : ''}

JSON:`;
  }
}

/**
 * Parseia conteúdo gerado pela IA em slide estruturado
 * @param {string} content - Conteúdo retornado pela IA
 * @returns {Object} - Slide estruturado
 */
function parseGeneratedSlide(content) {
  try {
    console.log('[DEBUG] Raw AI response:', content);
    
    // Tentar parsear como JSON primeiro
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      if (parsed.number && parsed.title && parsed.content) {
        console.log('[DEBUG] Successfully parsed JSON directly');
        return parsed;
      }
    }
    
    // Se não for JSON válido, tentar extrair JSON do texto com melhor regex
    // Usar regex mais específico para capturar JSON válido
    const jsonMatch = content.match(/\{[\s\S]*?\}(?=\s*(?:\{|$|\n|$))/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.number && parsed.title && parsed.content) {
          console.log('[DEBUG] Successfully parsed JSON from regex match');
          return parsed;
        }
      } catch (parseError) {
        console.error('[DEBUG] JSON parse error from regex match:', parseError);
        console.error('[DEBUG] Matched content:', jsonMatch[0]);
      }
    }
    
    // Tentar encontrar múltiplos objetos JSON
    const jsonMatches = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
    if (jsonMatches) {
      for (const match of jsonMatches) {
        try {
          const parsed = JSON.parse(match);
          if (parsed.number && parsed.title && parsed.content) {
            console.log('[DEBUG] Successfully parsed JSON from multiple matches');
            return parsed;
          }
        } catch (parseError) {
          console.error('[DEBUG] JSON parse error from multiple matches:', parseError);
        }
      }
    }
    
    // Última tentativa: procurar por padrão mais específico
    const specificMatch = content.match(/\{\s*"number"\s*:\s*\d+[\s\S]*?\}/);
    if (specificMatch) {
      try {
        const parsed = JSON.parse(specificMatch[0]);
        if (parsed.number && parsed.title && parsed.content) {
          console.log('[DEBUG] Successfully parsed JSON from specific pattern');
          return parsed;
        }
      } catch (parseError) {
        console.error('[DEBUG] JSON parse error from specific pattern:', parseError);
      }
    }
    
    console.error('[ERROR] No valid JSON found in AI response');
    console.error('[DEBUG] Full content:', content);
    throw new Error('Formato JSON inválido');
  } catch (error) {
    console.error('Erro ao parsear slide da IA:', error);
    console.error('[DEBUG] AI response content:', content);
    throw new Error('Erro ao processar resposta da IA');
  }
}

export async function POST(request) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Add error handling for JSON parsing
    let requestBody;
    try {
      const requestText = await request.text();
      console.log('[DEBUG] Raw request body:', requestText);
      
      if (!requestText || requestText.trim() === '') {
        console.error('❌ Empty request body');
        return NextResponse.json({ 
          error: 'Empty request body',
          details: 'Request body is empty or null'
        }, { status: 400 });
      }
      
      requestBody = JSON.parse(requestText);
    } catch (jsonError) {
      console.error('❌ Invalid JSON in request body:', jsonError);
      console.error('[DEBUG] Request body that failed to parse:', await request.text());
      return NextResponse.json({ 
        error: 'Invalid JSON input',
        details: jsonError.message,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    const { topic, slideNumber, schoolId, customPrompt, lessonId } = requestBody;
    
    const baseContext = {
      requestId,
      topic,
      slideNumber,
      schoolId,
      timestamp: new Date().toISOString()
    };
    
    log.info('🎓 Gerando slide sob demanda', baseContext, {
      topic,
      slideNumber,
      schoolId: schoolId || 'N/A',
      hasCustomPrompt: !!customPrompt
    });
    
    // Validate required fields
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      log.validationError('topic', topic, 'string não vazia', baseContext);
      return NextResponse.json({ 
        error: 'Tópico é obrigatório',
        details: 'Topic must be a non-empty string'
      }, { status: 400 });
    }
    
    if (!slideNumber || typeof slideNumber !== 'number' || slideNumber < 1 || slideNumber > 14) {
      log.validationError('slideNumber', slideNumber, 'número entre 1 e 14', baseContext);
      return NextResponse.json({ 
        error: 'Número do slide deve estar entre 1 e 14',
        details: 'Slide number must be a number between 1 and 14'
      }, { status: 400 });
    }
    
    const systemPrompt = customPrompt || 'Gere conteúdo educacional detalhado em PT-BR.';
    const generationPrompt = getNextSlidePrompt(topic, slideNumber, systemPrompt);
    
    log.info('📋 Prompt preparado para slide', baseContext, {
      promptLength: generationPrompt.length,
      estimatedTokens: Math.ceil(generationPrompt.length / 4)
    });
    
    const openaiTimer = log.timeStart('openai-generation-slide', baseContext);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: generationPrompt }],
      max_tokens: 800, // Reduzido para um único slide
      temperature: 0.7,
      stream: false
    });
    
    const openaiDuration = Math.round((Date.now() - Date.now()) / 1000);
    log.timeEnd(openaiTimer, 'openai-generation-slide', baseContext);
    
    log.success('✅ Slide gerado', baseContext, {
      duration: openaiDuration,
      usage: response.usage,
      responseLength: response.choices[0]?.message?.content?.length || 0
    });
    
    const content = response.choices[0]?.message?.content || '{}';
    const generatedSlide = parseGeneratedSlide(content);
    
    // Adicionar imagem se necessário
    let slideWithImage = { ...generatedSlide };
    
    if (generatedSlide.imageQuery && (slideNumber === 1 || slideNumber === 7 || slideNumber === 14)) {
      try {
        const classifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/classify-source`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: generatedSlide.imageQuery,
            subject: topic,
            slideNumber: slideNumber,
            slideType: generatedSlide.type
          }),
        });
        
        if (classifyResponse.ok) {
          const imageData = await classifyResponse.json();
          if (imageData.success && imageData.imageUrl) {
            slideWithImage.imageUrl = imageData.imageUrl;
            slideWithImage.imageSource = imageData.source || 'unsplash';
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao carregar imagem para slide ${slideNumber}:`, error);
        slideWithImage.imageUrl = `https://picsum.photos/800/400?random=${slideNumber}`;
        slideWithImage.imageSource = 'placeholder';
      }
    } else {
      slideWithImage.imageUrl = null;
      slideWithImage.imageSource = null;
    }
    
    // Update lesson in database with the new slide if lessonId is provided
    if (lessonId) {
      try {
        console.log('💾 Updating lesson with new slide:', lessonId, 'slide:', slideNumber);
        
        // Get current lesson to update cards array
        const currentLesson = await prisma.lessons.findUnique({
          where: { id: lessonId },
          select: { cards: true }
        });
        
        if (currentLesson) {
          const updatedCards = [...(currentLesson.cards || [])];
          
          // Update or add the slide at the correct position
          const slideIndex = slideNumber - 1;
          if (slideIndex >= 0 && slideIndex < updatedCards.length) {
            updatedCards[slideIndex] = {
              type: slideWithImage.type || 'content',
              title: slideWithImage.title,
              content: slideWithImage.content,
              prompt: '',
              questions: slideWithImage.questions || [],
              time: 5,
              points: slideWithImage.points || 0,
              imageUrl: slideWithImage.imageUrl,
              imageSource: slideWithImage.imageSource
            };
          }
          
          await prisma.lessons.update({
            where: { id: lessonId },
            data: {
              cards: updatedCards,
              updated_at: new Date()
            }
          });
          
          console.log('✅ Lesson updated with new slide:', lessonId, 'slide:', slideNumber);
          
          log.success('💾 Slide salvo no banco', baseContext, {
            lessonId,
            slideNumber: slideWithImage.number
          });
        }
        
      } catch (dbError) {
        console.error('❌ Error updating lesson with new slide:', dbError);
        log.error('❌ Erro ao atualizar aula com novo slide', baseContext, {
          error: dbError.message,
          lessonId,
          slideNumber
        });
        // Continue even if database update fails
      }
    }
    
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    
    log.success('📊 Slide processado', baseContext, {
      totalDuration,
      slideNumber: slideWithImage.number,
      usage: response.usage
    });
    
    return NextResponse.json({
      success: true,
      slide: slideWithImage,
      topic,
      slideNumber,
      lessonId,
      metadata: {
        duration: totalDuration,
        usage: response.usage
      }
    });
    
  } catch (error) {
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    console.error(`❌ [${totalDuration}s] Erro na geração do slide:`, error);
    
    let friendlyError = 'Erro interno do servidor';
    let statusCode = 500;
    
    if (error.code === 'invalid_api_key' || error.message.includes('API key')) {
      friendlyError = 'Problema de configuração da IA';
      statusCode = 500;
    } else if (error.message.includes('rate limit')) {
      friendlyError = 'Limite de uso da IA excedido. Tente novamente em alguns minutos.';
      statusCode = 429;
    } else if (error.message.includes('Tópico é obrigatório')) {
      friendlyError = 'Por favor, forneça um tópico para a aula.';
      statusCode = 400;
    }
    
    return NextResponse.json({ 
      error: friendlyError,
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }
}