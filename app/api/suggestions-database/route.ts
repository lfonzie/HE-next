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
    console.log('📚 Carregando sugestões do banco de dados local...')
    
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
    
    console.log(`✅ Banco carregado: ${database.suggestions.length} sugestões disponíveis`)
    
    // Embaralhar e selecionar 3 sugestões aleatórias
    const shuffled = [...database.suggestions].sort(() => Math.random() - 0.5)
    const selectedSuggestions = shuffled.slice(0, 3)
    
    console.log('🎯 Sugestões selecionadas:', selectedSuggestions.map(s => s.text))
    
    // Formatar resposta no formato esperado pelo frontend
    const formattedSuggestions = selectedSuggestions.map(suggestion => ({
      text: suggestion.text,
      category: suggestion.category,
      level: suggestion.level
    }))
    
    return NextResponse.json({
      success: true,
      suggestions: formattedSuggestions,
      generatedAt: new Date().toISOString(),
      method: 'local_database',
      totalAvailable: database.suggestions.length,
      metadata: {
        categories: database.metadata.categories,
        levels: database.metadata.levels,
        version: database.metadata.version
      }
    })

  } catch (error) {
    console.error('❌ Erro ao carregar sugestões:', error)
    
    // Fallback para sugestões fixas em caso de erro
    const fallbackSuggestions = [
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

// Endpoint para obter todas as sugestões (para debug/admin)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'get_all') {
      const dataPath = path.join(process.cwd(), 'data', 'lessons-suggestions.json')
      
      if (!fs.existsSync(dataPath)) {
        return NextResponse.json({
          success: false,
          error: 'Banco de dados não encontrado'
        }, { status: 404 })
      }

      const rawData = fs.readFileSync(dataPath, 'utf-8')
      const database: SuggestionsDatabase = JSON.parse(rawData)
      
      return NextResponse.json({
        success: true,
        data: database
      })
    }
    
    if (action === 'get_by_category') {
      const { category } = await request.json()
      
      const dataPath = path.join(process.cwd(), 'data', 'lessons-suggestions.json')
      const rawData = fs.readFileSync(dataPath, 'utf-8')
      const database: SuggestionsDatabase = JSON.parse(rawData)
      
      const filteredSuggestions = database.suggestions.filter(
        suggestion => suggestion.category.toLowerCase() === category.toLowerCase()
      )
      
      return NextResponse.json({
        success: true,
        suggestions: filteredSuggestions,
        category,
        count: filteredSuggestions.length
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Ação não reconhecida'
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro no endpoint POST:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
