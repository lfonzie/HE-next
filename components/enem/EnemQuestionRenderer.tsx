'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  CheckCircle,
  Flag,
  BookOpen,
  Target,
  Clock,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MessageSquare,
  Highlighter,
  PenTool,
  Image as ImageIcon,
  Download,
  Share2
} from 'lucide-react'
import { EnemItem, EnemResponse } from '@/types/enem'
import { useToast } from '@/hooks/use-toast'

// Question Renderer Props
interface EnemQuestionRendererProps {
  item: EnemItem
  response?: EnemResponse | null
  questionNumber: number
  totalQuestions: number
  isAnswered: boolean
  isReviewMode?: boolean
  showAnswer?: boolean
  onAnswerSelect: (answer: string) => void
  onFlagToggle?: () => void
  onNoteAdd?: (note: string) => void
  onImageZoom?: (imageUrl: string) => void
  className?: string
}

// Annotation Interface
interface Annotation {
  id: string
  type: 'highlight' | 'note' | 'drawing'
  content: string
  position?: { x: number; y: number }
  timestamp: Date
}

// Question Renderer Component
export function EnemQuestionRenderer({
  item,
  response,
  questionNumber,
  totalQuestions,
  isAnswered,
  isReviewMode = false,
  showAnswer = false,
  onAnswerSelect,
  onFlagToggle,
  onNoteAdd,
  onImageZoom,
  className = ''
}: EnemQuestionRendererProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [isFlagged, setIsFlagged] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  
  const { toast } = useToast()

  // Memoized values
  const difficultyColor = useMemo(() => {
    const colors = {
      'EASY': 'bg-green-100 text-green-800 border-green-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'HARD': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[item.estimated_difficulty] || colors['MEDIUM']
  }, [item.estimated_difficulty])

  const sourceInfo = useMemo(() => {
    if (item.metadata?.is_official_enem) {
      return { text: `ENEM ${item.year}`, icon: '🏛️', variant: 'default' as const }
    } else if (item.metadata?.is_ai_generated) {
      return { text: 'IA Gerada', icon: '🤖', variant: 'secondary' as const }
    } else {
      return { text: 'ENEM Local', icon: '💾', variant: 'outline' as const }
    }
  }, [item.metadata])

  // Font size classes
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer: string) => {
    if (isReviewMode) return
    onAnswerSelect(answer)
  }, [isReviewMode, onAnswerSelect])

  // Handle flag toggle
  const handleFlagToggle = useCallback(() => {
    setIsFlagged(!isFlagged)
    onFlagToggle?.()
    toast({
      title: isFlagged ? 'Marcador removido' : 'Questão marcada',
      description: isFlagged ? 'A questão foi desmarcada' : 'A questão foi marcada para revisão',
    })
  }, [isFlagged, onFlagToggle, toast])

  // Handle note addition
  const handleNoteAdd = useCallback(() => {
    if (noteText.trim()) {
      const annotation: Annotation = {
        id: `note_${Date.now()}`,
        type: 'note',
        content: noteText.trim(),
        timestamp: new Date()
      }
      setAnnotations(prev => [...prev, annotation])
      onNoteAdd?.(noteText.trim())
      setNoteText('')
      setShowNoteInput(false)
      toast({
        title: 'Nota adicionada',
        description: 'Sua anotação foi salva',
      })
    }
  }, [noteText, onNoteAdd, toast])

  // Handle image zoom
  const handleImageClick = useCallback((imageUrl: string) => {
    onImageZoom?.(imageUrl)
  }, [onImageZoom])

  // Render question text with enhanced markdown
  const renderQuestionText = () => (
    <div className={`prose max-w-none ${fontSizeClasses[fontSize]}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-4 text-gray-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-3 text-gray-900">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-800 mb-4 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-800">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1 leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 mb-4 bg-blue-50 py-2">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-900">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4 border">
              {children}
            </pre>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => src && handleImageClick(src)}
            />
          ),
        }}
      >
        {item.text}
      </ReactMarkdown>
    </div>
  )

  // Render alternatives
  const renderAlternatives = () => (
    <div className="space-y-3">
      {Object.entries(item.alternatives).map(([key, value], index) => {
        const isSelected = response?.selected_answer === key
        const isCorrect = showAnswer && key === item.correct_answer
        const isIncorrect = showAnswer && isSelected && key !== item.correct_answer
        
        return (
          <button
            key={key}
            onClick={() => handleAnswerSelect(key)}
            disabled={isReviewMode}
            className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 ${
              isCorrect
                ? 'border-green-500 bg-green-50 text-green-900'
                : isIncorrect
                ? 'border-red-500 bg-red-50 text-red-900'
                : isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
            } ${
              isReviewMode ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'
            }`}
            aria-label={`Selecionar alternativa ${key}`}
            aria-pressed={isSelected}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                  isCorrect
                    ? 'border-green-500 bg-green-500 text-white'
                    : isIncorrect
                    ? 'border-red-500 bg-red-500 text-white'
                    : isSelected
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-400 text-gray-600'
                }`}
              >
                {key}
              </div>
              <div className="flex-1 pt-0.5">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <span className="inline">{children}</span>,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono text-gray-800">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
              {isSelected && (
                <div className="text-blue-600 pt-0.5">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Question Header */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                #{questionNumber}
              </Badge>
              <Badge variant={sourceInfo.variant} className="text-sm">
                <span className="mr-1">{sourceInfo.icon}</span>
                {sourceInfo.text}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {item.area}
              </Badge>
              <Badge className={`text-sm ${difficultyColor}`}>
                {item.estimated_difficulty}
              </Badge>
              {isAnswered && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  ✓ Respondida
                </Badge>
              )}
              {isFlagged && (
                <Badge variant="destructive" className="text-xs">
                  🚩 Marcada
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={(questionNumber / totalQuestions) * 100} 
              className="h-2" 
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Questão {questionNumber} de {totalQuestions}</span>
              <span>{Math.round((questionNumber / totalQuestions) * 100)}% concluído</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Question Text */}
          <div className="space-y-6">
            {renderQuestionText()}
            
            {/* Images */}
            {item.asset_refs && item.asset_refs.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Imagens da Questão
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.asset_refs.map((assetRef, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => handleImageClick(assetRef)}
                    >
                      <img
                        src={assetRef}
                        alt={`Imagem ${index + 1} da questão`}
                        className="w-full h-auto rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternatives */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Selecione a alternativa correta:
            </CardTitle>
            <div className="flex items-center gap-2">
              {showAnswer && (
                <Badge variant="outline" className="text-sm">
                  Resposta: {item.correct_answer}
                </Badge>
              )}
              <div className="text-sm text-gray-500">
                {response ? 'Respondida' : 'Aguardando resposta'}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {renderAlternatives()}
        </CardContent>
      </Card>

      {/* Question Tools */}
      <Card className="shadow-md">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Font Size Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize('small')}
                  className={fontSize === 'small' ? 'bg-gray-100' : ''}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize('medium')}
                  className={fontSize === 'medium' ? 'bg-gray-100' : ''}
                >
                  A
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize('large')}
                  className={fontSize === 'large' ? 'bg-gray-100' : ''}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Annotation Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNoteInput(!showNoteInput)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Flag Button */}
              <Button
                variant={isFlagged ? "destructive" : "outline"}
                size="sm"
                onClick={handleFlagToggle}
              >
                <Flag className="h-4 w-4 mr-1" />
                {isFlagged ? 'Desmarcar' : 'Marcar'}
              </Button>

              {/* Share Button */}
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Note Input */}
          {showNoteInput && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Adicionar anotação:
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Digite sua anotação aqui..."
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNoteText('')
                      setShowNoteInput(false)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleNoteAdd}
                    disabled={!noteText.trim()}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Annotations Display */}
          {showAnnotations && annotations.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Suas anotações:</h4>
              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-blue-900">{annotation.content}</p>
                    <span className="text-xs text-blue-600">
                      {annotation.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

