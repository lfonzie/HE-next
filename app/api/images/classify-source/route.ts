import { NextRequest, NextResponse } from 'next/server';

interface ImageSource {
  source: 'unsplash' | 'wikimedia' | 'pixabay' | 'pexels' | 'nasa' | 'smithsonian';
  name: string;
  quality: 'excellent' | 'good' | 'variable';
  educationalValue: 'high' | 'medium' | 'low';
  reliability: 'high' | 'medium' | 'low';
  license: string;
  attribution: string;
}

interface ClassifiedImage {
  url: string;
  source: ImageSource;
  relevanceScore: number;
  themeMatch: number;
  educationalSuitability: number;
  classification: {
    subject: string;
    grade: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
  };
}

const SOURCE_CONFIG: Record<string, ImageSource> = {
  unsplash: {
    source: 'unsplash',
    name: 'Unsplash',
    quality: 'excellent',
    educationalValue: 'medium',
    reliability: 'high',
    license: 'Unsplash License',
    attribution: 'Photo by [Author] on Unsplash'
  },
  wikimedia: {
    source: 'wikimedia',
    name: 'Wikimedia Commons',
    quality: 'variable',
    educationalValue: 'high',
    reliability: 'high',
    license: 'Creative Commons',
    attribution: 'Wikimedia Commons'
  },
  pixabay: {
    source: 'pixabay',
    name: 'Pixabay',
    quality: 'good',
    educationalValue: 'medium',
    reliability: 'high',
    license: 'Pixabay License',
    attribution: 'Image by [Author] from Pixabay'
  },
  pexels: {
    source: 'pexels',
    name: 'Pexels',
    quality: 'excellent',
    educationalValue: 'medium',
    reliability: 'high',
    license: 'Pexels License',
    attribution: 'Photo by [Author] from Pexels'
  },
  nasa: {
    source: 'nasa',
    name: 'NASA Image Library',
    quality: 'excellent',
    educationalValue: 'high',
    reliability: 'high',
    license: 'Public Domain',
    attribution: 'NASA'
  },
  smithsonian: {
    source: 'smithsonian',
    name: 'Smithsonian Open Access',
    quality: 'excellent',
    educationalValue: 'high',
    reliability: 'high',
    license: 'CC0',
    attribution: 'Smithsonian Institution'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, subject, grade, count = 1 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Classificando imagens para:', query, 'Matéria:', subject);

    // Buscar imagens de múltiplas fontes
    const imageResults = await searchMultipleSources(query, subject, count);
    
    // Classificar e pontuar as imagens
    const classifiedImages = await classifyImages(imageResults, query, subject, grade);
    
    // Ordenar por relevância e qualidade educacional
    classifiedImages.sort((a, b) => {
      const scoreA = (a.relevanceScore * 0.4) + (a.themeMatch * 0.3) + (a.educationalSuitability * 0.3);
      const scoreB = (b.relevanceScore * 0.4) + (b.themeMatch * 0.3) + (b.educationalSuitability * 0.3);
      return scoreB - scoreA;
    });

    return NextResponse.json({
      success: true,
      images: classifiedImages.slice(0, count),
      query,
      subject,
      totalFound: classifiedImages.length,
      sources: Object.keys(SOURCE_CONFIG).map(key => ({
        source: key,
        ...SOURCE_CONFIG[key]
      }))
    });

  } catch (error) {
    console.error('❌ Erro na classificação de imagens:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao classificar imagens',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

async function searchMultipleSources(query: string, subject: string, count: number): Promise<any[]> {
  const results: any[] = [];
  const sources = ['wikimedia', 'unsplash', 'pixabay', 'pexels', 'nasa'];
  
  // Buscar em paralelo de múltiplas fontes
  const searchPromises = sources.map(async (source) => {
    try {
      switch (source) {
        case 'wikimedia':
          return await searchWikimedia(query, Math.ceil(count / 2));
        case 'unsplash':
          return await searchUnsplash(query, Math.ceil(count / 2));
        case 'pixabay':
          return await searchPixabay(query, Math.ceil(count / 2));
        case 'pexels':
          return await searchPexels(query, Math.ceil(count / 2));
        case 'nasa':
          return await searchNASA(query, Math.ceil(count / 2));
        default:
          return [];
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar em ${source}:`, error);
      return [];
    }
  });

  const sourceResults = await Promise.all(searchPromises);
  sourceResults.forEach(sourceResult => {
    results.push(...sourceResult);
  });

  return results;
}

async function searchWikimedia(query: string, limit: number): Promise<any[]> {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${limit}&srprop=size&origin=*`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.query?.search) return [];

    const imageTitles = data.query.search.map((item: any) => item.title);
    const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${imageTitles.join('|')}&prop=imageinfo&iiprop=url|size|mime&origin=*`;
    
    const imageInfoResponse = await fetch(imageInfoUrl);
    if (!imageInfoResponse.ok) return [];

    const imageInfoData = await imageInfoResponse.json();
    const pages = imageInfoData.query.pages;
    
    return Object.values(pages).map((page: any) => ({
      url: page.imageinfo?.[0]?.url || null,
      source: 'wikimedia',
      title: page.title,
      description: page.title,
      author: 'Wikimedia Commons',
      width: page.imageinfo?.[0]?.width || 0,
      height: page.imageinfo?.[0]?.height || 0
    })).filter(img => img.url);
  } catch (error) {
    console.error('Erro ao buscar Wikimedia:', error);
    return [];
  }
}

async function searchUnsplash(query: string, limit: number): Promise<any[]> {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) return [];

    const params = new URLSearchParams({
      query,
      per_page: limit.toString(),
      orientation: 'landscape',
      content_filter: 'high'
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
      title: photo.description || photo.alt_description,
      description: photo.description || photo.alt_description,
      author: photo.user.name,
      width: photo.width,
      height: photo.height,
      tags: photo.tags?.map((tag: any) => tag.title) || []
    }));
  } catch (error) {
    console.error('Erro ao buscar Unsplash:', error);
    return [];
  }
}

async function searchPixabay(query: string, limit: number): Promise<any[]> {
  try {
    if (!process.env.PIXABAY_API_KEY) return [];

    const params = new URLSearchParams({
      key: process.env.PIXABAY_API_KEY,
      q: query,
      per_page: limit.toString(),
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'education,science,nature',
      min_width: 800,
      min_height: 600
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
      tags: hit.tags.split(', ')
    }));
  } catch (error) {
    console.error('Erro ao buscar Pixabay:', error);
    return [];
  }
}

async function searchPexels(query: string, limit: number): Promise<any[]> {
  try {
    if (!process.env.PEXELS_API_KEY) return [];

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`,
      {
        headers: {
          'Authorization': process.env.PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.photos.map((photo: any) => ({
      url: photo.src.medium,
      source: 'pexels',
      title: photo.alt,
      description: photo.alt,
      author: photo.photographer,
      width: photo.width,
      height: photo.height,
      tags: []
    }));
  } catch (error) {
    console.error('Erro ao buscar Pexels:', error);
    return [];
  }
}

async function searchNASA(query: string, limit: number): Promise<any[]> {
  try {
    const response = await fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=${limit}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.collection.items.map((item: any) => ({
      url: item.links?.[0]?.href,
      source: 'nasa',
      title: item.data?.[0]?.title,
      description: item.data?.[0]?.description,
      author: 'NASA',
      width: 0,
      height: 0,
      tags: item.data?.[0]?.keywords || []
    })).filter(img => img.url);
  } catch (error) {
    console.error('Erro ao buscar NASA:', error);
    return [];
  }
}

async function classifyImages(images: any[], query: string, subject: string, grade?: string): Promise<ClassifiedImage[]> {
  return images.map(image => {
    const sourceConfig = SOURCE_CONFIG[image.source];
    
    // Calcular pontuação de relevância baseada no título/descrição
    const relevanceScore = calculateRelevanceScore(image.title || image.description || '', query);
    
    // Calcular compatibilidade com o tema
    const themeMatch = calculateThemeMatch(image, subject);
    
    // Calcular adequação educacional
    const educationalSuitability = calculateEducationalSuitability(image, subject, grade);
    
    // Classificar por assunto e dificuldade
    const classification = classifyBySubject(image, subject, grade);

    return {
      url: image.url,
      source: sourceConfig,
      relevanceScore,
      themeMatch,
      educationalSuitability,
      classification
    };
  });
}

function calculateRelevanceScore(text: string, query: string): number {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Pontuação baseada em correspondências exatas
  let score = 0;
  const queryWords = queryLower.split(' ');
  
  queryWords.forEach(word => {
    if (textLower.includes(word)) {
      score += 1;
    }
  });
  
  // Normalizar para 0-1
  return Math.min(1, score / queryWords.length);
}

function calculateThemeMatch(image: any, subject: string): number {
  const subjectKeywords: Record<string, string[]> = {
    'biologia': ['biology', 'nature', 'plant', 'animal', 'cell', 'dna', 'evolution'],
    'química': ['chemistry', 'molecule', 'atom', 'reaction', 'laboratory', 'chemical'],
    'física': ['physics', 'energy', 'force', 'motion', 'wave', 'particle', 'quantum'],
    'matemática': ['math', 'mathematics', 'geometry', 'algebra', 'equation', 'graph'],
    'história': ['history', 'ancient', 'war', 'civilization', 'culture', 'historical'],
    'geografia': ['geography', 'map', 'country', 'landscape', 'climate', 'earth']
  };
  
  const keywords = subjectKeywords[subject.toLowerCase()] || [];
  const imageText = (image.title + ' ' + image.description + ' ' + (image.tags?.join(' ') || '')).toLowerCase();
  
  let matches = 0;
  keywords.forEach(keyword => {
    if (imageText.includes(keyword)) {
      matches++;
    }
  });
  
  return Math.min(1, matches / keywords.length);
}

function calculateEducationalSuitability(image: any, subject: string, grade?: string): number {
  let score = 0.5; // Base score
  
  // Bonus por fonte educacional
  if (image.source === 'wikimedia' || image.source === 'nasa' || image.source === 'smithsonian') {
    score += 0.3;
  }
  
  // Bonus por qualidade da imagem
  if (image.width > 1000 && image.height > 600) {
    score += 0.2;
  }
  
  // Penalty por conteúdo inadequado
  const inappropriateKeywords = ['adult', 'sexy', 'violence', 'weapon'];
  const imageText = (image.title + ' ' + image.description).toLowerCase();
  inappropriateKeywords.forEach(keyword => {
    if (imageText.includes(keyword)) {
      score -= 0.5;
    }
  });
  
  return Math.max(0, Math.min(1, score));
}

function classifyBySubject(image: any, subject: string, grade?: string) {
  const gradeLevel = grade || '5';
  const difficulty = parseInt(gradeLevel) <= 6 ? 'easy' : parseInt(gradeLevel) <= 9 ? 'medium' : 'hard';
  
  const tags = [];
  if (image.tags) {
    tags.push(...image.tags.slice(0, 5));
  }
  
  return {
    subject: subject.toLowerCase(),
    grade: gradeLevel,
    difficulty,
    tags
  };
}
