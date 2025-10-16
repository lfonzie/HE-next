export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'engagement' | 'exploration' | 'consistency' | 'challenges' | 'mastery' | 'collaboration';
  threshold: number;
  unlocked: boolean;
  progress: number;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  prerequisites?: string[];
  unlockedAt?: string;
  metadata?: Record<string, any>;
}

export interface AchievementProgress {
  achievementId: string;
  userId: string;
  progress: number;
  lastUpdated: string;
  milestones: Array<{
    milestone: number;
    achievedAt: string;
  }>;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  achievements: Achievement[];
}

export interface UserAchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  categoryStats: Record<string, {
    total: number;
    unlocked: number;
    points: number;
  }>;
  recentUnlocks: Achievement[];
  nextMilestones: Array<{
    achievement: Achievement;
    progressToNext: number;
  }>;
}
