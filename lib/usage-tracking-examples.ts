/**
 * Examples of how to use the OpenAI usage tracking system
 * 
 * This file demonstrates various ways to implement usage tracking
 * in your application using the enhanced token logger and utilities.
 */

import { logTokens, logUsageFromCallback, extractUsageData, calculateCost } from './token-logger'
import { withTracking } from './openai-with-tracking'
import { createStreamingUsageTracker } from './streaming-usage-tracker'

// Example 1: Basic usage tracking with OpenAI REST API
export async function exampleBasicTracking() {
  const OpenAI = require('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Hello, world!' }],
    temperature: 0.7
  })

  // Extract usage data and log it
  const usageData = extractUsageData(response.usage)
  const costs = calculateCost('gpt-4o-mini', usageData.promptTokens, usageData.completionTokens)

  await logTokens({
    userId: 'user-123',
    moduleGroup: 'Chat',
    model: 'gpt-4o-mini',
    totalTokens: usageData.totalTokens,
    promptTokens: usageData.promptTokens,
    completionTokens: usageData.completionTokens,
    provider: 'openai',
    costUSD: costs.costUSD,
    costBRL: costs.costBRL,
    responseTime: 1500,
    finishReason: response.choices[0]?.finish_reason,
    subject: 'general',
    messages: { request: 'Hello, world!' }
  })
}

// Example 2: Using the tracking wrapper
export async function exampleWithTrackingWrapper() {
  const OpenAI = require('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await withTracking(
    () => openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Explain quantum computing' }],
      temperature: 0.7
    }),
    {
      userId: 'user-123',
      moduleGroup: 'Chat',
      subject: 'physics',
      messages: { request: 'Explain quantum computing' }
    },
    'gpt-4o-mini'
  )

  return response
}

// Example 3: AI SDK with onFinish callback
export async function exampleAISDKTracking() {
  const { streamText } = require('ai')
  const { openai } = require('@ai-sdk/openai')

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [{ role: 'user', content: 'Write a poem about coding' }],
    temperature: 0.7,
    onFinish: async (result) => {
      await logUsageFromCallback(
        'user-123',
        'Chat',
        result,
        'gpt-4o-mini',
        'openai',
        undefined,
        {
          subject: 'creative-writing',
          messages: { request: 'Write a poem about coding' }
        }
      )
    }
  })

  return result
}

// Example 4: Streaming with usage tracking
export async function exampleStreamingTracking() {
  const OpenAI = require('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const tracker = createStreamingUsageTracker({
    userId: 'user-123',
    moduleGroup: 'Chat',
    model: 'gpt-4o-mini',
    provider: 'openai',
    subject: 'education',
    messages: { request: 'Explain photosynthesis' }
  })

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Explain photosynthesis' }],
      temperature: 0.7,
      stream: true,
      stream_options: { include_usage: true }
    })

    for await (const chunk of stream) {
      // Process chunk...
      console.log(chunk.choices[0]?.delta?.content || '')

      // Track usage data if present
      if (chunk.usage) {
        tracker.handleUsageData(chunk.usage)
      }

      if (chunk.choices?.[0]?.finish_reason) {
        tracker.handleFinishReason(chunk.choices[0].finish_reason)
      }
    }

    // Track usage when stream completes
    await tracker.trackUsage()
  } catch (error) {
    await tracker.trackFailedRequest(error)
    throw error
  }
}

// Example 5: Batch processing with usage tracking
export async function exampleBatchProcessing() {
  const OpenAI = require('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const requests = [
    { content: 'What is machine learning?', subject: 'ai' },
    { content: 'Explain photosynthesis', subject: 'biology' },
    { content: 'How does gravity work?', subject: 'physics' }
  ]

  const results = await Promise.all(
    requests.map(async (request) => {
      const response = await withTracking(
        () => openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: request.content }],
          temperature: 0.7
        }),
        {
          userId: 'user-123',
          moduleGroup: 'Chat',
          subject: request.subject,
          messages: { request: request.content }
        },
        'gpt-4o-mini'
      )

      return {
        content: request.content,
        response: response.choices[0]?.message?.content,
        usage: response.usage
      }
    })
  )

  return results
}

