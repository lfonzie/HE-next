/**
 * Sistema Avançado de Detecção e Expansão Semântica de Temas
 * Melhora a compreensão contextual para busca de imagens educacionais
 */

export interface ThemeAnalysis {
  originalTopic: string;
  extractedTheme: string;
  translatedTheme: string;
  confidence: number;           // 0-100
  category: string;
  relatedTerms: string[];
  visualConcepts: string[];
  educationalContext: string[];
  searchQueries: string[];
  language: 'pt' | 'en' | 'mixed';
}

export interface SemanticExpansion {
  primaryTerms: string[];
  contextualTerms: string[];
  visualTerms: string[];
  educationalTerms: string[];
  scientificTerms: string[];
  alternativeTerms: string[];
}

/**
 * Mapeamento semântico avançado de temas educacionais
 */
const SEMANTIC_MAPPING: Record<string, {
  category: string;
  primaryTerms: string[];
  contextualTerms: string[];
  visualConcepts: string[];
  educationalContext: string[];
  scientificTerms: string[];
  alternativeTerms: string[];
}> = {
  // Biologia e Ciências da Vida
  'photosynthesis': {
    category: 'biology',
    primaryTerms: ['photosynthesis', 'fotossíntese'],
    contextualTerms: ['plant', 'leaf', 'green', 'chlorophyll', 'sunlight', 'carbon dioxide', 'oxygen'],
    visualConcepts: ['green leaves', 'sunlight', 'plant cells', 'chloroplast', 'light energy'],
    educationalContext: ['biology', 'plant science', 'cellular process', 'energy conversion'],
    scientificTerms: ['chloroplast', 'thylakoid', 'stroma', 'ATP', 'NADPH', 'glucose'],
    alternativeTerms: ['plant nutrition', 'light-dependent reactions', 'calvin cycle']
  },
  'fotossíntese': {
    category: 'biology',
    primaryTerms: ['photosynthesis', 'fotossíntese'],
    contextualTerms: ['plant', 'leaf', 'green', 'chlorophyll', 'sunlight', 'carbon dioxide', 'oxygen'],
    visualConcepts: ['green leaves', 'sunlight', 'plant cells', 'chloroplast', 'light energy'],
    educationalContext: ['biology', 'plant science', 'cellular process', 'energy conversion'],
    scientificTerms: ['chloroplast', 'thylakoid', 'stroma', 'ATP', 'NADPH', 'glucose'],
    alternativeTerms: ['plant nutrition', 'light-dependent reactions', 'calvin cycle']
  },
  
  // Física
  'gravity': {
    category: 'physics',
    primaryTerms: ['gravity', 'gravidade'],
    contextualTerms: ['mass', 'weight', 'attraction', 'newton', 'einstein', 'space', 'planets'],
    visualConcepts: ['falling objects', 'planets', 'orbits', 'gravitational field', 'space'],
    educationalContext: ['physics', 'universal law', 'force', 'motion', 'celestial mechanics'],
    scientificTerms: ['gravitational force', 'mass', 'acceleration', 'spacetime', 'relativity'],
    alternativeTerms: ['gravitational pull', 'mass attraction', 'universal gravitation']
  },
  'gravidade': {
    category: 'physics',
    primaryTerms: ['gravity', 'gravidade'],
    contextualTerms: ['mass', 'weight', 'attraction', 'newton', 'einstein', 'space', 'planets'],
    visualConcepts: ['falling objects', 'planets', 'orbits', 'gravitational field', 'space'],
    educationalContext: ['physics', 'universal law', 'force', 'motion', 'celestial mechanics'],
    scientificTerms: ['gravitational force', 'mass', 'acceleration', 'spacetime', 'relativity'],
    alternativeTerms: ['gravitational pull', 'mass attraction', 'universal gravitation']
  },
  
  // Química
  'chemistry': {
    category: 'chemistry',
    primaryTerms: ['chemistry', 'química'],
    contextualTerms: ['molecule', 'atom', 'reaction', 'compound', 'element', 'laboratory'],
    visualConcepts: ['molecular structure', 'chemical bonds', 'laboratory equipment', 'periodic table'],
    educationalContext: ['chemical science', 'molecular interactions', 'laboratory work'],
    scientificTerms: ['covalent bond', 'ionic bond', 'electron', 'proton', 'neutron'],
    alternativeTerms: ['chemical science', 'molecular chemistry', 'atomic structure']
  },
  'química': {
    category: 'chemistry',
    primaryTerms: ['chemistry', 'química'],
    contextualTerms: ['molecule', 'atom', 'reaction', 'compound', 'element', 'laboratory'],
    visualConcepts: ['molecular structure', 'chemical bonds', 'laboratory equipment', 'periodic table'],
    educationalContext: ['chemical science', 'molecular interactions', 'laboratory work'],
    scientificTerms: ['covalent bond', 'ionic bond', 'electron', 'proton', 'neutron'],
    alternativeTerms: ['chemical science', 'molecular chemistry', 'atomic structure']
  },
  
  // Matemática
  'mathematics': {
    category: 'mathematics',
    primaryTerms: ['mathematics', 'matemática'],
    contextualTerms: ['equation', 'formula', 'calculation', 'geometry', 'algebra', 'calculus'],
    visualConcepts: ['mathematical equations', 'geometric shapes', 'graphs', 'charts', 'formulas'],
    educationalContext: ['mathematical concepts', 'problem solving', 'logical thinking'],
    scientificTerms: ['derivative', 'integral', 'function', 'variable', 'coefficient'],
    alternativeTerms: ['math', 'mathematical science', 'numerical analysis']
  },
  'matemática': {
    category: 'mathematics',
    primaryTerms: ['mathematics', 'matemática'],
    contextualTerms: ['equation', 'formula', 'calculation', 'geometry', 'algebra', 'calculus'],
    visualConcepts: ['mathematical equations', 'geometric shapes', 'graphs', 'charts', 'formulas'],
    educationalContext: ['mathematical concepts', 'problem solving', 'logical thinking'],
    scientificTerms: ['derivative', 'integral', 'function', 'variable', 'coefficient'],
    alternativeTerms: ['math', 'mathematical science', 'numerical analysis']
  },
  
  // História
  'history': {
    category: 'history',
    primaryTerms: ['history', 'história'],
    contextualTerms: ['historical', 'ancient', 'medieval', 'civilization', 'culture', 'heritage'],
    visualConcepts: ['historical documents', 'ancient artifacts', 'historical buildings', 'maps'],
    educationalContext: ['historical analysis', 'cultural heritage', 'social development'],
    scientificTerms: ['archaeology', 'chronology', 'historiography', 'primary source'],
    alternativeTerms: ['historical science', 'cultural history', 'social history']
  },
  'história': {
    category: 'history',
    primaryTerms: ['history', 'história'],
    contextualTerms: ['historical', 'ancient', 'medieval', 'civilization', 'culture', 'heritage'],
    visualConcepts: ['historical documents', 'ancient artifacts', 'historical buildings', 'maps'],
    educationalContext: ['historical analysis', 'cultural heritage', 'social development'],
    scientificTerms: ['archaeology', 'chronology', 'historiography', 'primary source'],
    alternativeTerms: ['historical science', 'cultural history', 'social history']
  },
  
  // Geografia
  'geography': {
    category: 'geography',
    primaryTerms: ['geography', 'geografia'],
    contextualTerms: ['country', 'continent', 'landscape', 'climate', 'population', 'terrain'],
    visualConcepts: ['maps', 'landscapes', 'geographical features', 'climate zones'],
    educationalContext: ['spatial analysis', 'environmental awareness', 'cultural geography'],
    scientificTerms: ['topography', 'cartography', 'demographics', 'climatology'],
    alternativeTerms: ['earth science', 'spatial science', 'environmental geography']
  },
  'geografia': {
    category: 'geography',
    primaryTerms: ['geography', 'geografia'],
    contextualTerms: ['country', 'continent', 'landscape', 'climate', 'population', 'terrain'],
    visualConcepts: ['maps', 'landscapes', 'geographical features', 'climate zones'],
    educationalContext: ['spatial analysis', 'environmental awareness', 'cultural geography'],
    scientificTerms: ['topography', 'cartography', 'demographics', 'climatology'],
    alternativeTerms: ['earth science', 'spatial science', 'environmental geography']
  },
  
  // Literatura
  'literature': {
    category: 'literature',
    primaryTerms: ['literature', 'literatura'],
    contextualTerms: ['book', 'poetry', 'novel', 'author', 'writing', 'literary'],
    visualConcepts: ['books', 'manuscripts', 'writing', 'literary works', 'authors'],
    educationalContext: ['literary analysis', 'creative expression', 'cultural analysis'],
    scientificTerms: ['prosody', 'narratology', 'semiotics', 'hermeneutics'],
    alternativeTerms: ['literary arts', 'written works', 'literary studies']
  },
  'literatura': {
    category: 'literature',
    primaryTerms: ['literature', 'literatura'],
    contextualTerms: ['book', 'poetry', 'novel', 'author', 'writing', 'literary'],
    visualConcepts: ['books', 'manuscripts', 'writing', 'literary works', 'authors'],
    educationalContext: ['literary analysis', 'creative expression', 'cultural analysis'],
    scientificTerms: ['prosody', 'narratology', 'semiotics', 'hermeneutics'],
    alternativeTerms: ['literary arts', 'written works', 'literary studies']
  },
  
  // Arte
  'art': {
    category: 'art',
    primaryTerms: ['art', 'arte'],
    contextualTerms: ['painting', 'sculpture', 'music', 'artist', 'creative', 'aesthetic'],
    visualConcepts: ['paintings', 'sculptures', 'artistic works', 'creative expression'],
    educationalContext: ['artistic expression', 'cultural heritage', 'creative education'],
    scientificTerms: ['aesthetics', 'art history', 'visual arts', 'performing arts'],
    alternativeTerms: ['visual arts', 'creative arts', 'artistic expression']
  },
  'arte': {
    category: 'art',
    primaryTerms: ['art', 'arte'],
    contextualTerms: ['painting', 'sculpture', 'music', 'artist', 'creative', 'aesthetic'],
    visualConcepts: ['paintings', 'sculptures', 'artistic works', 'creative expression'],
    educationalContext: ['artistic expression', 'cultural heritage', 'creative education'],
    scientificTerms: ['aesthetics', 'art history', 'visual arts', 'performing arts'],
    alternativeTerms: ['visual arts', 'creative arts', 'artistic expression']
  },
  
  // Tecnologia
  'technology': {
    category: 'technology',
    primaryTerms: ['technology', 'tecnologia'],
    contextualTerms: ['computer', 'software', 'programming', 'digital', 'internet', 'ai'],
    visualConcepts: ['computers', 'software interfaces', 'digital devices', 'programming code'],
    educationalContext: ['digital literacy', 'computational thinking', 'innovation'],
    scientificTerms: ['algorithms', 'data structures', 'machine learning', 'artificial intelligence'],
    alternativeTerms: ['information technology', 'computer science', 'digital technology']
  },
  'tecnologia': {
    category: 'technology',
    primaryTerms: ['technology', 'tecnologia'],
    contextualTerms: ['computer', 'software', 'programming', 'digital', 'internet', 'ai'],
    visualConcepts: ['computers', 'software interfaces', 'digital devices', 'programming code'],
    educationalContext: ['digital literacy', 'computational thinking', 'innovation'],
    scientificTerms: ['algorithms', 'data structures', 'machine learning', 'artificial intelligence'],
    alternativeTerms: ['information technology', 'computer science', 'digital technology']
  }
};

