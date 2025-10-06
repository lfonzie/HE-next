// app/api/aulas/generate-grok-lesson-gemini-images/route.ts
// Sistema Híbrido: Grok 4 Fast para aula + Google Gemini Nano Banana para imagens

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { callGrok } from '@/lib/providers/grok';
import { STRUCTURED_LESSON_PROMPT } from '@/lib/system-prompts/lessons-structured';
import { classifyContentWithAI } from '@/lib/ai-content-classifier';
import { logTokens } from '@/lib/token-logger';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

// Configuração do sistema híbrido
const HYBRID_SYSTEM_CONFIG = {
  lessonModel: 'grok-4-fast-reasoning', // ✅ Grok 4 Fast para aula
  imageModel: 'gemini-2.5-flash-image', // ✅ Google Gemini 2.5 Flash Image para imagens
  imageSlides: [1, 3, 6, 8, 11, 14], // Slides que devem ter imagens
  maxRetries: 3,
  timeout: 30000
};

interface LessonGenerationResponse {
  success: boolean;
  lesson?: {
    id: string;
    title: string;
    subject: string;
    grade: number;
    slides: Array<{
      slideNumber: number;
      title: string;
      content: string;
      type: string;
      timeEstimate: number;
      imageUrl?: string;
      imagePrompt?: string;
      generatedBy?: 'gemini' | 'fallback';
    }>;
  };
  betaStatus?: {
    enabled: boolean;
    model: string;
    totalGenerated: number;
    totalFailed: number;
  };
      metadata?: {
        totalSlides: number;
        slidesWithImages: number;
        timestamp: string;
        lessonGeneratedBy: 'grok-4-fast-reasoning';
        imagesGeneratedBy: 'gemini-2.5-flash-image';
      };
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    const { topic, schoolId, mode = 'sync', customPrompt } = await request.json();
    
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Sistema Híbrido iniciado:', { 
      topic, 
      lessonModel: HYBRID_SYSTEM_CONFIG.lessonModel,
      imageModel: HYBRID_SYSTEM_CONFIG.imageModel,
      requestId 
    });

    // Verificar classificação de conteúdo
    const aiClassification = await classifyContentWithAI(topic);
    if (aiClassification.isInappropriate && aiClassification.confidence > 0.6) {
      return NextResponse.json({ 
        error: 'Tópico inadequado detectado',
        message: aiClassification.suggestedResponse
      }, { status: 400 });
    }

    // 1. GERAR AULA COM GROK 4 FAST
    console.log('📚 Gerando aula com Grok 4 Fast...');
    const lessonPrompt = customPrompt || `${STRUCTURED_LESSON_PROMPT}

Para o tópico: "${topic}"

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional, explicações ou formatação markdown.`;

    const grokResult = await callGrok(
      HYBRID_SYSTEM_CONFIG.lessonModel,
      [],
      lessonPrompt,
      'Você é um professor especializado em criar aulas educacionais estruturadas. Responda APENAS com JSON válido.'
    );

    if (!grokResult.text) {
      throw new Error('Grok 4 Fast não retornou conteúdo');
    }

    // Limpar e parsear JSON
    let lessonContent = grokResult.text.trim();
    if (lessonContent.includes('```json')) {
      lessonContent = lessonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const lessonData = JSON.parse(lessonContent);
    console.log('✅ Aula gerada com Grok 4 Fast:', lessonData.title);

    // 2. GERAR IMAGENS COM GOOGLE GEMINI NANO BANANA
    console.log('🖼️ Gerando imagens com Google Gemini...');
    const slidesWithImages = lessonData.slides.filter((slide: any) => 
      HYBRID_SYSTEM_CONFIG.imageSlides.includes(slide.slideNumber)
    );

    const imageGenerationResults = [];
    for (const slide of slidesWithImages) {
      try {
        const imageResult = await generateImageForSlide(slide, topic, lessonData.subject, lessonData.grade);
        imageGenerationResults.push(imageResult);
      } catch (error) {
        console.error(`❌ Erro ao gerar imagem para slide ${slide.slideNumber}:`, error);
        imageGenerationResults.push({
          slideNumber: slide.slideNumber,
          imageUrl: getFallbackImageUrl(slide.slideNumber),
          generatedBy: 'fallback',
          success: false,
          error: 'Falha na geração de imagem'
        });
      }
    }

    // 3. COMBINAR AULA + IMAGENS
    const finalSlides = lessonData.slides.map((slide: any) => {
      const imageResult = imageGenerationResults.find(img => img.slideNumber === slide.slideNumber);
      if (imageResult) {
        return {
          ...slide,
          imageUrl: imageResult.imageUrl,
          imagePrompt: imageResult.imagePrompt,
          generatedBy: imageResult.generatedBy
        };
      }
      return slide;
    });

    // 4. LOG DE TOKENS
    try {
      const totalTokens = grokResult.usage?.total_tokens || Math.ceil((lessonContent?.length || 0) / 4);
      await logTokens({
        userId: session.user.id,
        moduleGroup: 'Aulas',
        model: HYBRID_SYSTEM_CONFIG.lessonModel,
        totalTokens,
        subject: lessonData.subject || 'Geral',
        messages: { topic, requestId }
      });
    } catch (e) {
      console.warn('⚠️ Falha ao logar tokens:', e);
    }

    // 5. RESPOSTA FINAL
    const response: LessonGenerationResponse = {
      success: true,
      lesson: {
        id: `aula-grok-gemini-${Date.now()}`,
        title: lessonData.title,
        subject: lessonData.subject,
        grade: lessonData.grade,
        slides: finalSlides
      },
      betaStatus: {
        enabled: true,
        model: HYBRID_SYSTEM_CONFIG.imageModel,
        totalGenerated: imageGenerationResults.filter(r => r.success).length,
        totalFailed: imageGenerationResults.filter(r => !r.success).length
      },
      metadata: {
        totalSlides: lessonData.slides.length,
        slidesWithImages: slidesWithImages.length,
        timestamp: new Date().toISOString(),
        lessonGeneratedBy: 'grok-4-fast-reasoning',
        imagesGeneratedBy: 'gemini-2.5-flash-image'
      }
    };

    console.log('✅ Sistema Híbrido concluído:', {
      lessonModel: 'grok-4-fast-reasoning',
      imageModel: 'gemini-2.5-flash-image',
      totalSlides: response.lesson?.slides.length,
      imagesGenerated: response.betaStatus?.totalGenerated,
      timeMs: Date.now() - startTime
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro no Sistema Híbrido:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      metadata: {
        timestamp: new Date().toISOString(),
        lessonGeneratedBy: 'grok-4-fast-reasoning',
        imagesGeneratedBy: 'gemini-2.5-flash-image'
      }
    }, { status: 500 });
  }
}

