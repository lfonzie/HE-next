import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import {


  getUsageStats,
  getUserUsageStats,
  getSchoolUsageStats,
  getUsageTrends,
  getModelPerformanceStats
} from '@/lib/usage-analytics'
import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const userId = searchParams.get('userId')
    const schoolId = searchParams.get('schoolId')
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    switch (type) {
      case 'overview':
        const overviewStats = await getUsageStats(startDate, endDate)
        return NextResponse.json(overviewStats)

      case 'user':
        if (!userId) {
          return NextResponse.json({ error: 'userId is required for user stats' }, { status: 400 })
        }
        const userStats = await getUserUsageStats(userId, startDate, endDate)
        return NextResponse.json(userStats)

      case 'school':
        if (!schoolId) {
          return NextResponse.json({ error: 'schoolId is required for school stats' }, { status: 400 })
        }
        const schoolStats = await getSchoolUsageStats(schoolId, startDate, endDate)
        return NextResponse.json(schoolStats)

      case 'trends':
        const trends = await getUsageTrends(days, startDate)
        return NextResponse.json(trends)

      case 'model-performance':
        const modelStats = await getModelPerformanceStats()
        return NextResponse.json(modelStats)

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    const adminResponse = handleAdminRouteError(error)
    if (adminResponse) {
      return adminResponse
    }

    console.error('Usage stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const { type, filters } = body

    // Handle bulk requests for multiple statistics
    const results: Record<string, any> = {}

    if (type === 'bulk') {
      const requests = filters || []
      
      for (const req of requests) {
        const { type: reqType, ...reqFilters } = req
        
        switch (reqType) {
          case 'overview':
            results.overview = await getUsageStats(reqFilters.startDate, reqFilters.endDate)
            break
          case 'trends':
            results.trends = await getUsageTrends(reqFilters.days || 30, reqFilters.startDate)
            break
          case 'model-performance':
            results.modelPerformance = await getModelPerformanceStats()
            break
          case 'user':
            if (reqFilters.userId) {
              results.user = await getUserUsageStats(reqFilters.userId, reqFilters.startDate, reqFilters.endDate)
            }
            break
          case 'school':
            if (reqFilters.schoolId) {
              results.school = await getSchoolUsageStats(reqFilters.schoolId, reqFilters.startDate, reqFilters.endDate)
            }
            break
        }
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    const adminResponse = handleAdminRouteError(error)
    if (adminResponse) {
      return adminResponse
    }

    console.error('Usage stats bulk API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bulk usage statistics' },
      { status: 500 }
    )
  }
}
