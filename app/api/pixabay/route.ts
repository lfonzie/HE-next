// app/api/pixabay/route.ts - Endpoint dedicado para API Pixabay
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { z } from 'zod';


import { pixabayService } from '@/lib/pixabay';



// Schema de validação para busca de imagens
const ImageSearchSchema = z.object({
  query: z.string().min(1, 'Query é obrigatória'),
  page: z.number().min(1).max(100).default(1),
  perPage: z.number().min(1).max(200).default(20),
  category: z.enum(['education', 'science', 'business', 'backgrounds', 'nature', 'people']).optional(),
  subject: z.string().optional(),
  type: z.enum(['images', 'videos', 'both']).default('images')
});

// Schema para busca por disciplina
const SubjectSearchSchema = z.object({
  subject: z.string().min(1, 'Disciplina é obrigatória'),
  page: z.number().min(1).max(100).default(1),
  perPage: z.number().min(1).max(200).default(20)
});

// Schema para busca de apresentações
const PresentationSearchSchema = z.object({
  topic: z.string().min(1, 'Tópico é obrigatório'),
  page: z.number().min(1).max(100).default(1),
  perPage: z.number().min(1).max(200).default(20)
});

// Schema para busca científica
const ScienceSearchSchema = z.object({
  topic: z.string().min(1, 'Tópico científico é obrigatório'),
  page: z.number().min(1).max(100).default(1),
  perPage: z.number().min(1).max(200).default(20)
});

/**
 * POST /api/pixabay - Busca imagens educacionais
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    console.log(`🖼️ [PIXABAY] Ação: ${action}, Dados:`, data);

    switch (action) {
      case 'search':
        return await handleImageSearch(data);
      case 'subject':
        return await handleSubjectSearch(data);
      case 'presentation':
        return await handlePresentationSearch(data);
      case 'science':
        return await handleScienceSearch(data);
      case 'inspirational':
        return await handleInspirationalSearch(data);
      case 'videos':
        return await handleVideoSearch(data);
      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não reconhecida',
          availableActions: ['search', 'subject', 'presentation', 'science', 'inspirational', 'videos']
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ [PIXABAY] Erro:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Busca geral de imagens educacionais
 */
async function handleImageSearch(data: any) {
  const validatedData = ImageSearchSchema.parse(data);
  const { query, page, perPage, category, subject, type } = validatedData;

  try {
    let results: any[] = [];

    if (type === 'images' || type === 'both') {
      const imageResponse = await pixabayService.searchEducationalImages(
        query, 
        page, 
        perPage, 
        category
      );
      
      results = imageResponse.hits.map(pixabayService.formatImageResult);
    }

    if (type === 'videos' || type === 'both') {
      const videoResponse = await pixabayService.searchEducationalVideos(
        query, 
        page, 
        Math.ceil(perPage / 2) // Dividir limite entre imagens e vídeos
      );
      
      const videoResults = videoResponse.hits.map(pixabayService.formatVideoResult);
      results = [...results, ...videoResults];
    }

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        query,
        category,
        subject,
        type,
        page,
        perPage,
        totalResults: results.length,
        source: 'pixabay',
        educational: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [PIXABAY] Erro na busca de imagens:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar imagens',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Busca por disciplina específica
 */
async function handleSubjectSearch(data: any) {
  const validatedData = SubjectSearchSchema.parse(data);
  const { subject, page, perPage } = validatedData;

  try {
    const response = await pixabayService.getSubjectImages(subject, page, perPage);
    const results = response.hits.map(pixabayService.formatImageResult);

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        subject,
        page,
        perPage,
        totalResults: results.length,
        source: 'pixabay',
        educational: true,
        category: 'subject-specific'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [PIXABAY] Erro na busca por disciplina:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar imagens da disciplina',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Busca para apresentações educacionais
 */
async function handlePresentationSearch(data: any) {
  const validatedData = PresentationSearchSchema.parse(data);
  const { topic, page, perPage } = validatedData;

  try {
    const response = await pixabayService.getPresentationImages(topic, page, perPage);
    const results = response.hits.map(pixabayService.formatImageResult);

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        topic,
        page,
        perPage,
        totalResults: results.length,
        source: 'pixabay',
        educational: true,
        category: 'presentation'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [PIXABAY] Erro na busca de apresentações:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar imagens para apresentação',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Busca científica e tecnológica
 */
async function handleScienceSearch(data: any) {
  const validatedData = ScienceSearchSchema.parse(data);
  const { topic, page, perPage } = validatedData;

  try {
    const response = await pixabayService.getScienceImages(topic, page, perPage);
    const results = response.hits.map(pixabayService.formatImageResult);

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        topic,
        page,
        perPage,
        totalResults: results.length,
        source: 'pixabay',
        educational: true,
        category: 'science'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [PIXABAY] Erro na busca científica:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar imagens científicas',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Busca de imagens inspiradoras
 */
async function handleInspirationalSearch(data: any) {
  const { page = 1, perPage = 20 } = data;

  try {
    const response = await pixabayService.getInspirationalImages(page, perPage);
    const results = response.hits.map(pixabayService.formatImageResult);

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        page,
        perPage,
        totalResults: results.length,
        source: 'pixabay',
        educational: true,
        category: 'inspirational'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [PIXABAY] Erro na busca inspiracional:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar imagens inspiradoras',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Busca de vídeos educacionais
 */
async function handleVideoSearch(data: any) {
  const { query, page = 1, perPage = 20 } = data;

  if (!query) {
    return NextResponse.json({
      success: false,
      error: 'Query é obrigatória para busca de vídeos'
    }, { status: 400 });
  }

  try {
    const response = await pixabayService.searchEducationalVideos(query, page, perPage);
    const results = response.hits.map(pixabayService.formatVideoResult);

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        query,
        page,
        perPage,
        totalResults: results.length,
        source: 'pixabay',
        educational: true,
        category: 'videos'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [PIXABAY] Erro na busca de vídeos:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar vídeos educacionais',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * GET /api/pixabay - Informações sobre a API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'info') {
    return NextResponse.json({
      success: true,
      data: {
        name: 'Pixabay Educational Images API',
        description: 'API dedicada para busca de imagens educacionais na Pixabay',
        version: '1.0.0',
        features: [
          'Busca de imagens educacionais',
          'Busca por disciplina específica',
          'Imagens para apresentações',
          'Conteúdo científico e tecnológico',
          'Vídeos educacionais',
          'Imagens inspiradoras'
        ],
        endpoints: {
          'POST /api/pixabay': {
            actions: [
              'search - Busca geral de imagens',
              'subject - Busca por disciplina',
              'presentation - Imagens para apresentações',
              'science - Conteúdo científico',
              'inspirational - Imagens inspiradoras',
              'videos - Vídeos educacionais'
            ]
          }
        },
        limits: {
          imagesPerRequest: 200,
          videosPerRequest: 200,
          requestsPerHour: 5000
        },
        educational: true,
        source: 'pixabay'
      },
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    message: 'API Pixabay para imagens educacionais',
    usage: 'Use POST com action: search, subject, presentation, science, inspirational, ou videos',
    documentation: '/api/pixabay?action=info'
  });
}
