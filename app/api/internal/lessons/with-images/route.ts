import { NextRequest, NextResponse } from 'next/server';

// Interface para requisição de aula com imagens
interface LessonWithImagesRequest {
  topic: string;
  subject: string;
  level: string;
  duration: number;
  slides: number[];
  imageStrategy?: 'search_first' | 'generate_first' | 'hybrid';
}

// Interface para resposta de aula com imagens
interface LessonWithImagesResponse {
  success: boolean;
  lesson: {
    id: string;
    topic: string;
    subject: string;
    level: string;
    duration: number;
    slides: LessonSlide[];
    totalSlides: number;
    imagesGenerated: number;
  };
  images: {
    total: number;
    bySlide: { [slideNumber: number]: LessonImage[] };
    processingTime: number;
    strategy: string;
  };
  processingTime: number;
  error?: string;
}

// Interface para slide da aula
interface LessonSlide {
  number: number;
  title: string;
  content: string;
  type: 'introduction' | 'concept' | 'process' | 'example' | 'application' | 'conclusion';
  hasImage: boolean;
  imageId?: string;
}

// Interface para imagem da aula
interface LessonImage {
  id: string;
  slideNumber: number;
  url: string;
  title: string;
  description: string;
  type: string;
  style: string;
  source: 'search' | 'generation' | 'placeholder';
  relevance: number;
  quality: number;
}

// Função para chamar API unificada de imagens
async function getImagesForLesson(topic: string, count: number, context: string, strategy: string = 'search_first'): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/internal/images/unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        count,
        context,
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

// Função para gerar conteúdo da aula (simulado)
function generateLessonContent(topic: string, subject: string, level: string, duration: number): LessonSlide[] {
  const slides: LessonSlide[] = [
    {
      number: 1,
      title: `Introdução: ${topic}`,
      content: `Nesta aula, vamos explorar o conceito de ${topic} e sua importância em ${subject}.`,
      type: 'introduction',
      hasImage: true
    },
    {
      number: 2,
      title: 'Objetivos da Aula',
      content: 'Ao final desta aula, você será capaz de compreender os principais conceitos e aplicações.',
      type: 'concept',
      hasImage: false
    },
    {
      number: 3,
      title: `Conceito Principal: ${topic}`,
      content: `${topic} é um conceito fundamental que envolve diversos aspectos importantes.`,
      type: 'concept',
      hasImage: true
    },
    {
      number: 4,
      title: 'Características',
      content: 'Vamos analisar as principais características e propriedades deste conceito.',
      type: 'process',
      hasImage: false
    },
    {
      number: 5,
      title: 'Processo',
      content: 'O processo envolve várias etapas que precisam ser compreendidas sequencialmente.',
      type: 'process',
      hasImage: false
    },
    {
      number: 6,
      title: 'Exemplo Prático',
      content: 'Vamos ver um exemplo prático de como este conceito se aplica na realidade.',
      type: 'example',
      hasImage: true
    },
    {
      number: 7,
      title: 'Aplicações',
      content: 'Este conceito tem diversas aplicações em diferentes áreas do conhecimento.',
      type: 'application',
      hasImage: false
    },
    {
      number: 8,
      title: 'Exercícios',
      content: 'Agora vamos praticar com alguns exercícios para fixar o conteúdo.',
      type: 'application',
      hasImage: true
    },
    {
      number: 9,
      title: 'Resumo',
      content: 'Vamos fazer um resumo dos principais pontos abordados nesta aula.',
      type: 'conclusion',
      hasImage: false
    },
    {
      number: 10,
      title: 'Conclusão',
      content: 'Parabéns! Você concluiu esta aula sobre ${topic}. Continue praticando!',
      type: 'conclusion',
      hasImage: true
    },
    {
      number: 11,
      title: 'Referências',
      content: 'Aqui estão algumas referências para aprofundar seus estudos.',
      type: 'conclusion',
      hasImage: true
    },
    {
      number: 12,
      title: 'Próximos Passos',
      content: 'Sugestões para continuar aprendendo sobre este tema.',
      type: 'conclusion',
      hasImage: true
    },
    {
      number: 13,
      title: 'Avaliação',
      content: 'Teste seus conhecimentos com esta avaliação.',
      type: 'conclusion',
      hasImage: false
    },
    {
      number: 14,
      title: 'Feedback',
      content: 'Sua opinião é importante para melhorarmos nossas aulas.',
      type: 'conclusion',
      hasImage: true
    }
  ];

  return slides;
}

// Função para determinar quais slides precisam de imagens
function getSlidesNeedingImages(slides: LessonSlide[]): number[] {
  return slides
    .filter(slide => slide.hasImage)
    .map(slide => slide.number);
}

