import { prisma } from './db'

export interface UsageStats {
  totalTokens: number
  totalRequests: number
  totalCostUSD: number
  totalCostBRL: number
  averageTokensPerRequest: number
  averageCostPerRequest: number
  averageResponseTime: number
  requestsByModel: Record<string, number>
  requestsByProvider: Record<string, number>
  requestsByModule: Record<string, number>
  tokensByModel: Record<string, number>
  costByModel: Record<string, number>
  dailyUsage: Array<{
    date: string
    tokens: number
    requests: number
    costUSD: number
    costBRL: number
  }>
}

export interface UserUsageStats {
  userId: string
  totalTokens: number
  totalRequests: number
  totalCostUSD: number
  totalCostBRL: number
  averageTokensPerRequest: number
  requestsByModule: Record<string, number>
  tokensByModule: Record<string, number>
  recentActivity: Array<{
    date: string
    module: string
    tokens: number
    costUSD: number
  }>
}

export interface SchoolUsageStats {
  schoolId: string
  totalTokens: number
  totalRequests: number
  totalCostUSD: number
  totalCostBRL: number
  activeUsers: number
  requestsByModule: Record<string, number>
  tokensByModule: Record<string, number>
  topUsers: Array<{
    userId: string
    userName: string
    tokens: number
    requests: number
  }>
}

/**
 * Get comprehensive usage statistics for the entire platform
 */
