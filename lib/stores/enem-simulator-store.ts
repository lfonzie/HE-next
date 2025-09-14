import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface EnemQuestion {
  id: string
  subject: string
  area: string
  difficulty: string
  year: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  topics: string[]
  competencies: string[]
  source: string
}

export interface SimulatorSession {
  id: string
  area: string
  numQuestions: number
  duration: number
  useRealQuestions: boolean
  year?: number
  startTime?: number
  endTime?: number
  questions: EnemQuestion[]
  answers: Record<number, string>
  currentQuestion: number
  isActive: boolean
  isFinished: boolean
  score?: number
  loadedQuestions: number
  canStart: boolean
}

interface EnemSimulatorState {
  // Current session
  currentSession: SimulatorSession | null
  
  // Session history
  sessionHistory: SimulatorSession[]
  
  // Actions
  createSession: (config: {
    area: string
    numQuestions: number
    duration: number
    useRealQuestions: boolean
    year?: number
  }) => string
  
  updateSession: (sessionId: string, updates: Partial<SimulatorSession>) => void
  
  addQuestions: (sessionId: string, questions: EnemQuestion[]) => void
  
  selectAnswer: (sessionId: string, questionIndex: number, answer: string) => void
  
  nextQuestion: (sessionId: string) => void
  
  prevQuestion: (sessionId: string) => void
  
  startSimulation: (sessionId: string) => void
  
  pauseSimulation: (sessionId: string) => void
  
  resumeSimulation: (sessionId: string) => void
  
  finishSimulation: (sessionId: string) => void
  
  resetSession: (sessionId: string) => void
  
  deleteSession: (sessionId: string) => void
  
  getSession: (sessionId: string) => SimulatorSession | null
  
  // Progressive loading state
  progressiveLoading: {
    isLoading: boolean
    progress: number
    message: string
    loadedQuestions: EnemQuestion[]
    totalQuestions: number
    loadingSpeed: number
    estimatedTimeRemaining: number
    canStart: boolean
    error?: string
  }
  
  setProgressiveLoading: (state: Partial<EnemSimulatorState['progressiveLoading']>) => void
  
  // Cache for questions to avoid redundant requests
  questionCache: Map<string, { questions: EnemQuestion[], timestamp: number }>
  
  cacheQuestions: (key: string, questions: EnemQuestion[]) => void
  
  getCachedQuestions: (key: string) => EnemQuestion[] | null
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useEnemSimulatorStore = create<EnemSimulatorState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessionHistory: [],
      
      // Progressive loading state
      progressiveLoading: {
        isLoading: false,
        progress: 0,
        message: '',
        loadedQuestions: [],
        totalQuestions: 0,
        loadingSpeed: 0,
        estimatedTimeRemaining: 0,
        canStart: false,
        error: undefined
      },
      
      // Question cache
      questionCache: new Map(),
      
      // Actions
      createSession: (config) => {
        const sessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newSession: SimulatorSession = {
          id: sessionId,
          ...config,
          questions: [],
          answers: {},
          currentQuestion: 0,
          isActive: false,
          isFinished: false,
          loadedQuestions: 0,
          canStart: false
        }
        
        set((state) => ({
          currentSession: newSession,
          sessionHistory: [...state.sessionHistory, newSession]
        }))
        
        return sessionId
      },
      
