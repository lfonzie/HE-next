import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Starting admin stats fetch...');
    
    // Simple stats without complex analytics
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
      prisma.enemQuestion.count(),
      prisma.enem_session.count(),
    ]);

    console.log('Basic stats fetched successfully');

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
        estimatedCostBRL: 0
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in admin stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}