// lib/gemini-lesson-image-service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração do sistema beta de geração de imagens
export interface BetaImageSystemConfig {
  enabled: boolean;
  model: string;
  imageSlides: number[];
  maxRetries: number;
  timeout: number;
  apiKey?: string;
}

export interface LessonImageRequest {
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
}

export interface LessonImageResponse {
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

// Configuração padrão do sistema beta
export const DEFAULT_BETA_CONFIG: BetaImageSystemConfig = {
  enabled: true, // ✅ SISTEMA BETA SEMPRE ATIVADO
  model: 'gemini-2.5-flash-image',
  imageSlides: [1, 3, 6, 8, 11, 14], // Slides que devem ter imagens
  maxRetries: 3,
  timeout: 30000, // 30 segundos
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
};

export class GeminiLessonImageService {
  private config: BetaImageSystemConfig;
  private genAI?: GoogleGenerativeAI;
  private model?: any;

  constructor(config: Partial<BetaImageSystemConfig> = {}) {
    this.config = { ...DEFAULT_BETA_CONFIG, ...config };
    
    if (this.config.enabled && this.config.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.config.model });
    }
  }

  /**
   * Ativa ou desativa o sistema beta
   */
  setBetaEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    if (enabled && this.config.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.config.model });
    } else {
      this.genAI = undefined;
      this.model = undefined;
    }
  }

  /**
   * Verifica se o sistema beta está ativo
   */
  isBetaEnabled(): boolean {
    return this.config.enabled && !!this.config.apiKey;
  }

  /**
   * Gera imagens para uma aula completa
   */
  async generateLessonImages(request: LessonImageRequest): Promise<LessonImageResponse> {
    const startTime = Date.now();
    
    console.log('🎨 GeminiLessonImageService: Iniciando geração de imagens');
    console.log('📊 Sistema beta:', this.isBetaEnabled() ? 'ATIVADO' : 'DESATIVADO');

    if (!this.isBetaEnabled()) {
      console.log('⚠️ Sistema beta desativado, retornando slides sem imagens');
      return this.createEmptyResponse(request, startTime);
    }

    try {
      // Filtrar slides que devem ter imagens
      const slidesWithImages = request.slides.filter(slide => 
        this.config.imageSlides.includes(slide.slideNumber)
      );

      console.log(`🖼️ Gerando imagens para ${slidesWithImages.length} slides:`, 
        slidesWithImages.map(s => s.slideNumber));

      const results = [];
      let totalGenerated = 0;
      let totalFailed = 0;

      // Processar cada slide sequencialmente
      for (const slide of slidesWithImages) {
        try {
          const imageResult = await this.generateImageForSlide(slide, request);
          
          if (imageResult.success) {
            totalGenerated++;
          } else {
            totalFailed++;
          }
          
          results.push(imageResult);
          
          // Pausa entre gerações para evitar rate limits
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
      const slidesWithoutImages = request.slides.filter(slide => 
        !this.config.imageSlides.includes(slide.slideNumber)
      );
      
      slidesWithoutImages.forEach(slide => {
        results.push({
          slideNumber: slide.slideNumber,
          generatedBy: 'none' as const
        });
      });

      // Ordenar resultados por slideNumber
      results.sort((a, b) => a.slideNumber - b.slideNumber);

      const response: LessonImageResponse = {
        success: true,
        slides: results,
        betaStatus: {
          enabled: this.isBetaEnabled(),
          model: this.config.model,
          totalGenerated,
          totalFailed
        },
        metadata: {
          topic: request.topic,
          subject: request.subject,
          grade: request.grade,
          generationTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };

      console.log(`🎉 Geração concluída: ${totalGenerated} sucessos, ${totalFailed} falhas`);
      return response;

    } catch (error: any) {
      console.error('❌ Erro na geração de imagens:', error);
      return {
        success: false,
        slides: request.slides.map(slide => ({
          slideNumber: slide.slideNumber,
          generatedBy: 'fallback' as const,
          error: error.message
        })),
        betaStatus: {
          enabled: this.isBetaEnabled(),
          model: this.config.model,
          totalGenerated: 0,
          totalFailed: request.slides.length
        },
        metadata: {
          topic: request.topic,
          subject: request.subject,
          grade: request.grade,
          generationTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Gera imagem para um slide específico
   */
  private async generateImageForSlide(
    slide: any, 
    request: LessonImageRequest
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
      if (!this.model) {
        throw new Error('Gemini model not initialized');
      }

      // Gerar prompt em inglês
      const englishPrompt = this.generateEnglishImagePrompt(slide, request);
      
      console.log(`🎯 Prompt em inglês para slide ${slide.slideNumber}:`, englishPrompt);

      // Construir prompt otimizado para Gemini
      const optimizedPrompt = this.buildOptimizedGeminiPrompt(englishPrompt, slide.type);

      // Tentar gerar imagem com Gemini
      const result = await this.model.generateContent(optimizedPrompt);
      const response = await result.response;
      
      if (!response) {
        throw new Error('No response from Gemini');
      }

      // Verificar se há imagem na resposta
      const imageData = response.candidates?.[0]?.content?.parts?.[0];
      
      if (!imageData || !imageData.inlineData) {
        console.log(`⚠️ Gemini não retornou imagem para slide ${slide.slideNumber}, usando fallback`);
        return this.getFallbackImage(slide.slideNumber, englishPrompt);
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
        generatedBy: 'gemini',
        success: true
      };

    } catch (error) {
      console.error(`❌ Erro na geração para slide ${slide.slideNumber}:`, error);
      return this.getFallbackImage(slide.slideNumber, this.generateEnglishImagePrompt(slide, request));
    }
  }

  /**
   * Gera prompt em inglês baseado no conteúdo do slide
   */
  private generateEnglishImagePrompt(slide: any, request: LessonImageRequest): string {
    // Se já existe um prompt, usar ele como base
    if (slide.imagePrompt) {
      return this.translatePromptToEnglish(slide.imagePrompt);
    }

    // Gerar prompt baseado no conteúdo do slide
    const slideContent = slide.content || slide.title || '';
    const slideType = slide.type || 'explanation';
    
    // Prompts específicos baseados no tipo de slide
    const typePrompts = {
      introduction: `Educational illustration showing the introduction to ${request.topic}`,
      explanation: `Educational diagram illustrating ${request.topic} concepts`,
      quiz: `Educational visual aid for ${request.topic} quiz questions`,
      closing: `Educational summary visual for ${request.topic} conclusion`,
      summary: `Educational infographic summarizing ${request.topic} key points`
    };

    // Prompt base
    let basePrompt = typePrompts[slideType as keyof typeof typePrompts] || 
      `Educational illustration about ${request.topic}`;

    // Adicionar contexto específico do slide
    if (slideContent) {
      const keyWords = this.extractKeyWords(slideContent);
      if (keyWords.length > 0) {
        basePrompt += ` focusing on ${keyWords.slice(0, 3).join(', ')}`;
      }
    }

    // Adicionar contexto educacional
    if (request.subject) {
      basePrompt += ` in ${request.subject} education`;
    }
    
    if (request.grade) {
      basePrompt += ` for ${request.grade} grade level`;
    }

    return basePrompt;
  }

  /**
   * Traduz prompt em português para inglês
   */
  private translatePromptToEnglish(portuguesePrompt: string): string {
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

  /**
   * Extrai palavras-chave do texto
   */
  private extractKeyWords(text: string): string[] {
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

  /**
   * Constrói prompt otimizado para Gemini
   */
  private buildOptimizedGeminiPrompt(englishPrompt: string, slideType: string): string {
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

  /**
   * Retorna imagem de fallback
   */
  private getFallbackImage(slideNumber: number, prompt: string): {
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

  /**
   * Cria resposta vazia quando sistema beta está desativado
   */
  private createEmptyResponse(request: LessonImageRequest, startTime: number): LessonImageResponse {
    return {
      success: true,
      slides: request.slides.map(slide => ({
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
        topic: request.topic,
        subject: request.subject,
        grade: request.grade,
        generationTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Obtém configuração atual do sistema beta
   */
  getConfig(): BetaImageSystemConfig {
    return { ...this.config };
  }

  /**
   * Atualiza configuração do sistema beta
   */
  updateConfig(newConfig: Partial<BetaImageSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled && this.config.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.config.model });
    } else {
      this.genAI = undefined;
      this.model = undefined;
    }
  }
}

// Instância singleton do serviço
export const geminiLessonImageService = new GeminiLessonImageService();
