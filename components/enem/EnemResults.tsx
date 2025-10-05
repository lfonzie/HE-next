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
  BarChart3,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { EnemScore, EnemItem, EnemResponse } from '@/types/enem';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { processMessageForDisplay, forceConvertMathToUnicode } from '@/utils/unicode';
import { normalizeFormulas } from '@/lib/utils/latex-normalization';
import { processTextWithImages } from '@/lib/utils/image-extraction';
import { ImageWithFallback } from './ImageWithFallback';
import remarkGfm from 'remark-gfm';

interface EnemResultsProps {
  score: EnemScore;
  sessionId: string;
  onRetake: () => void;
  onRefocus: (topics: string[]) => void;
  items?: EnemItem[];
  responses?: EnemResponse[];
}

export function EnemResults({ score, sessionId, onRetake, onRefocus, items = [], responses = [] }: EnemResultsProps) {
  const [exporting, setExporting] = useState(false);
  const [generatingExplanation, setGeneratingExplanation] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Função para obter o número da questão relativo à prova gerada
  const getQuestionNumber = (itemId: string, index: number): number => {
    return index + 1;
  };

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

  // Identificar questões erradas e não respondidas
  const wrongAnswers = items.filter(item => {
    const response = responses.find(r => r.item_id === item.item_id);
    return response && response.selected_answer !== item.correct_answer;
  });

  // Identificar questões não respondidas
  const unansweredQuestions = items.filter(item => {
    const response = responses.find(r => r.item_id === item.item_id);
    return !response || !response.selected_answer;
  });

  // Combinar questões erradas e não respondidas para revisão
  const questionsToReview = [...wrongAnswers, ...unansweredQuestions];

  // Função para gerar explicação
  const generateExplanation = async (itemId: string, questionNumber?: number) => {
    setGeneratingExplanation(itemId);
    try {
      // Encontrar a questão e resposta do usuário
      const item = items.find(i => i.item_id === itemId);
      const userResponse = responses.find(r => r.item_id === itemId);
      
      if (!item) {
        throw new Error('Questão não encontrada');
      }

      const response = await fetch('/api/enem/explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          session_id: sessionId,
          question_text: item.text,
          alternatives: item.alternatives,
          correct_answer: item.correct_answer,
          user_answer: userResponse?.selected_answer,
          area: item.area,
          question_number: questionNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar explicação');
      }

      const data = await response.json();
      setExplanations(prev => ({
        ...prev,
        [itemId]: data.explanation
      }));

      toast({
        title: "Sucesso",
        description: `Explicação gerada com sucesso! ${data.source === 'openai' ? '(IA)' : '(Fallback)'}`,
      });
    } catch (error) {
      console.error('Error generating explanation:', error);
      toast({
        title: "Erro",
        description: `Falha ao gerar explicação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setGeneratingExplanation(null);
    }
  };

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

      {/* Questions Review */}
      {questionsToReview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Questões para Revisar ({questionsToReview.length})
            </CardTitle>
            <p className="text-gray-600">
              Revise todas as questões que você errou ou não respondeu para melhorar seu desempenho
            </p>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>❌ Erradas: {wrongAnswers.length}</span>
              <span>⭕ Não respondidas: {unansweredQuestions.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {questionsToReview.map((item, index) => {
                const userResponse = responses.find(r => r.item_id === item.item_id);
                const hasExplanation = explanations[item.item_id];
                const isGenerating = generatingExplanation === item.item_id;
                const isUnanswered = !userResponse || !userResponse.selected_answer;
                const isWrong = userResponse && userResponse.selected_answer !== item.correct_answer;
                
                return (
                  <Card key={item.item_id} className={`border-2 ${
                    isUnanswered 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="space-y-3">
                        {/* Primeira linha: Badges principais */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={isUnanswered ? "secondary" : "destructive"} className="text-sm font-semibold">
                            Questão {getQuestionNumber(item.item_id, index)}
                          </Badge>
                          <Badge variant="outline">{item.area}</Badge>
                          <Badge variant="secondary">{item.estimated_difficulty}</Badge>
                          {isUnanswered && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Não respondida
                            </Badge>
                          )}
                        </div>
                        
                        {/* Segunda linha: Respostas */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {isUnanswered ? (
                            <>
                              <span className="text-xs text-gray-600">Status:</span>
                              <Badge variant="secondary" className="text-orange-600 text-xs">Não respondida</Badge>
                              <span className="text-xs text-gray-600">Correta:</span>
                              <Badge variant="default" className="bg-green-600 text-xs">{item.correct_answer}</Badge>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-gray-600">Sua:</span>
                              <Badge variant="destructive" className="text-xs">{userResponse?.selected_answer}</Badge>
                              <span className="text-xs text-gray-600">Correta:</span>
                              <Badge variant="default" className="bg-green-600 text-xs">{item.correct_answer}</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Questão */}
                      <div className="prose max-w-none prose-sm">
                        {(() => {
                          // Processar texto e extrair imagens
                          const { cleanText, images } = processTextWithImages(item.text || '');
                          
                          // Processar Unicode para fórmulas matemáticas e químicas
                          const processedContent = processMessageForDisplay(cleanText);
                          const latexNormalizedContent = normalizeFormulas(processedContent);
                          const mathProcessedContent = forceConvertMathToUnicode(latexNormalizedContent);
                          
                          return (
                            <div className="space-y-3">
                              {/* Renderizar imagens extraídas */}
                              {images.map((image, imgIndex) => (
                                <div key={imgIndex} className="mb-4">
                                  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs text-blue-800 font-medium">
                                      📷 Imagem {imgIndex + 1}
                                    </p>
                                  </div>
                                  <ImageWithFallback
                                    src={image.url}
                                    alt={image.alt || `Imagem ${imgIndex + 1} da questão`}
                                    className="max-w-full h-auto rounded-lg border border-gray-200"
                                  />
                                </div>
                              ))}
                              
                              {/* Renderizar texto sem imagens */}
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ children }) => (
                                    <h1 className="text-base font-semibold mb-2 text-gray-900">{children}</h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-sm font-semibold mb-2 text-gray-900">{children}</h2>
                                  ),
                                  p: ({ children }) => (
                                    <p className="text-gray-800 mb-2 leading-relaxed text-sm">{children}</p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-2 space-y-1 text-gray-800 text-sm">{children}</ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-800 text-sm">{children}</ol>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-gray-900">{children}</strong>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">
                                      {children}
                                    </code>
                                  ),
                                }}
                              >
                                {mathProcessedContent}
                              </ReactMarkdown>
                            </div>
                          )
                        })()}
                      </div>

                      {/* Alternativas */}
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 text-sm">Alternativas:</h4>
                        {item.alternatives && Object.entries(item.alternatives).map(([key, value]) => (
                          <div
                            key={key}
                            className={`p-2 rounded border ${
                              key === item.correct_answer
                                ? 'border-green-500 bg-green-50 text-green-900'
                                : key === userResponse?.selected_answer
                                ? 'border-red-500 bg-red-50 text-red-900'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                key === item.correct_answer
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : key === userResponse?.selected_answer
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : 'border-gray-300'
                              }`}>
                                {key}
                              </div>
                              <div className="flex-1 min-w-0">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => (
                                      <span className="inline text-xs">{children}</span>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-xs">{children}</strong>
                                    ),
                                  }}
                                >
                                  {value}
                                </ReactMarkdown>
                              </div>
                              <div className="flex-shrink-0">
                                {key === item.correct_answer && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                {key === userResponse?.selected_answer && key !== item.correct_answer && (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Explicação */}
                      {hasExplanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                            <Lightbulb className="h-3 w-3" />
                            Explicação
                          </h4>
                          <div className="prose max-w-none text-blue-800 prose-sm">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-1 text-xs">{children}</p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-xs">{children}</strong>
                                ),
                              }}
                            >
                              {hasExplanation}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {/* Botão para gerar explicação */}
                      {!hasExplanation && (
                        <div className="flex justify-center">
                          <Button
                            onClick={() => generateExplanation(item.item_id, getQuestionNumber(item.item_id, index))}
                            disabled={isGenerating}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Gerando...
                              </>
                            ) : (
                              <>
                                <Lightbulb className="h-3 w-3 mr-1" />
                                Explicação
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}