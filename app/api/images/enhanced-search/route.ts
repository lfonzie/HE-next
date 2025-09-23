// app/api/images/enhanced-search/route.ts
// API melhorada para busca de imagens usando os 3 provedores com dimensões específicas

import { NextRequest, NextResponse } from 'next/server';
import { googleImageAlternativesService } from '@/lib/services/google-image-alternatives';

export const dynamic = 'force-dynamic';

interface ImageResult {
  url: string;
  source: string;
  title: string;
  description: string;
  author: string;
  width: number;
  height: number;
  tags: string[];
  relevanceScore: number;
  educationalSuitability: number;
  resizedUrl?: string;
}

interface EnhancedSearchRequest {
  query: string;
  subject: string;
  grade?: string;
  count?: number;
  preferredDimensions?: {
    width: number;
    height: number;
  };
  sources?: string[];
  useGoogleAlternatives?: boolean;
}

const EDUCATIONAL_KEYWORDS = {
  'matemática': ['math', 'mathematics', 'geometry', 'algebra', 'equation', 'graph', 'calculation', 'numbers'],
  'biologia': ['biology', 'nature', 'plant', 'animal', 'cell', 'dna', 'evolution', 'organism'],
  'química': ['chemistry', 'molecule', 'atom', 'reaction', 'laboratory', 'chemical', 'element'],
  'física': ['physics', 'energy', 'force', 'motion', 'wave', 'particle', 'quantum', 'mechanics'],
  'história': ['history', 'ancient', 'war', 'civilization', 'culture', 'historical', 'monument'],
  'geografia': ['geography', 'map', 'country', 'landscape', 'climate', 'earth', 'continent'],
  'ciências': ['science', 'scientific', 'experiment', 'research', 'discovery', 'laboratory'],
  'tecnologia': ['technology', 'computer', 'digital', 'electronic', 'software', 'hardware'],
  'internet': ['internet', 'network', 'web', 'connection', 'data', 'transmission', 'protocol', 'diagram'],
  'informática': ['computing', 'computer', 'software', 'programming', 'algorithm', 'database', 'system']
};

export async function POST(request: NextRequest) {
  try {
    const body: EnhancedSearchRequest = await request.json();
    const {
      query,
      subject,
      grade = '5',
      count = 3,
      preferredDimensions = { width: 1350, height: 1080 },
      sources = ['unsplash', 'pixabay', 'wikimedia'],
      useGoogleAlternatives = true
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Enhanced image search for: "${query}" (${subject})`);

    // Try Google alternatives first if enabled
    if (useGoogleAlternatives) {
      try {
        const googleResults = await googleImageAlternativesService.searchImages({
          query,
          subject,
          count,
          safeSearch: true,
          imageType: 'photo',
          color: 'color',
          size: 'large',
          aspectRatio: 'wide',
          orientation: 'horizontal'
        });

        if (googleResults.success && googleResults.images.length > 0) {
          console.log('✅ Google alternatives found results:', googleResults.images.length);
          
          // Convert to our format
          const convertedResults = googleResults.images.map(img => ({
            url: img.url,
            source: img.source,
            title: img.title,
            description: img.description,
            author: img.author,
            width: img.width,
            height: img.height,
            tags: img.tags,
            relevanceScore: img.relevanceScore,
            educationalSuitability: img.educationalSuitability,
            resizedUrl: resizeImageUrl(img.url, preferredDimensions.width, preferredDimensions.height)
          }));

          return NextResponse.json({
            success: true,
            images: convertedResults,
            query,
            subject,
            totalFound: convertedResults.length,
            sources: [{ source: 'google-alternatives', status: 'searched' }],
            googleAlternativesUsed: true
          });
        }
      } catch (error) {
        console.warn('⚠️ Google alternatives failed, falling back to original method:', error);
      }
    }

    // Buscar em múltiplas fontes em paralelo
    const searchPromises = sources.map(source => 
      searchInSource(source, query, subject, Math.ceil(count * 2))
    );

    const allResults = await Promise.all(searchPromises);
    const combinedResults = allResults.flat();

    // Filtrar e classificar resultados
    const filteredResults = filterAndScoreImages(
      combinedResults,
      query,
      subject,
      grade,
      preferredDimensions
    );

    // Se não encontrou imagens suficientes, usar fallbacks inteligentes
    if (finalResults.length < count) {
      const fallbackImages = generateIntelligentFallbacks(query, subject, count - finalResults.length);
      finalResults.push(...fallbackImages);
    }

    console.log(`✅ Enhanced search completed: ${finalResults.length} results`);

    return NextResponse.json({
      success: true,
      images: finalResults,
      query,
      subject,
      totalFound: combinedResults.length,
      sources: sources.map(source => ({ source, status: 'searched' }))
    });

  } catch (error) {
    console.error('❌ Enhanced image search error:', error);
    return NextResponse.json(
      { 
      success: false,
        error: 'Enhanced image search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        images: []
      },
      { status: 500 }
    );
  }
}

async function searchInSource(
  source: string,
  query: string,
  subject: string,
  limit: number
): Promise<ImageResult[]> {
  try {
    switch (source) {
      case 'unsplash':
        return await searchUnsplash(query, subject, limit);
      case 'pixabay':
        return await searchPixabay(query, subject, limit);
      case 'wikimedia':
        return await searchWikimedia(query, subject, limit);
      default:
        return [];
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao buscar em ${source}:`, error);
    return [];
  }
}

