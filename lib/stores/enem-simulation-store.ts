import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Question {
  id: string;
  area: string;
  year: number;
  disciplina: string;
  skill_tag: string[];
  stem: string;
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  correct: string;
  rationale: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  image_url?: string;
  image_alt?: string;
  source: 'DATABASE' | 'AI' | 'FALLBACK';
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  timestamp: Date;
  timeSpent: number; // in seconds
}

export interface SimulationProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeElapsed: number; // in seconds
  timeRemaining: number; // in seconds
  isActive: boolean;
  isPaused: boolean;
  isFinished: boolean;
}

export interface SimulationStats {
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  averageTimePerQuestion: number;
  accuracy: number;
  timeSpent: number;
  difficultyBreakdown: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  skillBreakdown: Record<string, { correct: number; total: number }>;
}

export interface BatchInfo {
  batchNumber: number;
  totalBatches: number;
  questionsInBatch: number;
  isGenerating: boolean;
  progress: number; // 0-100
  error?: string;
}

interface EnemSimulationState {
  // Core simulation data
  examId: string | null;
  questions: Question[];
  answers: Map<string, UserAnswer>;
  progress: SimulationProgress;
  stats: SimulationStats;
  
  // Batch processing
  batchInfo: BatchInfo;
  loadedBatches: Set<number>;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showResults: boolean;
  
  // Actions
  initializeSimulation: (examId: string, totalQuestions: number, duration: number) => void;
  loadQuestions: (questions: Question[]) => void;
  loadBatch: (questions: Question[], batchNumber: number) => void;
  
  // Navigation
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  
  // Answer management
  selectAnswer: (questionId: string, answer: string) => void;
  clearAnswer: (questionId: string) => void;
  
  // Simulation control
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  finishSimulation: () => void;
  resetSimulation: () => void;
  
  // Timer
  updateTimer: (timeElapsed: number, timeRemaining: number) => void;
  
  // Batch processing
  setBatchGenerating: (batchNumber: number, isGenerating: boolean) => void;
  setBatchProgress: (batchNumber: number, progress: number) => void;
  setBatchError: (batchNumber: number, error: string) => void;
  
  // Results
  calculateStats: () => SimulationStats;
  displayResults: () => void;
  hideResults: () => void;
  
  // Utility
  getCurrentQuestion: () => Question | null;
  getQuestionAnswer: (questionId: string) => UserAnswer | null;
  isQuestionAnswered: (questionId: string) => boolean;
  canNavigateToQuestion: (index: number) => boolean;
}

const initialProgress: SimulationProgress = {
  currentQuestionIndex: 0,
  totalQuestions: 0,
  answeredQuestions: 0,
  timeElapsed: 0,
  timeRemaining: 0,
  isActive: false,
  isPaused: false,
  isFinished: false
};

const initialStats: SimulationStats = {
  correctAnswers: 0,
  incorrectAnswers: 0,
  skippedAnswers: 0,
  averageTimePerQuestion: 0,
  accuracy: 0,
  timeSpent: 0,
  difficultyBreakdown: {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 }
  },
  skillBreakdown: {}
};

const initialBatchInfo: BatchInfo = {
  batchNumber: 0,
  totalBatches: 0,
  questionsInBatch: 0,
  isGenerating: false,
  progress: 0
};

