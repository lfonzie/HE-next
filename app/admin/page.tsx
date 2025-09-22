'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminTelemetryWrapper from '@/components/admin/AdminTelemetryWrapper';

interface AdminStats {
  totalSchools: number;
  totalUsers: number;
  totalConversations: number;
  totalModels: number;
  totalPrompts: number;
  totalLessons: number;
  totalEnemQuestions: number;
  totalEnemSessions: number;
  totalTokensUsed: number;
  avgResponseTime: number;
  openaiUsage: {
    totalTokens: number;
    totalRequests: number;
    estimatedCostUSD: number;
    estimatedCostBRL: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando estatísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Erro: {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const chartData = [
    { name: 'Escolas', value: stats.totalSchools },
    { name: 'Usuários', value: stats.totalUsers },
    { name: 'Conversas', value: stats.totalConversations },
    { name: 'Modelos', value: stats.totalModels },
    { name: 'Prompts', value: stats.totalPrompts },
    { name: 'Aulas', value: stats.totalLessons },
    { name: 'Questões ENEM', value: stats.totalEnemQuestions },
    { name: 'Sessões ENEM', value: stats.totalEnemSessions }
  ];

  const usageData = [
    { name: 'Tokens Usados', value: stats.totalTokensUsed },
    { name: 'Tokens OpenAI', value: stats.openaiUsage.totalTokens }
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <AdminTelemetryWrapper pageName="admin-dashboard">
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do sistema HubEdu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🏫</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Escolas</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalSchools}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Usuários</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">💬</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Conversas</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalConversations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Modelos Disponíveis</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalModels}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Prompts do Sistema</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalPrompts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📚</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Aulas</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalLessons}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Questões ENEM</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalEnemQuestions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🎯</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Sessões ENEM</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalEnemSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Estatísticas de Uso</h3>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total de Tokens</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.totalTokensUsed.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tempo Médio de Resposta</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.avgResponseTime}ms
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Custo Estimado (USD)</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  ${stats.openaiUsage.estimatedCostUSD.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Custo Estimado (BRL)</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  R$ {stats.openaiUsage.estimatedCostBRL.toFixed(2)}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Distribuição de Tokens</h3>
            <div className="mt-5">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={usageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Chart */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Visão Geral do Sistema</h3>
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
    </AdminTelemetryWrapper>
  );
}
