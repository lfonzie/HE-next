import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


interface Suggestion {
  text: string
  category: string
  level: string
}

// Sugestões pré-definidas que são embaralhadas a cada chamada
const SUGGESTIONS_POOL: Suggestion[] = [
  {
    text: "Como funciona a fotossíntese e por que é importante para a vida na Terra?",
    category: "Biologia",
    level: "8º ano"
  },
  {
    text: "A matemática por trás dos algoritmos de redes sociais",
    category: "Matemática",
    level: "Ensino Médio"
  },
  {
    text: "Por que alguns países são mais desenvolvidos que outros?",
    category: "Geografia",
    level: "9º ano"
  },
  {
    text: "Como a inteligência artificial está mudando o mundo do trabalho?",
    category: "Tecnologia",
    level: "Ensino Médio"
  },
  {
    text: "A física dos esportes: por que alguns atletas são mais rápidos?",
    category: "Física",
    level: "9º ano"
  },
  {
    text: "Como funciona a vacinação e por que é importante?",
    category: "Biologia",
    level: "7º ano"
  },
  {
    text: "A história da Revolução Industrial e seus impactos hoje",
    category: "História",
    level: "8º ano"
  },
  {
    text: "Por que o clima está mudando e o que podemos fazer?",
    category: "Geografia",
    level: "6º ano"
  },
  {
    text: "A química dos alimentos: por que alguns fazem mal?",
    category: "Química",
    level: "Ensino Médio"
  },
  {
    text: "Como a literatura brasileira reflete nossa sociedade?",
    category: "Literatura",
    level: "Ensino Médio"
  },
  {
    text: "A matemática do crescimento populacional",
    category: "Matemática",
    level: "8º ano"
  },
  {
    text: "Como funcionam as redes sociais e seus algoritmos?",
    category: "Tecnologia",
    level: "9º ano"
  }
]

export async function GET(request: NextRequest) {
  try {
    console.log('Gerando sugestões dinâmicas...')
    
    // Embaralhar as sugestões e pegar 3 aleatórias
    const shuffled = [...SUGGESTIONS_POOL].sort(() => Math.random() - 0.5)
    const selectedSuggestions = shuffled.slice(0, 3)
    
    console.log('Sugestões selecionadas:', selectedSuggestions)
    
    return NextResponse.json({
      success: true,
      suggestions: selectedSuggestions,
      generatedAt: new Date().toISOString(),
      method: 'random_selection'
    })

  } catch (error) {
    console.error('Erro ao gerar sugestões:', error)
    
    // Fallback para sugestões fixas em caso de erro
    const fallbackSuggestions: Suggestion[] = [
      {
        text: "Como funciona a fotossíntese e por que é importante para a vida na Terra?",
        category: "Biologia",
        level: "8º ano"
      },
      {
        text: "A matemática por trás dos algoritmos de redes sociais",
        category: "Matemática",
        level: "Ensino Médio"
      },
      {
        text: "Por que alguns países são mais desenvolvidos que outros?",
        category: "Geografia",
        level: "9º ano"
      }
    ]

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      generatedAt: new Date().toISOString(),
      fallback: true,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
