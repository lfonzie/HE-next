import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { enemLocalDB } from '@/lib/enem-local-database'


import { enemApi } from '@/lib/enem-api'



export async function POST(request: NextRequest) {
  try {
    const { area, count = 20, year, random = true, useRealQuestions = true } = await request.json()

    if (!area) {
      return NextResponse.json({ error: 'Area is required' }, { status: 400 })
    }

    // Prioriza base de dados local se disponível
    if (enemLocalDB.isAvailable()) {
      try {
        console.log('📁 Using local ENEM database for real questions')
        
        const localFilters = {
          year,
          discipline: area,
          limit: count,
          random
        }

        const localQuestions = await enemLocalDB.getQuestions(localFilters)
        
        if (localQuestions.length > 0) {
          const convertedQuestions = localQuestions.map(q => enemLocalDB.convertToSimulatorFormat(q))
          
          return NextResponse.json({
            questions: convertedQuestions,
            total: convertedQuestions.length,
            source: 'local_database',
            area,
            year: year || 'all',
            success: true
          })
        }
      } catch (error) {
        console.error('Error loading questions from local database:', error)
      }
    }

    // Fallback para API externa
    try {
      console.log('🌐 Falling back to external ENEM API')
      const externalQuestions = await enemApi.getRandomQuestions(area, count)
      
      if (externalQuestions.length > 0) {
        return NextResponse.json({
          questions: externalQuestions,
          total: externalQuestions.length,
          source: 'external_api',
          area,
          year: year || 'all',
          success: true
        })
      }
    } catch (error) {
      console.error('Error loading questions from external API:', error)
    }

    // Não usar IA - apenas questões reais do ENEM
    console.log('❌ Nenhuma questão real do ENEM disponível')
    return NextResponse.json({
      questions: [],
      total: 0,
      source: 'none',
      area,
      year: year || 'all',
      success: false,
      error: 'Nenhuma questão real do ENEM disponível. Apenas questões oficiais são permitidas.'
    })

  } catch (error) {
    console.error('Error in real questions API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        const isLocalAvailable = enemLocalDB.isAvailable()
        const stats = isLocalAvailable ? await enemLocalDB.getStats() : null
        
        return NextResponse.json({
          local_database: {
            available: isLocalAvailable,
            stats
          },
          external_api: {
            available: await enemApi.checkApiAvailability()
          }
        })

      case 'stats':
        if (!enemLocalDB.isAvailable()) {
          return NextResponse.json({ error: 'Local database not available' }, { status: 404 })
        }
        
        const databaseStats = await enemLocalDB.getStats()
        return NextResponse.json(databaseStats)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in real questions GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
