"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Target, Trophy } from 'lucide-react';

interface LessonHeaderProps {
  title: string;
  subject: string;
  totalSteps: number;
  currentStep: number;
  timeSpent: number;
  score: number;
  achievements: string[];
}

export default React.memo(function LessonHeader({
  title,
  subject,
  totalSteps,
  currentStep,
  timeSpent,
  score,
  achievements
}: LessonHeaderProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{subject}</Badge>
          <Badge variant="secondary">
            Passo {currentStep + 1} de {totalSteps}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Tempo: {formatTime(timeSpent)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Progresso: {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Pontuação: {score}
            </span>
          </div>
          
          {achievements.length > 0 && (
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">
                Conquistas: {achievements.length}
              </span>
            </div>
          )}
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
