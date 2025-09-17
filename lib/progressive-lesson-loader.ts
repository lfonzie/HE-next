// lib/progressive-lesson-loader.ts - Sistema de carregamento progressivo para aulas
import { useState, useEffect } from 'react';

interface LessonSkeleton {
  id: string;
  title: string;
  subject: string;
  grade: string;
  objectives: string[];
  introduction: string;
  metadata: {
    subject: string;
    grade: string;
    duration: string;
    difficulty: string;
    tags: string[];
  };
  stages: Array<{
    etapa: string;
    type: string;
    activity: any;
    route: string;
    isLoaded: boolean;
  }>;
  summary?: string;
  nextSteps?: string[];
  feedback: any;
}

interface ProgressiveLoadingState {
  skeleton: LessonSkeleton | null;
  loadedStages: number;
  totalStages: number;
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;
}

export class ProgressiveLessonLoader {
  private static instance: ProgressiveLessonLoader;
  private loadingStates: Map<string, ProgressiveLoadingState> = new Map();
  private loadingQueue: string[] = [];
  private isProcessingQueue = false;

  static getInstance(): ProgressiveLessonLoader {
    if (!ProgressiveLessonLoader.instance) {
      ProgressiveLessonLoader.instance = new ProgressiveLessonLoader();
    }
    return ProgressiveLessonLoader.instance;
  }

  private constructor() {}

  /**
   * Inicia o carregamento progressivo de uma aula
   */
  async startProgressiveLoading(lessonId: string): Promise<LessonSkeleton> {
    // Verificar se já está carregando
    if (this.loadingStates.has(lessonId)) {
      const state = this.loadingStates.get(lessonId)!;
      if (state.skeleton) {
        return state.skeleton;
      }
    }

    // Criar estado de carregamento
    const loadingState: ProgressiveLoadingState = {
      skeleton: null,
      loadedStages: 0,
      totalStages: 0,
      isLoading: true,
      loadingProgress: 0,
      error: null
    };

    this.loadingStates.set(lessonId, loadingState);

    try {
      // 1. Carregar esqueleto da aula (estrutura básica)
      const skeleton = await this.loadLessonSkeleton(lessonId);
      loadingState.skeleton = skeleton;
      loadingState.totalStages = skeleton.stages.length;
      loadingState.loadingProgress = 20;

      // 2. Carregar os primeiros 2 slides imediatamente
      await this.loadInitialStages(lessonId, skeleton);

      // 3. Iniciar carregamento em background dos slides restantes
      this.queueBackgroundLoading(lessonId);

      return skeleton;
    } catch (error) {
      loadingState.error = error instanceof Error ? error.message : 'Erro desconhecido';
      loadingState.isLoading = false;
      throw error;
    }
  }

