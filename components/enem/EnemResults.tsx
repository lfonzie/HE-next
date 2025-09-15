'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2,
  RotateCcw
} from 'lucide-react';
import { SimulationStats } from '@/lib/stores/enem-simulation-store';
import { cn } from '@/lib/utils';

interface EnemResultsProps {
  stats: SimulationStats;
  totalQuestions: number;
  timeSpent: number;
  onRestart: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function EnemResults({
  stats,
  totalQuestions,
  timeSpent,
  onRestart,
  onDownload,
  onShare
}: EnemResultsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min ${secs}s`;
    }
    return `${minutes}min ${secs}s`;
  };

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 80) return { level: 'Excelente', color: 'text-green-600', icon: Trophy };
    if (accuracy >= 70) return { level: 'Bom', color: 'text-blue-600', icon: Target };
    if (accuracy >= 60) return { level: 'Regular', color: 'text-yellow-600', icon: AlertCircle };
    return { level: 'Precisa Melhorar', color: 'text-red-600', icon: TrendingDown };
  };

  const performance = getPerformanceLevel(stats.accuracy);
  const PerformanceIcon = performance.icon;

  const getDifficultyStats = (difficulty: 'easy' | 'medium' | 'hard') => {
    const data = stats.difficultyBreakdown[difficulty];
    const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    return { ...data, accuracy };
  };

  const easyStats = getDifficultyStats('easy');
  const mediumStats = getDifficultyStats('medium');
  const hardStats = getDifficultyStats('hard');

  const topSkills = Object.entries(stats.skillBreakdown)
    .map(([skill, data]) => ({
      skill,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      total: data.total
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  const bottomSkills = Object.entries(stats.skillBreakdown)
    .map(([skill, data]) => ({
      skill,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      total: data.total
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Resultado do Simulado</h1>
        <p className="text-muted-foreground">
          Análise detalhada do seu desempenho
        </p>
      </div>

      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PerformanceIcon className={cn("w-6 h-6", performance.color)} />
            Desempenho Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {stats.accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Precisão</div>
              <Badge className={cn("mt-1", performance.color)}>
                {performance.level}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Corretas</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {stats.incorrectAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Incorretas</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {stats.skippedAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Puladas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Análise de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-muted-foreground">Tempo Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(stats.averageTimePerQuestion)}s
              </div>
              <div className="text-sm text-muted-foreground">Tempo por Questão</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round((stats.correctAnswers / timeSpent) * 60)}/min
              </div>
              <div className="text-sm text-muted-foreground">Questões Corretas/min</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Desempenho por Dificuldade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Easy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Fácil
                  </Badge>
                  <span className="text-sm">
                    {easyStats.correct}/{easyStats.total} corretas
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {easyStats.accuracy.toFixed(1)}%
                </span>
              </div>
              <Progress value={easyStats.accuracy} className="h-2" />
            </div>

            {/* Medium */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Médio
                  </Badge>
                  <span className="text-sm">
                    {mediumStats.correct}/{mediumStats.total} corretas
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {mediumStats.accuracy.toFixed(1)}%
                </span>
              </div>
              <Progress value={mediumStats.accuracy} className="h-2" />
            </div>

            {/* Hard */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    Difícil
                  </Badge>
                  <span className="text-sm">
                    {hardStats.correct}/{hardStats.total} corretas
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {hardStats.accuracy.toFixed(1)}%
                </span>
              </div>
              <Progress value={hardStats.accuracy} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Pontos Fortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSkills.map(({ skill, accuracy, total }) => (
                <div key={skill} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{skill}</div>
                    <div className="text-xs text-muted-foreground">
                      {total} questões
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">
                      {accuracy.toFixed(1)}%
                    </div>
                    <Progress value={accuracy} className="w-16 h-1 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Áreas para Melhorar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomSkills.map(({ skill, accuracy, total }) => (
                <div key={skill} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{skill}</div>
                    <div className="text-xs text-muted-foreground">
                      {total} questões
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">
                      {accuracy.toFixed(1)}%
                    </div>
                    <Progress value={accuracy} className="w-16 h-1 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Estudo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bottomSkills.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-1">
                  Foque nestas áreas:
                </h4>
                <p className="text-red-700 text-sm">
                  {bottomSkills.map(skill => skill.skill).join(', ')}
                </p>
              </div>
            )}
            
            {stats.accuracy < 70 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-1">
                  Dica de Estudo:
                </h4>
                <p className="text-yellow-700 text-sm">
                  Pratique mais questões de nível médio antes de avançar para as difíceis.
                </p>
              </div>
            )}
            
            {stats.averageTimePerQuestion > 120 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-1">
                  Gestão de Tempo:
                </h4>
                <p className="text-blue-700 text-sm">
                  Você está gastando muito tempo por questão. Pratique para aumentar a velocidade.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRestart} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Fazer Novo Simulado
            </Button>
            
            {onDownload && (
              <Button variant="outline" onClick={onDownload} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixar Resultado
              </Button>
            )}
            
            {onShare && (
              <Button variant="outline" onClick={onShare} className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}