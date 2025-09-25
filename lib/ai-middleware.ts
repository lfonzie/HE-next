import { NextRequest, NextResponse } from 'next/server'
import { aiFallbackManager, FallbackOptions, FallbackResult } from '@/lib/ai-fallback-manager'

/**
 * Middleware Universal de Fallback de IA
 * Pode ser usado em qualquer endpoint que precise de IA
 */

export interface AIMiddlewareOptions {
  module?: string
  complexity?: 'simple' | 'complex' | 'fast'
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
  maxRetries?: number
  preferredProvider?: string
  excludeProviders?: string[]
  enableCaching?: boolean
  cacheKey?: string
}

export interface AIMiddlewareRequest {
  message: string
  messages?: Array<{ role: string; content: string }>
  [key: string]: any
}

/**
 * Middleware que adiciona fallback automático a qualquer endpoint de IA
 */
export function withAIFallback(
  handler: (request: NextRequest, options: AIMiddlewareOptions) => Promise<NextResponse>,
  defaultOptions: AIMiddlewareOptions = {}
) {
  return async (request: NextRequest, options: AIMiddlewareOptions = {}): Promise<NextResponse> => {
    const startTime = Date.now()
    const mergedOptions = { ...defaultOptions, ...options }
    
    try {
      // Tentar executar o handler original primeiro
      return await handler(request, mergedOptions)
      
    } catch (error) {
      console.warn(`⚠️ [AI-MIDDLEWARE] Handler failed, attempting fallback:`, error.message)
      
      try {
        // Extrair dados da requisição
        const body = await request.json().catch(() => ({}))
        const message = extractMessage(body)
        
        if (!message) {
          return NextResponse.json(
            { error: 'No message found in request body' },
            { status: 400 }
          )
        }

        // Executar com fallback
        const fallbackOptions: FallbackOptions = {
          message,
          module: mergedOptions.module,
          complexity: mergedOptions.complexity,
          systemPrompt: mergedOptions.systemPrompt,
          temperature: mergedOptions.temperature,
          maxTokens: mergedOptions.maxTokens,
          timeout: mergedOptions.timeout,
          maxRetries: mergedOptions.maxRetries,
          preferredProvider: mergedOptions.preferredProvider,
          excludeProviders: mergedOptions.excludeProviders
        }

        const result = await aiFallbackManager.executeWithFallback(fallbackOptions)
        
        if (!result.success) {
          return NextResponse.json(
            { 
              error: 'All AI providers failed',
              details: result.error,
              fallbackChain: result.fallbackChain,
              latency: Date.now() - startTime
            },
            { status: 503 }
          )
        }

        // Retornar resposta de sucesso
        return NextResponse.json({
          success: true,
          content: result.content,
          provider: result.provider,
          model: result.model,
          latency: result.latency,
          attempts: result.attempts,
          fallbackChain: result.fallbackChain,
          metadata: {
            timestamp: new Date().toISOString(),
            module: mergedOptions.module || 'unknown',
            complexity: mergedOptions.complexity || 'simple'
          }
        })

      } catch (fallbackError) {
        console.error(`❌ [AI-MIDDLEWARE] Fallback also failed:`, fallbackError)
        
        return NextResponse.json(
          { 
            error: 'AI service unavailable',
            details: fallbackError.message,
            latency: Date.now() - startTime
          },
          { status: 503 }
        )
      }
    }
  }
}

/**
 * Extrai mensagem do corpo da requisição (suporta múltiplos formatos)
 */
function extractMessage(body: any): string | null {
  // Formato legacy (useChat.ts)
  if (body.message && typeof body.message === 'string') {
    return body.message
  }
  
  // Formato Vercel AI SDK (messages array)
  if (body.messages && Array.isArray(body.messages)) {
    const lastMessage = body.messages[body.messages.length - 1]
    if (lastMessage && lastMessage.content) {
      return lastMessage.content
    }
  }
  
  // Formato direto
  if (body.content && typeof body.content === 'string') {
    return body.content
  }
  
  // Formato prompt
  if (body.prompt && typeof body.prompt === 'string') {
    return body.prompt
  }
  
  return null
}

/**
 * Hook para endpoints de chat que precisam de fallback
 */
export function createChatEndpoint(options: AIMiddlewareOptions = {}) {
  return withAIFallback(async (request: NextRequest, middlewareOptions: AIMiddlewareOptions) => {
    const body = await request.json()
    const { message, messages, module, conversationId, history = [] } = body
    
    // Aqui você pode implementar lógica específica do endpoint
    // Por exemplo, validação adicional, processamento especial, etc.
    
    // Por enquanto, apenas retornar erro para forçar o fallback
    throw new Error('Original handler not implemented - using fallback')
    
  }, options)
}

/**
 * Hook para endpoints de geração de aulas que precisam de fallback
 */
export function createLessonEndpoint(options: AIMiddlewareOptions = {}) {
  return withAIFallback(async (request: NextRequest, middlewareOptions: AIMiddlewareOptions) => {
    const body = await request.json()
    const { topic, systemPrompt, complexity } = body
    
    // Lógica específica para geração de aulas
    throw new Error('Original lesson handler not implemented - using fallback')
    
  }, {
    module: 'aula_interativa',
    complexity: 'complex',
    ...options
  })
}

/**
 * Hook para endpoints de classificação que precisam de fallback
 */
export function createClassificationEndpoint(options: AIMiddlewareOptions = {}) {
  return withAIFallback(async (request: NextRequest, middlewareOptions: AIMiddlewareOptions) => {
    const body = await request.json()
    const { text, context } = body
    
    // Lógica específica para classificação
    throw new Error('Original classification handler not implemented - using fallback')
    
  }, {
    module: 'classifier',
    complexity: 'simple',
    ...options
  })
}

/**
 * Utilitário para criar respostas de erro padronizadas
 */
export function createErrorResponse(error: string, details?: any, status: number = 500): NextResponse {
  return NextResponse.json({
    error,
    details,
    timestamp: new Date().toISOString()
  }, { status })
}

/**
 * Utilitário para criar respostas de sucesso padronizadas
 */
export function createSuccessResponse(data: any, metadata?: any): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  })
}

/**
 * Middleware para logging de requisições de IA
 */
export function withAILogging(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log(`🚀 [AI-REQUEST] ${requestId} - ${request.method} ${request.url}`)
    
    try {
      const response = await handler(request, ...args)
      const latency = Date.now() - startTime
      
      console.log(`✅ [AI-RESPONSE] ${requestId} - ${response.status} (${latency}ms)`)
      
      return response
    } catch (error) {
      const latency = Date.now() - startTime
      console.error(`❌ [AI-ERROR] ${requestId} - ${error.message} (${latency}ms)`)
      throw error
    }
  }
}

export default {
  withAIFallback,
  createChatEndpoint,
  createLessonEndpoint,
  createClassificationEndpoint,
  createErrorResponse,
  createSuccessResponse,
  withAILogging
}
