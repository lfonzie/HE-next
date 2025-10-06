import { NextRequest, NextResponse } from 'next/server';

// Interface para requisição de busca de imagens
interface ImageSearchRequest {
  topic: string;
  count?: number;
  filters?: {
    type?: string;
    style?: string;
    source?: string;
  };
  context?: string;
}

// Interface para resposta da API
interface ImageSearchResponse {
  success: boolean;
  images: SearchResultImage[];
  found: number;
  requested: number;
  processingTime: number;
  searchStrategy?: {
    query: string;
    filters: any;
    sources: string[];
  };
  error?: string;
}

// Interface para imagem encontrada
interface SearchResultImage {
  id: string;
  url: string;
  title: string;
  description: string;
  source: string;
  type: string;
  style: string;
  relevance: number;
  quality: number;
  isPlaceholder?: boolean;
}

// Configuração dos provedores de busca
const SEARCH_PROVIDERS = {
  unsplash: {
    name: 'Unsplash',
    priority: 1,
    enabled: true,
    apiKey: process.env.UNSPLASH_ACCESS_KEY,
    baseUrl: 'https://api.unsplash.com',
    timeout: 10000
  },
  pixabay: {
    name: 'Pixabay',
    priority: 2,
    enabled: true,
    apiKey: process.env.PIXABAY_API_KEY,
    baseUrl: 'https://pixabay.com/api',
    timeout: 10000
  },
  pexels: {
    name: 'Pexels',
    priority: 3,
    enabled: true,
    apiKey: process.env.PEXELS_API_KEY,
    baseUrl: 'https://api.pexels.com/v1',
    timeout: 10000
  }
};

