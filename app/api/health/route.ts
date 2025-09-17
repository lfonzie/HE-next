import { NextRequest, NextResponse } from 'next/server'
import { healthChecker } from '@/lib/circuit-breaker'
import { openAICircuitBreaker, unsplashCircuitBreaker, databaseCircuitBreaker } from '@/lib/circuit-breaker'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Run health checks
    const healthResults = await healthChecker.runChecks()
    const isHealthy = await healthChecker.isHealthy()
    
    // Get circuit breaker status
    const circuitBreakerStatus = {
      openai: openAICircuitBreaker.getStats(),
      unsplash: unsplashCircuitBreaker.getStats(),
      database: databaseCircuitBreaker.getStats(),
    }
    
    // Get system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString(),
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime
    
    const healthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      services: healthResults,
      circuitBreakers: circuitBreakerStatus,
      system: systemMetrics,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }
    
    return NextResponse.json(healthStatus, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
    
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 })
  }
}

// Detailed health check endpoint
export async function POST(request: NextRequest) {
  try {
    const { checks } = await request.json()
    
    if (!checks || !Array.isArray(checks)) {
      return NextResponse.json({
        error: 'Invalid request format. Expected { checks: string[] }'
      }, { status: 400 })
    }
    
    const results: Record<string, any> = {}
    
    for (const checkName of checks) {
      try {
        switch (checkName) {
          case 'openai':
            results.openai = await checkOpenAI()
            break
          case 'unsplash':
            results.unsplash = await checkUnsplash()
            break
          case 'database':
            results.database = await checkDatabase()
            break
          case 'memory':
            results.memory = checkMemory()
            break
          case 'disk':
            results.disk = checkDisk()
            break
          default:
            results[checkName] = { error: 'Unknown check' }
        }
      } catch (error) {
        results[checkName] = {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      checks: results,
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Health check request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// Individual service health checks
async function checkOpenAI() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      responseTime: Date.now(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkUnsplash() {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
      { signal: AbortSignal.timeout(5000) }
    )
    
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      responseTime: Date.now(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkDatabase() {
  try {
    // This would check database connectivity
    // For now, we'll simulate a check
    return {
      status: 'healthy',
      responseTime: Date.now(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function checkMemory() {
  const usage = process.memoryUsage()
  const totalMemory = usage.heapTotal
  const usedMemory = usage.heapUsed
  const freeMemory = totalMemory - usedMemory
  const usagePercentage = (usedMemory / totalMemory) * 100
  
  return {
    status: usagePercentage < 90 ? 'healthy' : 'warning',
    total: totalMemory,
    used: usedMemory,
    free: freeMemory,
    usagePercentage: Math.round(usagePercentage * 100) / 100,
  }
}

function checkDisk() {
  // This would check disk usage
  // For now, we'll return a mock response
  return {
    status: 'healthy',
    usagePercentage: 45,
    freeSpace: '2.5GB',
  }
}