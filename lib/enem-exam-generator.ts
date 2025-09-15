import { PrismaClient } from '@prisma/client';
import { EnemItem, EnemMode, EnemArea, EnemDifficulty } from '@/types/enem';
import { enemLocalDB, AREA_MAPPING } from '@/lib/enem-local-database';

const prisma = new PrismaClient();

export interface ExamConfig {
  mode: EnemMode;
  areas: EnemArea[];
  numQuestions: number;
  timeLimit?: number; // in minutes
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  year?: number;
  randomSeed?: string;
}

export interface ExamGenerationResult {
  items: EnemItem[];
  config: ExamConfig;
  metadata: {
    estimatedDuration: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
    areaBreakdown: Record<string, number>;
  };
}

export class EnemExamGenerator {
  /**
   * Generate exam based on mode and configuration
   */
  async generateExam(config: ExamConfig): Promise<ExamGenerationResult> {
    console.log('EnemExamGenerator.generateExam called with:', config);
    
    try {
      let result: ExamGenerationResult;
      
      switch (config.mode) {
        case 'QUICK':
          result = await this.generateQuickExam(config);
          break;
        case 'CUSTOM':
          result = await this.generateCustomExam(config);
          break;
        case 'OFFICIAL':
          result = await this.generateOfficialExam(config);
          break;
        case 'ADAPTIVE':
          result = await this.generateAdaptiveExam(config);
          break;
        default:
          throw new Error(`Unsupported exam mode: ${config.mode}`);
      }
      
      console.log('Exam generation successful:', {
        itemsCount: result.items.length,
        mode: config.mode
      });
      
      return result;
    } catch (error) {
      console.error('Error in generateExam:', error);
      throw error;
    }
  }

  /**
   * Quick Mode: 15 mixed-area questions, balanced difficulty
   */
  private async generateQuickExam(config: ExamConfig): Promise<ExamGenerationResult> {
    const quickConfig = {
      ...config,
      numQuestions: config.numQuestions || 15,
      timeLimit: config.timeLimit || 30,
      areas: config.areas || ['CN', 'CH', 'LC', 'MT'] as EnemArea[],
      difficultyDistribution: config.difficultyDistribution || { easy: 5, medium: 7, hard: 3 }
    };

    const items = await this.selectItemsByDistribution(quickConfig);
    
    return {
      items,
      config: quickConfig,
      metadata: {
        estimatedDuration: 30,
        difficultyBreakdown: { easy: 5, medium: 7, hard: 3 },
        areaBreakdown: this.calculateAreaBreakdown(items)
      }
    };
  }

  /**
   * Custom Mode: User-defined configuration
   */
  private async generateCustomExam(config: ExamConfig): Promise<ExamGenerationResult> {
    const items = await this.selectItemsByDistribution(config);
    
    return {
      items,
      config,
      metadata: {
        estimatedDuration: config.timeLimit || this.estimateDuration(config.numQuestions),
        difficultyBreakdown: config.difficultyDistribution || this.getDefaultDifficultyDistribution(config.numQuestions),
        areaBreakdown: this.calculateAreaBreakdown(items)
      }
    };
  }

  /**
   * Official Mode: Replicate full ENEM exam booklet by year
   */
  private async generateOfficialExam(config: ExamConfig): Promise<ExamGenerationResult> {
    // Use current year as default if not specified
    const year = config.year || new Date().getFullYear();
    
    try {
      const items = await this.selectOfficialExamItems(year, config.areas);
      
      return {
        items,
        config: {
          ...config,
          numQuestions: items.length,
          timeLimit: this.getOfficialTimeLimit(items.length)
        },
        metadata: {
          estimatedDuration: this.getOfficialTimeLimit(items.length),
          difficultyBreakdown: this.calculateDifficultyBreakdown(items),
          areaBreakdown: this.calculateAreaBreakdown(items)
        }
      };
    } catch (error) {
      console.warn('Database unavailable for official exam, falling back to local database:', error);
      
      // Fallback to local database for official exam
      if (enemLocalDB.isAvailable()) {
        const localQuestions = await enemLocalDB.getQuestionsByYear(year, {
          limit: config.numQuestions,
          random: true
        });
        
        const items = localQuestions.slice(0, config.numQuestions).map(question => 
          enemLocalDB.convertToSimulatorFormat(question)
        );
        
        return {
          items,
          config: {
            ...config,
            numQuestions: items.length,
            timeLimit: this.getOfficialTimeLimit(items.length)
          },
          metadata: {
            estimatedDuration: this.getOfficialTimeLimit(items.length),
            difficultyBreakdown: this.calculateDifficultyBreakdown(items),
            areaBreakdown: this.calculateAreaBreakdown(items)
          }
        };
      } else {
        // If local DB is also unavailable, generate sample questions
        const items = this.generateSampleQuestions(config.areas, 'MEDIUM', config.numQuestions);
        
        return {
          items,
          config: {
            ...config,
            numQuestions: items.length,
            timeLimit: this.getOfficialTimeLimit(items.length)
          },
          metadata: {
            estimatedDuration: this.getOfficialTimeLimit(items.length),
            difficultyBreakdown: this.calculateDifficultyBreakdown(items),
            areaBreakdown: this.calculateAreaBreakdown(items)
          }
        };
      }
    }
  }