// Função para gerar placeholder SVG
function generatePlaceholderImage(type: string, style: string, index: number): string {
  const colors = {
    educational: '#4F46E5',
    scientific: '#059669',
    artistic: '#DC2626',
    modern: '#7C3AED',
    classic: '#D97706'
  };
  
  const color = colors[style as keyof typeof colors] || '#4F46E5';
  
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="${color}" opacity="0.1"/>
      <rect x="50" y="50" width="700" height="500" fill="white" stroke="${color}" stroke-width="2" rx="10"/>
      <circle cx="400" cy="200" r="60" fill="${color}" opacity="0.3"/>
      <rect x="300" y="280" width="200" height="100" fill="${color}" opacity="0.2" rx="5"/>
      <text x="400" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${color}">
        ${type.toUpperCase()} - ${style.toUpperCase()}
      </text>
      <text x="400" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${color}" opacity="0.7">
        Imagem ${index} - Placeholder
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Função para buscar imagens no Unsplash
async function searchUnsplash(query: string, count: number): Promise<SearchResultImage[]> {
  const provider = SEARCH_PROVIDERS.unsplash;
  
  if (!provider.enabled || !provider.apiKey) {
    console.log('⚠️ Unsplash não disponível');
    return [];
  }

  try {
    console.log(`🔍 Buscando no Unsplash: "${query}"`);
    
    const response = await fetch(
      `${provider.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${provider.apiKey}`,
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    const images: SearchResultImage[] = [];

    if (data.results) {
      for (const photo of data.results) {
        images.push({
          id: `unsplash-${photo.id}`,
          url: photo.urls.regular,
          title: photo.alt_description || photo.description || 'Imagem sem título',
          description: photo.description || photo.alt_description || '',
          source: 'unsplash',
          type: 'photo',
          style: 'modern',
          relevance: 0.8,
          quality: 0.9,
          isPlaceholder: false
        });
      }
    }

    console.log(`✅ Unsplash: ${images.length} imagens encontradas`);
    return images;

  } catch (error) {
    console.error('❌ Erro ao buscar no Unsplash:', error);
    return [];
  }
}

// Função para buscar imagens no Pixabay
async function searchPixabay(query: string, count: number): Promise<SearchResultImage[]> {
  const provider = SEARCH_PROVIDERS.pixabay;
  
  if (!provider.enabled || !provider.apiKey) {
    console.log('⚠️ Pixabay não disponível');
    return [];
  }

  try {
    console.log(`🔍 Buscando no Pixabay: "${query}"`);
    
    const response = await fetch(
      `${provider.baseUrl}/?key=${provider.apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=${count}&safesearch=true`
    );

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data = await response.json();
    const images: SearchResultImage[] = [];

    if (data.hits) {
      for (const hit of data.hits) {
        images.push({
          id: `pixabay-${hit.id}`,
          url: hit.webformatURL,
          title: hit.tags || 'Imagem sem título',
          description: hit.tags || '',
          source: 'pixabay',
          type: 'photo',
          style: 'modern',
          relevance: 0.7,
          quality: 0.8,
          isPlaceholder: false
        });
      }
    }

    console.log(`✅ Pixabay: ${images.length} imagens encontradas`);
    return images;

  } catch (error) {
    console.error('❌ Erro ao buscar no Pixabay:', error);
    return [];
  }
}

// Função para buscar imagens no Pexels
async function searchPexels(query: string, count: number): Promise<SearchResultImage[]> {
  const provider = SEARCH_PROVIDERS.pexels;
  
  if (!provider.enabled || !provider.apiKey) {
    console.log('⚠️ Pexels não disponível');
    return [];
  }

  try {
    console.log(`🔍 Buscando no Pexels: "${query}"`);
    
    const response = await fetch(
      `${provider.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': provider.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    const images: SearchResultImage[] = [];

    if (data.photos) {
      for (const photo of data.photos) {
        images.push({
          id: `pexels-${photo.id}`,
          url: photo.src.medium,
          title: photo.alt || 'Imagem sem título',
          description: photo.alt || '',
          source: 'pexels',
          type: 'photo',
          style: 'modern',
          relevance: 0.8,
          quality: 0.9,
          isPlaceholder: false
        });
      }
    }

    console.log(`✅ Pexels: ${images.length} imagens encontradas`);
    return images;

  } catch (error) {
    console.error('❌ Erro ao buscar no Pexels:', error);
    return [];
  }
}

// Função para otimizar query de busca
function optimizeSearchQuery(topic: string, context?: string): string {
  let query = topic.toLowerCase();
  
  // Otimizações baseadas no contexto
  if (context === 'aula_educacional') {
    // Adicionar termos educacionais
    if (query.includes('fotossíntese') || query.includes('photosynthesis')) {
      query = 'photosynthesis process plants biology';
    } else if (query.includes('sistema solar') || query.includes('solar system')) {
      query = 'solar system planets space astronomy';
    } else if (query.includes('dna') || query.includes('genética')) {
      query = 'dna structure genetics biology';
    } else if (query.includes('revolução') || query.includes('history')) {
      query = `${query} historical educational`;
    }
  }
  
  // Remover caracteres especiais e acentos
  query = query
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
  
  return query;
}

// Função para buscar imagens em múltiplos provedores
async function searchMultipleProviders(query: string, count: number): Promise<SearchResultImage[]> {
  const allImages: SearchResultImage[] = [];
  
  // Buscar em paralelo nos provedores disponíveis
  const searchPromises = [
    searchUnsplash(query, Math.ceil(count / 3)),
    searchPixabay(query, Math.ceil(count / 3)),
    searchPexels(query, Math.ceil(count / 3))
  ];
  
  try {
    const results = await Promise.allSettled(searchPromises);
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allImages.push(...result.value);
      } else {
        console.error('Erro em provedor:', result.reason);
      }
    }
    
    // Ordenar por relevância e qualidade
    allImages.sort((a, b) => (b.relevance + b.quality) - (a.relevance + a.quality));
    
    // Limitar ao número solicitado
    return allImages.slice(0, count);
    
  } catch (error) {
    console.error('❌ Erro na busca múltipla:', error);
    return [];
  }
}

// Função para criar placeholders se necessário
function createPlaceholders(count: number, topic: string): SearchResultImage[] {
  const placeholders: SearchResultImage[] = [];
  
  for (let i = 0; i < count; i++) {
    const placeholder = generatePlaceholderImage('photo', 'modern', i + 1);
    
    placeholders.push({
      id: `placeholder-${Date.now()}-${i}`,
      url: placeholder,
      title: `${topic} - Imagem ${i + 1}`,
      description: `Placeholder para ${topic}`,
      source: 'placeholder',
      type: 'photo',
      style: 'modern',
      relevance: 0.5,
      quality: 0.6,
      isPlaceholder: true
    });
  }
  
  return placeholders;
}

// Handler principal da API
export async function POST(request: NextRequest) {
  try {
    const body: ImageSearchRequest = await request.json();
    const { topic, count = 6, filters = {}, context = 'aula_educacional' } = body;

    if (!topic) {
      return NextResponse.json({
        success: false,
        error: 'Tópico é obrigatório'
      }, { status: 400 });
    }

    const startTime = Date.now();
    console.log(`🔍 API Interna de Busca de Imagens iniciada para: "${topic}"`);

    // 1. Otimizar query de busca
    const optimizedQuery = optimizeSearchQuery(topic, context);
    console.log(`🔍 Query otimizada: "${optimizedQuery}"`);

    // 2. Buscar imagens em múltiplos provedores
    const images = await searchMultipleProviders(optimizedQuery, count);

    // 3. Se não encontrou imagens suficientes, criar placeholders
    let finalImages = images;
    if (images.length < count) {
      const missingCount = count - images.length;
      const placeholders = createPlaceholders(missingCount, topic);
      finalImages = [...images, ...placeholders];
    }

    const processingTime = Date.now() - startTime;

    const result: ImageSearchResponse = {
      success: true,
      images: finalImages,
      found: images.length,
      requested: count,
      processingTime,
      searchStrategy: {
        query: optimizedQuery,
        filters,
        sources: ['unsplash', 'pixabay', 'pexels']
      }
    };

    console.log(`✅ API Interna de Busca concluída: ${images.length}/${count} imagens encontradas em ${processingTime}ms`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro na API Interna de Busca de Imagens:', error);
    
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
    name: 'API Interna de Busca de Imagens',
    version: '1.0.0',
    description: 'API interna para busca de imagens educacionais',
    endpoints: {
      POST: {
        description: 'Buscar imagens baseadas em tema',
        body: {
          topic: 'string (obrigatório)',
          count: 'number (opcional, padrão: 6)',
          filters: 'object (opcional)',
          context: 'string (opcional, padrão: aula_educacional)'
        }
      }
    },
    providers: {
      unsplash: {
        enabled: !!process.env.UNSPLASH_ACCESS_KEY,
        priority: 1
      },
      pixabay: {
        enabled: !!process.env.PIXABAY_API_KEY,
        priority: 2
      },
      pexels: {
        enabled: !!process.env.PEXELS_API_KEY,
        priority: 3
      }
    },
    features: [
      'Busca em múltiplos provedores',
      'Otimização automática de queries',
      'Fallback para placeholders',
      'Integração com aulas e chat',
      'Filtros de qualidade e relevância'
    ]
  });
}
