import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { area, count, year, random } = await request.json()

    if (!area || !count) {
      return NextResponse.json({ 
        error: 'Missing required parameters: area and count' 
      }, { status: 400 })
    }

    // Mapear área para disciplina do servidor local ENEM
    const disciplineMap: Record<string, string> = {
      'linguagens': 'linguagens',
      'matematica': 'matematica', 
      'natureza': 'ciencias-natureza',
      'humanas': 'ciencias-humanas',
      'ciencias-natureza': 'ciencias-natureza',
      'ciencias-humanas': 'ciencias-humanas'
    }

    const discipline = disciplineMap[area.toLowerCase()] || area.toLowerCase()
    const targetYear = year || 2023

    try {
      // Buscar questões do servidor local ENEM
      const response = await fetch(`http://localhost:3001/v1/exams/${targetYear}/questions?limit=${count}&offset=0`)
      
      if (!response.ok) {
        throw new Error(`ENEM API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format from ENEM API')
      }

      // Filtrar questões por disciplina se especificado
      let filteredQuestions = data.questions
      if (discipline !== 'all') {
        filteredQuestions = data.questions.filter((q: any) => 
          q.discipline === discipline
        )
      }

      // Se random=true, embaralhar as questões
      if (random) {
        filteredQuestions = filteredQuestions.sort(() => Math.random() - 0.5)
      }

      // Limitar ao número solicitado
      const selectedQuestions = filteredQuestions.slice(0, count)

      // Converter para formato interno
      const formattedQuestions = selectedQuestions.map((q: any, index: number) => ({
        id: `enem_${targetYear}_${q.index}`,
        subject: q.discipline,
        area: discipline,
        difficulty: 'Médio',
        year: targetYear,
        question: q.context || q.title || `Questão ${q.index}`,
        options: q.alternatives ? q.alternatives.map((alt: any) => alt.text) : [
          'Alternativa A',
          'Alternativa B', 
          'Alternativa C',
          'Alternativa D',
          'Alternativa E'
        ],
        correctAnswer: q.alternatives ? q.alternatives.findIndex((alt: any) => alt.isCorrect) : 0,
        explanation: q.explanation || 'Explicação não disponível',
        topics: [],
        competencies: []
      }))

      console.log(`✅ Loaded ${formattedQuestions.length} real ENEM questions from local server`)

      return NextResponse.json({ 
        questions: formattedQuestions,
        source: 'enem-local-server',
        total: formattedQuestions.length
      })

    } catch (error) {
      console.error('Failed to fetch from ENEM local server:', error)
      
      // Fallback: retornar questões mock
      const mockQuestions = Array.from({ length: count }, (_, index) => ({
        id: `mock_${targetYear}_${index + 1}`,
        subject: discipline,
        area: discipline,
        difficulty: 'Médio',
        year: targetYear,
        question: `Questão ${index + 1} de ${area} - ENEM ${targetYear}`,
        options: [
          'Alternativa A',
          'Alternativa B',
          'Alternativa C', 
          'Alternativa D',
          'Alternativa E'
        ],
        correctAnswer: Math.floor(Math.random() * 5),
        explanation: 'Questão de exemplo',
        topics: [],
        competencies: []
      }))

      return NextResponse.json({ 
        questions: mockQuestions,
        source: 'mock-fallback',
        total: mockQuestions.length
      })
    }

  } catch (error) {
    console.error('ENEM real questions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}