/**
 * Sistema avançado de análise semântica de temas
 */
export class AdvancedSemanticAnalyzer {
  
  /**
   * Analisa tema e extrai informações semânticas completas
   */
  async analyzeTheme(topic: string, subject?: string): Promise<ThemeAnalysis> {
    const normalizedTopic = this.normalizeTopic(topic);
    const language = this.detectLanguage(normalizedTopic);
    const translatedTopic = this.translateToEnglish(normalizedTopic, language);
    
    // Buscar mapeamento semântico
    const semanticMapping = this.findSemanticMapping(normalizedTopic, translatedTopic);
    
    // Calcular confiança baseada na correspondência
    const confidence = this.calculateConfidence(normalizedTopic, semanticMapping);
    
    // Gerar expansão semântica
    const expansion = this.generateSemanticExpansion(semanticMapping);
    
    // Gerar queries de busca otimizadas
    const searchQueries = this.generateSearchQueries(expansion, translatedTopic);
    
    return {
      originalTopic: topic,
      extractedTheme: normalizedTopic,
      translatedTheme: translatedTopic,
      confidence,
      category: semanticMapping?.category || 'general',
      relatedTerms: expansion.primaryTerms,
      visualConcepts: expansion.visualTerms,
      educationalContext: expansion.educationalTerms,
      searchQueries,
      language
    };
  }
  
