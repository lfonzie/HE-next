import { logTokens, extractUsageData, calculateCost } from './token-logger'

interface StreamingUsageTrackerOptions {
  userId: string
  moduleGroup: 'ENEM' | 'Redacao' | 'Aulas' | 'Chat'
  model: string
  provider: string
  subject?: string
  grade?: string
  messages?: unknown
}

/**
 * Utility class for tracking usage in streaming responses
 */
export class StreamingUsageTracker {
  private options: StreamingUsageTrackerOptions
  private startTime: number
  private usageData: any = null
  private finishReason: string | undefined

  constructor(options: StreamingUsageTrackerOptions) {
    this.options = options
    this.startTime = Date.now()
  }

  /**
   * Handle usage data from streaming response
   */
  handleUsageData(usage: any): void {
    this.usageData = usage
  }

  /**
   * Handle finish reason from streaming response
   */
  handleFinishReason(reason: string): void {
    this.finishReason = reason
  }

  /**
   * Track usage when streaming is complete
   */
  async trackUsage(): Promise<void> {
    if (!this.usageData) {
      console.warn('[StreamingUsageTracker] No usage data to track')
      return
    }

    try {
      const responseTime = Date.now() - this.startTime
      const usage = extractUsageData(this.usageData)
      const costs = calculateCost(this.options.model, usage.promptTokens, usage.completionTokens)

      await logTokens({
        userId: this.options.userId,
        moduleGroup: this.options.moduleGroup,
        model: this.options.model,
        totalTokens: usage.totalTokens,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        provider: this.options.provider,
        costUSD: costs.costUSD,
        costBRL: costs.costBRL,
        responseTime,
        finishReason: this.finishReason,
        subject: this.options.subject,
        grade: this.options.grade,
        messages: this.options.messages
      })

      console.log('✅ [StreamingUsageTracker] Usage tracked:', {
        userId: this.options.userId,
        module: this.options.moduleGroup,
        model: this.options.model,
        tokens: usage.totalTokens,
        costUSD: costs.costUSD,
        responseTime
      })
    } catch (error) {
      console.warn('⚠️ [StreamingUsageTracker] Failed to track usage:', error)
    }
  }

  /**
   * Track failed streaming request
   */
  async trackFailedRequest(error: any): Promise<void> {
    try {
      const responseTime = Date.now() - this.startTime
      const { prisma } = await import('./db')
      
      await prisma.ai_requests.create({
        data: {
          tenant_id: 'default',
          user_id: this.options.userId,
          session_id: `session_${Date.now()}`,
          provider: this.options.provider,
          model: this.options.model,
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          cost_brl: '0',
          latency_ms: responseTime,
          success: false,
          error_code: error.code || 'streaming_error',
          metadata: {
            module: this.options.moduleGroup,
            subject: this.options.subject || null,
            grade: this.options.grade || null,
            error: error.message || 'Streaming error'
          }
        }
      })

      console.log('❌ [StreamingUsageTracker] Failed request tracked:', {
        userId: this.options.userId,
        module: this.options.moduleGroup,
        error: error.message,
        responseTime
      })
    } catch (trackingError) {
      console.warn('⚠️ [StreamingUsageTracker] Failed to track failed request:', trackingError)
    }
  }
}

/**
 * Create a streaming usage tracker
 */
export function createStreamingUsageTracker(options: StreamingUsageTrackerOptions): StreamingUsageTracker {
  return new StreamingUsageTracker(options)
}

/**
 * Utility function to wrap OpenAI streaming calls with usage tracking
 */
export async function withStreamingTracking<T>(
  streamingCall: () => Promise<T>,
  options: StreamingUsageTrackerOptions
): Promise<T> {
  const tracker = createStreamingUsageTracker(options)
  
  try {
    const result = await streamingCall()
    
    // If the result has usage data, track it
    if (result && typeof result === 'object') {
      const resultObj = result as any
      
      if (resultObj.usage) {
        tracker.handleUsageData(resultObj.usage)
      }
      
      if (resultObj.finish_reason) {
        tracker.handleFinishReason(resultObj.finish_reason)
      }
      
      await tracker.trackUsage()
    }
    
    return result
  } catch (error) {
    await tracker.trackFailedRequest(error)
    throw error
  }
}

/**
 * Enhanced OpenAI client for streaming with usage tracking
 */
export class StreamingOpenAIClient {
  private client: any
  private defaultOptions: Partial<StreamingUsageTrackerOptions>

  constructor(apiKey: string, defaultOptions: Partial<StreamingUsageTrackerOptions> = {}) {
    this.client = new (require('openai'))({ apiKey })
    this.defaultOptions = defaultOptions
  }

  /**
   * Create streaming chat completion with usage tracking
   */
  async createStreamingChatCompletion(
    params: any,
    trackingOptions: StreamingUsageTrackerOptions
  ): Promise<any> {
    const tracker = createStreamingUsageTracker(trackingOptions)
    
    try {
      // Enable usage tracking in stream options
      const streamParams = {
        ...params,
        stream: true,
        stream_options: { include_usage: true }
      }

      const stream = await this.client.chat.completions.create(streamParams)
      
      // Wrap the stream to track usage
      return this.wrapStreamWithTracking(stream, tracker)
    } catch (error) {
      await tracker.trackFailedRequest(error)
      throw error
    }
  }

  /**
   * Wrap stream with usage tracking
   */
  private wrapStreamWithTracking(stream: any, tracker: StreamingUsageTracker): any {
    const originalIterator = stream[Symbol.asyncIterator]
    
    stream[Symbol.asyncIterator] = async function* () {
      try {
        for await (const chunk of originalIterator.call(this)) {
          // Check if this is the final chunk with usage data
          if (chunk.usage) {
            tracker.handleUsageData(chunk.usage)
          }
          
          if (chunk.choices?.[0]?.finish_reason) {
            tracker.handleFinishReason(chunk.choices[0].finish_reason)
          }
          
          yield chunk
        }
        
        // Track usage when stream completes
        await tracker.trackUsage()
      } catch (error) {
        await tracker.trackFailedRequest(error)
        throw error
      }
    }
    
    return stream
  }
}

/**
 * Create a streaming OpenAI client with usage tracking
 */
export function createStreamingOpenAIClient(
  apiKey: string, 
  defaultOptions: Partial<StreamingUsageTrackerOptions> = {}
): StreamingOpenAIClient {
  return new StreamingOpenAIClient(apiKey, defaultOptions)
}
