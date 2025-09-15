import { Question, UserAnswer, SimulationStats } from '@/lib/stores/enem-simulation-store';

export interface AssessmentResult {
  overall: OverallScore;
  difficulty: DifficultyBreakdown;
  skills: SkillBreakdown;
  time: TimeAnalysis;
  recommendations: Recommendation[];
  trends: PerformanceTrend[];
}

export interface OverallScore {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  accuracy: number;
  score: number;
  percentile: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface DifficultyBreakdown {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
}

export interface DifficultyStats {
  total: number;
  correct: number;
  accuracy: number;
  averageTime: number;
  percentile: number;
}

export interface SkillBreakdown {
  [skill: string]: SkillStats;
}

export interface SkillStats {
  total: number;
  correct: number;
  accuracy: number;
  averageTime: number;
  strength: 'weak' | 'average' | 'strong';
  trend: 'improving' | 'stable' | 'declining';
}

export interface TimeAnalysis {
  totalTime: number;
  averageTimePerQuestion: number;
  timeDistribution: {
    fast: number; // < 60s
    normal: number; // 60-120s
    slow: number; // > 120s
  };
  efficiency: number; // questions per minute
  recommendations: string[];
}

export interface Recommendation {
  type: 'study' | 'practice' | 'time' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  resources?: string[];
}

export interface PerformanceTrend {
  metric: string;
  current: number;
  previous?: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
}

export class EnemAssessmentEngine {
  private readonly ENEM_SCORING_WEIGHTS = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0
  };

  private readonly GRADE_THRESHOLDS = {
    A: 85,
    B: 75,
    C: 65,
    D: 55,
    F: 0
  };

  private readonly TIME_THRESHOLDS = {
    fast: 60,
    slow: 120
  };

  async assessPerformance(
    questions: Question[],
    answers: Map<string, UserAnswer>,
    timeSpent: number,
    previousStats?: SimulationStats
  ): Promise<AssessmentResult> {
    const overall = this.calculateOverallScore(questions, answers);
    const difficulty = this.calculateDifficultyBreakdown(questions, answers);
    const skills = this.calculateSkillBreakdown(questions, answers);
    const time = this.calculateTimeAnalysis(questions, answers, timeSpent);
    const recommendations = this.generateRecommendations(overall, difficulty, skills, time);
    const trends = this.calculateTrends(overall, previousStats);

    return {
      overall,
      difficulty,
      skills,
      time,
      recommendations,
      trends
    };
  }

  private calculateOverallScore(questions: Question[], answers: Map<string, UserAnswer>): OverallScore {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedAnswers = 0;
    let weightedScore = 0;
    let totalWeight = 0;

    questions.forEach(question => {
      const answer = answers.get(question.id);
      const weight = this.ENEM_SCORING_WEIGHTS[question.difficulty.toLowerCase() as keyof typeof this.ENEM_SCORING_WEIGHTS];
      
      totalWeight += weight;

      if (answer) {
        if (answer.answer === question.correct) {
          correctAnswers++;
          weightedScore += weight;
        } else {
          incorrectAnswers++;
        }
      } else {
        skippedAnswers++;
      }
    });

    const accuracy = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    const score = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    const percentile = this.calculatePercentile(score);
    const grade = this.calculateGrade(score);

    return {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers,
      skippedAnswers,
      accuracy,
      score,
      percentile,
      grade
    };
  }

  private calculateDifficultyBreakdown(questions: Question[], answers: Map<string, UserAnswer>): DifficultyBreakdown {
    const breakdown: DifficultyBreakdown = {
      easy: { total: 0, correct: 0, accuracy: 0, averageTime: 0, percentile: 0 },
      medium: { total: 0, correct: 0, accuracy: 0, averageTime: 0, percentile: 0 },
      hard: { total: 0, correct: 0, accuracy: 0, averageTime: 0, percentile: 0 }
    };

    const timeByDifficulty: Record<string, number[]> = {
      easy: [],
      medium: [],
      hard: []
    };

    questions.forEach(question => {
      const difficulty = question.difficulty.toLowerCase() as keyof DifficultyBreakdown;
      const answer = answers.get(question.id);
      
      breakdown[difficulty].total++;
      
      if (answer) {
        if (answer.answer === question.correct) {
          breakdown[difficulty].correct++;
        }
        timeByDifficulty[difficulty].push(answer.timeSpent);
      }
    });

    // Calculate accuracy and average time for each difficulty
    Object.keys(breakdown).forEach(difficulty => {
      const stats = breakdown[difficulty as keyof DifficultyBreakdown];
      stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      stats.averageTime = timeByDifficulty[difficulty].length > 0 
        ? timeByDifficulty[difficulty].reduce((sum, time) => sum + time, 0) / timeByDifficulty[difficulty].length
        : 0;
      stats.percentile = this.calculatePercentile(stats.accuracy);
    });

    return breakdown;
  }

  private calculateSkillBreakdown(questions: Question[], answers: Map<string, UserAnswer>): SkillBreakdown {
    const skillStats: Record<string, { total: number; correct: number; times: number[] }> = {};

    questions.forEach(question => {
      question.skill_tag.forEach(skill => {
        if (!skillStats[skill]) {
          skillStats[skill] = { total: 0, correct: 0, times: [] };
        }

        const answer = answers.get(question.id);
        skillStats[skill].total++;
        
        if (answer) {
          if (answer.answer === question.correct) {
            skillStats[skill].correct++;
          }
          skillStats[skill].times.push(answer.timeSpent);
        }
      });
    });

    const breakdown: SkillBreakdown = {};
    
    Object.entries(skillStats).forEach(([skill, stats]) => {
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      const averageTime = stats.times.length > 0 
        ? stats.times.reduce((sum, time) => sum + time, 0) / stats.times.length
        : 0;

      breakdown[skill] = {
        total: stats.total,
        correct: stats.correct,
        accuracy,
        averageTime,
        strength: this.categorizeStrength(accuracy),
        trend: 'stable' // Would need historical data to calculate trend
      };
    });

    return breakdown;
  }

