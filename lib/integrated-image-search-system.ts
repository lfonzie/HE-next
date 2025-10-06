/**
 * Sistema Integrado de Busca e Classificação de Imagens para Aulas
 * Combina todas as melhorias implementadas em um sistema unificado
 */

import { UnifiedImageClassifier, ImageClassificationResult } from './unified-image-classifier';
import { OptimizedProviderSelector, OptimizedSelectionResult } from './optimized-provider-selector';
import { AdvancedSemanticAnalyzer, ThemeAnalysis } from './advanced-semantic-analyzer';
import { RigorousQualityController, QualityControlResult } from './rigorous-quality-controller';

export interface IntegratedImageSearchResult {
  success: boolean;
  topic: string;
  subject?: string;
  totalImagesFound: number;
  validImages: ImageClassificationResult[];
  invalidImages: { image: ImageClassificationResult; reason: string }[];
  themeAnalysis: ThemeAnalysis;
  providerStats: OptimizedSelectionResult['providerStats'];
  qualityMetrics: {
    averageScore: number;
    diversityScore: number;
    qualityScore: number;
    educationalValue: number;
  };
  searchTime: number;
  recommendations: string[];
  errors?: string[];
}

export interface SearchConfiguration {
  topic: string;
  subject?: string;
  count?: number;
  strictMode?: boolean;
  prioritizeScientific?: boolean;
  requireHighQuality?: boolean;
  maxSearchTime?: number; // em ms
}

/**
 * Sistema integrado principal
 */
export class IntegratedImageSearchSystem {
  private classifier: UnifiedImageClassifier;
  private providerSelector: OptimizedProviderSelector;
  private semanticAnalyzer: AdvancedSemanticAnalyzer;
  private qualityController: RigorousQualityController;
  
  constructor() {
    this.classifier = new UnifiedImageClassifier({
      topic: '',
      strictMode: true,
      prioritizeScientific: true,
      avoidGeneric: true
    });
    
    this.providerSelector = new OptimizedProviderSelector();
    this.semanticAnalyzer = new AdvancedSemanticAnalyzer();
    this.qualityController = new RigorousQualityController({
      minOverallScore: 60,
      minRelevanceScore: 50,
      minEducationalValue: 40,
      minQualityScore: 50,
      minAppropriatenessScore: 70,
      strictContentFilter: true
    });
  }
  
  /**
   * Executa busca integrada completa
   */
  async searchImages(config: SearchConfiguration): Promise<IntegratedImageSearchResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      console.log(`🔍 Iniciando busca integrada para: "${config.topic}"`);
      
      // 1. Análise semântica do tema
      console.log('📝 ETAPA 1: Análise semântica do tema');
      const themeAnalysis = await this.semanticAnalyzer.analyzeTheme(config.topic, config.subject);
      console.log(`✅ Tema analisado: ${themeAnalysis.translatedTheme} (confiança: ${themeAnalysis.confidence}%)`);
      
      // 2. Busca otimizada em provedores
      console.log('🔍 ETAPA 2: Busca otimizada em provedores');
      const searchResult = await this.providerSelector.selectOptimizedImages(
        config.topic,
        config.count || 6,
        config.subject
      );
      console.log(`✅ Busca concluída: ${searchResult.selectedImages.length} imagens encontradas`);
      
      // 3. Classificação unificada das imagens
      console.log('🤖 ETAPA 3: Classificação unificada das imagens');
      const classifiedImages = await this.classifier.classifyImages(searchResult.selectedImages);
      console.log(`✅ Classificação concluída: ${classifiedImages.length} imagens classificadas`);
      
      // 4. Controle de qualidade rigoroso
      console.log('🛡️ ETAPA 4: Controle de qualidade rigoroso');
      const qualityResult = await this.qualityController.validateImages(classifiedImages);
      console.log(`✅ Controle de qualidade: ${qualityResult.validImages.length} imagens aprovadas`);
      
      // 5. Preparar imagens inválidas com razões
      const invalidImages = qualityResult.invalidImages.map(({ image, result }) => ({
        image,
        reason: result.issues.map(issue => issue.message).join('; ')
      }));
      
      // 6. Calcular métricas de qualidade
      const qualityMetrics = this.calculateQualityMetrics(qualityResult.validImages);
      
      // 7. Gerar recomendações
      const recommendations = this.generateRecommendations(
        themeAnalysis,
        qualityResult.summary,
        qualityMetrics
      );
      
      const searchTime = Date.now() - startTime;
      
      console.log(`🎯 Busca integrada concluída em ${searchTime}ms`);
      console.log(`📊 Resultados: ${qualityResult.validImages.length}/${classifiedImages.length} imagens válidas`);
      
