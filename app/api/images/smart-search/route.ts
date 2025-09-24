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

interface SearchResult {
  success: boolean;
  images: ImageResult[];
  totalFound: number;
  sourcesUsed: string[];
  query: string;
  optimizedQuery: string;
  fallbackUsed: boolean;
  semanticAnalysis?: {
    primaryQuery: string;
    contextualQueries: string[];
    semanticScore: number;
  } | null;
  searchMethod: 'exact' | 'semantic_fallback' | 'error';
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

// Mapeamento semântico de temas para melhor compreensão contextual
const SEMANTIC_THEME_MAPPING: Record<string, {
  primaryTerms: string[];
  contextualTerms: string[];
  visualConcepts: string[];
  educationalContext: string[];
  relatedSubjects: string[];
}> = {
  'metallica': {
    primaryTerms: ['metallica band', 'metallica heavy metal', 'metallica concert', 'metallica music'],
    contextualTerms: ['heavy metal band', 'thrash metal', 'rock concert', 'metal music', 'guitar solo'],
    visualConcepts: ['dark', 'intense', 'energetic', 'powerful', 'metal'],
    educationalContext: ['music history', 'cultural impact', 'artistic expression', 'band history'],
    relatedSubjects: ['music', 'culture', 'entertainment', 'art']
  },
  'mathematics': {
    primaryTerms: ['mathematics', 'math', 'calculation', 'numbers'],
    contextualTerms: ['equation', 'formula', 'geometry', 'algebra', 'calculus'],
    visualConcepts: ['geometric', 'precise', 'logical', 'systematic'],
    educationalContext: ['problem solving', 'logical thinking', 'analytical skills'],
    relatedSubjects: ['science', 'engineering', 'physics', 'statistics']
  },
  'biology': {
    primaryTerms: ['biology', 'life science', 'living organisms'],
    contextualTerms: ['cell', 'DNA', 'evolution', 'ecosystem', 'organism'],
    visualConcepts: ['organic', 'natural', 'complex', 'interconnected'],
    educationalContext: ['life processes', 'scientific method', 'nature study'],
    relatedSubjects: ['chemistry', 'medicine', 'environment', 'genetics']
  },
  'history': {
    primaryTerms: ['history', 'historical', 'past events'],
    contextualTerms: ['ancient', 'medieval', 'revolution', 'war', 'civilization'],
    visualConcepts: ['vintage', 'timeless', 'documentary', 'archaeological'],
    educationalContext: ['cultural heritage', 'social development', 'historical analysis'],
    relatedSubjects: ['geography', 'politics', 'sociology', 'anthropology']
  },
  'physics': {
    primaryTerms: ['physics', 'physical science', 'natural laws'],
    contextualTerms: ['energy', 'force', 'motion', 'quantum', 'relativity'],
    visualConcepts: ['dynamic', 'theoretical', 'experimental', 'precise'],
    educationalContext: ['scientific method', 'mathematical modeling', 'experimental verification'],
    relatedSubjects: ['mathematics', 'chemistry', 'engineering', 'astronomy']
  },
  'chemistry': {
    primaryTerms: ['chemistry', 'chemical', 'molecular science'],
    contextualTerms: ['atom', 'molecule', 'reaction', 'compound', 'element'],
    visualConcepts: ['molecular', 'crystalline', 'reactive', 'transformative'],
    educationalContext: ['molecular interactions', 'chemical processes', 'laboratory work'],
    relatedSubjects: ['physics', 'biology', 'medicine', 'materials science']
  },
  'literature': {
    primaryTerms: ['literature', 'literary', 'written works'],
    contextualTerms: ['novel', 'poetry', 'drama', 'author', 'writing'],
    visualConcepts: ['artistic', 'expressive', 'narrative', 'creative'],
    educationalContext: ['critical thinking', 'cultural analysis', 'creative expression'],
    relatedSubjects: ['language', 'history', 'philosophy', 'art']
  },
  'geography': {
    primaryTerms: ['geography', 'geographical', 'earth science'],
    contextualTerms: ['landscape', 'climate', 'population', 'environment', 'region'],
    visualConcepts: ['topographical', 'environmental', 'spatial', 'diverse'],
    educationalContext: ['spatial analysis', 'environmental awareness', 'cultural geography'],
    relatedSubjects: ['environment', 'economics', 'politics', 'sociology']
  },
  'vacinação': {
    primaryTerms: ['vaccination', 'vaccine', 'immunization', 'medical vaccination'],
    contextualTerms: ['vaccine injection', 'medical procedure', 'healthcare', 'immunity', 'prevention'],
    visualConcepts: ['medical', 'healthcare', 'clinical', 'sterile', 'professional'],
    educationalContext: ['public health', 'medical education', 'healthcare training', 'immunology'],
    relatedSubjects: ['medicine', 'health', 'biology', 'public health']
  },
  'vaccination': {
    primaryTerms: ['vaccination', 'vaccine', 'immunization', 'medical vaccination'],
    contextualTerms: ['vaccine injection', 'medical procedure', 'healthcare', 'immunity', 'prevention'],
    visualConcepts: ['medical', 'healthcare', 'clinical', 'sterile', 'professional'],
    educationalContext: ['public health', 'medical education', 'healthcare training', 'immunology'],
    relatedSubjects: ['medicine', 'health', 'biology', 'public health']
  }
};

// Função para análise semântica avançada do tema
function analyzeSemanticTheme(topic: string, subject?: string): {
  primaryQuery: string;
  contextualQueries: string[];
  visualQueries: string[];
  educationalQueries: string[];
  semanticScore: number;
} {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Traduzir termos comuns do português para inglês
  const translations: Record<string, string> = {
    'vacinação': 'vaccination',
    'vacina': 'vaccine',
    'matemática': 'mathematics',
    'matematica': 'mathematics',
    'biologia': 'biology',
    'física': 'physics',
    'fisica': 'physics',
    'química': 'chemistry',
    'quimica': 'chemistry',
    'história': 'history',
    'historia': 'history',
    'geografia': 'geography',
    'literatura': 'literature',
    'metallica': 'metallica'
  };
  
  // Traduzir o tema para inglês se necessário
  const englishTopic = translations[normalizedTopic] || normalizedTopic;
  
  // Buscar mapeamento semântico direto
  let semanticMapping = SEMANTIC_THEME_MAPPING[englishTopic] || SEMANTIC_THEME_MAPPING[normalizedTopic];
  
  // Se não encontrar mapeamento direto, buscar por similaridade
  if (!semanticMapping) {
    const similarTheme = Object.keys(SEMANTIC_THEME_MAPPING).find(key => 
      englishTopic.includes(key) || key.includes(englishTopic) ||
      normalizedTopic.includes(key) || key.includes(normalizedTopic)
    );
    if (similarTheme) {
      semanticMapping = SEMANTIC_THEME_MAPPING[similarTheme];
    }
  }
  
  // Se ainda não encontrar, criar mapeamento genérico baseado no tema em inglês
  if (!semanticMapping) {
    semanticMapping = {
      primaryTerms: [englishTopic],
      contextualTerms: [englishTopic + ' concept', englishTopic + ' study'],
      visualConcepts: ['educational', 'informative', 'illustrative'],
      educationalContext: ['learning', 'education', 'academic'],
      relatedSubjects: [subject || 'general']
    };
  }
  
  // Gerar queries semânticas sempre em inglês
  const primaryQuery = semanticMapping.primaryTerms[0];
  const contextualQueries = semanticMapping.contextualTerms.slice(0, 3);
  const visualQueries = semanticMapping.visualConcepts.slice(0, 2);
  const educationalQueries = semanticMapping.educationalContext.slice(0, 2);
  
  // Calcular score semântico baseado na especificidade
  const semanticScore = semanticMapping.primaryTerms.length > 1 ? 85 : 70;
  
  console.log(`🧠 Análise semântica para "${topic}" (traduzido: "${englishTopic}"):`, {
    primaryQuery,
    contextualQueries,
    visualQueries,
    educationalQueries,
    semanticScore
  });
  
  return {
    primaryQuery,
    contextualQueries,
    visualQueries,
    educationalQueries,
    semanticScore
  };
}

// Função para otimizar query para educação
function optimizeQueryForEducation(query: string, subject?: string): string {
  const cleanQuery = query.toLowerCase().trim();
  
  // Se já contém palavras educacionais específicas, manter como está
  const hasEducationalTerms = Object.values(EDUCATIONAL_KEYWORDS).some(keywords => 
    keywords.some(keyword => cleanQuery.includes(keyword))
  );
  
  if (hasEducationalTerms) {
    return query;
  }
  
  // Adicionar contexto específico baseado no assunto, evitando termos genéricos
  let specificContext = '';
  if (subject) {
    const subjectKey = subject.toLowerCase().replace(/[^a-z]/g, '');
    if (EDUCATIONAL_KEYWORDS[subjectKey as keyof typeof EDUCATIONAL_KEYWORDS]) {
      const keywords = EDUCATIONAL_KEYWORDS[subjectKey as keyof typeof EDUCATIONAL_KEYWORDS];
      // Usar apenas o primeiro termo específico, não genérico
      specificContext = ` ${keywords[0]}`;
    }
  }
  
  // Se não há contexto específico, retornar a query original sem adicionar termos genéricos
  // Isso evita imagens genéricas sobre educação
  if (!specificContext) {
    return query;
  }
  
  return `${query}${specificContext}`.trim();
}

// Função para selecionar imagens garantindo diversidade de provedores
function selectDiverseImages(images: ImageResult[], count: number): ImageResult[] {
  const selected: ImageResult[] = [];
  const usedProviders = new Set<string>();
  const usedUrls = new Set<string>();
  
  // Ordenar provedores por prioridade educacional (Wikimedia primeiro para temas específicos)
  const providers = ['wikimedia', 'unsplash', 'pexels', 'pixabay', 'bing'];
  
  // Primeira passada: selecionar 1 imagem de cada provedor disponível, respeitando a ordem de prioridade
  providers.forEach(provider => {
    if (selected.length >= count) return;
    
    const providerImages = images.filter(img => img.source === provider);
    if (providerImages.length === 0) return; // Pular se não há imagens deste provedor
    
    const bestImage = providerImages
      .filter(img => !usedUrls.has(img.url))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
    
    if (bestImage) {
      selected.push(bestImage);
      usedProviders.add(provider);
      usedUrls.add(bestImage.url);
      console.log(`✅ Selecionada imagem do ${provider}: score ${bestImage.relevanceScore}`);
    }
  });
  
  // Segunda passada: completar com as melhores imagens restantes, mantendo diversidade
  const remainingImages = images
    .filter(img => !usedUrls.has(img.url))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  while (selected.length < count && remainingImages.length > 0) {
    const nextImage = remainingImages.shift();
    if (nextImage) {
      selected.push(nextImage);
      usedUrls.add(nextImage.url);
      console.log(`➕ Adicionada imagem adicional do ${nextImage.source}: score ${nextImage.relevanceScore}`);
    }
  }
  
  console.log(`🎯 Seleção diversificada: ${selected.length} imagens de ${usedProviders.size} provedores`);
  console.log(`📊 Provedores utilizados: ${Array.from(usedProviders).join(', ')}`);
  console.log(`📈 Distribuição: ${selected.map(img => img.source).join(', ')}`);
  
  return selected;
}

// Função para detectar imagens inadequadas ou irrelevantes
function isInappropriateImage(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Lista de termos que indicam conteúdo inadequado para educação
  const inappropriateTerms = [
    'anti', 'against', 'opposition', 'protest', 'demonstration', 'controversy',
    'debate', 'dispute', 'conflict', 'war', 'violence', 'aggressive',
    'negative', 'criticism', 'complaint', 'rejection', 'refusal'
  ];
  
  // Verificar se contém termos inadequados
  const hasInappropriateContent = inappropriateTerms.some(term => textLower.includes(term));
  
  if (hasInappropriateContent) {
    console.log(`🚫 Conteúdo inadequado detectado: "${text.slice(0, 50)}..."`);
    return true;
  }
  
  // Para temas médicos/vacinação, ser mais específico na detecção de irrelevância
  if (queryLower.includes('vaccination') || queryLower.includes('vaccine')) {
    // Verificar se é completamente irrelevante ao tema médico
    const medicalRelevantTerms = [
      'vaccine', 'vaccination', 'injection', 'syringe', 'medical', 'healthcare',
      'doctor', 'nurse', 'clinic', 'hospital', 'immunization', 'prevention',
      'certificate', 'card', 'patient', 'treatment', 'medicine', 'pharmaceutical'
    ];
    
    const hasMedicalRelevance = medicalRelevantTerms.some(term => textLower.includes(term));
    
    if (!hasMedicalRelevance) {
      console.log(`🚫 Conteúdo irrelevante ao tema médico detectado: "${text.slice(0, 50)}..."`);
      return true;
    }
    
    return false; // Se tem relevância médica, não é inadequada
  }
  
  // Para outros temas, verificar se é completamente irrelevante
  const irrelevantContexts = [
    'books', 'library', 'literature', 'reading', 'study', 'academic',
    'classroom', 'school', 'education', 'learning', 'knowledge'
  ];
  
  // Se contém apenas contextos genéricos de educação sem relação ao tema específico
  const hasOnlyGenericEducation = irrelevantContexts.some(context => textLower.includes(context));
  const hasSpecificTopic = textLower.includes(queryLower);
  
  if (hasOnlyGenericEducation && !hasSpecificTopic) {
    console.log(`🚫 Conteúdo genérico irrelevante detectado: "${text.slice(0, 50)}..."`);
    return true;
  }
  
  return false;
}

// Função para detectar falsos positivos na busca
function isFalsePositive(text: string, query: string): boolean {
  const queryLower = query.toLowerCase();
  
  // Lista de contextos que indicam falsos positivos para termos específicos
  const falsePositivePatterns: Record<string, string[]> = {
    'metallica': [
      'bird', 'pássaro', 'ave', 'nature', 'natureza', 'animal', 'wildlife', 'wild', 'tropical',
      'indonesia', 'halmahera', 'widi', 'islands', 'ilhas', 'red eyes', 'olhos vermelhos',
      'aporonisu', 'species', 'espécie', 'biological', 'biológico', 'insect', 'inseto',
      'dragonfly', 'libélula', 'macro', 'close-up', 'flying', 'voando', 'branch', 'galho',
      'diptera', 'entomology', 'entomologia'
    ],
    'apple': [
      'fruit', 'fruta', 'tree', 'árvore', 'garden', 'jardim', 'orchard', 'pomar',
      'red apple', 'maçã vermelha', 'green apple', 'maçã verde'
    ],
    'orange': [
      'fruit', 'fruta', 'citrus', 'citrino', 'juice', 'suco', 'tree', 'árvore'
    ],
    'tiger': [
      'cat', 'gato', 'animal', 'wildlife', 'zoo', 'jungle', 'selva', 'stripes', 'listras'
    ]
  };
  
  // Verificar se há padrões de falso positivo para este termo
  if (falsePositivePatterns[queryLower]) {
    const hasFalsePositiveContext = falsePositivePatterns[queryLower].some(pattern => 
      text.includes(pattern)
    );
    
    if (hasFalsePositiveContext) {
      console.log(`🚫 Falso positivo detectado para "${query}": contexto biológico/natural`);
      return true;
    }
  }
  
  // Verificar se o termo aparece em contexto muito genérico
  const genericContexts = ['sticker', 'logo', 'text', 'word', 'letter', 'font', 'design'];
  const hasGenericContext = genericContexts.some(context => text.includes(context));
  
  if (hasGenericContext && !text.includes('band') && !text.includes('music') && !text.includes('concert')) {
    console.log(`🚫 Falso positivo detectado para "${query}": contexto muito genérico`);
    return true;
  }
  
  return false;
}

// Função para calcular score de relevância educacional com prioridade para termo exato
function calculateEducationalScore(image: any, query: string, subject?: string): number {
  let score = 0;
  
  try {
    // Score baseado no título e descrição
    const text = `${image.title || ''} ${image.description || ''}`.toLowerCase();
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const exactQuery = query.toLowerCase().trim();
    
    // PRIORIDADE MÁXIMA: Correspondência exata com o termo completo
    if (text.includes(exactQuery)) {
      score += 50; // Score muito alto para correspondência exata
      console.log(`🎯 Correspondência exata encontrada para "${exactQuery}"`);
    }
    
    // PRIORIDADE ALTA: Correspondências com palavras individuais
    queryWords.forEach(word => {
      if (text.includes(word)) {
        score += 25; // Score alto para correspondências de palavras
      }
    });
    
    // BONUS ESPECIAL: Para temas médicos/educacionais positivos
    if (exactQuery.includes('vaccination') || exactQuery.includes('vaccine')) {
      const positiveMedicalTerms = ['injection', 'syringe', 'medical', 'healthcare', 'doctor', 'nurse', 'clinic', 'hospital', 'immunization', 'prevention'];
      const hasPositiveMedicalContext = positiveMedicalTerms.some(term => text.includes(term));
      
      if (hasPositiveMedicalContext) {
        score += 30; // Bonus alto para contexto médico positivo
        console.log(`🏥 Contexto médico positivo detectado`);
      }
      
      // Penalizar conteúdo anti-vacinação
      const negativeTerms = ['anti', 'against', 'opposition', 'protest', 'refusal'];
      const hasNegativeContext = negativeTerms.some(term => text.includes(term));
      
      if (hasNegativeContext) {
        score -= 50; // Penalização severa para conteúdo negativo
        console.log(`⚠️ Conteúdo negativo detectado - penalização aplicada`);
      }
    }
    
    // Bonus para tags relevantes
    if (image.tags) {
      const tags = Array.isArray(image.tags) ? image.tags : image.tags.split(', ');
      tags.forEach((tag: string) => {
        const tagLower = tag.toLowerCase();
        if (tagLower.includes(exactQuery)) {
          score += 30; // Bonus alto para tags que contêm o termo exato
        } else if (queryWords.some(word => tagLower.includes(word))) {
          score += 10; // Bonus menor para correspondências parciais
        }
      });
    }
    
    // Bonus para qualidade da imagem
    if (image.width && image.height) {
      const aspectRatio = image.width / image.height;
      // Preferir imagens com proporção adequada para slides
      if (aspectRatio >= 1.2 && aspectRatio <= 2.0) {
        score += 5;
      }
    }
    
    // Bonus por fonte confiável
    if (image.source === 'wikimedia') score += 15;
    if (image.source === 'unsplash') score += 8;
    if (image.source === 'pixabay') score += 6;
    if (image.source === 'bing') score += 7;
    if (image.source === 'pexels') score += 9;
    
    return Math.max(0, Math.min(100, score)); // Cap em 100
  } catch (error) {
    console.error('Erro no cálculo de score:', error);
    return 50; // Score padrão em caso de erro
  }
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
    
    // Buscar no Wikimedia Commons - excluir PDFs e focar em imagens
    const searchQuery = `${optimizedQuery} -filetype:pdf -filetype:doc -filetype:docx filetype:jpg OR filetype:png OR filetype:gif OR filetype:svg OR filetype:webp`;
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchQuery)}&srnamespace=6&srlimit=${Math.min(limit, 50)}&srprop=size&origin=*`;
    
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
    console.error('Erro ao buscar no Wikimedia:', error);
    return [];
  }
}

// Buscar no Bing Images
async function searchBing(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!PROVIDERS.bing.apiKey) return [];
  
  try {
    const optimizedQuery = optimizeQueryForEducation(query, subject);
    const params = new URLSearchParams({
      q: optimizedQuery,
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
    
    if (!response.ok) return [];
    
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
    return [];
  }
}

// Buscar no Pexels
async function searchPexels(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  if (!PROVIDERS.pexels.apiKey) return [];
  
  try {
    const optimizedQuery = optimizeQueryForEducation(query, subject);
    const params = new URLSearchParams({
      query: optimizedQuery,
      per_page: Math.min(limit, 80).toString(),
      orientation: 'landscape',
      size: 'large'
    });
    
    const response = await fetch(`${PROVIDERS.pexels.baseUrl}${PROVIDERS.pexels.endpoint}?${params}`, {
      headers: {
        'Authorization': PROVIDERS.pexels.apiKey
      }
    });
    
    if (!response.ok) return [];
    
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
    return [];
  }
}

// Função principal de busca inteligente com busca hierárquica
async function smartImageSearch(query: string, subject?: string, count: number = 3): Promise<SearchResult> {
  console.log(`🔍 Busca hierárquica inteligente para: "${query}" (assunto: ${subject || 'geral'})`);
  
  const sourcesUsed: string[] = [];
  let allImages: ImageResult[] = [];
  let semanticAnalysis = null;
  
  // ETAPA 1: Busca pelo termo exato do tema (prioridade máxima)
  console.log(`🎯 ETAPA 1: Buscando pelo termo exato "${query}"`);
  
  const exactSearchPromises = [
    searchUnsplash(query, subject || 'general', count),
    searchPixabay(query, subject || 'general', count),
    searchWikimedia(query, subject || 'general', count),
    searchBing(query, subject || 'general', count),
    searchPexels(query, subject || 'general', count)
  ];
  
  try {
    const exactResults = await Promise.allSettled(exactSearchPromises);
    
    exactResults.forEach((result, index) => {
      const providerNames = ['unsplash', 'pixabay', 'wikimedia', 'bing', 'pexels'];
      const providerName = providerNames[index];
      
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allImages = allImages.concat(result.value);
        sourcesUsed.push(providerName);
        console.log(`✅ ${providerName}: ${result.value.length} imagens encontradas pelo termo exato`);
      } else {
        console.log(`❌ ${providerName}: falha na busca pelo termo exato`);
      }
    });
    
    // Verificar se encontrou imagens suficientes com o termo exato
    const uniqueExactImages = allImages.filter((image, index, self) => 
      index === self.findIndex(img => img.url === image.url)
    );
    
    // Filtrar apenas imagens realmente relevantes ao tema
    const relevantImages = uniqueExactImages.filter(image => {
      const text = `${image.title || ''} ${image.description || ''}`.toLowerCase();
      const exactQuery = query.toLowerCase().trim();
      
      // Verificar se realmente contém o termo exato
      const hasExactMatch = text.includes(exactQuery);
      
      // Verificar se não é um falso positivo (ex: "metallica" em "aporonisu metallica" - um pássaro)
      const isRelevant = hasExactMatch && !isFalsePositive(text, exactQuery);
      
      // Verificar se não é inadequada ou irrelevante
      const isAppropriate = !isInappropriateImage(text, exactQuery);
      
      if (isRelevant && isAppropriate) {
        console.log(`✅ Imagem relevante e adequada encontrada: "${image.title?.slice(0, 50)}..."`);
      } else {
        console.log(`❌ Imagem inadequada/irrelevante descartada: "${image.title?.slice(0, 50)}..."`);
      }
      
      return isRelevant && isAppropriate;
    });
    
    console.log(`📊 Resultados da busca exata: ${uniqueExactImages.length} imagens únicas, ${relevantImages.length} relevantes`);
    
    // Se encontrou imagens suficientes com o termo exato E relevantes, usar apenas essas
    if (relevantImages.length >= count) {
      console.log(`✅ Termo exato encontrou ${relevantImages.length} imagens relevantes suficientes`);
      
      // Ordenar por relevância
      relevantImages.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Selecionar com diversidade de provedores
      const bestImages = selectDiverseImages(relevantImages, count);
      
      return {
        success: true,
        images: bestImages,
        totalFound: relevantImages.length,
        sourcesUsed,
        query,
        optimizedQuery: query,
        fallbackUsed: false,
        semanticAnalysis: null,
        searchMethod: 'exact'
      };
    }
    
    // ETAPA 2: Fallback semântico se não encontrou resultados suficientes
    console.log(`🧠 ETAPA 2: Fallback semântico - apenas ${relevantImages.length} imagens relevantes encontradas`);
    
    semanticAnalysis = analyzeSemanticTheme(query, subject);
    const semanticQuery = semanticAnalysis.primaryQuery;
    
    console.log(`🔍 Buscando semanticamente por: "${semanticQuery}"`);
    
    // Buscar com query semântica
    const semanticSearchPromises = [
      searchUnsplash(semanticQuery, subject || 'general', count),
      searchPixabay(semanticQuery, subject || 'general', count),
      searchWikimedia(semanticQuery, subject || 'general', count),
      searchBing(semanticQuery, subject || 'general', count),
      searchPexels(semanticQuery, subject || 'general', count)
    ];
    
    const semanticResults = await Promise.allSettled(semanticSearchPromises);
    
    // Limpar imagens anteriores e começar apenas com imagens da busca semântica
    allImages = [];
    
    semanticResults.forEach((result, index) => {
      const providerNames = ['unsplash', 'pixabay', 'wikimedia', 'bing', 'pexels'];
      const providerName = providerNames[index];
      
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allImages = allImages.concat(result.value);
        if (!sourcesUsed.includes(providerName)) {
          sourcesUsed.push(providerName);
        }
        console.log(`✅ ${providerName}: ${result.value.length} imagens encontradas semanticamente`);
      } else {
        console.log(`❌ ${providerName}: falha na busca semântica`);
      }
    });
    
    // Aplicar bonus semântico aos scores
    allImages.forEach(image => {
      image.relevanceScore += semanticAnalysis.semanticScore / 10;
    });
    
    // Ordenar por relevância
    allImages.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Remover duplicatas
    const uniqueImages = allImages.filter((image, index, self) => 
      index === self.findIndex(img => img.url === image.url)
    );
    
    // Selecionar com diversidade
    const bestImages = selectDiverseImages(uniqueImages, count);
    
    console.log(`🎯 Total final: ${uniqueImages.length} imagens únicas`);
    console.log(`🏆 Melhores ${bestImages.length} imagens selecionadas`);
    
    return {
      success: bestImages.length > 0,
      images: bestImages,
      totalFound: uniqueImages.length,
      sourcesUsed,
      query,
      optimizedQuery: semanticQuery,
      fallbackUsed: true,
      semanticAnalysis: {
        primaryQuery: semanticAnalysis.primaryQuery,
        contextualQueries: semanticAnalysis.contextualQueries,
        semanticScore: semanticAnalysis.semanticScore
      },
      searchMethod: 'semantic_fallback'
    };
    
  } catch (error) {
    console.error('Erro na busca hierárquica:', error);
    return {
      success: false,
      images: [],
      totalFound: 0,
      sourcesUsed: [],
      query,
      optimizedQuery: query,
      fallbackUsed: true,
      semanticAnalysis: null,
      searchMethod: 'error'
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
