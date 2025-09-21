import { NextRequest } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { streamText, generateText } from 'ai'


import { openai } from '@ai-sdk/openai'


import { google } from '@ai-sdk/google'


import { fastClassify } from '@/lib/fast-classifier'


import { classifyComplexityAsync, getProviderConfig } from '@/lib/complexity-classifier'


import { generateCacheKey, responseCache } from '@/lib/aggressive-cache'



// Schema para requisição multi-provider
const MultiProviderRequestSchema = {
  message: 'string',
  module: 'string?',
  conversationId: 'string?',
  history: 'array?',
  useCache: 'boolean?',
  forceProvider: 'string?' // 'openai' | 'google' | 'auto'
}

// Configurações de modelos por complexidade
const MODEL_CONFIGS = {
  trivial: {
    google: 'gemini-1.5-flash',
    openai: 'gpt-4o-mini'
  },
  simples: {
    google: 'gemini-1.5-flash',
    openai: 'gpt-4o-mini'
  },
  complexa: {
    google: 'gemini-1.5-pro',
    openai: 'gpt-5-chat-latest' // Usar GPT-5 para complexidade máxima
  }
}

// System prompts otimizados por módulo
const SYSTEM_PROMPTS = {
  professor: `Você é um professor especializado em educação. Responda de forma clara, didática e objetiva. Foque em explicar conceitos de forma simples e prática.`,
  enem: `Você é um especialista em ENEM. Forneça explicações concisas e diretas sobre questões e conceitos do ENEM.`,
  aula_interativa: `Você é um professor criador de aulas interativas. Crie conteúdo educativo envolvente e didático.`,
  ti: `Você é um especialista em TI. Forneça soluções técnicas práticas e diretas para problemas de tecnologia.`,
  financeiro: `Você é um especialista em questões financeiras. Responda de forma clara e objetiva sobre pagamentos e questões financeiras.`,
  default: `Você é um assistente educacional. Responda de forma clara, objetiva e útil.`
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  console.log(`🚀 [AI-SDK-MULTI] START - ${timestamp}`)
  
  try {
    const parseStart = Date.now()
    const body = await request.json()
    const { 
      message, 
      module = 'auto', 
      conversationId, 
      history = [], 
      useCache = true,
      forceProvider = 'auto'
    } = body
    const parseTime = Date.now() - parseStart
    console.log(`⏱️ [PARSE] Completed in ${parseTime}ms`)

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log(`🚀 [AI-SDK-MULTI] Processing: "${message.substring(0, 30)}..." module=${module} forceProvider=${forceProvider}`)
    
    // 1. Verificar cache primeiro (se habilitado)
    if (useCache) {
      const cacheKey = generateCacheKey(message, module, history.length)
      const cachedResponse = responseCache.get(cacheKey)
      
      if (cachedResponse) {
        console.log(`🎯 [CACHE-HIT] Using cached response for: "${message.substring(0, 30)}..."`)
        return new Response(cachedResponse, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Cached': 'true',
            'X-Module': module,
            'X-Provider': 'cached',
            'X-Latency': `${Date.now() - startTime}ms`
          }
        })
      }
    }

    // 2. Classificação rápida de módulo
    let targetModule = module
    if (module === 'auto') {
      const classification = fastClassify(message, history.length)
      targetModule = classification.module
      console.log(`🎯 [FAST-CLASSIFY] ${targetModule} (confidence: ${classification.confidence})`)
    }

    // 3. Classificação de complexidade com IA
    const complexityStart = Date.now()
    const complexityResult = await classifyComplexityAsync(message, targetModule)
    const complexityTime = Date.now() - complexityStart
    console.log(`⚡ [COMPLEXITY] ${complexityResult.classification} (${complexityResult.method}, ${complexityTime}ms)`)

    // 4. Seleção automática de provider baseada na complexidade
    let selectedProvider: 'openai' | 'google'
    let selectedModel: string
    let providerReason: string

    if (forceProvider !== 'auto') {
      selectedProvider = forceProvider as 'openai' | 'google'
      selectedModel = MODEL_CONFIGS[complexityResult.classification][selectedProvider]
      providerReason = `forced-${forceProvider}`
    } else {
      // Seleção automática baseada na complexidade
      const providerConfig = getProviderConfig(complexityResult.classification)
      selectedProvider = providerConfig.provider
      selectedModel = providerConfig.model
      providerReason = `auto-${complexityResult.classification}`
    }

    console.log(`🎯 [PROVIDER-SELECTION] ${selectedProvider}:${selectedModel} (reason: ${providerReason})`)

    // 5. Configurar modelo baseado na seleção
    let modelInstance
    if (selectedProvider === 'google') {
      modelInstance = google(selectedModel)
    } else {
      modelInstance = openai(selectedModel)
    }

    // 6. Preparar mensagens otimizadas
    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPTS[targetModule as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.default
      },
      // Histórico reduzido para velocidade
      ...history.slice(-3).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ]

    // 7. Configurações de streaming otimizadas por complexidade
    const streamingConfig = {
      temperature: complexityResult.classification === 'complexa' ? 0.7 : 0.5,
      experimental_streamData: false, // Desabilitar para velocidade
    }

    // 8. Executar streaming
    const streamStart = Date.now()
    const result = await streamText({
      model: modelInstance,
      messages,
      ...streamingConfig
    })
    const streamTime = Date.now() - streamStart
    console.log(`⏱️ [STREAM-TEXT] Completed in ${streamTime}ms`)

    // 9. Preparar resposta com headers de metadados
    const response = result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Provider': selectedProvider,
        'X-Model': selectedModel,
        'X-Module': targetModule,
        'X-Complexity': complexityResult.classification,
        'X-Classification-Method': complexityResult.method,
        'X-Cached': 'false',
        'X-Latency': `${Date.now() - startTime}ms`,
        'X-Provider-Reason': providerReason
      }
    })

    // 10. Salvar no cache para futuras requisições similares
    if (useCache) {
      // Note: Para streaming, não podemos facilmente cachear a resposta completa
      // Mas podemos cachear a classificação de complexidade
      const complexityCacheKey = `complexity:${message}:${targetModule}`
      responseCache.set(complexityCacheKey, complexityResult.classification, 30 * 60 * 1000) // 30 min
    }

    const totalTime = Date.now() - startTime
    console.log(`✅ [AI-SDK-MULTI] Completed in ${totalTime}ms (${selectedProvider}:${selectedModel})`)

    return response

  } catch (error: any) {
    const totalLatency = Date.now() - startTime
    console.error(`❌ [AI-SDK-MULTI] Fatal error: ${error.message} latency=${totalLatency}ms`)
    
    return Response.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        latency: totalLatency 
      }, 
      { status: 500 }
    )
  }
}

// Função para obter estatísticas de uso dos providers
export async function GET() {
  return Response.json({
    providers: ['openai', 'google'],
    models: {
      openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-5-chat-latest'],
      google: ['gemini-1.5-flash', 'gemini-1.5-pro']
    },
    complexityLevels: ['trivial', 'simples', 'complexa'],
    autoSelection: {
      trivial: 'google:gemini-1.5-flash (fastest)',
      simples: 'openai:gpt-4o-mini (balanced)',
      complexa: 'openai:gpt-5-chat-latest (most capable)'
    }
  })
}