export const useEnemSimulationStore = create<EnemSimulationState>()(
  persist(
    (set, get) => ({
      // Initial state
      examId: null,
      questions: [],
      answers: new Map(),
      progress: initialProgress,
      stats: initialStats,
      batchInfo: initialBatchInfo,
      loadedBatches: new Set(),
      isLoading: false,
      error: null,
      showResults: false,

      // Actions
      initializeSimulation: (examId, totalQuestions, duration) =>
        set({
          examId,
          questions: [],
          answers: new Map(),
          progress: {
            ...initialProgress,
            totalQuestions,
            timeRemaining: duration
          },
          stats: initialStats,
          batchInfo: {
            ...initialBatchInfo,
            totalBatches: Math.ceil(totalQuestions / 3)
          },
          loadedBatches: new Set(),
          isLoading: true,
          error: null,
          showResults: false
        }),

      loadQuestions: (questions) =>
        set((state) => ({
          questions,
          progress: {
            ...state.progress,
            totalQuestions: questions.length
          },
          isLoading: false
        })),

      loadBatch: (questions, batchNumber) =>
        set((state) => {
          const newQuestions = [...state.questions];
          const startIndex = batchNumber * 3;
          
          questions.forEach((question, index) => {
            newQuestions[startIndex + index] = question;
          });

          return {
            questions: newQuestions,
            loadedBatches: new Set(Array.from(state.loadedBatches).concat(batchNumber)),
            isLoading: false
          };
        }),

      // Navigation
      goToQuestion: (index) =>
        set((state) => ({
          progress: {
            ...state.progress,
            currentQuestionIndex: Math.max(0, Math.min(index, state.questions.length - 1))
          }
        })),

      nextQuestion: () =>
        set((state) => {
          const nextIndex = state.progress.currentQuestionIndex + 1;
          if (nextIndex < state.questions.length) {
            return {
              progress: {
                ...state.progress,
                currentQuestionIndex: nextIndex
              }
            };
          }
          return state;
        }),

      previousQuestion: () =>
        set((state) => {
          const prevIndex = state.progress.currentQuestionIndex - 1;
          if (prevIndex >= 0) {
            return {
              progress: {
                ...state.progress,
                currentQuestionIndex: prevIndex
              }
            };
          }
          return state;
        }),

      // Answer management
      selectAnswer: (questionId, answer) =>
        set((state) => {
          const newAnswers = new Map(state.answers);
          const currentAnswer = newAnswers.get(questionId);
          const timeSpent = currentAnswer ? currentAnswer.timeSpent : 0;
          
          newAnswers.set(questionId, {
            questionId,
            answer,
            timestamp: new Date(),
            timeSpent
          });

          const answeredCount = Array.from(newAnswers.values()).length;

          return {
            answers: newAnswers,
            progress: {
              ...state.progress,
              answeredQuestions: answeredCount
            }
          };
        }),

      clearAnswer: (questionId) =>
        set((state) => {
          const newAnswers = new Map(state.answers);
          newAnswers.delete(questionId);
          
          const answeredCount = Array.from(newAnswers.values()).length;

          return {
            answers: newAnswers,
            progress: {
              ...state.progress,
              answeredQuestions: answeredCount
            }
          };
        }),

      // Simulation control
      startSimulation: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            isActive: true,
            isPaused: false
          }
        })),

      pauseSimulation: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            isPaused: true
          }
        })),

      resumeSimulation: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            isPaused: false
          }
        })),

      finishSimulation: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            isActive: false,
            isFinished: true
          },
          stats: get().calculateStats()
        })),

      resetSimulation: () =>
        set({
          examId: null,
          questions: [],
          answers: new Map(),
          progress: initialProgress,
          stats: initialStats,
          batchInfo: initialBatchInfo,
          loadedBatches: new Set(),
          isLoading: false,
          error: null,
          showResults: false
        }),

      // Timer
      updateTimer: (timeElapsed, timeRemaining) =>
        set((state) => ({
          progress: {
            ...state.progress,
            timeElapsed,
            timeRemaining
          }
        })),

      // Batch processing
      setBatchGenerating: (batchNumber, isGenerating) =>
        set((state) => ({
          batchInfo: {
            ...state.batchInfo,
            batchNumber,
            isGenerating
          }
        })),

      setBatchProgress: (batchNumber, progress) =>
        set((state) => ({
          batchInfo: {
            ...state.batchInfo,
            batchNumber,
            progress
          }
        })),

      setBatchError: (batchNumber, error) =>
        set((state) => ({
          batchInfo: {
            ...state.batchInfo,
            batchNumber,
            error
          }
        })),

      // Results
      calculateStats: () => {
        const state = get();
        const answers = Array.from(state.answers.values());
        const questions = state.questions;

        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let skippedAnswers = 0;
        const difficultyBreakdown = {
          easy: { correct: 0, total: 0 },
          medium: { correct: 0, total: 0 },
          hard: { correct: 0, total: 0 }
        };
        const skillBreakdown: Record<string, { correct: number; total: number }> = {};

        questions.forEach(question => {
          const answer = state.answers.get(question.id);
          
          // Count by difficulty
          difficultyBreakdown[question.difficulty.toLowerCase() as keyof typeof difficultyBreakdown].total++;
          
          // Count by skills
          question.skill_tag.forEach(skill => {
            if (!skillBreakdown[skill]) {
              skillBreakdown[skill] = { correct: 0, total: 0 };
            }
            skillBreakdown[skill].total++;
          });

          if (answer) {
            if (answer.answer === question.correct) {
              correctAnswers++;
              difficultyBreakdown[question.difficulty.toLowerCase() as keyof typeof difficultyBreakdown].correct++;
              question.skill_tag.forEach(skill => {
                skillBreakdown[skill].correct++;
              });
            } else {
              incorrectAnswers++;
            }
          } else {
            skippedAnswers++;
          }
        });

        const totalAnswered = correctAnswers + incorrectAnswers;
        const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
        const averageTimePerQuestion = answers.length > 0 
          ? answers.reduce((sum, answer) => sum + answer.timeSpent, 0) / answers.length 
          : 0;

        return {
          correctAnswers,
          incorrectAnswers,
          skippedAnswers,
          averageTimePerQuestion,
          accuracy,
          timeSpent: state.progress.timeElapsed,
          difficultyBreakdown,
          skillBreakdown
        };
      },

      displayResults: () =>
        set({ showResults: true }),

      hideResults: () =>
        set({ showResults: false }),

      // Utility
      getCurrentQuestion: () => {
        const state = get();
        return state.questions[state.progress.currentQuestionIndex] || null;
      },

      getQuestionAnswer: (questionId) => {
        const state = get();
        return state.answers.get(questionId) || null;
      },

      isQuestionAnswered: (questionId) => {
        const state = get();
        return state.answers.has(questionId);
      },

      canNavigateToQuestion: (index) => {
        const state = get();
        return index >= 0 && index < state.questions.length;
      }
    }),
    {
      name: 'enem-simulation-store',
      partialize: (state) => ({
        examId: state.examId,
        questions: state.questions,
        answers: Array.from(state.answers.entries()),
        progress: state.progress,
        stats: state.stats
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.answers)) {
          state.answers = new Map(state.answers);
        }
      }
    }
  )
);
