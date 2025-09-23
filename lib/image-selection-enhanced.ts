/**
 * Sistema Avançado de Seleção de Imagens - Focado no Tema
 * Garante 3 imagens distintas, 1 por provedor, com queries apenas sobre o tema
 */

export interface ImageResult {
  url: string;
  provider: 'wikimedia' | 'unsplash' | 'pixabay';
  title?: string;
  description?: string;
  score: number;
  license?: string;
  attribution?: string;
  author?: string;
  sourceUrl?: string;
  width?: number;
  height?: number;
}

export interface ProviderSearchResult {
  wikimedia: ImageResult[];
  unsplash: ImageResult[];
  pixabay: ImageResult[];
}

/**
 * Constrói query focada APENAS no tema específico em inglês, sem termos educacionais genéricos
 */
export function buildTopicOnlyQuery(topic: string): string {
  const base = topic
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // limpa pontuação
    .replace(/\s+/g, ' ')
    .trim();

  // Traduzir termos específicos para inglês
  const translations: Record<string, string> = {
    'matemática': 'mathematics',
    'matematica': 'mathematics',
    'álgebra': 'algebra',
    'algebra': 'algebra',
    'geometria': 'geometry',
    'trigonometria': 'trigonometry',
    'cálculo': 'calculus',
    'calculo': 'calculus',
    'estatística': 'statistics',
    'estatistica': 'statistics',
    'probabilidade': 'probability',
    'física': 'physics',
    'fisica': 'physics',
    'química': 'chemistry',
    'quimica': 'chemistry',
    'biologia': 'biology',
    'história': 'history',
    'historia': 'history',
    'geografia': 'geography',
    'literatura': 'literature',
    'português': 'portuguese',
    'portugues': 'portuguese',
    'filosofia': 'philosophy',
    'sociologia': 'sociology',
    'arte': 'art',
    'música': 'music',
    'musica': 'music',
    'educação': 'education',
    'educacao': 'education',
    'eletricidade': 'electricity',
    'corrente': 'current',
    'voltagem': 'voltage',
    'resistência': 'resistance',
    'resistencia': 'resistance',
    'circuito': 'circuit',
    'fotossíntese': 'photosynthesis',
    'fotossintese': 'photosynthesis',
    'célula': 'cell',
    'celula': 'cell',
    'dna': 'dna',
    'genética': 'genetics',
    'genetica': 'genetics',
    'evolução': 'evolution',
    'evolucao': 'evolution',
    'clima': 'climate',
    'relevo': 'relief',
    'gramática': 'grammar',
    'gramatica': 'grammar',
    'redação': 'writing',
    'redacao': 'writing'
  };

  // Traduzir palavras individuais
  const words = base.split(' ');
  const translatedWords = words.map(word => translations[word] || word);
  
  // Retornar apenas o tema traduzido, sem termos educacionais genéricos
  return translatedWords.join(' ');
}

/**
 * Busca imagens em todos os provedores separadamente com timeout
 */
export async function searchAllProviders(query: string): Promise<ProviderSearchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    // Usar Promise.allSettled para não falhar se um provedor estiver lento
    const [wikimediaResult, unsplashResult, pixabayResult] = await Promise.allSettled([
      Promise.race([
        searchWikimedia(query, baseUrl),
        new Promise<ImageResult[]>((_, reject) => 
          setTimeout(() => reject(new Error('Wikimedia timeout')), 3000)
        )
      ]),
      Promise.race([
        searchUnsplash(query, baseUrl),
        new Promise<ImageResult[]>((_, reject) => 
          setTimeout(() => reject(new Error('Unsplash timeout')), 3000)
        )
      ]),
      Promise.race([
        searchPixabay(query, baseUrl),
        new Promise<ImageResult[]>((_, reject) => 
          setTimeout(() => reject(new Error('Pixabay timeout')), 3000)
        )
      ])
    ]);

    return {
      wikimedia: wikimediaResult.status === 'fulfilled' ? wikimediaResult.value : [],
      unsplash: unsplashResult.status === 'fulfilled' ? unsplashResult.value : [],
      pixabay: pixabayResult.status === 'fulfilled' ? pixabayResult.value : []
    };
  } catch (error) {
    console.error('Erro ao buscar em todos os provedores:', error);
    return {
      wikimedia: [],
      unsplash: [],
      pixabay: []
    };
  }
}

