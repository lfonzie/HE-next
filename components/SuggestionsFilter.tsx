'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, RefreshCw, Database, Zap } from 'lucide-react'

interface Suggestion {
  text: string
  category: string
  level: string
  description?: string
  tags?: string[]
}

interface SuggestionsFilterProps {
  onSuggestionsChange: (suggestions: Suggestion[]) => void
  onLoadingChange: (loading: boolean) => void
}

export default function SuggestionsFilter({ onSuggestionsChange, onLoadingChange }: SuggestionsFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableLevels, setAvailableLevels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Carregar categorias e níveis disponíveis
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch('/api/suggestions-database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_all' })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data?.metadata) {
            setAvailableCategories(data.data.metadata.categories)
            setAvailableLevels(data.data.metadata.levels)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar metadados:', error)
      }
    }
    
    loadMetadata()
  }, [])

  const fetchFilteredSuggestions = async () => {
    setIsLoading(true)
    onLoadingChange(true)
    
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedLevel) params.append('level', selectedLevel)
      params.append('limit', '3')
      
      const response = await fetch(`/api/suggestions-filtered?${params}`)
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.suggestions) {
        onSuggestionsChange(data.suggestions)
        setLastRefresh(new Date())
        console.log('✅ Sugestões filtradas carregadas:', data.suggestions.length)
      } else {
        throw new Error('Resposta inválida da API')
      }
      
    } catch (error) {
      console.error('Erro ao buscar sugestões filtradas:', error)
      // Fallback para sugestões aleatórias
      const fallbackResponse = await fetch('/api/suggestions-database')
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        if (fallbackData.success) {
          onSuggestionsChange(fallbackData.suggestions)
        }
      }
    } finally {
      setIsLoading(false)
      onLoadingChange(false)
    }
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedLevel('')
  }

  const refreshSuggestions = () => {
    fetchFilteredSuggestions()
  }

  // Carregar sugestões quando os filtros mudarem
  useEffect(() => {
    if (selectedCategory || selectedLevel) {
      fetchFilteredSuggestions()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedLevel])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          Filtros de Sugestões
          <Badge variant="outline" className="ml-auto">
            <Database className="h-3 w-3 mr-1" />
            Banco Local
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Nível</label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os níveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os níveis</SelectItem>
                {availableLevels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={refreshSuggestions} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button 
            onClick={clearFilters} 
            variant="ghost"
            size="sm"
          >
            Limpar Filtros
          </Button>
          
          {(selectedCategory || selectedLevel) && (
            <Badge variant="secondary" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Filtros Ativos
            </Badge>
          )}
        </div>
        
        {lastRefresh && (
          <div className="text-xs text-gray-500">
            Última atualização: {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
