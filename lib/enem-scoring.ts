import { PrismaClient } from '@prisma/client';
import { EnemResponse, EnemScore, EnemItem, EnemArea } from '@/types/enem';

const prisma = new PrismaClient();

export interface ScoringResult {
  score: EnemScore;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    similarQuestions: string[]; // item_ids for review
  };
}

export interface TRICurve {
  area: EnemArea;
  year: number;
  mean: number;
  standardDeviation: number;
  minScore: number;
  maxScore: number;
}

export class EnemScoringEngine {
  private triCurves: Map<string, TRICurve> = new Map();

  constructor() {
    this.initializeTRICurves();
  }

  /**
   * Calculate comprehensive score for a session
   */
  async calculateScore(sessionId: string): Promise<ScoringResult> {
    // Check if this is a local session (starts with 'local_')
    if (sessionId.startsWith('local_') || sessionId.startsWith('session_')) {
      throw new Error('Cannot calculate score for local sessions - no database data available');
    }

    // Get session responses
    const responses = await prisma.enem_response.findMany({
      where: { session_id: sessionId },
      include: {
        session: true
      }
    });

    if (responses.length === 0) {
      throw new Error('No responses found for session');
    }

    // Get items for responses
    const itemIds = responses.map(r => r.item_id);
    const items = await prisma.enem_item.findMany({
      where: { question_id: { in: itemIds } }
    });

    const itemMap = new Map(items.map(item => [item.question_id, item]));

    // Calculate area scores
    const areaScores = this.calculateAreaScores(responses, itemMap);
    
    // Calculate total score
    const totalScore = this.calculateTotalScore(areaScores);
    
    // Calculate TRI estimation
    const triEstimated = await this.calculateTRIEstimation(responses, itemMap);
    
    // Calculate statistics
    const stats = this.calculateStatistics(responses, itemMap);
    
    // Generate feedback
    const feedback = await this.generateFeedback(responses, itemMap, areaScores);

    const score: EnemScore = {
      score_id: `score_${Date.now()}`,
      session_id: sessionId,
      area_scores: areaScores,
      total_score: totalScore,
      tri_estimated: triEstimated,
      stats
    };

    return {
      score,
      feedback
    };
  }

  /**
   * Calculate scores by area
   */
  private calculateAreaScores(
    responses: any[], 
    itemMap: Map<string, any>
  ): Record<string, { raw_score: number; percentage: number; correct: number; total: number }> {
    const areaScores: Record<string, { correct: number; total: number }> = {};

    // Initialize area scores
    for (const area of ['CN', 'CH', 'LC', 'MT']) {
      areaScores[area] = { correct: 0, total: 0 };
    }

    // Count correct answers by area
    for (const response of responses) {
      const item = itemMap.get(response.item_id);
      if (!item) continue;

      const area = item.area;
      areaScores[area].total++;
      
      if (response.is_correct) {
        areaScores[area].correct++;
      }
    }

    // Calculate percentages and raw scores
    const result: Record<string, { raw_score: number; percentage: number; correct: number; total: number }> = {};
    
    for (const [area, scores] of Object.entries(areaScores)) {
      const percentage = scores.total > 0 ? (scores.correct / scores.total) * 100 : 0;
      const rawScore = this.convertPercentageToRawScore(percentage, area as EnemArea);
      
      result[area] = {
        raw_score: rawScore,
        percentage,
        correct: scores.correct,
        total: scores.total
      };
    }

    return result;
  }