/**
 * Busca específica no Wikimedia Commons
 */
async function searchWikimedia(query: string, baseUrl: string): Promise<ImageResult[]> {
  try {
    const response = await fetch(`${baseUrl}/api/wikimedia/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query, 
        count: 3, // Reduzido para ser mais rápido
        safe: true 
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success || !data.photos) return [];

    return data.photos.map((photo: any) => ({
      url: photo.urls?.regular || photo.url,
      provider: 'wikimedia' as const,
      title: photo.description || photo.title,
      description: photo.description,
      score: 0.7 + Math.random() * 0.2, // Score base + variação
      license: photo.license,
      attribution: photo.author,
      author: photo.author,
      sourceUrl: photo.sourceUrl,
      width: photo.width,
      height: photo.height
    }));
  } catch (error) {
    console.error('Erro ao buscar no Wikimedia:', error);
    return [];
  }
}

/**
 * Busca específica no Unsplash
 */
async function searchUnsplash(query: string, baseUrl: string): Promise<ImageResult[]> {
  try {
    const response = await fetch(`${baseUrl}/api/unsplash/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query, 
        count: 3, // Reduzido para ser mais rápido
        orientation: 'landscape',
        safe: true 
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success || !data.results) return [];

    return data.results.map((photo: any) => ({
      url: photo.urls?.regular || photo.url,
      provider: 'unsplash' as const,
      title: photo.description || photo.alt_description,
      description: photo.description,
      score: 0.6 + Math.random() * 0.2,
      license: 'Unsplash License',
      attribution: `Photo by ${photo.user?.name} on Unsplash`,
      author: photo.user?.name,
      sourceUrl: photo.links?.html,
      width: photo.width,
      height: photo.height
    }));
  } catch (error) {
    console.error('Erro ao buscar no Unsplash:', error);
    return [];
  }
}

/**
 * Busca específica no Pixabay
 */
