import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { perplexity } from '@ai-sdk/perplexity'
import { generateText } from 'ai'
import { getSystemPrompt } from '@/lib/system-message-loader'
import { cleanPerplexityResponse } from '@/lib/utils/perplexity-cleaner'

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
    
    // Configurar modelo Perplexity - usando apenas "sonar" como solicitado
    const perplexityModel = perplexity('sonar')

    // Preparar mensagens para o AI SDK
    const aiMessages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }))
    ]

    // Usar o AI SDK para gerar resposta
    const result = await generateText({
      model: perplexityModel,
      messages: aiMessages,
    })

    // Clean the response to remove source citations using the best available method
    const cleanedResponseText = await cleanPerplexityResponse(result.text);

    // Headers otimizados
    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Provider': 'perplexity',
      'X-Model': 'sonar',
      'X-Module': targetModule,
      'X-Streaming': 'false'
    }

    console.log('✅ Perplexity AI SDK completed successfully')

    // Retornar resposta direta (não streaming)
    return new Response(cleanedResponseText, {
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

