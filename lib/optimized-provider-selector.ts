/**
 * Sistema Otimizado de Seleção de Provedores de Imagens
 * Garante diversidade, qualidade e performance otimizada
 */

import { ImageClassificationResult } from './unified-image-classifier';

export interface ProviderConfig {
  name: string;
  priority: number;        // 1-10, maior = mais prioritário
  timeout: number;         // timeout em ms
  maxResults: number;      // máximo de resultados por busca
  quality: 'high' | 'medium' | 'variable';
  educationalContent: 'excellent' | 'good' | 'medium' | 'low';
  reliability: number;     // 0-100, taxa de sucesso histórica
}

export interface ProviderSearchResult {
  provider: string;
  images: ImageClassificationResult[];
  success: boolean;
  error?: string;
  searchTime: number;
  totalFound: number;
}

export interface OptimizedSelectionResult {
  selectedImages: ImageClassificationResult[];
  providerStats: {
    [provider: string]: {
      searched: boolean;
      success: boolean;
      imagesFound: number;
      imagesSelected: number;
      searchTime: number;
    };
  };
  totalSearchTime: number;
  diversityScore: number;
  qualityScore: number;
}

/**
 * Configurações otimizadas dos provedores
 */
const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  wikimedia: {
    name: 'Wikimedia Commons',
    priority: 10,           // Máxima prioridade para educação
    timeout: 6000,         // 6 segundos
    maxResults: 5,
    quality: 'variable',
    educationalContent: 'excellent',
    reliability: 95
  },
  unsplash: {
    name: 'Unsplash',
    priority: 8,           // Alta prioridade
    timeout: 5000,         // 5 segundos
    maxResults: 4,
    quality: 'high',
    educationalContent: 'good',
    reliability: 90
  },
  pexels: {
    name: 'Pexels',
    priority: 7,           // Boa prioridade
    timeout: 5000,         // 5 segundos
    maxResults: 4,
    quality: 'high',
    educationalContent: 'medium',
    reliability: 88
  },
  pixabay: {
    name: 'Pixabay',
    priority: 6,           // Prioridade média
    timeout: 4000,         // 4 segundos
    maxResults: 3,
    quality: 'medium',
    educationalContent: 'medium',
    reliability: 85
  },
  bing: {
    name: 'Bing Images',
    priority: 4,           // Prioridade baixa
    timeout: 3000,         // 3 segundos
    maxResults: 3,
    quality: 'variable',
    educationalContent: 'low',
    reliability: 80
  }
};

/**
 * Sistema otimizado de seleção de provedores
 */
