"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Download, 
  Share2, 
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { EnemScore } from '@/types/enem';
import { useToast } from '@/hooks/use-toast';

interface EnemResultsProps {
  score: EnemScore;
  sessionId: string;
  onRetake: () => void;
  onRefocus: (topics: string[]) => void;
}

export function EnemResults({ score, sessionId, onRetake, onRefocus }: EnemResultsProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'PDF' | 'CSV' | 'JSON') => {
    setExporting(true);
    try {
      const response = await fetch('/api/enem/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          format,
          options: {
            includeAnswers: true,
            includeExplanations: true,
            includeStatistics: true,
            includeSimilarQuestions: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enem-session-${sessionId}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sucesso",
        description: `Relatório ${format} baixado com sucesso!`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Resultado do Simulado ENEM',
          text: `Concluí um simulado ENEM com pontuação total de ${score.total_score.toFixed(1)}!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Concluí um simulado ENEM com pontuação total de ${score.total_score.toFixed(1)}! ` +
        `Estimativa TRI: ${score.tri_estimated.score.toFixed(0)} ` +
        `(${score.tri_estimated.confidence_interval.lower.toFixed(0)} - ${score.tri_estimated.confidence_interval.upper.toFixed(0)})`
      );
      toast({
        title: "Copiado",
        description: "Resultado copiado para a área de transferência!",
      });
    }
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 60) return { level: 'Bom', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 40) return { level: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Precisa Melhorar', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getAreaName = (area: string) => {
    const names: Record<string, string> = {
      'CN': 'Ciências da Natureza',
      'CH': 'Ciências Humanas',
      'LC': 'Linguagens e Códigos',
      'MT': 'Matemática'
    };
    return names[area] || area;
  };

  const weakTopics = Object.entries(score.stats.accuracy_by_topic)
    .filter(([_, accuracy]) => accuracy < 0.5)
    .map(([topic, _]) => topic);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-blue-900">
              Simulado Concluído!
            </CardTitle>
            <p className="text-blue-700 mt-2">
              Aqui estão seus resultados detalhados
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Pontuação Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {score.total_score.toFixed(1)}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                Pontuação Total
              </div>
            </div>

            {/* TRI Estimation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Estimativa TRI
              </h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {score.tri_estimated.score.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Intervalo: {score.tri_estimated.confidence_interval.lower.toFixed(0)} - {score.tri_estimated.confidence_interval.upper.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 italic">
                  {score.tri_estimated.disclaimer}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor(score.stats.total_time_spent / 60)}
                </div>
                <div className="text-sm text-gray-600">Minutos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {score.stats.average_time_per_question.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Seg/Questão</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handleExport('PDF')} 
              className="w-full"
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button 
              onClick={() => handleExport('CSV')} 
              variant="outline" 
              className="w-full"
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              onClick={handleShare} 
              variant="outline" 
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button 
              onClick={onRetake} 
              variant="outline" 
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refazer Simulado
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Area Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Desempenho por Área
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(score.area_scores).map(([area, areaScore]) => {
              const performance = getPerformanceLevel(areaScore.percentage);
              return (
                <div key={area} className="text-center">
                  <div className={`p-4 rounded-lg ${performance.bg}`}>
                    <div className="text-lg font-semibold mb-1">
                      {getAreaName(area)}
                    </div>
                    <div className={`text-2xl font-bold ${performance.color} mb-2`}>
                      {areaScore.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {areaScore.correct}/{areaScore.total} corretas
                    </div>
                    <Progress value={areaScore.percentage} className="h-2" />
                    <Badge variant="secondary" className="mt-2">
                      {performance.level}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Topic Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Análise por Tópico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(score.stats.accuracy_by_topic).map(([topic, accuracy]) => (
              <div key={topic} className="flex items-center justify-between">
                <span className="font-medium">{topic}</span>
                <div className="flex items-center gap-3">
                  <Progress value={accuracy * 100} className="w-32 h-2" />
                  <span className="text-sm font-medium w-12 text-right">
                    {(accuracy * 100).toFixed(1)}%
                  </span>
                  {accuracy >= 0.5 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {weakTopics.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Áreas para Revisão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-orange-800">
                Identificamos que você pode melhorar nos seguintes tópicos:
              </p>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map(topic => (
                  <Badge key={topic} variant="outline" className="text-orange-800 border-orange-300">
                    {topic}
                  </Badge>
                ))}
              </div>
              <Button 
                onClick={() => onRefocus(weakTopics)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Focar Nestes Tópicos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Dificuldade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(score.stats.difficulty_breakdown).map(([difficulty, stats]) => (
              <div key={difficulty} className="text-center">
                <div className="text-lg font-semibold capitalize mb-2">{difficulty}</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {stats.correct}/{stats.total}
                </div>
                <div className="text-sm text-gray-600">
                  {stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0}% de acerto
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}