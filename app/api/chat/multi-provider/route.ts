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
    // Verificar autenticação (desabilitado temporariamente para desenvolvimento)
    const session = await getServerSession(authOptions)
    // if (!session) {
    //   return new Response('Unauthorized', { status: 401 })
    // }

    const { messages, module, provider, complexity } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages are required', { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content) {
      return new Response('Last message content is required', { status: 400 })
    }

    console.log('🤖 Multi-Provider Chat request:', {
      message: lastMessage.content,
      module: module || 'auto',
      provider: provider || 'auto',
      complexity: complexity || 'simple',
      messageCount: messages.length
    })

    // Usar sistema de roteamento inteligente com 3 níveis
    let detectedComplexity = 'simples'
    let selectedProvider = 'openai'
    let selectedModel = 'gpt-4o-mini'
    let tier = 'IA'
    
    try {
      // Chamar API de classificação de complexidade
      const response = await fetch('http://localhost:3000/api/router/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: lastMessage.content })
      })
      
      if (response.ok) {
        const data = await response.json()
        const aiClassification = data.classification?.toLowerCase()
        
        if (aiClassification === 'trivial') {
          detectedComplexity = 'trivial'
          selectedProvider = 'google'
          selectedModel = 'gemini-2.0-flash-exp'
          tier = 'IA_ECO'
        } else if (aiClassification === 'simples') {
          detectedComplexity = 'simples'
          selectedProvider = 'openai'
          selectedModel = 'gpt-4o-mini'
          tier = 'IA'
        } else if (aiClassification === 'complexa') {
          detectedComplexity = 'complexa'
          selectedProvider = 'openai'
          selectedModel = 'gpt-5'
          tier = 'IA_TURBO'
        }
      }
    } catch (error) {
      console.warn('Classification API error, using simple:', error)
    }
    
    console.log('🎯 [ROUTING] Result:', {
      content: lastMessage.content.substring(0, 50) + '...',
      provider: selectedProvider,
      model: selectedModel,
      complexity: detectedComplexity
    })

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

    // Usar OpenAI diretamente com configuração simples
    const providerConfig = { temperature: 0.7, maxTokens: 2000, timeout: 20000 }

    console.log('🚀 [MULTI-PROVIDER] Starting stream with:', {
      provider: selectedProvider,
      model: selectedModel,
      complexity: detectedComplexity,
      tier: tier,
      module: targetModule,
      messageCount: aiMessages.length
    })

    // Criar modelo baseado no provedor selecionado
    let modelInstance;
    if (selectedProvider === 'google') {
      modelInstance = google(selectedModel, {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      })
    } else {
      modelInstance = openai(selectedModel, {
        apiKey: process.env.OPENAI_API_KEY!,
      })
    }

    // Usar streamText do AI SDK com modelo selecionado
    const result = await streamText({
      model: modelInstance,
      messages: aiMessages,
      temperature: providerConfig.temperature,
      onFinish: (result) => {
        console.log('✅ [MULTI-PROVIDER] Stream finished:', {
          finishReason: result.finishReason,
          usage: result.usage,
          provider: selectedProvider,
          model: selectedModel,
          complexity: detectedComplexity,
          tier: tier,
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
        'X-Provider': selectedProvider,
        'X-Model': selectedModel,
        'X-Module': targetModule,
        'X-Complexity': detectedComplexity,
        'X-Tier': tier,
        'X-Auto-Selected': 'true',
        'X-Timestamp': Date.now().toString()
      }
    })

  } catch (error) {
    console.error('❌ Multi-Provider Chat Error:', error)
    
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

// GET endpoint para listar provedores disponíveis
export async function GET() {
  try {
    const availableProviders = getAvailableProviders()
    
    const providersInfo = availableProviders.map(provider => ({
      id: provider,
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
      available: true,
      models: Object.keys(PROVIDER_MODELS[provider])
    }))

    return new Response(
      JSON.stringify({
        availableProviders,
        providers: providersInfo,
        total: availableProviders.length
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to get providers',
        availableProviders: []
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
