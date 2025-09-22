'use client'

import { useState, useEffect, useCallback } from 'react'

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

interface SuggestionsResponse {
  success: boolean
  suggestions: Suggestion[]
  metadata: {
    total: number
    categories: string[]
    levels: string[]
    difficulties: string[]
  }
  generatedAt: string
  fallback?: boolean
}

interface UseEnhancedSuggestionsOptions {
  category?: string
  level?: string
  difficulty?: string
  search?: string
  sortBy?: 'popularity' | 'alphabetical' | 'time' | 'difficulty'
  limit?: number
  autoLoad?: boolean
}

export function useEnhancedSuggestions(options: UseEnhancedSuggestionsOptions = {}) {
  const {
    category = 'all',
    level = 'all',
    difficulty = 'all',
    search = '',
    sortBy = 'popularity',
    limit = 0,
    autoLoad = true
  } = options

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [metadata, setMetadata] = useState<SuggestionsResponse['metadata'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async (forceRefresh = false) => {
    try {
      console.log(`🔍 Buscando sugestões... forceRefresh: ${forceRefresh}`)
      setLoading(true)
      setError(null)

      // Verificar cache local (válido por 1 hora)
      const cacheKey = `enhanced_suggestions_${category}_${level}_${difficulty}_${search}_${sortBy}_${limit}`
      const cached = localStorage.getItem(cacheKey)
      
      if (!forceRefresh && cached) {
        const { suggestions: cachedSuggestions, metadata: cachedMetadata, generatedAt } = JSON.parse(cached)
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        
        if (new Date(generatedAt).getTime() > oneHourAgo) {
          console.log('Usando sugestões do cache')
          setSuggestions(cachedSuggestions)
          setMetadata(cachedMetadata)
          setLastGenerated(generatedAt)
          setLoading(false)
          return
        }
      }

      console.log('Buscando sugestões da API melhorada...')
      
      // Construir URL com parâmetros
      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      if (level !== 'all') params.append('level', level)
      if (difficulty !== 'all') params.append('difficulty', difficulty)
      if (search) params.append('search', search)
      // Para refresh forçado, usar ordenação aleatória
      const sortParam = forceRefresh ? 'random' : sortBy
      if (sortParam !== 'popularity') params.append('sortBy', sortParam)
      if (limit > 0) params.append('limit', limit.toString())
      
      // Adicionar timestamp para forçar refresh quando necessário
      if (forceRefresh) {
        params.append('_t', Date.now().toString())
      }

      const response = await fetch(`/api/suggestions-enhanced?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(forceRefresh && { 
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          })
        }
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data: SuggestionsResponse = await response.json()
      
      if (!data.success || !data.suggestions) {
        throw new Error('Resposta inválida da API')
      }

      console.log('Sugestões recebidas:', data.suggestions.length)
      
      setSuggestions(data.suggestions)
      setMetadata(data.metadata)
      setLastGenerated(data.generatedAt)
      
      // Salvar no cache
      localStorage.setItem(cacheKey, JSON.stringify({
        suggestions: data.suggestions,
        metadata: data.metadata,
        generatedAt: data.generatedAt
      }))

    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Fallback para sugestões estáticas
      const fallbackSuggestions: Suggestion[] = [
        {
          id: 1,
          text: "Como funciona a fotossíntese?",
          category: "Biologia",
          level: "8º ano",
          description: "Processo fundamental da vida vegetal",
          tags: ["plantas", "energia", "oxigênio"],
          difficulty: "intermediário",
          estimatedTime: 45,
          popularity: 95
        },
        {
          id: 2,
          text: "Matemática dos algoritmos",
          category: "Matemática",
          level: "Ensino Médio",
          description: "A lógica por trás dos algoritmos computacionais",
          tags: ["programação", "lógica", "computação"],
          difficulty: "avançado",
          estimatedTime: 50,
          popularity: 88
        },
        {
          id: 3,
          text: "Causas da Revolução Francesa",
          category: "História",
          level: "9º ano",
          description: "Fatores que levaram à revolução de 1789",
          tags: ["revolução", "França", "século XVIII"],
          difficulty: "intermediário",
          estimatedTime: 40,
          popularity: 92
        }
      ]
      
      setSuggestions(fallbackSuggestions)
      setMetadata({
        total: 3,
        categories: ["Biologia", "Matemática", "História"],
        levels: ["8º ano", "Ensino Médio", "9º ano"],
        difficulties: ["básico", "intermediário", "avançado"]
      })
      setLastGenerated(new Date().toISOString())
    } finally {
      setLoading(false)
    }
  }, [category, level, difficulty, search, sortBy, limit])

  const refreshSuggestions = useCallback(() => {
    console.log('🔄 Forçando refresh das sugestões...')
    // Limpar cache antes de buscar novas sugestões
    const cacheKey = `enhanced_suggestions_${category}_${level}_${difficulty}_${search}_${sortBy}_${limit}`
    localStorage.removeItem(cacheKey)
    fetchSuggestions(true)
  }, [fetchSuggestions, category, level, difficulty, search, sortBy, limit])

  const clearCache = useCallback(() => {
    // Limpar todos os caches de sugestões
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('enhanced_suggestions_')) {
        localStorage.removeItem(key)
      }
    })
    console.log('Cache de sugestões limpo')
  }, [])

  // Carregar sugestões automaticamente quando as dependências mudarem
  useEffect(() => {
    if (autoLoad) {
      fetchSuggestions()
    }
  }, [fetchSuggestions, autoLoad])

  return {
    suggestions,
    metadata,
    loading,
    error,
    lastGenerated,
    refreshSuggestions,
    clearCache,
    fetchSuggestions
  }
}
