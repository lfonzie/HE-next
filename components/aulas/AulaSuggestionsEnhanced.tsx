'use client'

import { memo, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Lightbulb, 
  RefreshCw, 
  Send, 
  TrendingUp, 
  AlertCircle, 
  Filter, 
  Search,
  BookOpen,
  Star,
  Clock,
  Users,
  Zap,
  Target,
  Heart,
  Brain,
  Rocket
} from 'lucide-react'

interface Suggestion {
  id: number
  text: string
  category: string
  level: string
  description: string
  tags: string[]
  difficulty: 'básico' | 'intermediário' | 'avançado'
  estimatedTime: number
  popularity: number
}

interface SuggestionsData {
  suggestions: Suggestion[]
  metadata: {
    total: number
    categories: string[]
    levels: string[]
    difficulties: string[]
  }
}

interface AulaSuggestionsEnhancedProps {
  onSuggestionClick: (suggestion: Suggestion) => void
  isGenerating: boolean
  className?: string
}

const AulaSuggestionsEnhanced = memo(({ onSuggestionClick, isGenerating, className }: AulaSuggestionsEnhancedProps) => {
  const [suggestionsData, setSuggestionsData] = useState<SuggestionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'time'>('popularity')

  // Carregar dados das sugestões
  const loadSuggestions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/data/lessons-suggestions-enhanced.json')
      if (!response.ok) {
        throw new Error('Erro ao carregar sugestões')
      }
      
      const data = await response.json()
      setSuggestionsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados na inicialização
  useState(() => {
    loadSuggestions()
  })

  // Filtrar e ordenar sugestões
  const filteredSuggestions = useMemo(() => {
    if (!suggestionsData) return []

    let filtered = suggestionsData.suggestions

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(suggestion => 
        suggestion.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.category === selectedCategory)
    }

    // Filtro por nível
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.level === selectedLevel)
    }

    // Filtro por dificuldade
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.difficulty === selectedDifficulty)
    }

    // Ordenação
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity)
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.text.localeCompare(b.text))
        break
      case 'time':
        filtered.sort((a, b) => a.estimatedTime - b.estimatedTime)
        break
    }

    return filtered
  }, [suggestionsData, searchTerm, selectedCategory, selectedLevel, selectedDifficulty, sortBy])

  // Obter cores da dificuldade
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'básico':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediário':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'avançado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Obter ícone da categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Biologia':
        return <Heart className="h-4 w-4" />
      case 'Matemática':
        return <Target className="h-4 w-4" />
      case 'História':
        return <BookOpen className="h-4 w-4" />
      case 'Física':
        return <Zap className="h-4 w-4" />
      case 'Geografia':
        return <Users className="h-4 w-4" />
      case 'Química':
        return <Brain className="h-4 w-4" />
      case 'Tecnologia':
        return <Rocket className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card className={`border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 ${className}`}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Lightbulb className="h-7 w-7 text-yellow-500" />
            Sugestões Inteligentes
          </CardTitle>
          <CardDescription className="text-base">
            Carregando sugestões personalizadas...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-6 border-2 border-gray-200 rounded-xl bg-gray-50 animate-pulse">
                <div className="h-6 bg-gray-300 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-300 rounded-lg w-2/3 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`border-2 border-red-100 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 ${className}`}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-red-600">
            <AlertCircle className="h-7 w-7" />
            Erro ao Carregar Sugestões
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <Button onClick={loadSuggestions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-7 w-7 text-yellow-500" />
            Sugestões Inteligentes
          </CardTitle>
          <Button
            onClick={loadSuggestions}
            variant="outline"
            size="sm"
            className="ml-2"
            disabled={loading}
            aria-label="Atualizar sugestões"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-base">
          {suggestionsData?.metadata.total || 0} sugestões personalizadas com filtros inteligentes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Filtros e Busca */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por tópico, descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {suggestionsData?.metadata.categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {suggestionsData?.metadata.levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as dificuldades</SelectItem>
                {suggestionsData?.metadata.difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'popularity' | 'alphabetical' | 'time') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularidade</SelectItem>
                <SelectItem value="alphabetical">Alfabética</SelectItem>
                <SelectItem value="time">Tempo estimado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {filteredSuggestions.length} de {suggestionsData?.metadata.total || 0} sugestões
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || selectedDifficulty !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedLevel('all')
                  setSelectedDifficulty('all')
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Grid de Sugestões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionClick(suggestion)}
              className="group p-6 text-left border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-white hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGenerating}
              aria-label={`Gerar aula sobre ${suggestion.text}`}
            >
              <div className="space-y-3">
                {/* Header com ícone e título */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    {getCategoryIcon(suggestion.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-800 leading-relaxed text-sm">
                      {suggestion.text}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {suggestion.description}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {suggestion.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {suggestion.level}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-1 ${getDifficultyColor(suggestion.difficulty)}`}
                  >
                    {suggestion.difficulty}
                  </Badge>
                </div>

                {/* Footer com métricas */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{suggestion.estimatedTime}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{suggestion.popularity}%</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {suggestion.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {suggestion.tags.length > 3 && (
                    <span className="text-xs text-gray-400 px-2 py-1">
                      +{suggestion.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Call to action */}
                <div className="flex items-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Send className="h-3 w-3" />
                  <span>Clique para gerar automaticamente</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredSuggestions.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma sugestão encontrada</h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedLevel('all')
                setSelectedDifficulty('all')
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-blue-200">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-700">
              Ou descreva seu próprio tópico abaixo
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

AulaSuggestionsEnhanced.displayName = 'AulaSuggestionsEnhanced'

export default AulaSuggestionsEnhanced
