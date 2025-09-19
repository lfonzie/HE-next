import OpenAI from 'openai'
import { logTokens, extractUsageData, calculateCost } from './token-logger'

interface TrackingOptions {
  userId: string
  moduleGroup: 'ENEM' | 'Redacao' | 'Aulas' | 'Chat'
  subject?: string
  grade?: string
  messages?: unknown
  provider?: string
}

/**
 * OpenAI client wrapper that automatically tracks usage
 */
export class OpenAITrackingClient {
  private client: OpenAI
  private defaultOptions: Partial<TrackingOptions>

  constructor(apiKey: string, defaultOptions: Partial<TrackingOptions> = {}) {
    this.client = new OpenAI({ apiKey })
    this.defaultOptions = defaultOptions
  }

  /**
   * Create chat completion with automatic usage tracking
   */
  async createChatCompletion(
    params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
    trackingOptions: TrackingOptions
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const startTime = Date.now()
    
    try {
      const response = await this.client.chat.completions.create(params)
      const responseTime = Date.now() - startTime

      // Track usage
      await this.trackUsage(response, trackingOptions, responseTime)

      return response
    } catch (error) {
      // Track failed request
      await this.trackFailedRequest(error, trackingOptions, Date.now() - startTime)
      throw error
    }
  }

  /**
   * Create streaming chat completion with automatic usage tracking
   */
  async createStreamingChatCompletion(
    params: OpenAI.Chat.Completions.ChatCompletionCreateParams & { stream_options?: { include_usage?: boolean } },
    trackingOptions: TrackingOptions
  ): Promise<OpenAI.Chat.Completions.ChatCompletionChunk> {
    const startTime = Date.now()
    
    // Enable usage tracking for streaming
    const streamParams = {
      ...params,
      stream_options: { include_usage: true }
    }

    try {
      const response = await this.client.chat.completions.create(streamParams)
      const responseTime = Date.now() - startTime

      // For streaming, we'll track usage when the stream completes
      // This is a simplified version - in practice, you'd want to handle the stream differently
      return response as OpenAI.Chat.Completions.ChatCompletionChunk
    } catch (error) {
      await this.trackFailedRequest(error, trackingOptions, Date.now() - startTime)
      throw error
    }
  }

  /**
   * Track successful request usage
   */
  private async trackUsage(
    response: OpenAI.Chat.Completions.ChatCompletion,
    options: TrackingOptions,
    responseTime: number
  ): Promise<void> {
    try {
      const usage = response.usage
      if (!usage) return

      const usageData = extractUsageData(usage)
      const model = response.model || 'gpt-4o-mini'
      const costs = calculateCost(model, usageData.promptTokens, usageData.completionTokens)

      await logTokens({
        userId: options.userId,
        moduleGroup: options.moduleGroup,
        model,
        totalTokens: usageData.totalTokens,
        promptTokens: usageData.promptTokens,
        completionTokens: usageData.completionTokens,
        provider: options.provider || 'openai',
        costUSD: costs.costUSD,
        costBRL: costs.costBRL,
        responseTime,
        finishReason: response.choices[0]?.finish_reason,
        subject: options.subject,
        grade: options.grade,
        messages: options.messages
      })
    } catch (error) {
      console.warn('[OpenAI-Tracking] Failed to track usage:', error)
    }
  }

  /**
   * Track failed request
   */
  private async trackFailedRequest(
    error: any,
    options: TrackingOptions,
    responseTime: number
  ): Promise<void> {
    try {
      // Log failed request to ai_requests table
      const { prisma } = await import('./db')
      
      await prisma.ai_requests.create({
        data: {
          tenant_id: 'default',
          user_id: options.userId,
          session_id: `session_${Date.now()}`,
          provider: options.provider || 'openai',
          model: 'unknown',
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          cost_brl: '0',
          latency_ms: responseTime,
          success: false,
          error_code: error.code || 'unknown_error',
          metadata: {
            module: options.moduleGroup,
            subject: options.subject || null,
            grade: options.grade || null,
            error: error.message || 'Unknown error'
          }
        }
      })
    } catch (trackingError) {
      console.warn('[OpenAI-Tracking] Failed to track failed request:', trackingError)
    }
  }

  /**
   * Get the underlying OpenAI client for direct access
   */
  getClient(): OpenAI {
    return this.client
  }
}

/**
 * Create a tracking-enabled OpenAI client
 */
export function createTrackingClient(apiKey: string, defaultOptions: Partial<TrackingOptions> = {}): OpenAITrackingClient {
  return new OpenAITrackingClient(apiKey, defaultOptions)
}

/**
 * Utility function to wrap existing OpenAI calls with tracking
 */
export async function withTracking<T>(
  openaiCall: () => Promise<T>,
  trackingOptions: TrackingOptions,
  model: string = 'gpt-4o-mini'
): Promise<T> {
  const startTime = Date.now()
  
  try {
    const result = await openaiCall()
    const responseTime = Date.now() - startTime

    // If the result has usage data, track it
    if (result && typeof result === 'object' && 'usage' in result) {
      const usage = (result as any).usage
      if (usage) {
        const { extractUsageData, calculateCost } = await import('./token-logger')
        const usageData = extractUsageData(usage)
        const costs = calculateCost(model, usageData.promptTokens, usageData.completionTokens)

        await logTokens({
          userId: trackingOptions.userId,
          moduleGroup: trackingOptions.moduleGroup,
          model,
          totalTokens: usageData.totalTokens,
          promptTokens: usageData.promptTokens,
          completionTokens: usageData.completionTokens,
          provider: trackingOptions.provider || 'openai',
          costUSD: costs.costUSD,
          costBRL: costs.costBRL,
          responseTime,
          finishReason: (result as any).choices?.[0]?.finish_reason,
          subject: trackingOptions.subject,
          grade: trackingOptions.grade,
          messages: trackingOptions.messages
        })
      }
    }

    return result
  } catch (error) {
    // Track failed request
    const responseTime = Date.now() - startTime
    try {
      const { prisma } = await import('./db')
      
      await prisma.ai_requests.create({
        data: {
          tenant_id: 'default',
          user_id: trackingOptions.userId,
          session_id: `session_${Date.now()}`,
          provider: trackingOptions.provider || 'openai',
          model,
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          cost_brl: '0',
          latency_ms: responseTime,
          success: false,
          error_code: (error as any).code || 'unknown_error',
          metadata: {
            module: trackingOptions.moduleGroup,
            subject: trackingOptions.subject || null,
            grade: trackingOptions.grade || null,
            error: (error as any).message || 'Unknown error'
          }
        }
      })
    } catch (trackingError) {
      console.warn('[withTracking] Failed to track failed request:', trackingError)
    }
    
    throw error
  }
}
