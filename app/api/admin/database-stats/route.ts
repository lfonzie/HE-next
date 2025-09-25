import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

    // Get basic statistics with error handling
    const stats = {
      timeRange,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      timestamp: now.toISOString(),
    };

    // Table counts with error handling
    try {
      const tableCounts = await Promise.allSettled([
        prisma.user.count().catch(() => 0),
        prisma.schools.count().catch(() => 0),
        prisma.conversations.count().catch(() => 0),
        prisma.analytics.count().catch(() => 0),
        prisma.system_messages.count().catch(() => 0),
        prisma.school_prompts.count().catch(() => 0),
        prisma.enemQuestion.count().catch(() => 0),
        prisma.enem_session.count().catch(() => 0),
        prisma.models.count().catch(() => 0),
        prisma.lessons.count().catch(() => 0),
        prisma.message_votes.count().catch(() => 0)
      ]);

    const [
        users, schools, conversations, analytics, systemMessages, 
        schoolPrompts, enemQuestions, enemSessions,
        models, lessons, messageVotes
      ] = tableCounts.map(result => 
        result.status === 'fulfilled' ? result.value : 0
      );

      stats.tableCounts = {
        users, schools, conversations, analytics, systemMessages,
        schoolPrompts, enemQuestions, enemSessions,
        models, lessons, messageVotes
      };
    } catch (error) {
      console.error('Error fetching table counts:', error);
      stats.tableCounts = {
        users: 0, schools: 0, conversations: 0, analytics: 0, systemMessages: 0,
        schoolPrompts: 0, enemQuestions: 0, enemSessions: 0,
        models: 0, lessons: 0, messageVotes: 0
      };
    }

    // User statistics with error handling
    try {
      const userStats = await Promise.allSettled([
        prisma.user.count({ where: { role: 'STUDENT' } }).catch(() => 0),
        prisma.user.count({ where: { role: 'TEACHER' } }).catch(() => 0),
        prisma.user.count({ where: { role: 'ADMIN' } }).catch(() => 0),
        prisma.user.count({ where: { created_at: { gte: startDate } } }).catch(() => 0)
      ]);

      const [students, teachers, admins, newUsers] = userStats.map(result => 
        result.status === 'fulfilled' ? result.value : 0
      );

      stats.userStats = {
        students, teachers, admins, newUsers,
        roleBreakdown: []
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      stats.userStats = {
        students: 0, teachers: 0, admins: 0, newUsers: 0,
        roleBreakdown: []
      };
    }

    // Conversation statistics with error handling
    try {
      const conversationStats = await Promise.allSettled([
        prisma.conversations.count({ where: { created_at: { gte: startDate } } }).catch(() => 0),
        prisma.conversations.count().catch(() => 0),
        prisma.conversations.groupBy({
          by: ['module'],
          _count: {
            module: true
          },
          orderBy: {
            _count: {
              module: 'desc'
            }
          }
        }).catch(() => [])
      ]);

      const [recentConversations, totalConversations, byModule] = conversationStats.map(result => 
        result.status === 'fulfilled' ? result.value : (result.status === 'rejected' ? [] : 0)
      );

      stats.conversationStats = {
        recentConversations,
        totalConversations,
        moduleBreakdown: [],
        byModule: Array.isArray(byModule) ? byModule : []
      };
    } catch (error) {
      console.error('Error fetching conversation stats:', error);
      stats.conversationStats = {
        recentConversations: 0,
        totalConversations: 0,
        moduleBreakdown: [],
        byModule: []
      };
    }

    // Analytics statistics with error handling
    try {
      const analyticsStats = await Promise.allSettled([
        prisma.analytics.count({ where: { created_at: { gte: startDate } } }).catch(() => 0),
        prisma.analytics.count().catch(() => 0)
      ]);

      const [recentAnalytics, totalAnalytics] = analyticsStats.map(result => 
        result.status === 'fulfilled' ? result.value : 0
      );

      stats.analyticsStats = {
        recentAnalytics,
        totalAnalytics
      };
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      stats.analyticsStats = {
        recentAnalytics: 0,
        totalAnalytics: 0
      };
    }

    // School statistics with error handling
    try {
      const schoolStats = await Promise.allSettled([
        prisma.schools.count().catch(() => 0),
        prisma.schools.count({ where: { created_at: { gte: startDate } } }).catch(() => 0)
      ]);

      const [totalSchools, newSchools] = schoolStats.map(result => 
        result.status === 'fulfilled' ? result.value : 0
      );

      stats.schoolStats = {
        totalSchools,
        newSchools
      };
    } catch (error) {
      console.error('Error fetching school stats:', error);
      stats.schoolStats = {
        totalSchools: 0,
        newSchools: 0
      };
    }

    // System prompts statistics with error handling
    try {
      const promptStats = await Promise.allSettled([
        prisma.system_messages.count().catch(() => 0),
        prisma.school_prompts.count().catch(() => 0)
      ]);

      const [totalSystemPrompts, totalSchoolPrompts] = promptStats.map(result => 
        result.status === 'fulfilled' ? result.value : 0
      );

      stats.promptStats = {
        totalSystemPrompts,
        totalSchoolPrompts
      };
    } catch (error) {
      console.error('Error fetching prompt stats:', error);
      stats.promptStats = {
        totalSystemPrompts: 0,
        totalSchoolPrompts: 0
      };
    }

    // ENEM statistics with error handling
    try {
      const enemStats = await Promise.allSettled([
        prisma.enemQuestion.count().catch(() => 0),
        prisma.enem_session.count().catch(() => 0),
        prisma.enemQuestion.count({ where: { created_at: { gte: startDate } } }).catch(() => 0)
      ]);

      const [totalEnemQuestions, totalEnemSessions, newEnemQuestions] = enemStats.map(result => 
        result.status === 'fulfilled' ? result.value : 0
      );

      stats.enemStats = {
        totalEnemQuestions,
        totalEnemSessions,
        newEnemQuestions,
        enemQuestionsByYear: [],
        enemQuestionsByDiscipline: []
      };
    } catch (error) {
      console.error('Error fetching ENEM stats:', error);
      stats.enemStats = {
        totalEnemQuestions: 0,
        totalEnemSessions: 0,
        newEnemQuestions: 0,
        enemQuestionsByYear: [],
        enemQuestionsByDiscipline: []
      };
    }

    // Database performance metrics
    stats.dbPerformance = {
      connectionCount: 0,
      queryTime: 0,
      cacheHitRate: 0
    };

    // Recent activity
    stats.recentActivity = [];

    // Create summary object for frontend compatibility
    const totalRecords = Object.values(stats.tableCounts || {}).reduce((sum: number, count: number) => sum + count, 0);
    const totalUsers = stats.tableCounts?.users || 0;
    const totalConversations = stats.tableCounts?.conversations || 0;
    const totalTokensUsed = 0; // This would need to be calculated from actual usage
    const avgTokensPerConversation = totalConversations > 0 ? Math.round(totalTokensUsed / totalConversations) : 0;

    stats.summary = {
      totalTables: Object.keys(stats.tableCounts || {}).length,
      totalRecords,
      totalUsers,
      totalConversations,
      totalTokensUsed,
      avgTokensPerConversation,
      userGrowthRate: stats.userStats?.newUsers ? `+${stats.userStats.newUsers}` : '0',
      conversationGrowthRate: stats.conversationStats?.recentConversations ? `+${stats.conversationStats.recentConversations}` : '0'
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Database stats API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch database statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}