  /**
   * Normaliza o tema removendo pontuação e caracteres especiais
   */
  private normalizeTopic(topic: string): string {
    return topic
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Detecta o idioma do tema
   */
  private detectLanguage(topic: string): 'pt' | 'en' | 'mixed' {
    const portugueseWords = ['como', 'funciona', 'o que é', 'definição', 'introdução', 'conceito', 'básico', 'princípios'];
    const englishWords = ['how', 'works', 'what is', 'definition', 'introduction', 'concept', 'basic', 'principles'];
    
    const hasPortuguese = portugueseWords.some(word => topic.includes(word));
    const hasEnglish = englishWords.some(word => topic.includes(word));
    
    if (hasPortuguese && hasEnglish) return 'mixed';
    if (hasPortuguese) return 'pt';
    if (hasEnglish) return 'en';
    
    // Detectar por palavras específicas do português
    const portugueseSpecific = ['ção', 'são', 'ção', 'não', 'mão', 'pão'];
    if (portugueseSpecific.some(suffix => topic.includes(suffix))) return 'pt';
    
    return 'en'; // Default para inglês
  }
  
  /**
   * Traduz tema para inglês quando necessário
   */
  private translateToEnglish(topic: string, language: 'pt' | 'en' | 'mixed'): string {
    if (language === 'en') return topic;
    
    const translations: Record<string, string> = {
      'matemática': 'mathematics',
      'matematica': 'mathematics',
      'física': 'physics',
      'fisica': 'physics',
      'química': 'chemistry',
      'quimica': 'chemistry',
      'biologia': 'biology',
      'história': 'history',
      'historia': 'history',
      'geografia': 'geography',
      'literatura': 'literature',
      'arte': 'art',
      'música': 'music',
      'musica': 'music',
      'tecnologia': 'technology',
      'fotossíntese': 'photosynthesis',
      'fotossintese': 'photosynthesis',
      'gravidade': 'gravity',
      'eletricidade': 'electricity',
      'magnetismo': 'magnetism',
      'energia': 'energy',
      'força': 'force',
      'movimento': 'motion',
      'ondas': 'waves',
      'átomo': 'atom',
      'molécula': 'molecule',
      'molecula': 'molecule',
      'célula': 'cell',
      'celula': 'cell',
      'dna': 'dna',
      'genética': 'genetics',
      'genetica': 'genetics',
      'evolução': 'evolution',
      'evolucao': 'evolution',
      'como funciona': 'how works',
      'o que é': 'what is',
      'definição': 'definition',
      'definicao': 'definition',
      'introdução': 'introduction',
      'introducao': 'introduction',
      'conceito': 'concept',
      'básico': 'basic',
      'basico': 'basic',
      'princípios': 'principles',
      'principios': 'principles'
    };
    
    let translated = topic;
    for (const [pt, en] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(pt, 'gi'), en);
    }
    
    return translated;
  }
  
