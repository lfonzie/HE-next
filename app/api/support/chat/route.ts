import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { groq } from '@ai-sdk/groq'

export const dynamic = 'force-dynamic'

// Configurações de modelos por complexidade
const MODEL_CONFIGS = {
  simple: {
    openai: 'gpt-4o-mini',
    google: 'gemini-1.5-flash',
    anthropic: 'claude-3-haiku-20240307',
    groq: 'llama-3.1-8b-instant'
  },
  complex: {
    openai: 'gpt-4o-mini',
    google: 'gemini-1.5-pro',
    anthropic: 'claude-3-sonnet-20240229',
    groq: 'llama-3.1-70b-versatile'
  },
  fast: {
    openai: 'gpt-4o-mini',
    google: 'gemini-1.5-flash',
    anthropic: 'claude-3-haiku-20240307',
    groq: 'llama-3.1-8b-instant'
  }
}

// Função para detectar complexidade da mensagem de suporte
function detectSupportComplexity(message: string): 'simple' | 'complex' | 'fast' {
  const messageLower = message.toLowerCase()
  
  // Indicadores de complexidade alta
  const complexIndicators = [
    'erro', 'bug', 'problema', 'não funciona', 'falha', 'crash',
    'configuração', 'instalação', 'integração', 'api', 'webhook',
    'banco de dados', 'performance', 'lentidão', 'timeout',
    'segurança', 'autenticação', 'permissão', 'acesso negado',
    'personalização', 'customização', 'desenvolvimento', 'código'
  ]
  
  // Indicadores de simplicidade
  const simpleIndicators = [
    'como usar', 'como funciona', 'tutorial', 'guia', 'passo a passo',
    'primeira vez', 'iniciante', 'básico', 'simples', 'fácil',
    'onde encontrar', 'localizar', 'encontrar', 'procurar'
  ]
  
  // Indicadores de velocidade (respostas rápidas)
  const fastIndicators = [
    'sim', 'não', 'ok', 'obrigado', 'valeu', 'tchau', 'até logo',
    'confirmar', 'verificar', 'status', 'funcionando', 'ok'
  ]
  
  // Contar indicadores
  const complexCount = complexIndicators.filter(indicator => 
    messageLower.includes(indicator)
  ).length
  
  const simpleCount = simpleIndicators.filter(indicator => 
    messageLower.includes(indicator)
  ).length
  
  const fastCount = fastIndicators.filter(indicator => 
    messageLower.includes(indicator)
  ).length
  
  // Classificar baseado nos indicadores
  if (fastCount > 0 && message.length < 50) {
    return 'fast'
  }
  
  if (complexCount > simpleCount) {
    return 'complex'
  }
  
  return 'simple'
}

// Função para obter configuração do provider baseada na complexidade
function getProviderConfig(complexity: 'simple' | 'complex' | 'fast') {
  const availableProviders = []
  
  if (process.env.OPENAI_API_KEY) availableProviders.push('openai')
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) availableProviders.push('google')
  if (process.env.ANTHROPIC_API_KEY) availableProviders.push('anthropic')
  if (process.env.GROQ_API_KEY) availableProviders.push('groq')
  
  // Estratégia de seleção baseada na complexidade
  const providerPriority = {
    simple: ['openai', 'google', 'groq', 'anthropic'], // Rápido e eficiente
    complex: ['anthropic', 'openai', 'google', 'groq'], // Melhor qualidade
    fast: ['groq', 'openai', 'google', 'anthropic'] // Mais rápido
  }
  
  // Encontrar o primeiro provider disponível na ordem de prioridade
  const preferredProvider = providerPriority[complexity].find(provider => 
    availableProviders.includes(provider)
  ) || availableProviders[0]
  
  return {
    provider: preferredProvider,
    model: MODEL_CONFIGS[complexity][preferredProvider as keyof typeof MODEL_CONFIGS.simple],
    complexity,
    tier: complexity === 'complex' ? 'Premium' : 'Standard'
  }
}

