import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { log } from '@/lib/lesson-logger';
import { prisma } from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Gera apenas os 2 primeiros slides para carregamento progressivo
 * @param {string} topic - Tópico da aula
 * @returns {Object} - Slides iniciais
 */
function getInitialSlidesPrompt(topic, systemPrompt = '') {
  return `Crie apenas os 2 primeiros slides de uma aula sobre "${topic}" em JSON válido.

ESTRUTURA DOS PRIMEIROS SLIDES:
1. Abertura: Tema e Objetivos (content)
2. Conceitos Fundamentais (content)

FORMATO JSON:
{
  "slides": [
    {
      "number": 1,
      "title": "Abertura: Tema e Objetivos",
      "content": "Conteúdo educativo detalhado com \\n\\n para parágrafos",
      "type": "content",
      "imageQuery": "query específica para imagem",
      "tokenEstimate": 500
    },
    {
      "number": 2,
      "title": "Conceitos Fundamentais",
      "content": "Conteúdo educativo detalhado sem imagem",
      "type": "content",
      "imageQuery": null,
      "tokenEstimate": 500
    }
  ]
}

REGRAS:
- Responda APENAS com JSON válido
- Conteúdo educativo direto em português brasileiro
- Mínimo 500 tokens por slide
- Apenas slide 1 tem imageQuery
- Use \\n\\n para quebras de linha

Tópico: ${topic}
${systemPrompt ? `[CUSTOM: ${systemPrompt}]` : ''}

JSON:`;
}

/**
 * Parseia conteúdo gerado pela IA em slides estruturados
 * @param {string} content - Conteúdo retornado pela IA
 * @returns {Object} - Objeto com slides estruturados
 */
function parseGeneratedContent(content) {
  try {
    // Tentar parsear como JSON primeiro
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      if (parsed.slides && Array.isArray(parsed.slides)) {
        return parsed;
      }
    }
    
    // Se não for JSON válido, tentar extrair JSON do texto
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.slides && Array.isArray(parsed.slides)) {
        return parsed;
      }
    }
    
    // Fallback: criar estrutura básica
    console.warn('Não foi possível parsear o conteúdo da IA, usando fallback');
    return {
      slides: [
        {
          number: 1,
          title: "Abertura: Tema e Objetivos",
          content: `Conteúdo do slide 1 sobre ${topic}`,
          type: "content",
          imageQuery: `educational ${topic} illustration`,
          tokenEstimate: 500
        },
        {
          number: 2,
          title: "Conceitos Fundamentais",
          content: `Conteúdo do slide 2 sobre ${topic}`,
          type: "content",
          imageQuery: null,
          tokenEstimate: 500
        }
      ]
    };
  } catch (error) {
    console.error('Erro ao parsear conteúdo da IA:', error);
    throw new Error('Erro ao processar resposta da IA');
  }
}

export async function POST(request) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { topic, schoolId, customPrompt, lessonId } = await request.json();
    
    const baseContext = {
      requestId,
      topic,
      schoolId,
      timestamp: new Date().toISOString()
    };
    
    log.info('🎓 Gerando slides iniciais', baseContext, {
      topic,
      schoolId: schoolId || 'N/A',
      hasCustomPrompt: !!customPrompt
    });
    
    if (!topic) {
      log.validationError('topic', topic, 'string não vazia', baseContext);
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 });
    }
    
    const systemPrompt = customPrompt || 'Gere conteúdo educacional detalhado em PT-BR.';
    const generationPrompt = getInitialSlidesPrompt(topic, systemPrompt);
    
    log.info('📋 Prompt preparado para slides iniciais', baseContext, {
      promptLength: generationPrompt.length,
      estimatedTokens: Math.ceil(generationPrompt.length / 4)
    });
    
    const openaiTimer = log.timeStart('openai-generation-initial', baseContext);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: generationPrompt }],
      max_tokens: 1500, // Reduzido para apenas 2 slides
      temperature: 0.7,
      stream: false
    });
    
    const openaiDuration = Math.round((Date.now() - Date.now()) / 1000);
    log.timeEnd(openaiTimer, 'openai-generation-initial', baseContext);
    
    log.success('✅ Slides iniciais gerados', baseContext, {
      duration: openaiDuration,
      usage: response.usage,
      responseLength: response.choices[0]?.message?.content?.length || 0
    });
    
    const content = response.choices[0]?.message?.content || '{}';
    const generatedContent = parseGeneratedContent(content);
    
    // Adicionar imagens apenas para o primeiro slide
    const slidesWithImages = await Promise.all(generatedContent.slides.map(async (slide, index) => {
      if (slide.number === 1 && slide.imageQuery) {
        try {
          const classifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images/classify-source`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: slide.imageQuery,
              subject: topic,
              slideNumber: slide.number,
              slideType: slide.type
            }),
          });
          
          if (classifyResponse.ok) {
            const imageData = await classifyResponse.json();
            if (imageData.success && imageData.imageUrl) {
              return {
                ...slide,
                imageUrl: imageData.imageUrl,
                imageSource: imageData.source || 'unsplash'
              };
            }
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao carregar imagem para slide ${slide.number}:`, error);
        }
      }
      
      return {
        ...slide,
        imageUrl: slide.number === 1 ? `https://picsum.photos/800/400?random=${slide.number}` : null,
        imageSource: slide.number === 1 ? 'placeholder' : null
      };
    }));
    
    // Update lesson in database with initial slides if lessonId is provided
    if (lessonId) {
      try {
        console.log('💾 Updating lesson with initial slides:', lessonId);
        
        // Convert slides to the format expected by the database
        const updatedCards = slidesWithImages.map(slide => ({
          type: slide.type || 'content',
          title: slide.title,
          content: slide.content,
          prompt: '',
          questions: slide.questions || [],
          time: 5,
          points: slide.points || 0,
          imageUrl: slide.imageUrl,
          imageSource: slide.imageSource
        }));
        
        await prisma.lessons.update({
          where: { id: lessonId },
          data: {
            cards: updatedCards,
            updated_at: new Date()
          }
        });
        
        console.log('✅ Lesson updated with initial slides:', lessonId);
        
        log.success('💾 Slides iniciais salvos no banco', baseContext, {
          lessonId,
          slidesCount: slidesWithImages.length
        });
        
      } catch (dbError) {
        console.error('❌ Error updating lesson with initial slides:', dbError);
        log.error('❌ Erro ao atualizar aula com slides iniciais', baseContext, {
          error: dbError.message,
          lessonId
        });
        // Continue even if database update fails
      }
    }
    
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    
    log.success('📊 Slides iniciais processados', baseContext, {
      totalDuration,
      slidesCount: slidesWithImages.length,
      usage: response.usage
    });
    
    return NextResponse.json({
      success: true,
      slides: slidesWithImages,
      topic,
      lessonId,
      metadata: {
        duration: totalDuration,
        slidesGenerated: slidesWithImages.length,
        usage: response.usage
      }
    });
    
  } catch (error) {
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    console.error(`❌ [${totalDuration}s] Erro na geração dos slides iniciais:`, error);
    
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