  /**
   * Encontra mapeamento semântico para o tema
   */
  private findSemanticMapping(normalizedTopic: string, translatedTopic: string): typeof SEMANTIC_MAPPING[string] | null {
    // Buscar correspondência exata primeiro
    if (SEMANTIC_MAPPING[normalizedTopic]) {
      return SEMANTIC_MAPPING[normalizedTopic];
    }
    
    if (SEMANTIC_MAPPING[translatedTopic]) {
      return SEMANTIC_MAPPING[translatedTopic];
    }
    
    // Buscar correspondência parcial
    for (const [key, mapping] of Object.entries(SEMANTIC_MAPPING)) {
      if (normalizedTopic.includes(key) || key.includes(normalizedTopic) ||
          translatedTopic.includes(key) || key.includes(translatedTopic)) {
        return mapping;
      }
    }
    
    return null;
  }
  
  /**
   * Calcula confiança da análise
   */
  private calculateConfidence(normalizedTopic: string, mapping: typeof SEMANTIC_MAPPING[string] | null): number {
    if (!mapping) return 30; // Baixa confiança para temas não mapeados
    
    // Verificar correspondência com termos primários
    const hasPrimaryMatch = mapping.primaryTerms.some(term => 
      normalizedTopic.includes(term.toLowerCase())
    );
    
    if (hasPrimaryMatch) return 90; // Alta confiança
    
    // Verificar correspondência com termos contextuais
    const contextualMatches = mapping.contextualTerms.filter(term => 
      normalizedTopic.includes(term.toLowerCase())
    ).length;
    
    if (contextualMatches >= 2) return 75; // Boa confiança
    if (contextualMatches >= 1) return 60; // Confiança moderada
    
    return 45; // Confiança baixa
  }
  
