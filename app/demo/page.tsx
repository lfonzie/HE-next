'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TIInteractive } from '@/components/ti-interactive/TIInteractive';
import { AchievementSystem } from '@/components/gamification/AchievementSystem';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { 
  Wrench, 
  Trophy, 
  BarChart3, 
  Lightbulb, 
  Target,
  Zap,
  Clock,
  MessageSquare
} from 'lucide-react';

function DemoContent() {
  const searchParams = useSearchParams();
  const [selectedDemo, setSelectedDemo] = useState<string>('ti');

  // Mock user ID for demo purposes
  const demoUserId = 'demo-user-123';

  // Mock analytics data for demo
  const mockAnalyticsData = {
    overview: {
      totalStudents: 150,
      totalLessons: 25,
      totalTimeSpent: 1250,
      averageAccuracy: 78,
      completionRate: 85,
      engagementScore: 8.2
    },
    studentProgress: [
      { studentId: '1', name: 'João Silva', completedLessons: 8, totalPoints: 245, accuracy: 85, timeSpent: 120000, lastActive: new Date() },
      { studentId: '2', name: 'Maria Santos', completedLessons: 6, totalPoints: 198, accuracy: 92, timeSpent: 95000, lastActive: new Date() }
    ],
    lessonPerformance: [
      { lessonId: '1', title: 'Fotossíntese', completionRate: 90, averageScore: 85, averageTime: 25, difficulty: 'medium', studentCount: 45 },
      { lessonId: '2', title: 'Equações', completionRate: 75, averageScore: 78, averageTime: 30, difficulty: 'hard', studentCount: 38 }
    ],
    engagementMetrics: [
      { date: '2024-01-01', activeStudents: 45, lessonsCompleted: 12, averageSessionTime: 25, quizAccuracy: 82 },
      { date: '2024-01-02', activeStudents: 52, lessonsCompleted: 15, averageSessionTime: 28, quizAccuracy: 85 }
    ],
    popularContent: [
      { type: 'lesson', title: 'Fotossíntese', views: 150, completions: 45, rating: 4.5 },
      { type: 'quiz', title: 'Quiz de Matemática', views: 120, completions: 38, rating: 4.2 }
    ]
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['ti', 'achievements', 'analytics'].includes(tab)) {
      setSelectedDemo(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Novas Funcionalidades - HubEdu.ai
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Demonstração das funcionalidades migradas do HubEdu.ai_ para HE-next
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="outline" className="px-4 py-2">
              <Wrench className="w-4 h-4 mr-2" />
              Troubleshooting Interativo
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Sistema de Conquistas
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics Avançado
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={selectedDemo} onValueChange={setSelectedDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="ti" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Troubleshooting
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Troubleshooting Demo */}
          <TabsContent value="ti" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  Sistema de Troubleshooting Interativo
                </CardTitle>
                <p className="text-gray-600">
                  Resolução passo-a-passo de problemas de TI com dicas em tempo real
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">🔧 Problemas de PC</h3>
                        <p className="text-sm text-blue-600">
                          Resolução de problemas de performance, lentidão e travamentos
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-green-800 mb-2">📶 Problemas de Wi-Fi</h3>
                        <p className="text-sm text-green-600">
                          Solução de problemas de conectividade e rede
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-3">Teste o Sistema:</h3>
                    <TIInteractive initialQuestion="Meu computador está muito lento" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Demo */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Sistema de Gamificação
                </CardTitle>
                <p className="text-gray-600">
                  Conquistas e badges para engajar usuários e motivar o aprendizado
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4 text-center">
                        <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-yellow-800">Engajamento</h3>
                        <p className="text-sm text-yellow-600">Atividade constante</p>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4 text-center">
                        <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-blue-800">Exploração</h3>
                        <p className="text-sm text-blue-600">Descoberta de recursos</p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4 text-center">
                        <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-green-800">Consistência</h3>
                        <p className="text-sm text-green-600">Uso regular</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4 text-center">
                        <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-purple-800">Desafios</h3>
                        <p className="text-sm text-purple-600">Objetivos especiais</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-3">Sistema de Conquistas:</h3>
                    <AchievementSystem userId={demoUserId} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Demo */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Dashboard de Analytics
                </CardTitle>
                <p className="text-gray-600">
                  Métricas detalhadas de uso, performance e engajamento dos usuários
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4 text-center">
                        <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-blue-800">Mensagens</h3>
                        <p className="text-sm text-blue-600">Total de interações</p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4 text-center">
                        <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-green-800">Tempo</h3>
                        <p className="text-sm text-green-600">Tempo de uso</p>
                      </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4 text-center">
                        <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-yellow-800">Conquistas</h3>
                        <p className="text-sm text-yellow-600">Progresso</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-purple-800">Performance</h3>
                        <p className="text-sm text-purple-600">Métricas</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-3">Dashboard de Analytics:</h3>
                    <AnalyticsDashboard data={mockAnalyticsData} timeRange="monthly" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* API Endpoints Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-600" />
              Endpoints da API Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🔧 TI Hints</h3>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  POST /api/ti/hint
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Dicas em tempo real para troubleshooting
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">🏆 Achievements</h3>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  GET/POST /api/achievements
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Sistema de conquistas e gamificação
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">📊 Analytics</h3>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  GET /api/analytics
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Métricas e estatísticas de uso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-green-800">📋 Como Usar as Novas Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Troubleshooting Interativo</h4>
                  <p className="text-sm text-gray-600">
                    Digite uma pergunta sobre problemas de TI e siga os passos guiados com dicas em tempo real.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Sistema de Conquistas</h4>
                  <p className="text-sm text-gray-600">
                    Complete atividades para desbloquear badges e acompanhar seu progresso de aprendizado.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Analytics Dashboard</h4>
                  <p className="text-sm text-gray-600">
                    Visualize métricas de uso, tempo de estudo e performance em gráficos interativos.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">Carregando demonstração...</p>
      </div>
    </div>}>
      <DemoContent />
    </Suspense>
  );
}