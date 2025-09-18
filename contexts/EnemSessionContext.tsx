'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { EnemItem, EnemResponse, EnemSession, EnemScore } from '@/types/enem'

// Session State Interface
interface SessionState {
  session: EnemSession | null
  items: EnemItem[]
  responses: Map<string, EnemResponse>
  currentQuestionIndex: number
  isActive: boolean
  isCompleted: boolean
  score: EnemScore | null
  timeRemaining: number | null
  startTime: Date | null
  questionStartTimes: Map<string, number>
  tabSwitchEvents: Array<{ timestamp: Date; questionIndex: number }>
}

// Action Types
type SessionAction =
  | { type: 'INIT_SESSION'; payload: { session: EnemSession; items: EnemItem[] } }
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'ADD_RESPONSE'; payload: EnemResponse }
  | { type: 'UPDATE_RESPONSE'; payload: EnemResponse }
  | { type: 'SET_ACTIVE'; payload: boolean }
  | { type: 'SET_COMPLETED'; payload: boolean }
  | { type: 'SET_SCORE'; payload: EnemScore }
  | { type: 'SET_TIME_REMAINING'; payload: number | null }
  | { type: 'SET_QUESTION_START_TIME'; payload: { itemId: string; timestamp: number } }
  | { type: 'ADD_TAB_SWITCH'; payload: { timestamp: Date; questionIndex: number } }
  | { type: 'RESET_SESSION' }

// Initial State
const initialState: SessionState = {
  session: null,
  items: [],
  responses: new Map(),
  currentQuestionIndex: 0,
  isActive: false,
  isCompleted: false,
  score: null,
  timeRemaining: null,
  startTime: null,
  questionStartTimes: new Map(),
  tabSwitchEvents: []
}

// Reducer
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'INIT_SESSION':
      return {
        ...state,
        session: action.payload.session,
        items: action.payload.items,
        responses: new Map(),
        currentQuestionIndex: 0,
        isActive: true,
        isCompleted: false,
        score: null,
        startTime: new Date(),
        questionStartTimes: new Map(),
        tabSwitchEvents: []
      }
    
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: action.payload
      }
    
    case 'ADD_RESPONSE':
    case 'UPDATE_RESPONSE':
      return {
        ...state,
        responses: new Map(state.responses.set(action.payload.item_id, action.payload))
      }
    
    case 'SET_ACTIVE':
      return {
        ...state,
        isActive: action.payload
      }
    
    case 'SET_COMPLETED':
      return {
        ...state,
        isCompleted: action.payload,
        isActive: false
      }
    
    case 'SET_SCORE':
      return {
        ...state,
        score: action.payload
      }
    
    case 'SET_TIME_REMAINING':
      return {
        ...state,
        timeRemaining: action.payload
      }
    
    case 'SET_QUESTION_START_TIME':
      return {
        ...state,
        questionStartTimes: new Map(state.questionStartTimes.set(action.payload.itemId, action.payload.timestamp))
      }
    
    case 'ADD_TAB_SWITCH':
      return {
        ...state,
        tabSwitchEvents: [...state.tabSwitchEvents, action.payload]
      }
    
    case 'RESET_SESSION':
      return initialState
    
    default:
      return state
  }
}

// Context Interface
interface EnemSessionContextType {
  // State
  state: SessionState
  
  // Actions
  initSession: (session: EnemSession, items: EnemItem[]) => void
  setCurrentQuestion: (index: number) => void
  addResponse: (response: EnemResponse) => void
  updateResponse: (response: EnemResponse) => void
  setActive: (active: boolean) => void
  setCompleted: (completed: boolean) => void
  setScore: (score: EnemScore) => void
  setTimeRemaining: (time: number | null) => void
  setQuestionStartTime: (itemId: string, timestamp: number) => void
  addTabSwitch: (timestamp: Date, questionIndex: number) => void
  resetSession: () => void
  
  // Computed Values
  currentItem: EnemItem | null
  currentResponse: EnemResponse | null
  progress: number
  answeredCount: number
  isLastQuestion: boolean
  isFirstQuestion: boolean
}

// Context
const EnemSessionContext = createContext<EnemSessionContextType | null>(null)

// Provider Component
export function EnemSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState)

  // Actions
  const initSession = useCallback((session: EnemSession, items: EnemItem[]) => {
    dispatch({ type: 'INIT_SESSION', payload: { session, items } })
  }, [])

  const setCurrentQuestion = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_QUESTION', payload: index })
  }, [])

  const addResponse = useCallback((response: EnemResponse) => {
    dispatch({ type: 'ADD_RESPONSE', payload: response })
  }, [])

  const updateResponse = useCallback((response: EnemResponse) => {
    dispatch({ type: 'UPDATE_RESPONSE', payload: response })
  }, [])

  const setActive = useCallback((active: boolean) => {
    dispatch({ type: 'SET_ACTIVE', payload: active })
  }, [])

  const setCompleted = useCallback((completed: boolean) => {
    dispatch({ type: 'SET_COMPLETED', payload: completed })
  }, [])

  const setScore = useCallback((score: EnemScore) => {
    dispatch({ type: 'SET_SCORE', payload: score })
  }, [])

  const setTimeRemaining = useCallback((time: number | null) => {
    dispatch({ type: 'SET_TIME_REMAINING', payload: time })
  }, [])

  const setQuestionStartTime = useCallback((itemId: string, timestamp: number) => {
    dispatch({ type: 'SET_QUESTION_START_TIME', payload: { itemId, timestamp } })
  }, [])

  const addTabSwitch = useCallback((timestamp: Date, questionIndex: number) => {
    dispatch({ type: 'ADD_TAB_SWITCH', payload: { timestamp, questionIndex } })
  }, [])

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' })
  }, [])

  // Computed Values
  const currentItem = state.items[state.currentQuestionIndex] || null
  const currentResponse = currentItem ? state.responses.get(currentItem.item_id) || null : null
  const progress = state.items.length > 0 ? ((state.currentQuestionIndex + 1) / state.items.length) * 100 : 0
  const answeredCount = state.responses.size
  const isLastQuestion = state.currentQuestionIndex === state.items.length - 1
  const isFirstQuestion = state.currentQuestionIndex === 0

  // Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isActive) {
        addTabSwitch(new Date(), state.currentQuestionIndex)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state.isActive, state.currentQuestionIndex, addTabSwitch])

  const contextValue: EnemSessionContextType = {
    state,
    initSession,
    setCurrentQuestion,
    addResponse,
    updateResponse,
    setActive,
    setCompleted,
    setScore,
    setTimeRemaining,
    setQuestionStartTime,
    addTabSwitch,
    resetSession,
    currentItem,
    currentResponse,
    progress,
    answeredCount,
    isLastQuestion,
    isFirstQuestion
  }

  return (
    <EnemSessionContext.Provider value={contextValue}>
      {children}
    </EnemSessionContext.Provider>
  )
}

// Hook
export function useEnemSession() {
  const context = useContext(EnemSessionContext)
  if (!context) {
    throw new Error('useEnemSession must be used within an EnemSessionProvider')
  }
  return context
}

