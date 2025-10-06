/**
 * Sistema Rigoroso de Controle de Qualidade para Imagens Educacionais
 * Implementa validações múltiplas e filtros de qualidade
 */

import { ImageClassificationResult } from './unified-image-classifier';

export interface QualityControlResult {
  passed: boolean;
  score: number;              // 0-100
  issues: QualityIssue[];
  warnings: string[];
  recommendations: string[];
  metadata: {
    urlValid: boolean;
    dimensionsValid: boolean;
    contentAppropriate: boolean;
    educationalRelevant: boolean;
    licenseCompliant: boolean;
  };
}

export interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'url' | 'content' | 'license' | 'dimensions' | 'relevance' | 'safety';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixable: boolean;
}

export interface QualityThresholds {
  minOverallScore: number;        // Score mínimo geral (0-100)
  minRelevanceScore: number;      // Score mínimo de relevância
  minEducationalValue: number;    // Score mínimo de valor educacional
  minQualityScore: number;        // Score mínimo de qualidade técnica
  minAppropriatenessScore: number; // Score mínimo de adequação
  minWidth: number;              // Largura mínima em pixels
  minHeight: number;             // Altura mínima em pixels
  maxAspectRatio: number;        // Proporção máxima (largura/altura)
  minAspectRatio: number;        // Proporção mínima
  requireHttps: boolean;         // Exigir HTTPS
  requireLicense: boolean;       // Exigir licença válida
  strictContentFilter: boolean;  // Filtro de conteúdo rigoroso
}

/**
 * Configurações padrão de qualidade
 */
const DEFAULT_THRESHOLDS: QualityThresholds = {
  minOverallScore: 60,
  minRelevanceScore: 50,
  minEducationalValue: 40,
  minQualityScore: 50,
  minAppropriatenessScore: 70,
  minWidth: 400,
  minHeight: 300,
  maxAspectRatio: 3.0,
  minAspectRatio: 0.5,
  requireHttps: true,
  requireLicense: false,
  strictContentFilter: true
};

/**
 * Sistema de controle de qualidade rigoroso
 */
export class RigorousQualityController {
  private thresholds: QualityThresholds;
  private inappropriateContentPatterns: RegExp[];
  private lowQualityIndicators: string[];
  
  constructor(thresholds?: Partial<QualityThresholds>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.initializeContentFilters();
  }
  
  /**
   * Valida uma imagem com controles rigorosos
   */
  async validateImage(image: ImageClassificationResult): Promise<QualityControlResult> {
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // 1. Validação de URL
    const urlValidation = this.validateUrl(image.url);
    if (!urlValidation.valid) {
      issues.push({
        type: 'error',
        category: 'url',
        message: urlValidation.message,
        severity: 'critical',
        fixable: false
      });
    }
    
    // 2. Validação de dimensões
    const dimensionValidation = this.validateDimensions(image);
    if (!dimensionValidation.valid) {
      issues.push({
        type: 'warning',
        category: 'dimensions',
        message: dimensionValidation.message,
        severity: 'medium',
        fixable: true
      });
    }
    
    // 3. Validação de conteúdo
    const contentValidation = this.validateContent(image);
    if (!contentValidation.valid) {
      issues.push({
        type: 'error',
        category: 'content',
        message: contentValidation.message,
        severity: 'high',
        fixable: false
      });
    }
    
    // 4. Validação de licença
    const licenseValidation = this.validateLicense(image);
    if (!licenseValidation.valid) {
      issues.push({
        type: 'warning',
        category: 'license',
        message: licenseValidation.message,
        severity: 'medium',
        fixable: false
      });
    }
    
    // 5. Validação de relevância educacional
    const relevanceValidation = this.validateEducationalRelevance(image);
    if (!relevanceValidation.valid) {
      issues.push({
        type: 'warning',
        category: 'relevance',
        message: relevanceValidation.message,
        severity: 'medium',
        fixable: false
      });
    }
    
    // 6. Validação de segurança
    const safetyValidation = this.validateSafety(image);
    if (!safetyValidation.valid) {
      issues.push({
        type: 'error',
        category: 'safety',
        message: safetyValidation.message,
        severity: 'critical',
        fixable: false
      });
    }
    
    // 7. Validação de scores
    const scoreValidation = this.validateScores(image);
    if (!scoreValidation.valid) {
      issues.push({
        type: 'warning',
        category: 'relevance',
        message: scoreValidation.message,
        severity: 'medium',
        fixable: false
      });
    }
    
    // 8. Gerar recomendações
    this.generateRecommendations(image, recommendations);
    
    // 9. Calcular score final
    const finalScore = this.calculateFinalScore(image, issues);
    
    // 10. Determinar se passou na validação
    const passed = this.determinePassed(finalScore, issues);
    
    return {
      passed,
      score: finalScore,
      issues,
      warnings,
      recommendations,
      metadata: {
        urlValid: urlValidation.valid,
        dimensionsValid: dimensionValidation.valid,
        contentAppropriate: contentValidation.valid,
        educationalRelevant: relevanceValidation.valid,
        licenseCompliant: licenseValidation.valid
      }
    };
  }
  
