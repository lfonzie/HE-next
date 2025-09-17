// app/api/illustrations/search/route.ts - API para buscar ilustrações educacionais
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação para a requisição
const SearchIllustrationSchema = z.object({
  query: z.string().min(1, 'Query é obrigatória'),
  category: z.enum(['biology', 'chemistry', 'physics', 'math', 'history', 'geography', 'general']).optional(),
  process: z.string().optional(), // Para processos específicos como fotossíntese
  style: z.enum(['scientific', 'educational', 'diagram', 'illustration', 'photograph']).optional(),
  language: z.enum(['pt', 'en', 'es']).default('pt'),
  limit: z.number().min(1).max(50).default(10),
  includeMetadata: z.boolean().default(true)
});

// Mapeamento de processos educacionais para termos de busca otimizados
const EDUCATIONAL_PROCESSES = {
  'fotossintese': {
    keywords: ['photosynthesis', 'fotossíntese', 'chlorophyll', 'chloroplast', 'plant biology', 'light reaction', 'dark reaction'],
    categories: ['biology', 'chemistry'],
    styles: ['scientific', 'diagram', 'illustration']
  },
  'respiração-celular': {
    keywords: ['cellular respiration', 'respiração celular', 'mitochondria', 'ATP', 'glycolysis', 'krebs cycle'],
    categories: ['biology'],
    styles: ['scientific', 'diagram']
  },
  'digestão': {
    keywords: ['digestion', 'digestão', 'digestive system', 'sistema digestivo', 'stomach', 'intestines'],
    categories: ['biology'],
    styles: ['educational', 'diagram']
  },
  'circulação': {
    keywords: ['circulation', 'circulação', 'cardiovascular system', 'heart', 'blood vessels', 'sistema cardiovascular'],
    categories: ['biology'],
    styles: ['educational', 'diagram']
  },
  'mitose': {
    keywords: ['mitosis', 'mitose', 'cell division', 'divisão celular', 'chromosomes', 'cromossomos'],
    categories: ['biology'],
    styles: ['scientific', 'diagram']
  },
  'meiose': {
    keywords: ['meiosis', 'meiose', 'sexual reproduction', 'reprodução sexuada', 'gametes'],
    categories: ['biology'],
    styles: ['scientific', 'diagram']
  },
  'evolução': {
    keywords: ['evolution', 'evolução', 'natural selection', 'seleção natural', 'darwin', 'adaptation'],
    categories: ['biology'],
    styles: ['educational', 'illustration']
  },
  'ecossistema': {
    keywords: ['ecosystem', 'ecossistema', 'food chain', 'cadeia alimentar', 'biodiversity', 'biodiversidade'],
    categories: ['biology', 'geography'],
    styles: ['educational', 'illustration']
  },
  'química-orgânica': {
    keywords: ['organic chemistry', 'química orgânica', 'carbon compounds', 'compostos de carbono', 'functional groups'],
    categories: ['chemistry'],
    styles: ['scientific', 'diagram']
  },
  'tabela-periódica': {
    keywords: ['periodic table', 'tabela periódica', 'elements', 'elementos', 'atomic structure'],
    categories: ['chemistry'],
    styles: ['scientific', 'diagram']
  },
  'reação-química': {
    keywords: ['chemical reaction', 'reação química', 'reactants', 'products', 'catalysts'],
    categories: ['chemistry'],
    styles: ['scientific', 'diagram']
  },
  'movimento': {
    keywords: ['motion', 'movimento', 'physics', 'física', 'velocity', 'acceleration', 'force'],
    categories: ['physics'],
    styles: ['scientific', 'diagram']
  },
  'eletricidade': {
    keywords: ['electricity', 'eletricidade', 'circuit', 'circuito', 'voltage', 'current', 'resistance'],
    categories: ['physics'],
    styles: ['scientific', 'diagram']
  },
  'ondas': {
    keywords: ['waves', 'ondas', 'frequency', 'amplitude', 'wavelength', 'sound waves', 'light waves'],
    categories: ['physics'],
    styles: ['scientific', 'diagram']
  },
  'geometria': {
    keywords: ['geometry', 'geometria', 'shapes', 'formas', 'angles', 'ângulos', 'triangles', 'circles'],
    categories: ['math'],
    styles: ['educational', 'diagram']
  },
  'álgebra': {
    keywords: ['algebra', 'álgebra', 'equations', 'equações', 'variables', 'functions', 'funções'],
    categories: ['math'],
    styles: ['educational', 'diagram']
  },
  'história-brasil': {
    keywords: ['brazilian history', 'história do brasil', 'independence', 'independência', 'empire', 'republic'],
    categories: ['history'],
    styles: ['educational', 'illustration']
  },
  'geografia-brasil': {
    keywords: ['brazilian geography', 'geografia do brasil', 'regions', 'regiões', 'climate', 'clima', 'biomes'],
    categories: ['geography'],
    styles: ['educational', 'illustration']
  }
};

