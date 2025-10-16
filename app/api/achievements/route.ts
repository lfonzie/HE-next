import { NextRequest, NextResponse } from 'next/server';
import { Achievement } from '@/types/achievements';

// Mock data for development - replace with actual database queries
const mockAchievements: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'Primeira Aula',
    description: 'Complete sua primeira aula interativa',
    icon: '🎓',
    category: 'engagement',
    threshold: 100,
    unlocked: false,
    progress: 0,
    points: 10,
    rarity: 'common',
  },
  {
    id: 'quiz-master',
    title: 'Mestre dos Quizzes',
    description: 'Acerte 10 questões consecutivas',
    icon: '🧠',
    category: 'mastery',
    threshold: 10,
    unlocked: false,
    progress: 0,
    points: 25,
    rarity: 'rare',
  },
  {
    id: 'streak-week',
    title: 'Semana de Dedicação',
    description: 'Use a plataforma por 7 dias consecutivos',
    icon: '🔥',
    category: 'consistency',
    threshold: 7,
    unlocked: false,
    progress: 0,
    points: 50,
    rarity: 'epic',
  },
  {
    id: 'trail-explorer',
    title: 'Explorador de Trilhas',
    description: 'Complete 5 trilhas de aprendizado',
    icon: '🗺️',
    category: 'exploration',
    threshold: 5,
    unlocked: false,
    progress: 0,
    points: 100,
    rarity: 'legendary',
  },
  {
    id: 'helpful-peer',
    title: 'Colega Prestativo',
    description: 'Ajude 5 colegas em fóruns de discussão',
    icon: '🤝',
    category: 'collaboration',
    threshold: 5,
    unlocked: false,
    progress: 0,
    points: 75,
    rarity: 'rare',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Filter achievements by category if specified
    let filteredAchievements = mockAchievements;
    if (category) {
      filteredAchievements = mockAchievements.filter(
        achievement => achievement.category === category
      );
    }

    // TODO: Replace with actual database query
    // const achievements = await db.achievement.findMany({
    //   where: { userId, ...(category && { category }) },
    // });

    return NextResponse.json({
      achievements: filteredAchievements,
      total: filteredAchievements.length,
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, achievementId, progress } = body;

    if (!userId || !achievementId) {
      return NextResponse.json(
        { error: 'User ID and Achievement ID are required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database update
    // await db.achievementProgress.upsert({
    //   where: { userId_achievementId: { userId, achievementId } },
    //   update: { progress, lastUpdated: new Date() },
    //   create: { userId, achievementId, progress, lastUpdated: new Date() },
    // });

    return NextResponse.json({
      success: true,
      message: 'Achievement progress updated',
    });

  } catch (error) {
    console.error('Error updating achievement progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}