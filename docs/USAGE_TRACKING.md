# OpenAI API Usage Tracking System

This document describes the comprehensive usage tracking system implemented for OpenAI API calls in the HE-next application.

## Overview

The usage tracking system provides:
- **Automatic token usage tracking** from OpenAI API responses
- **Cost calculation** in both USD and BRL
- **Performance monitoring** (response times, success rates)
- **Analytics and reporting** for users, schools, and administrators
- **Streaming support** with real-time usage tracking
- **Error tracking** for failed requests

## Architecture

### Core Components

1. **Token Logger** (`lib/token-logger.ts`) - Core logging functionality
2. **OpenAI Tracking Client** (`lib/openai-with-tracking.ts`) - Wrapper for OpenAI calls
3. **Streaming Usage Tracker** (`lib/streaming-usage-tracker.ts`) - Streaming-specific tracking
4. **Usage Analytics** (`lib/usage-analytics.ts`) - Analytics and reporting functions
5. **Admin API** (`app/api/admin/usage-stats/route.ts`) - API endpoints for usage data

### Database Tables

The system uses several database tables to store usage data:

- **`conversations`** - Basic conversation tracking
- **`analytics`** - School and user analytics
- **`cost_log`** - Detailed cost tracking
- **`ai_requests`** - Comprehensive request tracking

## Quick Start

### Basic Usage Tracking

```typescript
import { logTokens, extractUsageData, calculateCost } from '@/lib/token-logger'

// After making an OpenAI API call
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }]
})

// Extract and log usage
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
  subject: 'general'
})
```

### Using the Tracking Wrapper

```typescript
import { withTracking } from '@/lib/openai-with-tracking'

const response = await withTracking(
  () => openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Explain quantum computing' }]
  }),
  {
    userId: 'user-123',
    moduleGroup: 'Chat',
    subject: 'physics',
    messages: { request: 'Explain quantum computing' }
  },
  'gpt-4o-mini'
)
```

### AI SDK with onFinish Callback

```typescript
import { streamText } from 'ai'
import { logUsageFromCallback } from '@/lib/token-logger'

const result = await streamText({
  model: openai('gpt-4o-mini'),
  messages: [{ role: 'user', content: 'Write a poem' }],
  onFinish: async (result) => {
    await logUsageFromCallback(
      'user-123',
      'Chat',
      result,
      'gpt-4o-mini',
      'openai',
      undefined,
      { subject: 'creative-writing' }
    )
  }
})
```

### Streaming with Usage Tracking

```typescript
import { createStreamingUsageTracker } from '@/lib/streaming-usage-tracker'

const tracker = createStreamingUsageTracker({
  userId: 'user-123',
  moduleGroup: 'Chat',
  model: 'gpt-4o-mini',
  provider: 'openai',
  subject: 'education'
})

const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Explain photosynthesis' }],
  stream: true,
  stream_options: { include_usage: true }
})

for await (const chunk of stream) {
  if (chunk.usage) {
    tracker.handleUsageData(chunk.usage)
  }
  if (chunk.choices?.[0]?.finish_reason) {
    tracker.handleFinishReason(chunk.choices[0].finish_reason)
  }
}

await tracker.trackUsage()
```

## API Reference

### Token Logger Functions

#### `logTokens(params: LogTokensParams)`

Logs token usage to the database.

**Parameters:**
- `userId: string` - User ID
- `moduleGroup: 'ENEM' | 'Redacao' | 'Aulas' | 'Chat'` - Module category
- `model?: string` - AI model used (default: 'gpt-4o-mini')
- `totalTokens: number` - Total tokens used
- `promptTokens?: number` - Prompt tokens (optional)
- `completionTokens?: number` - Completion tokens (optional)
- `provider?: string` - Provider (default: 'openai')
- `costUSD?: number` - Cost in USD (auto-calculated if not provided)
- `costBRL?: number` - Cost in BRL (auto-calculated if not provided)
- `responseTime?: number` - Response time in milliseconds
- `finishReason?: string` - Reason for completion
- `subject?: string` - Subject/topic
- `grade?: string` - Grade level
- `messages?: unknown` - Additional context

#### `extractUsageData(usage: any)`

Extracts usage data from various SDK response formats.

**Returns:** `{ promptTokens: number; completionTokens: number; totalTokens: number }`

#### `calculateCost(model: string, promptTokens: number, completionTokens: number)`

Calculates cost based on model and token usage.

**Returns:** `{ costUSD: number; costBRL: number }`

#### `logUsageFromCallback(userId, moduleGroup, result, model, provider, responseTime?, context?)`

Convenience function for logging usage from AI SDK onFinish callbacks.

### Analytics Functions

#### `getUsageStats(startDate?, endDate?)`

Get comprehensive usage statistics for the entire platform.

**Returns:** `UsageStats` object with:
- Total tokens, requests, costs
- Average metrics
- Breakdown by model, provider, module
- Daily usage trends

#### `getUserUsageStats(userId, startDate?, endDate?)`

Get usage statistics for a specific user.

#### `getSchoolUsageStats(schoolId, startDate?, endDate?)`

Get usage statistics for a specific school.

#### `getUsageTrends(days?, startDate?)`

Get usage trends over time.

#### `getModelPerformanceStats()`

Get performance statistics for different models.

### Admin API Endpoints

#### `GET /api/admin/usage-stats`

Get usage statistics (admin only).

**Query Parameters:**
- `type` - Type of stats: 'overview', 'user', 'school', 'trends', 'model-performance'
- `userId` - Required for user stats
- `schoolId` - Required for school stats
- `days` - Number of days for trends (default: 30)
- `startDate` - Start date filter
- `endDate` - End date filter

