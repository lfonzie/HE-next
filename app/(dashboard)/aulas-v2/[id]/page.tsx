'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, CheckCircle, X, Trophy, BookOpen, Target, Clock, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import InlineFlashcards from '@/components/flashcard-maker/InlineFlashcards'
import { useLessonStorage } from '@/hooks/useLessonStorage'

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Slide {
  slideNumber: number
  type: string
  title: string
  content: string
  imageUrl?: string
  requiresImage?: boolean
  timeEstimate?: number
  questions?: Question[]
}

interface LessonData {
  id: string
  title: string
  subject: string
  grade: number
  objectives: string[]
  introduction: string
  slides: Slide[]
  summary: string
  nextSteps: string[]
  filteredTheme?: string
  curiosities?: string[]
}

interface QuizResult {
  slideNumber: number
  answers: number[]
  score: number
  totalQuestions: number
}

export default function AulasV2LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<{ [slideNumber: number]: number[] }>({})
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [showQuizResults, setShowQuizResults] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const { loadLesson } = useLessonStorage()

  // Load lesson from storage
  useEffect(() => {
    const lessonId = params.id as string
    
    try {
      const lessonData = loadLesson(lessonId)
      
      if (lessonData) {
        setLesson(lessonData)
        console.log('✅ Lesson loaded:', lessonData.title)
        
        // Debug: verificar imagens na lição carregada
        const slidesWithImages = lessonData.slides.filter(slide => slide.imageUrl)
        console.log('🖼️ Debug - Imagens na lição:', {
          totalSlides: lessonData.slides.length,
          slidesWithImages: slidesWithImages.length,
          imageDetails: slidesWithImages.map((slide, index) => ({
            slideNumber: slide.slideNumber,
            hasImage: !!slide.imageUrl,
            isBase64: slide.imageUrl?.startsWith('data:'),
            imageSize: slide.imageUrl?.length || 0
          }))
        })
      } else {
        console.error('❌ Lesson not found in storage')
        toast.error('Aula não encontrada')
        router.push('/aulas-v2')
      }
    } catch (error) {
      console.error('❌ Error loading lesson:', error)
      toast.error('Erro ao carregar aula')
      router.push('/aulas-v2')
    }
  }, [params.id, router, loadLesson])

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando aula...</p>
        </div>
      </div>
    )
  }

  const currentSlide = lesson.slides[currentSlideIndex]
  const isQuizSlide = currentSlide?.type === 'quiz'
  const totalSlides = lesson.slides.length

  const handleNextSlide = () => {
    if (isQuizSlide && !showQuizResults) {
      // Check if all questions are answered
      const questionsCount = currentSlide.questions?.length || 0
      if (selectedAnswers.length !== questionsCount) {
        toast.error('Por favor, responda todas as perguntas')
        return
      }

      // Calculate score
      let correct = 0
      currentSlide.questions?.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correct++
        }
      })

      const result: QuizResult = {
        slideNumber: currentSlide.slideNumber,
        answers: selectedAnswers,
        score: correct,
        totalQuestions: questionsCount
      }

      setQuizResults([...quizResults, result])
      setQuizAnswers({
        ...quizAnswers,
        [currentSlide.slideNumber]: selectedAnswers
      })
      setShowQuizResults(true)
      
      return
    }

    if (showQuizResults) {
      // After showing quiz results, advance to next slide
      setShowQuizResults(false)
      setSelectedAnswers([])
      
      if (currentSlideIndex < totalSlides - 1) {
        setCurrentSlideIndex(currentSlideIndex + 1)
      }
      return
    }

    // Normal slide navigation
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const handlePrevSlide = () => {
    if (showQuizResults) {
      // Go back to quiz questions
      setShowQuizResults(false)
      return
    }

    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
      setSelectedAnswers([])
    }
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const renderSlideContent = () => {
    if (!currentSlide) return null

    if (showQuizResults && isQuizSlide) {
      const result = quizResults[quizResults.length - 1]
      const percentage = (result.score / result.totalQuestions) * 100

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
              percentage >= 70 ? 'bg-green-100' : percentage >= 40 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Trophy className={`w-16 h-16 ${
                percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {percentage >= 70 ? 'Excelente!' : percentage >= 40 ? 'Bom trabalho!' : 'Continue praticando!'}
            </h2>
            <p className="text-xl text-gray-600">
              Você acertou {result.score} de {result.totalQuestions} questões ({Math.round(percentage)}%)
            </p>
          </div>

          <div className="space-y-4">
            {currentSlide.questions?.map((q, idx) => {
              const userAnswer = result.answers[idx]
              const isCorrect = userAnswer === q.correctAnswer

              return (
                <div key={idx} className={`border-2 rounded-xl p-6 ${
                  isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-2">{q.question}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Sua resposta: <span className={isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                          {q.options[userAnswer]}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-600 mb-2">
                          Resposta correta: <span className="text-green-700 font-semibold">
                            {q.options[q.correctAnswer]}
                          </span>
                        </p>
                      )}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Explicação:</span> {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )
    }

    if (isQuizSlide) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-6 mb-6">
            <p className="text-lg text-gray-700">{currentSlide.content}</p>
          </div>

          {currentSlide.questions?.map((question, qIdx) => (
            <div key={qIdx} className="border-2 border-gray-200 rounded-xl p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4">
                {qIdx + 1}. {question.question}
              </h3>
              <div className="space-y-3">
                {question.options.map((option, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerSelect(qIdx, oIdx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswers[qIdx] === oIdx
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[qIdx] === oIdx
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[qIdx] === oIdx && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {currentSlide.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="w-full h-64 object-cover"
              onLoad={() => console.log('✅ Imagem carregada com sucesso:', currentSlide.slideNumber)}
              onError={(e) => console.error('❌ Erro ao carregar imagem:', currentSlide.slideNumber, e)}
            />
          </div>
        )}
        
        {!currentSlide.imageUrl && currentSlide.requiresImage && (
          <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 p-8 text-center">
            <p className="text-gray-500">🖼️ Imagem não disponível para este slide</p>
          </div>
        )}

        <div className="prose prose-xl max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
            {currentSlide.content}
          </div>
        </div>

        {/* Flashcards Module for Last Slide */}
        {currentSlideIndex === totalSlides - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <InlineFlashcards topic={lesson.subject} />
          </motion.div>
        )}
      </motion.div>
    )
  }

  const calculateTotalScore = () => {
    if (quizResults.length === 0) return null
    
    const totalCorrect = quizResults.reduce((sum, r) => sum + r.score, 0)
    const totalQuestions = quizResults.reduce((sum, r) => sum + r.totalQuestions, 0)
    
    return {
      correct: totalCorrect,
      total: totalQuestions,
      percentage: Math.round((totalCorrect / totalQuestions) * 100)
    }
  }

  const totalScore = calculateTotalScore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/aulas-v2')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {lesson.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {lesson.subject}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {lesson.grade}º ano
                    </Badge>
                    {currentSlide?.timeEstimate && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {currentSlide.timeEstimate} min
                      </Badge>
                    )}
                  </div>
                </div>
                
                {totalScore && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Pontuação Total</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {totalScore.correct}/{totalScore.total}
                    </div>
                    <div className="text-sm text-gray-600">
                      {totalScore.percentage}%
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progresso</span>
                  <span>{currentSlideIndex + 1} / {totalSlides}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slide Content */}
        <Card className="bg-white/90 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentSlide?.title}
                </h2>
                {currentSlide?.type && (
                  <Badge variant={currentSlide.type === 'quiz' ? 'default' : 'secondary'}>
                    {currentSlide.type === 'quiz' ? '📝 Quiz' : '📚 Explicação'}
                  </Badge>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {renderSlideContent()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0 && !showQuizResults}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === currentSlideIndex
                    ? 'bg-purple-500 w-8'
                    : idx < currentSlideIndex
                    ? 'bg-purple-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNextSlide}
            disabled={currentSlideIndex === totalSlides - 1 && !showQuizResults}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {showQuizResults ? 'Continuar' : isQuizSlide ? 'Enviar Respostas' : 'Próximo'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