  /**
   * Adaptive Mode: Three sequential blocks (easy → medium → hard)
   */
  private async generateAdaptiveExam(config: ExamConfig): Promise<ExamGenerationResult> {
    const blockSize = Math.floor(config.numQuestions / 3);
    const remainingQuestions = config.numQuestions - (blockSize * 3);
    
    const easyItems = await this.selectItemsByDifficulty(config.areas, 'EASY', blockSize + (remainingQuestions > 0 ? 1 : 0));
    const mediumItems = await this.selectItemsByDifficulty(config.areas, 'MEDIUM', blockSize + (remainingQuestions > 1 ? 1 : 0));
    const hardItems = await this.selectItemsByDifficulty(config.areas, 'HARD', blockSize);

    const items = [...easyItems, ...mediumItems, ...hardItems];
    
    return {
      items,
      config,
      metadata: {
        estimatedDuration: config.timeLimit || this.estimateDuration(config.numQuestions),
        difficultyBreakdown: this.calculateDifficultyBreakdown(items),
        areaBreakdown: this.calculateAreaBreakdown(items)
      }
    };
  }

  /**
   * Select items based on difficulty distribution
   */
  private async selectItemsByDistribution(config: ExamConfig): Promise<EnemItem[]> {
    const distribution = config.difficultyDistribution || this.getDefaultDifficultyDistribution(config.numQuestions);
    const items: EnemItem[] = [];

    // Select easy items
    if (distribution.easy > 0) {
      const easyItems = await this.selectItemsByDifficulty(config.areas, 'EASY', distribution.easy);
      items.push(...easyItems);
    }

    // Select medium items
    if (distribution.medium > 0) {
      const mediumItems = await this.selectItemsByDifficulty(config.areas, 'MEDIUM', distribution.medium);
      items.push(...mediumItems);
    }

    // Select hard items
    if (distribution.hard > 0) {
      const hardItems = await this.selectItemsByDifficulty(config.areas, 'HARD', distribution.hard);
      items.push(...hardItems);
    }

    // Shuffle items to randomize order
    return this.shuffleArray(items, config.randomSeed);
  }

  /**
   * Select items by difficulty level
   */
  private async selectItemsByDifficulty(
    areas: EnemArea[], 
    difficulty: EnemDifficulty, 
    count: number
  ): Promise<EnemItem[]> {
    try {
      // Try to use the main database first
      const items = await prisma.enem_item.findMany({
        where: {
          area: { in: areas },
          estimated_difficulty: difficulty
        },
        take: count * 2, // Get more than needed to ensure variety
        orderBy: {
          created_at: 'desc'
        }
      });

      // Shuffle and take the requested count
      const shuffled = this.shuffleArray(items);
      return shuffled.slice(0, count).map(this.mapPrismaToEnemItem);
    } catch (error) {
      console.warn('Database unavailable, falling back to local database:', error);
      
      // Fallback to local database
      if (enemLocalDB.isAvailable()) {
        return this.selectItemsFromLocalDB(areas, difficulty, count);
      } else {
        // If local DB is also unavailable, return sample questions
        return this.generateSampleQuestions(areas, difficulty, count);
      }
    }
  }

  /**
   * Select items from local database as fallback
   */
  private async selectItemsFromLocalDB(
    areas: EnemArea[], 
    difficulty: EnemDifficulty, 
    count: number
  ): Promise<EnemItem[]> {
    try {
      // Map areas to local database format
      const localAreas = areas.map(area => AREA_MAPPING[area] || area);
      
      // Get questions from local database
      const localQuestions = await enemLocalDB.getQuestions({
        discipline: localAreas[0], // Use first area for now
        limit: count * 2,
        random: true
      });

      // Convert to EnemItem format
      const items = localQuestions.slice(0, count).map(question => 
        enemLocalDB.convertToSimulatorFormat(question)
      );

      // If no questions found, generate sample questions
      if (items.length === 0) {
        console.log('No questions found in local database, generating sample questions');
        return this.generateSampleQuestions(areas, difficulty, count);
      }

      return items;
    } catch (error) {
      console.error('Error accessing local database:', error);
      return this.generateSampleQuestions(areas, difficulty, count);
    }
  }

  /**
   * Generate sample questions when both databases are unavailable
   */
  private generateSampleQuestions(
    areas: EnemArea[], 
    difficulty: EnemDifficulty, 
    count: number
  ): EnemItem[] {
    const sampleQuestions: EnemItem[] = [];
    
    for (let i = 0; i < count; i++) {
      const area = areas[i % areas.length];
      sampleQuestions.push({
        id: `sample_${difficulty}_${i}`,
        subject: this.getAreaSubject(area),
        area: area,
        difficulty: difficulty,
        year: 2023,
        question: `Esta é uma questão de exemplo de ${this.getAreaSubject(area)} (${difficulty}).`,
        options: [
          'Alternativa A',
          'Alternativa B', 
          'Alternativa C',
          'Alternativa D',
          'Alternativa E'
        ],
        correctAnswer: 0,
        explanation: 'Esta é uma questão de exemplo para demonstração.',
        topics: [area],
        competencies: [area],
        files: [],
        source: 'sample'
      });
    }
    
    return sampleQuestions;
  }