async function searchUnsplash(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return [];

  try {
    // Otimizar query para educação
    const optimizedQuery = optimizeQueryForEducation(query, subject);
    
    const params = new URLSearchParams({
      query: optimizedQuery,
      per_page: limit.toString(),
      orientation: 'landscape',
      content_filter: 'high',
      color: 'blue,green', // Cores mais educacionais
      order_by: 'relevant' // Priorizar relevância
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params}`,
      {
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.results.map((photo: any) => ({
      url: photo.urls.regular,
      source: 'unsplash',
      title: photo.description || photo.alt_description || '',
      description: photo.description || photo.alt_description || '',
      author: photo.user?.name || 'Unsplash',
      width: photo.width,
      height: photo.height,
      tags: photo.tags?.map((tag: any) => tag.title) || [],
      relevanceScore: 0,
      educationalSuitability: 0
    }));
  } catch (error) {
    console.error('Erro ao buscar Unsplash:', error);
    return [];
  }
}

async function searchPixabay(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!process.env.PIXABAY_API_KEY) return [];

  try {
    const optimizedQuery = optimizeQueryForEducation(query, subject);
    
    const params = new URLSearchParams({
      key: process.env.PIXABAY_API_KEY,
      q: optimizedQuery,
      per_page: limit.toString(),
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'education,science,nature',
      min_width: '1200', // Aumentado de 1000 para 1200
      min_height: '900', // Aumentado de 800 para 900
      safesearch: 'true',
      order: 'popular' // Priorizar imagens populares
    });

    const response = await fetch(`https://pixabay.com/api/?${params}`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.hits.map((hit: any) => ({
      url: hit.webformatURL,
      source: 'pixabay',
      title: hit.tags,
      description: hit.tags,
      author: hit.user,
      width: hit.imageWidth,
      height: hit.imageHeight,
      tags: hit.tags.split(', '),
      relevanceScore: 0,
      educationalSuitability: 0
    }));
  } catch (error) {
    console.error('Erro ao buscar Pixabay:', error);
    return [];
  }
}

