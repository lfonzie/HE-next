import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { perplexity } from '@ai-sdk/perplexity'
import { getSystemPrompt } from '@/lib/system-message-loader'
import { orchestrate } from '@/lib/orchestrator'
import { educationalTools } from '@/lib/ai-tools'
import { classifyComplexity, getProviderConfig } from '@/lib/complexity-classifier'
import { logUsageFromCallback } from '@/lib/token-logger'
import { selectChatProvider, getChatProviderConfig } from '@/lib/chat-providers-config'
import '@/lib/orchestrator-modules' // ensure modules are registered


// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

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

    // Verificar se pelo menos uma chave de API está configurada
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasGoogle = !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
    const hasPerplexity = !!process.env.PERPLEXITY_API_KEY
    
    if (!hasOpenAI && !hasGoogle && !hasPerplexity) {
      return new Response('No AI API keys configured', { status: 500 })
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
    const complexityResult = classifyComplexity(lastMessage.content, targetModule)
    const complexityLevel = complexityResult.classification
    
    // Detectar se precisa de busca na web
    const requiresWebSearch = lastMessage.content.toLowerCase().includes('pesquisar') ||
                             lastMessage.content.toLowerCase().includes('buscar') ||
                             lastMessage.content.toLowerCase().includes('notícias') ||
                             lastMessage.content.toLowerCase().includes('atual') ||
                             lastMessage.content.toLowerCase().includes('recente')
    
    // Selecionar provider baseado na complexidade e contexto
    const selectedProvider = selectChatProvider(complexityLevel, {
      module: targetModule,
      requiresWebSearch,
      requiresLatestInfo: requiresWebSearch
    })
    
    if (!selectedProvider) {
      return new Response('No available AI providers', { status: 500 })
    }
    
    // Criar cliente do provider selecionado
    const modelClient = selectedProvider.createClient(selectedProvider.models[complexityLevel])
    
    console.log('🚀 [AI SDK] Starting stream with:', {
      model: selectedProvider.models[complexityLevel],
      provider: selectedProvider.id,
      complexity: complexityLevel,
      module: targetModule,
      messageCount: aiMessages.length,
      requiresWebSearch,
      description: selectedProvider.description
    })

    // Usar streamText do AI SDK com provider selecionado
    const result = await streamText({
      model: modelClient,
      messages: aiMessages,
      temperature: 0.7,
      // tools: educationalTools, // Temporariamente desabilitado para build
      onFinish: async (result) => {
        console.log('✅ [AI SDK] Stream finished:', {
          finishReason: result.finishReason,
          usage: result.usage,
          provider: selectedProvider.id,
          model: selectedProvider.models[complexityLevel],
          complexity: complexityLevel,
          module: targetModule,
          toolCalls: result.toolCalls?.length || 0,
          requiresWebSearch
        })

        // Track usage
        try {
          await logUsageFromCallback(
            session.user.id,
            'Chat' as const,
            result,
            selectedProvider.models[complexityLevel],
            selectedProvider.id,
            undefined, // Response time will be calculated by the logger
            {
              subject: targetModule,
              messages: { module: targetModule, complexity: complexityLevel, webSearch: requiresWebSearch }
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
        'X-Model': selectedProvider.models[complexityLevel],
        'X-Provider': selectedProvider.id,
        'X-Complexity': complexityLevel,
        'X-WebSearch': requiresWebSearch.toString(),
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
