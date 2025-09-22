import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Prevent prerendering of this API route
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

export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando busca de sugestões do banco melhorado...')
    
    // Buscar parâmetros de query
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'popularity'
    const limit = parseInt(searchParams.get('limit') || '0')

    // Carregar dados do arquivo JSON
    const filePath = path.join(process.cwd(), 'data', 'lessons-suggestions-enhanced.json')
    
    if (!fs.existsSync(filePath)) {
      console.error('Arquivo de sugestões não encontrado:', filePath)
      throw new Error('Arquivo de sugestões não encontrado')
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)

    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      throw new Error('Formato inválido do arquivo de sugestões')
    }

    let suggestions: Suggestion[] = [...data.suggestions]

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase()
      suggestions = suggestions.filter(suggestion => 
        suggestion.text.toLowerCase().includes(searchLower) ||
        suggestion.description.toLowerCase().includes(searchLower) ||
        suggestion.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (category && category !== 'all') {
      suggestions = suggestions.filter(suggestion => suggestion.category === category)
    }

    if (level && level !== 'all') {
      suggestions = suggestions.filter(suggestion => suggestion.level === level)
    }

    if (difficulty && difficulty !== 'all') {
      suggestions = suggestions.filter(suggestion => suggestion.difficulty === difficulty)
    }

    // Verificar se é um refresh forçado (tem timestamp)
    const isForcedRefresh = searchParams.has('_t')
    
    // Aplicar ordenação
    switch (sortBy) {
      case 'popularity':
        if (isForcedRefresh) {
          // Para refresh forçado, misturar por popularidade mas com alguma randomização
          suggestions.sort((a, b) => {
            const popularityDiff = b.popularity - a.popularity
            // Se a diferença de popularidade for pequena (< 5), randomizar
            if (Math.abs(popularityDiff) < 5) {
              return Math.random() - 0.5
            }
            return popularityDiff
          })
        } else {
          suggestions.sort((a, b) => b.popularity - a.popularity)
        }
        break
      case 'alphabetical':
        suggestions.sort((a, b) => a.text.localeCompare(b.text))
        break
      case 'time':
        suggestions.sort((a, b) => a.estimatedTime - b.estimatedTime)
        break
      case 'difficulty':
        const difficultyOrder = { 'básico': 1, 'intermediário': 2, 'avançado': 3 }
        suggestions.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
        break
      case 'random':
        // Nova opção de ordenação aleatória
        suggestions.sort(() => Math.random() - 0.5)
        break
    }

    // Aplicar limite se especificado
    if (limit > 0) {
      suggestions = suggestions.slice(0, limit)
    }
    
    // Sempre adicionar uma pequena randomização para evitar cache do navegador
    if (suggestions.length > 1) {
      // Embaralhar ligeiramente mantendo a ordem principal
      for (let i = 0; i < Math.min(3, suggestions.length - 1); i++) {
        const j = Math.floor(Math.random() * Math.min(3, suggestions.length - i)) + i
        if (i !== j) {
          [suggestions[i], suggestions[j]] = [suggestions[j], suggestions[i]]
        }
      }
    }

    console.log(`Retornando ${suggestions.length} sugestões filtradas`)
    console.log(`Refresh forçado: ${isForcedRefresh}`)
    console.log(`Primeira sugestão: ${suggestions[0]?.text}`)

    const response: SuggestionsResponse = {
      success: true,
      suggestions,
      metadata: data.metadata,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar sugestões:', error)
    
    // Fallback para sugestões básicas
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

    const fallbackResponse: SuggestionsResponse = {
      success: true,
      suggestions: fallbackSuggestions,
      metadata: {
        total: 3,
        categories: ["Biologia", "Matemática", "História"],
        levels: ["8º ano", "Ensino Médio", "9º ano"],
        difficulties: ["básico", "intermediário", "avançado"]
      },
      generatedAt: new Date().toISOString(),
      fallback: true
    }

    return NextResponse.json(fallbackResponse)
  }
}
