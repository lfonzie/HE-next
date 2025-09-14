import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { enemApi } from '@/lib/enem-api'
import { openai } from '@/lib/openai'
import { ENEM_SYSTEM_PROMPT_ENHANCED } from '@/lib/system-prompts/enem'

// Progressive loading implementation following the architectural guide
// Generates questions in batches of 2 initially, then one at a time on demand

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { area, totalQuestions, currentBatch = 0, batchSize = 2 } = await request.json()

    if (!area || !totalQuestions) {
      return NextResponse.json({ 
        error: 'Area and totalQuestions are required' 
      }, { status: 400 })
    }

    // Calculate how many questions to generate in this batch
    const questionsGenerated = currentBatch * batchSize
    const remainingQuestions = totalQuestions - questionsGenerated
    const currentBatchSize = Math.min(batchSize, remainingQuestions)

    if (currentBatchSize <= 0) {
      return NextResponse.json({ 
        questions: [],
        batch: currentBatch,
        totalGenerated: questionsGenerated,
        completed: true
      })
    }

    console.log(`🔄 Progressive loading: Batch ${currentBatch + 1}, generating ${currentBatchSize} questions for area: ${area}`)

    let questions = []
    let source = 'ai'

    // Try ENEM API first (with fallback)
    try {
      const apiQuestions = await enemApi.getRandomQuestions(area, currentBatchSize)
      if (apiQuestions.length > 0) {
        questions = apiQuestions.map(q => ({
          id: q.id,
          subject: q.subject,
          area: q.area,
          difficulty: q.difficulty || 'Medium',
          year: q.year,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topics: q.topics || [],
          competencies: q.competencies || [],
          source: 'enem.dev'
        }))
        source = 'enem.dev'
        console.log(`✅ Loaded ${questions.length} questions from ENEM API`)
      }
    } catch (error) {
      console.log('ENEM API unavailable, falling back to AI generation')
    }

    // If no questions from API, generate with AI (GPT-4o mini)
    if (questions.length === 0) {
      try {
        const fallbackModel = process.env.ENEM_FALLBACK_MODEL || "gpt-4o-mini"
        
        const prompt = `Generate ${currentBatchSize} ENEM-style questions for the area "${area}". 
        Each question must have:
        - A clear and objective statement
        - 5 alternatives (A, B, C, D, E)
        - One correct alternative
        - Detailed explanation
        
        IMPORTANT: Return ONLY valid JSON, no markdown, no additional text.
        Format must be exactly:
        [
          {
            "id": "progressive_${area}_${currentBatch}_1",
            "subject": "${area}",
            "area": "${area}",
            "difficulty": "Easy|Medium|Difficult",
            "year": 2023,
            "question": "Question statement",
            "options": ["A) alternative 1", "B) alternative 2", "C) alternative 3", "D) alternative 4", "E) alternative 5"],
            "correctAnswer": 0,
            "explanation": "Detailed explanation of the correct answer",
            "topics": ["topic 1", "topic 2"],
            "competencies": ["competency 1", "competency 2"]
          }
        ]`

        const completion = await openai.chat.completions.create({
          model: fallbackModel,
          messages: [
            { role: 'system', content: ENEM_SYSTEM_PROMPT_ENHANCED },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        })

        const response = completion.choices[0]?.message?.content
        if (response) {
          // Clean the response to extract JSON
          let cleanResponse = response.trim()
          
          if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
          } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
          }

          const generatedQuestions = JSON.parse(cleanResponse)
          questions = generatedQuestions.map((q: any) => ({
            id: q.id || `progressive_${area}_${currentBatch}_${Math.random()}`,
            subject: q.subject || area,
            area: q.area || area,
            difficulty: q.difficulty || 'Medium',
            year: q.year || 2023,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            topics: q.topics || [],
            competencies: q.competencies || [],
            source: 'AI Generated (GPT-4o mini)'
          }))
          
          source = 'ai'
          console.log(`✅ Generated ${questions.length} questions using ${fallbackModel}`)
        }
      } catch (error) {
        console.error('AI generation failed:', error)
        // Create mock questions as final fallback
        questions = generateMockQuestions(area, currentBatchSize, currentBatch)
        source = 'mock'
      }
    }

    const responseData = {
      questions,
      batch: currentBatch,
      batchSize: currentBatchSize,
      totalGenerated: questionsGenerated + questions.length,
      totalQuestions,
      completed: questionsGenerated + questions.length >= totalQuestions,
      source,
      canStart: questionsGenerated + questions.length >= Math.min(2, totalQuestions) // Can start after first 2 questions
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Progressive loading error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateMockQuestions(area: string, count: number, batch: number) {
  const mockQuestions = []
  
  for (let i = 1; i <= count; i++) {
    mockQuestions.push({
      id: `mock_${area}_${batch}_${i}`,
      subject: area,
      area: area,
      difficulty: 'Medium',
      year: 2023,
      question: `Esta é uma questão de exemplo da área de ${area}. Questão ${batch * 2 + i} (batch ${batch + 1}).`,
      options: [
        'Alternativa A',
        'Alternativa B', 
        'Alternativa C',
        'Alternativa D',
        'Alternativa E'
      ],
      correctAnswer: 0,
      explanation: `Explicação da questão ${batch * 2 + i} da área de ${area}.`,
      topics: [`Tópico ${i}`],
      competencies: [`Competência ${i}`],
      source: 'mock'
    })
  }
  
  return mockQuestions
}
