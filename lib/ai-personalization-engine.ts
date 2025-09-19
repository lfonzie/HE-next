import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Schema para perfil de aprendizado do aluno
const LearningProfileSchema = z.object({
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  interests: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  pace: z.enum(['slow', 'normal', 'fast']),
  engagementLevel: z.number().min(1).max(10),
  preferredTopics: z.array(z.string()),
  learningGoals: z.array(z.string()),
  performanceHistory: z.array(z.object({
    topic: z.string(),
    score: z.number(),
    timeSpent: z.number(),
    attempts: z.number(),
    timestamp: z.string()
  }))
});

// Schema para exercícios adaptativos
const AdaptiveExerciseSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'open_ended', 'interactive', 'simulation']),
  difficulty: z.number().min(1).max(10),
  topic: z.string(),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string(),
  hints: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  estimatedTime: z.number(),
  personalizedElements: z.object({
    visualAids: z.boolean(),
    audioSupport: z.boolean(),
    interactiveElements: z.boolean(),
    gamification: z.boolean()
  })
});

// Schema para análise de sentimento
const SentimentAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral', 'frustrated', 'confused', 'excited']),
  confidence: z.number().min(0).max(1),
  emotions: z.array(z.string()),
  engagementLevel: z.number().min(1).max(10),
  recommendations: z.array(z.string())
});

export type LearningProfile = z.infer<typeof LearningProfileSchema>;
export type AdaptiveExercise = z.infer<typeof AdaptiveExerciseSchema>;
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>;

export class AIPersonalizationEngine {
  private model = openai('gpt-4o-mini');

  /**
   * Analisa o perfil de aprendizado do aluno baseado em interações
   */
  async analyzeLearningProfile(
    userId: string,
    interactions: any[],
    performanceData: any[]
  ): Promise<LearningProfile> {
    const prompt = `
    Analise o perfil de aprendizado do aluno baseado nas seguintes informações:
    
    Interações recentes: ${JSON.stringify(interactions.slice(-10))}
    Histórico de performance: ${JSON.stringify(performanceData.slice(-20))}
    
    Determine:
    1. Estilo de aprendizado predominante
    2. Nível de dificuldade atual
    3. Interesses e tópicos preferidos
    4. Pontos fortes e fracos
    5. Ritmo de aprendizado
    6. Nível de engajamento
    7. Metas de aprendizado
    
    Considere padrões comportamentais, tempo de resposta, taxa de acerto e feedback do aluno.
    `;

    const result = await generateObject({
      model: this.model,
      schema: LearningProfileSchema,
      prompt,
    });

    return result.object;
  }

  /**
   * Gera exercícios adaptativos personalizados
   */
  async generateAdaptiveExercises(
    learningProfile: LearningProfile,
    topic: string,
    difficultyAdjustment: number = 0
  ): Promise<AdaptiveExercise[]> {
    const prompt = `
    Gere 5 exercícios adaptativos para o tópico "${topic}" baseado no perfil de aprendizado:
    
    Perfil do aluno:
    - Estilo: ${learningProfile.learningStyle}
    - Nível: ${learningProfile.difficultyLevel}
    - Ritmo: ${learningProfile.pace}
    - Interesses: ${learningProfile.interests.join(', ')}
    - Pontos fracos: ${learningProfile.weaknesses.join(', ')}
    - Metas: ${learningProfile.learningGoals.join(', ')}
    
    Ajuste de dificuldade: ${difficultyAdjustment}
    
    Crie exercícios que:
    1. Se adaptem ao estilo de aprendizado
    2. Abordem pontos fracos identificados
    3. Mantenham o engajamento
    4. Incluam elementos visuais/auditivos conforme necessário
    5. Tenham explicações detalhadas
    6. Sejam alinhados com a BNCC
    `;

    const result = await generateObject({
      model: this.model,
      schema: z.object({
        exercises: z.array(AdaptiveExerciseSchema)
      }),
      prompt,
    });

    return result.object.exercises;
  }

  /**
   * Analisa sentimento e engajamento em tempo real
   */
  async analyzeSentiment(
    text: string,
    context: string = '',
    previousInteractions: string[] = []
  ): Promise<SentimentAnalysis> {
    const prompt = `
    Analise o sentimento e engajamento do aluno baseado na seguinte interação:
    
    Texto: "${text}"
    Contexto: "${context}"
    Interações anteriores: ${previousInteractions.slice(-3).join(' | ')}
    
    Determine:
    1. Sentimento predominante (positive, negative, neutral, frustrated, confused, excited)
    2. Nível de confiança na análise
    3. Emoções específicas identificadas
    4. Nível de engajamento (1-10)
    5. Recomendações para melhorar a experiência
    
    Considere o contexto educacional e o impacto no aprendizado.
    `;

    const result = await generateObject({
      model: this.model,
      schema: SentimentAnalysisSchema,
      prompt,
    });

    return result.object;
  }

