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
  source: 'unsplash' | 'pixabay' | 'wikimedia' | 'bing' | 'pexels';
  width: number;
  height: number;
  tags: string[];
  relevanceScore: number;
  educationalSuitability: number;
  qualityScore: number;
  downloadUrl?: string;
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
  },
  bing: {
    name: 'Bing Image Search',
    apiKey: process.env.BING_SEARCH_API_KEY,
    baseUrl: 'https://api.bing.microsoft.com/v7.0/images/search',
    endpoint: '',
    quality: 'good',
    educationalContent: 'medium'
  },
  pexels: {
    name: 'Pexels',
    apiKey: process.env.PEXELS_API_KEY,
    baseUrl: 'https://api.pexels.com/v1',
    endpoint: '/search',
    quality: 'excellent',
    educationalContent: 'medium'
  }
};

// Função para calcular score de relevância educacional
function calculateEducationalScore(image: any, query: string, subject?: string): number {
  let score = 0;
  
  const text = `${image.title || ''} ${image.description || ''}`.toLowerCase();
  const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
  
  queryWords.forEach(word => {
    if (text.includes(word)) {
      score += 20;
    }
  });
  
  if (image.width && image.height) {
    const aspectRatio = image.width / image.height;
    if (aspectRatio >= 1.2 && aspectRatio <= 2.0) {
      score += 5;
    }
  }
  
  if (image.source === 'wikimedia') score += 10;
  if (image.source === 'unsplash') score += 8;
  if (image.source === 'pixabay') score += 6;
  if (image.source === 'bing') score += 7;
  if (image.source === 'pexels') score += 9;
  
  return Math.max(0, Math.min(100, score));
}

// Buscar no Unsplash
async function searchUnsplash(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!PROVIDERS.unsplash.apiKey) {
    throw new Error('UNSPLASH_ACCESS_KEY não configurada');
  }
  
  try {
    const params = new URLSearchParams({
      query,
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
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
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
    throw error;
  }
}

// Buscar no Pixabay
async function searchPixabay(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!PROVIDERS.pixabay.apiKey) {
    throw new Error('PIXABAY_API_KEY não configurada');
  }
  
  try {
    const params = new URLSearchParams({
      key: PROVIDERS.pixabay.apiKey,
      q: query,
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
    
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }
    
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
    throw error;
  }
}

// Buscar no Wikimedia Commons
async function searchWikimedia(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  try {
    const searchQuery = `${query} -filetype:pdf -filetype:doc -filetype:docx filetype:jpg OR filetype:png OR filetype:gif OR filetype:svg OR filetype:webp`;
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchQuery)}&srnamespace=6&srlimit=${Math.min(limit, 50)}&srprop=size&origin=*`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Wikimedia API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.query || !data.query.search || data.query.search.length === 0) {
      return [];
    }
    
    const imageTitles = data.query.search.map((item: any) => item.title);
    const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${imageTitles.join('|')}&prop=imageinfo&iiprop=url|size|mime&origin=*`;
    
    const imageInfoResponse = await fetch(imageInfoUrl);
    if (!imageInfoResponse.ok) {
      throw new Error(`Wikimedia Image Info API error: ${imageInfoResponse.status}`);
    }
    
    const imageInfoData = await imageInfoResponse.json();
    
    const results: ImageResult[] = [];
    const pages = imageInfoData.query.pages;
    
    for (const pageId in pages) {
      const page = pages[pageId];
      if (page.imageinfo && page.imageinfo.length > 0) {
        const imageInfo = page.imageinfo[0];
        
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
    throw error;
  }
}

// Buscar no Bing Images
async function searchBing(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!PROVIDERS.bing.apiKey) {
    throw new Error('BING_SEARCH_API_KEY não configurada');
  }
  
  try {
    const params = new URLSearchParams({
      q: query,
      count: Math.min(limit, 150).toString(),
      offset: '0',
      mkt: 'pt-BR',
      safeSearch: 'Moderate',
      imageType: 'Photo',
      size: 'Large',
      aspect: 'Wide'
    });
    
    const response = await fetch(`${PROVIDERS.bing.baseUrl}?${params}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': PROVIDERS.bing.apiKey,
        'User-Agent': 'HubEdu/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bing API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.value.map((image: any) => ({
      id: `bing_${image.imageId}`,
      url: image.contentUrl,
      thumbnail: image.thumbnailUrl,
      title: image.name || '',
      description: image.name || '',
      author: 'Bing Images',
      source: 'bing' as const,
      width: image.width || 0,
      height: image.height || 0,
      tags: [],
      relevanceScore: calculateEducationalScore(image, query, subject),
      educationalSuitability: 0,
      qualityScore: 0,
      sourceUrl: image.hostPageUrl
    }));
  } catch (error) {
    console.error('Erro ao buscar Bing:', error);
    throw error;
  }
}

// Buscar no Pexels
async function searchPexels(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!PROVIDERS.pexels.apiKey) {
    throw new Error('PEXELS_API_KEY não configurada');
  }
  
  try {
    const params = new URLSearchParams({
      query,
      per_page: Math.min(limit, 80).toString(),
      orientation: 'landscape',
      size: 'large'
    });
    
    const response = await fetch(`${PROVIDERS.pexels.baseUrl}${PROVIDERS.pexels.endpoint}?${params}`, {
      headers: {
        'Authorization': PROVIDERS.pexels.apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.photos.map((photo: any) => ({
      id: `pexels_${photo.id}`,
      url: photo.src.large,
      thumbnail: photo.src.medium,
      title: photo.alt || '',
      description: photo.alt || '',
      author: photo.photographer,
      authorUrl: photo.photographer_url,
      source: 'pexels' as const,
      width: photo.width,
      height: photo.height,
      tags: [],
      relevanceScore: calculateEducationalScore(photo, query, subject),
      educationalSuitability: 0,
      qualityScore: 0,
      sourceUrl: photo.url
    }));
  } catch (error) {
    console.error('Erro ao buscar Pexels:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, query, subject, count = 3 } = body;
    
    if (!provider || !query) {
      return NextResponse.json(
        { error: 'Provider e query são obrigatórios' },
        { status: 400 }
      );
    }
    
    if (!PROVIDERS[provider as keyof typeof PROVIDERS]) {
      return NextResponse.json(
        { error: `Provedor '${provider}' não encontrado` },
        { status: 400 }
      );
    }
    
    let images: ImageResult[] = [];
    
    switch (provider) {
      case 'unsplash':
        images = await searchUnsplash(query, subject || 'general', count);
        break;
      case 'pixabay':
        images = await searchPixabay(query, subject || 'general', count);
        break;
      case 'wikimedia':
        images = await searchWikimedia(query, subject || 'general', count);
        break;
      case 'bing':
        images = await searchBing(query, subject || 'general', count);
        break;
      case 'pexels':
        images = await searchPexels(query, subject || 'general', count);
        break;
      default:
        return NextResponse.json(
          { error: `Provedor '${provider}' não implementado` },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      provider,
      images,
      count: images.length,
      query,
      subject: subject || 'general'
    });
    
  } catch (error: any) {
    console.error('Erro na API de teste de provedor:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        images: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
