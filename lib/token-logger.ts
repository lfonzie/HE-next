import { prisma } from '@/lib/db'

type ModuleGroup = 'ENEM' | 'Redacao' | 'Aulas' | 'Chat'

interface LogTokensParams {
  userId: string
  moduleGroup: ModuleGroup
  model?: string | null
  totalTokens: number
  promptTokens?: number
  completionTokens?: number
  subject?: string | null
  grade?: string | null
  messages?: unknown
  provider?: string
  costUSD?: number
  costBRL?: number
  responseTime?: number
  finishReason?: string
}

interface UsageData {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

/**
 * Calculate cost based on model and token usage
 */
export function calculateCost(model: string, promptTokens: number, completionTokens: number): { costUSD: number; costBRL: number } {
  // Pricing per 1K tokens (as of 2024)
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4o': { prompt: 0.005, completion: 0.015 },
    'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
    'grok-4-fast-reasoning': { prompt: 0.00012, completion: 0.00048 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
    'gemini-2.0-flash-exp': { prompt: 0.000075, completion: 0.0003 },
    'gemini-pro': { prompt: 0.0005, completion: 0.0015 }
  }

  const modelPricing = pricing[model] || pricing['grok-4-fast-reasoning'] // Default to Grok pricing
  
  const costUSD = (promptTokens / 1000) * modelPricing.prompt + (completionTokens / 1000) * modelPricing.completion
  const costBRL = costUSD * 5.5 // Approximate USD to BRL conversion

  return { costUSD, costBRL }
}

/**
 * Persist token usage:
 * - Inserts a row into `conversations` with token_count for the user and module group
 * - Inserts a row into `analytics` (per user, per school, per module) when school_id is available
 * - Inserts a row into `cost_log` for detailed cost tracking
 * - Inserts a row into `ai_requests` for comprehensive request tracking
 *
 * This helper is designed to be fire-and-forget. It should never throw.
 */
export async function logTokens(params: LogTokensParams): Promise<void> {
  try {
    const {
      userId,
      moduleGroup,
      model = 'grok-4-fast-reasoning',
      totalTokens,
      promptTokens = 0,
      completionTokens = 0,
      subject,
      grade,
      messages,
      provider = 'grok',
      costUSD,
      costBRL,
      responseTime,
      finishReason
    } = params

    if (!userId || !moduleGroup) return

    // Calculate costs if not provided
    const costs = costUSD !== undefined && costBRL !== undefined 
      ? { costUSD, costBRL }
      : calculateCost(model, promptTokens, completionTokens)

    // Create a conversation row capturing this interaction
    await prisma.conversations.create({
      data: {
        user_id: userId,
        module: moduleGroup,
        subject: subject ?? undefined,
        grade: grade ?? undefined,
        messages: messages ?? {},
        token_count: Math.max(0, Math.floor(totalTokens || 0)),
        model: model ?? undefined
      }
    })

    // Create cost log entry
    await prisma.cost_log.create({
      data: {
        user_id: userId,
        provider,
        model,
        prompt_tokens: Math.max(0, Math.floor(promptTokens || 0)),
        completion_tokens: Math.max(0, Math.floor(completionTokens || 0)),
        total_tokens: Math.max(0, Math.floor(totalTokens || 0)),
        cost_usd: costs.costUSD,
        cost_brl: costs.costBRL
      }
    })

    // Create AI request entry for comprehensive tracking
    await prisma.ai_requests.create({
      data: {
        tenant_id: 'default', // You might want to make this configurable
        user_id: userId,
        session_id: `session_${Date.now()}`, // Generate a session ID
        provider,
        model,
        prompt_tokens: Math.max(0, Math.floor(promptTokens || 0)),
        completion_tokens: Math.max(0, Math.floor(completionTokens || 0)),
        total_tokens: Math.max(0, Math.floor(totalTokens || 0)),
        cost_brl: costs.costBRL.toString(),
        latency_ms: responseTime || 0,
        success: true,
        metadata: {
          module: moduleGroup,
          subject: subject || null,
          grade: grade || null,
          finishReason: finishReason || null,
          messages: messages || null
        }
      }
    })

    // Also persist into analytics if the user has an associated school
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { school_id: true }
    })

    if (user?.school_id) {
      await prisma.analytics.create({
        data: {
          school_id: user.school_id,
          user_id: userId,
          module: moduleGroup,
          subject: subject ?? undefined,
          grade: grade ?? undefined,
          tokens_used: Math.max(0, Math.floor(totalTokens || 0)),
          model: model ?? undefined,
          response_time: responseTime,
          date: new Date()
        }
      })
    }
  } catch (error) {
    // Never crash callers
    console.warn('[token-logger] Failed to persist token usage:', error)
  }
}

/** Utility to safely extract total tokens from various SDKs */
export function extractTotalTokens(usage: any): number {
  if (!usage) return 0
  // Vercel AI SDK styles
  if (typeof usage.totalTokens === 'number') return usage.totalTokens
  if (typeof usage.inputTokens === 'number' && typeof usage.outputTokens === 'number') {
    return (usage.inputTokens || 0) + (usage.outputTokens || 0)
  }
  if (typeof usage.promptTokens === 'number' && typeof usage.completionTokens === 'number') {
    return (usage.promptTokens || 0) + (usage.completionTokens || 0)
  }
  // OpenAI REST styles
  if (typeof usage.total_tokens === 'number') return usage.total_tokens
  if (typeof usage.prompt_tokens === 'number' || typeof usage.completion_tokens === 'number') {
    return (usage.prompt_tokens || 0) + (usage.completion_tokens || 0)
  }
  return 0
}

/** Extract detailed usage data from various SDK response formats */
export function extractUsageData(usage: any): { promptTokens: number; completionTokens: number; totalTokens: number } {
  if (!usage) return { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

  // Vercel AI SDK styles
  if (usage.inputTokens !== undefined && usage.outputTokens !== undefined) {
    return {
      promptTokens: usage.inputTokens || 0,
      completionTokens: usage.outputTokens || 0,
      totalTokens: (usage.inputTokens || 0) + (usage.outputTokens || 0)
    }
  }

  if (usage.promptTokens !== undefined && usage.completionTokens !== undefined) {
    return {
      promptTokens: usage.promptTokens || 0,
      completionTokens: usage.completionTokens || 0,
      totalTokens: (usage.promptTokens || 0) + (usage.completionTokens || 0)
    }
  }

  // OpenAI REST API styles
  if (usage.prompt_tokens !== undefined && usage.completion_tokens !== undefined) {
    return {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0)
    }
  }

  // Fallback to total tokens only
  const totalTokens = usage.totalTokens || usage.total_tokens || 0
  return {
    promptTokens: Math.floor(totalTokens * 0.7), // Estimate 70% prompt, 30% completion
    completionTokens: Math.floor(totalTokens * 0.3),
    totalTokens
  }
}

/** Convenience function to log usage from AI SDK onFinish callback */
export async function logUsageFromCallback(
  userId: string,
  moduleGroup: ModuleGroup,
  result: { usage?: any; finishReason?: string },
  model: string = 'grok-4-fast-reasoning',
  provider: string = 'grok',
  responseTime?: number,
  context?: { subject?: string; grade?: string; messages?: unknown }
): Promise<void> {
  if (!result.usage) return

  const usageData = extractUsageData(result.usage)
  
  await logTokens({
    userId,
    moduleGroup,
    model,
    totalTokens: usageData.totalTokens,
    promptTokens: usageData.promptTokens,
    completionTokens: usageData.completionTokens,
    provider,
    responseTime,
    finishReason: result.finishReason,
    ...context
  })
}


