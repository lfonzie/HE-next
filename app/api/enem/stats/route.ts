import { NextRequest, NextResponse } from 'next/server'
import { enemLocalDB } from '@/lib/enem-local-database'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API: Obtendo estatísticas de disponibilidade das questões ENEM')

    if (!enemLocalDB.isAvailable()) {
      return NextResponse.json({ 
        error: 'Base de dados local do ENEM não está disponível' 
      }, { status: 503 })
    }

    // Obter estatísticas gerais
    const generalStats = await enemLocalDB.getStats()
    
    // Obter estatísticas de disponibilidade
    const availableStats = await enemLocalDB.getAvailableStats()

    // Obter anos disponíveis
    const availableYears = await enemLocalDB.getAvailableYears()

    // Obter disciplinas disponíveis
    const availableDisciplines = await enemLocalDB.getAvailableDisciplines()

    // Obter idiomas disponíveis
    const availableLanguages = await enemLocalDB.getAvailableLanguages()

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        isAvailable: true,
        totalYears: generalStats.totalYears,
        availableYears,
        availableDisciplines,
        availableLanguages
      },
      questions: {
        totalListed: generalStats.totalQuestions,
        totalAvailable: availableStats.totalAvailableQuestions,
        availabilityRate: availableStats.availabilityRate,
        byYear: availableStats.questionsByYear,
        byDiscipline: availableStats.questionsByDiscipline
      },
      summary: {
        message: `Sistema funcionando com ${availableStats.availabilityRate.toFixed(1)}% de disponibilidade`,
        status: availableStats.availabilityRate > 80 ? 'excellent' : 
                availableStats.availabilityRate > 60 ? 'good' : 'needs_attention'
      }
    }

    console.log(`✅ Estatísticas retornadas: ${availableStats.totalAvailableQuestions}/${generalStats.totalQuestions} questões disponíveis (${availableStats.availabilityRate.toFixed(1)}%)`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'refresh') {
      console.log('🔄 API: Atualizando cache das estatísticas')
      
      // Limpar cache (se implementado)
      // await enemLocalDB.clearCache()
      
      // Recalcular estatísticas
      const availableStats = await enemLocalDB.getAvailableStats()
      
      return NextResponse.json({
        success: true,
        message: 'Cache atualizado com sucesso',
        timestamp: new Date().toISOString(),
        stats: {
          totalAvailable: availableStats.totalAvailableQuestions,
          totalListed: availableStats.totalListedQuestions,
          availabilityRate: availableStats.availabilityRate
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Ação não reconhecida',
      availableActions: ['refresh']
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Erro ao processar ação:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
