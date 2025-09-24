'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Lightbulb, 
  Search, 
  Filter, 
  BookOpen, 
  Star, 
  Clock, 
  Heart, 
  Target, 
  Zap, 
  Users, 
  Brain, 
  Rocket,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { useEnhancedSuggestions } from '@/hooks/useEnhancedSuggestions'
import { ModernHeader } from '@/components/layout/ModernHeader'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

// Disable prerendering for this page
export const dynamic = 'force-dynamic'

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

function SuggestionsLibraryContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'time' | 'difficulty'>('popularity')
  const [showFilters, setShowFilters] = useState(false)

  const { 
    suggestions, 
    metadata, 
    loading, 
    error, 
    refreshSuggestions 
  } = useEnhancedSuggestions({
    category: selectedCategory,
    level: selectedLevel,
    difficulty: selectedDifficulty,
    search: searchTerm,
    sortBy,
    limit: 0 // Mostrar todas as sugestões
  })

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Redirecionar para a página de aulas com o tópico preenchido
    const params = new URLSearchParams({
      topic: suggestion.text,
      category: suggestion.category,
      level: suggestion.level,
      difficulty: suggestion.difficulty
    })
    window.location.href = `/aulas?${params.toString()}`
  }

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

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedLevel('all')
    setSelectedDifficulty('all')
    setSortBy('popularity')
  }

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || selectedDifficulty !== 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <ModernHeader showNavigation={true} showHome={true} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-white fill-current" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent mb-2">
                    Biblioteca de Sugestões
                  </h1>
                  <p className="text-lg text-gray-600">Explore nossa coleção completa de tópicos educacionais</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/aulas">
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2 border-2 hover:bg-gray-50 transition-all duration-200"
                    size="lg"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Voltar para Aulas
                  </Button>
                </Link>
                <Button 
                  onClick={refreshSuggestions}
                  variant="outline"
                  className="flex items-center gap-2 border-2 hover:bg-gray-50 transition-all duration-200"
                  size="lg"
                  disabled={loading}
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar Sugestões
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-8 border-2 border-yellow-200 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-yellow-600" />
                Filtros e Busca
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="space-y-6">
              {/* Busca */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar por tópico, descrição ou tags
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Digite sua busca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Categoria
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {metadata?.categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nível
                  </label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os níveis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os níveis</SelectItem>
                      {metadata?.levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Dificuldade
                  </label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as dificuldades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as dificuldades</SelectItem>
                      {metadata?.difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ordenar por
                  </label>
                  <Select value={sortBy} onValueChange={(value: 'popularity' | 'alphabetical' | 'time' | 'difficulty') => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularidade</SelectItem>
                      <SelectItem value="alphabetical">Alfabética</SelectItem>
                      <SelectItem value="time">Tempo estimado</SelectItem>
                      <SelectItem value="difficulty">Dificuldade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ações dos filtros */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando {suggestions.length} de {metadata?.total || 0} sugestões
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Grid de Sugestões */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
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
        ) : error ? (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar sugestões</h3>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={refreshSuggestions} variant="outline">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : suggestions.length === 0 ? (
          <Card className="border-2 border-gray-200 bg-gray-50">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma sugestão encontrada</h3>
              <p className="text-gray-500 mb-4">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              <Button onClick={clearFilters} variant="outline">
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="group p-6 text-left border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-white hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1"
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
                    <BookOpen className="h-3 w-3" />
                    <span>Clique para gerar aula</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SuggestionsLibrary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Biblioteca de Sugestões
        </h1>
        <p className="text-gray-600">
          Esta página está temporariamente em manutenção.
        </p>
      </div>
    </div>
  )
}
