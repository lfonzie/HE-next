/**
 * Sistema Unificado de Classificação de Imagens para Aulas
 * Versão melhorada com algoritmos mais precisos e consistentes
 */

export interface ImageClassificationResult {
  url: string;
  provider: 'wikimedia' | 'unsplash' | 'pixabay' | 'pexels' | 'bing';
  title?: string;
  description?: string;
  author?: string;
  license?: string;
  width?: number;
  height?: number;
  sourceUrl?: string;
  
  // Scores de classificação unificados
  relevanceScore: number;        // 0-100: Relevância para o tema
  educationalValue: number;      // 0-100: Valor educacional
  qualityScore: number;         // 0-100: Qualidade técnica da imagem
  appropriatenessScore: number; // 0-100: Adequação para educação
  overallScore: number;         // 0-100: Score final ponderado
  
  // Análise detalhada
  category: string;              // Categoria do conteúdo
  isRelevant: boolean;           // Se deve ser incluída
  reasoning: string;             // Justificativa da análise
  warnings: string[];           // Avisos sobre a imagem
}

export interface ClassificationConfig {
  topic: string;
  subject?: string;
  grade?: string;
  strictMode?: boolean;         // Modo mais rigoroso para educação
  prioritizeScientific?: boolean; // Priorizar conteúdo científico
  avoidGeneric?: boolean;       // Evitar imagens genéricas
}

/**
 * Sistema unificado de classificação de imagens
 */
export class UnifiedImageClassifier {
  private config: ClassificationConfig;
  
  constructor(config: ClassificationConfig) {
    this.config = {
      strictMode: true,
      prioritizeScientific: true,
      avoidGeneric: true,
      ...config
    };
  }
  
  /**
   * Classifica uma lista de imagens usando algoritmo unificado
   */
  async classifyImages(images: any[]): Promise<ImageClassificationResult[]> {
    const results: ImageClassificationResult[] = [];
    
    for (const image of images) {
      try {
        const result = await this.classifySingleImage(image);
        results.push(result);
      } catch (error) {
        console.error('Erro ao classificar imagem:', error);
        // Adicionar imagem com score baixo em caso de erro
        results.push(this.createFallbackResult(image));
      }
    }
    
    // Ordenar por score geral
    return results.sort((a, b) => b.overallScore - a.overallScore);
  }
  
  /**
   * Classifica uma única imagem
   */
  private async classifySingleImage(image: any): Promise<ImageClassificationResult> {
    const text = this.extractText(image);
    const warnings: string[] = [];
    
    // 1. Análise de relevância
    const relevanceScore = this.calculateRelevanceScore(text);
    
    // 2. Análise de valor educacional
    const educationalValue = this.calculateEducationalValue(text, image);
    
    // 3. Análise de qualidade técnica
    const qualityScore = this.calculateQualityScore(image);
    
    // 4. Análise de adequação
    const appropriatenessScore = this.calculateAppropriatenessScore(text);
    
    // 5. Detecção de categoria
    const category = this.detectCategory(text);
    
    // 6. Verificação de relevância final
    const isRelevant = this.determineRelevance(relevanceScore, educationalValue, appropriatenessScore);
    
    // 7. Geração de reasoning
    const reasoning = this.generateReasoning(relevanceScore, educationalValue, appropriatenessScore, category);
    
    // 8. Cálculo do score geral ponderado
    const overallScore = this.calculateOverallScore({
      relevanceScore,
      educationalValue,
      qualityScore,
      appropriatenessScore
    });
    
    // 9. Detecção de warnings
    this.detectWarnings(text, warnings);
    
    return {
      url: image.url,
      provider: image.source || image.provider,
      title: image.title,
      description: image.description,
      author: image.author,
      license: image.license,
      width: image.width,
      height: image.height,
      sourceUrl: image.sourceUrl,
      relevanceScore,
      educationalValue,
      qualityScore,
      appropriatenessScore,
      overallScore,
      category,
      isRelevant,
      reasoning,
      warnings
    };
  }
  
  /**
   * Extrai texto da imagem para análise
   */
  private extractText(image: any): string {
    const parts = [
      image.title || '',
      image.description || '',
      image.alt_description || '',
      image.tags ? (Array.isArray(image.tags) ? image.tags.join(' ') : image.tags) : ''
    ];
    
    return parts.join(' ').toLowerCase().trim();
  }
  
