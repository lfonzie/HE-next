import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'

export const dynamic = 'force-dynamic'

// System prompt específico para suporte
const SUPPORT_SYSTEM_PROMPT = `Você é o assistente de suporte do HubEdu.ia, uma plataforma educacional completa com IA conversacional.

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

    // Verificar se temos chaves de API disponíveis
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasGoogle = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!hasOpenAI && !hasGoogle) {
      return new Response('No AI provider configured', { status: 500 })
    }

    // Preparar mensagens para o AI SDK
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

    // Escolher provider baseado na disponibilidade
    const useGoogle = hasGoogle && !hasOpenAI
    const model = useGoogle ? 'gemini-1.5-flash' : 'gpt-4o-mini'

    console.log(`🤖 [SUPPORT CHAT] Using ${useGoogle ? 'Google' : 'OpenAI'} with model ${model}`)

    // Usar streamText do AI SDK
    const result = await streamText({
      model: useGoogle ? google(model) : openai(model),
      messages: aiMessages,
      temperature: 0.7,
      maxTokens: 1000, // Limitar para respostas concisas
      onFinish: async (result) => {
        console.log('✅ [SUPPORT CHAT] Stream finished:', {
          finishReason: result.finishReason,
          usage: result.usage,
          provider: useGoogle ? 'google' : 'openai',
          model: model
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
          console.error('❌ [SUPPORT CHAT] Stream error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Model': model,
        'X-Provider': useGoogle ? 'google' : 'openai',
        'X-Timestamp': Date.now().toString()
      }
    })

  } catch (error) {
    console.error('❌ [SUPPORT CHAT] Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
