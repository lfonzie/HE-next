// app/api/aulas/generate-with-gemini-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { geminiLessonImageService, LessonImageRequest } from '@/lib/gemini-lesson-image-service';
import { STRUCTURED_LESSON_PROMPT } from '@/lib/system-prompts/lessons-structured';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

// Configuração do sistema
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const MAX_TOKENS = 8000;
const TEMPERATURE = 0.7;

// Slides que devem ter imagens (conforme especificado)
const IMAGE_SLIDE_NUMBERS = [1, 3, 6, 8, 11, 14];

interface LessonGenerationRequest {
  topic: string;
  schoolId?: string;
  betaImagesEnabled?: boolean; // Controle manual do sistema beta
  customPrompt?: string;
}

interface LessonGenerationResponse {
  success: boolean;
  lesson?: {
    id: string;
    title: string;
    topic: string;
    subject: string;
    grade: number;
    objectives: string[];
    introduction: string;
    slides: Array<{
      slideNumber: number;
      type: string;
      title: string;
      content: string;
      imageUrl?: string;
      imagePrompt?: string;
      imageData?: string;
      imageMimeType?: string;
      generatedBy?: 'gemini' | 'fallback' | 'none';
      timeEstimate: number;
      questions?: any[];
    }>;
    summary: string;
    nextSteps: string[];
    metadata: {
      totalSlides: number;
      slidesWithImages: number;
      betaImagesEnabled: boolean;
      generationTime: number;
      timestamp: string;
    };
  };
  error?: string;
  betaStatus?: {
    enabled: boolean;
    model: string;
    totalGenerated: number;
    totalFailed: number;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    const body: LessonGenerationRequest = await request.json();
    const { topic, schoolId, betaImagesEnabled = true, customPrompt } = body;
    const session = await getServerSession(authOptions);

    // Verificar autenticação
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🎓 Iniciando geração de aula com Gemini: ${topic}`);
    console.log(`📊 Sistema beta de imagens: ${betaImagesEnabled ? 'ATIVADO' : 'DESATIVADO'}`);

    // Validar entrada
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Topic is required and must be a non-empty string' 
      }, { status: 400 });
    }

    // Configurar sistema beta de imagens
    geminiLessonImageService.setBetaEnabled(betaImagesEnabled);

    // Gerar conteúdo da aula usando Gemini
    const lessonContent = await generateLessonContent(topic, customPrompt);
    
    if (!lessonContent) {
      throw new Error('Failed to generate lesson content');
    }

    // Processar slides e adicionar imagens se sistema beta estiver ativo
    const processedSlides = await processSlidesWithImages(lessonContent.slides, topic, lessonContent.subject, lessonContent.grade);

    // Criar resposta estruturada em JSON
    const response: LessonGenerationResponse = {
      success: true,
      lesson: {
        id: `aula-gemini-${Date.now()}`,
        title: lessonContent.title,
        topic: topic,
        subject: lessonContent.subject,
        grade: lessonContent.grade,
        objectives: lessonContent.objectives,
        introduction: lessonContent.introduction,
        slides: processedSlides,
        summary: lessonContent.summary,
        nextSteps: lessonContent.nextSteps,
        metadata: {
          totalSlides: processedSlides.length,
          slidesWithImages: processedSlides.filter(slide => slide.imageUrl).length,
          betaImagesEnabled: betaImagesEnabled,
          generationTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      },
      betaStatus: {
        enabled: betaImagesEnabled,
        model: GEMINI_MODEL,
        totalGenerated: processedSlides.filter(slide => slide.generatedBy === 'gemini').length,
        totalFailed: processedSlides.filter(slide => slide.generatedBy === 'fallback').length
      }
    };

    console.log(`✅ Aula gerada com sucesso: ${response.lesson.title}`);
    console.log(`🖼️ Imagens geradas: ${response.betaStatus.totalGenerated}`);
    console.log(`⏱️ Tempo total: ${response.lesson.metadata.generationTime}ms`);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Erro na geração de aula:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      betaStatus: {
        enabled: geminiLessonImageService.isBetaEnabled(),
        model: GEMINI_MODEL,
        totalGenerated: 0,
        totalFailed: 0
      }
    }, { status: 500 });
  }
}

/**
 * Gera o conteúdo da aula usando Gemini
 */
async function generateLessonContent(topic: string, customPrompt?: string): Promise<any> {
  try {
    const prompt = customPrompt || `${STRUCTURED_LESSON_PROMPT}\n\nTópico da aula: ${topic}`;
    
    console.log('🤖 Gerando conteúdo da aula com Gemini...');

    const { text } = await generateText({
      model: google(GEMINI_MODEL),
      prompt: prompt,
      temperature: TEMPERATURE,
    });

    // Tentar fazer parse do JSON
    let lessonData;
    try {
      lessonData = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      // Tentar extrair JSON do texto se estiver dentro de markdown
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        lessonData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse lesson JSON from Gemini response');
      }
    }

    // Validar estrutura básica
    if (!lessonData.title || !lessonData.slides || !Array.isArray(lessonData.slides)) {
      throw new Error('Invalid lesson structure from Gemini');
    }

    console.log(`✅ Conteúdo da aula gerado: ${lessonData.title}`);
    return lessonData;

  } catch (error) {
    console.error('❌ Erro na geração de conteúdo:', error);
    throw error;
  }
}

/**
 * Processa slides e adiciona imagens usando o sistema beta
 */
async function processSlidesWithImages(slides: any[], topic: string, subject: string, grade: number): Promise<any[]> {
  try {
    // Preparar dados para o serviço de imagens
    const imageRequest: LessonImageRequest = {
      slides: slides.map(slide => ({
        slideNumber: slide.slideNumber,
        title: slide.title,
        content: slide.content,
        imagePrompt: slide.imagePrompt,
        type: slide.type
      })),
      topic,
      subject,
      grade: grade.toString()
    };

    // Gerar imagens usando o sistema beta
    const imageResponse = await geminiLessonImageService.generateLessonImages(imageRequest);

    // Combinar slides com imagens
    const processedSlides = slides.map(slide => {
      const imageData = imageResponse.slides.find(img => img.slideNumber === slide.slideNumber);
      
      return {
        slideNumber: slide.slideNumber,
        type: slide.type,
        title: slide.title,
        content: slide.content,
        imagePrompt: slide.imagePrompt,
        imageUrl: imageData?.imageUrl,
        imageData: imageData?.imageData,
        imageMimeType: imageData?.imageMimeType,
        generatedBy: imageData?.generatedBy,
        timeEstimate: slide.timeEstimate || 5,
        questions: slide.questions || []
      };
    });

    console.log(`🖼️ Slides processados: ${processedSlides.length}`);
    console.log(`📊 Imagens geradas: ${imageResponse.betaStatus.totalGenerated}`);
    console.log(`❌ Falhas: ${imageResponse.betaStatus.totalFailed}`);

    return processedSlides;

  } catch (error) {
    console.error('❌ Erro no processamento de imagens:', error);
    
    // Retornar slides sem imagens em caso de erro
    return slides.map(slide => ({
      slideNumber: slide.slideNumber,
      type: slide.type,
      title: slide.title,
      content: slide.content,
      imagePrompt: slide.imagePrompt,
      timeEstimate: slide.timeEstimate || 5,
      questions: slide.questions || [],
      generatedBy: 'none' as const
    }));
  }
}

/**
 * Endpoint GET para verificar status do sistema
 */
export async function GET() {
  const config = geminiLessonImageService.getConfig();
  
  return NextResponse.json({
    betaStatus: {
      enabled: config.enabled,
      model: config.model,
      imageSlides: config.imageSlides,
      maxRetries: config.maxRetries,
      timeout: config.timeout
    },
    timestamp: new Date().toISOString()
  });
}
