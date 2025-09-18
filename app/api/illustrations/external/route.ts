// app/api/illustrations/external/route.ts - Integração com APIs externas públicas
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação
const ExternalSearchSchema = z.object({
  query: z.string().min(1, 'Query é obrigatória'),
  sources: z.array(z.enum(['unsplash', 'pixabay', 'pexels', 'wikimedia', 'nasa', 'smithsonian'])).default(['unsplash', 'pixabay', 'pexels']),
  limit: z.number().min(1).max(50).default(10),
  category: z.enum(['biology', 'chemistry', 'physics', 'math', 'history', 'geography', 'general']).optional()
});

// Configurações das APIs externas
const EXTERNAL_APIS = {
  unsplash: {
    name: 'Unsplash',
    baseUrl: 'https://api.unsplash.com',
    apiKey: process.env.UNSPLASH_ACCESS_KEY,
    endpoint: '/search/photos',
    limit: 50, // req/hora
    quality: 'excellent'
  },
  pixabay: {
    name: 'Pixabay',
    baseUrl: 'https://pixabay.com/api',
    apiKey: process.env.PIXABAY_API_KEY,
    endpoint: '/',
    limit: 5000, // req/hora
    quality: 'good'
  },
  pexels: {
    name: 'Pexels',
    baseUrl: 'https://api.pexels.com/v1',
    apiKey: process.env.PEXELS_API_KEY,
    endpoint: '/search',
    limit: 200, // req/hora
    quality: 'excellent'
  },
  wikimedia: {
    name: 'Wikimedia Commons',
    baseUrl: 'https://commons.wikimedia.org/w/api.php',
    apiKey: null, // Não requer chave
    endpoint: '',
    limit: null, // Ilimitado
    quality: 'variable'
  },
  nasa: {
    name: 'NASA Image Library',
    baseUrl: 'https://images-api.nasa.gov',
    apiKey: null, // Não requer chave
    endpoint: '/search',
    limit: null, // Ilimitado
    quality: 'excellent'
  },
  smithsonian: {
    name: 'Smithsonian Open Access',
    baseUrl: 'https://api.si.edu/openaccess/api/v1.0',
    apiKey: null, // Não requer chave
    endpoint: '/search',
    limit: null, // Ilimitado
    quality: 'excellent'
  }
};

// Função para buscar no Unsplash
async function searchUnsplash(query: string, limit: number = 10) {
  if (!EXTERNAL_APIS.unsplash.apiKey) {
    throw new Error('Unsplash API key não configurada');
  }

  const params = new URLSearchParams({
    query,
    per_page: limit.toString(),
    orientation: 'landscape',
    content_filter: 'high'
  });

  const response = await fetch(
    `${EXTERNAL_APIS.unsplash.baseUrl}${EXTERNAL_APIS.unsplash.endpoint}?${params}`,
    {
      headers: {
        'Authorization': `Client-ID ${EXTERNAL_APIS.unsplash.apiKey}`,
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
    description: photo.description || photo.alt_description,
    author: photo.user.name,
    authorUrl: photo.user.links.html,
    source: 'unsplash',
    downloadUrl: photo.links.download_location,
    width: photo.width,
    height: photo.height,
    tags: photo.tags?.map((tag: any) => tag.title) || [],
    quality: 'excellent',
    educational: true
  }));
}

// Função para buscar no Pixabay
async function searchPixabay(query: string, limit: number = 10) {
  if (!EXTERNAL_APIS.pixabay.apiKey) {
    throw new Error('Pixabay API key não configurada');
  }

  const params = new URLSearchParams({
    key: EXTERNAL_APIS.pixabay.apiKey,
    q: query,
    per_page: limit.toString(),
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    lang: 'pt'
  });

  const response = await fetch(`${EXTERNAL_APIS.pixabay.baseUrl}${EXTERNAL_APIS.pixabay.endpoint}?${params}`);

  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.hits.map((hit: any) => ({
    id: `pixabay_${hit.id}`,
    url: hit.webformatURL,
    thumbnail: hit.previewURL,
    description: hit.tags,
    author: hit.user,
    authorUrl: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
    source: 'pixabay',
    downloadUrl: hit.pageURL,
    width: hit.webformatWidth,
    height: hit.webformatHeight,
    tags: hit.tags.split(', '),
    quality: 'good',
    educational: true
  }));
}

