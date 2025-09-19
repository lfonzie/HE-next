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
   * Format text with markdown and proper line breaks
   */
  private formatTextWithMarkdown(text: string): string {
    if (!text) return text;
    
    // Remove extra whitespace and normalize line breaks
    let formatted = text.trim();
    
    // Add line breaks after periods, question marks, and exclamation marks
    formatted = formatted.replace(/([.!?])\s+/g, '$1\n\n');
    
    // Add line breaks before numbered lists (1., 2., etc.)
    formatted = formatted.replace(/(\d+\.\s)/g, '\n$1');
    
    // Add line breaks before lettered lists (a), b), etc.)
    formatted = formatted.replace(/([a-e]\)\s)/g, '\n$1');
    
    // Add line breaks before alternatives (A), B), C), D), E))
    formatted = formatted.replace(/([A-E]\)\s)/g, '\n\n$1');
    
    // Clean up multiple line breaks
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Add markdown formatting for emphasis
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '**$1**');
    formatted = formatted.replace(/\*(.*?)\*/g, '*$1*');
    
    return formatted.trim();
  }

  /**
   * Check if text contains image references or URLs
   */
  private hasImageReferences(text: string): boolean {
    if (!text) return false;
    
    const imagePatterns = [
      /\.png\b/i,
      /\.jpg\b/i,
      /\.jpeg\b/i,
      /\.gif\b/i,
      /\.bmp\b/i,
      /\.webp\b/i,
      /\.svg\b/i,
      /imagem\s*[0-9]*/i,
      /figura\s*[0-9]*/i,
      /gráfico\s*[0-9]*/i,
      /ilustração\s*[0-9]*/i,
      /desenho\s*[0-9]*/i,
      /diagrama\s*[0-9]*/i,
      /esquema\s*[0-9]*/i,
      /tabela\s*[0-9]*/i,
      /quadro\s*[0-9]*/i,
      /mapa\s*[0-9]*/i,
      /foto\s*[0-9]*/i,
      /imagem\s*acima/i,
      /figura\s*acima/i,
      /gráfico\s*acima/i,
      /ilustração\s*acima/i,
      /desenho\s*acima/i,
      /diagrama\s*acima/i,
      /esquema\s*acima/i,
      /tabela\s*acima/i,
      /quadro\s*acima/i,
      /mapa\s*acima/i,
      /foto\s*acima/i,
      /imagem\s*abaixo/i,
      /figura\s*abaixo/i,
      /gráfico\s*abaixo/i,
      /ilustração\s*abaixo/i,
      /desenho\s*abaixo/i,
      /diagrama\s*abaixo/i,
      /esquema\s*abaixo/i,
      /tabela\s*abaixo/i,
      /quadro\s*abaixo/i,
      /mapa\s*abaixo/i,
      /foto\s*abaixo/i
    ];
    
    return imagePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Determine question source and add metadata
   */
  private addSourceMetadata(item: EnemItem, source: 'DATABASE' | 'LOCAL_DATABASE' | 'AI'): EnemItem {
    const isOfficialEnem = source === 'DATABASE' || source === 'LOCAL_DATABASE';
    const hasImage = this.hasImageReferences(item.text) || (item.asset_refs && item.asset_refs.length > 0);
    
    return {
      ...item,
      text: this.formatTextWithMarkdown(item.text),
      alternatives: {
        A: this.formatTextWithMarkdown(item.alternatives.A),
        B: this.formatTextWithMarkdown(item.alternatives.B),
        C: this.formatTextWithMarkdown(item.alternatives.C),
        D: this.formatTextWithMarkdown(item.alternatives.D),
        E: this.formatTextWithMarkdown(item.alternatives.E)
      },
      metadata: {
        ...item.metadata,
        source: source,
        is_official_enem: isOfficialEnem,
        is_ai_generated: source === 'AI',
        has_image: hasImage,
        original_year: item.year,
        formatted_at: new Date().toISOString()
      }
    };
  }

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
        // If local DB is also unavailable, throw error instead of using AI
        throw new Error('Nenhuma questão real do ENEM disponível. Apenas questões oficiais são permitidas.');
      }
    }
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
      
      // Try to use the main database first, filtering out questions with images
      const items = await prisma.enem_item.findMany({
        where: {
          area: { in: areas },
          estimated_difficulty: difficulty,
          // Exclude questions with images/attachments
          AND: [
            {
              OR: [
                { asset_refs: { equals: [] } },
                { asset_refs: { equals: null } },
                { asset_refs: { isEmpty: true } }
              ]
            }
          ]
        },
        take: count * 5, // Get more than needed to ensure variety and filtering
        orderBy: {
          created_at: 'desc'
        }
      });

      // Filter out questions with image references in text
      const filteredItems = items.filter(item => {
        const hasImageInText = this.hasImageReferences(item.text);
        const hasImageInAlternatives = Object.values(item.alternatives as Record<string, string>).some(alt => 
          this.hasImageReferences(alt)
        );
        return !hasImageInText && !hasImageInAlternatives;
      });

      // If main database has filtered items, use them
      if (filteredItems.length > 0) {
        const shuffled = this.shuffleArray(filteredItems);
        const result = shuffled.slice(0, count).map(item => 
          this.addSourceMetadata(this.mapPrismaToEnemItem(item), 'DATABASE')
        );
        return result;
      } else {
        
        // Fallback to local database
        if (enemLocalDB.isAvailable()) {
          return this.selectItemsFromLocalDB(areas, difficulty, count);
        } else {
          // Não usar IA - apenas questões reais do ENEM
          throw new Error('Nenhuma questão real do ENEM disponível. Verifique a conexão com o banco de dados.');
        }
      }
    } catch (error) {
      console.warn('Database unavailable, falling back to local database:', error);
      
      // Fallback to local database
      if (enemLocalDB.isAvailable()) {
        return this.selectItemsFromLocalDB(areas, difficulty, count);
      } else {
        // Não usar IA - apenas questões reais do ENEM
        throw new Error('Nenhuma questão real do ENEM disponível. Verifique a conexão com o banco de dados.');
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
      
      // NOVA OTIMIZAÇÃO: Inicializa validação prévia para melhor performance
      console.log(`🔍 Inicializando validação prévia para áreas: ${localAreas.join(', ')}`);
      
      // Faz validação prévia para anos recentes (2020-2023)
      const recentYears = [2020, 2021, 2022, 2023];
      for (const year of recentYears) {
        for (const area of localAreas) {
          try {
            await enemLocalDB.preValidateQuestions(year, area);
          } catch (error) {
            console.warn(`⚠️ Erro na validação prévia para ${year} ${area}:`, error);
          }
        }
      }
      
      // Get questions from all areas
      const allQuestions = [];
      const questionsPerArea = Math.ceil(count * 2 / areas.length); // Get more to filter
      
      for (const area of localAreas) {
        try {
          const areaQuestions = await enemLocalDB.getQuestions({
            discipline: area,
            limit: questionsPerArea,
            random: true
          });
          
          
      // Convert to EnemItem format and filter out questions with images
      const convertedQuestions = areaQuestions
        .map(question => {
          const converted = enemLocalDB.convertToSimulatorFormat(question);
          if (converted) {
            // Check for image references in text and alternatives
            const hasImageInText = this.hasImageReferences(converted.text);
            const hasImageInAlternatives = Object.values(converted.alternatives as Record<string, string>).some(alt => 
              this.hasImageReferences(alt)
            );
            
            // Only include questions without images
            if (!hasImageInText && !hasImageInAlternatives) {
              return this.addSourceMetadata(converted, 'LOCAL_DATABASE');
            }
          }
          return null;
        })
        .filter(question => question !== null && question !== undefined);
      
      allQuestions.push(...convertedQuestions);
        } catch (error) {
          console.warn(`Error getting questions for area ${area}:`, error);
        }
      }

      
      // Shuffle and take the requested count
      const shuffled = this.shuffleArray(allQuestions);
      const selectedItems = shuffled.slice(0, count);

      // If no questions found, throw error instead of using AI
      if (selectedItems.length === 0) {
        throw new Error('Nenhuma questão real do ENEM encontrada no banco local. Verifique a disponibilidade das questões.');
      }

      return selectedItems;
    } catch (error) {
      console.error('Error accessing local database:', error);
      throw new Error('Erro ao acessar banco local do ENEM. Apenas questões reais são permitidas.');
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
      const baseQuestion = {
        item_id: `ai_generated_${difficulty}_${i}`,
        area: area,
        year: new Date().getFullYear(),
        text: `Esta é uma questão de exemplo de **${this.getAreaSubject(area)}** (${difficulty}).

Considere as seguintes informações para responder à questão:

* Informação importante 1
* Informação importante 2
* Informação importante 3

Qual das alternativas abaixo representa a resposta correta?`,
        alternatives: {
          A: '**Alternativa A** - Esta é a primeira opção disponível.',
          B: '**Alternativa B** - Esta é a segunda opção disponível.',
          C: '**Alternativa C** - Esta é a terceira opção disponível.',
          D: '**Alternativa D** - Esta é a quarta opção disponível.',
          E: '**Alternativa E** - Esta é a quinta opção disponível.'
        },
        correct_answer: 'A' as 'A' | 'B' | 'C' | 'D' | 'E',
        topic: 'Tópico de exemplo',
        estimated_difficulty: difficulty,
        asset_refs: [],
        content_hash: `hash_${i}`,
        dataset_version: '1.0',
        metadata: {
          source: 'AI' as const,
          generated_at: new Date().toISOString(),
          has_image: false
        }
      };
      
      sampleQuestions.push(this.addSourceMetadata(baseQuestion, 'AI'));
    }
    
    return sampleQuestions;
  }

  /**
   * Get subject name from area
   */
  private getAreaSubject(area: EnemArea): string {
    const subjects = {
      'CN': 'Ciências da Natureza e suas Tecnologias',
      'CH': 'Ciências Humanas e suas Tecnologias',
      'LC': 'Linguagens, Códigos e suas Tecnologias',
      'MT': 'Matemática e suas Tecnologias',
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
          area: { in: areas },
          // Exclude questions with images/attachments
          AND: [
            {
              OR: [
                { asset_refs: { equals: [] } },
                { asset_refs: { equals: null } },
                { asset_refs: { isEmpty: true } }
              ]
            }
          ]
        },
        orderBy: {
          item_id: 'asc' // Maintain original order
        }
      });

      // Filter out questions with image references in text
      const filteredItems = items.filter(item => {
        const hasImageInText = this.hasImageReferences(item.text);
        const hasImageInAlternatives = Object.values(item.alternatives as Record<string, string>).some(alt => 
          this.hasImageReferences(alt)
        );
        return !hasImageInText && !hasImageInAlternatives;
      });

      return filteredItems.map(item => 
        this.addSourceMetadata(this.mapPrismaToEnemItem(item), 'DATABASE')
      );
    } catch (error) {
      console.warn('Database unavailable for official exam items, falling back to local database:', error);
      
      // Fallback to local database
      if (enemLocalDB.isAvailable()) {
        const localQuestions = await enemLocalDB.getQuestionsByYear(year, {
          random: false // Maintain order for official exam
        });
        
        // Filter and format local questions
        const filteredQuestions = localQuestions
          .map(question => {
            const converted = enemLocalDB.convertToSimulatorFormat(question);
            if (converted) {
              const hasImageInText = this.hasImageReferences(converted.text);
              const hasImageInAlternatives = Object.values(converted.alternatives as Record<string, string>).some(alt => 
                this.hasImageReferences(alt)
              );
              
              if (!hasImageInText && !hasImageInAlternatives) {
                return this.addSourceMetadata(converted, 'LOCAL_DATABASE');
              }
            }
            return null;
          })
          .filter(question => question !== null);
        
        return filteredQuestions;
      } else {
        // If local DB is also unavailable, throw error instead of using AI
        throw new Error('Nenhuma questão real do ENEM disponível para o modo oficial. Apenas questões oficiais são permitidas.');
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
      if (item && item.area) {
        breakdown[item.area] = (breakdown[item.area] || 0) + 1;
      }
    }
    
    return breakdown;
  }

  /**
   * Calculate difficulty breakdown from items
   */
  private calculateDifficultyBreakdown(items: EnemItem[]): { easy: number; medium: number; hard: number } {
    const breakdown = { easy: 0, medium: 0, hard: 0 };
    
    for (const item of items) {
      if (item && item.estimated_difficulty) {
        const difficulty = item.estimated_difficulty.toLowerCase() as keyof typeof breakdown;
        if (difficulty in breakdown) {
          breakdown[difficulty]++;
        }
      }
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
      metadata: {
        ...item.metadata,
        original_year: item.year
      }
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
