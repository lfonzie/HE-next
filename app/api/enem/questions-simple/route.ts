import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Endpoint simples para obter questões ENEM (sem autenticação para testes)
export async function GET(request: NextRequest) {
  try {
    console.log('API /api/enem/questions chamada - retornando questões básicas')
    
    // Questões básicas para teste
    const questions = [
      {
        id: 'test-1',
        year: 2024,
        area: 'matematica',
        discipline: 'Matemática',
        question: 'Qual é o valor de 2 + 2?',
        alternatives: [
          { letter: 'A', text: '3' },
          { letter: 'B', text: '4' },
          { letter: 'C', text: '5' },
          { letter: 'D', text: '6' },
          { letter: 'E', text: '7' }
        ],
        correctAnswer: 'B',
        explanation: 'A soma de 2 + 2 é igual a 4.',
        difficulty: 'Fácil',
        source: 'Teste'
      },
      {
        id: 'test-2',
        year: 2024,
        area: 'portugues',
        discipline: 'Língua Portuguesa',
        question: 'Qual é o plural de "casa"?',
        alternatives: [
          { letter: 'A', text: 'casas' },
          { letter: 'B', text: 'casos' },
          { letter: 'C', text: 'casais' },
          { letter: 'D', text: 'casões' },
          { letter: 'E', text: 'casos' }
        ],
        correctAnswer: 'A',
        explanation: 'O plural de "casa" é "casas".',
        difficulty: 'Fácil',
        source: 'Teste'
      }
    ]

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
      message: `${questions.length} questões disponíveis para teste`
    })
    
  } catch (error) {
    console.error('Erro ao obter questões ENEM:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar as questões ENEM'
      },
      { status: 500 }
    )
  }
}
