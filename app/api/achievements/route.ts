import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userAchievements = await prisma.user_achievements.findMany({
      where: { user_id: userId },
    });

    const allAchievements = await prisma.achievements.findMany({
      where: { is_active: true },
    });

    const achievementsWithProgress = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
      let progress = 0;
      const threshold = achievement.threshold;

      switch (achievement.id) {
        case 'ti_expert':
          const tiSessions = userAchievements.filter(ua => 
            ua.metadata && 
            typeof ua.metadata === 'object' && 
            'type' in ua.metadata && 
            ua.metadata.type === 'ti_session'
          ).length;
          progress = Math.min(tiSessions, threshold);
          break;
        default:
          progress = userAchievement ? threshold : 0;
      }

      return {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        threshold,
        unlocked: !!userAchievement,
        progress,
      };
    });

    return NextResponse.json({
      success: true,
      achievements: achievementsWithProgress,
      unlockedCount: achievementsWithProgress.filter(a => a.unlocked).length,
      totalCount: achievementsWithProgress.length,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, achievementId, metadata } = await request.json();

    if (!userId || !achievementId) {
      return NextResponse.json({ error: 'User ID and Achievement ID are required' }, { status: 400 });
    }

    const existingAchievement = await prisma.user_achievements.findFirst({
      where: { user_id: userId, achievement_id: achievementId },
    });

    if (existingAchievement) {
      return NextResponse.json({
        success: true,
        message: 'Achievement already unlocked',
        achievement: existingAchievement,
      });
    }

    const newAchievement = await prisma.user_achievements.create({
      data: { user_id: userId, achievement_id: achievementId, metadata: metadata || {} },
    });

    return NextResponse.json({
      success: true,
      message: 'Achievement unlocked!',
      achievement: newAchievement,
    });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return NextResponse.json({ error: 'Failed to unlock achievement' }, { status: 500 });
  }
}

