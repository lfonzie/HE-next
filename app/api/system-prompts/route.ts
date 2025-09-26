import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock data for system prompts
    const mockPrompts = [
      {
        id: '1',
        key: 'professor.expanded_lesson.system',
        scope: 'production',
        model: 'gpt-4o-mini',
        status: 'active',
        version: 1,
        json: {
          type: 'expanded_lesson',
          role: 'system',
          content: 'Você é um professor experiente...',
          guardrails: [],
          examples: []
        },
        description: 'Prompt para lições expandidas',
        createdBy: 'system',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockPrompts
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock creation
    const newPrompt = {
      id: Date.now().toString(),
      ...body,
      status: 'draft',
      version: 1,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newPrompt
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
