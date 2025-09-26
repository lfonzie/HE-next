import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, BookOpen, CheckCircle, XCircle } from 'lucide-react';

interface QuizResult {
  questionIndex: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface QuizSummarySlideProps {
  title: string;
  content: string;
  quizResults: {
    quiz1: {
      score: string;
      feedback: string;
      results: QuizResult[];
    };
    quiz2: {
      score: string;
      feedback: string;
      results: QuizResult[];
    };
    overall: string;
  };
  keyConcepts: string[];
  nextSteps: string[];
  onComplete?: () => void;
}

export default function QuizSummarySlide({
  title,
  content,
  quizResults,
  keyConcepts,
  nextSteps,
  onComplete
}: QuizSummarySlideProps) {
  
  // Calculate overall statistics
  const totalQuestions = quizResults.quiz1.results.length + quizResults.quiz2.results.length;
  const totalCorrect = quizResults.quiz1.results.filter(r => r.isCorrect).length + 
                      quizResults.quiz2.results.filter(r => r.isCorrect).length;
  const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{content}</p>
      </div>

      {/* Overall Performance */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="h-6 w-6" />
            Desempenho Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalCorrect}/{totalQuestions}</div>
              <div className="text-sm text-gray-600">Perguntas Corretas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{overallPercentage}%</div>
              <div className="text-sm text-gray-600">Taxa de Acerto</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {overallPercentage >= 80 ? 'Excelente' : overallPercentage >= 60 ? 'Bom' : 'Pode Melhorar'}
              </div>
              <div className="text-sm text-gray-600">Classificação</div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={overallPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Quiz Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz 1 Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Quiz 1
              </Badge>
              <span className="text-lg">Verificação de Compreensão</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pontuação:</span>
              <Badge variant={quizResults.quiz1.results.filter(r => r.isCorrect).length >= 2 ? "default" : "secondary"}>
                {quizResults.quiz1.score}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {quizResults.quiz1.results.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Pergunta {index + 1}</span>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Feedback:</strong> {quizResults.quiz1.feedback}
            </div>
          </CardContent>
        </Card>

        {/* Quiz 2 Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Quiz 2
              </Badge>
              <span className="text-lg">Análise Situacional</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pontuação:</span>
              <Badge variant={quizResults.quiz2.results.filter(r => r.isCorrect).length >= 2 ? "default" : "secondary"}>
                {quizResults.quiz2.score}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {quizResults.quiz2.results.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Pergunta {index + 1}</span>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Feedback:</strong> {quizResults.quiz2.feedback}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Concepts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Conceitos Principais Aprendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyConcepts.map((concept, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-gray-700">{concept}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Feedback */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-green-900">Feedback Geral</h3>
            <p className="text-green-800 max-w-2xl mx-auto">{quizResults.overall}</p>
            
            {onComplete && (
              <button
                onClick={onComplete}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Finalizar Aula
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
