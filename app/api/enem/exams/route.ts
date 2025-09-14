import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { enemApi } from '@/lib/enem-api'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Retornar provas ENEM reais dos últimos anos
    const exams = [
      {
        id: 'enem-2023',
        year: 2023,
        type: 'REGULAR',
        description: 'ENEM 2023 - Prova Regular',
        questionsCount: 180
      },
      {
        id: 'enem-2022',
        year: 2022,
        type: 'REGULAR',
        description: 'ENEM 2022 - Prova Regular',
        questionsCount: 180
      },
      {
        id: 'enem-2021',
        year: 2021,
        type: 'REGULAR',
        description: 'ENEM 2021 - Prova Regular',
        questionsCount: 180
      },
      {
        id: 'enem-2020',
        year: 2020,
        type: 'REGULAR',
        description: 'ENEM 2020 - Prova Regular',
        questionsCount: 180
      },
      {
        id: 'enem-2019',
        year: 2019,
        type: 'REGULAR',
        description: 'ENEM 2019 - Prova Regular',
        questionsCount: 180
      },
      {
        id: 'enem-2023-digital',
        year: 2023,
        type: 'DIGITAL',
        description: 'ENEM 2023 - Prova Digital',
        questionsCount: 180
      },
      {
        id: 'enem-2022-digital',
        year: 2022,
        type: 'DIGITAL',
        description: 'ENEM 2022 - Prova Digital',
        questionsCount: 180
      }
    ]
    
    return NextResponse.json({ 
      exams,
      total: exams.length,
      source: 'local-server'
    })

  } catch (error) {
    console.error('ENEM exams API error:', error)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}
