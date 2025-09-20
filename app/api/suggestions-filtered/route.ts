import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import fs from 'fs'


import path from 'path'



interface Suggestion {
  id: number
  text: string
  category: string
  level: string
  description: string
  tags: string[]
}

interface SuggestionsDatabase {
  suggestions: Suggestion[]
  metadata: {
    total: number
    categories: string[]
    levels: string[]
    createdAt: string
    version: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const limit = parseInt(searchParams.get('limit') || '3')
    
    console.log('🔍 Buscando sugestões com filtros:', { category, level, limit })
    
    // Carregar banco de dados de sugestões
    const dataPath = path.join(process.cwd(), 'data', 'lessons-suggestions.json')
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Arquivo de sugestões não encontrado:', dataPath)
      return NextResponse.json({
        success: false,
        error: 'Banco de dados de sugestões não encontrado',
        fallback: true
      }, { status: 500 })
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const database: SuggestionsDatabase = JSON.parse(rawData)
    
    // Aplicar filtros
    let filteredSuggestions = [...database.suggestions]
    
    if (category) {
      filteredSuggestions = filteredSuggestions.filter(
        suggestion => suggestion.category.toLowerCase() === category.toLowerCase()
      )
    }
    
    if (level) {
      filteredSuggestions = filteredSuggestions.filter(
        suggestion => suggestion.level.toLowerCase() === level.toLowerCase()
      )
    }
    
    // Embaralhar e limitar resultados
    const shuffled = filteredSuggestions.sort(() => Math.random() - 0.5)
    const selectedSuggestions = shuffled.slice(0, limit)
    
    console.log(`✅ ${selectedSuggestions.length} sugestões encontradas`)
    
    // Formatar resposta
    const formattedSuggestions = selectedSuggestions.map(suggestion => ({
      text: suggestion.text,
      category: suggestion.category,
      level: suggestion.level,
      description: suggestion.description,
      tags: suggestion.tags
    }))
    
    return NextResponse.json({
      success: true,
      suggestions: formattedSuggestions,
      filters: { category, level, limit },
      totalFound: filteredSuggestions.length,
      generatedAt: new Date().toISOString(),
      method: 'filtered_database'
    })

  } catch (error) {
    console.error('❌ Erro ao buscar sugestões filtradas:', error)
    
    // Fallback para sugestões fixas
    const fallbackSuggestions = [
      {
        text: "Como funciona a fotossíntese?",
        category: "Biologia",
        level: "8º ano",
        description: "Processo fundamental da vida vegetal",
        tags: ["plantas", "energia", "oxigênio"]
      },
      {
        text: "Matemática dos algoritmos",
        category: "Matemática",
        level: "Ensino Médio",
        description: "A lógica por trás dos algoritmos computacionais",
        tags: ["programação", "lógica", "computação"]
      },
      {
        text: "Causas da Revolução Francesa",
        category: "História",
        level: "9º ano",
        description: "Fatores que levaram à revolução de 1789",
        tags: ["revolução", "França", "século XVIII"]
      }
    ]

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      generatedAt: new Date().toISOString(),
      fallback: true,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      method: 'fallback'
    })
  }
}