// Função para buscar no Pexels
async function searchPexels(query: string, limit: number = 10) {
  if (!EXTERNAL_APIS.pexels.apiKey) {
    throw new Error('Pexels API key não configurada');
  }

  const response = await fetch(
    `${EXTERNAL_APIS.pexels.baseUrl}${EXTERNAL_APIS.pexels.endpoint}?query=${encodeURIComponent(query)}&per_page=${limit}`,
    {
      headers: {
        'Authorization': EXTERNAL_APIS.pexels.apiKey
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.photos.map((photo: any) => ({
    id: `pexels_${photo.id}`,
    url: photo.src.medium,
    thumbnail: photo.src.small,
    description: photo.alt,
    author: photo.photographer,
    authorUrl: photo.photographer_url,
    source: 'pexels',
    downloadUrl: photo.url,
    width: photo.width,
    height: photo.height,
    tags: [],
    quality: 'excellent',
    educational: true
  }));
}

// Função para buscar no Wikimedia Commons
async function searchWikimedia(query: string, limit: number = 10) {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6', // Namespace de arquivos
    srlimit: limit.toString(),
    format: 'json',
    origin: '*'
  });

  const response = await fetch(`${EXTERNAL_APIS.wikimedia.baseUrl}?${params}`);

  if (!response.ok) {
    throw new Error(`Wikimedia API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.query?.search) {
    return [];
  }

  // Buscar informações dos arquivos
  const fileIds = data.query.search.map((item: any) => item.title).join('|');
  const fileParams = new URLSearchParams({
    action: 'query',
    titles: fileIds,
    prop: 'imageinfo',
    iiprop: 'url|size|mime',
    format: 'json',
    origin: '*'
  });

  const fileResponse = await fetch(`${EXTERNAL_APIS.wikimedia.baseUrl}?${fileParams}`);
  const fileData = await fileResponse.json();

  const files = Object.values(fileData.query?.pages || {});
  
  return files.map((file: any) => {
    const imageInfo = file.imageinfo?.[0];
    return {
      id: `wikimedia_${file.pageid}`,
      url: imageInfo?.url || '',
      thumbnail: imageInfo?.url || '',
      description: file.title?.replace('File:', '') || '',
      author: 'Wikimedia Commons',
      authorUrl: 'https://commons.wikimedia.org',
      source: 'wikimedia',
      downloadUrl: imageInfo?.url || '',
      width: imageInfo?.width || 0,
      height: imageInfo?.height || 0,
      tags: [query],
      quality: 'variable',
      educational: true
    };
  }).filter((img: any) => img.url);
}

// Função para buscar na NASA
async function searchNASA(query: string, limit: number = 10) {
  const params = new URLSearchParams({
    q: query,
    media_type: 'image',
    page_size: limit.toString()
  });

  const response = await fetch(`${EXTERNAL_APIS.nasa.baseUrl}${EXTERNAL_APIS.nasa.endpoint}?${params}`);

  if (!response.ok) {
    throw new Error(`NASA API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.collection.items.map((item: any) => ({
    id: `nasa_${item.data[0].nasa_id}`,
    url: item.links?.[0]?.href || '',
    thumbnail: item.links?.[0]?.href || '',
    description: item.data[0].title || '',
    author: 'NASA',
    authorUrl: 'https://www.nasa.gov',
    source: 'nasa',
    downloadUrl: item.links?.[0]?.href || '',
    width: 0,
    height: 0,
    tags: item.data[0].keywords || [],
    quality: 'excellent',
    educational: true
  })).filter((img: any) => img.url);
}

// Função para buscar no Smithsonian
async function searchSmithsonian(query: string, limit: number = 10) {
  const params = new URLSearchParams({
    q: query,
    rows: limit.toString(),
    api_key: 'SUA_CHAVE_SMITHSONIAN' // Substitua por sua chave
  });

  const response = await fetch(`${EXTERNAL_APIS.smithsonian.baseUrl}${EXTERNAL_APIS.smithsonian.endpoint}?${params}`);

  if (!response.ok) {
    throw new Error(`Smithsonian API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.response.rows.map((item: any) => ({
    id: `smithsonian_${item.id}`,
    url: item.content.descriptiveNonRepeating.online_media?.media[0]?.thumbnail || '',
    thumbnail: item.content.descriptiveNonRepeating.online_media?.media[0]?.thumbnail || '',
    description: item.title || '',
    author: 'Smithsonian Institution',
    authorUrl: 'https://www.si.edu',
    source: 'smithsonian',
    downloadUrl: item.content.descriptiveNonRepeating.online_media?.media[0]?.thumbnail || '',
    width: 0,
    height: 0,
    tags: item.content.indexedStructured.subject?.map((s: any) => s.content) || [],
    quality: 'excellent',
    educational: true
  })).filter((img: any) => img.url);
}

// Função principal de busca
async function searchExternalAPIs(query: string, sources: string[], limit: number) {
  const results: any[] = [];
  const limitPerSource = Math.ceil(limit / sources.length);

  type SearchHandler = (query: string, limit: number) => Promise<any[]>;

  const searchFunctions: Record<string, SearchHandler> = {
    unsplash: searchUnsplash,
    pixabay: searchPixabay,
    pexels: searchPexels,
    wikimedia: searchWikimedia,
    nasa: searchNASA,
    smithsonian: searchSmithsonian
  };

  const promises = sources.map(async (source) => {
    try {
      const searchFunction = searchFunctions[source];
      if (searchFunction) {
        const sourceResults = await searchFunction(query, limitPerSource);
        return sourceResults.map((result: any) => ({
          ...result,
          sourcePriority: getSourcePriority(source)
        }));
      }
      return [];
    } catch (error) {
      console.warn(`${source} search failed:`, error);
      return [];
    }
  });

  const sourceResults = await Promise.all(promises);
  
  // Combinar e ordenar resultados
  sourceResults.forEach(sourceResult => {
    results.push(...sourceResult);
  });

  // Ordenar por qualidade e relevância
  results.sort((a, b) => {
    const qualityScore = { excellent: 3, good: 2, variable: 1 };
    const aScore = qualityScore[a.quality as keyof typeof qualityScore] || 0;
    const bScore = qualityScore[b.quality as keyof typeof qualityScore] || 0;
    
    if (aScore !== bScore) {
      return bScore - aScore;
    }
    
    return a.sourcePriority - b.sourcePriority;
  });

  return results.slice(0, limit);
}

// Função para determinar prioridade da fonte
function getSourcePriority(source: string): number {
  const priorities: Record<string, number> = {
    pixabay: 1,    // Melhor para educação - alta prioridade
    unsplash: 2,   // Alta qualidade
    pexels: 3,     // Boa qualidade
    nasa: 4,       // Específico para ciência
    smithsonian: 5, // Específico para educação
    wikimedia: 6   // Variável mas educacional
  };
  
  return priorities[source] || 7;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ExternalSearchSchema.parse(body);
    
    const { query, sources, limit, category } = validatedData;
    
    console.log(`🌐 [EXTERNAL] Searching external APIs for: "${query}" (sources: ${sources.join(', ')})`);
    
    // Buscar em APIs externas
    const images = await searchExternalAPIs(query, sources, limit);
    
    // Calcular estatísticas
    const sourceStats = sources.reduce((acc, source) => {
      acc[source] = images.filter(img => img.source === source).length;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`✅ [EXTERNAL] Found ${images.length} images from external APIs`);
    
    return NextResponse.json({
      success: true,
      data: images,
      metadata: {
        query,
        sources,
        category,
        totalResults: images.length,
        requestedLimit: limit,
        sourceStats,
        apisUsed: sources.map(source => ({
          name: EXTERNAL_APIS[source as keyof typeof EXTERNAL_APIS].name,
          limit: EXTERNAL_APIS[source as keyof typeof EXTERNAL_APIS].limit,
          quality: EXTERNAL_APIS[source as keyof typeof EXTERNAL_APIS].quality
        }))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [EXTERNAL] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados de entrada inválidos',
        details: error.errors,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Endpoint GET para listar APIs disponíveis
export async function GET(request: NextRequest) {
  const apis = Object.entries(EXTERNAL_APIS).map(([key, config]) => ({
    id: key,
    name: config.name,
    baseUrl: config.baseUrl,
    limit: config.limit,
    quality: config.quality,
    requiresKey: !!config.apiKey,
    educational: true
  }));

  return NextResponse.json({
    success: true,
    data: apis,
    total: apis.length,
    timestamp: new Date().toISOString()
  });
}
