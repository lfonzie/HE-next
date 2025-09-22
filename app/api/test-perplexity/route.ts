import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { perplexity } from '@ai-sdk/perplexity'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar se a chave da Perplexity está configurada
    if (!process.env.PERPLEXITY_API_KEY) {
      return Response.json({ 
        error: 'Perplexity API key not configured',
        status: 'error'
      }, { status: 500 })
    }

    // Configurar modelo Perplexity
    const model = perplexity(process.env.PERPLEXITY_MODEL_SELECTION || 'sonar', {
      apiKey: process.env.PERPLEXITY_API_KEY,
    })

    // Teste simples
    const result = await generateText({
      model,
      prompt: 'Olá! Você pode me ajudar com uma pergunta sobre educação?',
      maxTokens: 100,
      temperature: 0.7,
    })

    return Response.json({
      status: 'success',
      message: 'Perplexity integration working!',
      response: result.text,
      usage: result.usage,
      model: process.env.PERPLEXITY_MODEL_SELECTION || 'sonar'
    })

  } catch (error) {
    console.error('❌ Perplexity Test Error:', error)
    
    return Response.json({ 
      error: 'Perplexity test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 })
  }
}