      updateSession: (sessionId, updates) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session =>
            session.id === sessionId ? { ...session, ...updates } : session
          )
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? { ...state.currentSession, ...updates }
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      addQuestions: (sessionId, questions) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId) {
              const existingIds = new Set(session.questions.map(q => q.id))
              const newQuestions = questions.filter(q => !existingIds.has(q.id))
              return {
                ...session,
                questions: [...session.questions, ...newQuestions],
                loadedQuestions: session.loadedQuestions + newQuestions.length,
                canStart: session.loadedQuestions + newQuestions.length >= Math.min(2, session.numQuestions)
              }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? (() => {
                const session = updatedHistory.find(s => s.id === sessionId)
                return session || state.currentSession
              })()
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      selectAnswer: (sessionId, questionIndex, answer) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                answers: { ...session.answers, [questionIndex]: answer }
              }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                answers: { ...state.currentSession.answers, [questionIndex]: answer }
              }
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      nextQuestion: (sessionId) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId && session.currentQuestion < session.questions.length - 1) {
              return { ...session, currentQuestion: session.currentQuestion + 1 }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? (() => {
                const session = updatedHistory.find(s => s.id === sessionId)
                return session || state.currentSession
              })()
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      prevQuestion: (sessionId) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId && session.currentQuestion > 0) {
              return { ...session, currentQuestion: session.currentQuestion - 1 }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? (() => {
                const session = updatedHistory.find(s => s.id === sessionId)
                return session || state.currentSession
              })()
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      startSimulation: (sessionId) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                isActive: true,
                startTime: Date.now()
              }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                isActive: true,
                startTime: Date.now()
              }
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      pauseSimulation: (sessionId) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId) {
              return { ...session, isActive: false }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? { ...state.currentSession, isActive: false }
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      resumeSimulation: (sessionId) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId) {
              return { ...session, isActive: true }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? { ...state.currentSession, isActive: true }
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      finishSimulation: (sessionId) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId) {
              // Calculate score
              const correctAnswers = session.questions.reduce((acc, question, index) => {
                return acc + (session.answers[index] === question.correctAnswer.toString() ? 1 : 0)
              }, 0)
              
              const score = Math.round((correctAnswers / session.questions.length) * 1000)
              
              return {
                ...session,
                isActive: false,
                isFinished: true,
                score,
                endTime: Date.now()
              }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? (() => {
                const session = updatedHistory.find(s => s.id === sessionId)
                return session || state.currentSession
              })()
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      resetSession: (sessionId) => {
        set((state) => {
          const updatedHistory = state.sessionHistory.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                answers: {},
                currentQuestion: 0,
                isActive: false,
                isFinished: false,
                score: undefined,
                startTime: undefined,
                endTime: undefined
              }
            }
            return session
          })
          
          const updatedCurrent = state.currentSession?.id === sessionId
            ? (() => {
                const session = updatedHistory.find(s => s.id === sessionId)
                return session || state.currentSession
              })()
            : state.currentSession
          
          return {
            sessionHistory: updatedHistory,
            currentSession: updatedCurrent
          }
        })
      },
      
      deleteSession: (sessionId) => {
        set((state) => ({
          sessionHistory: state.sessionHistory.filter(session => session.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession
        }))
      },
      
      getSession: (sessionId) => {
        const state = get()
        return state.sessionHistory.find(session => session.id === sessionId) || null
      },
      
      setProgressiveLoading: (updates) => {
        set((state) => ({
          progressiveLoading: { ...state.progressiveLoading, ...updates }
        }))
      },
      
      cacheQuestions: (key, questions) => {
        set((state) => {
          const newCache = new Map(state.questionCache)
          newCache.set(key, { questions, timestamp: Date.now() })
          return { questionCache: newCache }
        })
      },
      
      getCachedQuestions: (key) => {
        const state = get()
        const cached = state.questionCache.get(key)
        
        if (!cached) return null
        
        // Check if cache is still valid
        if (Date.now() - cached.timestamp > CACHE_DURATION) {
          // Remove expired cache
          set((state) => {
            const newCache = new Map(state.questionCache)
            newCache.delete(key)
            return { questionCache: newCache }
          })
          return null
        }
        
        return cached.questions
      }
    }),
    {
      name: 'enem-simulator-storage',
      partialize: (state) => ({
        sessionHistory: state.sessionHistory,
        questionCache: Array.from(state.questionCache.entries())
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert array back to Map
          state.questionCache = new Map(state.questionCache as any)
        }
      }
    }
  )
)