  /**
   * Get subject name from area
   */
  private getAreaSubject(area: EnemArea): string {
    const subjects = {
      'linguagens': 'Linguagens, Códigos e suas Tecnologias',
      'ciencias-humanas': 'Ciências Humanas e suas Tecnologias', 
      'ciencias-natureza': 'Ciências da Natureza e suas Tecnologias',
      'matematica': 'Matemática e suas Tecnologias'
    };
    return subjects[area] || area;
  }

  /**
   * Select official exam items by year
   */
  private async selectOfficialExamItems(year: number, areas: EnemArea[]): Promise<EnemItem[]> {
    try {
      const items = await prisma.enem_item.findMany({
        where: {
          year,
          area: { in: areas }
        },
        orderBy: {
          item_id: 'asc' // Maintain original order
        }
      });

      return items.map(this.mapPrismaToEnemItem);
    } catch (error) {
      console.warn('Database unavailable for official exam items, falling back to local database:', error);
      
      // Fallback to local database
      if (enemLocalDB.isAvailable()) {
        const localQuestions = await enemLocalDB.getQuestionsByYear(year, {
          random: false // Maintain order for official exam
        });
        
        return localQuestions.map(question => 
          enemLocalDB.convertToSimulatorFormat(question)
        );
      } else {
        // If local DB is also unavailable, generate sample questions
        return this.generateSampleQuestions(areas, 'MEDIUM', 45); // Default ENEM size
      }
    }
  }

  /**
   * Get default difficulty distribution
   */
  private getDefaultDifficultyDistribution(numQuestions: number): { easy: number; medium: number; hard: number } {
    const easy = Math.floor(numQuestions * 0.3);
    const medium = Math.floor(numQuestions * 0.5);
    const hard = numQuestions - easy - medium;
    
    return { easy, medium, hard };
  }

  /**
   * Estimate exam duration based on number of questions
   */
  private estimateDuration(numQuestions: number): number {
    // ENEM standard: ~3.3 minutes per question
    return Math.ceil(numQuestions * 3.3);
  }

  /**
   * Get official time limit for exam length
   */
  private getOfficialTimeLimit(numQuestions: number): number {
    if (numQuestions <= 15) return 30;
    if (numQuestions <= 30) return 60;
    if (numQuestions <= 45) return 90;
    return 150; // Full ENEM length
  }

  /**
   * Calculate area breakdown from items
   */
  private calculateAreaBreakdown(items: EnemItem[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    for (const item of items) {
      breakdown[item.area] = (breakdown[item.area] || 0) + 1;
    }
    
    return breakdown;
  }

  /**
   * Calculate difficulty breakdown from items
   */
  private calculateDifficultyBreakdown(items: EnemItem[]): { easy: number; medium: number; hard: number } {
    const breakdown = { easy: 0, medium: 0, hard: 0 };
    
    for (const item of items) {
      breakdown[item.estimated_difficulty.toLowerCase() as keyof typeof breakdown]++;
    }
    
    return breakdown;
  }

  /**
   * Shuffle array with optional seed for reproducibility
   */
  private shuffleArray<T>(array: T[], seed?: string): T[] {
    const shuffled = [...array];
    
    if (seed) {
      // Use seed for reproducible shuffling
      const random = this.seededRandom(seed);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } else {
      // Standard Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    
    return shuffled;
  }

  /**
   * Seeded random number generator
   */
  private seededRandom(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return () => {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280;
    };
  }

  /**
   * Map Prisma model to EnemItem interface
   */
  private mapPrismaToEnemItem(item: any): EnemItem {
    return {
      item_id: item.item_id,
      year: item.year,
      area: item.area,
      text: item.text,
      alternatives: item.alternatives,
      correct_answer: item.correct_answer,
      topic: item.topic,
      estimated_difficulty: item.estimated_difficulty,
      asset_refs: item.asset_refs,
      content_hash: item.content_hash,
      dataset_version: item.dataset_version,
      metadata: item.metadata
    };
  }

  /**
   * Get available exam templates
   */
  async getExamTemplates(): Promise<Array<{ template_id: string; name: string; metadata: any }>> {
    const templates = await prisma.enem_exam_template.findMany({
      select: {
        template_id: true,
        name: true,
        metadata: true
      }
    });

    return templates;
  }

  /**
   * Create exam template
   */
  async createExamTemplate(name: string, items: string[], metadata?: any): Promise<string> {
    const template = await prisma.enem_exam_template.create({
      data: {
        name,
        items,
        metadata: metadata || {}
      }
    });

    return template.template_id;
  }

  /**
   * Clean up connections
   */
  async cleanup(): Promise<void> {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.warn('Prisma disconnect failed:', error);
    }
  }
}