  private calculateTimeAnalysis(questions: Question[], answers: Map<string, UserAnswer>, totalTime: number): TimeAnalysis {
    const times = Array.from(answers.values()).map(answer => answer.timeSpent);
    const averageTimePerQuestion = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
    
    const timeDistribution = {
      fast: times.filter(time => time < this.TIME_THRESHOLDS.fast).length,
      normal: times.filter(time => time >= this.TIME_THRESHOLDS.fast && time <= this.TIME_THRESHOLDS.slow).length,
      slow: times.filter(time => time > this.TIME_THRESHOLDS.slow).length
    };

    const efficiency = totalTime > 0 ? (answers.size / totalTime) * 60 : 0; // questions per minute

    const recommendations: string[] = [];
    if (timeDistribution.slow > timeDistribution.fast) {
      recommendations.push('Você está gastando muito tempo em algumas questões. Pratique para aumentar a velocidade.');
    }
    if (efficiency < 0.5) {
      recommendations.push('Considere melhorar sua eficiência geral. Pratique com cronômetro.');
    }

    return {
      totalTime,
      averageTimePerQuestion,
      timeDistribution,
      efficiency,
      recommendations
    };
  }

  private generateRecommendations(
    overall: OverallScore,
    difficulty: DifficultyBreakdown,
    skills: SkillBreakdown,
    time: TimeAnalysis
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Overall performance recommendations
    if (overall.accuracy < 70) {
      recommendations.push({
        type: 'study',
        priority: 'high',
        title: 'Foque no Aprendizado Fundamental',
        description: 'Sua precisão geral está abaixo do ideal. Recomendamos revisar os conceitos básicos.',
        actionItems: [
          'Revise os conceitos fundamentais da área',
          'Pratique com questões mais fáceis primeiro',
          'Estude a teoria antes de praticar'
        ],
        resources: ['Livros didáticos', 'Videoaulas', 'Resumos']
      });
    }

    // Difficulty-specific recommendations
    if (difficulty.hard.accuracy < 50) {
      recommendations.push({
        type: 'practice',
        priority: 'medium',
        title: 'Melhore em Questões Difíceis',
        description: 'Você tem dificuldade com questões de nível avançado.',
        actionItems: [
          'Pratique mais questões difíceis',
          'Analise os erros em detalhes',
          'Busque explicações adicionais'
        ]
      });
    }

    // Skill-specific recommendations
    const weakSkills = Object.entries(skills)
      .filter(([_, stats]) => stats.strength === 'weak')
      .slice(0, 3);

    if (weakSkills.length > 0) {
      recommendations.push({
        type: 'study',
        priority: 'high',
        title: 'Áreas que Precisam de Atenção',
        description: `Foque especialmente em: ${weakSkills.map(([skill]) => skill).join(', ')}`,
        actionItems: [
          'Dedique tempo extra para essas áreas',
          'Pratique exercícios específicos',
          'Busque material de estudo focado'
        ]
      });
    }

    // Time management recommendations
    if (time.efficiency < 0.5) {
      recommendations.push({
        type: 'time',
        priority: 'medium',
        title: 'Melhore sua Gestão de Tempo',
        description: 'Você está gastando muito tempo por questão.',
        actionItems: [
          'Pratique com cronômetro',
          'Aprenda a identificar questões que podem ser puladas',
          'Desenvolva estratégias de resolução rápida'
        ]
      });
    }

    return recommendations;
  }

  private calculateTrends(current: OverallScore, previous?: SimulationStats): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];

    if (previous) {
      trends.push({
        metric: 'Precisão',
        current: current.accuracy,
        previous: previous.accuracy,
        change: current.accuracy - previous.accuracy,
        direction: current.accuracy > previous.accuracy ? 'up' : 
                   current.accuracy < previous.accuracy ? 'down' : 'stable'
      });

      trends.push({
        metric: 'Questões Corretas',
        current: current.correctAnswers,
        previous: previous.correctAnswers,
        change: current.correctAnswers - previous.correctAnswers,
        direction: current.correctAnswers > previous.correctAnswers ? 'up' : 
                   current.correctAnswers < previous.correctAnswers ? 'down' : 'stable'
      });
    }

    return trends;
  }

  private calculatePercentile(score: number): number {
    // Simplified percentile calculation based on ENEM scoring patterns
    if (score >= 90) return 95;
    if (score >= 80) return 85;
    if (score >= 70) return 70;
    if (score >= 60) return 50;
    if (score >= 50) return 30;
    return 15;
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= this.GRADE_THRESHOLDS.A) return 'A';
    if (score >= this.GRADE_THRESHOLDS.B) return 'B';
    if (score >= this.GRADE_THRESHOLDS.C) return 'C';
    if (score >= this.GRADE_THRESHOLDS.D) return 'D';
    return 'F';
  }

  private categorizeStrength(accuracy: number): 'weak' | 'average' | 'strong' {
    if (accuracy >= 80) return 'strong';
    if (accuracy >= 60) return 'average';
    return 'weak';
  }
}

// Singleton instance
export const assessmentEngine = new EnemAssessmentEngine();
