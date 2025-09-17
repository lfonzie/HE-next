export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
  expectedVolume: number
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime?: number
  nextAttemptTime?: number
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private successes: number = 0
  private lastFailureTime?: number
  private nextAttemptTime?: number
  private config: CircuitBreakerConfig

  constructor(config: CircuitBreakerConfig) {
    this.config = config
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.nextAttemptTime && Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN')
      }
      this.state = CircuitState.HALF_OPEN
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.successes++
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED
      this.failures = 0
    }
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeout
    } else if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeout
    }
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    }
  }

  reset() {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = undefined
    this.nextAttemptTime = undefined
  }
}

// OpenAI Circuit Breaker
export const openAICircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 30000, // 30 seconds
  monitoringPeriod: 60000, // 1 minute
  expectedVolume: 100,
})

// Unsplash Circuit Breaker
export const unsplashCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 15000, // 15 seconds
  monitoringPeriod: 30000, // 30 seconds
  expectedVolume: 50,
})

// Database Circuit Breaker
export const databaseCircuitBreaker = new CircuitBreaker({
  failureThreshold: 10,
  recoveryTimeout: 60000, // 1 minute
  monitoringPeriod: 120000, // 2 minutes
  expectedVolume: 200,
})

// Retry utility with exponential backoff
export class RetryManager {
  private maxRetries: number
  private baseDelay: number
  private maxDelay: number

  constructor(maxRetries: number = 3, baseDelay: number = 1000, maxDelay: number = 10000) {
    this.maxRetries = maxRetries
    this.baseDelay = baseDelay
    this.maxDelay = maxDelay
  }

  async execute<T>(
    operation: () => Promise<T>,
    circuitBreaker?: CircuitBreaker
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (circuitBreaker) {
          return await circuitBreaker.execute(operation)
        } else {
          return await operation()
        }
      } catch (error) {
        lastError = error as Error

        if (attempt === this.maxRetries) {
          break
        }

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt),
          this.maxDelay
        )

        await this.delay(delay)
      }
    }

    throw lastError!
  }

  private isNonRetryableError(error: any): boolean {
    const nonRetryableErrors = [
      'Unauthorized',
      'Forbidden',
      'Bad Request',
      'Not Found',
    ]

    return nonRetryableErrors.some(errorType => 
      error.message?.includes(errorType)
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Rate limiter
export class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now()
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.windowMs
    )

    if (this.requests.length >= this.maxRequests) {
      return false
    }

    this.requests.push(now)
    return true
  }

  getRemainingRequests(): number {
    return Math.max(0, this.maxRequests - this.requests.length)
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0
    return this.requests[0] + this.windowMs
  }
}

// OpenAI Rate Limiter (10 requests per minute)
export const openAIRateLimiter = new RateLimiter(10, 60000)

// Unsplash Rate Limiter (50 requests per hour)
export const unsplashRateLimiter = new RateLimiter(50, 3600000)

// Timeout utility
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

// Health check utility
export class HealthChecker {
  private checks: Map<string, () => Promise<boolean>> = new Map()

  addCheck(name: string, check: () => Promise<boolean>) {
    this.checks.set(name, check)
  }

  async runChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    this.checks.forEach(async (check, name) => {
      try {
        results[name] = await check()
      } catch (error) {
        console.error(`Health check failed for ${name}:`, error)
        results[name] = false
      }
    });

    return results
  }

  async isHealthy(): Promise<boolean> {
    const results = await this.runChecks()
    return Object.values(results).every(result => result === true)
  }
}

// Global health checker
export const healthChecker = new HealthChecker()

// Add OpenAI health check
healthChecker.addCheck('openai', async () => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
})

// Add Unsplash health check
healthChecker.addCheck('unsplash', async () => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    )
    return response.ok
  } catch {
    return false
  }
})

// Add database health check
healthChecker.addCheck('database', async () => {
  try {
    // This would check database connectivity
    // For now, we'll assume it's healthy
    return true
  } catch {
    return false
  }
})
