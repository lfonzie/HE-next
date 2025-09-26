import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { createSafeModel, validateOpenAIKey } from '@/lib/ai-sdk-production-config'

// Cache de respostas para melhorar performance
const responseCache = new Map<string, string>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Função para gerar chave de cache
function generateCacheKey(message: string, module: string, historyLength: number): string {
  return `${module}:${message.toLowerCase().trim()}:${historyLength}`
}

// Configurações de modelos por complexidade
const MODEL_CONFIGS = {
  trivial: {
    openai: 'gpt-4o-mini',
    google: 'gemini-1.5-flash'
  },
  simples: {
    openai: 'gpt-4o-mini', 
    google: 'gemini-1.5-flash'
  },
  complexa: {
    openai: 'gpt-4o-mini',
    google: 'gemini-1.5-pro'
  }
}

// Função para seleção automática de provider baseada na complexidade
function getProviderConfig(complexity: 'trivial' | 'simples' | 'complexa') {
  switch (complexity) {
    case 'trivial':
      return { provider: 'google' as const, model: 'gemini-1.5-flash' }
    case 'simples':
      return { provider: 'openai' as const, model: 'gpt-4o-mini' }
    case 'complexa':
      return { provider: 'openai' as const, model: 'gpt-4o-mini' }
  }
}

