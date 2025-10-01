import { prisma } from '@/lib/db';

export async function getAdminStats() {
  try {
    const [
      totalSchools,
      totalUsers,
      totalConversations,
      totalModels,
      totalPrompts,
      totalLessons,
      totalEnemQuestions,
      totalEnemSessions,
      recentAnalytics,
      openaiUsage
    ] = await Promise.all([
      prisma.schools.count(),
      prisma.user.count(),
      prisma.conversations.count(),
      prisma.models.count(),
      prisma.system_messages.count(),
      prisma.lessons.count(),
      prisma.enemQuestion.count(),
      prisma.enem_session.count(),
      prisma.analytics.findMany({
        take: 100,
        orderBy: { date: 'desc' },
        include: {
          schools: true
        }
      }),
      getOpenAIUsage()
    ]);

    // Calculate total tokens used from analytics
    const totalTokensUsed = recentAnalytics.reduce((sum, analytics) => sum + analytics.tokens_used, 0);
    
    // Calculate average response time
    const avgResponseTime = recentAnalytics
      .filter(a => a.response_time)
      .reduce((sum, analytics) => sum + (analytics.response_time || 0), 0) / 
      recentAnalytics.filter(a => a.response_time).length || 0;

    return {
      totalSchools,
      totalUsers,
      totalConversations,
      totalModels,
      totalPrompts,
      totalLessons,
      totalEnemQuestions,
      totalEnemSessions,
      totalTokensUsed,
      avgResponseTime: Math.round(avgResponseTime),
      openaiUsage
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
}

export async function getSchoolsData() {
  try {
    const schools = await prisma.schools.findMany({
      include: {
        school_prompts: {
          select: {
            id: true,
            module: true,
            is_active: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get analytics data for each school separately
    const schoolsWithAnalytics = await Promise.all(
      schools.map(async (school) => {
        try {
          // Get analytics for this school
          const analytics = await prisma.analytics.findMany({
            where: { school_id: school.id },
            select: {
              tokens_used: true,
              response_time: true
            }
          });

          // Get user count for this school
          const userCount = await prisma.user.count({
            where: { school_id: school.id }
          });

          return {
            id: school.id,
            name: school.name,
            email: school.email,
            phone: school.phone,
            address: school.address,
            created_at: school.created_at,
            totalUsers: userCount,
            totalPrompts: school.school_prompts.length,
            activePrompts: school.school_prompts.filter(p => p.is_active).length,
            totalTokensUsed: analytics.reduce((sum, a) => sum + a.tokens_used, 0),
            avgResponseTime: analytics.length > 0 
              ? Math.round(analytics.reduce((sum, a) => sum + (a.response_time || 0), 0) / analytics.length)
              : 0
          };
        } catch (schoolError) {
          console.error(`Error processing school ${school.id}:`, schoolError);
          return {
            id: school.id,
            name: school.name,
            email: school.email,
            phone: school.phone,
            address: school.address,
            created_at: school.created_at,
            totalUsers: 0,
            totalPrompts: school.school_prompts.length,
            activePrompts: school.school_prompts.filter(p => p.is_active).length,
            totalTokensUsed: 0,
            avgResponseTime: 0
          };
        }
      })
    );

    return schoolsWithAnalytics;
  } catch (error) {
    console.error('Error fetching schools data:', error);
    throw error;
  }
}

export async function getUsersData() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get additional data for each user
    const usersWithData = await Promise.all(
      users.map(async (user) => {
        try {
          // Get school information
          const school = user.school_id ? await prisma.schools.findUnique({
            where: { id: user.school_id },
            select: { name: true }
          }) : null;

          // Get conversations count
          const conversations = await prisma.conversations.findMany({
            where: { user_id: user.id },
            select: {
              id: true,
              token_count: true,
              created_at: true
            }
          });

          // Get analytics data
          const analytics = await prisma.analytics.findMany({
            where: { user_id: user.id },
            select: {
              tokens_used: true,
              module: true,
              date: true
            }
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            school: school?.name || 'N/A',
            created_at: user.created_at,
            totalConversations: conversations.length,
            totalTokensUsed: analytics.reduce((sum, a) => sum + a.tokens_used, 0),
            lastActivity: analytics.length > 0 
              ? analytics.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date
              : user.created_at
          };
        } catch (userError) {
          console.error(`Error processing user ${user.id}:`, userError);
          // Return basic user data if there's an error with additional data
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            school: 'N/A',
            created_at: user.created_at,
            totalConversations: 0,
            totalTokensUsed: 0,
            lastActivity: user.created_at
          };
        }
      })
    );

    return usersWithData;
  } catch (error) {
    console.error('Error fetching users data:', error);
    throw error;
  }
}

export async function getConversationsData() {
  try {
    const conversations = await prisma.conversations.findMany({
      orderBy: {
        created_at: 'desc'
      },
      take: 1000 // Limit for performance
    });

    // Get user information for conversations
    const userIds = conversations.map(conv => conv.user_id).filter(Boolean);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        school_id: true
      }
    });

    // Get school information for users
    const schoolIds = users.map(user => user.school_id).filter(Boolean);
    const schools = await prisma.schools.findMany({
      where: {
        id: {
          in: schoolIds
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Get message votes for conversations
    const conversationIds = conversations.map(conv => conv.id);
    const messageVotes = await prisma.message_votes.findMany({
      where: {
        conversation_id: {
          in: conversationIds
        }
      }
    });

    const userMap = new Map(users.map(user => [user.id, user]));
    const schoolMap = new Map(schools.map(school => [school.id, school.name]));
    const votesMap = new Map();
    
    messageVotes.forEach(vote => {
      if (!votesMap.has(vote.conversation_id)) {
        votesMap.set(vote.conversation_id, []);
      }
      votesMap.get(vote.conversation_id).push(vote);
    });

    return conversations.map(conv => {
      const user = userMap.get(conv.user_id);
      const votes = votesMap.get(conv.id) || [];
      return {
        id: conv.id,
        userId: conv.user_id,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'Unknown',
        school: user?.school_id ? schoolMap.get(user.school_id) || 'N/A' : 'N/A',
        module: conv.module,
        subject: conv.subject,
        grade: conv.grade,
        model: conv.model,
        tokenCount: conv.token_count,
        messageCount: Array.isArray(conv.messages) ? conv.messages.length : 0,
        upvotes: votes.filter(v => v.is_upvoted).length,
        downvotes: votes.filter(v => !v.is_upvoted).length,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      };
    });
  } catch (error) {
    console.error('Error fetching conversations data:', error);
    throw error;
  }
}

export async function getModelsData() {
  try {
    const models = await prisma.models.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get usage statistics for each model
    const modelUsage = await Promise.all(
      models.map(async (model) => {
        const conversations = await prisma.conversations.count({
          where: { model: model.name }
        });
        
        const analytics = await prisma.analytics.findMany({
          where: { model: model.name },
          select: {
            tokens_used: true,
            response_time: true
          }
        });

        const totalTokens = analytics.reduce((sum, a) => sum + a.tokens_used, 0);
        const avgResponseTime = analytics.length > 0 
          ? Math.round(analytics.reduce((sum, a) => sum + (a.response_time || 0), 0) / analytics.length)
          : 0;

        return {
          id: model.id,
          name: model.name,
          available: model.available,
          isDefault: model.is_default,
          costPerInput: model.cost_per_input,
          costPerOutput: model.cost_per_output,
          totalConversations: conversations,
          totalTokensUsed: totalTokens,
          avgResponseTime,
          created_at: model.created_at
        };
      })
    );

    return modelUsage;
  } catch (error) {
    console.error('Error fetching models data:', error);
    throw error;
  }
}

export async function getPromptsData() {
  try {
    const [systemPrompts, schoolPrompts] = await Promise.all([
      prisma.system_messages.findMany({
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.school_prompts.findMany({
        include: {
          schools: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      })
    ]);

    const systemPromptsData = systemPrompts.map(prompt => ({
      id: prompt.id,
      module: prompt.module,
      text: prompt.system_prompt,
      description: prompt.description,
      isActive: prompt.is_active,
      temperature: prompt.temperature,
      maxTokens: prompt.max_tokens,
      tone: prompt.tone,
      type: 'system',
      school: null,
      created_at: prompt.created_at
    }));

    const schoolPromptsData = schoolPrompts.map(prompt => ({
      id: prompt.id,
      module: prompt.module,
      text: prompt.prompt,
      description: null,
      isActive: prompt.is_active,
      temperature: null,
      maxTokens: null,
      tone: null,
      type: 'school',
      school: prompt.schools?.name || 'Unknown',
      created_at: prompt.created_at
    }));

    return [...systemPromptsData, ...schoolPromptsData];
  } catch (error) {
    console.error('Error fetching prompts data:', error);
    throw error;
  }
}

export async function getSystemInfo() {
  try {
    const [
      dbStats,
      recentErrors,
      featureFlags,
      jobs
    ] = await Promise.allSettled([
      // Database statistics
      prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables 
        ORDER BY n_live_tup DESC
        LIMIT 10
      `,
      // Recent errors
      prisma.errors.findMany({
        take: 10,
        orderBy: {
          occurred_at: 'desc'
        }
      }),
      // Feature flags
      prisma.feature_flags.findMany(),
      // Recent jobs
      prisma.jobs.findMany({
        take: 10,
        orderBy: {
          queued_at: 'desc'
        }
      })
    ]);

    return {
      dbStats: dbStats.status === 'fulfilled' ? dbStats.value : [],
      recentErrors: recentErrors.status === 'fulfilled' ? recentErrors.value : [],
      featureFlags: featureFlags.status === 'fulfilled' ? featureFlags.value : [],
      jobs: jobs.status === 'fulfilled' ? jobs.value : [],
      environment: process.env.NODE_ENV,
      database: 'PostgreSQL',
      apiIntegration: 'OpenAI',
      adminTokenConfigured: !!process.env.ADMIN_TOKEN,
      deploymentDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching system info:', error);
    throw error;
  }
}

async function getOpenAIUsage() {
  try {
    // Get usage from our analytics table
    const usage = await prisma.analytics.aggregate({
      _sum: {
        tokens_used: true
      },
      _count: {
        id: true
      }
    });

    // Get cost data from cost_log table
    const costData = await prisma.cost_log.aggregate({
      _sum: {
        cost_usd: true,
        cost_brl: true
      }
    });

    return {
      totalTokens: usage._sum.tokens_used || 0,
      totalRequests: usage._count.id || 0,
      estimatedCostUSD: costData._sum.cost_usd || 0,
      estimatedCostBRL: costData._sum.cost_brl || 0
    };
  } catch (error) {
    console.error('Error fetching OpenAI usage:', error);
    return {
      totalTokens: 0,
      totalRequests: 0,
      estimatedCostUSD: 0,
      estimatedCostBRL: 0
    };
  }
}

