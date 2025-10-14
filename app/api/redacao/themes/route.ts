import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Endpoint simples para obter temas de redação (sem autenticação para testes)
export async function GET(request: NextRequest) {
  try {
    console.log('API /api/redacao/themes chamada - retornando temas básicos')
    
    // Temas básicos para teste
    const themes = [
      {
        id: '2024-1',
        year: 2024,
        theme: 'Inclusão digital como direito de todos',
        description: 'Tema da redação ENEM 2024 - 1º dia',
        isOfficial: true
      },
      {
        id: '2023-1',
        year: 2023,
        theme: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
        description: 'Tema da redação ENEM 2023 - 1º dia',
        isOfficial: true
      },
      {
        id: '2022-1',
        year: 2022,
        theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
        description: 'Tema da redação ENEM 2022 - 1º dia',
        isOfficial: true
      },
      {
        id: 'test-1',
        year: 2025,
        theme: 'A importância da educação no Brasil',
        description: 'Tema de teste para verificação do sistema',
        isOfficial: false
      }
    ]

    return NextResponse.json({
      success: true,
      themes,
      count: themes.length,
      message: `${themes.length} temas disponíveis para teste`
    })
    
  } catch (error) {
    console.error('Erro ao obter temas de redação:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar os temas de redação'
      },
      { status: 500 }
    )
  }
}
