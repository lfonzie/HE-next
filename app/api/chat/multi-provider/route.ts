import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { streamText } from 'ai'
import { 
  createModel, 
  selectProvider, 
  getProviderConfig,
  getAvailableProviders,
  ProviderType,
  PROVIDER_MODELS
} from '@/lib/ai-providers'
import { routeAIModel } from '@/lib/ai-model-router'
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

    // Usar sistema de roteamento inteligente
    const routingResult = await routeAIModel(
      lastMessage.content,
      'education', // Caso de uso padrão para chat educacional
      provider as ProviderType,
      complexity as any
    )
    
    console.log('🎯 [ROUTING] Result:', {
      content: lastMessage.content.substring(0, 50) + '...',
      provider: routingResult.provider,
      model: routingResult.model,
      complexity: routingResult.complexity,
      reasoning: routingResult.metadata.reasoning
    })
    
    const selectedProvider = selectProvider(
      routingResult.complexity,
      routingResult.provider
    )

    console.log('🎯 [PROVIDER] Selected:', selectedProvider)

    // Verificar se o provedor está disponível
    const availableProviders = getAvailableProviders()
    if (!availableProviders.includes(selectedProvider.provider)) {
      return new Response(
        JSON.stringify({
          error: `Provider ${selectedProvider.provider} not available. Available: ${availableProviders.join(', ')}`,
          availableProviders
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
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

    // Obter configuração do provedor
    const providerConfig = getProviderConfig(selectedProvider.provider)

    console.log('🚀 [MULTI-PROVIDER] Starting stream with:', {
      provider: selectedProvider.provider,
      model: selectedProvider.model,
      module: targetModule,
      messageCount: aiMessages.length
    })

    // Usar streamText do AI SDK com provedor selecionado
    const result = await streamText({
      model: createModel(selectedProvider.provider, complexity || 'simple'),
      messages: aiMessages,
      temperature: providerConfig.temperature,
      onFinish: (result) => {
        console.log('✅ [MULTI-PROVIDER] Stream finished:', {
          finishReason: result.finishReason,
          usage: result.usage,
          provider: selectedProvider.provider,
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
        'X-Provider': routingResult.provider,
        'X-Model': routingResult.model,
        'X-Module': targetModule,
        'X-Complexity': routingResult.complexity,
        'X-Tier': routingResult.complexity === 'simple' ? 'IA' : 
                  routingResult.complexity === 'complex' ? 'IA_SUPER' : 'IA_ECO',
        'X-Routing-Reasoning': routingResult.metadata.reasoning,
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
