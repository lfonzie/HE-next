import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

interface ImageResult {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  author: string;
  authorUrl?: string;
  source: 'unsplash' | 'pixabay' | 'wikimedia' | 'pexels';
  width: number;
  height: number;
  tags: string[];
  relevanceScore: number;
  educationalSuitability: number;
  qualityScore: number;
  downloadUrl?: string;
}

interface SearchResult {
  success: boolean;
  images: ImageResult[];
  totalFound: number;
  sourcesUsed: string[];
  query: string;
  optimizedQuery: string;
  fallbackUsed: boolean;
}

// Configurações dos provedores
const PROVIDERS = {
  unsplash: {
    name: 'Unsplash',
    apiKey: process.env.UNSPLASH_ACCESS_KEY,
    baseUrl: 'https://api.unsplash.com',
    endpoint: '/search/photos',
    quality: 'excellent',
    educationalContent: 'high'
  },
  pixabay: {
    name: 'Pixabay',
    apiKey: process.env.PIXABAY_API_KEY,
    baseUrl: 'https://pixabay.com/api',
    endpoint: '/',
    quality: 'good',
    educationalContent: 'medium'
  },
  wikimedia: {
    name: 'Wikimedia Commons',
    apiKey: null,
    baseUrl: 'https://commons.wikimedia.org/w/api.php',
    endpoint: '',
    quality: 'variable',
    educationalContent: 'excellent'
  }
};

// Palavras-chave educacionais para otimizar buscas
const EDUCATIONAL_KEYWORDS = {
  biology: ['biology', 'science', 'laboratory', 'research', 'microscope', 'cell', 'organism', 'nature', 'ecosystem'],
  chemistry: ['chemistry', 'laboratory', 'experiment', 'molecule', 'atom', 'reaction', 'chemical', 'science'],
  physics: ['physics', 'experiment', 'laboratory', 'science', 'energy', 'force', 'motion', 'wave', 'particle'],
  math: ['mathematics', 'math', 'equation', 'formula', 'graph', 'chart', 'calculation', 'geometry', 'algebra'],
  history: ['history', 'historical', 'ancient', 'medieval', 'renaissance', 'civilization', 'culture', 'heritage'],
  geography: ['geography', 'landscape', 'nature', 'environment', 'climate', 'terrain', 'geological', 'earth'],
  general: ['education', 'learning', 'study', 'academic', 'school', 'university', 'knowledge', 'teaching']
};

// Função para otimizar query para educação
function optimizeQueryForEducation(query: string, subject?: string): string {
  const cleanQuery = query.toLowerCase().trim();
  
  // Se já contém palavras educacionais, manter como está
  const hasEducationalTerms = Object.values(EDUCATIONAL_KEYWORDS).some(keywords => 
    keywords.some(keyword => cleanQuery.includes(keyword))
  );
  
  if (hasEducationalTerms) {
    return query;
  }
  
  // Adicionar contexto educacional baseado no assunto
  let educationalContext = '';
  if (subject) {
    const subjectKey = subject.toLowerCase().replace(/[^a-z]/g, '');
    if (EDUCATIONAL_KEYWORDS[subjectKey as keyof typeof EDUCATIONAL_KEYWORDS]) {
      const keywords = EDUCATIONAL_KEYWORDS[subjectKey as keyof typeof EDUCATIONAL_KEYWORDS];
      educationalContext = ` ${keywords[0]} ${keywords[1]}`;
    }
  }
  
  // Adicionar termos educacionais gerais se não especificado
  if (!educationalContext) {
    educationalContext = ' education learning';
  }
  
  return `${query}${educationalContext}`.trim();
}

