'use client'

import { useState, useEffect } from 'react'

interface Suggestion {
  text: string
  category: string
  level: string
}

interface SuggestionsResponse {
  success: boolean
  suggestions: Suggestion[]
  generatedAt: string
  fallback?: boolean
}

export function useDynamicSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  const fetchSuggestions = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Verificar cache local (válido por 30 minutos para banco local)
      const cacheKey = 'dynamic_suggestions_cache'
      const cached = localStorage.getItem(cacheKey)
      
      if (!forceRefresh && cached) {
        const { suggestions: cachedSuggestions, generatedAt } = JSON.parse(cached)
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000)
        
        if (new Date(generatedAt).getTime() > thirtyMinutesAgo) {
          console.log('Usando sugestões do cache (banco local)')
          setSuggestions(cachedSuggestions)
          setLastGenerated(generatedAt)
          setLoading(false)
          return
        }
      }

      console.log('Buscando sugestões do banco de dados local...')
      
      const response = await fetch('/api/suggestions-database', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Adicionar cache busting para forçar nova geração
        ...(forceRefresh && { 
          headers: { 
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data: SuggestionsResponse = await response.json()
      
      if (!data.success || !data.suggestions) {
        throw new Error('Resposta inválida da API')
      }

      console.log('Sugestões recebidas:', data.suggestions)
      
      setSuggestions(data.suggestions)
      setLastGenerated(data.generatedAt)
      
      // Salvar no cache
      localStorage.setItem(cacheKey, JSON.stringify({
        suggestions: data.suggestions,
        generatedAt: data.generatedAt
      }))

    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Fallback para sugestões estáticas
      const fallbackSuggestions: Suggestion[] = [
        {
          text: "Como funciona a fotossíntese?",
          category: "Biologia",
          level: "8º ano"
        },
        {
          text: "Matemática dos algoritmos",
          category: "Matemática",
          level: "Ensino Médio"
        },
        {
          text: "Causas da Revolução Francesa",
          category: "História",
          level: "9º ano"
        }
      ]
      
      setSuggestions(fallbackSuggestions)
      setLastGenerated(new Date().toISOString())
    } finally {
      setLoading(false)
    }
  }

  const refreshSuggestions = () => {
    fetchSuggestions(true)
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  return {
    suggestions,
    loading,
    error,
    lastGenerated,
    refreshSuggestions
  }
}