export async function getUsageStats(
  startDate?: Date,
  endDate?: Date
): Promise<UsageStats> {
  const whereClause = startDate && endDate ? {
    created_at: {
      gte: startDate,
      lte: endDate
    }
  } : {}

  // Get basic stats from ai_requests
  const [requestStats, modelStats, providerStats, dailyStats] = await Promise.all([
    // Basic request statistics
    prisma.ai_requests.aggregate({
      where: whereClause,
      _sum: {
        total_tokens: true,
        latency_ms: true
      },
      _count: {
        id: true
      }
    }),

    // Statistics by model
    prisma.ai_requests.groupBy({
      by: ['model'],
      where: whereClause,
      _sum: {
        total_tokens: true,
        latency_ms: true
      },
      _count: {
        id: true
      }
    }),

    // Statistics by provider
    prisma.ai_requests.groupBy({
      by: ['provider'],
      where: whereClause,
      _sum: {
        total_tokens: true
      },
      _count: {
        id: true
      }
    }),

    // Daily usage statistics
    prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(total_tokens) as tokens,
        COUNT(*) as requests,
        SUM(CAST(cost_brl AS DECIMAL) / 5.5) as cost_usd,
        SUM(CAST(cost_brl AS DECIMAL)) as cost_brl
      FROM ai_requests 
      WHERE ${startDate ? `created_at >= ${startDate}` : '1=1'}
        AND ${endDate ? `created_at <= ${endDate}` : '1=1'}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `
  ])

  // Get module statistics from analytics
  const moduleStats = await prisma.analytics.groupBy({
    by: ['module'],
    where: startDate && endDate ? {
      date: {
        gte: startDate,
        lte: endDate
      }
    } : {},
    _sum: {
      tokens_used: true
    },
    _count: {
      id: true
    }
  })

  const totalTokens = requestStats._sum.total_tokens || 0
  const totalRequests = requestStats._count.id || 0
  const totalCostBRL = await getTotalCostBRL(whereClause)
  const totalCostUSD = totalCostBRL / 5.5

  // Build response
  const requestsByModel: Record<string, number> = {}
  const tokensByModel: Record<string, number> = {}
  const costByModel: Record<string, number> = {}

  modelStats.forEach(stat => {
    requestsByModel[stat.model] = stat._count.id
    tokensByModel[stat.model] = stat._sum.total_tokens || 0
    costByModel[stat.model] = (stat._sum.total_tokens || 0) * 0.0006 / 1000 // Rough estimate
  })

  const requestsByProvider: Record<string, number> = {}
  providerStats.forEach(stat => {
    requestsByProvider[stat.provider] = stat._count.id
  })

  const requestsByModule: Record<string, number> = {}
  moduleStats.forEach(stat => {
    requestsByModule[stat.module] = stat._count.id
  })

  return {
    totalTokens,
    totalRequests,
    totalCostUSD,
    totalCostBRL,
    averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
    averageCostPerRequest: totalRequests > 0 ? totalCostUSD / totalRequests : 0,
    averageResponseTime: totalRequests > 0 ? (requestStats._sum.latency_ms || 0) / totalRequests : 0,
    requestsByModel,
    requestsByProvider,
    requestsByModule,
    tokensByModel,
    costByModel,
    dailyUsage: (dailyStats as any[]).map(stat => ({
      date: stat.date.toISOString().split('T')[0],
      tokens: Number(stat.tokens),
      requests: Number(stat.requests),
      costUSD: Number(stat.cost_usd),
      costBRL: Number(stat.cost_brl)
    }))
  }
}

/**
 * Get usage statistics for a specific user
 */
export async function getUserUsageStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<UserUsageStats> {
  const whereClause = {
    user_id: userId,
    ...(startDate && endDate ? {
      created_at: {
        gte: startDate,
        lte: endDate
      }
    } : {})
  }

  const [requestStats, moduleStats, recentActivity] = await Promise.all([
    // Basic user statistics
    prisma.ai_requests.aggregate({
      where: whereClause,
      _sum: {
        total_tokens: true
      },
      _count: {
        id: true
      }
    }),

    // Statistics by module
    prisma.analytics.groupBy({
      by: ['module'],
      where: {
        user_id: userId,
        ...(startDate && endDate ? {
          date: {
            gte: startDate,
            lte: endDate
          }
        } : {})
      },
      _sum: {
        tokens_used: true
      },
      _count: {
        id: true
      }
    }),

    // Recent activity
    prisma.analytics.findMany({
      where: {
        user_id: userId,
        ...(startDate && endDate ? {
          date: {
            gte: startDate,
            lte: endDate
          }
        } : {})
      },
      orderBy: {
        date: 'desc'
      },
      take: 10,
      select: {
        date: true,
        module: true,
        tokens_used: true
      }
    })
  ])

  const totalTokens = requestStats._sum.total_tokens || 0
  const totalRequests = requestStats._count.id || 0
  const totalCostBRL = await getTotalCostBRL(whereClause)
  const totalCostUSD = totalCostBRL / 5.5

  const requestsByModule: Record<string, number> = {}
  const tokensByModule: Record<string, number> = {}

  moduleStats.forEach(stat => {
    requestsByModule[stat.module] = stat._count.id
    tokensByModule[stat.module] = stat._sum.tokens_used || 0
  })

  return {
    userId,
    totalTokens,
    totalRequests,
    totalCostUSD,
    totalCostBRL,
    averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
    requestsByModule,
    tokensByModule,
    recentActivity: recentActivity.map(activity => ({
      date: activity.date.toISOString().split('T')[0],
      module: activity.module,
      tokens: activity.tokens_used,
      costUSD: activity.tokens_used * 0.0006 / 1000 // Rough estimate
    }))
  }
}

/**
 * Get usage statistics for a specific school
 */
export async function getSchoolUsageStats(
  schoolId: string,
  startDate?: Date,
  endDate?: Date
): Promise<SchoolUsageStats> {
  const whereClause = {
    school_id: schoolId,
    ...(startDate && endDate ? {
      date: {
        gte: startDate,
        lte: endDate
      }
    } : {})
  }

  const [analyticsStats, moduleStats, topUsers] = await Promise.all([
    // Basic school statistics
    prisma.analytics.aggregate({
      where: whereClause,
      _sum: {
        tokens_used: true
      },
      _count: {
        id: true
      }
    }),

    // Statistics by module
    prisma.analytics.groupBy({
      by: ['module'],
      where: whereClause,
      _sum: {
        tokens_used: true
      },
      _count: {
        id: true
      }
    }),

    // Top users
    prisma.analytics.groupBy({
      by: ['user_id'],
      where: whereClause,
      _sum: {
        tokens_used: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          tokens_used: 'desc'
        }
      },
      take: 10
    })
  ])

  // Get user names for top users
  const userIds = topUsers.map(user => user.user_id)
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds }
    },
    select: {
      id: true,
      name: true
    }
  })

  const userMap = new Map(users.map(user => [user.id, user.name]))

  const totalTokens = analyticsStats._sum.tokens_used || 0
  const totalRequests = analyticsStats._count.id || 0
  const totalCostBRL = totalTokens * 0.0006 / 1000 * 5.5 // Rough estimate
  const totalCostUSD = totalCostBRL / 5.5

  const requestsByModule: Record<string, number> = {}
  const tokensByModule: Record<string, number> = {}

  moduleStats.forEach(stat => {
    requestsByModule[stat.module] = stat._count.id
    tokensByModule[stat.module] = stat._sum.tokens_used || 0
  })

  // Count active users
  const activeUsers = await prisma.analytics.groupBy({
    by: ['user_id'],
    where: whereClause,
    _count: {
      id: true
    }
  })

  return {
    schoolId,
    totalTokens,
    totalRequests,
    totalCostUSD,
    totalCostBRL,
    activeUsers: activeUsers.length,
    requestsByModule,
    tokensByModule,
    topUsers: topUsers.map(user => ({
      userId: user.user_id,
      userName: userMap.get(user.user_id) || 'Unknown User',
      tokens: user._sum.tokens_used || 0,
      requests: user._count.id
    }))
  }
}

/**
 * Get total cost in BRL from cost_log table
 */
async function getTotalCostBRL(whereClause: any): Promise<number> {
  const result = await prisma.cost_log.aggregate({
    where: whereClause,
    _sum: {
      cost_brl: true
    }
  })

  return Number(result._sum.cost_brl) || 0
}

/**
 * Get usage trends over time
 */
export async function getUsageTrends(
  days: number = 30,
  startDate?: Date
): Promise<Array<{
  date: string
  tokens: number
  requests: number
  costUSD: number
  costBRL: number
  averageResponseTime: number
}>> {
  const endDate = startDate || new Date()
  const beginDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

  const trends = await prisma.$queryRaw`
    SELECT 
      DATE(created_at) as date,
      SUM(total_tokens) as tokens,
      COUNT(*) as requests,
      SUM(CAST(cost_brl AS DECIMAL) / 5.5) as cost_usd,
      SUM(CAST(cost_brl AS DECIMAL)) as cost_brl,
      AVG(latency_ms) as avg_response_time
    FROM ai_requests 
    WHERE created_at >= ${beginDate}
      AND created_at <= ${endDate}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `

  return (trends as any[]).map(trend => ({
    date: trend.date.toISOString().split('T')[0],
    tokens: Number(trend.tokens),
    requests: Number(trend.requests),
    costUSD: Number(trend.cost_usd),
    costBRL: Number(trend.cost_brl),
    averageResponseTime: Number(trend.avg_response_time) || 0
  }))
}

/**
 * Get model performance statistics
 */
export async function getModelPerformanceStats(): Promise<Array<{
  model: string
  provider: string
  totalRequests: number
  totalTokens: number
  averageResponseTime: number
  successRate: number
  averageCostPerRequest: number
}>> {
  const stats = await prisma.ai_requests.groupBy({
    by: ['model', 'provider'],
    _sum: {
      total_tokens: true,
      latency_ms: true
    },
    _count: {
      id: true
    }
  })

  const successStats = await prisma.ai_requests.groupBy({
    by: ['model', 'provider'],
    where: {
      success: true
    },
    _count: {
      id: true
    }
  })

  const successMap = new Map(
    successStats.map(stat => [
      `${stat.model}-${stat.provider}`,
      stat._count.id
    ])
  )

  return stats.map(stat => {
    const key = `${stat.model}-${stat.provider}`
    const totalRequests = stat._count.id
    const successfulRequests = successMap.get(key) || 0
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
    const averageCostPerRequest = totalRequests > 0 ? (stat._sum.total_tokens || 0) * 0.0006 / 1000 / totalRequests : 0

    return {
      model: stat.model,
      provider: stat.provider,
      totalRequests,
      totalTokens: stat._sum.total_tokens || 0,
      averageResponseTime: totalRequests > 0 ? (stat._sum.latency_ms || 0) / totalRequests : 0,
      successRate,
      averageCostPerRequest
    }
  })
}
