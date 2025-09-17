'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Search, Filter, Clock, Star, Users, Plus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface Lesson {
  id: string
  title: string
  subject: string
  grade: string
  duration: string
  difficulty: string
  objectives: string[]
  tags: string[]
  createdAt: string
  progress?: number
  isCompleted?: boolean
}

export default function AulaPage() {
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  const subjects = [
    'Ciências', 'Matemática', 'História', 'Geografia', 'Português', 
    'Inglês', 'Física', 'Química', 'Biologia', 'Educação Física'
  ]

  const difficulties = [
    { value: 'easy', label: 'Fácil', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Difícil', color: 'bg-red-100 text-red-800' }
  ]

  // Load lessons
  useEffect(() => {
    const loadLessons = async () => {
      try {
        // Load from database
        const response = await fetch('/api/lessons')
        if (response.ok) {
          const data = await response.json()
          setLessons(data)
        } else {
          // Fallback to static lessons
          const staticLessons: Lesson[] = [
            {
              id: 'photosynthesis',
              title: 'Fotossíntese: Do Sol às Folhas',
              subject: 'Ciências',
              grade: '7',
              duration: '45',
              difficulty: 'medium',
              objectives: [
                'Explicar o que é fotossíntese',
                'Descrever os ingredientes e produtos',
                'Entender o processo bioquímico'
              ],
              tags: ['fotossíntese', 'plantas', 'biologia'],
              createdAt: new Date().toISOString()
            }
          ]
          setLessons(staticLessons)
        }
      } catch (error) {
        console.error('Error loading lessons:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLessons()
  }, [])

  // Filter lessons
  useEffect(() => {
    if (!Array.isArray(lessons)) {
      setFilteredLessons([])
      return
    }

    let filtered = [...lessons]

    if (searchTerm) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.objectives.some(obj => obj.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lesson.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(lesson => lesson.subject === selectedSubject)
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(lesson => lesson.grade === selectedGrade)
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(lesson => lesson.difficulty === selectedDifficulty)
    }

    setFilteredLessons(filtered)
  }, [lessons, searchTerm, selectedSubject, selectedGrade, selectedDifficulty])

  const getDifficultyBadge = (difficulty: string) => {
    const diff = difficulties.find(d => d.value === difficulty)
    return diff || difficulties[1] // Default to medium
  }

  const handleStartLesson = (lessonId: string) => {
    router.push(`/aula/${lessonId}`)
  }

  const handleGenerateLesson = () => {
    router.push('/aula/generate')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando aulas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Aulas Interativas
            </h1>
            <p className="text-gray-600">
              Descubra aulas gamificadas e interativas criadas com IA
            </p>
          </div>
          <Button onClick={handleGenerateLesson} size="lg">
            <Sparkles className="h-5 w-5 mr-2" />
            Gerar Nova Aula
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar aulas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Matéria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as matérias</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Série" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as séries</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {grade}º ano
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as dificuldades</SelectItem>
                  {difficulties.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {Array.isArray(filteredLessons) ? filteredLessons.length : 0} aula{(Array.isArray(filteredLessons) ? filteredLessons.length : 0) !== 1 ? 's' : ''} encontrada{(Array.isArray(filteredLessons) ? filteredLessons.length : 0) !== 1 ? 's' : ''}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            Filtros aplicados
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      {!filteredLessons || filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma aula encontrada</h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou gerar uma nova aula personalizada.
            </p>
            <Button onClick={handleGenerateLesson}>
              <Plus className="h-4 w-4 mr-2" />
              Gerar Nova Aula
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(filteredLessons) && filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {lesson.subject}
                    </Badge>
                    <Badge className={getDifficultyBadge(lesson.difficulty).color}>
                      {getDifficultyBadge(lesson.difficulty).label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {lesson.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {lesson.grade}º ano • {lesson.duration} minutos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Objetivos:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {lesson.objectives.slice(0, 2).map((objective, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{objective}</span>
                        </li>
                      ))}
                      {lesson.objectives.length > 2 && (
                        <li className="text-xs text-gray-500">
                          +{lesson.objectives.length - 2} mais objetivos
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {lesson.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {lesson.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{lesson.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Interativo
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartLesson(lesson.id)}
                      size="sm"
                      className="group-hover:bg-blue-600 transition-colors"
                    >
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Features Overview */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-center">Recursos das Aulas Interativas</CardTitle>
          <CardDescription className="text-center">
            Inspirado nas melhores plataformas educacionais do mundo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">IA Avançada</h3>
              <p className="text-sm text-gray-600">
                Geração automática de conteúdo interativo com IA, inspirado no Curipod e Teachy.ai
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Gamificação</h3>
              <p className="text-sm text-gray-600">
                Sistema de pontos, badges e progresso, como no Nearpod e Genially
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Interatividade</h3>
              <p className="text-sm text-gray-600">
                Quizzes, desenhos, discussões e feedback em tempo real
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
