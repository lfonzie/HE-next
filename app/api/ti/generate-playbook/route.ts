import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIPlaybookGenerator } from '@/app/ti/lib/ai-playbook-generator'

export const runtime = 'nodejs'

const requestSchema = z.object({
  problem: z.string().min(10, 'Descrição do problema deve ter pelo menos 10 caracteres'),
  context: z.object({
    deviceLabel: z.string().optional(),
    issueType: z.string().optional(),
    userId: z.string().optional()
  }).optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { problem, context } = requestSchema.parse(body)

    // Generate playbook using AI
    const generator = AIPlaybookGenerator.getInstance()
    const playbook = await generator.generatePlaybook(problem, context)

    return NextResponse.json({
      success: true,
      playbook,
      generated: true,
      timestamp: new Date().toISOString(),
      message: 'Playbook gerado com sucesso via IA'
    })

  } catch (error) {
    console.error('AI Playbook generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate playbook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to show cached playbooks
export async function GET(req: NextRequest) {
  try {
    const generator = AIPlaybookGenerator.getInstance()
    const cachedPlaybooks = generator.getCachedPlaybooks()
    
    const playbooks = Array.from(cachedPlaybooks.entries()).map(([key, playbook]) => ({
      key,
      issue: playbook.issue,
      title: playbook.metadata.title,
      category: playbook.metadata.category,
      complexity: playbook.metadata.complexity,
      stepsCount: Object.keys(playbook.steps).length
    }))

    return NextResponse.json({
      success: true,
      playbooks,
      total: playbooks.length,
      message: 'Playbooks em cache recuperados'
    })

  } catch (error) {
    console.error('Error retrieving cached playbooks:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve playbooks' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to clear cache
export async function DELETE(req: NextRequest) {
  try {
    const generator = AIPlaybookGenerator.getInstance()
    generator.clearCache()

    return NextResponse.json({
      success: true,
      message: 'Cache de playbooks limpo com sucesso'
    })

  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