async function searchWikimedia(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  try {
    const optimizedQuery = optimizeQueryForEducation(query, subject);
    
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(optimizedQuery)}&srnamespace=6&srlimit=${limit}&srprop=size&origin=*`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'HubEdu-IA/1.0 (Educational Content Generator)',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });
    
    if (!response.ok) return [];

    const data = await response.json();
    
    if (!data.query?.search || data.query.search.length === 0) {
      return [];
    }

    const imageTitles = data.query.search.map((item: any) => item.title);
    const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${imageTitles.join('|')}&prop=imageinfo&iiprop=url|size|mime&origin=*`;
    
    const imageInfoResponse = await fetch(imageInfoUrl, {
      headers: {
        'User-Agent': 'HubEdu-IA/1.0 (Educational Content Generator)',
        'Accept': 'application/json',
      },
      timeout: 15000,
    });
    
    if (!imageInfoResponse.ok) return [];

    const imageInfoData = await imageInfoResponse.json();
    
    if (!imageInfoData.query?.pages) return [];
    
    const pages = imageInfoData.query.pages;
    const validPages = Object.values(pages).filter((page: any) => 
      page && page.imageinfo && Array.isArray(page.imageinfo) && page.imageinfo.length > 0
    );
    
    return validPages.map((page: any) => ({
      url: page.imageinfo?.[0]?.url || '',
      source: 'wikimedia',
      title: page.title || 'Untitled',
      description: page.title || 'Wikimedia Commons image',
      author: 'Wikimedia Commons',
      width: page.imageinfo?.[0]?.width || 0,
      height: page.imageinfo?.[0]?.height || 0,
      tags: [],
      relevanceScore: 0,
      educationalSuitability: 0
    })).filter(img => img.url && img.url.startsWith('http'));
  } catch (error) {
    console.error('Erro ao buscar Wikimedia:', error);
    return [];
  }
}

function optimizeQueryForEducation(query: string, subject: string): string {
  const subjectKeywords = EDUCATIONAL_KEYWORDS[subject.toLowerCase() as keyof typeof EDUCATIONAL_KEYWORDS] || [];
  
  // Adicionar palavras-chave educacionais específicas
  const educationalTerms = ['education', 'learning', 'teaching', 'school', 'classroom', 'study', 'academic', 'student', 'teacher'];
  const optimizedTerms = [...subjectKeywords.slice(0, 2), ...educationalTerms.slice(0, 2)]; // Limitar para evitar queries muito longas
  
  // Combinar query original com termos otimizados
  const combinedQuery = `${query} ${optimizedTerms.join(' ')}`;
  
  // Limitar tamanho da query para evitar problemas com APIs
  const words = combinedQuery.trim().split(' ').slice(0, 6); // Máximo 6 palavras
  
  return words.join(' ');
}

function filterAndScoreImages(
  images: ImageResult[],
  query: string,
  subject: string,
  grade: string,
  preferredDimensions: { width: number; height: number }
): ImageResult[] {
  return images
    .map(image => {
      // Calcular pontuação de relevância
      image.relevanceScore = calculateRelevanceScore(image, query, subject);
      
      // Calcular adequação educacional
      image.educationalSuitability = calculateEducationalSuitability(image, subject, grade);
      
      // Adicionar URL redimensionada
      image.resizedUrl = resizeImageUrl(image.url, preferredDimensions.width, preferredDimensions.height);
      
      return image;
    })
    .filter(image => {
      // Filtrar imagens inadequadas (mais rigoroso)
      return image.relevanceScore > 0.4 && // Aumentado de 0.2 para 0.4
             image.educationalSuitability > 0.5 && // Aumentado de 0.3 para 0.5
             image.width > 1000 && // Aumentado de 800 para 1000
             image.height > 700; // Aumentado de 600 para 700
    })
    .sort((a, b) => {
      // Ordenar por pontuação combinada
      const scoreA = (a.relevanceScore * 0.4) + (a.educationalSuitability * 0.6);
      const scoreB = (b.relevanceScore * 0.4) + (b.educationalSuitability * 0.6);
      
      // Bonus para dimensões próximas às preferidas
      const dimensionBonusA = calculateDimensionBonus(a, preferredDimensions);
      const dimensionBonusB = calculateDimensionBonus(b, preferredDimensions);
      
      return (scoreB + dimensionBonusB) - (scoreA + dimensionBonusA);
    });
}