  /**
   * Gera expansão semântica completa
   */
  private generateSemanticExpansion(mapping: typeof SEMANTIC_MAPPING[string] | null): SemanticExpansion {
    if (!mapping) {
      return {
        primaryTerms: [],
        contextualTerms: [],
        visualTerms: [],
        educationalTerms: [],
        scientificTerms: [],
        alternativeTerms: []
      };
    }
    
    return {
      primaryTerms: mapping.primaryTerms,
      contextualTerms: mapping.contextualTerms,
      visualTerms: mapping.visualConcepts,
      educationalTerms: mapping.educationalContext,
      scientificTerms: mapping.scientificTerms,
      alternativeTerms: mapping.alternativeTerms
    };
  }
  
  /**
   * Gera queries de busca otimizadas
   */
  private generateSearchQueries(expansion: SemanticExpansion, translatedTopic: string): string[] {
    const queries: string[] = [];
    
    // Query principal com o tema traduzido
    queries.push(translatedTopic);
    
    // Queries com termos primários
    expansion.primaryTerms.slice(0, 2).forEach(term => {
      if (term !== translatedTopic) {
        queries.push(term);
      }
    });
    
    // Queries com termos visuais mais relevantes
    expansion.visualTerms.slice(0, 2).forEach(term => {
      queries.push(term);
    });
    
    // Queries com contexto educacional
    expansion.educationalTerms.slice(0, 1).forEach(term => {
      queries.push(term);
    });
    
    // Remover duplicatas e limitar a 5 queries
    return [...new Set(queries)].slice(0, 5);
  }
  
  /**
   * Expande tema com termos relacionados para melhor busca
   */
  async expandTopicForSearch(topic: string, subject?: string): Promise<string[]> {
    const analysis = await this.analyzeTheme(topic, subject);
    
    // Combinar diferentes tipos de termos para busca mais abrangente
    const allTerms = [
      ...analysis.relatedTerms,
      ...analysis.visualConcepts,
      ...analysis.educationalContext
    ];
    
    // Remover duplicatas e termos muito genéricos
    const filteredTerms = allTerms.filter(term => 
      term.length > 2 && 
      !['general', 'common', 'basic', 'simple'].includes(term.toLowerCase())
    );
    
    return [...new Set(filteredTerms)].slice(0, 10);
  }
}

/**
 * Função utilitária para análise rápida de tema
 */
export async function analyzeTopicForImages(topic: string, subject?: string): Promise<ThemeAnalysis> {
  const analyzer = new AdvancedSemanticAnalyzer();
  return await analyzer.analyzeTheme(topic, subject);
}

/**
 * Função utilitária para expansão rápida de tema
 */
export async function expandTopicForImageSearch(topic: string, subject?: string): Promise<string[]> {
  const analyzer = new AdvancedSemanticAnalyzer();
  return await analyzer.expandTopicForSearch(topic, subject);
}

export default AdvancedSemanticAnalyzer;
