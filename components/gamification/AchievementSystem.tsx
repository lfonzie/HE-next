'use client';

import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Star, Target, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { useAchievements, useAchievementList, useAchievementLoading, useAchievementError } from '@/contexts/AchievementContext';
import { Achievement } from '@/types/achievements';

interface AchievementSystemProps {
  userId: string;
  showRefreshButton?: boolean;
  compact?: boolean;
}

export function AchievementSystem({ userId, showRefreshButton = true, compact = false }: AchievementSystemProps) {
  const { refreshData, clearError } = useAchievements();
  const achievements = useAchievementList();
  const loading = useAchievementLoading();
  const error = useAchievementError();

  useEffect(() => {
    if (userId) {
      refreshData(userId);
    }
  }, [userId, refreshData]);

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'engagement': return <Zap className="w-4 h-4" />;
      case 'exploration': return <Target className="w-4 h-4" />;
      case 'consistency': return <Star className="w-4 h-4" />;
      case 'challenges': return <Trophy className="w-4 h-4" />;
      case 'mastery': return <Trophy className="w-4 h-4" />;
      case 'collaboration': return <Star className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const handleRefresh = () => {
    refreshData(userId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Achievements
            {showRefreshButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="ml-auto"
                aria-label="Refresh achievements"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Achievements
            {showRefreshButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="ml-auto"
                aria-label="Refresh achievements"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="ml-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
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
          {showRefreshButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="ml-auto"
              aria-label="Refresh achievements"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unlockedAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-800 mb-2">✅ Unlocked</h4>
            <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {unlockedAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                  role="article"
                  aria-label={`Achievement unlocked: ${achievement.title}`}
                >
                  <span className="text-lg" aria-hidden="true">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-green-800">{achievement.title}</div>
                    <div className="text-sm text-green-600">{achievement.description}</div>
                    {achievement.points > 0 && (
                      <div className="text-xs text-green-700 font-medium">
                        +{achievement.points} pontos
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRarityColor(achievement.rarity)}`}
                      aria-label={`${achievement.rarity} rarity`}
                    >
                      {getCategoryIcon(achievement.category)}
                    </Badge>
                    <span className="text-xs text-gray-500 capitalize">
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {lockedAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-600 mb-2">🔒 In Progress</h4>
            <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {lockedAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
                  role="article"
                  aria-label={`Achievement in progress: ${achievement.title}`}
                >
                  <span className="text-lg grayscale" aria-hidden="true">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-600">{achievement.title}</div>
                    <div className="text-sm text-gray-500">{achievement.description}</div>
                    <div className="mt-1">
                      <Progress 
                        value={(achievement.progress / achievement.threshold) * 100}
                        className="h-1"
                        aria-label={`Progress: ${achievement.progress} out of ${achievement.threshold}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {achievement.progress}/{achievement.threshold}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRarityColor(achievement.rarity)}`}
                      aria-label={`${achievement.rarity} rarity`}
                    >
                      {getCategoryIcon(achievement.category)}
                    </Badge>
                    <span className="text-xs text-gray-500 capitalize">
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {achievements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p>No achievements available yet.</p>
            <p className="text-sm">Continue using the platform to unlock achievements!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