// Função para calcular score de relevância educacional
function calculateEducationalScore(image: any, query: string, subject?: string): number {
  let score = 0;
  
  // Score baseado no título e descrição
  const text = `${image.title || ''} ${image.description || ''}`.toLowerCase();
  const queryWords = query.toLowerCase().split(' ');
  
  // Contar palavras-chave da query presentes
  const matchingWords = queryWords.filter(word => 
    word.length > 2 && text.includes(word)
  );
  score += matchingWords.length * 10;
  
  // Bonus para termos educacionais
  const educationalTerms = Object.values(EDUCATIONAL_KEYWORDS).flat();
  const educationalMatches = educationalTerms.filter(term => 
    text.includes(term.toLowerCase())
  );
  score += educationalMatches.length * 5;
  
  // Bonus para qualidade da imagem
  if (image.width && image.height) {
    const aspectRatio = image.width / image.height;
    // Preferir imagens com proporção adequada para slides
    if (aspectRatio >= 1.2 && aspectRatio <= 2.0) {
      score += 5;
    }
  }
  
  // Bonus por fonte confiável
  if (image.source === 'wikimedia') score += 10;
  if (image.source === 'unsplash') score += 8;
  if (image.source === 'pixabay') score += 6;
  
  return Math.min(score, 100); // Cap em 100
}

