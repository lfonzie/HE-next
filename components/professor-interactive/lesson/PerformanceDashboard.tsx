"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  Brain, 
  Award,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PerformanceMetrics {
  averageResponseTime: number;
  accuracyRate: number;
  engagementScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  achievements: string[];
  slideProgress: Record<number, boolean>;
  sessionId: string;
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

// Componente de métrica individual
const MetricCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  subtitle,
  trend 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  const trendIcon = {
    up: <TrendingUp className="h-3 w-3 text-green-500" />,
    down: <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />,
    stable: <Activity className="h-3 w-3 text-gray-500" />
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {trendIcon[trend]}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

// Componente de progresso de slides
const SlideProgress = React.memo(({ 
  slideProgress, 
  totalSlides = 8 
}: {
  slideProgress: Record<number, boolean>;
  totalSlides: number;
}) => {
  const completedSlides = Object.values(slideProgress).filter(Boolean).length;
  const progressPercentage = (completedSlides / totalSlides) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Progresso dos Slides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Slides completados</span>
            <span>{completedSlides}/{totalSlides}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: totalSlides }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                slideProgress[i] 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {slideProgress[i] ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

SlideProgress.displayName = 'SlideProgress';

// Componente de achievements
const AchievementsList = React.memo(({ achievements }: { achievements: string[] }) => {
  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            Complete mais questões para desbloquear conquistas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Award className="h-4 w-4" />
          Conquistas ({achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{achievement}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

AchievementsList.displayName = 'AchievementsList';

export default function PerformanceDashboard({
  metrics,
  isVisible,
  onToggle,
  className = ''
}: PerformanceDashboardProps) {
  const {
    averageResponseTime,
    accuracyRate,
    engagementScore,
    totalQuestions,
    correctAnswers,
    timeSpent,
    achievements,
    slideProgress,
    sessionId
  } = metrics;

  // Calcular métricas derivadas
  const derivedMetrics = useMemo(() => {
    const wrongAnswers = totalQuestions - correctAnswers;
    const questionsPerMinute = timeSpent > 0 ? (totalQuestions / (timeSpent / 60)) : 0;
    const efficiencyScore = accuracyRate * (1 - Math.min(averageResponseTime / 30, 1));
    
    return {
      wrongAnswers,
      questionsPerMinute: Math.round(questionsPerMinute * 10) / 10,
      efficiencyScore: Math.round(efficiencyScore)
    };
  }, [totalQuestions, correctAnswers, timeSpent, accuracyRate, averageResponseTime]);

  // Determinar tendências
  const trends = useMemo(() => {
    return {
      accuracy: accuracyRate >= 80 ? 'up' : accuracyRate >= 60 ? 'stable' : 'down',
      speed: averageResponseTime <= 15 ? 'up' : averageResponseTime <= 25 ? 'stable' : 'down',
      engagement: engagementScore >= 80 ? 'up' : engagementScore >= 60 ? 'stable' : 'down'
    };
  }, [accuracyRate, averageResponseTime, engagementScore]);

  if (!isVisible) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={onToggle}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <BarChart3 className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-80 max-h-96 overflow-y-auto ${className}`}>
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Performance
            </CardTitle>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
          <Badge variant="outline" className="w-fit text-xs">
            Sessão: {sessionId.slice(-8)}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Métricas principais */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="Precisão"
              value={`${Math.round(accuracyRate)}%`}
              icon={Target}
              color="green"
              trend={trends.accuracy as "stable" | "up" | "down"}
            />
            <MetricCard
              title="Velocidade"
              value={`${Math.round(averageResponseTime)}s`}
              icon={Clock}
              color="blue"
              trend={trends.speed as "stable" | "up" | "down"}
            />
            <MetricCard
              title="Engajamento"
              value={`${Math.round(engagementScore)}%`}
              icon={Brain}
              color="purple"
              trend={trends.engagement as "stable" | "up" | "down"}
            />
            <MetricCard
              title="Eficiência"
              value={`${derivedMetrics.efficiencyScore}%`}
              icon={Zap}
              color="yellow"
            />
          </div>

          {/* Estatísticas detalhadas */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Questões respondidas:</span>
              <span className="font-medium">{totalQuestions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Acertos:</span>
              <span className="font-medium text-green-600">{correctAnswers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Erros:</span>
              <span className="font-medium text-red-600">{derivedMetrics.wrongAnswers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Questões/min:</span>
              <span className="font-medium">{derivedMetrics.questionsPerMinute}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tempo total:</span>
              <span className="font-medium">{Math.round(timeSpent / 60)}m {timeSpent % 60}s</span>
            </div>
          </div>

          {/* Progresso dos slides */}
          <SlideProgress 
            slideProgress={slideProgress} 
            totalSlides={8} 
          />

          {/* Conquistas */}
          <AchievementsList achievements={achievements} />
        </CardContent>
      </Card>
    </div>
  );
}
