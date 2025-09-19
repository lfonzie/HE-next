import { prisma } from '@/lib/db'

type ModuleGroup = 'ENEM' | 'Redacao' | 'Aulas' | 'Chat'

interface LogTokensParams {
  userId: string
  moduleGroup: ModuleGroup
  model?: string | null
  totalTokens: number
  subject?: string | null
  grade?: string | null
  messages?: unknown
}

/**
 * Persist token usage:
 * - Inserts a row into `conversations` with token_count for the user and module group
 * - Inserts a row into `analytics` (per user, per school, per module) when school_id is available
 *
 * This helper is designed to be fire-and-forget. It should never throw.
 */
export async function logTokens(params: LogTokensParams): Promise<void> {
  try {
    const {
      userId,
      moduleGroup,
      model,
      totalTokens,
      subject,
      grade,
      messages
    } = params

    if (!userId || !moduleGroup) return

    // Create a conversation row capturing this interaction
    // Note: We create a new conversation per interaction to ensure we never block on missing IDs
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


