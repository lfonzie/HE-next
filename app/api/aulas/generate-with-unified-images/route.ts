// app/api/aulas/generate-with-unified-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  imageStrategy?: 'search_first' | 'generate_first' | 'hybrid';
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
      generatedBy?: 'search' | 'generation' | 'placeholder';
      timeEstimate: number;
      questions?: any[];
    }>;
    summary: string;
    nextSteps: string[];
    metadata: {
      totalSlides: number;
      slidesWithImages: number;
      imageStrategy: string;
      generationTime: number;
      timestamp: string;
    };
  };
  error?: string;
  imageResults?: {
    total: number;
    bySlide: { [slideNumber: number]: any[] };
    processingTime: number;
    strategy: string;
  };
}

// Função para chamar API Unificada de imagens
async function getImagesForLesson(topic: string, subject: string, count: number, strategy: string = 'search_first'): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/api/internal/images/unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        count,
        context: `aula_${subject.toLowerCase()}`,
        strategy,
        fallback: true
      })
    });

    if (!response.ok) {
      throw new Error(`Images API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao chamar API de imagens:', error);
    return { success: false, images: [], strategy: 'error' };
  }
}

// Função para gerar conteúdo da aula
async function generateLessonContent(topic: string, customPrompt?: string): Promise<any> {
  try {
    const prompt = customPrompt || STRUCTURED_LESSON_PROMPT.replace('{topic}', topic);
    
    const result = await generateText({
      model: google(GEMINI_MODEL),
      prompt,
      temperature: TEMPERATURE,
      maxTokens: MAX_TOKENS,
    });

    const lessonData = JSON.parse(result.text);
    return lessonData;
  } catch (error) {
    console.error('❌ Erro ao gerar conteúdo da aula:', error);
    throw error;
  }
}

// Função para distribuir imagens pelos slides
function distributeImagesToSlides(images: any[], slidesNeedingImages: number[]): { [slideNumber: number]: any[] } {
  const distribution: { [slideNumber: number]: any[] } = {};
  
  // Inicializar distribuição
  slidesNeedingImages.forEach(slideNumber => {
    distribution[slideNumber] = [];
  });
  
  // Distribuir imagens de forma equilibrada
  let imageIndex = 0;
  while (imageIndex < images.length) {
    for (const slideNumber of slidesNeedingImages) {
      if (imageIndex >= images.length) break;
      
      const image = images[imageIndex];
      distribution[slideNumber].push(image);
      imageIndex++;
    }
  }
  
  return distribution;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    const body: LessonGenerationRequest = await request.json();
    const { topic, schoolId, imageStrategy = 'search_first', customPrompt } = body;
    const session = await getServerSession(authOptions);

    // Verificar autenticação
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🎓 Iniciando geração de aula com API Unificada: ${topic}`);
    console.log(`🖼️ Estratégia de imagens: ${imageStrategy}`);

    // Validar entrada
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Topic is required and must be a non-empty string' 
      }, { status: 400 });
    }

    // 1. Gerar conteúdo da aula usando Gemini
    console.log(`📝 Gerando conteúdo da aula...`);
    const lessonContent = await generateLessonContent(topic, customPrompt);
    
    if (!lessonContent) {
      throw new Error('Falha ao gerar conteúdo da aula');
    }

    // 2. Determinar quais slides precisam de imagens
    const slidesNeedingImages = IMAGE_SLIDE_NUMBERS.filter(slideNum => 
      lessonContent.slides && lessonContent.slides.length >= slideNum
    );
    const imageCount = slidesNeedingImages.length;
    
    console.log(`🖼️ Slides que precisam de imagens: ${slidesNeedingImages.join(', ')} (${imageCount} imagens)`);

    // 3. Obter imagens da API Unificada
    let imageResults: any = null;
    if (imageCount > 0) {
      console.log(`🎨 Obtendo ${imageCount} imagens da API Unificada...`);
      imageResults = await getImagesForLesson(topic, lessonContent.subject || 'educacional', imageCount, imageStrategy);
      
      if (!imageResults.success) {
        console.warn('⚠️ Falha ao obter imagens, continuando sem imagens');
        imageResults = { images: [], strategy: 'error' };
      }
    }

    // 4. Distribuir imagens pelos slides
    let imagesBySlide: { [slideNumber: number]: any[] } = {};
    if (imageResults && imageResults.images.length > 0) {
      imagesBySlide = distributeImagesToSlides(imageResults.images, slidesNeedingImages);
      console.log(`✅ Imagens distribuídas pelos slides`);
    }

    // 5. Atualizar slides com imagens
    const updatedSlides = lessonContent.slides.map((slide: any, index: number) => {
      const slideNumber = index + 1;
      const hasImage = slidesNeedingImages.includes(slideNumber);
      
      if (hasImage && imagesBySlide[slideNumber] && imagesBySlide[slideNumber].length > 0) {
        const firstImage = imagesBySlide[slideNumber][0];
        return {
          ...slide,
          slideNumber,
          imageUrl: firstImage.url,
          imagePrompt: firstImage.title,
          imageData: firstImage.url.startsWith('data:') ? firstImage.url : undefined,
          imageMimeType: firstImage.url.startsWith('data:') ? 'image/png' : undefined,
          generatedBy: firstImage.source,
          timeEstimate: slide.timeEstimate || 5
        };
      }
      
      return {
        ...slide,
        slideNumber,
        timeEstimate: slide.timeEstimate || 5
      };
    });

    // 6. Criar resposta final
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const generationTime = Date.now() - startTime;

    const response: LessonGenerationResponse = {
      success: true,
      lesson: {
        id: lessonId,
        title: lessonContent.title || `Aula sobre ${topic}`,
        topic,
        subject: lessonContent.subject || 'Educacional',
        grade: lessonContent.grade || 8,
        objectives: lessonContent.objectives || [],
        introduction: lessonContent.introduction || '',
        slides: updatedSlides,
        summary: lessonContent.summary || '',
        nextSteps: lessonContent.nextSteps || [],
        metadata: {
          totalSlides: updatedSlides.length,
          slidesWithImages: slidesNeedingImages.length,
          imageStrategy,
          generationTime,
          timestamp: new Date().toISOString()
        }
      },
      imageResults: imageResults ? {
        total: imageResults.images.length,
        bySlide: imagesBySlide,
        processingTime: imageResults.processingTime,
        strategy: imageResults.strategy
      } : undefined
    };

    console.log(`✅ Aula gerada com sucesso: ${updatedSlides.length} slides, ${slidesNeedingImages.length} com imagens em ${generationTime}ms`);

    return NextResponse.json(response);

  } catch (error) {
    console.error(`❌ Erro na geração de aula (${requestId}):`, error);
    
    const response: LessonGenerationResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na geração da aula'
    };

    return NextResponse.json(response, { status: 500 });
  }
}
