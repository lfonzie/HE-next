"use client";

import { useState, useEffect } from 'react';

interface StatusData {
  timestamp: string;
  period: string;
  p95: { route: string; p95_ms: number }[];
  errorRate: { route: string; error_rate: number }[];
  rps: { minute: string; hits: number }[];
  systemStatus: {
    total_traces: number;
    error_rate: number;
    avg_latency: number;
  };
  topRoutes: {
    route: string;
    requests: number;
    avg_latency: number;
    max_latency: number;
  }[];
  errorLogs: any[];
}

export default function StatusSimplePage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      console.log('🔄 Buscando dados de status...');
      const response = await fetch('/api/status/summary');
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Dados recebidos:', result);
      setData(result);
    } catch (err: any) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando status do sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-6 flex items-center justify-center">
        <div className="text-center text-red-700">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar status</h1>
          <p className="text-lg">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold mb-2">Nenhum dado disponível</h1>
          <p className="text-lg">Não há dados de telemetria para exibir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Status da Plataforma</h1>
          <p className="text-gray-600">
            Monitoramento em tempo real • Atualizado a cada 30 segundos
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Última atualização: {new Date(data.timestamp).toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Status Geral</h3>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-600 font-medium">Operacional</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Taxa de erro: {data.systemStatus.error_rate.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Requisições (15m)</h3>
            <div className="text-3xl font-bold text-blue-600">
              {data.systemStatus.total_traces}
            </div>
            <p className="text-sm text-gray-500">Traces coletadas</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Latência Média</h3>
            <div className="text-3xl font-bold text-orange-600">
              {data.systemStatus.avg_latency.toFixed(0)}ms
            </div>
            <p className="text-sm text-gray-500">Últimos 15 minutos</p>
          </div>
        </div>

        {/* P95 por Rota */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">P95 por Rota (15m)</h3>
          <p className="text-sm text-gray-600 mb-4">Latência do 95º percentil por endpoint</p>
          
          {data.p95.length > 0 ? (
            <div className="space-y-3">
              {data.p95.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-mono text-sm">{item.route}</span>
                  <span className="font-semibold text-orange-600">{item.p95_ms}ms</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>

        {/* Taxa de Erro por Rota */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Taxa de Erro por Rota (15m)</h3>
          <p className="text-sm text-gray-600 mb-4">Percentual de requisições com erro</p>
          
          {data.errorRate.length > 0 ? (
            <div className="space-y-3">
              {data.errorRate.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-mono text-sm">{item.route}</span>
                  <span className={`font-semibold ${item.error_rate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {(item.error_rate * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>

        {/* Top Rotas por Volume */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Rotas por Volume</h3>
          <p className="text-sm text-gray-600 mb-4">Endpoints com maior número de requisições</p>
          
          {data.topRoutes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Rota</th>
                    <th className="text-left py-2 font-medium text-gray-700">Requisições</th>
                    <th className="text-left py-2 font-medium text-gray-700">Latência Média</th>
                    <th className="text-left py-2 font-medium text-gray-700">Latência Máxima</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRoutes.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 font-mono text-sm">{item.route}</td>
                      <td className="py-2 font-semibold text-blue-600">{item.requests}</td>
                      <td className="py-2 text-orange-600">{item.avg_latency.toFixed(0)}ms</td>
                      <td className="py-2 text-red-600">{item.max_latency}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>

        {/* Logs de Erro Recentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Logs de Erro Recentes</h3>
          <p className="text-sm text-gray-600 mb-4">Últimos erros registrados no sistema</p>
          
          {data.errorLogs.length > 0 ? (
            <div className="space-y-3">
              {data.errorLogs.map((log, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-red-800">{log.body}</p>
                      <p className="text-xs text-red-600 mt-1">
                        {new Date(log.time).toLocaleString('pt-BR')}
                      </p>
                      {log.traceId && (
                        <p className="text-xs text-red-500 mt-1">Trace ID: {log.traceId}</p>
                      )}
                    </div>
                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                      {log.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum erro recente</p>
          )}
        </div>
      </div>
    </div>
  );
}