  /**
   * Calcula score de relevância (0-100)
   */
  private calculateRelevanceScore(text: string): number {
    const topic = this.config.topic.toLowerCase();
    const topicWords = topic.split(' ').filter(word => word.length > 2);
    
    let score = 0;
    
    // Bonus por correspondência exata do tema completo
    if (text.includes(topic)) {
      score += 40;
    }
    
    // Bonus por palavras individuais do tema
    topicWords.forEach(word => {
      if (text.includes(word)) {
        score += 15;
      }
    });
    
    // Bonus por termos relacionados semanticamente
    const relatedTerms = this.getRelatedTerms(topic);
    relatedTerms.forEach(term => {
      if (text.includes(term)) {
        score += 8;
      }
    });
    
    // Penalização por termos irrelevantes
    const irrelevantTerms = this.getIrrelevantTerms();
    irrelevantTerms.forEach(term => {
      if (text.includes(term)) {
        score -= 10;
      }
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calcula valor educacional (0-100)
   */
  private calculateEducationalValue(text: string, image: any): number {
    let score = 50; // Score base
    
    // Bonus por termos educacionais específicos
    const educationalTerms = [
      'diagram', 'chart', 'graph', 'illustration', 'process', 'structure',
      'mechanism', 'system', 'anatomy', 'physiology', 'molecular', 'cellular',
      'biological', 'chemical', 'physical', 'mathematical', 'scientific',
      'research', 'study', 'analysis', 'experiment', 'laboratory'
    ];
    
    educationalTerms.forEach(term => {
      if (text.includes(term)) {
        score += 5;
      }
    });
    
    // Bonus por provedores educacionais
    const provider = image.source || image.provider;
    if (provider === 'wikimedia') {
      score += 15; // Wikimedia tem conteúdo mais educacional
    } else if (provider === 'unsplash') {
      score += 8;
    } else if (provider === 'pixabay') {
      score += 6;
    }
    
    // Bonus por licenças educacionais
    if (image.license && image.license.includes('CC')) {
      score += 10;
    }
    
    // Penalização por conteúdo genérico
    const genericTerms = ['generic', 'abstract', 'artistic', 'creative', 'design', 'pattern'];
    genericTerms.forEach(term => {
      if (text.includes(term) && !text.includes(this.config.topic.toLowerCase())) {
        score -= 8;
      }
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calcula qualidade técnica (0-100)
   */
  private calculateQualityScore(image: any): number {
    let score = 60; // Score base
    
    // Bonus por resolução adequada
    if (image.width && image.height) {
      const aspectRatio = image.width / image.height;
      const totalPixels = image.width * image.height;
      
      // Preferir imagens com proporção adequada para slides
      if (aspectRatio >= 1.2 && aspectRatio <= 2.0) {
        score += 10;
      }
      
      // Bonus por resolução alta
      if (totalPixels >= 800 * 600) {
        score += 15;
      } else if (totalPixels >= 400 * 300) {
        score += 8;
      }
    }
    
    // Bonus por provedores de qualidade
    const provider = image.source || image.provider;
    if (provider === 'unsplash') {
      score += 12; // Unsplash tem alta qualidade
    } else if (provider === 'pexels') {
      score += 10;
    } else if (provider === 'wikimedia') {
      score += 8;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calcula adequação para educação (0-100)
   */
  private calculateAppropriatenessScore(text: string): number {
    let score = 80; // Score base alto
    
    // Penalização por conteúdo inadequado
    const inappropriateTerms = [
      'adult', 'sexy', 'nude', 'explicit', 'violence', 'blood', 'death',
      'weapon', 'gun', 'knife', 'drug', 'alcohol', 'smoking'
    ];
    
    inappropriateTerms.forEach(term => {
      if (text.includes(term)) {
        score -= 30;
      }
    });
    
    // Penalização por conteúdo controverso
    const controversialTerms = [
      'political', 'religion', 'controversy', 'protest', 'demonstration',
      'hate', 'racist', 'discrimination'
    ];
    
    controversialTerms.forEach(term => {
      if (text.includes(term)) {
        score -= 15;
      }
    });
    
    // Bonus por conteúdo educacional apropriado
    const appropriateTerms = [
      'educational', 'academic', 'scientific', 'research', 'study',
      'learning', 'teaching', 'school', 'university', 'knowledge'
    ];
    
    appropriateTerms.forEach(term => {
      if (text.includes(term)) {
        score += 5;
      }
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Detecta categoria do conteúdo
   */
  private detectCategory(text: string): string {
    const categories = {
      'biology': ['cell', 'dna', 'organism', 'plant', 'animal', 'evolution', 'genetics'],
      'chemistry': ['molecule', 'atom', 'reaction', 'compound', 'element', 'chemical'],
      'physics': ['energy', 'force', 'motion', 'wave', 'particle', 'quantum', 'gravity'],
      'mathematics': ['equation', 'formula', 'calculation', 'geometry', 'algebra', 'calculus'],
      'history': ['historical', 'ancient', 'medieval', 'revolution', 'war', 'civilization'],
      'geography': ['country', 'continent', 'landscape', 'climate', 'population', 'terrain'],
      'literature': ['book', 'poetry', 'novel', 'author', 'writing', 'literary'],
      'art': ['painting', 'sculpture', 'music', 'artist', 'creative', 'aesthetic'],
      'technology': ['computer', 'software', 'programming', 'digital', 'internet', 'ai'],
      'medicine': ['medical', 'health', 'doctor', 'hospital', 'treatment', 'disease']
    };
    
    for (const [category, terms] of Object.entries(categories)) {
      if (terms.some(term => text.includes(term))) {
        return category;
      }
    }
    
    return 'general';
  }
  
  /**
   * Determina se a imagem é relevante
   */
  private determineRelevance(relevanceScore: number, educationalValue: number, appropriatenessScore: number): boolean {
    const minRelevance = this.config.strictMode ? 60 : 40;
    const minEducational = this.config.strictMode ? 50 : 30;
    const minAppropriateness = this.config.strictMode ? 70 : 50;
    
    return relevanceScore >= minRelevance && 
           educationalValue >= minEducational && 
           appropriatenessScore >= minAppropriateness;
  }
  
  /**
   * Gera reasoning para a classificação
   */
  private generateReasoning(relevanceScore: number, educationalValue: number, appropriatenessScore: number, category: string): string {
    const reasons = [];
    
    if (relevanceScore >= 70) {
      reasons.push('alta relevância para o tema');
    } else if (relevanceScore >= 50) {
      reasons.push('relevância moderada para o tema');
    } else {
      reasons.push('baixa relevância para o tema');
    }
    
    if (educationalValue >= 70) {
      reasons.push('alto valor educacional');
    } else if (educationalValue >= 50) {
      reasons.push('valor educacional moderado');
    }
    
    if (category !== 'general') {
      reasons.push(`categoria específica: ${category}`);
    }
    
    if (appropriatenessScore >= 80) {
      reasons.push('totalmente adequada para educação');
    } else if (appropriatenessScore >= 60) {
      reasons.push('adequada para educação');
    }
    
    return reasons.join(', ');
  }
  
  /**
   * Calcula score geral ponderado
   */
  private calculateOverallScore(scores: {
    relevanceScore: number;
    educationalValue: number;
    qualityScore: number;
    appropriatenessScore: number;
  }): number {
    const weights = {
      relevance: 0.35,      // Relevância é mais importante
      educational: 0.25,    // Valor educacional
      quality: 0.20,        // Qualidade técnica
      appropriateness: 0.20 // Adequação
    };
    
    return Math.round(
      scores.relevanceScore * weights.relevance +
      scores.educationalValue * weights.educational +
      scores.qualityScore * weights.quality +
      scores.appropriatenessScore * weights.appropriateness
    );
  }
  
  /**
   * Detecta warnings sobre a imagem
   */
  private detectWarnings(text: string, warnings: string[]): void {
    if (text.includes('generic') || text.includes('abstract')) {
      warnings.push('Imagem pode ser muito genérica');
    }
    
    if (text.includes('low resolution') || text.includes('blurry')) {
      warnings.push('Qualidade da imagem pode ser baixa');
    }
    
    if (text.includes('copyright') && !text.includes('cc')) {
      warnings.push('Verificar direitos de uso');
    }
  }
  
  /**
   * Cria resultado de fallback em caso de erro
   */
  private createFallbackResult(image: any): ImageClassificationResult {
    return {
      url: image.url || '',
      provider: image.source || image.provider || 'unknown',
      title: image.title,
      description: image.description,
      author: image.author,
      license: image.license,
      width: image.width,
      height: image.height,
      sourceUrl: image.sourceUrl,
      relevanceScore: 30,
      educationalValue: 40,
      qualityScore: 50,
      appropriatenessScore: 60,
      overallScore: 45,
      category: 'general',
      isRelevant: false,
      reasoning: 'Erro na análise - imagem não recomendada',
      warnings: ['Erro na classificação']
    };
  }
  
  /**
   * Obtém termos relacionados semanticamente
   */
  private getRelatedTerms(topic: string): string[] {
    const semanticMap: Record<string, string[]> = {
      'photosynthesis': ['plant', 'leaf', 'green', 'chlorophyll', 'sunlight', 'biology'],
      'gravity': ['mass', 'weight', 'attraction', 'newton', 'einstein', 'space'],
      'mathematics': ['equation', 'formula', 'calculation', 'geometry', 'algebra'],
      'biology': ['cell', 'organism', 'dna', 'evolution', 'genetics', 'life'],
      'chemistry': ['molecule', 'atom', 'reaction', 'compound', 'element'],
      'physics': ['energy', 'force', 'motion', 'wave', 'particle', 'quantum'],
      'history': ['historical', 'ancient', 'medieval', 'revolution', 'civilization'],
      'geography': ['country', 'continent', 'landscape', 'climate', 'terrain']
    };
    
    return semanticMap[topic] || [];
  }
  
  /**
   * Obtém termos irrelevantes
   */
  private getIrrelevantTerms(): string[] {
    return [
      'woman', 'man', 'person', 'smiling', 'casual', 'business', 'office',
      'work', 'meeting', 'technology', 'computer', 'laptop', 'internet',
      'library', 'books', 'education', 'learning', 'school', 'classroom',
      'student', 'teacher', 'generic', 'abstract', 'artistic', 'creative'
    ];
  }
}

/**
 * Função utilitária para classificação rápida
 */
export async function classifyImagesForLesson(
  images: any[], 
  topic: string, 
  subject?: string
): Promise<ImageClassificationResult[]> {
  const classifier = new UnifiedImageClassifier({
    topic,
    subject,
    strictMode: true,
    prioritizeScientific: true,
    avoidGeneric: true
  });
  
  return await classifier.classifyImages(images);
}

export default UnifiedImageClassifier;
