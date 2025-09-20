// app/api/aulas/progressive-gemini/route.js
// Sistema de carregamento progressivo usando Gemini com Vercel AI SDK

import { NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { generateText } from 'ai';


import { google } from '@ai-sdk/google';


import { log } from '@/lib/lesson-logger';


import { prisma } from '@/lib/db';



// Initialize Gemini client via Vercel AI SDK
const geminiModel = google('gemini-2.0-flash-exp', {
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Gera estrutura básica da aula (esqueleto) para carregamento progressivo
 * @param {string} topic - Tópico da aula
 * @returns {Object} - Estrutura da aula
 */
function generateLessonSkeleton(topic) {
  return {
    id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: topic,
    subject: topic,
    level: 'Intermediário',
    objectives: [
      `Compreender os conceitos fundamentais sobre ${topic}`,
      `Aplicar conhecimentos através de atividades práticas`,
      `Desenvolver pensamento crítico sobre o tema`,
      `Conectar o aprendizado com situações do cotidiano`
    ],
    stages: Array.from({ length: 14 }, (_, index) => {
      const slideNumber = index + 1;
      let title, type, component;
      
      switch (slideNumber) {
        case 1:
          title = "Abertura: Tema e Objetivos";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 2:
          title = "Conceitos Fundamentais";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 3:
          title = "Desenvolvimento dos Processos";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 4:
          title = "Aplicações Práticas";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 5:
          title = "Variações e Adaptações";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 6:
          title = "Conexões Avançadas";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 7:
          title = "Quiz: Conceitos Básicos";
          type = "Avaliação";
          component = "QuizComponent";
          break;
        case 8:
          title = "Aprofundamento";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 9:
          title = "Exemplos Práticos";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 10:
          title = "Análise Crítica";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 11:
          title = "Síntese Intermediária";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 12:
          title = "Quiz: Análise Situacional";
          type = "Avaliação";
          component = "QuizComponent";
          break;
        case 13:
          title = "Aplicações Futuras";
          type = "Conteúdo";
          component = "AnimationSlide";
          break;
        case 14:
          title = "Encerramento: Síntese Final";
          type = "Encerramento";
          component = "AnimationSlide";
          break;
        default:
          title = `Slide ${slideNumber}`;
          type = "Conteúdo";
          component = "AnimationSlide";
      }
      
      return {
        etapa: title,
        type: type,
        activity: {
          component: component,
          content: `Carregando conteúdo do slide ${slideNumber}...`,
          imageUrl: null,
          imagePrompt: null
        },
        route: `/${type.toLowerCase()}`,
        estimatedTime: type === "Avaliação" ? 10 : 5,
        loading: true // Indica que o conteúdo ainda está sendo carregado
      };
    }),
    metadata: {
      subject: topic,
      grade: 'Ensino Médio',
      duration: '45-60 minutos',
      difficulty: 'Intermediário',
      tags: [topic.toLowerCase()],
      status: 'loading', // Indica que a aula está sendo carregada progressivamente
      provider: 'gemini'
    }
  };
}

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
- Use \n para quebras de linha entre parágrafos (formato markdown)
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
      "content": "Conteúdo educativo detalhado com quebras de linha usando \n para parágrafos\n\nExemplo de segundo parágrafo com mais informações detalhadas.\n\nTerceiro parágrafo com exemplos práticos e aplicações reais.",
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
- Use \n para separar parágrafos no conteúdo (formato markdown)
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
      maxTokens: 2000,
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
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { topic, schoolId, action = 'skeleton' } = await request.json();
    
    const baseContext = {
      requestId,
      topic,
      schoolId,
      timestamp: new Date().toISOString()
    };
    
    log.info('🎓 Iniciando carregamento progressivo com Gemini', baseContext, {
      topic,
      schoolId: schoolId || 'N/A',
      action
    });
    
    if (!topic) {
      log.validationError('topic', topic, 'string não vazia', baseContext);
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 });
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      log.error('Gemini API key not configured', baseContext);
      return NextResponse.json({ 
        error: 'Gemini API key not configured' 
      }, { status: 500 });
    }
    
    if (action === 'skeleton') {
      // Generate skeleton
      const skeleton = generateLessonSkeleton(topic);
      
      // Save lesson skeleton to database
      try {
        console.log('💾 Saving lesson skeleton to database:', skeleton.id);
        
        const savedLesson = await prisma.lessons.create({
          data: {
            id: skeleton.id,
            title: skeleton.title,
            subject: skeleton.subject,
            level: skeleton.level,
            objective: skeleton.objectives?.join(', ') || '',
            outline: skeleton.stages.map(stage => ({
              etapa: stage.etapa,
              type: stage.type,
              route: stage.route,
              loading: stage.loading
            })),
            cards: skeleton.stages.map(stage => ({
              type: stage.type,
              title: stage.etapa,
              content: stage.activity?.content || '',
              prompt: stage.activity?.prompt || '',
              questions: stage.activity?.questions || [],
              time: stage.activity?.time || 5,
              points: stage.activity?.points || 0
            })),
            user_id: null // Demo lesson
          }
        });
        
        console.log('✅ Lesson skeleton saved successfully:', savedLesson.id);
        
        log.success('💾 Esqueleto da aula salvo no banco', baseContext, {
          lessonId: savedLesson.id,
          stagesCount: skeleton.stages.length,
          topic: skeleton.title
        });
        
      } catch (dbError) {
        console.error('❌ Error saving lesson skeleton to database:', dbError);
        log.error('❌ Erro ao salvar esqueleto no banco', baseContext, {
          error: dbError.message,
          lessonId: skeleton.id
        });
        // Continue even if database save fails
      }
      
      const totalDuration = Math.round((Date.now() - startTime) / 1000);
      
      log.success('📊 Esqueleto da aula gerado', baseContext, {
        totalDuration,
        stagesCount: skeleton.stages.length,
        topic: skeleton.title
      });
      
      return NextResponse.json({
        success: true,
        lessonId: skeleton.id,
        skeleton: skeleton,
        topic,
        provider: 'gemini',
        metadata: {
          duration: totalDuration,
          stagesGenerated: skeleton.stages.length,
          status: 'skeleton_ready'
        }
      });

    } else if (action === 'initial-slides') {
      // Generate initial slides
      const slides = await generateInitialSlidesWithGemini(topic);
      
      const totalDuration = Math.round((Date.now() - startTime) / 1000);
      
      log.success('📊 Slides iniciais gerados com Gemini', baseContext, {
        totalDuration,
        slidesCount: slides.length,
        topic
      });
      
      return NextResponse.json({
        success: true,
        slides,
        topic,
        provider: 'gemini',
        message: 'Slides iniciais gerados com sucesso usando Gemini',
        metadata: {
          duration: totalDuration,
          slidesGenerated: slides.length,
          status: 'initial_slides_ready'
        }
      });
    }
    
    return NextResponse.json({ 
      error: 'Ação inválida. Use "skeleton" ou "initial-slides"' 
    }, { status: 400 });
    
  } catch (error) {
    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    console.error(`❌ [${totalDuration}s] Erro no carregamento progressivo com Gemini:`, error);
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
