import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const [
      totalSchools,
      totalUsers,
      totalConversations,
      totalModels,
      totalPrompts,
      totalLessons,
      totalEnemQuestions,
      totalEnemSessions,
    ] = await Promise.all([
      prisma.schools.count(),
      prisma.user.count(),
      prisma.conversations.count(),
      prisma.models.count(),
      prisma.system_messages.count(),
      prisma.lessons.count(),
      prisma.enemQuestion.count().catch(() => 0),
      prisma.enem_session.count().catch(() => 0),
    ]);

    const stats = {
      totalSchools,
      totalUsers,
      totalConversations,
      totalModels,
      totalPrompts,
      totalLessons,
      totalEnemQuestions,
      totalEnemSessions,
      totalTokensUsed: 0,
      avgResponseTime: 0,
      openaiUsage: {
        totalTokens: 0,
        totalRequests: 0,
        estimatedCostUSD: 0,
        estimatedCostBRL: 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error in admin stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
