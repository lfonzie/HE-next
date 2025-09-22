'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

type BusinessMetrics = {
  aiProviders: Array<{
    provider: string;
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    totalCost: number;
    errorRate: number;
    lastRequest: string;
  }>;
  lessonGeneration: {
    totalLessons: number;
    avgGenerationTime: number;
    successRate: number;
    avgTokensUsed: number;
    mostPopularSubjects: Array<{ subject: string; count: number }>;
    timeDistribution: Array<{ hour: number; count: number }>;
  };
  userEngagement: {
    activeUsers: number;
    newUsers: number;
    avgSessionDuration: number;
    mostActiveModules: Array<{ module: string; users: number }>;
    retentionRate: number;
  };
  systemHealth: Record<string, any>;
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('24h');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/metrics/business?period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setMetrics(result.metrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, [period]);

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Activity className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Carregando analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">Erro ao carregar analytics: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Avançados</h1>
            <p className="text-gray-600 mt-1">
              Métricas de negócio e performance em tempo real
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1h">Última Hora</option>
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="ai">IA & Performance</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="business">Negócio</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.userEngagement.activeUsers}</div>
                  <p className="text-xs text-gray-500">
                    +{metrics.userEngagement.newUsers} novos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aulas Geradas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.lessonGeneration.totalLessons}</div>
                  <p className="text-xs text-gray-500">
                    {(metrics.lessonGeneration.successRate * 100).toFixed(1)}% sucesso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(metrics.lessonGeneration.avgGenerationTime / 1000).toFixed(1)}s
                  </div>
                  <p className="text-xs text-gray-500">
                    Geração de aulas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retenção</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(metrics.userEngagement.retentionRate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500">
                    Últimos 7 dias
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Distribuição por Hora */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade por Hora do Dia</CardTitle>
                <CardDescription>
                  Distribuição de geração de aulas ao longo do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end space-x-2">
                  {metrics.lessonGeneration.timeDistribution.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="bg-blue-500 rounded-t w-full"
                        style={{
                          height: `${(item.count / Math.max(...metrics.lessonGeneration.timeDistribution.map(d => d.count))) * 200}px`
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-2">{item.hour}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IA & Performance */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance por Provider */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Provider IA</CardTitle>
                  <CardDescription>
                    Taxa de sucesso e latência média
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.aiProviders.map((provider, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{provider.provider}</div>
                          <div className="text-sm text-gray-500">
                            {provider.totalRequests} requests • {provider.avgLatency.toFixed(0)}ms médio
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={provider.successRate > 0.9 ? 'default' : provider.successRate > 0.8 ? 'secondary' : 'destructive'}
                          >
                            {(provider.successRate * 100).toFixed(1)}%
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            R$ {provider.totalCost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Sucesso por Provider */}
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Sucesso por Provider</CardTitle>
                  <CardDescription>
                    Comparação de performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.aiProviders.map((provider, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{provider.provider}</span>
                          <span>{(provider.successRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${provider.successRate * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas de Tokens */}
            <Card>
              <CardHeader>
                <CardTitle>Uso de Tokens</CardTitle>
                <CardDescription>
                  Consumo médio de tokens por aula
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {metrics.lessonGeneration.avgTokensUsed.toFixed(0)}
                  </div>
                  <p className="text-gray-500">tokens por aula</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Módulos Mais Ativos */}
              <Card>
                <CardHeader>
                  <CardTitle>Módulos Mais Ativos</CardTitle>
                  <CardDescription>
                    Engajamento por funcionalidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.userEngagement.mostActiveModules.map((module, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{module.module}</span>
                        <Badge variant="outline">{module.users} usuários</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Duração de Sessão */}
              <Card>
                <CardHeader>
                  <CardTitle>Duração de Sessão</CardTitle>
                  <CardDescription>
                    Tempo médio de uso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {(metrics.userEngagement.avgSessionDuration / 1000 / 60).toFixed(1)}
                    </div>
                    <p className="text-gray-500">minutos</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Negócio */}
          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Matérias Populares */}
              <Card>
                <CardHeader>
                  <CardTitle>Matérias Mais Populares</CardTitle>
                  <CardDescription>
                    Aulas geradas por matéria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.lessonGeneration.mostPopularSubjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{subject.subject}</span>
                        <Badge variant="outline">{subject.count} aulas</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Saúde do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle>Saúde do Sistema</CardTitle>
                  <CardDescription>
                    Métricas de performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Requests:</span>
                      <span className="font-mono">{metrics.systemHealth.total_requests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Erro:</span>
                      <span className="font-mono text-red-600">
                        {((metrics.systemHealth.error_rate || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latência Média:</span>
                      <span className="font-mono">
                        {metrics.systemHealth.avg_latency?.toFixed(0) || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>P95 Latência:</span>
                      <span className="font-mono">
                        {metrics.systemHealth.p95_latency?.toFixed(0) || 0}ms
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
