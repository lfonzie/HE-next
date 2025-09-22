'use client';

import { useEffect, useState } from 'react';

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

export default function StatusPublicPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/status/summary');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-lg">Carregando status…</span>
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
              <div className="text-red-500 mr-2">⚠️</div>
              <span className="text-red-700">Erro ao carregar dados de status: {error}</span>
            </div>
          </div>
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
            <span className="text-sm text-gray-500">
              Última atualização: {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Status Geral</h3>
              <div className={`w-3 h-3 rounded-full ${overallErrorRate > 0.05 ? 'bg-red-500' : overallErrorRate > 0.01 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                <span className={overallErrorRate > 0.05 ? 'text-red-500' : overallErrorRate > 0.01 ? 'text-yellow-500' : 'text-green-500'}>
                  {overallErrorRate > 0.05 ? 'Degradado' : overallErrorRate > 0.01 ? 'Atenção' : 'Operacional'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Taxa de erro: {(overallErrorRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Requisições (15m)</h3>
              <div className="text-blue-500">📊</div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{totalTraces.toLocaleString()}</div>
              <p className="text-xs text-gray-500">
                {data.rps.length > 0 ? `${Math.round(data.rps.reduce((acc, r) => acc + r.hits, 0) / data.rps.length)} req/min` : 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Latência Média</h3>
              <div className="text-green-500">⏱️</div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</div>
              <p className="text-xs text-gray-500">
                Últimos 15 minutos
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Erros Recentes</h3>
              <div className="text-red-500">⚠️</div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{data.errorLogs.length}</div>
              <p className="text-xs text-gray-500">
                Últimos 15 minutos
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Status do Sistema</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de Traces:</span>
              <span className="font-mono">{totalTraces}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de Erro:</span>
              <span className="font-mono">{(overallErrorRate * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Latência Média:</span>
              <span className="font-mono">{avgLatency.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${overallErrorRate > 0.05 ? 'text-red-500' : overallErrorRate > 0.01 ? 'text-yellow-500' : 'text-green-500'}`}>
                {overallErrorRate > 0.05 ? 'Degradado' : overallErrorRate > 0.01 ? 'Atenção' : 'Operacional'}
              </span>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Sistema de Monitoramento</h3>
          <p className="text-blue-700">
            Este dashboard mostra o status em tempo real da plataforma HE-Next. 
            Os dados são atualizados automaticamente a cada 10 segundos.
          </p>
          <div className="mt-4 text-sm text-blue-600">
            <p>• <strong>Operacional:</strong> Sistema funcionando normalmente</p>
            <p>• <strong>Atenção:</strong> Taxa de erro entre 1% e 5%</p>
            <p>• <strong>Degradado:</strong> Taxa de erro acima de 5%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