function calculateRelevanceScore(image: ImageResult, query: string, subject: string): number {
    const text = `${image.title} ${image.description} ${image.tags.join(' ')}`.toLowerCase();
    const queryLower = query.toLowerCase();
    const subjectLower = subject.toLowerCase();
    
    let score = 0;
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    
    // Correspondências exatas na query (peso maior)
    queryWords.forEach(word => {
      if (text.includes(word)) {
        score += 2; // Aumentado de 1 para 2
      }
    });
    
    // Bonus por correspondência exata com assunto
    if (text.includes(subjectLower)) {
      score += 1.5; // Aumentado de 0.5 para 1.5
    }
    
    // Bonus por palavras-chave educacionais específicas
    const educationalKeywords = ['educational', 'education', 'learning', 'teaching', 'school', 'classroom', 'study', 'academic', 'student', 'teacher'];
    educationalKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 0.5; // Aumentado de 0.3 para 0.5
      }
    });
    
    // Bonus por palavras-chave específicas da matéria
    const subjectKeywords = EDUCATIONAL_KEYWORDS[subject.toLowerCase() as keyof typeof EDUCATIONAL_KEYWORDS] || [];
    subjectKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1; // Novo: bonus por palavras-chave da matéria
      }
    });
    
    // Penalty por conteúdo não educacional
    const nonEducationalKeywords = ['business', 'corporate', 'marketing', 'advertising', 'fashion', 'lifestyle', 'entertainment'];
    nonEducationalKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score -= 1; // Penalty por conteúdo não educacional
      }
    });
    
    // Normalizar para 0-1, mas ser mais exigente
    const maxPossibleScore = queryWords.length * 2 + 1.5 + educationalKeywords.length * 0.5 + subjectKeywords.length;
    return Math.min(1, Math.max(0, score / Math.max(1, maxPossibleScore * 0.7))); // Mais rigoroso
  }

function calculateEducationalSuitability(image: ImageResult, subject: string, grade: string): number {
  let score = 0.3; // Base score reduzido para ser mais rigoroso
  
  // Bonus por fonte educacional (maior peso)
  if (image.source === 'wikimedia') {
    score += 0.4; // Aumentado de 0.3 para 0.4
  } else if (image.source === 'unsplash') {
    score += 0.2; // Bonus para Unsplash também
  }
  
  // Bonus por qualidade da imagem (mais rigoroso)
  if (image.width > 1200 && image.height > 800) {
    score += 0.3; // Aumentado de 0.2 para 0.3
  } else if (image.width > 1000 && image.height > 600) {
    score += 0.1; // Bonus menor para imagens menores
  }
  
  // Bonus por tags educacionais (mais rigoroso)
  const educationalTags = ['education', 'learning', 'teaching', 'school', 'classroom', 'study', 'academic', 'student', 'teacher', 'knowledge'];
  const hasEducationalTag = image.tags.some(tag => 
    educationalTags.some(eduTag => tag.toLowerCase().includes(eduTag))
  );
  if (hasEducationalTag) {
    score += 0.3; // Aumentado de 0.2 para 0.3
  }
  
  // Bonus por título/descrição educacional
  const text = `${image.title} ${image.description}`.toLowerCase();
  const educationalTerms = ['education', 'learning', 'teaching', 'school', 'classroom', 'study', 'academic', 'student', 'teacher', 'knowledge', 'lesson', 'course'];
  const educationalTermCount = educationalTerms.filter(term => text.includes(term)).length;
  if (educationalTermCount > 0) {
    score += Math.min(0.2, educationalTermCount * 0.05); // Bonus proporcional
  }
  
  // Penalty por conteúdo inadequado (mais rigoroso)
  const inappropriateKeywords = ['adult', 'sexy', 'violence', 'weapon', 'gore', 'business', 'corporate', 'marketing', 'advertising', 'fashion', 'lifestyle'];
  inappropriateKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 0.8; // Aumentado penalty de 0.5 para 0.8
    }
  });
  
  // Penalty por imagens muito pequenas
  if (image.width < 800 || image.height < 600) {
    score -= 0.3; // Penalty por imagens pequenas
  }
  
  return Math.max(0, Math.min(1, score));
}