// Buscar no Unsplash
async function searchUnsplash(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!PROVIDERS.unsplash.apiKey) return [];
  
  try {
    const optimizedQuery = optimizeQueryForEducation(query, subject);
    const params = new URLSearchParams({
      query: optimizedQuery,
      per_page: Math.min(limit, 30).toString(),
      orientation: 'landscape',
      content_filter: 'high',
      order_by: 'relevant'
    });
    
    const response = await fetch(
      `${PROVIDERS.unsplash.baseUrl}${PROVIDERS.unsplash.endpoint}?${params}`,
      {
        headers: {
          'Authorization': `Client-ID ${PROVIDERS.unsplash.apiKey}`,
          'Accept-Version': 'v1'
        }
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.results.map((photo: any) => ({
      id: `unsplash_${photo.id}`,
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      title: photo.description || photo.alt_description || '',
      description: photo.description || photo.alt_description || '',
      author: photo.user?.name || 'Unsplash',
      authorUrl: photo.user?.links?.html,
      source: 'unsplash' as const,
      width: photo.width,
      height: photo.height,
      tags: photo.tags?.map((tag: any) => tag.title) || [],
      relevanceScore: calculateEducationalScore(photo, query, subject),
      educationalSuitability: 0,
      qualityScore: 0,
      downloadUrl: photo.links?.download_location
    }));
  } catch (error) {
    console.error('Erro ao buscar Unsplash:', error);
    return [];
  }
}

// Buscar no Pixabay
async function searchPixabay(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!PROVIDERS.pixabay.apiKey) return [];
  
  try {
    const optimizedQuery = optimizeQueryForEducation(query, subject);
    const params = new URLSearchParams({
      key: PROVIDERS.pixabay.apiKey,
      q: optimizedQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'education,science',
      min_width: '800',
      min_height: '600',
      per_page: Math.min(limit, 200).toString(),
      safesearch: 'true',
      order: 'popular'
    });
    
    const response = await fetch(`${PROVIDERS.pixabay.baseUrl}${PROVIDERS.pixabay.endpoint}?${params}`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.hits.map((photo: any) => ({
      id: `pixabay_${photo.id}`,
      url: photo.webformatURL,
      thumbnail: photo.previewURL,
      title: photo.tags || '',
      description: photo.tags || '',
      author: photo.user || 'Pixabay',
      source: 'pixabay' as const,
      width: photo.webformatWidth,
      height: photo.webformatHeight,
      tags: photo.tags.split(', ').map((tag: string) => tag.trim()),
      relevanceScore: calculateEducationalScore(photo, query, subject),
      educationalSuitability: 0,
      qualityScore: 0
    }));
  } catch (error) {
    console.error('Erro ao buscar Pixabay:', error);
    return [];
  }
}

// Buscar no Wikimedia Commons
async function searchWikimedia(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  try {
    const optimizedQuery = optimizeQueryForEducation(query, subject);
    
    // Buscar no Wikimedia Commons
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(optimizedQuery)}&srnamespace=6&srlimit=${Math.min(limit, 50)}&srprop=size&origin=*`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (!data.query || !data.query.search || data.query.search.length === 0) {
      return [];
    }
    
    // Buscar informações detalhadas das imagens
    const imageTitles = data.query.search.map((item: any) => item.title);
    const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${imageTitles.join('|')}&prop=imageinfo&iiprop=url|size|mime&origin=*`;
    
    const imageInfoResponse = await fetch(imageInfoUrl);
    if (!imageInfoResponse.ok) return [];
    
    const imageInfoData = await imageInfoResponse.json();
    
    const results: ImageResult[] = [];
    const pages = imageInfoData.query.pages;
    
    for (const pageId in pages) {
      const page = pages[pageId];
      if (page.imageinfo && page.imageinfo.length > 0) {
        const imageInfo = page.imageinfo[0];
        
        // Filtrar apenas arquivos de imagem válidos
        const isValidImage = imageInfo.mime && (
          imageInfo.mime.startsWith('image/') ||
          imageInfo.mime === 'image/jpeg' ||
          imageInfo.mime === 'image/png' ||
          imageInfo.mime === 'image/gif' ||
          imageInfo.mime === 'image/webp' ||
          imageInfo.mime === 'image/svg+xml'
        );
        
        const isImageUrl = imageInfo.url && (
          imageInfo.url.includes('.jpg') ||
          imageInfo.url.includes('.jpeg') ||
          imageInfo.url.includes('.png') ||
          imageInfo.url.includes('.gif') ||
          imageInfo.url.includes('.webp') ||
          imageInfo.url.includes('.svg') ||
          imageInfo.url.includes('commons/')
        );
        
        if (isValidImage && isImageUrl) {
          const imageData = {
            id: `wikimedia_${pageId}`,
            url: imageInfo.url,
            title: page.title.replace('File:', ''),
            description: page.title.replace('File:', ''),
            author: 'Wikimedia Commons',
            source: 'wikimedia' as const,
            width: imageInfo.width || 0,
            height: imageInfo.height || 0,
            tags: [],
            relevanceScore: calculateEducationalScore({ title: page.title }, query, subject),
            educationalSuitability: 0,
            qualityScore: 0
          };
          
          results.push(imageData);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Erro ao buscar Wikimedia:', error);
    return [];
  }
}

// Função principal de busca inteligente
async function smartImageSearch(query: string, subject?: string, count: number = 3): Promise<SearchResult> {
  console.log(`🔍 Busca inteligente de imagens para: "${query}" (assunto: ${subject || 'geral'})`);
  
  const optimizedQuery = optimizeQueryForEducation(query, subject);
  const sourcesUsed: string[] = [];
  let allImages: ImageResult[] = [];
  
  // Buscar em paralelo nos 3 provedores
  const searchPromises = [
    searchUnsplash(query, subject || 'general', count),
    searchPixabay(query, subject || 'general', count),
    searchWikimedia(query, subject || 'general', count)
  ];
  
  try {
    const results = await Promise.allSettled(searchPromises);
    
    results.forEach((result, index) => {
      const providerNames = ['unsplash', 'pixabay', 'wikimedia'];
      const providerName = providerNames[index];
      
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allImages = allImages.concat(result.value);
        sourcesUsed.push(providerName);
        console.log(`✅ ${providerName}: ${result.value.length} imagens encontradas`);
      } else {
        console.log(`❌ ${providerName}: falha na busca`);
      }
    });
    
    // Ordenar por relevância educacional
    allImages.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Remover duplicatas baseadas na URL
    const uniqueImages = allImages.filter((image, index, self) => 
      index === self.findIndex(img => img.url === image.url)
    );
    
    // Selecionar as melhores imagens
    const bestImages = uniqueImages.slice(0, count);
    
    console.log(`🎯 Total de imagens únicas encontradas: ${uniqueImages.length}`);
    console.log(`🏆 Melhores ${bestImages.length} imagens selecionadas`);
    
    return {
      success: bestImages.length > 0,
      images: bestImages,
      totalFound: uniqueImages.length,
      sourcesUsed,
      query,
      optimizedQuery,
      fallbackUsed: false
    };
    
  } catch (error) {
    console.error('Erro na busca inteligente:', error);
    return {
      success: false,
      images: [],
      totalFound: 0,
      sourcesUsed: [],
      query,
      optimizedQuery,
      fallbackUsed: true
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, subject, count = 3 } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query é obrigatória e deve ser uma string' },
        { status: 400 }
      );
    }
    
    const result = await smartImageSearch(query, subject, Math.min(count, 10));
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Erro na API de busca inteligente:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        images: [],
        totalFound: 0,
        sourcesUsed: [],
        fallbackUsed: true
      },
      { status: 500 }
    );
  }
}
