'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Zap,
  Eye,
  EyeOff,
  Bookmark,
  Star,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { EnemItem, EnemResponse } from '@/types/enem'
import { useToast } from '@/hooks/use-toast'

interface EnemSmartNavigationProps {
  items: EnemItem[]
  responses: Map<string, EnemResponse>
  currentIndex: number
  onNavigate: (index: number) => void
  onFlagToggle: (index: number) => void
  className?: string
}

interface NavigationState {
  visitedQuestions: Set<number>
  flaggedQuestions: Set<number>
  timeSpentPerQuestion: Map<number, number>
  confidenceLevel: Map<number, 'baixa' | 'média' | 'alta'>
  difficultyHistory: Map<number, 'EASY' | 'MEDIUM' | 'HARD'>
  errorPatterns: Map<string, number>
}

interface SmartSuggestion {
  type: 'review' | 'skip' | 'focus' | 'time'
  questionIndex: number
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: number
}

export function EnemSmartNavigation({
  items,
  responses,
  currentIndex,
  onNavigate,
  onFlagToggle,
  className = ''
}: EnemSmartNavigationProps) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    visitedQuestions: new Set(),
    flaggedQuestions: new Set(),
    timeSpentPerQuestion: new Map(),
    confidenceLevel: new Map(),
    difficultyHistory: new Map(),
    errorPatterns: new Map()
  })
  
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true)
  const [showNavigationMap, setShowNavigationMap] = useState(false)
  const [sortBy, setSortBy] = useState<'order' | 'difficulty' | 'time' | 'status'>('order')
  const [filterBy, setFilterBy] = useState<'all' | 'answered' | 'unanswered' | 'flagged'>('all')
  
  const { toast } = useToast()

  // Update navigation state when current question changes
  useEffect(() => {
    setNavigationState(prev => ({
      ...prev,
      visitedQuestions: new Set(prev.visitedQuestions.add(currentIndex))
    }))
  }, [currentIndex])

  // Track time spent on current question
  useEffect(() => {
    const startTime = Date.now()
    
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      setNavigationState(prev => ({
        ...prev,
        timeSpentPerQuestion: new Map(prev.timeSpentPerQuestion.set(currentIndex, timeSpent))
      }))
    }
  }, [currentIndex])

  // Generate smart suggestions
  const smartSuggestions = useMemo((): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = []
    
    // Analyze patterns
    const unansweredQuestions = items
      .map((_, index) => index)
      .filter(index => !responses.has(items[index].item_id))
    
    const flaggedQuestions = Array.from(navigationState.flaggedQuestions)
    const slowQuestions = Array.from(navigationState.timeSpentPerQuestion.entries())
      .filter(([_, time]) => time > 300) // More than 5 minutes
      .map(([index, _]) => index)
    
    // Suggest reviewing flagged questions
    flaggedQuestions.forEach(index => {
      suggestions.push({
        type: 'review',
        questionIndex: index,
        reason: 'Questão marcada para revisão',
        priority: 'high',
        estimatedTime: 120
      })
    })
    
    // Suggest focusing on unanswered questions
    unansweredQuestions.slice(0, 3).forEach(index => {
      suggestions.push({
        type: 'focus',
        questionIndex: index,
        reason: 'Questão ainda não respondida',
        priority: 'medium',
        estimatedTime: 180
      })
    })
    
    // Suggest skipping slow questions temporarily
    slowQuestions.forEach(index => {
      suggestions.push({
        type: 'skip',
        questionIndex: index,
        reason: 'Tempo excessivo gasto nesta questão',
        priority: 'low',
        estimatedTime: 60
      })
    })
    
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [items, responses, navigationState])

  // Get question status
  const getQuestionStatus = useCallback((index: number) => {
    const item = items[index]
    const response = responses.get(item.item_id)
    const isFlagged = navigationState.flaggedQuestions.has(index)
    const timeSpent = navigationState.timeSpentPerQuestion.get(index) || 0
    
    return {
      isAnswered: !!response,
      isCorrect: response?.is_correct || false,
      isFlagged,
      timeSpent,
      difficulty: item.estimated_difficulty,
      isVisited: navigationState.visitedQuestions.has(index)
    }
  }, [items, responses, navigationState])

  // Navigate to question
  const handleNavigate = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      onNavigate(index)
      toast({
        title: '📍 Navegação',
        description: `Questão ${index + 1} de ${items.length}`,
      })
    }
  }, [items.length, onNavigate, toast])

  // Toggle flag
  const handleFlagToggle = useCallback((index: number) => {
    setNavigationState(prev => {
      const newFlaggedQuestions = new Set(prev.flaggedQuestions)
      if (newFlaggedQuestions.has(index)) {
        newFlaggedQuestions.delete(index)
      } else {
        newFlaggedQuestions.add(index)
      }
      
      return {
        ...prev,
        flaggedQuestions: newFlaggedQuestions
      }
    })
    
    onFlagToggle(index)
  }, [onFlagToggle])

  // Smart navigation - go to next suggested question
  const handleSmartNavigate = useCallback((suggestion: SmartSuggestion) => {
    handleNavigate(suggestion.questionIndex)
    setShowSmartSuggestions(false)
  }, [handleNavigate])

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = items.map((_, index) => index)
    
    // Apply filter
    switch (filterBy) {
      case 'answered':
        filtered = filtered.filter(index => responses.has(items[index].item_id))
        break
      case 'unanswered':
        filtered = filtered.filter(index => !responses.has(items[index].item_id))
        break
      case 'flagged':
        filtered = filtered.filter(index => navigationState.flaggedQuestions.has(index))
        break
    }
    
    // Apply sort
    switch (sortBy) {
      case 'difficulty':
        filtered.sort((a, b) => {
          const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 }
          return difficultyOrder[items[a].estimated_difficulty] - difficultyOrder[items[b].estimated_difficulty]
        })
        break
      case 'time':
        filtered.sort((a, b) => {
          const timeA = navigationState.timeSpentPerQuestion.get(a) || 0
          const timeB = navigationState.timeSpentPerQuestion.get(b) || 0
          return timeB - timeA
        })
        break
      case 'status':
        filtered.sort((a, b) => {
          const statusA = getQuestionStatus(a)
          const statusB = getQuestionStatus(b)
          
          // Unanswered first, then flagged, then answered
          if (!statusA.isAnswered && statusB.isAnswered) return -1
          if (statusA.isAnswered && !statusB.isAnswered) return 1
          if (statusA.isFlagged && !statusB.isFlagged) return -1
          if (!statusA.isFlagged && statusB.isFlagged) return 1
          
          return a - b
        })
        break
      default:
        // Keep original order
        break
    }
    
    return filtered
  }, [items, responses, filterBy, sortBy, navigationState, getQuestionStatus])

  // Render question status indicator
  const renderQuestionStatus = (index: number) => {
    const status = getQuestionStatus(index)
    const isCurrent = index === currentIndex
    
    return (
      <div
        key={index}
        className={`relative p-2 rounded-lg border-2 cursor-pointer transition-all ${
          isCurrent
            ? 'border-blue-500 bg-blue-50'
            : status.isAnswered
            ? 'border-green-300 bg-green-50'
            : 'border-gray-200 bg-gray-50'
        }`}
        onClick={() => handleNavigate(index)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">#{index + 1}</span>
            {status.isFlagged && <Flag className="h-3 w-3 text-red-500" />}
            {status.isAnswered && (
              status.isCorrect ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={`text-xs ${
                status.difficulty === 'EASY' ? 'border-green-300 text-green-700' :
                status.difficulty === 'MEDIUM' ? 'border-yellow-300 text-yellow-700' :
                'border-red-300 text-red-700'
              }`}
            >
              {status.difficulty}
            </Badge>
          </div>
        </div>
        
        {status.timeSpent > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            <Clock className="h-3 w-3 inline mr-1" />
            {Math.floor(status.timeSpent / 60)}m {status.timeSpent % 60}s
          </div>
        )}
      </div>
    )
  }

  // Render smart suggestions
  const renderSmartSuggestions = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Sugestões Inteligentes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
          >
            {showSmartSuggestions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {showSmartSuggestions && (
        <CardContent className="space-y-3">
          {smartSuggestions.slice(0, 3).map((suggestion, index) => (
            <div
              key={index}
              className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {suggestion.priority === 'high' ? 'Alta' :
                     suggestion.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">
                    Questão {suggestion.questionIndex + 1}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSmartNavigate(suggestion)}
                >
                  Ir
                </Button>
              </div>
              <p className="text-sm text-gray-700">{suggestion.reason}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>Tempo estimado: {suggestion.estimatedTime}s</span>
                <span>Tipo: {suggestion.type}</span>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )

  // Render navigation map
  const renderNavigationMap = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Mapa de Navegação
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy(sortBy === 'order' ? 'status' : 'order')}
            >
              {sortBy === 'order' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterBy(filterBy === 'all' ? 'unanswered' : 'all')}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
          {filteredAndSortedQuestions.map(index => renderQuestionStatus(index))}
        </div>
        
        {/* Statistics */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-green-600">
                {Array.from(responses.values()).filter(r => r.is_correct).length}
              </div>
              <div className="text-gray-600">Acertos</div>
            </div>
            <div>
              <div className="font-bold text-red-600">
                {Array.from(responses.values()).filter(r => !r.is_correct).length}
              </div>
              <div className="text-gray-600">Erros</div>
            </div>
            <div>
              <div className="font-bold text-blue-600">
                {navigationState.flaggedQuestions.size}
              </div>
              <div className="text-gray-600">Marcadas</div>
            </div>
            <div>
              <div className="font-bold text-purple-600">
                {items.length - responses.size}
              </div>
              <div className="text-gray-600">Restantes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Smart Suggestions */}
      {renderSmartSuggestions()}
      
      {/* Navigation Map */}
      {renderNavigationMap()}
      
      {/* Quick Navigation */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handleNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFlagToggle(currentIndex)}
                className={navigationState.flaggedQuestions.has(currentIndex) ? 'bg-red-100 text-red-800' : ''}
              >
                <Flag className="h-4 w-4 mr-1" />
                {navigationState.flaggedQuestions.has(currentIndex) ? 'Desmarcar' : 'Marcar'}
              </Button>
              
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {currentIndex + 1} / {items.length}
                </div>
                <div className="text-xs text-gray-500">questões</div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => handleNavigate(currentIndex + 1)}
              disabled={currentIndex === items.length - 1}
              className="flex items-center gap-2"
            >
              Próxima
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={(currentIndex + 1) / items.length * 100} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{Math.round((currentIndex + 1) / items.length * 100)}% concluído</span>
              <span>{responses.size} de {items.length} respondidas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

