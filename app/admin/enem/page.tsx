"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Database,
  Activity,
  Target,
  BookOpen
} from 'lucide-react';
import { EnemMetrics, EnemLogEntry } from '@/lib/enem-observability';
import { AuthGuard } from '@/components/AuthGuard';
import { EnemAdminPanel } from '@/components/admin/EnemAdminPanel';

function EnemAdminContent() {
  const [metrics, setMetrics] = useState<EnemMetrics | null>(null);
  const [logs, setLogs] = useState<EnemLogEntry[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const timeRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date()
      };

      const [metricsRes, logsRes, alertsRes, qualityRes] = await Promise.all([
        fetch('/api/admin/enem/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(timeRange)
        }),
        fetch('/api/admin/enem/logs?limit=50'),
        fetch('/api/admin/enem/alerts'),
        fetch('/api/admin/enem/data-quality')
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      if (qualityRes.ok) {
        const qualityData = await qualityRes.json();
        setDataQuality(qualityData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExportMetrics = async () => {
    try {
      const response = await fetch('/api/admin/enem/export-metrics');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enem-metrics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ENEM Simulator Admin</h1>
              <p className="text-gray-600">Monitoramento e métricas do simulador ENEM</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleExportMetrics} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Métricas
              </Button>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium">{alert.message}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Sessões</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.completionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pontuação Média</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.averageScore.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.averageTimeSpent.toFixed(1)} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="data-management" className="space-y-6">
          <TabsList>
            <TabsTrigger value="data-management">Gerenciamento de Dados</TabsTrigger>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="data-quality">Qualidade dos Dados</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="data-management" className="space-y-6">
            <EnemAdminPanel />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Sessions by Mode */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sessões por Modo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(metrics.sessionsByMode).map(([mode, count]) => (
                      <div key={mode} className="flex items-center justify-between">
                        <span className="font-medium">{mode}</span>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={(count / metrics.totalSessions) * 100} 
                            className="w-32 h-2" 
                          />
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score Distribution */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Distribuição de Pontuações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{metrics.scoreDistribution.excellent}</div>
                      <div className="text-sm text-gray-600">Excelente (≥80%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.scoreDistribution.good}</div>
                      <div className="text-sm text-gray-600">Bom (60-79%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{metrics.scoreDistribution.regular}</div>
                      <div className="text-sm text-gray-600">Regular (40-59%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{metrics.scoreDistribution.poor}</div>
                      <div className="text-sm text-gray-600">Precisa Melhorar (&lt;40%)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Top Performing Topics */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Tópicos com Melhor Desempenho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.topPerformingTopics.slice(0, 10).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{topic.topic}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={topic.accuracy * 100} className="w-32 h-2" />
                          <span className="text-sm font-medium w-12 text-right">
                            {(topic.accuracy * 100).toFixed(1)}%
                          </span>
                          <Badge variant="secondary">{topic.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weak Topics */}
            {metrics && metrics.weakTopics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Tópicos que Precisam de Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.weakTopics.slice(0, 10).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{topic.topic}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={topic.accuracy * 100} className="w-32 h-2" />
                          <span className="text-sm font-medium w-12 text-right">
                            {(topic.accuracy * 100).toFixed(1)}%
                          </span>
                          <Badge variant="secondary">{topic.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="data-quality" className="space-y-6">
            {dataQuality && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Qualidade dos Dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{dataQuality.totalItems}</div>
                        <div className="text-sm text-gray-600">Total de Itens</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{dataQuality.itemsWithAssets}</div>
                        <div className="text-sm text-gray-600">Com Assets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{dataQuality.itemsWithoutAssets}</div>
                        <div className="text-sm text-gray-600">Sem Assets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{dataQuality.duplicateItems}</div>
                        <div className="text-sm text-gray-600">Duplicados</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cobertura por Área</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(dataQuality.coverageByArea).map(([area, count]) => (
                        <div key={area} className="flex items-center justify-between">
                          <span className="font-medium">{area}</span>
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={(count as number / dataQuality.totalItems) * 100} 
                              className="w-32 h-2" 
                            />
                            <span className="text-sm font-medium w-12 text-right">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Logs Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'}>
                          {log.level}
                        </Badge>
                        <span className="font-medium">{log.message}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function EnemAdminPage() {
  return (
    <AuthGuard>
      <EnemAdminContent />
    </AuthGuard>
  );
}
