'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, BookOpen } from 'lucide-react'
import EnhancedQuizComponent from '@/components/interactive/EnhancedQuizComponent'

interface QuizQuestion {
  id?: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  points?: number
  timeEstimate?: number
  hint?: string
}

export default function QuizDemo() {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [count, setCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null)

  const generateQuiz = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          count
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar quiz')
      }

      const data = await response.json()
      setQuestions(data.questions)
      setShowQuiz(true)
      setQuizScore(null)
    } catch (error) {
      console.error('Erro ao gerar quiz:', error)
      alert('Erro ao gerar quiz. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore({ score, total })
  }

  const resetQuiz = () => {
    setShowQuiz(false)
    setQuestions([])
    setQuizScore(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Gerador de Quiz Educacional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico do Quiz</Label>
              <Input
                id="topic"
                placeholder="Ex: Fotossíntese, Matemática, História..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="count">Número de Questões</Label>
              <Select value={count.toString()} onValueChange={(value) => setCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 questões</SelectItem>
                  <SelectItem value="5">5 questões</SelectItem>
                  <SelectItem value="10">10 questões</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={generateQuiz} 
            disabled={!topic.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando Quiz...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Gerar Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {showQuiz && questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{difficulty}</Badge>
                Quiz: {topic}
              </CardTitle>
              <Button onClick={resetQuiz} variant="outline" size="sm">
                Novo Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EnhancedQuizComponent
              questions={questions}
              onComplete={(score, total, results) => handleQuizComplete(score, total)}
              showExplanations={true}
              allowRetry={true}
            />
          </CardContent>
        </Card>
      )}

      {quizScore && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado Final</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold">
                {quizScore.score}/{quizScore.total} questões corretas
              </div>
              <div className="text-lg text-gray-600">
                {Math.round((quizScore.score / quizScore.total) * 100)}% de acertos
              </div>
              <Button onClick={resetQuiz} className="mt-4">
                Criar Novo Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
