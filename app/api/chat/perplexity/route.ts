import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { streamText, generateText } from 'ai'
import { perplexity } from '@ai-sdk/perplexity'
import { getSystemPrompt } from '@/lib/ai-sdk-config'

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

    console.log('🤖 Perplexity Chat request:', {
      message: lastMessage.content,
      module: module || 'auto',
      messageCount: messages.length
    })

    // Verificar se a chave da Perplexity está configurada
    if (!process.env.PERPLEXITY_API_KEY) {
      return new Response('Perplexity API key not configured', { status: 500 })
    }

    // Determinar módulo se não especificado
    let targetModule = module || 'auto'
    
    // Se módulo for 'auto', usar classificação simples
    if (module === 'auto' || !module) {
      // Classificação simples baseada em palavras-chave
      const content = lastMessage.content.toLowerCase()
      if (content.includes('enem') || content.includes('vestibular') || content.includes('prova')) {
        targetModule = 'enem'
      } else if (content.includes('aula') || content.includes('estudar') || content.includes('aprender')) {
        targetModule = 'aula_interativa'
      } else if (content.includes('professor') || content.includes('explicar') || content.includes('dúvida')) {
        targetModule = 'professor'
      } else {
        targetModule = 'professor' // padrão
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

    // Configurar modelo Perplexity - usando sonar
    const model = perplexity(process.env.PERPLEXITY_MODEL_SELECTION || 'sonar', {
      apiKey: process.env.PERPLEXITY_API_KEY,
    })

    // Configurações de streaming
    const streamingConfig = {
      maxTokens: 4000,
      temperature: 0.7,
      topP: 0.9,
    }

    // Headers otimizados
    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Provider': 'perplexity',
      'X-Model': process.env.PERPLEXITY_MODEL_SELECTION || 'sonar',
      'X-Module': targetModule,
      'X-Streaming': 'true'
    }

    // Streaming com Perplexity
    const result = await streamText({
      model,
      messages: aiMessages,
      maxTokens: streamingConfig.maxTokens,
      temperature: streamingConfig.temperature,
      topP: streamingConfig.topP,
    })

    console.log('✅ Perplexity streaming started successfully')

    // Retornar resposta de streaming
    return result.toTextStreamResponse({
      headers
    })

  } catch (error) {
    console.error('❌ Perplexity API Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
