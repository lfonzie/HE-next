import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai, MODULE_SYSTEM_PROMPTS, selectModel, getModelConfig } from '@/lib/openai'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, module, history } = await request.json()

    // Get system prompt for module
    const systemPrompt = MODULE_SYSTEM_PROMPTS[module as keyof typeof MODULE_SYSTEM_PROMPTS] || MODULE_SYSTEM_PROMPTS.professor

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      ...history,
      {
        role: 'user' as const,
        content: message
      }
    ]

    // Selecionar modelo baseado na complexidade da mensagem
    const selectedModel = selectModel(message, module)
    const modelConfig = getModelConfig(selectedModel)
    
    console.log(`Using model: ${selectedModel} for module: ${module}`)
    
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages,
      stream: modelConfig.stream,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
    })

    const stream = new ReadableStream({
      async start(controller) {
        if (modelConfig.stream) {
          const stream = completion as any
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
        } else {
          // Non-streaming response
          const response = completion as any
          const content = response.choices[0]?.message?.content || ''
          if (content) {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