// Prompts do sistema por módulo
const SYSTEM_PROMPTS = {
  professor: `Você é um professor virtual especializado em educação brasileira. Responda de forma didática, clara e objetiva. Use exemplos práticos e linguagem acessível.`,
  enem: `Você é um especialista em ENEM. Ajude com questões, estratégias de prova e preparação para o vestibular.`,
  aula_interativa: `Você é um especialista em criar aulas interativas e dinâmicas. Foque na experiência de aprendizado do aluno.`,
  aula_expandida: `Você é um especialista em criar conteúdo educacional completo e detalhado.`,
  redacao: `Você é um especialista em redação e escrita. Ajude com técnicas de escrita, estrutura e correção.`,
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

    // 2. Classificação simples de módulo (sem dependências externas)
    let targetModule = module
    let classificationSource = 'client_override'
    
    if (module === 'auto') {
      // Classificação local simples baseada em palavras-chave
      const lowerMessage = message.toLowerCase()
      if (/\b(enem|simulado|tri|prova objetiva|questões de múltipla escolha|gabarito)\b/i.test(lowerMessage)) {
        targetModule = 'enem'
      } else if (/\b(aula|aulas|conteúdo|matéria|disciplina|explicação|dúvida|exercício)\b/i.test(lowerMessage)) {
        targetModule = 'professor'
      } else if (/\b(redação|texto|dissertação|composição|escrita)\b/i.test(lowerMessage)) {
        targetModule = 'redacao'
      } else {
        targetModule = 'professor' // padrão
      }
      classificationSource = 'local_simple'
    }

    console.log(`🎯 [MODULE-CLASSIFY] ${targetModule} (method: ${classificationSource})`)

    // 3. Classificação de complexidade ultra-rápida (local)
    const complexityStart = Date.now()
    let complexityLevel: 'trivial' | 'simples' | 'complexa' = 'simples'
    
    // Detecção local ultra-rápida
    const lowerMessage = message.toLowerCase()
    if (message.length < 20 || /\b(oi|olá|tudo bem|td bem|ok|sim|não|nao)\b/i.test(lowerMessage)) {
      complexityLevel = 'trivial'
    } else if (/\b(formulas|fórmulas|equação|equações|matemática|matematica|geometria|álgebra|algebra|trigonometria|cálculo|calculo|derivada|integral|teorema|demonstração|demonstracao|prova|análise|analise|síntese|sintese|comparar|explicar detalhadamente|processo complexo|estatística|estatistica|probabilidade|vetores|matriz|logaritmo|exponencial|limite|continuidade)\b/i.test(message) || /\b(como|por que|quando|onde|qual|quais|quem|explique|demonstre|prove|calcule|resolva|desenvolva|analise|compare|discuta|avalie|me ajude|ajuda|dúvida|duvida|dúvidas|duvidas|não entendo|nao entendo|não sei|nao sei|preciso|quero|gostaria|poderia|pode|tirar|tirar uma|fazer|entender|aprender|estudar|escrever|escreva|produzir|produza|elaborar|elabore|criar|crie|desenvolver|desenvolva|construir|construa|formular|formule|argumentar|argumente|defender|defenda|justificar|justifique|fundamentar|fundamente|sustentar|sustente|comprovar|comprove|demonstrar|demonstre|mostrar|mostre|apresentar|apresente|expor|exponha|discorrer|discorra|abordar|aborde|tratar|trate|analisar|analise|examinar|examine|investigar|investigue|pesquisar|pesquise|estudar|estude|aprender|aprenda|compreender|compreenda|entender|entenda|interpretar|interprete|explicar|explique|descrever|descreva|narrar|narre|relatar|relate|contar|conte|expor|exponha|apresentar|apresente|mostrar|mostre|demonstrar|demonstre|provar|prove|comprovar|comprove|sustentar|sustente|fundamentar|fundamente|justificar|justifique|argumentar|argumente|defender|defenda|convencer|convenca|persuadir|persuada|influenciar|influencie|motivar|motive|inspirar|inspire|estimular|estimule|incentivar|incentive|promover|promova|fomentar|fomente|desenvolver|desenvolva|cultivar|cultive|formar|forme|construir|construa|edificar|edifique|estabelecer|estabeleca|criar|crie|gerar|gere|produzir|produza|elaborar|elabore|construir|construa|desenvolver|desenvolva|formular|formule|estruturar|estruture|organizar|organize|sistematizar|sistematize|planejar|planeje|programar|programe|projetar|projete|desenhar|desenhe|esboçar|esboce|rascunhar|rascunhe|escrever|escreva|redigir|redija|compor|componha|produzir|produza|elaborar|elabore|construir|construa|desenvolver|desenvolva|formular|formule|estruturar|estruture|organizar|organize|sistematizar|sistematize|planejar|planeje|programar|programe|projetar|projete|desenhar|desenhe|esboçar|esboce|rascunhar|rascunhe)\b/i.test(message) && message.length > 30) {
      complexityLevel = 'complexa'
    }
    
    const complexityTime = Date.now() - complexityStart
    console.log(`⚡ [COMPLEXITY] ${complexityLevel} (local, ${complexityTime}ms)`)

    // 4. Seleção automática de provider baseada na complexidade
    let selectedProvider: 'openai' | 'google'
    let selectedModel: string
    let providerReason: string

    if (forceProvider !== 'auto') {
      selectedProvider = forceProvider as 'openai' | 'google'
      selectedModel = MODEL_CONFIGS[complexityLevel][selectedProvider]
      providerReason = `forced-${forceProvider}`
    } else {
      // Seleção automática baseada na complexidade
      const providerConfig = getProviderConfig(complexityLevel)
      selectedProvider = providerConfig.provider
      selectedModel = providerConfig.model
      providerReason = `auto-${complexityLevel}`
    }

    console.log(`🎯 [PROVIDER-SELECTION] ${selectedProvider}:${selectedModel} (reason: ${providerReason})`)

    // 5. Configurar modelo baseado na seleção com tratamento robusto
    let modelInstance
    try {
      if (selectedProvider === 'google') {
        modelInstance = createSafeModel('google', complexityLevel)
      } else {
        // Verificar se a API key está válida antes de criar o modelo
        if (!validateOpenAIKey()) {
          console.warn('⚠️ [MODEL] OpenAI API key invalid, falling back to Google')
          selectedProvider = 'google'
          modelInstance = createSafeModel('google', complexityLevel)
        } else {
          modelInstance = createSafeModel('openai', complexityLevel)
        }
      }
    } catch (modelError: any) {
      console.error(`❌ [MODEL] Error creating ${selectedProvider} model:`, modelError.message)
      
      // Fallback para Google se OpenAI falhar
      if (selectedProvider === 'openai') {
        console.warn('🔄 [FALLBACK] Switching to Google due to OpenAI error')
        selectedProvider = 'google'
        try {
          modelInstance = createSafeModel('google', complexityLevel)
        } catch (fallbackError) {
          console.error('❌ [FALLBACK] Google also failed:', fallbackError.message)
          return Response.json(
            { 
              error: 'All AI providers unavailable', 
              details: `OpenAI: ${modelError.message}, Google: ${fallbackError.message}`,
              latency: Date.now() - startTime 
            }, 
            { status: 503 }
          )
        }
      } else {
        return Response.json(
          { 
            error: 'AI provider unavailable', 
            details: modelError.message,
            latency: Date.now() - startTime 
          }, 
          { status: 503 }
        )
      }
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
      temperature: complexityLevel === 'complexa' ? 0.7 : 0.5,
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
        'X-Complexity': complexityLevel,
        'X-Classification-Method': classificationSource,
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
      responseCache.set(complexityCacheKey, complexityLevel, 30 * 60 * 1000) // 30 min
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