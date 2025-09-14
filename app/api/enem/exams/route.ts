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

    // Buscar provas ENEM reais da API pública
    try {
      const exams = await enemApi.getExams()
      
      return NextResponse.json({ 
        exams,
        total: exams.length,
        source: 'enem-dev-api'
      })
    } catch (error) {
      console.error('Failed to fetch exams from enem.dev:', error)
      
      // Fallback para dados mock se a API falhar
      const mockExams = [
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
        }
      ]
      
      return NextResponse.json({ 
        exams: mockExams,
        total: mockExams.length,
        source: 'mock-data'
      })
    }

  } catch (error) {
    console.error('ENEM exams API error:', error)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}
