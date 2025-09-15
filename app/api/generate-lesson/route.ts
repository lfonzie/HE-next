import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { topic, objectives, methodology, demoMode } = await request.json()

    if (!topic) {
      return NextResponse.json({ 
        error: 'Topic is required' 
      }, { status: 400 })
    }

    // Check if demo mode is enabled or if user is authenticated
    if (!demoMode && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Enhanced prompt for interactive lesson generation
    const prompt = `Generate a comprehensive interactive lesson plan in JSON format for the topic "${topic}".

First, analyze the topic and determine:
1. The appropriate subject/field (e.g., Mathematics, Science, History, Geography, Portuguese, etc.)
2. The appropriate grade level (1st to 12th grade) based on the complexity and content - MUST be a number between 1 and 12
3. The educational context and prerequisites

Then create a lesson plan with the following structure:

{
  "title": "Engaging lesson title",
  "subject": "Inferred subject (e.g., Mathematics, Science, History)",
  "grade": 5,
  "objectives": ["objective1", "objective2", "objective3"],
  "introduction": "Brief introduction to engage students",
  "stages": [
    {
      "etapa": "Stage name",
      "type": "explainer|quiz|interactive|visual|debate|assessment|project",
      "activity": {
        "component": "OpenQuestion|QuizComponent|AnimationSlide|DrawingPrompt|DiscussionBoard|MixedQuiz|UploadTask",
        "content": "Detailed content description",
        "prompt": "Question or prompt for students",
        "questions": [{"q": "question", "options": ["a", "b", "c"], "correct": 0}],
        "media": ["image1.jpg", "video1.mp4"],
        "time": 5,
        "points": 10,
        "feedback": "Immediate feedback explanation"
      },
      "route": "/lessons/${topic.toLowerCase().replace(/\s+/g, '-')}/stage-name"
    }
  ],
  "feedback": {
    "progress": "Show progress tracking",
    "review": "Allow review and revision",
    "challenges": "Mini-challenges for engagement",
    "gamification": "Points and badges system"
  }
}

Requirements:
- Create 6-8 interactive stages that progressively build understanding
- Include diverse activity types: quizzes, open questions, visual animations, discussions
- Add gamification elements (points, badges, progress tracking)
- Make content age-appropriate for the inferred grade level
- Include real-world applications and environmental connections
- Add reflection and discussion opportunities
- Ensure accessibility and engagement
- Infer the most appropriate subject and grade level based on the topic complexity

${objectives ? `Specific objectives to address: ${objectives}` : ''}
${methodology ? `Preferred teaching methodology: ${methodology}` : ''}

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or additional text. The response must be parseable JSON only.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })

    let lessonContent = completion.choices[0].message.content || '{}'
    
    // Clean up markdown formatting if present
    if (lessonContent.includes('```json')) {
      lessonContent = lessonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    
    const lessonData = JSON.parse(lessonContent)

    // Validate the generated lesson structure
    if (!lessonData.title || !lessonData.stages || !Array.isArray(lessonData.stages)) {
      throw new Error('Invalid lesson structure generated')
    }
    
    // Ensure grade is a valid number
    if (!lessonData.grade || isNaN(lessonData.grade)) {
      lessonData.grade = 5 // Default to 5th grade if not specified
    }
    
    // Ensure subject is specified
    if (!lessonData.subject) {
      lessonData.subject = 'General' // Default subject
    }

    // Generate lesson ID
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    let lesson = null
    
    // Only save to database if not in demo mode and user is authenticated
    if (!demoMode && session?.user?.id) {
      try {
        // Save lesson to database
        lesson = await prisma.lessons.create({
          data: {
            id: lessonId,
            title: lessonData.title,
            subject: lessonData.subject,
            level: lessonData.grade,
            objective: lessonData.objectives?.join(', ') || '',
            outline: lessonData.stages.map((stage: any) => ({
              etapa: stage.etapa,
              type: stage.type,
              route: stage.route
            })),
            cards: lessonData.stages.map((stage: any) => ({
              type: stage.type,
              title: stage.etapa,
              content: stage.activity?.content || '',
              prompt: stage.activity?.prompt || '',
              questions: stage.activity?.questions || [],
              time: stage.activity?.time || 5,
              points: stage.activity?.points || 0
            })),
            user_id: session.user.id
          }
        })

        // Log the AI request
        await prisma.ai_requests.create({
          data: {
            tenant_id: 'default',
            user_id: session.user.id,
            session_id: `lesson_gen_${Date.now()}`,
            provider: 'openai',
            model: 'gpt-4o',
            prompt_tokens: completion.usage?.prompt_tokens || 0,
            completion_tokens: completion.usage?.completion_tokens || 0,
            total_tokens: completion.usage?.total_tokens || 0,
            cost_brl: ((completion.usage?.total_tokens || 0) * 0.00003).toString(),
            latency_ms: 0,
            success: true,
            cache_hit: false
          }
        })
      } catch (dbError) {
        console.warn('Database operation failed, continuing in demo mode:', dbError instanceof Error ? dbError.message : String(dbError))
        // Continue with demo mode if database fails
      }
    }

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson?.id || lessonId,
        title: lessonData.title,
        subject: lessonData.subject,
        level: lessonData.grade,
        objectives: lessonData.objectives,
        stages: lessonData.stages,
        feedback: lessonData.feedback,
        demoMode: demoMode || !lesson
      }
    })

  } catch (error) {
    console.error('Lesson generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
