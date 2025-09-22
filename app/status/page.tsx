'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Activity, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

type StatusData = {
  timestamp: string;
  period: string;
  p95: { route: string; p95_ms: number | null }[];
  errorRate: { route: string; error_rate: number }[];
  rps: { minute: string; hits: number }[];
  systemMetrics: { name: string; avg_value: number; max_value: number; min_value: number; data_points: number }[];
  errorLogs: { time: string; severity: string; body: string; traceId: string | null; attr: any }[];
  systemStatus: Record<string, any>;
  topRoutes: { route: string; requests: number; avg_latency: number; max_latency: number }[];
};

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/status/summary');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar dados de status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (errorRate: number) => {
    if (errorRate > 0.05) return 'text-red-500'; // > 5%
    if (errorRate > 0.01) return 'text-yellow-500'; // > 1%
    return 'text-green-500'; // < 1%
  };

  const getStatusIcon = (errorRate: number) => {
    if (errorRate > 0.05) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (errorRate > 0.01) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Carregando status do sistema...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              Erro ao carregar dados de status: {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const overallErrorRate = data.systemStatus.error_rate || 0;
  const totalTraces = data.systemStatus.total_traces || 0;
  const avgLatency = data.systemStatus.avg_latency || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Status da Plataforma</h1>
            <p className="text-gray-600 mt-1">
              Monitoramento em tempo real • Atualizado a cada 10 segundos
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
              {getStatusIcon(overallErrorRate)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getStatusColor(overallErrorRate)}>
                  {overallErrorRate > 0.05 ? 'Degradado' : overallErrorRate > 0.01 ? 'Atenção' : 'Operacional'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Taxa de erro: {(overallErrorRate * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requisições (15m)</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTraces.toLocaleString()}</div>
              <p className="text-xs text-gray-500">
                {data.rps.length > 0 ? `${Math.round(data.rps.reduce((acc, r) => acc + r.hits, 0) / data.rps.length)} req/min` : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latência Média</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</div>
              <p className="text-xs text-gray-500">
                Últimos 15 minutos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erros Recentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.errorLogs.length}</div>
              <p className="text-xs text-gray-500">
                Últimos 15 minutos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* P95 por Rota */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>P95 por Rota (15m)</span>
              </CardTitle>
              <CardDescription>
                Latência do 95º percentil por endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.p95.slice(0, 10).map((route, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="font-mono text-sm text-gray-600 truncate flex-1">
                      {route.route || '(sem rota)'}
                    </span>
                    <Badge variant={route.p95_ms && route.p95_ms > 1000 ? 'destructive' : 'secondary'}>
                      {route.p95_ms ? `${route.p95_ms}ms` : '—'}
                    </Badge>
                  </div>
                ))}
                {data.p95.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Taxa de Erro por Rota */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Taxa de Erro por Rota (15m)</span>
              </CardTitle>
              <CardDescription>
                Percentual de requisições com erro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.errorRate.slice(0, 10).map((route, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="font-mono text-sm text-gray-600 truncate flex-1">
                      {route.route || '(sem rota)'}
                    </span>
                    <Badge 
                      variant={route.error_rate > 0.05 ? 'destructive' : route.error_rate > 0.01 ? 'secondary' : 'outline'}
                    >
                      {(route.error_rate * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
                {data.errorRate.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Rotas e Logs de Erro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Rotas por Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Top Rotas por Volume</CardTitle>
              <CardDescription>
                Endpoints com maior número de requisições
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.topRoutes.map((route, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-sm text-gray-600 truncate block">
                        {route.route || '(sem rota)'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {route.avg_latency.toFixed(0)}ms médio • {route.max_latency}ms máx
                      </span>
                    </div>
                    <Badge variant="outline">
                      {route.requests} req
                    </Badge>
                  </div>
                ))}
                {data.topRoutes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logs de Erro Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Logs de Erro Recentes</CardTitle>
              <CardDescription>
                Últimos erros registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.errorLogs.map((log, index) => (
                  <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive" className="text-xs">
                            {log.severity}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(log.time).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 truncate">
                          {log.body}
                        </p>
                        {log.traceId && (
                          <p className="text-xs text-gray-500 font-mono">
                            Trace: {log.traceId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {data.errorLogs.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum erro recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas do Sistema */}
        {data.systemMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Métricas do Sistema</CardTitle>
              <CardDescription>
                Métricas coletadas pelos instrumentos OpenTelemetry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.systemMetrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700">{metric.name}</h4>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Média:</span>
                        <span className="font-mono">{metric.avg_value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Máx:</span>
                        <span className="font-mono">{metric.max_value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Pontos:</span>
                        <span className="font-mono">{metric.data_points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