// Example 6: Error handling with usage tracking
export async function exampleErrorHandling() {
  const OpenAI = require('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await withTracking(
      () => openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Generate a very long response' }],
        temperature: 0.7,
        max_tokens: 1000000 // This might exceed limits
      }),
      {
        userId: 'user-123',
        moduleGroup: 'Chat',
        subject: 'test',
        messages: { request: 'Generate a very long response' }
      },
      'gpt-4o-mini'
    )

    return response
  } catch (error) {
    console.error('Request failed:', error)
    
    // The tracking wrapper automatically logs failed requests
    // You can also manually log additional error details if needed
    
    throw error
  }
}

// Example 7: Custom usage analytics
export async function exampleCustomAnalytics() {
  const { getUsageStats, getUserUsageStats } = require('./usage-analytics')

  // Get overall platform stats
  const platformStats = await getUsageStats()
  console.log('Platform Stats:', platformStats)

  // Get user-specific stats
  const userStats = await getUserUsageStats('user-123')
  console.log('User Stats:', userStats)

  // Get stats for a specific date range
  const startDate = new Date('2024-01-01')
  const endDate = new Date('2024-01-31')
  const monthlyStats = await getUsageStats(startDate, endDate)
  console.log('Monthly Stats:', monthlyStats)

  return {
    platform: platformStats,
    user: userStats,
    monthly: monthlyStats
  }
}

// Example 8: Real-time usage monitoring
export class UsageMonitor {
  private usageThresholds = {
    dailyTokens: 100000,
    hourlyRequests: 1000,
    costUSD: 50
  }

  async checkUsageLimits(userId: string): Promise<{
    canMakeRequest: boolean
    warnings: string[]
    usage: any
  }> {
    const { getUserUsageStats } = require('./usage-analytics')
    
    const userStats = await getUserUsageStats(userId)
    const warnings: string[] = []

    if (userStats.totalTokens > this.usageThresholds.dailyTokens) {
      warnings.push('Daily token limit exceeded')
    }

    if (userStats.totalRequests > this.usageThresholds.hourlyRequests) {
      warnings.push('Hourly request limit exceeded')
    }

    if (userStats.totalCostUSD > this.usageThresholds.costUSD) {
      warnings.push('Daily cost limit exceeded')
    }

    return {
      canMakeRequest: warnings.length === 0,
      warnings,
      usage: userStats
    }
  }
}

// Example 9: Usage-based rate limiting
export async function exampleRateLimiting() {
  const monitor = new UsageMonitor()
  const userId = 'user-123'

  const { canMakeRequest, warnings, usage } = await monitor.checkUsageLimits(userId)

  if (!canMakeRequest) {
    throw new Error(`Request blocked: ${warnings.join(', ')}`)
  }

  // Proceed with the request
  console.log('Request allowed. Current usage:', usage)
}

// Example 10: Cost optimization suggestions
export async function exampleCostOptimization() {
  const { getModelPerformanceStats } = require('./usage-analytics')
  
  const modelStats = await getModelPerformanceStats()
  
  // Find the most cost-effective model
  const mostCostEffective = modelStats.reduce((best, current) => {
    const currentCostPerToken = current.averageCostPerRequest / current.totalTokens
    const bestCostPerToken = best.averageCostPerRequest / best.totalTokens
    
    return currentCostPerToken < bestCostPerToken ? current : best
  })

  console.log('Most cost-effective model:', mostCostEffective)

  // Suggest optimizations
  const suggestions = []
  
  if (mostCostEffective.averageResponseTime > 5000) {
    suggestions.push('Consider using a faster model for better user experience')
  }
  
  if (mostCostEffective.successRate < 95) {
    suggestions.push('Model reliability is low, consider switching providers')
  }

  return {
    mostCostEffective,
    suggestions
  }
}