  /**
   * Calculate total score from area scores
   */
  private calculateTotalScore(areaScores: Record<string, any>): number {
    const scores = Object.values(areaScores).map(score => score.raw_score);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Calculate TRI estimation with confidence interval
   */
  private async calculateTRIEstimation(
    responses: any[], 
    itemMap: Map<string, any>
  ): Promise<{ score: number; confidence_interval: { lower: number; upper: number }; disclaimer: string }> {
    const areaScores = this.calculateAreaScores(responses, itemMap);
    const totalPercentage = Object.values(areaScores).reduce((sum, score) => sum + score.percentage, 0) / Object.keys(areaScores).length;
    
    // Use historical ENEM curves to estimate TRI score
    const triScore = this.estimateTRIScore(totalPercentage);
    const confidenceInterval = this.calculateConfidenceInterval(triScore, responses.length);
    
    return {
      score: triScore,
      confidence_interval: confidenceInterval,
      disclaimer: 'Esta é uma estimativa baseada em dados históricos. A pontuação oficial do ENEM depende de parâmetros específicos do exame completo.'
    };
  }

  /**
   * Estimate TRI score from percentage
   */
  private estimateTRIScore(percentage: number): number {
    // Simplified TRI estimation based on historical ENEM data
    // This is a proxy calculation - real TRI is much more complex
    
    if (percentage >= 90) return 950;
    if (percentage >= 80) return 850 + (percentage - 80) * 10;
    if (percentage >= 70) return 750 + (percentage - 70) * 10;
    if (percentage >= 60) return 650 + (percentage - 60) * 10;
    if (percentage >= 50) return 550 + (percentage - 50) * 10;
    if (percentage >= 40) return 450 + (percentage - 40) * 10;
    if (percentage >= 30) return 350 + (percentage - 30) * 10;
    if (percentage >= 20) return 250 + (percentage - 20) * 10;
    if (percentage >= 10) return 150 + (percentage - 10) * 10;
    
    return Math.max(300, percentage * 10);
  }

  /**
   * Calculate confidence interval for TRI score
   */
  private calculateConfidenceInterval(triScore: number, sampleSize: number): { lower: number; upper: number } {
    // Confidence interval based on sample size
    const margin = Math.max(20, 100 - sampleSize); // Larger margin for smaller samples
    
    return {
      lower: Math.max(300, triScore - margin),
      upper: Math.min(950, triScore + margin)
    };
  }

  /**
   * Convert percentage to raw score for area
   */
  private convertPercentageToRawScore(percentage: number, area: EnemArea): number {
    // Different areas may have different scoring curves
    const baseScore = percentage * 10; // 0-1000 scale
    
    // Apply area-specific adjustments if needed
    switch (area) {
      case 'MT':
        return Math.min(950, baseScore * 1.05); // Slightly higher for math
      case 'CN':
        return Math.min(950, baseScore * 1.02); // Slightly higher for sciences
      default:
        return Math.min(950, baseScore);
    }
  }

  /**
   * Calculate detailed statistics
   */
  private calculateStatistics(responses: any[], itemMap: Map<string, any>): any {
    const totalTimeSpent = responses.reduce((sum, r) => sum + r.time_spent, 0);
    const averageTimePerQuestion = totalTimeSpent / responses.length;
    
    // Calculate accuracy by topic
    const topicAccuracy: Record<string, { correct: number; total: number }> = {};
    
    for (const response of responses) {
      const item = itemMap.get(response.item_id);
      if (!item) continue;
      
      const topic = item.topic;
      if (!topicAccuracy[topic]) {
        topicAccuracy[topic] = { correct: 0, total: 0 };
      }
      
      topicAccuracy[topic].total++;
      if (response.is_correct) {
        topicAccuracy[topic].correct++;
      }
    }
    
    // Calculate difficulty breakdown
    const difficultyBreakdown = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    
    for (const response of responses) {
      const item = itemMap.get(response.item_id);
      if (!item) continue;
      
      const difficulty = item.estimated_difficulty.toLowerCase() as keyof typeof difficultyBreakdown;
      difficultyBreakdown[difficulty].total++;
      if (response.is_correct) {
        difficultyBreakdown[difficulty].correct++;
      }
    }
    
    return {
      total_time_spent: totalTimeSpent,
      average_time_per_question: averageTimePerQuestion,
      accuracy_by_topic: Object.fromEntries(
        Object.entries(topicAccuracy).map(([topic, stats]) => [
          topic, 
          stats.total > 0 ? stats.correct / stats.total : 0
        ])
      ),
      difficulty_breakdown: difficultyBreakdown
    };
  }

  /**
   * Generate personalized feedback
   */
  private async generateFeedback(
    responses: any[], 
    itemMap: Map<string, any>, 
    areaScores: Record<string, any>
  ): Promise<{ strengths: string[]; weaknesses: string[]; recommendations: string[]; similarQuestions: string[] }> {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    const similarQuestions: string[] = [];

    // Analyze area performance
    for (const [area, score] of Object.entries(areaScores)) {
      if (score.percentage >= 70) {
        strengths.push(`${area}: Excelente desempenho (${score.percentage.toFixed(1)}%)`);
      } else if (score.percentage < 50) {
        weaknesses.push(`${area}: Precisa melhorar (${score.percentage.toFixed(1)}%)`);
        recommendations.push(`Foque nos estudos de ${this.getAreaName(area)}`);
      }
    }

    // Analyze topic performance
    const topicStats: Record<string, { correct: number; total: number }> = {};
    
    for (const response of responses) {
      const item = itemMap.get(response.item_id);
      if (!item) continue;
      
      const topic = item.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      
      topicStats[topic].total++;
      if (response.is_correct) {
        topicStats[topic].correct++;
      }
    }

    // Find weak topics and suggest similar questions
    for (const [topic, stats] of Object.entries(topicStats)) {
      if (stats.total >= 2 && stats.correct / stats.total < 0.5) {
        weaknesses.push(`${topic}: ${((stats.correct / stats.total) * 100).toFixed(1)}% de acerto`);
        
        // Find similar questions for review
        const similarItems = await this.findSimilarQuestions(topic, 3);
        similarQuestions.push(...similarItems.map(item => item.item_id));
      }
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Continue praticando para manter o bom desempenho');
    }

    return {
      strengths,
      weaknesses,
      recommendations,
      similarQuestions: Array.from(new Set(similarQuestions)) // Remove duplicates
    };
  }

  /**
   * Find similar questions for review
   */
  private async findSimilarQuestions(topic: string, limit: number): Promise<any[]> {
    return await prisma.enem_item.findMany({
      where: {
        topic: {
          contains: topic.split(' - ')[0] // Use main topic
        }
      },
      take: limit,
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  /**
   * Get area name in Portuguese
   */
  private getAreaName(area: string): string {
    const areaNames: Record<string, string> = {
      'CN': 'Ciências da Natureza',
      'CH': 'Ciências Humanas',
      'LC': 'Linguagens e Códigos',
      'MT': 'Matemática'
    };
    
    return areaNames[area] || area;
  }

  /**
   * Initialize TRI curves for different areas and years
   */
  private initializeTRICurves(): void {
    // Historical ENEM curves (simplified)
    const curves: TRICurve[] = [
      { area: 'CN', year: 2023, mean: 500, standardDeviation: 100, minScore: 300, maxScore: 950 },
      { area: 'CH', year: 2023, mean: 520, standardDeviation: 95, minScore: 300, maxScore: 950 },
      { area: 'LC', year: 2023, mean: 480, standardDeviation: 110, minScore: 300, maxScore: 950 },
      { area: 'MT', year: 2023, mean: 460, standardDeviation: 120, minScore: 300, maxScore: 950 }
    ];

    for (const curve of curves) {
      this.triCurves.set(`${curve.area}-${curve.year}`, curve);
    }
  }

  /**
   * Save score to database
   */
  async saveScore(score: EnemScore): Promise<void> {
    await prisma.enem_score.create({
      data: {
        score_id: score.score_id,
        session_id: score.session_id,
        area_scores: score.area_scores,
        total_score: score.total_score,
        tri_estimated: score.tri_estimated,
        stats: score.stats
      }
    });
  }

  /**
   * Clean up connections
   */
  async cleanup(): Promise<void> {
    await prisma.$disconnect();
  }
}