// Função para distribuir imagens pelos slides
function distributeImagesToSlides(images: any[], slidesNeedingImages: number[]): { [slideNumber: number]: LessonImage[] } {
  const distribution: { [slideNumber: number]: LessonImage[] } = {};
  
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
      const lessonImage: LessonImage = {
        id: image.id,
        slideNumber,
        url: image.url,
        title: image.title,
        description: image.description,
        type: image.type,
        style: image.style,
        source: image.source,
        relevance: image.relevance,
        quality: image.quality
      };
      
      distribution[slideNumber].push(lessonImage);
      imageIndex++;
    }
  }
  
  return distribution;
}

// Handler principal da API
export async function POST(request: NextRequest) {
  try {
    const body: LessonWithImagesRequest = await request.json();
    const { 
      topic, 
      subject, 
      level, 
      duration, 
      slides: requestedSlides = [1, 3, 6, 8, 11, 14],
      imageStrategy = 'search_first'
    } = body;

    if (!topic || !subject) {
      return NextResponse.json({
        success: false,
        error: 'Tópico e matéria são obrigatórios'
      }, { status: 400 });
    }

    const startTime = Date.now();
    console.log(`🎓 Gerando aula com imagens: "${topic}" (${subject})`);

    // 1. Gerar conteúdo da aula
    const lessonSlides = generateLessonContent(topic, subject, level, duration);
    
    // 2. Determinar quais slides precisam de imagens
    const slidesNeedingImages = getSlidesNeedingImages(lessonSlides);
    const imageCount = slidesNeedingImages.length;
    
    console.log(`🖼️ Slides que precisam de imagens: ${slidesNeedingImages.join(', ')} (${imageCount} imagens)`);

    // 3. Obter imagens da API unificada
    const imagesResponse = await getImagesForLesson(
      topic, 
      imageCount, 
      `aula_${subject.toLowerCase()}`, 
      imageStrategy
    );

    if (!imagesResponse.success) {
      throw new Error('Falha ao obter imagens para a aula');
    }

    // 4. Distribuir imagens pelos slides
    const imagesBySlide = distributeImagesToSlides(imagesResponse.images, slidesNeedingImages);
    
    // 5. Atualizar slides com IDs das imagens
    const updatedSlides = lessonSlides.map(slide => {
      if (slide.hasImage && imagesBySlide[slide.number]) {
        const firstImage = imagesBySlide[slide.number][0];
        return {
          ...slide,
          imageId: firstImage.id
        };
      }
      return slide;
    });

    const processingTime = Date.now() - startTime;

    const result: LessonWithImagesResponse = {
      success: true,
      lesson: {
        id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        topic,
        subject,
        level,
        duration,
        slides: updatedSlides,
        totalSlides: updatedSlides.length,
        imagesGenerated: imageCount
      },
      images: {
        total: imagesResponse.images.length,
        bySlide: imagesBySlide,
        processingTime: imagesResponse.processingTime,
        strategy: imagesResponse.strategy
      },
      processingTime
    };

    console.log(`✅ Aula com imagens gerada: ${updatedSlides.length} slides, ${imageCount} imagens em ${processingTime}ms`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro na geração de aula com imagens:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      processingTime: Date.now() - Date.now()
    }, { status: 500 });
  }
}

// Handler para GET (informações da API)
export async function GET() {
  return NextResponse.json({
    name: 'API de Aulas com Imagens',
    version: '1.0.0',
    description: 'API para gerar aulas com imagens automáticas',
    endpoints: {
      POST: {
        description: 'Gerar aula com imagens baseadas no tema',
        body: {
          topic: 'string (obrigatório)',
          subject: 'string (obrigatório)',
          level: 'string (opcional)',
          duration: 'number (opcional)',
          slides: 'number[] (opcional, padrão: [1,3,6,8,11,14])',
          imageStrategy: 'string (opcional: search_first, generate_first, hybrid)'
        }
      }
    },
    features: [
      'Geração automática de conteúdo da aula',
      'Imagens automáticas para slides específicos',
      'Distribuição inteligente de imagens',
      'Múltiplas estratégias de busca/geração',
      'Integração com sistema de imagens'
    ],
    defaultSlides: [1, 3, 6, 8, 11, 14],
    slideTypes: {
      introduction: 'Slide de introdução',
      concept: 'Slide de conceito',
      process: 'Slide de processo',
      example: 'Slide de exemplo',
      application: 'Slide de aplicação',
      conclusion: 'Slide de conclusão'
    }
  });
}