  /**
   * Carrega o esqueleto da aula (estrutura básica)
   */
  private async loadLessonSkeleton(lessonId: string): Promise<LessonSkeleton> {
    try {
      const response = await fetch('/api/lessons/skeleton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar esqueleto da aula');
      }

      const data = await response.json();
      return data.skeleton;
    } catch (error) {
      // Fallback: criar esqueleto básico
      return this.createBasicSkeleton(lessonId);
    }
  }

  /**
   * Carrega os primeiros 2 slides imediatamente
   */
  private async loadInitialStages(lessonId: string, skeleton: LessonSkeleton): Promise<void> {
    const loadingState = this.loadingStates.get(lessonId)!;
    
    try {
      const response = await fetch('/api/lessons/initial-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lessonId,
          stages: skeleton.stages.slice(0, 2).map(stage => stage.etapa)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const loadedStages = data.stages || [];
        
        // Marcar os primeiros slides como carregados
        loadedStages.forEach((loadedStage: any, index: number) => {
          if (index < skeleton.stages.length) {
            skeleton.stages[index] = {
              ...skeleton.stages[index],
              activity: loadedStage.activity,
              isLoaded: true
            };
          }
        });

        loadingState.loadedStages = Math.min(loadedStages.length, 2);
        loadingState.loadingProgress = 40;
      }
    } catch (error) {
      console.warn('Erro ao carregar slides iniciais:', error);
    }
  }

  /**
   * Adiciona aula à fila de carregamento em background
   */
  private queueBackgroundLoading(lessonId: string): void {
    if (!this.loadingQueue.includes(lessonId)) {
      this.loadingQueue.push(lessonId);
    }

    if (!this.isProcessingQueue) {
      this.processLoadingQueue();
    }
  }

  /**
   * Processa a fila de carregamento em background
   */
  private async processLoadingQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.loadingQueue.length > 0) {
      const lessonId = this.loadingQueue.shift()!;
      await this.loadRemainingStages(lessonId);
    }

    this.isProcessingQueue = false;
  }

  /**
   * Carrega os slides restantes em background
   */
  private async loadRemainingStages(lessonId: string): Promise<void> {
    const loadingState = this.loadingStates.get(lessonId);
    if (!loadingState || !loadingState.skeleton) return;

    const skeleton = loadingState.skeleton;
    const remainingStages = skeleton.stages.slice(loadingState.loadedStages);

    for (let i = 0; i < remainingStages.length; i++) {
      try {
        const stageIndex = loadingState.loadedStages + i;
        const stage = skeleton.stages[stageIndex];

        const response = await fetch('/api/lessons/next-slide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            lessonId,
            stageIndex,
            stageName: stage.etapa
          })
        });

        if (response.ok) {
          const data = await response.json();
          skeleton.stages[stageIndex] = {
            ...stage,
            activity: data.activity,
            isLoaded: true
          };

          loadingState.loadedStages++;
          loadingState.loadingProgress = Math.min(
            100,
            40 + (loadingState.loadedStages / loadingState.totalStages) * 60
          );

          // Simular delay para não sobrecarregar o servidor
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.warn(`Erro ao carregar slide ${i + loadingState.loadedStages}:`, error);
      }
    }

    loadingState.isLoading = false;
    loadingState.loadingProgress = 100;
  }

  /**
   * Cria um esqueleto básico quando não consegue carregar do servidor
   */
  private createBasicSkeleton(lessonId: string): LessonSkeleton {
    return {
      id: lessonId,
      title: 'Aula em Carregamento',
      subject: 'Geral',
      grade: 'Ensino Médio',
      objectives: ['Objetivos serão carregados em breve'],
      introduction: 'Esta aula está sendo carregada. Aguarde um momento...',
      metadata: {
        subject: 'Geral',
        grade: 'Ensino Médio',
        duration: '45 min',
        difficulty: 'Médio',
        tags: ['carregando']
      },
      stages: Array.from({ length: 14 }, (_, index) => ({
        etapa: `Etapa ${index + 1}`,
        type: 'content',
        activity: {
          component: 'LoadingPlaceholder',
          content: 'Conteúdo sendo carregado...',
          time: 5,
          points: 5
        },
        route: `/aulas/${lessonId}/etapa-${index + 1}`,
        isLoaded: false
      })),
      summary: 'Resumo será carregado em breve',
      nextSteps: ['Próximos passos serão definidos'],
      feedback: { message: 'Feedback será gerado após o carregamento' }
    };
  }

  /**
   * Obtém o estado de carregamento de uma aula
   */
  getLoadingState(lessonId: string): ProgressiveLoadingState | null {
    return this.loadingStates.get(lessonId) || null;
  }

  /**
   * Verifica se uma aula está carregando
   */
  isLoading(lessonId: string): boolean {
    const state = this.loadingStates.get(lessonId);
    return state ? state.isLoading : false;
  }

  /**
   * Obtém o progresso de carregamento
   */
  getLoadingProgress(lessonId: string): number {
    const state = this.loadingStates.get(lessonId);
    return state ? state.loadingProgress : 0;
  }

  /**
   * Limpa o estado de carregamento de uma aula
   */
  clearLoadingState(lessonId: string): void {
    this.loadingStates.delete(lessonId);
    this.loadingQueue = this.loadingQueue.filter(id => id !== lessonId);
  }

  /**
   * Pré-carrega aulas populares
   */
  async preloadPopularLessons(): Promise<void> {
    try {
      const response = await fetch('/api/lessons/popular');
      if (response.ok) {
        const lessons = await response.json();
        const popularLessons = lessons.slice(0, 3); // Primeiras 3 aulas
        
        for (const lesson of popularLessons) {
          if (!this.loadingStates.has(lesson.id)) {
            // Carregar apenas o esqueleto em background
            this.loadLessonSkeleton(lesson.id).catch(console.warn);
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao pré-carregar aulas populares:', error);
    }
  }
}

// Instância singleton
export const progressiveLoader = ProgressiveLessonLoader.getInstance();

// Hook para React
export function useProgressiveLoading(lessonId: string) {
  const [loadingState, setLoadingState] = useState<ProgressiveLoadingState | null>(null);

  useEffect(() => {
    const state = progressiveLoader.getLoadingState(lessonId);
    setLoadingState(state);

    // Atualizar estado quando o carregamento progride
    const interval = setInterval(() => {
      const currentState = progressiveLoader.getLoadingState(lessonId);
      if (currentState && currentState !== loadingState) {
        setLoadingState(currentState);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lessonId, loadingState]);

  return {
    loadingState,
    isLoading: progressiveLoader.isLoading(lessonId),
    progress: progressiveLoader.getLoadingProgress(lessonId),
    startLoading: () => progressiveLoader.startProgressiveLoading(lessonId),
    clearState: () => progressiveLoader.clearLoadingState(lessonId)
  };
}
