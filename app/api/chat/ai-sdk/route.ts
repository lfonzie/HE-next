import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { getSystemPrompt } from '@/lib/ai-sdk-config'
import { orchestrate } from '@/lib/orchestrator'
import { educationalTools } from '@/lib/ai-tools'
import { classifyComplexity, getProviderConfig } from '@/lib/complexity-classifier'
import { logUsageFromCallback } from '@/lib/token-logger'
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
    let targetModule = module || 'auto'
    
    // Se módulo for 'auto', usar orquestrador para classificação
    if (module === 'auto' || !module) {
      try {
        const orchestratorResult = await orchestrate({
          text: lastMessage.content,
          context: { module: 'auto' }
        })
        
        targetModule = orchestratorResult.trace?.module || 'auto'
        console.log('🎯 [ORCHESTRATOR] Module selected:', targetModule)
      } catch (error) {
        console.error('Orchestrator error:', error)
        targetModule = 'auto'
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

    // Classificar complexidade da mensagem
    const complexityResult = classifyComplexity(lastMessageContent, targetModule)
    const complexityLevel = complexityResult.classification
    
    // Obter configuração de provider baseada na complexidade
    const providerConfig = getProviderConfig(complexityLevel)
    
    // Usar Google AI para mensagens triviais, OpenAI para outras
    const useGoogleAI = providerConfig.provider === 'google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY
    
    console.log('🚀 [AI SDK] Starting stream with:', {
      model: providerConfig.model,
      provider: providerConfig.provider,
      tier: providerConfig.tier,
      complexity: complexityLevel,
      module: targetModule,
      messageCount: aiMessages.length,
      useGoogleAI
    })

    // Usar streamText do AI SDK com provider baseado na complexidade
    const result = await streamText({
      model: useGoogleAI ? google(providerConfig.model) : openai(providerConfig.model),
      messages: aiMessages,
      temperature: 0.7,
      // tools: educationalTools, // Temporariamente desabilitado para build
      onFinish: async (result) => {
        console.log('✅ [AI SDK] Stream finished:', {
          finishReason: result.finishReason,
          usage: result.usage,
          provider: providerConfig.provider,
          model: providerConfig.model,
          tier: providerConfig.tier,
          complexity: complexityLevel,
          module: targetModule,
          toolCalls: result.toolCalls?.length || 0
        })

        // Track usage
        try {
          await logUsageFromCallback(
            session.user.id,
            'Chat' as const,
            result,
            providerConfig.model,
            providerConfig.provider,
            undefined, // Response time will be calculated by the logger
            {
              subject: targetModule,
              messages: { module: targetModule, complexity: complexityLevel }
            }
          )
        } catch (error) {
          console.warn('⚠️ [AI SDK] Failed to log usage:', error)
        }
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