  /**
   * Valida múltiplas imagens em lote
   */
  async validateImages(images: ImageClassificationResult[]): Promise<{
    validImages: ImageClassificationResult[];
    invalidImages: { image: ImageClassificationResult; result: QualityControlResult }[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      averageScore: number;
      commonIssues: { issue: string; count: number }[];
    };
  }> {
    const validImages: ImageClassificationResult[] = [];
    const invalidImages: { image: ImageClassificationResult; result: QualityControlResult }[] = [];
    const issueCounts: Map<string, number> = new Map();
    let totalScore = 0;
    
    for (const image of images) {
      const result = await this.validateImage(image);
      totalScore += result.score;
      
      if (result.passed) {
        validImages.push(image);
      } else {
        invalidImages.push({ image, result });
      }
      
      // Contar issues
      result.issues.forEach(issue => {
        const key = `${issue.category}:${issue.message}`;
        issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
      });
    }
    
    const commonIssues = Array.from(issueCounts.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      validImages,
      invalidImages,
      summary: {
        total: images.length,
        passed: validImages.length,
        failed: invalidImages.length,
        averageScore: images.length > 0 ? Math.round(totalScore / images.length) : 0,
        commonIssues
      }
    };
  }
  
  /**
   * Valida URL da imagem
   */
  private validateUrl(url: string): { valid: boolean; message: string } {
    if (!url) {
      return { valid: false, message: 'URL não fornecida' };
    }
    
    try {
      const urlObj = new URL(url);
      
      // Verificar protocolo HTTPS se exigido
      if (this.thresholds.requireHttps && urlObj.protocol !== 'https:') {
        return { valid: false, message: 'URL deve usar HTTPS' };
      }
      
      // Verificar se é uma URL de imagem válida
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );
      
      if (!hasImageExtension && !url.includes('unsplash.com') && !url.includes('pixabay.com') && !url.includes('wikimedia.org')) {
        return { valid: false, message: 'URL não parece ser de uma imagem válida' };
      }
      
      return { valid: true, message: 'URL válida' };
    } catch (error) {
      return { valid: false, message: 'URL malformada' };
    }
  }
  
  /**
   * Valida dimensões da imagem
   */
  private validateDimensions(image: ImageClassificationResult): { valid: boolean; message: string } {
    if (!image.width || !image.height) {
      return { valid: false, message: 'Dimensões não fornecidas' };
    }
    
    const { width, height } = image;
    const aspectRatio = width / height;
    
    if (width < this.thresholds.minWidth) {
      return { valid: false, message: `Largura muito pequena (${width}px < ${this.thresholds.minWidth}px)` };
    }
    
    if (height < this.thresholds.minHeight) {
      return { valid: false, message: `Altura muito pequena (${height}px < ${this.thresholds.minHeight}px)` };
    }
    
    if (aspectRatio > this.thresholds.maxAspectRatio) {
      return { valid: false, message: `Proporção muito larga (${aspectRatio.toFixed(2)} > ${this.thresholds.maxAspectRatio})` };
    }
    
    if (aspectRatio < this.thresholds.minAspectRatio) {
      return { valid: false, message: `Proporção muito alta (${aspectRatio.toFixed(2)} < ${this.thresholds.minAspectRatio})` };
    }
    
    return { valid: true, message: 'Dimensões adequadas' };
  }
  
  /**
   * Valida conteúdo da imagem
   */
  private validateContent(image: ImageClassificationResult): { valid: boolean; message: string } {
    const text = `${image.title || ''} ${image.description || ''}`.toLowerCase();
    
    // Verificar padrões de conteúdo inadequado
    for (const pattern of this.inappropriateContentPatterns) {
      if (pattern.test(text)) {
        return { valid: false, message: 'Conteúdo inadequado detectado' };
      }
    }
    
    // Verificar indicadores de baixa qualidade
    const lowQualityCount = this.lowQualityIndicators.filter(indicator => 
      text.includes(indicator)
    ).length;
    
    if (lowQualityCount >= 3) {
      return { valid: false, message: 'Múltiplos indicadores de baixa qualidade' };
    }
    
    return { valid: true, message: 'Conteúdo apropriado' };
  }
  
  /**
   * Valida licença da imagem
   */
  private validateLicense(image: ImageClassificationResult): { valid: boolean; message: string } {
    if (this.thresholds.requireLicense && !image.license) {
      return { valid: false, message: 'Licença não fornecida' };
    }
    
    if (image.license) {
      const license = image.license.toLowerCase();
      
      // Verificar se é uma licença educacional válida
      const validLicenses = ['cc', 'creative commons', 'public domain', 'unsplash license', 'pixabay license'];
      const hasValidLicense = validLicenses.some(validLicense => 
        license.includes(validLicense)
      );
      
      if (!hasValidLicense) {
        return { valid: false, message: 'Licença não reconhecida como educacional' };
      }
    }
    
    return { valid: true, message: 'Licença adequada' };
  }
  
  /**
   * Valida relevância educacional
   */
  private validateEducationalRelevance(image: ImageClassificationResult): { valid: boolean; message: string } {
    if (image.educationalValue < this.thresholds.minEducationalValue) {
      return { valid: false, message: `Valor educacional muito baixo (${image.educationalValue} < ${this.thresholds.minEducationalValue})` };
    }
    
    if (image.relevanceScore < this.thresholds.minRelevanceScore) {
      return { valid: false, message: `Relevância muito baixa (${image.relevanceScore} < ${this.thresholds.minRelevanceScore})` };
    }
    
    return { valid: true, message: 'Relevância educacional adequada' };
  }
  
  /**
   * Valida segurança da imagem
   */
  private validateSafety(image: ImageClassificationResult): { valid: boolean; message: string } {
    if (image.appropriatenessScore < this.thresholds.minAppropriatenessScore) {
      return { valid: false, message: `Adequação muito baixa (${image.appropriatenessScore} < ${this.thresholds.minAppropriatenessScore})` };
    }
    
    // Verificar warnings específicos
    if (image.warnings && image.warnings.length > 0) {
      const criticalWarnings = image.warnings.filter(warning => 
        warning.toLowerCase().includes('inappropriate') || 
        warning.toLowerCase().includes('unsafe') ||
        warning.toLowerCase().includes('adult')
      );
      
      if (criticalWarnings.length > 0) {
        return { valid: false, message: 'Avisos de segurança detectados' };
      }
    }
    
    return { valid: true, message: 'Imagem segura para educação' };
  }
  
  /**
   * Valida scores da imagem
   */
  private validateScores(image: ImageClassificationResult): { valid: boolean; message: string } {
    if (image.overallScore < this.thresholds.minOverallScore) {
      return { valid: false, message: `Score geral muito baixo (${image.overallScore} < ${this.thresholds.minOverallScore})` };
    }
    
    if (image.qualityScore < this.thresholds.minQualityScore) {
      return { valid: false, message: `Qualidade técnica muito baixa (${image.qualityScore} < ${this.thresholds.minQualityScore})` };
    }
    
    return { valid: true, message: 'Scores adequados' };
  }
  
  /**
   * Gera recomendações para melhoria
   */
  private generateRecommendations(image: ImageClassificationResult, recommendations: string[]): void {
    if (image.overallScore < 70) {
      recommendations.push('Considerar imagens com maior relevância para o tema');
    }
    
    if (image.educationalValue < 60) {
      recommendations.push('Priorizar imagens com maior valor educacional');
    }
    
    if (image.qualityScore < 60) {
      recommendations.push('Buscar imagens com melhor qualidade técnica');
    }
    
    if (!image.license || image.license === 'Unknown') {
      recommendations.push('Verificar licença de uso da imagem');
    }
    
    if (image.warnings && image.warnings.length > 0) {
      recommendations.push('Revisar avisos sobre a imagem');
    }
  }
  
  /**
   * Calcula score final considerando issues
   */
  private calculateFinalScore(image: ImageClassificationResult, issues: QualityIssue[]): number {
    let score = image.overallScore;
    
    // Penalizar por issues críticas
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    score -= criticalIssues.length * 30;
    
    // Penalizar por issues de alta severidade
    const highIssues = issues.filter(issue => issue.severity === 'high');
    score -= highIssues.length * 20;
    
    // Penalizar por issues médias
    const mediumIssues = issues.filter(issue => issue.severity === 'medium');
    score -= mediumIssues.length * 10;
    
    // Penalizar por issues baixas
    const lowIssues = issues.filter(issue => issue.severity === 'low');
    score -= lowIssues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Determina se a imagem passou na validação
   */
  private determinePassed(score: number, issues: QualityIssue[]): boolean {
    // Não passar se há issues críticas
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) return false;
    
    // Não passar se score muito baixo
    if (score < this.thresholds.minOverallScore) return false;
    
    // Não passar se há muitos issues de alta severidade
    const highIssues = issues.filter(issue => issue.severity === 'high');
    if (highIssues.length >= 2) return false;
    
    return true;
  }
  
  /**
   * Inicializa filtros de conteúdo
   */
  private initializeContentFilters(): void {
    this.inappropriateContentPatterns = [
      /adult|sexy|nude|explicit/i,
      /violence|blood|death|killing/i,
      /weapon|gun|knife|bomb/i,
      /drug|alcohol|smoking/i,
      /hate|racist|discrimination/i,
      /political.*controversy/i,
      /religious.*conflict/i
    ];
    
    this.lowQualityIndicators = [
      'blurry', 'low resolution', 'pixelated', 'distorted',
      'generic', 'stock photo', 'placeholder', 'template',
      'abstract', 'artistic', 'creative', 'design',
      'woman', 'man', 'person', 'smiling', 'casual'
    ];
  }
  
  /**
   * Atualiza thresholds de qualidade
   */
  updateThresholds(newThresholds: Partial<QualityThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
  
  /**
   * Obtém thresholds atuais
   */
  getThresholds(): QualityThresholds {
    return { ...this.thresholds };
  }
}

/**
 * Função utilitária para validação rápida
 */
export async function validateImageQuality(image: ImageClassificationResult): Promise<QualityControlResult> {
  const controller = new RigorousQualityController();
  return await controller.validateImage(image);
}

/**
 * Função utilitária para validação em lote
 */
export async function validateImagesQuality(images: ImageClassificationResult[]): Promise<{
  validImages: ImageClassificationResult[];
  invalidImages: { image: ImageClassificationResult; result: QualityControlResult }[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    averageScore: number;
    commonIssues: { issue: string; count: number }[];
  };
}> {
  const controller = new RigorousQualityController();
  return await controller.validateImages(images);
}

export default RigorousQualityController;