export class OptimizedProviderSelector {
  private baseUrl: string;
  private cache: Map<string, { result: ImageClassificationResult[]; timestamp: number }>;
  private cacheTimeout: number = 300000; // 5 minutos
  
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    this.cache = new Map();
  }
  
  /**
   * Seleciona imagens otimizadas com diversidade garantida
   */
  async selectOptimizedImages(
    topic: string, 
    count: number = 6,
    subject?: string
  ): Promise<OptimizedSelectionResult> {
    const startTime = Date.now();
    
    // 1. Buscar em todos os provedores em paralelo com timeouts otimizados
    const searchResults = await this.searchAllProvidersOptimized(topic, subject);
    
    // 2. Classificar todas as imagens encontradas
    const allImages = searchResults.flatMap(result => result.images);
    const { classifyImagesForLesson } = await import('./unified-image-classifier');
    const classifiedImages = await classifyImagesForLesson(allImages, topic, subject);
    
    // 3. Selecionar imagens com diversidade otimizada
    const selectedImages = this.selectWithDiversity(classifiedImages, count, searchResults);
    
    // 4. Calcular métricas de qualidade
    const diversityScore = this.calculateDiversityScore(selectedImages);
    const qualityScore = this.calculateQualityScore(selectedImages);
    
    // 5. Preparar estatísticas dos provedores
    const providerStats = this.prepareProviderStats(searchResults, selectedImages);
    
    const totalSearchTime = Date.now() - startTime;
    
    return {
      selectedImages,
      providerStats,
      totalSearchTime,
      diversityScore,
      qualityScore
    };
  }
  
  /**
   * Busca otimizada em todos os provedores
   */
  private async searchAllProvidersOptimized(
    topic: string, 
    subject?: string
  ): Promise<ProviderSearchResult[]> {
    // Ordenar provedores por prioridade
    const sortedProviders = Object.entries(PROVIDER_CONFIGS)
      .sort(([,a], [,b]) => b.priority - a.priority);
    
    // Executar buscas em paralelo com timeouts individuais
    const searchPromises = sortedProviders.map(([provider, config]) => 
      this.searchProviderWithTimeout(provider, config, topic, subject)
    );
    
    const results = await Promise.allSettled(searchPromises);
    
    return results.map((result, index) => {
      const provider = sortedProviders[index][0];
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          provider,
          images: [],
          success: false,
          error: result.reason?.message || 'Unknown error',
          searchTime: PROVIDER_CONFIGS[provider].timeout,
          totalFound: 0
        };
      }
    });
  }
  
  /**
   * Busca em um provedor específico com timeout
   */
  private async searchProviderWithTimeout(
    provider: string,
    config: ProviderConfig,
    topic: string,
    subject?: string
  ): Promise<ProviderSearchResult> {
    const startTime = Date.now();
    
    try {
      // Verificar cache primeiro
      const cacheKey = `${provider}:${topic}:${subject || ''}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return {
          provider,
          images: cached.result,
          success: true,
          searchTime: Date.now() - startTime,
          totalFound: cached.result.length
        };
      }
      
      // Executar busca com timeout
      const searchPromise = this.executeProviderSearch(provider, topic, subject, config.maxResults);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), config.timeout)
      );
      
      const images = await Promise.race([searchPromise, timeoutPromise]);
      
      // Armazenar no cache
      this.cache.set(cacheKey, {
        result: images,
        timestamp: Date.now()
      });
      
      return {
        provider,
        images,
        success: true,
        searchTime: Date.now() - startTime,
        totalFound: images.length
      };
      
    } catch (error) {
      console.error(`Erro ao buscar no ${provider}:`, error);
      return {
        provider,
        images: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        searchTime: Date.now() - startTime,
        totalFound: 0
      };
    }
  }
  
  /**
   * Executa busca específica no provedor
   */
  private async executeProviderSearch(
    provider: string,
    topic: string,
    subject: string | undefined,
    maxResults: number
  ): Promise<ImageClassificationResult[]> {
    const endpoint = this.getProviderEndpoint(provider);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: topic,
        subject,
        count: maxResults,
        safe: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Search failed');
    }
    
    // Converter para formato padronizado
    const images = data.images || data.results || data.photos || data.data || [];
    
    return images.map((img: any) => ({
      url: img.url || img.urls?.regular || img.webformatURL,
      provider: provider as any,
      title: img.title || img.description || img.alt_description,
      description: img.description || img.tags,
      author: img.author || img.user?.name || img.photographer,
      license: img.license || 'Unknown',
      width: img.width || img.webformatWidth,
      height: img.height || img.webformatHeight,
      sourceUrl: img.sourceUrl || img.links?.html || img.pageURL,
      relevanceScore: img.relevanceScore || 0,
      educationalValue: img.educationalValue || 0,
      qualityScore: img.qualityScore || 0,
      appropriatenessScore: img.appropriatenessScore || 0,
      overallScore: img.overallScore || 0,
      category: img.category || 'general',
      isRelevant: img.isRelevant || false,
      reasoning: img.reasoning || '',
      warnings: img.warnings || []
    }));
  }
  
  /**
   * Obtém endpoint do provedor
   */
  private getProviderEndpoint(provider: string): string {
    const endpoints: Record<string, string> = {
      wikimedia: '/api/wikimedia/search',
      unsplash: '/api/unsplash/search',
      pexels: '/api/pexels/search',
      pixabay: '/api/pixabay',
      bing: '/api/bing/search'
    };
    
    return endpoints[provider] || '/api/images/smart-search';
  }
  
  /**
   * Seleciona imagens garantindo diversidade
   */
  private selectWithDiversity(
    images: ImageClassificationResult[],
    count: number,
    searchResults: ProviderSearchResult[]
  ): ImageClassificationResult[] {
    const selected: ImageClassificationResult[] = [];
    const usedUrls = new Set<string>();
    
    // 1. Selecionar 1 imagem por provedor (priorizando provedores de maior qualidade educacional)
    const providerOrder = ['wikimedia', 'unsplash', 'pexels', 'pixabay', 'bing'];
    
    for (const provider of providerOrder) {
      if (selected.length >= count) break;
      
      const providerImages = images.filter(img => img.provider === provider);
      const bestImage = providerImages
        .filter(img => !usedUrls.has(img.url) && img.isRelevant)
        .sort((a, b) => b.overallScore - a.overallScore)[0];
      
      if (bestImage) {
        selected.push(bestImage);
        usedUrls.add(bestImage.url);
      }
    }
    
    // 2. Completar com as melhores imagens restantes
    const remainingImages = images
      .filter(img => !usedUrls.has(img.url) && img.isRelevant)
      .sort((a, b) => b.overallScore - a.overallScore);
    
    while (selected.length < count && remainingImages.length > 0) {
      const nextImage = remainingImages.shift();
      if (nextImage) {
        selected.push(nextImage);
        usedUrls.add(nextImage.url);
      }
    }
    
    // 3. Se ainda não temos o suficiente, relaxar critérios
    if (selected.length < count) {
      const fallbackImages = images
        .filter(img => !usedUrls.has(img.url))
        .sort((a, b) => b.overallScore - a.overallScore);
      
      while (selected.length < count && fallbackImages.length > 0) {
        const fallbackImage = fallbackImages.shift();
        if (fallbackImage) {
          selected.push(fallbackImage);
          usedUrls.add(fallbackImage.url);
        }
      }
    }
    
    return selected;
  }
  
  /**
   * Calcula score de diversidade (0-100)
   */
  private calculateDiversityScore(images: ImageClassificationResult[]): number {
    if (images.length === 0) return 0;
    
    const providers = new Set(images.map(img => img.provider));
    const categories = new Set(images.map(img => img.category));
    
    const providerDiversity = (providers.size / Object.keys(PROVIDER_CONFIGS).length) * 50;
    const categoryDiversity = (categories.size / 10) * 30; // Assumindo 10 categorias máximas
    const sizeBonus = Math.min(images.length * 2, 20); // Bonus por quantidade
    
    return Math.min(100, providerDiversity + categoryDiversity + sizeBonus);
  }
  
  /**
   * Calcula score de qualidade geral (0-100)
   */
  private calculateQualityScore(images: ImageClassificationResult[]): number {
    if (images.length === 0) return 0;
    
    const avgOverallScore = images.reduce((sum, img) => sum + img.overallScore, 0) / images.length;
    const avgEducationalValue = images.reduce((sum, img) => sum + img.educationalValue, 0) / images.length;
    const avgQualityScore = images.reduce((sum, img) => sum + img.qualityScore, 0) / images.length;
    
    return Math.round((avgOverallScore + avgEducationalValue + avgQualityScore) / 3);
  }
  
  /**
   * Prepara estatísticas dos provedores
   */
  private prepareProviderStats(
    searchResults: ProviderSearchResult[],
    selectedImages: ImageClassificationResult[]
  ): OptimizedSelectionResult['providerStats'] {
    const stats: OptimizedSelectionResult['providerStats'] = {};
    
    for (const result of searchResults) {
      const selectedFromProvider = selectedImages.filter(img => img.provider === result.provider);
      
      stats[result.provider] = {
        searched: true,
        success: result.success,
        imagesFound: result.totalFound,
        imagesSelected: selectedFromProvider.length,
        searchTime: result.searchTime
      };
    }
    
    return stats;
  }
  
  /**
   * Limpa cache expirado
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Função utilitária para seleção rápida
 */
export async function selectOptimizedImagesForLesson(
  topic: string,
  count: number = 6,
  subject?: string
): Promise<OptimizedSelectionResult> {
  const selector = new OptimizedProviderSelector();
  return await selector.selectOptimizedImages(topic, count, subject);
}

export default OptimizedProviderSelector;
