// app/api/gemini/generate-lesson-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

// Configuração do sistema beta
const BETA_SYSTEM_CONFIG = {
  enabled: true, // ✅ SISTEMA BETA SEMPRE ATIVADO
  model: 'gemini-2.5-flash-image', // Usando modelo mais recente disponível
  imageSlides: [1, 3, 6, 8, 11, 14], // Slides que devem ter imagens
  maxRetries: 3,
  timeout: 30000 // 30 segundos
};

interface ImageGenerationRequest {
  slides: Array<{
    slideNumber: number;
    title: string;
    content: string;
    imagePrompt?: string;
    type: string;
  }>;
  topic: string;
  subject?: string;
  grade?: string;
  betaEnabled?: boolean;
}

interface ImageGenerationResponse {
  success: boolean;
  slides: Array<{
    slideNumber: number;
    imageUrl?: string;
    imageData?: string;
    imageMimeType?: string;
    imagePrompt?: string;
    generatedBy: 'gemini' | 'fallback' | 'none';
    error?: string;
  }>;
  betaStatus: {
    enabled: boolean;
    model: string;
    totalGenerated: number;
    totalFailed: number;
  };
  metadata: {
    topic: string;
    subject?: string;
    grade?: string;
    generationTime: number;
    timestamp: string;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: ImageGenerationRequest = await request.json();
    const { slides, topic, subject, grade, betaEnabled = BETA_SYSTEM_CONFIG.enabled } = body;

    console.log('🎨 Iniciando geração de imagens para aula:', topic);
    console.log('📊 Sistema beta:', betaEnabled ? 'ATIVADO' : 'DESATIVADO');

    // Verificar se o sistema beta está ativado
    if (!betaEnabled) {
      console.log('⚠️ Sistema beta desativado, retornando slides sem imagens');
      return NextResponse.json({
        success: true,
        slides: slides.map(slide => ({
          slideNumber: slide.slideNumber,
          generatedBy: 'none' as const
        })),
        betaStatus: {
          enabled: false,
          model: 'disabled',
          totalGenerated: 0,
          totalFailed: 0
        },
        metadata: {
          topic,
          subject,
          grade,
          generationTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verificar se a API key está configurada
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('⚠️ GOOGLE_GEMINI_API_KEY não configurada');
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured',
        betaStatus: {
          enabled: true,
          model: BETA_SYSTEM_CONFIG.model,
          totalGenerated: 0,
          totalFailed: 0
        }
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: BETA_SYSTEM_CONFIG.model });

    // Filtrar slides que devem ter imagens
    const slidesWithImages = slides.filter(slide => 
      BETA_SYSTEM_CONFIG.imageSlides.includes(slide.slideNumber)
    );

    console.log(`🖼️ Gerando imagens para ${slidesWithImages.length} slides:`, 
      slidesWithImages.map(s => s.slideNumber));

    const results = [];
    let totalGenerated = 0;
    let totalFailed = 0;

    // Processar cada slide sequencialmente para evitar rate limits
    for (const slide of slidesWithImages) {
      try {
        console.log(`🎯 Processando slide ${slide.slideNumber}: ${slide.title}`);
        
        const imageResult = await generateImageForSlide(slide, topic, model, subject, grade);
        
        if (imageResult.success) {
          totalGenerated++;
          console.log(`✅ Imagem gerada com sucesso para slide ${slide.slideNumber}`);
        } else {
          totalFailed++;
          console.log(`❌ Falha na geração para slide ${slide.slideNumber}:`, imageResult.error);
        }
        
        results.push(imageResult);
        
        // Pequena pausa entre gerações para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro ao processar slide ${slide.slideNumber}:`, error);
        totalFailed++;
        results.push({
          slideNumber: slide.slideNumber,
          generatedBy: 'fallback' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Adicionar slides sem imagens
    const slidesWithoutImages = slides.filter(slide => 
      !BETA_SYSTEM_CONFIG.imageSlides.includes(slide.slideNumber)
    );
    
    slidesWithoutImages.forEach(slide => {
      results.push({
        slideNumber: slide.slideNumber,
        generatedBy: 'none' as const
      });
    });

    // Ordenar resultados por slideNumber
    results.sort((a, b) => a.slideNumber - b.slideNumber);

    const response: ImageGenerationResponse = {
      success: true,
      slides: results,
      betaStatus: {
        enabled: betaEnabled,
        model: BETA_SYSTEM_CONFIG.model,
        totalGenerated,
        totalFailed
      },
      metadata: {
        topic,
        subject,
        grade,
        generationTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`🎉 Geração concluída: ${totalGenerated} sucessos, ${totalFailed} falhas`);
    console.log(`⏱️ Tempo total: ${response.metadata.generationTime}ms`);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Erro na API de geração de imagens:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      betaStatus: {
        enabled: BETA_SYSTEM_CONFIG.enabled,
        model: BETA_SYSTEM_CONFIG.model,
        totalGenerated: 0,
        totalFailed: 0
      }
    }, { status: 500 });
  }
}

async function generateImageForSlide(
  slide: any, 
  topic: string, 
  model: any,
  subject?: string, 
  grade?: string
): Promise<{
  slideNumber: number;
  imageUrl?: string;
  imageData?: string;
  imageMimeType?: string;
  imagePrompt?: string;
  generatedBy: 'gemini' | 'fallback';
  success: boolean;
  error?: string;
}> {
  try {
    // Gerar prompt em inglês baseado no conteúdo do slide
    const englishPrompt = generateEnglishImagePrompt(slide, topic, subject, grade);
    
    console.log(`🎯 Prompt em inglês para slide ${slide.slideNumber}:`, englishPrompt);

    // Construir prompt otimizado para Gemini
    const optimizedPrompt = buildOptimizedGeminiPrompt(englishPrompt, slide.type);

    // Tentar gerar imagem com Gemini
    const result = await model.generateContent(optimizedPrompt);
    const response = await result.response;
    
    if (!response) {
      throw new Error('No response from Gemini');
    }

    // Verificar se há imagem na resposta
    const imageData = response.candidates?.[0]?.content?.parts?.[0];
    
    if (!imageData || !imageData.inlineData) {
      console.log(`⚠️ Gemini não retornou imagem para slide ${slide.slideNumber}, usando fallback`);
      return getFallbackImage(slide.slideNumber, englishPrompt);
    }

    // Converter dados da imagem para base64
    const imageBase64 = imageData.inlineData.data;
    const imageMimeType = imageData.inlineData.mimeType || 'image/png';
    
    // Converter base64 para data URL
    const imageUrl = `data:${imageMimeType};base64,${imageBase64}`;
    
      return {
        slideNumber: slide.slideNumber,
        imageUrl,
        imageData: imageBase64,
        imageMimeType,
        imagePrompt: englishPrompt,
        generatedBy: 'gemini' as const,
        success: true
      };

  } catch (error) {
    console.error(`❌ Erro na geração para slide ${slide.slideNumber}:`, error);
    return getFallbackImage(slide.slideNumber, generateEnglishImagePrompt(slide, topic, subject, grade));
  }
}

function generateEnglishImagePrompt(slide: any, topic: string, subject?: string, grade?: string): string {
  // Se já existe um prompt, usar ele como base
  if (slide.imagePrompt) {
    return translatePromptToEnglish(slide.imagePrompt);
  }

  // Gerar prompt baseado no conteúdo do slide
  const slideContent = slide.content || slide.title || '';
  const slideType = slide.type || 'explanation';
  
  // Prompts específicos baseados no tipo de slide
  const typePrompts = {
    introduction: `Educational illustration showing the introduction to ${topic}`,
    explanation: `Educational diagram illustrating ${topic} concepts`,
    quiz: `Educational visual aid for ${topic} quiz questions`,
    closing: `Educational summary visual for ${topic} conclusion`,
    summary: `Educational infographic summarizing ${topic} key points`
  };

  // Prompt base
  let basePrompt = typePrompts[slideType as keyof typeof typePrompts] || 
    `Educational illustration about ${topic}`;

  // Adicionar contexto específico do slide
  if (slideContent) {
    const keyWords = extractKeyWords(slideContent);
    if (keyWords.length > 0) {
      basePrompt += ` focusing on ${keyWords.slice(0, 3).join(', ')}`;
    }
  }

  // Adicionar contexto educacional
  if (subject) {
    basePrompt += ` in ${subject} education`;
  }
  
  if (grade) {
    basePrompt += ` for ${grade} grade level`;
  }

  return basePrompt;
}

function translatePromptToEnglish(portuguesePrompt: string): string {
  // Traduções básicas de termos educacionais comuns
  const translations: { [key: string]: string } = {
    'estudante': 'student',
    'professor': 'teacher',
    'aula': 'lesson',
    'escola': 'school',
    'matemática': 'mathematics',
    'ciências': 'science',
    'história': 'history',
    'geografia': 'geography',
    'português': 'portuguese',
    'inglês': 'english',
    'arte': 'art',
    'educação': 'education',
    'aprendizado': 'learning',
    'conhecimento': 'knowledge',
    'conceito': 'concept',
    'exemplo': 'example',
    'prático': 'practical',
    'teórico': 'theoretical',
    'diagrama': 'diagram',
    'gráfico': 'chart',
    'tabela': 'table',
    'ilustração': 'illustration',
    'imagem': 'image',
    'visual': 'visual'
  };

  let englishPrompt = portuguesePrompt.toLowerCase();
  
  // Aplicar traduções
  Object.entries(translations).forEach(([pt, en]) => {
    const regex = new RegExp(`\\b${pt}\\b`, 'gi');
    englishPrompt = englishPrompt.replace(regex, en);
  });

  // Limpar e melhorar o prompt
  englishPrompt = englishPrompt
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^\w\s,.-]/g, '') // Remover caracteres especiais
    .replace(/\b\w+\b/g, word => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalizar

  return englishPrompt || `Educational illustration about the lesson topic`;
}

function extractKeyWords(text: string): string[] {
  // Palavras comuns para remover
  const stopWords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'da', 'do', 'das', 'dos',
    'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'sobre', 'entre',
    'que', 'quem', 'onde', 'quando', 'como', 'porque', 'então', 'mas', 'e', 'ou',
    'é', 'são', 'foi', 'foram', 'ser', 'estar', 'ter', 'haver', 'fazer', 'dizer',
    'ver', 'saber', 'poder', 'querer', 'vir', 'ir', 'dar', 'falar', 'trabalhar'
  ]);

  // Extrair palavras significativas
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 10); // Limitar a 10 palavras

  return [...new Set(words)]; // Remover duplicatas
}

function buildOptimizedGeminiPrompt(englishPrompt: string, slideType: string): string {
  const styleInstructions = {
    introduction: 'Create an engaging educational illustration that introduces the topic',
    explanation: 'Create a clear educational diagram that explains the concept',
    quiz: 'Create an educational visual aid that supports learning',
    closing: 'Create an educational summary visual that concludes the lesson',
    summary: 'Create an educational infographic that summarizes key points'
  };

  const baseStyle = styleInstructions[slideType as keyof typeof styleInstructions] || 
    'Create an educational illustration';

  return `${baseStyle}: ${englishPrompt}.

Style requirements:
- Educational and professional
- Clear and visually appealing
- Suitable for learning materials
- High contrast and readable
- No text overlays or captions
- Focus on visual learning
- Use appropriate colors for education
- Make it engaging but not distracting

Technical requirements:
- High quality image
- Clear composition
- Educational focus
- Professional appearance`;
}

function getFallbackImage(slideNumber: number, prompt: string): {
  slideNumber: number;
  imageUrl: string;
  generatedBy: 'fallback';
  success: boolean;
  error: string;
} {
  // URLs de placeholder baseados no tipo de slide
  const fallbackImages = {
    1: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&crop=center', // Introduction
    3: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center', // Development
    6: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center', // Variations
    8: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center', // Deepening
    11: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center', // Synthesis
    14: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center' // Closing
  };

  const fallbackUrl = fallbackImages[slideNumber as keyof typeof fallbackImages] || 
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&crop=center';

    return {
      slideNumber,
      imageUrl: fallbackUrl,
      generatedBy: 'fallback',
      success: false,
      error: 'Gemini image generation failed, using fallback image'
    };
}

// Endpoint para verificar status do sistema beta
export async function GET() {
  return NextResponse.json({
    betaStatus: {
      enabled: BETA_SYSTEM_CONFIG.enabled,
      model: BETA_SYSTEM_CONFIG.model,
      imageSlides: BETA_SYSTEM_CONFIG.imageSlides,
      maxRetries: BETA_SYSTEM_CONFIG.maxRetries,
      timeout: BETA_SYSTEM_CONFIG.timeout
    },
    timestamp: new Date().toISOString()
  });
}