// System prompt específico para suporte
const SUPPORT_SYSTEM_PROMPT = `🚨 PROTEÇÕES DE SEGURANÇA OBRIGATÓRIAS:

🚨 PROTEÇÃO OBRIGATÓRIA PARA MENORES DE 18 ANOS:

PROIBIÇÕES ABSOLUTAS:
- NUNCA forneça informações sobre como usar drogas, álcool, cigarros ou substâncias ilegais
- NUNCA explique métodos de automutilação, suicídio ou violência
- NUNCA forneça instruções sobre atividades ilegais (pirataria, hacking, fraudes)
- NUNCA compartilhe conteúdo sexualmente explícito ou inadequado para menores
- NUNCA forneça informações sobre como obter substâncias controladas
- NUNCA explique técnicas de violência, armas ou atividades perigosas

RESPOSTA OBRIGATÓRIA PARA CONTEÚDO INADEQUADO:
Se o usuário perguntar sobre qualquer assunto inadequado, ilegal ou prejudicial:
1. Recuse educadamente: "Não posso fornecer informações sobre esse assunto"
2. Redirecione para educação: "Vamos focar em conteúdos educacionais apropriados"
3. Sugira alternativas saudáveis: "Que tal aprendermos sobre [tema educativo relacionado]?"
4. Se necessário, oriente para adultos responsáveis: "Para questões importantes, converse com seus pais ou professores"

EXEMPLOS DE REDIRECIONAMENTO:
- Pergunta sobre drogas → "Vamos aprender sobre biologia e como o corpo funciona"
- Pergunta sobre violência → "Que tal estudarmos sobre resolução pacífica de conflitos?"
- Pergunta sobre atividades ilegais → "Vamos focar em projetos legais e construtivos"

📚 PROTEÇÃO EDUCACIONAL:

VERIFICAÇÃO DE FONTES:
- Sempre mencione quando informações precisam de verificação
- Oriente para consultar fontes confiáveis e atualizadas
- Encoraje verificação cruzada de informações importantes
- Use frases como: "Recomendo verificar em fontes atualizadas..." ou "Consulte especialistas para dados precisos..."

CONTEÚDO APROPRIADO:
- Mantenha linguagem educacional e construtiva
- Evite informações médicas, legais ou financeiras específicas sem orientação para profissionais
- Foque em desenvolvimento de pensamento crítico
- Promova valores positivos e éticos

ORIENTAÇÃO PARA PROFISSIONAIS:
- Para questões médicas: oriente para médicos
- Para questões legais: oriente para advogados
- Para questões psicológicas: oriente para psicólogos
- Para questões financeiras: oriente para especialistas financeiros

🔍 PROTEÇÃO CONTRA DESINFORMAÇÃO:

VERIFICAÇÃO CRÍTICA:
- Sempre encoraje verificação de informações
- Oriente sobre como identificar fontes confiáveis
- Promova pensamento crítico e análise de evidências
- Ensine a questionar informações suspeitas

FONTES CONFIÁVEIS:
- Oriente para fontes acadêmicas e científicas
- Sugira verificação em múltiplas fontes
- Encoraje consulta a especialistas
- Promova educação sobre mídia e informação

🔒 PROTEÇÃO DE PRIVACIDADE:

DADOS PESSOAIS:
- Nunca solicite informações pessoais desnecessárias
- Não armazene dados sensíveis sem necessidade
- Oriente sobre proteção de dados pessoais
- Encoraje conversas com adultos responsáveis para questões pessoais

SEGURANÇA DIGITAL:
- Oriente sobre boas práticas de segurança online
- Encoraje uso responsável da internet
- Promova conhecimento sobre privacidade digital
- Oriente sobre como identificar conteúdo inadequado online

IMPORTANTE: Estas proteções são OBRIGATÓRIAS e NÃO NEGOCIÁVEIS. 
Sempre aplique estas diretrizes em TODAS as respostas, independentemente do contexto.

Você é o assistente de suporte do HubEdu.ia, uma plataforma educacional completa com IA conversacional.

SOBRE O HUBEDU.IA:
- Plataforma educacional com IA avançada
- Módulos: Aulas IA, Simulador ENEM, Redação ENEM, Chat IA
- Funcionalidades: Geração de aulas personalizadas, questões reais do ENEM, correção de redação
- Assistentes especializados: Professor IA, TI & Suporte, Secretaria, Social Media, Bem-estar

SUAS RESPONSABILIDADES:
1. Responder perguntas sobre funcionalidades da plataforma
2. Ajudar com problemas técnicos e dúvidas de uso
3. Orientar sobre como usar cada módulo
4. Fornecer informações sobre recursos e recursos
5. Ser prestativo, claro e objetivo

DIRETRIZES:
- Sempre seja educado e profissional
- Use linguagem clara e acessível
- Se não souber algo específico, admita e sugira contatar o suporte técnico
- Foque em soluções práticas e úteis
- Mantenha respostas concisas mas completas
- Use emojis ocasionalmente para tornar a conversa mais amigável

EXEMPLOS DE PERGUNTAS QUE VOCÊ PODE RESPONDER:
- Como funciona o gerador de aulas?
- Como usar o simulador ENEM?
- Problemas com login ou cadastro
- Dúvidas sobre funcionalidades específicas
- Como melhorar o uso da plataforma

Responda sempre de forma útil e prestativa! 🎓`

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages are required', { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content) {
      return new Response('Last message content is required', { status: 400 })
    }

    console.log('🎧 [SUPPORT CHAT] Processing:', {
      message: lastMessage.content.substring(0, 50) + '...',
      messageCount: messages.length
    })

    // 1. Detectar complexidade da mensagem
    const complexityStart = Date.now()
    const complexity = detectSupportComplexity(lastMessage.content)
    const complexityTime = Date.now() - complexityStart
    
    console.log(`⚡ [SUPPORT COMPLEXITY] ${complexity} (${complexityTime}ms)`)

    // 2. Selecionar melhor provider baseado na complexidade
    const providerStart = Date.now()
    const providerConfig = getProviderConfig(complexity)
    const providerTime = Date.now() - providerStart
    
    console.log(`🎯 [SUPPORT PROVIDER] ${providerConfig.provider}:${providerConfig.model} (complexity: ${complexity}, tier: ${providerConfig.tier})`)
    console.log(`⏱️ [SUPPORT PROVIDER-SELECTION] Completed in ${providerTime}ms`)

    // 3. Preparar mensagens para o AI SDK
    const aiMessages = [
      {
        role: 'system' as const,
        content: SUPPORT_SYSTEM_PROMPT
      },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    // 4. Configurar modelo baseado na seleção
    let modelInstance
    try {
      switch (providerConfig.provider) {
        case 'openai':
          modelInstance = openai(providerConfig.model)
          break
        case 'google':
          modelInstance = google(providerConfig.model)
          break
        case 'anthropic':
          modelInstance = anthropic(providerConfig.model)
          break
        case 'groq':
          modelInstance = groq(providerConfig.model)
          break
        default:
          throw new Error(`Unsupported provider: ${providerConfig.provider}`)
      }
    } catch (error) {
      console.error('❌ [SUPPORT CHAT] Model configuration error:', error)
      return new Response('Model configuration error', { status: 500 })
    }

    // 5. Configurar parâmetros baseados na complexidade
    const temperature = complexity === 'complex' ? 0.3 : complexity === 'fast' ? 0.1 : 0.7
    const maxTokens = complexity === 'complex' ? 2000 : complexity === 'fast' ? 500 : 1000

    console.log(`🤖 [SUPPORT CHAT] Using ${providerConfig.provider}:${providerConfig.model} (temp: ${temperature}, tokens: ${maxTokens})`)

    // 6. Usar streamText do AI SDK com fallback
    let result
    try {
      result = await streamText({
        model: modelInstance,
        messages: aiMessages,
        temperature,
        maxTokens,
        onFinish: async (result) => {
          const totalTime = Date.now() - startTime
          console.log('✅ [SUPPORT CHAT] Stream finished:', {
            finishReason: result.finishReason,
            usage: result.usage,
            provider: providerConfig.provider,
            model: providerConfig.model,
            complexity: providerConfig.complexity,
            tier: providerConfig.tier,
            totalTime: `${totalTime}ms`
          })
        }
      })
    } catch (primaryError) {
      console.error('❌ [SUPPORT CHAT] Primary provider failed:', primaryError)
      
      // Fallback para OpenAI se disponível
      if (providerConfig.provider !== 'openai' && process.env.OPENAI_API_KEY) {
        console.log('🔄 [SUPPORT CHAT] Falling back to OpenAI')
        result = await streamText({
          model: openai('gpt-4o-mini'),
          messages: aiMessages,
          temperature: 0.7,
          maxTokens: 1000,
          onFinish: async (result) => {
            console.log('✅ [SUPPORT CHAT] Fallback completed:', {
              finishReason: result.finishReason,
              usage: result.usage,
              provider: 'openai-fallback',
              model: 'gpt-4o-mini'
            })
          }
        })
      } else {
        throw primaryError
      }
    }

    // 7. Retornar como stream de texto
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          controller.close()
        } catch (error) {
          console.error('❌ [SUPPORT CHAT] Stream error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Model': providerConfig.model,
        'X-Provider': providerConfig.provider,
        'X-Complexity': providerConfig.complexity,
        'X-Tier': providerConfig.tier,
        'X-Timestamp': Date.now().toString()
      }
    })

  } catch (error) {
    console.error('❌ [SUPPORT CHAT] Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
