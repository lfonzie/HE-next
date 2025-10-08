import { NextRequest, NextResponse } from 'next/server';
import { analyzeTopicRelevance } from './generic-relevance';

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
    primaryTerms: ['metallica band', 'metallica heavy metal', 'metallica concert', 'metallica music', 'james hetfield', 'lars ulrich', 'kirk hammett'],
    contextualTerms: ['heavy metal band', 'thrash metal', 'rock concert', 'metal music', 'guitar solo', 'master of puppets', 'black album'],
    visualConcepts: ['dark', 'intense', 'energetic', 'powerful', 'metal', 'concert', 'stage'],
    educationalContext: ['music history', 'cultural impact', 'artistic expression', 'band history', 'album covers', 'live performances'],
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
  },
  'aquecimento global': {
    primaryTerms: ['global warming', 'climate change', 'aquecimento global'],
    contextualTerms: ['greenhouse effect', 'carbon emissions', 'temperature rise', 'climate crisis', 'environmental impact'],
    visualConcepts: ['environmental', 'climate', 'temperature', 'ice melting', 'polar regions'],
    educationalContext: ['environmental science', 'climate education', 'sustainability', 'ecology'],
    relatedSubjects: ['environment', 'geography', 'science', 'ecology']
  },
  'causas do aquecimento global': {
    primaryTerms: ['global warming causes', 'climate change causes', 'causas do aquecimento global'],
    contextualTerms: ['greenhouse gases', 'carbon emissions', 'fossil fuels', 'deforestation', 'industrial pollution'],
    visualConcepts: ['industrial', 'emissions', 'pollution', 'deforestation', 'fossil fuels'],
    educationalContext: ['environmental science', 'climate education', 'sustainability', 'ecology'],
    relatedSubjects: ['environment', 'geography', 'science', 'ecology']
  },
  'gravity': {
    primaryTerms: ['gravity', 'gravitational force', 'gravitational pull', 'mass attraction'],
    contextualTerms: ['newton', 'einstein', 'relativity', 'spacetime', 'orbital mechanics', 'celestial bodies'],
    visualConcepts: ['space', 'planets', 'orbits', 'falling objects', 'gravitational field', 'physics diagram'],
    educationalContext: ['physics education', 'scientific concepts', 'natural laws', 'space science'],
    relatedSubjects: ['physics', 'astronomy', 'mathematics', 'space science']
  },
  'how gravity works': {
    primaryTerms: ['how gravity works', 'gravity explanation', 'gravitational force', 'mass attraction'],
    contextualTerms: ['newton', 'einstein', 'relativity', 'spacetime', 'orbital mechanics', 'celestial bodies'],
    visualConcepts: ['space', 'planets', 'orbits', 'falling objects', 'gravitational field', 'physics diagram'],
    educationalContext: ['physics education', 'scientific concepts', 'natural laws', 'space science'],
    relatedSubjects: ['physics', 'astronomy', 'mathematics', 'space science']
  },
  'gravidade': {
    primaryTerms: ['gravity', 'gravitational force', 'gravitational pull', 'mass attraction'],
    contextualTerms: ['newton', 'einstein', 'relativity', 'spacetime', 'orbital mechanics', 'celestial bodies'],
    visualConcepts: ['space', 'planets', 'orbits', 'falling objects', 'gravitational field', 'physics diagram'],
    educationalContext: ['physics education', 'scientific concepts', 'natural laws', 'space science'],
    relatedSubjects: ['physics', 'astronomy', 'mathematics', 'space science']
  },
  'revolução francesa': {
    primaryTerms: ['french revolution', 'revolução francesa', 'causes of the french revolution', 'causas da revolução francesa'],
    contextualTerms: ['bastille', 'louis xvi', 'marie antoinette', 'napoleon', 'versailles', 'paris', 'tricolor'],
    visualConcepts: ['historical', 'revolutionary', '18th century', 'ancien régime', 'french flag', 'liberty'],
    educationalContext: ['history education', 'revolutionary history', 'french history', 'historical analysis'],
    relatedSubjects: ['history', 'politics', 'sociology', 'art']
  },
  'causas da revolução francesa': {
    primaryTerms: ['causes of the french revolution', 'causas da revolução francesa', 'french revolution causes'],
    contextualTerms: ['bastille', 'louis xvi', 'marie antoinette', 'napoleon', 'versailles', 'paris', 'tricolor'],
    visualConcepts: ['historical', 'revolutionary', '18th century', 'ancien régime', 'french flag', 'liberty'],
    educationalContext: ['history education', 'revolutionary history', 'french history', 'historical analysis'],
    relatedSubjects: ['history', 'politics', 'sociology', 'art']
  },
  'how internet works': {
    primaryTerms: ['how internet works', 'internet technology', 'internet infrastructure', 'internet protocols'],
    contextualTerms: ['tcp ip protocol', 'network protocols', 'data transmission', 'packet switching', 'routing', 'dns', 'http', 'https'],
    visualConcepts: ['network diagram', 'data flow', 'server infrastructure', 'fiber optic cables', 'network topology', 'data centers'],
    educationalContext: ['computer science', 'network engineering', 'information technology', 'digital communication'],
    relatedSubjects: ['computer science', 'engineering', 'technology', 'telecommunications']
  },
  'internet': {
    primaryTerms: ['internet', 'world wide web', 'web technology', 'network infrastructure'],
    contextualTerms: ['computer network', 'data transmission', 'web protocols', 'digital communication', 'online connectivity'],
    visualConcepts: ['network diagram', 'data flow', 'server infrastructure', 'fiber optic cables', 'network topology'],
    educationalContext: ['computer science', 'network technology', 'digital literacy', 'information technology'],
    relatedSubjects: ['computer science', 'technology', 'engineering', 'telecommunications']
  },
  'computer network': {
    primaryTerms: ['computer network', 'network infrastructure', 'network topology', 'network protocols'],
    contextualTerms: ['lan', 'wan', 'router', 'switch', 'ethernet', 'wifi', 'network security', 'data transmission'],
    visualConcepts: ['network diagram', 'network topology', 'data flow', 'server infrastructure', 'cable infrastructure'],
    educationalContext: ['network engineering', 'computer science', 'information technology', 'system administration'],
    relatedSubjects: ['computer science', 'engineering', 'technology', 'telecommunications']
  },
  'information technology': {
    primaryTerms: ['information technology', 'it infrastructure', 'digital technology', 'computer systems'],
    contextualTerms: ['data processing', 'computer networks', 'software systems', 'hardware infrastructure', 'digital services'],
    visualConcepts: ['server rooms', 'data centers', 'computer systems', 'network infrastructure', 'digital devices'],
    educationalContext: ['computer science', 'information systems', 'technology education', 'digital literacy'],
    relatedSubjects: ['computer science', 'engineering', 'business', 'technology']
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
    'metallica': 'metallica',
    'aquecimento global': 'global warming',
    'causas do aquecimento global': 'global warming causes',
    'mudanças climáticas': 'climate change',
    'mudancas climaticas': 'climate change',
    'gravidade': 'gravity',
    'como funciona a gravidade': 'how gravity works',
    'como funciona a gravidade?': 'how gravity works',
    'como funciona a internet': 'how internet works',
    'como funciona a internet?': 'how internet works',
    'internet': 'internet',
    'rede de computadores': 'computer network',
    'redes de computadores': 'computer networks',
    'world wide web': 'world wide web',
    'web': 'web',
    'tecnologia da informação': 'information technology',
    'protocolo tcp/ip': 'tcp ip protocol',
    'protocolos de rede': 'network protocols',
    'infraestrutura de rede': 'network infrastructure',
    'revolução francesa': 'french revolution',
    'causas da revolução francesa': 'causes of the french revolution'
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
function selectDiverseImages(images: ImageResult[], count: number, query?: string): ImageResult[] {
  const selected: ImageResult[] = [];
  const usedProviders = new Set<string>();
  const usedUrls = new Set<string>();
  
  // Ordenar provedores por prioridade educacional (Wikimedia e Bing primeiro para Metallica)
  const providers = query.toLowerCase().includes('metallica') 
    ? ['wikimedia', 'bing', 'unsplash', 'pexels', 'pixabay']  // Prioridade especial para Metallica
    : ['wikimedia', 'unsplash', 'pexels', 'pixabay', 'bing']; // Ordem padrão
  
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

// Função melhorada para detectar falsos positivos com análise semântica rigorosa
function isFalsePositive(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Para Metallica, análise semântica rigorosa
  if (queryLower === 'metallica') {
    // Termos específicos do Metallica que DEVEM estar presentes
    const metallicaSpecificTerms = [
      'metallica', 'james hetfield', 'lars ulrich', 'kirk hammett', 
      'robert trujillo', 'jason newsted', 'cliff burton',
      'kill em all', 'ride the lightning', 'master of puppets',
      'and justice for all', 'black album', 'load', 'reload',
      'st anger', 'death magnetic', 'hardwired', 'heavy metal', 'thrash metal',
      'band', 'concert', 'music', 'guitar', 'drum', 'bass', 'rock', 'metal'
    ];
    
    // Verificar se contém termos específicos do Metallica
    const hasMetallicaTerms = metallicaSpecificTerms.some(term => textLower.includes(term));
    
    // Falsos positivos óbvios para Metallica (incluindo livros históricos)
    const falsePositives = [
      'bird', 'animal', 'nature', 'wildlife', 'insect', 'beetle',
      'book', 'library', 'education', 'school', 'student', 'classroom',
      'food', 'restaurant', 'cooking', 'recipe', 'meal',
      'car', 'vehicle', 'automobile', 'transportation',
      'building', 'architecture', 'construction', 'house',
      'georgius agricola', 'de re metallica', 'mining', 'mineração',
      'metalwork', 'metalworking', 'metallurgy', 'metalúrgica',
      'historical', 'ancient', 'medieval', 'classical', 'antique',
      'manuscript', 'document', 'text', 'writing', 'script'
    ];
    
    const hasFalsePositiveTerms = falsePositives.some(term => textLower.includes(term));
    
    // Se tem termos de falso positivo E não tem termos específicos do Metallica
    if (hasFalsePositiveTerms && !hasMetallicaTerms) {
      console.log(`🚫 Falso positivo detectado para Metallica: "${text.slice(0, 50)}..."`);
      return true;
    }
    
    return false;
  }
  
  // Para outros temas, usar análise genérica
  const genericFalsePositives = [
    'adult', 'explicit', 'nude', 'sexual', 'violence', 'gore', 'blood',
    'drug', 'alcohol', 'smoking', 'gambling', 'casino'
  ];
  
  return genericFalsePositives.some(term => textLower.includes(term));
}

// Função para detectar temas históricos ou sensíveis
function isHistoricalOrSensitiveTopic(query: string): boolean {
  const historicalKeywords = [
    'war', 'guerra', 'world war', 'segunda guerra', 'primeira guerra',
    'holocaust', 'genocide', 'genocídio', 'nazi', 'hitler', 'stalin',
    'battle', 'batalha', 'conflict', 'conflito', 'military', 'militar',
    'revolution', 'revolução', 'civil war', 'guerra civil',
    'crusade', 'cruzada', 'invasion', 'invasão', 'occupation', 'ocupação',
    'french revolution', 'revolução francesa', 'causes of the french revolution', 'causas da revolução francesa',
    'history', 'história', 'historical', 'histórico', 'ancient', 'antigo',
    'medieval', 'medieval', 'renaissance', 'renascimento'
  ];
  
  return historicalKeywords.some(keyword => query.includes(keyword));
}

// Função específica para filtrar imagens inadequadas em temas históricos
function isInappropriateForHistoricalTopic(text: string, query: string): boolean {
  // Para Revolução Francesa específica, ser mais permissivo
  if (query.includes('french revolution') || query.includes('revolução francesa') ||
      query.includes('causes of the french revolution') || query.includes('causas da revolução francesa')) {
    
    // Verificar se tem pelo menos alguns termos relacionados à Revolução Francesa
    const frenchRevolutionTerms = [
      'french', 'frança', 'france', 'revolution', 'revolução', 'bastille', 'bastilha',
      'louis', 'marie antoinette', 'maria antonieta', 'napoleon', 'napoleão',
      'versailles', 'versalhes', 'paris', 'tricolor', 'liberty', 'liberdade',
      'equality', 'igualdade', 'fraternity', 'fraternidade', 'historical', 'histórico',
      '18th century', 'século xviii', 'eighteenth century', 'ancien régime', 'antigo regime',
      'document', 'documento', 'archive', 'arquivo', 'manuscript', 'manuscrito',
      'portrait', 'retrato', 'painting', 'pintura', 'historical painting', 'pintura histórica'
    ];
    
    const hasRelevantTerms = frenchRevolutionTerms.some(term => text.includes(term));
    
    if (hasRelevantTerms) {
      console.log(`✅ Imagem relevante para Revolução Francesa encontrada: "${text.slice(0, 50)}..."`);
      return false; // Não é inadequada
    }
  }
  
  // Termos que indicam conteúdo inadequado para educação histórica
  const inappropriateHistoricalTerms = [
    // Conteúdo violento ou gráfico
    'blood', 'sangue', 'corpse', 'cadáver', 'death', 'morte', 'killing', 'matando',
    'execution', 'execução', 'torture', 'tortura', 'massacre', 'massacre',
    'bombing', 'bombardeio', 'destruction', 'destruição', 'ruins', 'ruínas',
    
    // Conteúdo político controverso
    'propaganda', 'propaganda', 'hate', 'ódio', 'racist', 'racista',
    'supremacist', 'supremacista', 'extremist', 'extremista',
    
    // Conteúdo inadequado para educação
    'adult', 'adulto', 'sexy', 'sensual', 'nude', 'nu', 'explicit', 'explícito',
    
    // Conteúdo irrelevante ao tema histórico
    'modern', 'moderno', 'contemporary', 'contemporâneo', 'current', 'atual',
    'today', 'hoje', 'now', 'agora', 'recent', 'recente',
    
    // Arte abstrata ou genérica
    'abstract', 'abstrato', 'art', 'arte', 'painting', 'pintura', 'drawing', 'desenho',
    'illustration', 'ilustração', 'cartoon', 'desenho animado', 'comic', 'quadrinho',
    
    // Conteúdo comercial ou não educacional
    'advertisement', 'anúncio', 'commercial', 'comercial', 'marketing', 'marketing',
    'product', 'produto', 'sale', 'venda', 'buy', 'comprar', 'shop', 'loja'
  ];
  
  // Verificar se contém termos inadequados
  const hasInappropriateContent = inappropriateHistoricalTerms.some(term => text.includes(term));
  
  if (hasInappropriateContent) {
    console.log(`🚫 Conteúdo inadequado para tema histórico detectado: "${text.slice(0, 50)}..."`);
    return true;
  }
  
  // Verificar se é relevante para educação histórica
  const isEducationallyRelevant = isEducationallyRelevantForHistory(text, query);
  
  if (!isEducationallyRelevant) {
    console.log(`🚫 Conteúdo não educacional para tema histórico detectado: "${text.slice(0, 50)}..."`);
    return true;
  }
  
  return false;
}

// Função para verificar se a imagem é educacionalmente relevante para história
function isEducationallyRelevantForHistory(text: string, query: string): boolean {
  // Termos que indicam conteúdo educacionalmente relevante para história
  const educationalHistoricalTerms = [
    // Documentos históricos
    'document', 'documento', 'archive', 'arquivo', 'manuscript', 'manuscrito',
    'letter', 'carta', 'treaty', 'tratado', 'declaration', 'declaração',
    
    // Mapas e geografia histórica
    'map', 'mapa', 'territory', 'território', 'border', 'fronteira',
    'region', 'região', 'country', 'país', 'nation', 'nação',
    
    // Figuras históricas (sem conteúdo inadequado)
    'leader', 'líder', 'politician', 'político', 'commander', 'comandante',
    'general', 'general', 'president', 'presidente', 'minister', 'ministro',
    
    // Eventos históricos
    'conference', 'conferência', 'meeting', 'reunião', 'summit', 'cúpula',
    'ceremony', 'cerimônia', 'event', 'evento', 'occasion', 'ocasião',
    
    // Tecnologia histórica
    'weapon', 'arma', 'tank', 'tanque', 'aircraft', 'aeronave', 'ship', 'navio',
    'uniform', 'uniforme', 'equipment', 'equipamento', 'vehicle', 'veículo',
    
    // Arquitetura e locais históricos
    'building', 'edifício', 'monument', 'monumento', 'memorial', 'memorial',
    'museum', 'museu', 'library', 'biblioteca', 'archive', 'arquivo',
    
    // Termos educacionais
    'educational', 'educacional', 'learning', 'aprendizado', 'teaching', 'ensino',
    'study', 'estudo', 'research', 'pesquisa', 'academic', 'acadêmico'
  ];
  
  // Verificar se contém termos educacionalmente relevantes
  const hasEducationalContent = educationalHistoricalTerms.some(term => text.includes(term));
  
  // Verificar se é específico ao tema histórico
  const isSpecificToTopic = isSpecificToHistoricalTopic(text, query);
  
  return hasEducationalContent && isSpecificToTopic;
}

// Função para verificar se a imagem é específica ao tema histórico
function isSpecificToHistoricalTopic(text: string, query: string): boolean {
  // Extrair palavras-chave do tema
  const topicKeywords = query.split(' ').filter(word => word.length > 3);
  
  // Verificar se o texto contém palavras-chave do tema
  const hasTopicKeywords = topicKeywords.some(keyword => text.includes(keyword));
  
  // Verificar se não é genérico demais
  const isNotTooGeneric = !text.includes('generic') && !text.includes('genérico') &&
                         !text.includes('abstract') && !text.includes('abstrato') &&
                         !text.includes('art') && !text.includes('arte');
  
  return hasTopicKeywords && isNotTooGeneric;
}

// Função para calcular score de relevância educacional com prioridade para termo exato
function calculateEducationalScore(image: any, query: string, subject?: string): number {
  let score = 0;
  
  try {
    // Score baseado no título e descrição
    const text = `${image.title || ''} ${image.description || ''}`.toLowerCase();
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const exactQuery = query.toLowerCase().trim();
    
    // ANÁLISE SEMÂNTICA INTELIGENTE
    const semanticAnalysis = analyzeSemanticRelevance(text, exactQuery, queryWords);
    
    // Aplicar penalizações por irrelevância semântica
    if (semanticAnalysis.isIrrelevant) {
      console.log(`❌ Conteúdo irrelevante detectado: "${text.substring(0, 50)}..." - REJEITADO`);
      return semanticAnalysis.penalty;
    }
    
    // Aplicar bonificações por relevância semântica
    score += semanticAnalysis.bonus;
    
    if (semanticAnalysis.bonus > 0) {
      console.log(`✅ Relevância semântica detectada: ${semanticAnalysis.reason} (+${semanticAnalysis.bonus})`);
    }
    
    // Score baseado em correspondência exata (para termos não específicos)
    if (!semanticAnalysis.hasSpecificContext && text.includes(exactQuery)) {
      score += 30;
      console.log(`🎯 Termo exato encontrado: "${exactQuery}" (+30)`);
    }
    
    // Score baseado em palavras-chave
    const keywordMatches = queryWords.filter(word => text.includes(word));
    score += keywordMatches.length * 10;
    
    if (keywordMatches.length > 0) {
      console.log(`🔍 Palavras-chave encontradas: ${keywordMatches.join(', ')} (+${keywordMatches.length * 10})`);
    }
    
    // Bonificar termos educacionais e científicos
    const educationalTerms = [
      'education', 'learning', 'academic', 'study', 'research',
      'school', 'university', 'college', 'student', 'teacher',
      'lesson', 'course', 'tutorial', 'guide', 'manual',
      'science', 'scientific', 'biology', 'chemistry', 'physics',
      'anatomy', 'physiology', 'neurology', 'psychology',
      'diagram', 'chart', 'graph', 'illustration', 'scheme',
      'process', 'mechanism', 'function', 'structure', 'system'
    ];
    
    const educationalMatches = educationalTerms.filter(term => text.includes(term));
    if (educationalMatches.length > 0) {
      score += educationalMatches.length * 8; // Aumentar pontuação
      console.log(`📚 Termos educacionais encontrados: ${educationalMatches.join(', ')} (+${educationalMatches.length * 8})`);
    }
    
    // Bonificar termos específicos de memória e cognição
    const memoryTerms = [
      'memory', 'memoria', 'brain', 'cerebro', 'neuron', 'neurônio',
      'synapse', 'sinapse', 'hippocampus', 'hipocampo', 'cortex', 'córtex',
      'cognitive', 'cognitivo', 'learning', 'aprendizado', 'recall', 'lembrança',
      'storage', 'armazenamento', 'retrieval', 'recuperação'
    ];
    
    const memoryMatches = memoryTerms.filter(term => text.includes(term));
    if (memoryMatches.length > 0) {
      score += memoryMatches.length * 12; // Pontuação alta para termos específicos
      console.log(`🧠 Termos de memória encontrados: ${memoryMatches.join(', ')} (+${memoryMatches.length * 12})`);
    }
    
    // Bonificar termos específicos de eletricidade e física
    const electricityTerms = [
      'electricity', 'eletricidade', 'electrical', 'elétrico', 'electric', 'elétrico',
      'circuit', 'circuito', 'current', 'corrente', 'voltage', 'voltagem', 'tensão',
      'resistance', 'resistência', 'conductor', 'condutor', 'insulator', 'isolante',
      'generator', 'gerador', 'motor', 'motor', 'transformer', 'transformador',
      'wire', 'fio', 'cable', 'cabo', 'plug', 'plugue', 'socket', 'tomada',
      'switch', 'interruptor', 'bulb', 'lâmpada', 'lightning', 'raio', 'relâmpago',
      'spark', 'faísca', 'discharge', 'descarga', 'magnetism', 'magnetismo',
      'electromagnetic', 'eletromagnético', 'diagram', 'diagrama', 'schematic', 'esquema',
      'experiment', 'experimento', 'laboratory', 'laboratório', 'equipment', 'equipamento',
      'device', 'dispositivo', 'appliance', 'aparelho', 'technology', 'tecnologia',
      'engineering', 'engenharia', 'physics', 'física', 'phenomenon', 'fenômeno',
      'wave', 'onda', 'frequency', 'frequência', 'amplitude', 'amplitude',
      'signal', 'sinal', 'transmission', 'transmissão', 'distribution', 'distribuição',
      'grid', 'rede', 'power plant', 'usina', 'substation', 'subestação',
      'tower', 'torre', 'pole', 'poste', 'line', 'linha', 'infrastructure', 'infraestrutura'
    ];
    
    const electricityMatches = electricityTerms.filter(term => text.includes(term));
    if (electricityMatches.length > 0) {
      score += electricityMatches.length * 15; // Pontuação alta para termos específicos de eletricidade
      console.log(`⚡ Termos de eletricidade encontrados: ${electricityMatches.join(', ')} (+${electricityMatches.length * 15})`);
    }
    
    // Bonificar termos específicos de internet e redes
    const internetTerms = [
      'internet', 'internet', 'web', 'world wide web', 'www', 'network', 'rede', 'networking', 'redes',
      'tcp', 'ip', 'protocol', 'protocolo', 'http', 'https', 'dns', 'domain', 'domínio',
      'server', 'servidor', 'client', 'cliente', 'router', 'roteador', 'switch', 'comutador',
      'ethernet', 'wifi', 'wireless', 'sem fio', 'cable', 'cabo', 'fiber optic', 'fibra óptica',
      'data center', 'centro de dados', 'cloud', 'nuvem', 'bandwidth', 'largura de banda',
      'packet', 'pacote', 'routing', 'roteamento', 'transmission', 'transmissão',
      'infrastructure', 'infraestrutura', 'topology', 'topologia', 'architecture', 'arquitetura',
      'protocol stack', 'pilha de protocolos', 'osi model', 'modelo osi', 'lan', 'wan',
      'isp', 'provedor', 'provider', 'hosting', 'hospedagem', 'website', 'site',
      'browser', 'navegador', 'url', 'link', 'hyperlink', 'download', 'upload',
      'streaming', 'broadcast', 'multicast', 'unicast', 'firewall', 'security', 'segurança',
      'encryption', 'criptografia', 'ssl', 'tls', 'certificate', 'certificado',
      'api', 'interface', 'programming', 'programação', 'software', 'aplicação',
      'database', 'banco de dados', 'storage', 'armazenamento', 'backup', 'cópia de segurança'
    ];
    
    const internetMatches = internetTerms.filter(term => text.includes(term));
    if (internetMatches.length > 0) {
      score += internetMatches.length * 18; // Pontuação alta para termos específicos de internet
      console.log(`🌐 Termos de internet encontrados: ${internetMatches.join(', ')} (+${internetMatches.length * 18})`);
    }
    
    // Penalizar conteúdo inadequado
    const inappropriateTerms = [
      'adult', 'explicit', 'nude', 'naked', 'sex', 'porn',
      'violence', 'blood', 'gore', 'death', 'suicide'
    ];
    
    if (inappropriateTerms.some(term => text.includes(term))) {
      score -= 100;
      console.log(`❌ Conteúdo inadequado detectado - REJEITADO`);
    }
    
    // Penalizar imagens que são apenas texto/letreiro (baixa relevância visual)
    const textOnlyTerms = [
      'sign', 'sinal', 'text', 'texto', 'writing', 'escrita', 'lettering', 'letreiro',
      'logo', 'brand', 'marca', 'advertisement', 'anúncio', 'ad', 'publicidade',
      'billboard', 'outdoor', 'poster', 'cartaz', 'banner', 'faixa', 'placa', 'placard',
      'street sign', 'sinal de rua', 'road sign', 'sinal de estrada', 'shop sign', 'sinal de loja',
      'store sign', 'sinal de loja', 'business sign', 'sinal comercial', 'company sign', 'sinal de empresa',
      'restaurant sign', 'sinal de restaurante', 'cafe sign', 'sinal de café', 'bar sign', 'sinal de bar',
      'hotel sign', 'sinal de hotel', 'office sign', 'sinal de escritório', 'building sign', 'sinal de prédio',
      'neon sign', 'sinal de neon', 'led sign', 'sinal led', 'digital sign', 'sinal digital',
      'menu', 'cardápio', 'price list', 'lista de preços', 'hours', 'horário', 'open', 'aberto',
      'closed', 'fechado', 'welcome', 'bem-vindo', 'entrance', 'entrada', 'exit', 'saída'
    ];
    
    const textOnlyMatches = textOnlyTerms.filter(term => text.includes(term));
    if (textOnlyMatches.length > 0) {
      score -= textOnlyMatches.length * 20; // Penalizar imagens apenas com texto
      console.log(`📝 Imagem apenas com texto detectada: ${textOnlyMatches.join(', ')} (-${textOnlyMatches.length * 20})`);
    }
    
    // Bonificar qualidade da imagem
    if (image.width && image.height) {
      const aspectRatio = image.width / image.height;
      if (aspectRatio >= 0.5 && aspectRatio <= 2.0) {
        score += 5; // Bonificar proporções adequadas
      }
    }
    
    console.log(`📊 Score final calculado: ${score}`);
    return Math.max(0, Math.min(100, score)); // Limitar entre 0 e 100
    
  } catch (error) {
    console.error('Erro ao calcular score educacional:', error);
    return 0;
  }
}

// Função para análise semântica inteligente
function analyzeSemanticRelevance(text: string, exactQuery: string, queryWords: string[]): {
  isIrrelevant: boolean;
  penalty: number;
  bonus: number;
  reason: string;
  hasSpecificContext: boolean;
} {
  const lowerText = text.toLowerCase();
  const lowerQuery = exactQuery.toLowerCase();
  
  // DETECÇÃO DE IRRELEVÂNCIA SEMÂNTICA
  
  // 1. Detectar livros históricos e documentos antigos
  const historicalTerms = [
        'georgius agricola', 'de re metallica', 'mining', 'mineração',
        'metalwork', 'metalworking', 'metallurgy', 'metalúrgica',
        'historical', 'ancient', 'medieval', 'classical', 'antique',
    'manuscript', 'document', 'text', 'writing', 'script',
    'pdf', 'djvu', 'book', 'livro', 'treatise', 'tratado',
    'catalog', 'catalogue', 'journal', 'periodical'
  ];
  
  // 2. Detectar contexto específico de memória e cognição
  const memoryContextTerms = [
    'memory', 'memoria', 'brain', 'cerebro', 'neuron', 'neurônio',
    'synapse', 'sinapse', 'hippocampus', 'hipocampo', 'cortex', 'córtex',
    'cognitive', 'cognitivo', 'learning', 'aprendizado', 'recall', 'lembrança',
    'storage', 'armazenamento', 'retrieval', 'recuperação', 'encoding', 'codificação',
    'consolidation', 'consolidação', 'forgetting', 'esquecimento', 'amnesia', 'amnésia'
  ];
  
  // 3. Detectar contexto específico de eletricidade e física
  const electricityContextTerms = [
    'electricity', 'eletricidade', 'electrical', 'elétrico', 'electric', 'elétrico',
    'circuit', 'circuito', 'current', 'corrente', 'voltage', 'voltagem', 'tensão',
    'resistance', 'resistência', 'conductor', 'condutor', 'insulator', 'isolante',
    'generator', 'gerador', 'motor', 'motor', 'transformer', 'transformador',
    'wire', 'fio', 'cable', 'cabo', 'plug', 'plugue', 'socket', 'tomada',
    'switch', 'interruptor', 'bulb', 'lâmpada', 'lightning', 'raio', 'relâmpago',
    'spark', 'faísca', 'discharge', 'descarga', 'magnetism', 'magnetismo',
    'electromagnetic', 'eletromagnético', 'diagram', 'diagrama', 'schematic', 'esquema',
    'experiment', 'experimento', 'laboratory', 'laboratório', 'equipment', 'equipamento',
    'device', 'dispositivo', 'appliance', 'aparelho', 'technology', 'tecnologia',
    'engineering', 'engenharia', 'physics', 'física', 'phenomenon', 'fenômeno',
    'wave', 'onda', 'frequency', 'frequência', 'amplitude', 'amplitude',
    'signal', 'sinal', 'transmission', 'transmissão', 'distribution', 'distribuição',
    'grid', 'rede', 'power plant', 'usina', 'substation', 'subestação',
    'tower', 'torre', 'pole', 'poste', 'line', 'linha', 'infrastructure', 'infraestrutura'
  ];
  
  // 4. Detectar contexto específico de internet e redes
  const internetContextTerms = [
    'internet', 'internet', 'web', 'world wide web', 'www', 'network', 'rede', 'networking', 'redes',
    'tcp', 'ip', 'protocol', 'protocolo', 'http', 'https', 'dns', 'domain', 'domínio',
    'server', 'servidor', 'client', 'cliente', 'router', 'roteador', 'switch', 'comutador',
    'ethernet', 'wifi', 'wireless', 'sem fio', 'cable', 'cabo', 'fiber optic', 'fibra óptica',
    'data center', 'centro de dados', 'cloud', 'nuvem', 'bandwidth', 'largura de banda',
    'packet', 'pacote', 'routing', 'roteamento', 'transmission', 'transmissão',
    'infrastructure', 'infraestrutura', 'topology', 'topologia', 'architecture', 'arquitetura',
    'protocol stack', 'pilha de protocolos', 'osi model', 'modelo osi', 'lan', 'wan',
    'isp', 'provedor', 'provider', 'hosting', 'hospedagem', 'website', 'site',
    'browser', 'navegador', 'url', 'link', 'hyperlink', 'download', 'upload',
    'streaming', 'broadcast', 'multicast', 'unicast', 'firewall', 'security', 'segurança',
    'encryption', 'criptografia', 'ssl', 'tls', 'certificate', 'certificado',
    'api', 'interface', 'programming', 'programação', 'software', 'aplicação',
    'database', 'banco de dados', 'storage', 'armazenamento', 'backup', 'cópia de segurança'
  ];
  
  const hasMemoryContext = memoryContextTerms.some(term => lowerText.includes(term));
  const hasElectricityContext = electricityContextTerms.some(term => lowerText.includes(term));
  const hasInternetContext = internetContextTerms.some(term => lowerText.includes(term));
  
  if (historicalTerms.some(term => lowerText.includes(term))) {
    return {
      isIrrelevant: true,
      penalty: -100,
      bonus: 0,
      reason: 'Documento histórico irrelevante',
      hasSpecificContext: false
    };
  }
  
  // 3. Bonificar contexto específico de memória
  if (hasMemoryContext && (lowerQuery.includes('memoria') || lowerQuery.includes('memory'))) {
    return {
      isIrrelevant: false,
      penalty: 0,
      bonus: 50, // Bonificação alta para contexto de memória
      reason: 'Contexto específico de memória detectado',
      hasSpecificContext: true
    };
  }
  
  // 4. Bonificar contexto específico de eletricidade
  if (hasElectricityContext && (lowerQuery.includes('eletricidade') || lowerQuery.includes('electricity'))) {
    return {
      isIrrelevant: false,
      penalty: 0,
      bonus: 60, // Bonificação alta para contexto de eletricidade
      reason: 'Contexto específico de eletricidade detectado',
      hasSpecificContext: true
    };
  }
  
  // 5. Bonificar contexto específico de internet
  if (hasInternetContext && (lowerQuery.includes('internet') || lowerQuery.includes('internet') || lowerQuery.includes('web') || lowerQuery.includes('network'))) {
    return {
      isIrrelevant: false,
      penalty: 0,
      bonus: 65, // Bonificação alta para contexto de internet
      reason: 'Contexto específico de internet detectado',
      hasSpecificContext: true
    };
  }
  
  // 5. Detectar organismos biológicos com nomes similares (ex: borboleta metallica)
  const biologicalTerms = [
    'species', 'genus', 'family', 'order', 'class', 'phylum',
    'taxonomy', 'taxonomic', 'binomial', 'scientific name',
    'butterfly', 'moth', 'insect', 'animal', 'plant', 'fungus',
    'bacteria', 'virus', 'organism', 'biology', 'zoology',
    'botany', 'entomology', 'mycology', 'microbiology'
  ];
  
  if (biologicalTerms.some(term => lowerText.includes(term))) {
    return {
      isIrrelevant: true,
      penalty: -80,
      bonus: 0,
      reason: 'Organismo biológico irrelevante',
      hasSpecificContext: false
    };
  }
  
  // 3. Detectar conteúdo técnico/científico irrelevante
  const technicalTerms = [
    'chemical', 'compound', 'formula', 'molecule', 'element',
    'laboratory', 'experiment', 'research', 'analysis',
    'technical', 'engineering', 'mechanical', 'electrical',
    'computer', 'software', 'hardware', 'programming'
  ];
  
  if (technicalTerms.some(term => lowerText.includes(term)) && !lowerText.includes('education')) {
    return {
      isIrrelevant: true,
      penalty: -60,
      bonus: 0,
      reason: 'Conteúdo técnico irrelevante',
      hasSpecificContext: false
    };
  }
  
  // DETECÇÃO DE RELEVÂNCIA ESPECÍFICA
  
  // Para Metallica especificamente
  if (lowerQuery === 'metallica') {
      const metallicaTerms = [
        'metallica', 'james hetfield', 'lars ulrich', 'kirk hammett', 
      'robert trujillo', 'cliff burton', 'master of puppets',
      'enter sandman', 'one', 'black album', 'ride the lightning',
      'kill em all', 'and justice for all', 'load', 'reload',
      'st. anger', 'death magnetic', 'hardwired'
    ];
    
    const metallicaMatches = metallicaTerms.filter(term => lowerText.includes(term));
    if (metallicaMatches.length > 0) {
      return {
        isIrrelevant: false,
        penalty: 0,
        bonus: 60,
        reason: `Termos específicos do Metallica: ${metallicaMatches.join(', ')}`,
        hasSpecificContext: true
      };
    }
    
    // Penalizar música genérica sem contexto específico
    const genericMusicTerms = [
      'guitar', 'drum', 'drummer', 'bass', 'piano', 'keyboard',
      'vinyl', 'record', 'album', 'cd', 'music', 'song',
      'concert', 'stage', 'microphone', 'amplifier', 'speaker',
      'musician', 'band', 'rock', 'metal', 'guitarist'
    ];
    
    const hasGenericMusic = genericMusicTerms.some(term => lowerText.includes(term));
    const hasMetallicaContext = lowerText.includes('metallica');
    
    if (hasGenericMusic && !hasMetallicaContext) {
      return {
        isIrrelevant: true,
        penalty: -50,
        bonus: 0,
        reason: 'Música genérica sem contexto específico',
        hasSpecificContext: false
      };
    }
  }
  
  // Para outros temas, detectar contexto específico
  const specificContextTerms = [
    'band', 'artist', 'musician', 'singer', 'performer',
    'album', 'song', 'track', 'music', 'concert', 'live',
    'tour', 'show', 'performance', 'stage'
  ];
  
  const hasSpecificContext = specificContextTerms.some(term => lowerText.includes(term));
  
  if (hasSpecificContext && lowerText.includes(lowerQuery)) {
    return {
      isIrrelevant: false,
      penalty: 0,
      bonus: 40,
      reason: 'Contexto específico do tema encontrado',
      hasSpecificContext: true
    };
  }
  
  // Retorno padrão para conteúdo relevante mas não específico
  return {
    isIrrelevant: false,
    penalty: 0,
    bonus: 0,
    reason: 'Conteúdo relevante',
    hasSpecificContext: false
  };
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

// Buscar no Wikimedia Commons usando a API interna
async function searchWikimedia(query: string, subject: string, limit: number): Promise<ImageResult[]> {
  try {
    console.log(`🔍 Buscando no Wikimedia via API interna: "${query}"`);
    
    // Usar a API interna do Wikimedia que já está funcionando
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wikimedia/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: query, 
        subject: subject, 
        count: Math.min(limit, 20) 
      }),
    });
    
    if (!response.ok) {
      console.log(`❌ Erro na API interna do Wikimedia: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`✅ API interna do Wikimedia retornou ${data.photos?.length || 0} imagens`);
    
    if (!data.success || !data.photos || data.photos.length === 0) {
      console.log(`❌ Nenhuma imagem encontrada via API interna`);
      return [];
    }
    
    // Converter formato da API interna para formato do smart-search
    const results: ImageResult[] = data.photos.map((photo: any) => ({
      id: `wikimedia_${photo.id}`,
      url: photo.url,
      thumbnail: photo.urls?.small || photo.url,
      title: photo.title || photo.description,
      description: photo.description,
      author: photo.author || 'Wikimedia Commons',
            source: 'wikimedia' as const,
      width: photo.width || 0,
      height: photo.height || 0,
            tags: [],
      relevanceScore: calculateEducationalScore({ title: photo.title || photo.description }, query, subject),
            educationalSuitability: 0,
            qualityScore: 0
    }));
    
    console.log(`🎯 Wikimedia retornou ${results.length} imagens válidas via API interna`);
    return results;
  } catch (error) {
    console.error('Erro ao buscar no Wikimedia via API interna:', error);
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
  
  // ETAPA 0: Detectar tema e traduzir para inglês
  console.log(`🌍 ETAPA 0: Usando query original`);
  const englishQuery = query;
  
  // ETAPA 1: Busca pelo termo exato do tema em inglês (prioridade máxima)
  console.log(`🎯 ETAPA 1: Buscando pelo termo exato em inglês "${englishQuery}"`);
  
  // Usar todos os provedores com Wikimedia priorizado (geralmente retorna coisas específicas)
  const exactSearchPromises = [
    searchWikimedia(englishQuery, subject || 'general', count * 2), // Wikimedia primeiro e com mais imagens
    searchUnsplash(englishQuery, subject || 'general', count),
    searchPixabay(englishQuery, subject || 'general', count),
    searchBing(englishQuery, subject || 'general', count),
    searchPexels(englishQuery, subject || 'general', count)
  ];
  
  try {
    const exactResults = await Promise.allSettled(exactSearchPromises);
    
    exactResults.forEach((result, index) => {
      const providerNames = ['wikimedia', 'unsplash', 'pixabay', 'bing', 'pexels'];
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
    
    // Filtrar imagens com score negativo (livros históricos, etc.)
    const relevantImages = uniqueExactImages.filter(image => image.relevanceScore >= 0);
    console.log(`📊 ${relevantImages.length} imagens relevantes de ${uniqueExactImages.length} encontradas`);
    
    console.log(`📊 Resultados da busca exata: ${uniqueExactImages.length} imagens únicas, ${relevantImages.length} relevantes`);
    
    // Se encontrou imagens suficientes com o termo exato E relevantes, usar apenas essas
    if (relevantImages.length >= count) {
      console.log(`✅ Termo exato encontrou ${relevantImages.length} imagens relevantes suficientes`);
      
      // Ordenar por relevância
      relevantImages.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Selecionar com diversidade de provedores
      const bestImages = selectDiverseImages(relevantImages, count, englishQuery);
      
      return {
        success: true,
        images: bestImages,
        totalFound: relevantImages.length,
        sourcesUsed,
        query,
        optimizedQuery: englishQuery,
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
    
    // Usar todos os provedores na busca semântica com Wikimedia priorizado
    const semanticSearchPromises = [
      searchWikimedia(semanticQuery, subject || 'general', count * 2), // Wikimedia primeiro e com mais imagens
      searchUnsplash(semanticQuery, subject || 'general', count),
      searchPixabay(semanticQuery, subject || 'general', count),
      searchBing(semanticQuery, subject || 'general', count),
      searchPexels(semanticQuery, subject || 'general', count)
    ];
    
    const semanticResults = await Promise.allSettled(semanticSearchPromises);
    
    // Limpar imagens anteriores e começar apenas com imagens da busca semântica
    allImages = [];
    
    semanticResults.forEach((result, index) => {
      const providerNames = ['wikimedia', 'unsplash', 'pixabay', 'bing', 'pexels'];
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
    
    // Filtrar imagens com score negativo (livros históricos, etc.)
    const filteredImages = allImages.filter(image => image.relevanceScore >= 0);
    console.log(`📊 ${filteredImages.length} imagens relevantes de ${allImages.length} encontradas`);
    
    // Ordenar por relevância
    filteredImages.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Remover duplicatas
    const uniqueImages = filteredImages.filter((image, index, self) => 
      index === self.findIndex(img => img.url === image.url)
    );
    
    // Selecionar com diversidade
    const bestImages = selectDiverseImages(uniqueImages, count, englishQuery);
    
    console.log(`🎯 Total final: ${uniqueImages.length} imagens únicas`);
    console.log(`🏆 Melhores ${bestImages.length} imagens selecionadas`);
    
    return {
      success: bestImages.length > 0,
      images: bestImages,
      totalFound: uniqueImages.length,
      sourcesUsed,
      query,
      optimizedQuery: englishQuery,
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

// Função de análise local melhorada para fallback
function calculateEnhancedLocalRelevance(text: string, query: string): number {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let score = 0;
  
  // Bonus para correspondência exata (prioridade máxima)
  if (textLower.includes(queryLower)) {
    score += 60;
  }
  
  // Bonus para palavras individuais
  const queryWords = queryLower.split(' ').filter(word => word.length > 2);
  queryWords.forEach(word => {
    if (textLower.includes(word)) {
      score += 20;
    }
  });
  
  // Bonus para termos educacionais específicos - VERSÃO EXPANDIDA
  const educationalTerms = {
    // Ciências específicas
    'photosynthesis': ['plant', 'leaf', 'green', 'chlorophyll', 'sunlight', 'biology', 'chloroplast'],
    'biology': ['cell', 'organism', 'biology', 'science', 'laboratory', 'microscope', 'dna'],
    'chemistry': ['molecule', 'atom', 'reaction', 'chemistry', 'laboratory', 'chemical', 'compound'],
    'physics': ['physics', 'energy', 'force', 'experiment', 'laboratory', 'science', 'quantum'],
    'mathematics': ['math', 'equation', 'formula', 'calculation', 'geometry', 'algebra', 'calculus'],
    
    // Humanidades
    'history': ['history', 'historical', 'ancient', 'civilization', 'culture', 'heritage'],
    'geography': ['geography', 'landscape', 'environment', 'climate', 'earth', 'terrain'],
    'literature': ['book', 'novel', 'poetry', 'author', 'writing', 'story', 'character'],
    
    // Arte e cultura
    'metallica': ['metallica', 'band', 'rock', 'metal', 'heavy metal', 'thrash metal', 'concert', 'guitar', 'music', 'album', 'stage', 'performance'],
    'music': ['music', 'band', 'concert', 'guitar', 'drums', 'bass', 'vocals', 'stage', 'performance', 'album', 'song', 'musician', 'artist'],
    'art': ['art', 'painting', 'sculpture', 'artist', 'creative', 'design', 'museum', 'gallery'],
    
    // Tecnologia
    'technology': ['computer', 'software', 'programming', 'digital', 'algorithm', 'data', 'code', 'app'],
    
    // Negócios
    'business': ['business', 'company', 'market', 'economy', 'finance', 'management', 'strategy', 'sales'],
    
    // Esportes
    'sports': ['sport', 'athletic', 'competition', 'game', 'player', 'team', 'training', 'fitness'],
    
    // Alimentação
    'food': ['food', 'cuisine', 'cooking', 'recipe', 'chef', 'kitchen', 'restaurant', 'meal'],
    
    // Viagem
    'travel': ['travel', 'tourism', 'destination', 'vacation', 'hotel', 'beach', 'mountain', 'city'],
    
    // Moda
    'fashion': ['fashion', 'style', 'clothing', 'design', 'beauty', 'cosmetic', 'accessory'],
    
    // Animais
    'animals': ['animal', 'pet', 'wildlife', 'nature', 'dog', 'cat', 'bird', 'fish'],
    
    // Arquitetura
    'architecture': ['architecture', 'building', 'construction', 'design', 'house', 'structure', 'modern'],
    
    // Psicologia
    'psychology': ['psychology', 'behavior', 'mind', 'emotion', 'mental', 'therapy', 'counseling'],
    
    // Filosofia
    'philosophy': ['philosophy', 'ethics', 'moral', 'values', 'wisdom', 'truth', 'reality'],
    
    // Educação geral
    'education': ['education', 'learning', 'teaching', 'school', 'student', 'teacher', 'knowledge'],
    
    // Ciências gerais
    'science': ['science', 'research', 'experiment', 'laboratory', 'study', 'analysis', 'theory']
  };
  
  // Verificar termos educacionais específicos
  for (const [theme, terms] of Object.entries(educationalTerms)) {
    if (queryLower.includes(theme)) {
      terms.forEach(term => {
        if (textLower.includes(term)) {
          score += 15;
        }
      });
    }
  }
  
  // Bonus para tags específicas de provedores
  if (textLower.includes('diagram') || textLower.includes('illustration')) {
    score += 25;
  }
  
  if (textLower.includes('educational') || textLower.includes('academic')) {
    score += 20;
  }
  
  // Penalização para conteúdo irrelevante
  const irrelevantTerms = ['book', 'text', 'logo', 'sticker', 'design', 'pattern', 'abstract', 'generic'];
  irrelevantTerms.forEach(term => {
    if (textLower.includes(term) && !textLower.includes(queryLower)) {
      score -= 20;
    }
  });
  
  return Math.max(0, Math.min(100, score));
}
