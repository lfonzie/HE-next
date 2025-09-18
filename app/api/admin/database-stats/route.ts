import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Skip authentication in development
    if (process.env.NODE_ENV === 'development') {
      // Development mode - skip auth check
    } else {
      // TODO: Add authentication check for production
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get comprehensive database statistics
    const [
      // Table counts
      tableCounts,
      // User statistics
      userStats,
      // Conversation statistics
      conversationStats,
      // Analytics statistics
      analyticsStats,
      // School statistics
      schoolStats,
      // System prompts statistics
      promptStats,
      // ENEM statistics
      enemStats,
      // Database performance metrics
      dbPerformance,
      // Recent activity
      recentActivity
    ] = await Promise.all([
      // Table counts
      Promise.all([
        prisma.user.count(),
        prisma.schools.count(),
        prisma.conversations.count(),
        prisma.analytics.count(),
        prisma.system_messages.count(),
        prisma.school_prompts.count(),
        prisma.enemQuestion.count(),
        prisma.enemSession.count(),
        prisma.enem_session.count(),
        prisma.models.count(),
        prisma.lessons.count(),
        prisma.message_votes.count()
      ]).then(([
        users, schools, conversations, analytics, systemMessages, 
        schoolPrompts, enemQuestions, enemSessions, enemSessionsAlt,
        models, lessons, messageVotes
      ]) => ({
        users, schools, conversations, analytics, systemMessages,
        schoolPrompts, enemQuestions, enemSessions, enemSessionsAlt,
        models, lessons, messageVotes
      })),

      // User statistics
      Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'TEACHER' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { created_at: { gte: startDate } } }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true }
        })
      ]).then(([students, teachers, admins, newUsers, roleBreakdown]) => ({
        students, teachers, admins, newUsers, roleBreakdown
      })),

      // Conversation statistics
      Promise.all([
        prisma.conversations.count({ where: { created_at: { gte: startDate } } }),
        prisma.conversations.groupBy({
          by: ['module'],
          _count: { module: true },
          _sum: { token_count: true }
        }),
        prisma.conversations.groupBy({
          by: ['model'],
          _count: { model: true },
          _sum: { token_count: true }
        }),
        prisma.conversations.aggregate({
          _sum: { token_count: true },
          _avg: { token_count: true }
        })
      ]).then(([recentConversations, byModule, byModel, totals]) => ({
        recentConversations, byModule, byModel, totals
      })),

      // Analytics statistics
      Promise.all([
        prisma.analytics.count({ where: { date: { gte: startDate } } }),
        prisma.analytics.groupBy({
          by: ['module'],
          _count: { module: true },
          _sum: { tokens_used: true }
        }),
        prisma.analytics.aggregate({
          _sum: { tokens_used: true },
          _avg: { tokens_used: true }
        }),
        prisma.analytics.groupBy({
          by: ['date'],
          _count: { date: true },
          _sum: { tokens_used: true },
          orderBy: { date: 'desc' },
          take: 30
        })
      ]).then(([recentAnalytics, byModule, totals, dailyUsage]) => ({
        recentAnalytics, byModule, totals, dailyUsage
      })),

      // School statistics
      Promise.all([
        prisma.schools.count({ where: { created_at: { gte: startDate } } }),
        prisma.schools.groupBy({
          by: ['state'],
          _count: { state: true }
        }),
        prisma.schools.groupBy({
          by: ['plan'],
          _count: { plan: true }
        })
      ]).then(([newSchools, byState, byPlan]) => ({
        newSchools, byState, byPlan
      })),

      // System prompts statistics
      Promise.all([
        prisma.system_messages.count(),
        prisma.school_prompts.count(),
        prisma.system_messages.count({ where: { is_active: true } }),
        prisma.school_prompts.count({ where: { is_active: true } })
      ]).then(([systemMessages, schoolPrompts, activeSystemPrompts, activeSchoolPrompts]) => ({
        systemMessages, schoolPrompts, activeSystemPrompts, activeSchoolPrompts
      })),

      // ENEM statistics
      Promise.all([
        prisma.enemQuestion.count(),
        prisma.enemSession.count(),
        prisma.enem_session.count(),
        prisma.enemQuestion.groupBy({
          by: ['area'],
          _count: { area: true }
        }),
        prisma.enemQuestion.groupBy({
          by: ['disciplina'],
          _count: { disciplina: true }
        })
      ]).then(([questions, sessions, sessionsAlt, byArea, byDisciplina]) => ({
        questions, sessions, sessionsAlt, byArea, byDisciplina
      })),

      // Database performance metrics
      Promise.allSettled([
        prisma.$queryRaw`
          SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_tuples,
            n_dead_tup as dead_tuples,
            n_tup_hot_upd as hot_updates
          FROM pg_stat_user_tables 
          ORDER BY n_live_tup DESC
          LIMIT 20
        `,
        prisma.$queryRaw`
          SELECT 
            datname,
            numbackends,
            xact_commit,
            xact_rollback,
            blks_read,
            blks_hit,
            tup_returned,
            tup_fetched,
            tup_inserted,
            tup_updated,
            tup_deleted
          FROM pg_stat_database 
          WHERE datname = current_database()
        `
      ]).then(([tableStats, dbStats]) => ({
        tableStats: tableStats.status === 'fulfilled' ? 
          (tableStats.value as any[]).map((row: any) => ({
            ...row,
            inserts: Number(row.inserts),
            updates: Number(row.updates),
            deletes: Number(row.deletes),
            live_tuples: Number(row.live_tuples),
            dead_tuples: Number(row.dead_tuples),
            hot_updates: Number(row.hot_updates)
          })) : [],
        dbStats: dbStats.status === 'fulfilled' ? 
          (dbStats.value as any[]).map((row: any) => ({
            ...row,
            numbackends: Number(row.numbackends),
            xact_commit: Number(row.xact_commit),
            xact_rollback: Number(row.xact_rollback),
            blks_read: Number(row.blks_read),
            blks_hit: Number(row.blks_hit),
            tup_returned: Number(row.tup_returned),
            tup_fetched: Number(row.tup_fetched),
            tup_inserted: Number(row.tup_inserted),
            tup_updated: Number(row.tup_updated),
            tup_deleted: Number(row.tup_deleted)
          })) : []
      })),

      // Recent activity
      Promise.all([
        prisma.conversations.findMany({
          take: 10,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            module: true,
            model: true,
            token_count: true,
            created_at: true
          }
        }),
        prisma.analytics.findMany({
          take: 10,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            module: true,
            tokens_used: true,
            date: true
          }
        }),
        prisma.user.findMany({
          take: 10,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true
          }
        })
      ]).then(([recentConversations, recentAnalytics, recentUsers]) => ({
        recentConversations, recentAnalytics, recentUsers
      }))
    ]);

    // Calculate derived metrics
    const totalTokensUsed = conversationStats.totals._sum.token_count || 0;
    const avgTokensPerConversation = conversationStats.totals._avg.token_count || 0;
    const totalAnalyticsTokens = analyticsStats.totals._sum.tokens_used || 0;
    const avgAnalyticsTokens = analyticsStats.totals._avg.tokens_used || 0;

    // Calculate growth rates (simplified)
    const userGrowthRate = userStats.newUsers > 0 ? 
      ((userStats.newUsers / userStats.students) * 100).toFixed(1) : '0.0';
    
    const conversationGrowthRate = conversationStats.recentConversations > 0 ?
      ((conversationStats.recentConversations / tableCounts.conversations) * 100).toFixed(1) : '0.0';

    const response = {
      timestamp: new Date().toISOString(),
      timeRange,
      summary: {
        totalTables: 12,
        totalRecords: Object.values(tableCounts).reduce((sum, count) => sum + count, 0),
        totalUsers: tableCounts.users,
        totalConversations: tableCounts.conversations,
        totalTokensUsed: totalTokensUsed + totalAnalyticsTokens,
        avgTokensPerConversation: Math.round(avgTokensPerConversation),
        userGrowthRate: `${userGrowthRate}%`,
        conversationGrowthRate: `${conversationGrowthRate}%`
      },
      tableCounts,
      userStats: {
        ...userStats,
        totalUsers: tableCounts.users,
        newUsers: userStats.newUsers
      },
      conversationStats: {
        ...conversationStats,
        totalConversations: tableCounts.conversations,
        recentConversations: conversationStats.recentConversations
      },
      analyticsStats: {
        ...analyticsStats,
        totalAnalytics: tableCounts.analytics,
        recentAnalytics: analyticsStats.recentAnalytics
      },
      schoolStats: {
        ...schoolStats,
        totalSchools: tableCounts.schools,
        newSchools: schoolStats.newSchools
      },
      promptStats: {
        ...promptStats,
        totalPrompts: promptStats.systemMessages + promptStats.schoolPrompts,
        activePrompts: promptStats.activeSystemPrompts + promptStats.activeSchoolPrompts
      },
      enemStats: {
        ...enemStats,
        totalQuestions: enemStats.questions,
        totalSessions: enemStats.sessions + enemStats.sessionsAlt
      },
      dbPerformance,
      recentActivity,
      ...(includeDetails && {
        detailedMetrics: {
          topModulesByUsage: conversationStats.byModule?.sort((a, b) => b._count.module - a._count.module) || [],
          topModelsByUsage: conversationStats.byModel?.sort((a, b) => b._count.model - a._count.model) || [],
          dailyTokenUsage: analyticsStats.dailyUsage || [],
          schoolsByState: schoolStats.byState?.sort((a, b) => b._count.state - a._count.state) || [],
          enemQuestionsByArea: enemStats.byArea?.sort((a, b) => b._count.area - a._count.area) || [],
          enemQuestionsByDisciplina: enemStats.byDisciplina?.sort((a, b) => b._count.disciplina - a._count.disciplina) || []
        }
      })
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching database statistics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch database statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