      return {
        success: true,
        topic: config.topic,
        subject: config.subject,
        totalImagesFound: classifiedImages.length,
        validImages: qualityResult.validImages,
        invalidImages,
        themeAnalysis,
        providerStats: searchResult.providerStats,
        qualityMetrics,
        searchTime,
        recommendations,
        errors: errors.length > 0 ? errors : undefined
      };
      
    } catch (error) {
      console.error('❌ Erro na busca integrada:', error);
      errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
      
      return {
        success: false,
        topic: config.topic,
        subject: config.subject,
        totalImagesFound: 0,
        validImages: [],
        invalidImages: [],
        themeAnalysis: await this.createFallbackThemeAnalysis(config.topic),
        providerStats: {},
        qualityMetrics: {
          averageScore: 0,
          diversityScore: 0,
          qualityScore: 0,
          educationalValue: 0
        },
        searchTime: Date.now() - startTime,
        recommendations: ['Verificar conexão com provedores de imagem', 'Tentar novamente em alguns minutos'],
        errors
      };
    }
  }
  
  /**
   * Busca rápida com configurações padrão
   */
  async quickSearch(topic: string, subject?: string): Promise<IntegratedImageSearchResult> {
    return await this.searchImages({
      topic,
      subject,
      count: 6,
      strictMode: true,
      prioritizeScientific: true,
      requireHighQuality: true
    });
  }
  
  /**
   * Busca com configurações relaxadas para temas difíceis
   */
  async relaxedSearch(topic: string, subject?: string): Promise<IntegratedImageSearchResult> {
    return await this.searchImages({
      topic,
      subject,
      count: 6,
      strictMode: false,
      prioritizeScientific: false,
      requireHighQuality: false
    });
  }
  
  /**
   * Calcula métricas de qualidade
   */
  private calculateQualityMetrics(images: ImageClassificationResult[]): IntegratedImageSearchResult['qualityMetrics'] {
    if (images.length === 0) {
      return {
        averageScore: 0,
        diversityScore: 0,
        qualityScore: 0,
        educationalValue: 0
      };
    }
    
    const averageScore = images.reduce((sum, img) => sum + img.overallScore, 0) / images.length;
    const diversityScore = this.calculateDiversityScore(images);
    const qualityScore = images.reduce((sum, img) => sum + img.qualityScore, 0) / images.length;
    const educationalValue = images.reduce((sum, img) => sum + img.educationalValue, 0) / images.length;
    
    return {
      averageScore: Math.round(averageScore),
      diversityScore: Math.round(diversityScore),
      qualityScore: Math.round(qualityScore),
      educationalValue: Math.round(educationalValue)
    };
  }
  
  /**
   * Calcula score de diversidade
   */
  private calculateDiversityScore(images: ImageClassificationResult[]): number {
    if (images.length === 0) return 0;
    
    const providers = new Set(images.map(img => img.provider));
    const categories = new Set(images.map(img => img.category));
    
    const providerDiversity = (providers.size / 5) * 50; // 5 provedores máximos
    const categoryDiversity = (categories.size / 10) * 30; // 10 categorias máximas
    const sizeBonus = Math.min(images.length * 2, 20);
    
    return Math.min(100, providerDiversity + categoryDiversity + sizeBonus);
  }
  
  /**
   * Gera recomendações baseadas nos resultados
   */
  private generateRecommendations(
    themeAnalysis: ThemeAnalysis,
    qualitySummary: any,
    qualityMetrics: IntegratedImageSearchResult['qualityMetrics']
  ): string[] {
    const recommendations: string[] = [];
    
    // Recomendações baseadas na análise do tema
    if (themeAnalysis.confidence < 70) {
      recommendations.push('Considerar usar termos mais específicos para melhorar a busca');
    }
    
    if (themeAnalysis.category === 'general') {
      recommendations.push('Especificar melhor a disciplina ou área de conhecimento');
    }
    
    // Recomendações baseadas na qualidade
    if (qualitySummary.failed > qualitySummary.passed) {
      recommendations.push('Muitas imagens foram rejeitadas - considerar termos de busca mais específicos');
    }
    
    if (qualityMetrics.averageScore < 70) {
      recommendations.push('Qualidade geral das imagens pode ser melhorada');
    }
    
    if (qualityMetrics.educationalValue < 60) {
      recommendations.push('Priorizar termos com maior valor educacional');
    }
    
    if (qualityMetrics.diversityScore < 50) {
      recommendations.push('Buscar imagens de diferentes fontes para maior diversidade');
    }
    
    // Recomendações específicas por categoria
    if (themeAnalysis.category === 'biology') {
      recommendations.push('Para biologia, buscar termos como "diagram", "structure", "process"');
    } else if (themeAnalysis.category === 'physics') {
      recommendations.push('Para física, buscar termos como "experiment", "diagram", "concept"');
    } else if (themeAnalysis.category === 'chemistry') {
      recommendations.push('Para química, buscar termos como "molecule", "reaction", "laboratory"');
    }
    
    return recommendations;
  }
  
  /**
   * Cria análise de tema de fallback em caso de erro
   */
  private async createFallbackThemeAnalysis(topic: string): Promise<ThemeAnalysis> {
    return {
      originalTopic: topic,
      extractedTheme: topic.toLowerCase(),
      translatedTheme: topic.toLowerCase(),
      confidence: 30,
      category: 'general',
      relatedTerms: [topic.toLowerCase()],
      visualConcepts: [],
      educationalContext: [],
      searchQueries: [topic.toLowerCase()],
      language: 'pt'
    };
  }
  
  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats(): {
    cacheSize: number;
    thresholds: any;
    providerConfigs: any;
  } {
    return {
      cacheSize: 0, // TODO: implementar cache
      thresholds: this.qualityController.getThresholds(),
      providerConfigs: {} // TODO: implementar estatísticas de provedores
    };
  }
  
  /**
   * Limpa cache e recursos
   */
  cleanup(): void {
    this.providerSelector.clearCache();
  }
}

/**
 * Função utilitária para busca rápida
 */
export async function searchImagesForLesson(
  topic: string, 
  subject?: string
): Promise<IntegratedImageSearchResult> {
  const system = new IntegratedImageSearchSystem();
  try {
    return await system.quickSearch(topic, subject);
  } finally {
    system.cleanup();
  }
}

/**
 * Função utilitária para busca com configurações personalizadas
 */
export async function searchImagesWithConfig(
  config: SearchConfiguration
): Promise<IntegratedImageSearchResult> {
  const system = new IntegratedImageSearchSystem();
  try {
    return await system.searchImages(config);
  } finally {
    system.cleanup();
  }
}

export default IntegratedImageSearchSystem;