  /**
   * Ajusta dificuldade dinamicamente baseado no desempenho
   */
  calculateDifficultyAdjustment(
    recentPerformance: number[],
    targetSuccessRate: number = 0.7
  ): number {
    if (recentPerformance.length === 0) return 0;
    
    const avgPerformance = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length;
    const adjustment = (avgPerformance - targetSuccessRate) * 2; // Ajuste mais agressivo
    
    return Math.max(-2, Math.min(2, adjustment)); // Limita entre -2 e +2
  }

  /**
   * Recomenda próximos tópicos baseado no perfil
   */
  async recommendNextTopics(
    learningProfile: LearningProfile,
    completedTopics: string[],
    curriculum: string[]
  ): Promise<string[]> {
    const prompt = `
    Recomende os próximos tópicos de estudo baseado no perfil de aprendizado:
    
    Perfil:
    - Interesses: ${learningProfile.interests.join(', ')}
    - Pontos fracos: ${learningProfile.weaknesses.join(', ')}
    - Metas: ${learningProfile.learningGoals.join(', ')}
    - Estilo: ${learningProfile.learningStyle}
    
    Tópicos já completados: ${completedTopics.join(', ')}
    Currículo disponível: ${curriculum.join(', ')}
    
    Recomende 3-5 tópicos que:
    1. Abordem pontos fracos
    2. Alinhem com interesses
    3. Contribuam para as metas
    4. Sejam apropriados para o estilo de aprendizado
    5. Tenham progressão lógica
    `;

    const result = await this.model.generate(prompt);
    const response = await result.text;
    
    // Extrai tópicos da resposta
    const topics = response.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[-•\d\.\s]+/, '').trim())
      .filter(topic => curriculum.includes(topic))
      .slice(0, 5);

    return topics;
  }

  /**
   * Cria plano de estudo personalizado
   */
  async createPersonalizedStudyPlan(
    learningProfile: LearningProfile,
    availableTime: number, // em minutos
    targetTopics: string[]
  ): Promise<{
    schedule: Array<{
      topic: string;
      duration: number;
      activities: string[];
      difficulty: number;
    }>;
    estimatedCompletion: number;
    recommendations: string[];
  }> {
    const prompt = `
    Crie um plano de estudo personalizado:
    
    Perfil:
    - Estilo: ${learningProfile.learningStyle}
    - Ritmo: ${learningProfile.pace}
    - Tempo disponível: ${availableTime} minutos
    - Tópicos: ${targetTopics.join(', ')}
    
    Crie um cronograma que:
    1. Respeite o ritmo de aprendizado
    2. Inclua atividades adequadas ao estilo
    3. Tenha intervalos apropriados
    4. Seja realista com o tempo disponível
    5. Inclua revisão e prática
    `;

    const result = await this.model.generate(prompt);
    const response = await result.text;
    
    // Parse da resposta para estrutura estruturada
    const lines = response.split('\n').filter(line => line.trim());
    const schedule = [];
    let currentTopic = '';
    let currentDuration = 0;
    let currentActivities = [];
    let currentDifficulty = 5;

    for (const line of lines) {
      if (line.includes('Tópico:') || line.includes('Topic:')) {
        if (currentTopic) {
          schedule.push({
            topic: currentTopic,
            duration: currentDuration,
            activities: currentActivities,
            difficulty: currentDifficulty
          });
        }
        currentTopic = line.split(':')[1]?.trim() || '';
        currentDuration = 0;
        currentActivities = [];
      } else if (line.includes('Duração:') || line.includes('Duration:')) {
        const durationMatch = line.match(/(\d+)/);
        currentDuration = durationMatch ? parseInt(durationMatch[1]) : 30;
      } else if (line.includes('Atividades:') || line.includes('Activities:')) {
        const activitiesText = line.split(':')[1]?.trim() || '';
        currentActivities = activitiesText.split(',').map(a => a.trim());
      }
    }

    if (currentTopic) {
      schedule.push({
        topic: currentTopic,
        duration: currentDuration,
        activities: currentActivities,
        difficulty: currentDifficulty
      });
    }

    return {
      schedule,
      estimatedCompletion: schedule.reduce((total, item) => total + item.duration, 0),
      recommendations: [
        'Faça pausas regulares a cada 25-30 minutos',
        'Revise o conteúdo no final de cada sessão',
        'Pratique exercícios adaptativos regularmente',
        'Ajuste o ritmo conforme sua energia'
      ]
    };
  }
}

// Instância singleton
export const aiPersonalizationEngine = new AIPersonalizationEngine();