// Serviços de imagens educacionais
const IMAGE_SERVICES = {
  unsplash: {
    name: 'Unsplash',
    baseUrl: 'https://api.unsplash.com',
    apiKey: process.env.UNSPLASH_ACCESS_KEY,
    endpoint: '/search/photos'
  },
  pixabay: {
    name: 'Pixabay',
    baseUrl: 'https://pixabay.com/api',
    apiKey: process.env.PIXABAY_API_KEY,
    endpoint: '/'
  },
  pexels: {
    name: 'Pexels',
    baseUrl: 'https://api.pexels.com/v1',
    apiKey: process.env.PEXELS_API_KEY,
    endpoint: '/search'
  }
};

// Cache simples em memória (em produção, usar Redis)
const imageCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface CachedImage {
  data: any;
  timestamp: number;
}

// Função para buscar imagens do Unsplash
async function searchUnsplash(query: string, category?: string, limit: number = 10) {
  if (!IMAGE_SERVICES.unsplash.apiKey) {
    throw new Error('Unsplash API key não configurada');
  }

  const params = new URLSearchParams({
    query,
    per_page: limit.toString(),
    orientation: 'landscape',
    content_filter: 'high'
  });

  if (category) {
    params.append('collections', getUnsplashCollectionId(category));
  }

  const response = await fetch(
    `${IMAGE_SERVICES.unsplash.baseUrl}${IMAGE_SERVICES.unsplash.endpoint}?${params}`,
    {
      headers: {
        'Authorization': `Client-ID ${IMAGE_SERVICES.unsplash.apiKey}`,
        'Accept-Version': 'v1'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.results.map((photo: any) => ({
    id: photo.id,
    url: photo.urls.regular,
    thumbnail: photo.urls.thumb,
    description: photo.description || photo.alt_description,
    author: photo.user.name,
    authorUrl: photo.user.links.html,
    source: 'unsplash',
    downloadUrl: photo.links.download_location,
    width: photo.width,
    height: photo.height,
    tags: photo.tags?.map((tag: any) => tag.title) || []
  }));
}

// Função para buscar imagens do Pixabay
async function searchPixabay(query: string, category?: string, limit: number = 10) {
  if (!IMAGE_SERVICES.pixabay.apiKey) {
    throw new Error('Pixabay API key não configurada');
  }

  const params = new URLSearchParams({
    key: IMAGE_SERVICES.pixabay.apiKey,
    q: query,
    per_page: limit.toString(),
    image_type: 'photo',
    orientation: 'horizontal',
    category: category || 'science',
    safesearch: 'true',
    lang: 'pt'
  });

  const response = await fetch(`${IMAGE_SERVICES.pixabay.baseUrl}${IMAGE_SERVICES.pixabay.endpoint}?${params}`);

  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.hits.map((hit: any) => ({
    id: hit.id,
    url: hit.webformatURL,
    thumbnail: hit.previewURL,
    description: hit.tags,
    author: hit.user,
    authorUrl: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
    source: 'pixabay',
    downloadUrl: hit.pageURL,
    width: hit.webformatWidth,
    height: hit.webformatHeight,
    tags: hit.tags.split(', ')
  }));
}

// Função para buscar imagens do Pexels
async function searchPexels(query: string, limit: number = 10) {
  if (!IMAGE_SERVICES.pexels.apiKey) {
    throw new Error('Pexels API key não configurada');
  }

  const response = await fetch(
    `${IMAGE_SERVICES.pexels.baseUrl}${IMAGE_SERVICES.pexels.endpoint}?query=${encodeURIComponent(query)}&per_page=${limit}`,
    {
      headers: {
        'Authorization': IMAGE_SERVICES.pexels.apiKey
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.photos.map((photo: any) => ({
    id: photo.id,
    url: photo.src.medium,
    thumbnail: photo.src.small,
    description: photo.alt,
    author: photo.photographer,
    authorUrl: photo.photographer_url,
    source: 'pexels',
    downloadUrl: photo.url,
    width: photo.width,
    height: photo.height,
    tags: []
  }));
}

// Mapear categorias para IDs de coleções do Unsplash
function getUnsplashCollectionId(category: string): string {
  const collections: Record<string, string> = {
    'biology': '1053828', // Science & Nature
    'chemistry': '1053828', // Science & Nature
    'physics': '1053828', // Science & Nature
    'math': '1053828', // Science & Nature
    'history': '1053828', // Science & Nature
    'geography': '1053828', // Science & Nature
    'general': '1053828' // Science & Nature
  };
  
  return collections[category] || collections['general'];
}

// Função para otimizar query baseada no processo educacional
function optimizeQueryForProcess(query: string, process?: string): string {
  if (!process) return query;
  
  const processInfo = EDUCATIONAL_PROCESSES[process.toLowerCase() as keyof typeof EDUCATIONAL_PROCESSES];
  if (!processInfo) return query;
  
  // Combinar query original com keywords do processo
  const optimizedKeywords = [...processInfo.keywords];
  if (query.toLowerCase() !== process.toLowerCase()) {
    optimizedKeywords.unshift(query);
  }
  
  return optimizedKeywords.join(' ');
}

// Função para buscar em múltiplos serviços
async function searchMultipleServices(query: string, category?: string, limit: number = 10) {
  const results: any[] = [];
  const servicesPerLimit = Math.ceil(limit / 3); // Dividir entre 3 serviços
  
  const promises = [];
  
  // Unsplash
  promises.push(
    searchUnsplash(query, category, servicesPerLimit).catch(error => {
      console.warn('Unsplash search failed:', error.message);
      return [];
    })
  );
  
  // Pixabay
  promises.push(
    searchPixabay(query, category, servicesPerLimit).catch(error => {
      console.warn('Pixabay search failed:', error.message);
      return [];
    })
  );
  
  // Pexels
  promises.push(
    searchPexels(query, servicesPerLimit).catch(error => {
      console.warn('Pexels search failed:', error.message);
      return [];
    })
  );
  
  const serviceResults = await Promise.all(promises);
  
  // Combinar resultados e limitar
  serviceResults.forEach(serviceResult => {
    results.push(...serviceResult);
  });
  
  // Embaralhar e limitar resultados
  const shuffled = results.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

// Função para verificar cache
function getCachedResult(cacheKey: string): any | null {
  const cached = imageCache.get(cacheKey) as CachedImage;
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

// Função para salvar no cache
function setCachedResult(cacheKey: string, data: any): void {
  imageCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SearchIllustrationSchema.parse(body);
    
    const { query, category, process, style, language, limit, includeMetadata } = validatedData;
    
    // Criar chave de cache
    const cacheKey = `illustrations:${query}:${category || 'all'}:${process || 'none'}:${limit}`;
    
    // Verificar cache
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      console.log(`🎨 [ILLUSTRATIONS] Cache hit for: ${query}`);
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`🔍 [ILLUSTRATIONS] Searching for: "${query}" (process: ${process || 'none'}, category: ${category || 'all'})`);
    
    // Otimizar query baseada no processo educacional
    const optimizedQuery = optimizeQueryForProcess(query, process);
    
    // Buscar imagens
    const images = await searchMultipleServices(optimizedQuery, category, limit);
    
    // Processar metadados se solicitado
    let processedImages = images;
    if (includeMetadata) {
      processedImages = images.map(image => ({
        ...image,
        metadata: {
          category: category || 'general',
          process: process || null,
          style: style || 'educational',
          language,
          searchQuery: query,
          optimizedQuery,
          educationalRelevance: calculateEducationalRelevance(image, query, process)
        }
      }));
    }
    
    // Salvar no cache
    setCachedResult(cacheKey, processedImages);
    
    console.log(`✅ [ILLUSTRATIONS] Found ${processedImages.length} images for: ${query}`);
    
    return NextResponse.json({
      success: true,
      data: processedImages,
      cached: false,
      metadata: {
        query,
        optimizedQuery,
        category,
        process,
        totalResults: processedImages.length,
        services: ['unsplash', 'pixabay', 'pexels']
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [ILLUSTRATIONS] Error:', error);
    
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

// Função para calcular relevância educacional
function calculateEducationalRelevance(image: any, query: string, process?: string): number {
  let relevance = 0.5; // Base relevance
  
  // Verificar se a descrição contém termos educacionais
  const educationalTerms = ['education', 'educational', 'school', 'learning', 'science', 'biology', 'chemistry', 'physics'];
  const description = (image.description || '').toLowerCase();
  
  educationalTerms.forEach(term => {
    if (description.includes(term)) {
      relevance += 0.1;
    }
  });
  
  // Verificar se contém termos do processo específico
  if (process) {
    const processInfo = EDUCATIONAL_PROCESSES[process.toLowerCase() as keyof typeof EDUCATIONAL_PROCESSES];
    if (processInfo) {
      processInfo.keywords.forEach(keyword => {
        if (description.includes(keyword.toLowerCase())) {
          relevance += 0.15;
        }
      });
    }
  }
  
  // Verificar tags
  if (image.tags && Array.isArray(image.tags)) {
    image.tags.forEach((tag: string) => {
      if (educationalTerms.some(term => tag.toLowerCase().includes(term))) {
        relevance += 0.05;
      }
    });
  }
  
  return Math.min(relevance, 1.0); // Cap at 1.0
}

// Endpoint GET para listar processos disponíveis
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  if (action === 'processes') {
    return NextResponse.json({
      success: true,
      data: Object.keys(EDUCATIONAL_PROCESSES).map(process => ({
        id: process,
        name: process.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        keywords: EDUCATIONAL_PROCESSES[process as keyof typeof EDUCATIONAL_PROCESSES].keywords,
        categories: EDUCATIONAL_PROCESSES[process as keyof typeof EDUCATIONAL_PROCESSES].categories,
        styles: EDUCATIONAL_PROCESSES[process as keyof typeof EDUCATIONAL_PROCESSES].styles
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  if (action === 'categories') {
    return NextResponse.json({
      success: true,
      data: [
        { id: 'biology', name: 'Biologia', description: 'Processos biológicos, anatomia, fisiologia' },
        { id: 'chemistry', name: 'Química', description: 'Reações químicas, elementos, compostos' },
        { id: 'physics', name: 'Física', description: 'Fenômenos físicos, movimento, energia' },
        { id: 'math', name: 'Matemática', description: 'Geometria, álgebra, cálculos' },
        { id: 'history', name: 'História', description: 'Eventos históricos, civilizações' },
        { id: 'geography', name: 'Geografia', description: 'Países, regiões, fenômenos geográficos' },
        { id: 'general', name: 'Geral', description: 'Conteúdo educacional geral' }
      ],
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json({
    success: true,
    message: 'API de Ilustrações Educacionais',
    endpoints: {
      'POST /api/illustrations/search': 'Buscar ilustrações',
      'GET /api/illustrations/search?action=processes': 'Listar processos disponíveis',
      'GET /api/illustrations/search?action=categories': 'Listar categorias disponíveis'
    },
    timestamp: new Date().toISOString()
  });
}