async function searchPixabay(query: string, baseUrl: string): Promise<ImageResult[]> {
  try {
    const response = await fetch(`${baseUrl}/api/pixabay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'search',
        query, 
        perPage: 3, // Reduzido para ser mais rápido
        // Remover categoria educacional genérica para focar no tema específico
        type: 'images'
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success || !data.data) return [];

    return data.data.map((photo: any) => ({
      url: photo.webformatURL || photo.largeImageURL,
      provider: 'pixabay' as const,
      title: photo.tags,
      description: photo.tags,
      score: 0.5 + Math.random() * 0.2,
      license: 'Pixabay License',
      attribution: `Image by ${photo.user} from Pixabay`,
      author: photo.user,
      sourceUrl: photo.pageURL,
      width: photo.imageWidth,
      height: photo.imageHeight
    }));
  } catch (error) {
    console.error('Erro ao buscar no Pixabay:', error);
    return [];
  }
}

/**
 * Re-ranking focado APENAS no tema específico - sem viés educacional
 */
export function rerankImages(images: ImageResult[], queryTerms: string[], usedGlobal: Set<string>): ImageResult[] {
  const hasTerm = (text: string, term: string) => text.toLowerCase().includes(term.toLowerCase());
  
  return images.map(img => {
    let score = img.score || 0;
    const text = `${img.title || ''} ${img.description || ''}`.toLowerCase();
    
    // Boost APENAS por termos do tema específico
    for (const term of queryTerms) {
      if (hasTerm(text, term)) {
        score += 0.1; // Boost maior para termos específicos do tema
      }
    }
    
    // Penalidade de repetição global
    if (usedGlobal.has(img.url)) {
      score -= 0.3;
    }
    
    // Penalidade para termos genéricos educacionais
    const genericTerms = ['education', 'learning', 'teaching', 'school', 'classroom', 'student', 'teacher', 'study', 'book', 'academic'];
    for (const term of genericTerms) {
      if (hasTerm(text, term)) {
        score -= 0.05; // Penalidade para termos genéricos
      }
    }
    
    return { ...img, score };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Seleciona 1 imagem por provedor, garantindo diversidade
 */
export function pickOnePerProvider(pools: ProviderSearchResult): ImageResult[] {
  const used = new Set<string>();
  const result: ImageResult[] = [];
  
  const providers: Array<keyof ProviderSearchResult> = ['wikimedia', 'unsplash', 'pixabay'];
  
  providers.forEach(provider => {
    const images = pools[provider] || [];
    const bestImage = images
      .sort((a, b) => b.score - a.score)
      .find(img => !used.has(img.url));
    
    if (bestImage) {
      used.add(bestImage.url);
      result.push(bestImage);
    }
  });
  
  return result;
}

/**
 * Completa faltas com próximas melhores imagens
 */
export function fillShortageWithNextBest(
  pools: ProviderSearchResult, 
  current: ImageResult[], 
  minCount: number = 3
): ImageResult[] {
  if (current.length >= minCount) return current;
  
  const used = new Set(current.map(img => img.url));
  const allImages = [
    ...pools.wikimedia,
    ...pools.unsplash,
    ...pools.pixabay
  ].sort((a, b) => b.score - a.score);
  
  for (const img of allImages) {
    if (current.length >= minCount) break;
    if (!used.has(img.url)) {
      used.add(img.url);
      current.push(img);
    }
  }
  
  return current;
}

/**
 * Função principal: seleciona 3 imagens distintas focadas no tema
 */
export async function selectThreeDistinctImages(topic: string): Promise<ImageResult[]> {
  const query = buildTopicOnlyQuery(topic);
  const queryTerms = query.split(' ');
  
  console.log(`🔍 Buscando imagens para tema: "${topic}"`);
  console.log(`📝 Query gerada: "${query}"`);
  
  const pools = await searchAllProviders(query);
  
  // Log de resultados por provedor
  console.log(`📊 Resultados por provedor:`, {
    wikimedia: pools.wikimedia.length,
    unsplash: pools.unsplash.length,
    pixabay: pools.pixabay.length
  });
  
  // Re-ranking de todas as imagens
  const rerankedPools: ProviderSearchResult = {
    wikimedia: rerankImages(pools.wikimedia, queryTerms, new Set()),
    unsplash: rerankImages(pools.unsplash, queryTerms, new Set()),
    pixabay: rerankImages(pools.pixabay, queryTerms, new Set())
  };
  
  // Selecionar 1 por provedor
  let selected = pickOnePerProvider(rerankedPools);
  
  // Completar com próximas melhores se necessário
  selected = fillShortageWithNextBest(rerankedPools, selected, 3);
  
  console.log(`✅ Selecionadas ${selected.length} imagens distintas:`, 
    selected.map(img => `${img.provider}: ${img.title?.slice(0, 30)}...`)
  );
  
  return selected;
}

/**
 * Valida se a seleção atende aos critérios
 */
export function validateImageSelection(images: ImageResult[]): {
  isValid: boolean;
  issues: string[];
  metrics: {
    totalImages: number;
    uniqueUrls: number;
    uniqueProviders: number;
    hasRequiredProviders: boolean;
  };
} {
  const issues: string[] = [];
  
  // Verificar quantidade mínima
  if (images.length < 3) {
    issues.push(`Apenas ${images.length} imagens selecionadas (mínimo: 3)`);
  }
  
  // Verificar URLs únicas
  const urls = new Set(images.map(img => img.url));
  if (urls.size !== images.length) {
    issues.push(`Encontradas ${images.length - urls.size} URLs duplicadas`);
  }
  
  // Verificar provedores únicos
  const providers = new Set(images.map(img => img.provider));
  if (providers.size < 2) {
    issues.push(`Apenas ${providers.size} provedor(es) distintos (mínimo: 2)`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    metrics: {
      totalImages: images.length,
      uniqueUrls: urls.size,
      uniqueProviders: providers.size,
      hasRequiredProviders: providers.size >= 2
    }
  };
}

export default {
  buildTopicOnlyQuery,
  searchAllProviders,
  rerankImages,
  pickOnePerProvider,
  fillShortageWithNextBest,
  selectThreeDistinctImages,
  validateImageSelection
};
