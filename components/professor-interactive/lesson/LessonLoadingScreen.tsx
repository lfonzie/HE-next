"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, BookOpen, Target } from 'lucide-react';

interface LessonLoadingScreenProps {
  progress: number;
  message: string;
  isLoading: boolean;
  elapsedTime?: number;
  formattedTime?: string;
}

export default React.memo(function LessonLoadingScreen({
  progress,
  message,
  isLoading,
  elapsedTime = 0,
  formattedTime = '0s'
}: LessonLoadingScreenProps) {
  if (!isLoading) return null;

  const getLoadingIcon = () => {
    if (progress < 30) return <Brain className="h-8 w-8 text-blue-600 animate-pulse" />;
    if (progress < 60) return <BookOpen className="h-8 w-8 text-green-600 animate-pulse" />;
    return <Target className="h-8 w-8 text-purple-600 animate-pulse" />;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          Gerando Aula Interativa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-8">
          {getLoadingIcon()}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            Isso pode levar alguns segundos...
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-mono font-medium">{formattedTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