function calculateDimensionBonus(image: ImageResult, preferredDimensions: { width: number; height: number }): number {
  const { width: prefWidth, height: prefHeight } = preferredDimensions;
  const { width: imgWidth, height: imgHeight } = image;
  
  // Calcular proporção preferida
  const preferredRatio = prefWidth / prefHeight;
  const imageRatio = imgWidth / imgHeight;
  
  // Bonus por proporção similar
  const ratioDiff = Math.abs(preferredRatio - imageRatio);
  const ratioBonus = Math.max(0, 0.2 - ratioDiff);
  
  // Bonus por tamanho adequado
  const sizeBonus = imgWidth >= prefWidth * 0.8 && imgHeight >= prefHeight * 0.8 ? 0.1 : 0;
  
  return ratioBonus + sizeBonus;
}

function resizeImageUrl(url: string, width: number, height: number): string {
  if (!url) return url;
  
  // Para Unsplash
  if (url.includes('unsplash.com')) {
    return url.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
  }
  
  // Para Pixabay
  if (url.includes('pixabay.com')) {
    return url.replace(/_\d+x\d+\./, `_${width}x${height}.`);
  }
  
  // Para Wikimedia Commons
  if (url.includes('wikimedia.org')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('width', width.toString());
    urlObj.searchParams.set('height', height.toString());
    return urlObj.toString();
  }
  
  return url;
}

function generateIntelligentFallbacks(query: string, subject: string, count: number): ImageResult[] {
  const fallbacks: ImageResult[] = [];
  
  // Fallbacks específicos por matéria com alta qualidade educacional
  const subjectFallbacks: Record<string, string[]> = {
    'matemática': [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1350&h=1080&fit=crop&auto=format&q=80'
    ],
    'ciências': [
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format&q=80'
    ],
    'história': [
      'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format&q=80'
    ],
    'geografia': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format&q=80'
    ],
    'português': [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format&q=80'
    ],
    'física': [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format&q=80'
    ],
    'química': [
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format&q=80'
    ],
    'biologia': [
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1350&h=1080&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1350&h=1080&fit=crop&auto=format&q=80'
    ]
  };
  
  // Fallbacks gerais educacionais de alta qualidade
  const generalFallbacks = [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1350&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1350&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1350&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1523240798035-41f1c6b5f7d0?w=1350&h=1080&fit=crop&auto=format&q=80'
  ];
  
  // Usar fallbacks específicos da matéria primeiro
  const specificFallbacks = subjectFallbacks[subject.toLowerCase()] || [];
  const allFallbacks = [...specificFallbacks, ...generalFallbacks];
  
  for (let i = 0; i < count && i < allFallbacks.length; i++) {
    fallbacks.push({
      url: allFallbacks[i],
      source: 'unsplash-fallback',
      title: `Imagem educacional para ${subject}`,
      description: `Imagem de alta qualidade para o tema ${query}`,
      author: 'Unsplash',
      width: 1350,
      height: 1080,
      tags: [subject.toLowerCase(), 'education', 'learning', 'high-quality'],
      relevanceScore: 0.4, // Aumentado de 0.3 para 0.4
      educationalSuitability: 0.8, // Aumentado de 0.7 para 0.8
      resizedUrl: allFallbacks[i]
    });
  }
  
  return fallbacks;
}