// Função para gerar imagem com Google Gemini
async function generateImageForSlide(
  slide: any,
  topic: string,
  subject?: string,
  grade?: number
): Promise<{
  slideNumber: number;
  imageUrl?: string;
  imagePrompt?: string;
  generatedBy: 'gemini' | 'fallback';
  success: boolean;
  error?: string;
}> {
  try {
    const englishPrompt = generateEnglishImagePrompt(slide, topic, subject, grade);
    
    // Chamar Google Gemini para gerar imagem
    const geminiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gemini/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: englishPrompt,
        type: 'educational',
        subject: subject || 'general',
        style: 'clear, professional, educational'
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini falhou: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (geminiData.success) {
      let imageUrl = '';
      
      if (geminiData.image?.data) {
        // Imagem gerada pelo Gemini
        const imageMimeType = geminiData.image.mimeType || 'image/png';
        imageUrl = `data:${imageMimeType};base64,${geminiData.image.data}`;
      } else if (geminiData.image?.fallbackUrl) {
        // Imagem de fallback
        imageUrl = geminiData.image.fallbackUrl;
      }
      
      if (imageUrl) {
        return {
          slideNumber: slide.slideNumber,
          imageUrl: imageUrl,
          imagePrompt: englishPrompt,
          generatedBy: geminiData.fallback ? 'fallback' : 'gemini',
          success: true
        };
      }
    }
    
    console.warn(`⚠️ Gemini não retornou imagem válida para slide ${slide.slideNumber}:`, geminiData);
    throw new Error('Gemini não retornou imagem válida');

  } catch (error) {
    console.error(`❌ Erro ao gerar imagem para slide ${slide.slideNumber}:`, error);
    return {
      slideNumber: slide.slideNumber,
      imageUrl: getFallbackImageUrl(slide.slideNumber),
      generatedBy: 'fallback',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para gerar prompt em inglês
function generateEnglishImagePrompt(slide: any, topic: string, subject?: string, grade?: number): string {
  const gradeText = grade ? `for ${grade}th grade students` : 'for students';
  const subjectText = subject ? `in ${subject}` : 'educational';
  
  return `Create an educational illustration ${subjectText} ${gradeText} about "${topic}". 

Slide content: "${slide.content}"
Slide title: "${slide.title}"

Style: Clear, professional, educational illustration with:
- Clean composition
- Educational focus
- Professional appearance
- Clear visual elements
- Appropriate for classroom use

The image should help students understand the concept being taught in this slide.`;
}

// Função para obter imagem de fallback
function getFallbackImageUrl(slideNumber: number): string {
  const fallbackImages = {
    1: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&crop=center',
    3: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center',
    6: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    8: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
    11: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
    14: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center'
  };
  
  return fallbackImages[slideNumber as keyof typeof fallbackImages] || fallbackImages[1];
}