#### `POST /api/admin/usage-stats`

Get multiple statistics in one request (bulk).

**Body:**
```json
{
  "type": "bulk",
  "filters": [
    { "type": "overview" },
    { "type": "trends", "days": 30 },
    { "type": "user", "userId": "user-123" }
  ]
}
```

## Model Pricing

The system includes current pricing for popular models:

| Model | Prompt (per 1K tokens) | Completion (per 1K tokens) |
|-------|------------------------|----------------------------|
| gpt-4o | $0.005 | $0.015 |
| gpt-4o-mini | $0.00015 | $0.0006 |
| gpt-4-turbo | $0.01 | $0.03 |
| gpt-4 | $0.03 | $0.06 |
| gpt-3.5-turbo | $0.0015 | $0.002 |
| gemini-2.0-flash-exp | $0.000075 | $0.0003 |
| gemini-pro | $0.0005 | $0.0015 |

## Error Handling

The system includes comprehensive error handling:

- **Failed requests** are logged to `ai_requests` table with `success: false`
- **Tracking errors** are logged but don't crash the application
- **Missing usage data** is handled gracefully with fallbacks
- **Database errors** are caught and logged as warnings

## Best Practices

### 1. Always Track Usage

```typescript
// ✅ Good - Always track usage
const response = await openai.chat.completions.create(params)
await logTokens({ userId, moduleGroup: 'Chat', ...usageData })

// ❌ Bad - Missing usage tracking
const response = await openai.chat.completions.create(params)
// No tracking!
```

### 2. Use Appropriate Module Groups

```typescript
// ✅ Good - Specific module groups
await logTokens({ moduleGroup: 'ENEM', ... })
await logTokens({ moduleGroup: 'Aulas', ... })
await logTokens({ moduleGroup: 'Chat', ... })

// ❌ Bad - Generic or incorrect module groups
await logTokens({ moduleGroup: 'General', ... })
```

### 3. Include Context Information

```typescript
// ✅ Good - Rich context
await logTokens({
  userId: 'user-123',
  moduleGroup: 'Aulas',
  subject: 'mathematics',
  grade: '9th',
  messages: { topic: 'algebra', difficulty: 'intermediate' }
})

// ❌ Bad - Minimal context
await logTokens({
  userId: 'user-123',
  moduleGroup: 'Aulas'
})
```

### 4. Handle Streaming Properly

```typescript
// ✅ Good - Proper streaming tracking
const tracker = createStreamingUsageTracker(options)
// ... streaming logic ...
await tracker.trackUsage()

// ❌ Bad - Missing streaming tracking
const stream = await openai.chat.completions.create({ stream: true })
// No tracking for streaming!
```

### 5. Monitor Usage Limits

```typescript
// ✅ Good - Check limits before requests
const monitor = new UsageMonitor()
const { canMakeRequest } = await monitor.checkUsageLimits(userId)
if (!canMakeRequest) {
  throw new Error('Usage limit exceeded')
}
```

## Monitoring and Alerts

### Usage Thresholds

Set up monitoring for:
- Daily token limits per user
- Hourly request limits
- Cost thresholds
- Response time anomalies
- Error rates

### Dashboard Integration

The system provides data for:
- Real-time usage dashboards
- Cost analysis reports
- Performance monitoring
- User behavior analytics

## Troubleshooting

### Common Issues

1. **Missing usage data**
   - Ensure `stream_options: { include_usage: true }` for streaming
   - Check that the API response includes usage information
   - Verify the model supports usage tracking

2. **Incorrect costs**
   - Update pricing in `calculateCost` function
   - Check currency conversion rates
   - Verify model names match pricing table

3. **Database errors**
   - Check database connection
   - Verify table schemas are up to date
   - Check for missing required fields

4. **Performance issues**
   - Use bulk operations for multiple requests
   - Implement caching for analytics queries
   - Consider async logging for high-volume applications

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
process.env.DEBUG_USAGE_TRACKING = 'true'

// Or enable in code
console.log('Usage tracking enabled:', process.env.DEBUG_USAGE_TRACKING)
```

## Migration Guide

### From Basic Logging

If you're migrating from basic token logging:

1. **Update imports:**
   ```typescript
   // Old
   import { logTokens } from '@/lib/token-logger'
   
   // New
   import { logTokens, extractUsageData, calculateCost } from '@/lib/token-logger'
   ```

2. **Enhance logging calls:**
   ```typescript
   // Old
   await logTokens({ userId, moduleGroup, totalTokens })
   
   // New
   const usageData = extractUsageData(response.usage)
   const costs = calculateCost(model, usageData.promptTokens, usageData.completionTokens)
   await logTokens({
     userId,
     moduleGroup,
     model,
     totalTokens: usageData.totalTokens,
     promptTokens: usageData.promptTokens,
     completionTokens: usageData.completionTokens,
     provider: 'openai',
     costUSD: costs.costUSD,
     costBRL: costs.costBRL,
     responseTime: Date.now() - startTime,
     finishReason: response.choices[0]?.finish_reason
   })
   ```

3. **Add streaming support:**
   ```typescript
   // Add stream_options for usage tracking
   const stream = await openai.chat.completions.create({
     ...params,
     stream: true,
     stream_options: { include_usage: true }
   })
   ```

## Examples

See `lib/usage-tracking-examples.ts` for comprehensive examples of:
- Basic usage tracking
- Wrapper usage
- AI SDK integration
- Streaming tracking
- Batch processing
- Error handling
- Analytics usage
- Rate limiting
- Cost optimization

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the examples
3. Check database logs for errors
4. Verify API responses include usage data
5. Contact the development team
