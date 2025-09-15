'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Target, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  unlocked: boolean;
  progress: number;
}

interface AchievementSystemProps {
  userId: string;
}

export function AchievementSystem({ userId }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(`/api/achievements?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements || []);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [userId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <Zap className="w-4 h-4" />;
      case 'exploration': return <Target className="w-4 h-4" />;
      case 'consistency': return <Star className="w-4 h-4" />;
      case 'challenges': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Achievements ({unlockedAchievements.length}/{achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unlockedAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-800 mb-2">✅ Unlocked</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {unlockedAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                >
                  <span className="text-lg">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-green-800">{achievement.title}</div>
                    <div className="text-sm text-green-600">{achievement.description}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryIcon(achievement.category)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        {lockedAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-600 mb-2">🔒 In Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lockedAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
                >
                  <span className="text-lg grayscale">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-600">{achievement.title}</div>
                    <div className="text-sm text-gray-500">{achievement.description}</div>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.threshold) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {achievement.progress}/{achievement.threshold}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryIcon(achievement.category)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        {achievements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No achievements available yet.</p>
            <p className="text-sm">Continue using the platform to unlock achievements!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
