import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { getSystemPrompt } from '@/lib/ai-sdk-config'
import { orchestrate } from '@/lib/orchestrator'
import { educationalTools } from '@/lib/ai-tools'
import '@/lib/orchestrator-modules' // ensure modules are registered

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação - OBRIGATÓRIO
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, module } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages are required', { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content) {
      return new Response('Last message content is required', { status: 400 })
    }

    console.log('🤖 AI SDK Chat request:', {
      message: lastMessage.content,
      module: module || 'auto',
      messageCount: messages.length
    })

    // Verificar se a chave da OpenAI está configurada
    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 })
    }

    // Determinar módulo se não especificado
    let targetModule = module || 'atendimento'
    
    // Se módulo for 'auto', usar orquestrador para classificação
    if (module === 'auto' || !module) {
      try {
        const orchestratorResult = await orchestrate({
          text: lastMessage.content,
          context: { module: 'auto' }
        })
        
        targetModule = orchestratorResult.trace?.module || 'atendimento'
        console.log('🎯 [ORCHESTRATOR] Module selected:', targetModule)
      } catch (error) {
        console.error('Orchestrator error:', error)
        targetModule = 'atendimento'
      }
    }

    // Obter system prompt para o módulo
    const systemPrompt = getSystemPrompt(targetModule)
    
    // Preparar mensagens para o AI SDK
    const aiMessages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    // Detectar se é uma conversa simples (priorizar Google AI)
    const lastMessageContent = lastMessage.content
    const isSimpleChat = lastMessageContent.length < 100 && 
                        !lastMessageContent.includes('matemática') && 
                        !lastMessageContent.includes('física') && 
                        !lastMessageContent.includes('química')
    
    // Usar Google AI para conversas simples, OpenAI para outras
    const useGoogleAI = isSimpleChat && process.env.GOOGLE_GENERATIVE_AI_API_KEY
    
    console.log('🚀 [AI SDK] Starting stream with:', {
      model: useGoogleAI ? 'gemini-2.0-flash-exp' : 'gpt-4o-mini',
      provider: useGoogleAI ? 'google' : 'openai',
      module: targetModule,
      messageCount: aiMessages.length,
      isSimpleChat,
      useGoogleAI
    })

    // Usar streamText do AI SDK com OpenAI
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: aiMessages,
      temperature: 0.7,
      // tools: educationalTools, // Temporariamente desabilitado para build
      onFinish: (result) => {
        console.log('✅ [AI SDK] Stream finished:', {
          finishReason: result.finishReason,
          usage: result.usage,
          provider: useGoogleAI ? 'google' : 'openai',
          module: targetModule,
          toolCalls: result.toolCalls?.length || 0
        })
      }
    })

    // Retornar como stream de texto
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Module': targetModule,
        'X-Model': useGoogleAI ? 'gemini-2.0-flash-exp' : 'gpt-4o-mini',
        'X-Provider': useGoogleAI ? 'google' : 'openai',
        'X-Timestamp': Date.now().toString()
      }
    })

  } catch (error) {
    console.error('❌ AI SDK Chat Error:', error)
    
    // Retornar erro como stream
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        timestamp: Date.now()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

// Configurações de CORS para desenvolvimento
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
