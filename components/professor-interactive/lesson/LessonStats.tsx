"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Target, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Brain,
  TrendingUp
} from 'lucide-react';

interface LessonStatsProps {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  score: number;
  achievements: string[];
  showStats: boolean;
}

export default React.memo(function LessonStats({
  totalQuestions,
  correctAnswers,
  timeSpent,
  score,
  achievements,
  showStats
}: LessonStatsProps) {
  const stats = useMemo(() => {
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const timePerQuestion = totalQuestions > 0 ? timeSpent / totalQuestions : 0;
    
    return {
      accuracy: Math.round(accuracy),
      timePerQuestion: Math.round(timePerQuestion),
      performance: accuracy >= 80 ? 'Excelente' : accuracy >= 60 ? 'Bom' : 'Precisa melhorar'
    };
  }, [totalQuestions, correctAnswers, timeSpent]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showStats) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          Estatísticas da Aula
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-gray-600">Corretas</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
            <div className="text-sm text-gray-600">Incorretas</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.accuracy}%</div>
            <div className="text-sm text-gray-600">Precisão</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{formatTime(timeSpent)}</div>
            <div className="text-sm text-gray-600">Tempo Total</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Performance:</span>
            <Badge 
              variant={stats.accuracy >= 80 ? "default" : stats.accuracy >= 60 ? "secondary" : "destructive"}
            >
              {stats.performance}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tempo por pergunta:</span>
            <span className="text-sm text-gray-600">{stats.timePerQuestion}s</span>
          </div>
          
          {achievements.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">Conquistas:</span>
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
