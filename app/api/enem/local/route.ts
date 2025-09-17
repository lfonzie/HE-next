import { NextRequest, NextResponse } from 'next/server'
import { enemLocalDB, LocalEnemFilters } from '@/lib/enem-local-database'

export async function GET(request: NextRequest) {
  try {
    // Verifica se a base de dados local está disponível
    if (!enemLocalDB.isAvailable()) {
      return NextResponse.json({ 
        error: 'Local ENEM database not available',
        available: false 
      }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    switch (action) {
      case 'stats':
        const stats = await enemLocalDB.getStats()
        return NextResponse.json({
          available: true,
          stats
        })

      case 'exams':
        const exams = await enemLocalDB.getExams()
        return NextResponse.json({
          available: true,
          exams
        })

      case 'years':
        const years = await enemLocalDB.getAvailableYears()
        return NextResponse.json({
          available: true,
          years
        })

      case 'disciplines':
        const disciplines = await enemLocalDB.getAvailableDisciplines()
        return NextResponse.json({
          available: true,
          disciplines
        })

      case 'languages':
        const languages = await enemLocalDB.getAvailableLanguages()
        return NextResponse.json({
          available: true,
          languages
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in local ENEM API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      available: false 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verifica se a base de dados local está disponível
    if (!enemLocalDB.isAvailable()) {
      return NextResponse.json({ 
        error: 'Local ENEM database not available',
        available: false 
      }, { status: 404 })
    }

    const body = await request.json()
    const { action, filters = {} } = body

    switch (action) {
      case 'questions':
        const questions = await enemLocalDB.getQuestions(filters as LocalEnemFilters)
        const convertedQuestions = questions.map(q => enemLocalDB.convertToSimulatorFormat(q))
        
        return NextResponse.json({
          available: true,
          questions: convertedQuestions,
          total: questions.length,
          source: 'local_database'
        })

      case 'random':
        const randomQuestions = await enemLocalDB.getRandomQuestions(filters as LocalEnemFilters)
        const convertedRandomQuestions = randomQuestions.map(q => enemLocalDB.convertToSimulatorFormat(q))
        
        return NextResponse.json({
          available: true,
          questions: convertedRandomQuestions,
          total: randomQuestions.length,
          source: 'local_database'
        })

      case 'by-year':
        const { year, ...yearFilters } = filters
        if (!year) {
          return NextResponse.json({ error: 'Year is required' }, { status: 400 })
        }
        
        const yearQuestions = await enemLocalDB.getQuestionsByYear(year, yearFilters)
        const convertedYearQuestions = yearQuestions.map(q => enemLocalDB.convertToSimulatorFormat(q))
        
        return NextResponse.json({
          available: true,
          questions: convertedYearQuestions,
          total: yearQuestions.length,
          year,
          source: 'local_database'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in local ENEM API POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      available: false 
    }, { status: 500 })
  }
}
