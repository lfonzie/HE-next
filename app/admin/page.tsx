'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  Bot, 
  FileText, 
  BookOpen, 
  Target, 
  Activity,
  TrendingUp,
  DollarSign,
  Clock,
  Database,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Trigger refresh by re-running useEffect logic
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <div className="text-lg text-gray-600">Carregando estatísticas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div className="text-lg text-red-600">Erro: {error}</div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  // Enhanced chart data with trends
  const chartData = [
    { name: 'Escolas', value: stats.totalSchools, trend: '+12%', icon: Building2 },
    { name: 'Usuários', value: stats.totalUsers, trend: '+8%', icon: Users },
    { name: 'Conversas', value: stats.totalConversations, trend: '+25%', icon: MessageSquare },
    { name: 'Modelos', value: stats.totalModels, trend: '+5%', icon: Bot },
    { name: 'Prompts', value: stats.totalPrompts, trend: '+15%', icon: FileText },
    { name: 'Aulas', value: stats.totalLessons, trend: '+18%', icon: BookOpen },
    { name: 'Questões ENEM', value: stats.totalEnemQuestions, trend: '+22%', icon: Target },
    { name: 'Sessões ENEM', value: stats.totalEnemSessions, trend: '+30%', icon: Activity }
  ];

  const usageData = [
    { name: 'Tokens Usados', value: stats.totalTokensUsed, color: '#3b82f6' },
    { name: 'Tokens OpenAI', value: stats.openaiUsage.totalTokens, color: '#10b981' }
  ];

  const performanceData = [
    { name: 'Jan', responseTime: 1200, uptime: 99.9 },
    { name: 'Fev', responseTime: 1100, uptime: 99.8 },
    { name: 'Mar', responseTime: 1000, uptime: 99.9 },
    { name: 'Abr', responseTime: 950, uptime: 99.7 },
    { name: 'Mai', responseTime: 900, uptime: 99.9 },
    { name: 'Jun', responseTime: stats.avgResponseTime, uptime: 99.8 }
  ];

  return (
    <AdminTelemetryWrapper pageName="admin-dashboard">
      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" aria-hidden="true" />
              Dashboard Administrativo
            </h1>
            <p className="mt-2 text-gray-600">
              Visão geral do sistema HubEdu - Última atualização: <time dateTime={lastUpdated.toISOString()}>{lastUpdated.toLocaleString('pt-BR')}</time>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm" role="status" aria-label="Status do sistema">
              <CheckCircle className="w-3 h-3 mr-1 text-green-600" aria-hidden="true" />
              Sistema Online
            </Badge>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              aria-label="Atualizar dados do dashboard"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              aria-label="Exportar dados do dashboard"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Exportar
            </Button>
          </div>
        </header>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Métricas principais do sistema">
              {chartData.slice(0, 4).map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Card key={item.name} className="hover:shadow-lg transition-shadow" role="article" aria-labelledby={`metric-${index}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle id={`metric-${index}`} className="text-sm font-medium text-gray-600">
                        {item.name}
                      </CardTitle>
                      <IconComponent className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900" aria-label={`${item.value.toLocaleString()} ${item.name}`}>
                        {item.value.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-green-600 mt-1" aria-label={`Tendência: ${item.trend}`}>
                        <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
                        {item.trend}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Métricas secundárias do sistema">
              {chartData.slice(4).map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Card key={item.name} className="hover:shadow-lg transition-shadow" role="article" aria-labelledby={`secondary-metric-${index}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle id={`secondary-metric-${index}`} className="text-sm font-medium text-gray-600">
                        {item.name}
                      </CardTitle>
                      <IconComponent className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900" aria-label={`${item.value.toLocaleString()} ${item.name}`}>
                        {item.value.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-green-600 mt-1" aria-label={`Tendência: ${item.trend}`}>
                        <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
                        {item.trend}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* System Overview Chart */}
            <Card role="region" aria-labelledby="system-overview-title">
              <CardHeader>
                <CardTitle id="system-overview-title" className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" aria-hidden="true" />
                  Visão Geral do Sistema
                </CardTitle>
                <CardDescription>
                  Distribuição de recursos e atividades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Gráfico de barras mostrando distribuição de recursos do sistema">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    Distribuição de Tokens
                  </CardTitle>
                  <CardDescription>
                    Uso de tokens por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={usageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {usageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5" />
                    Crescimento Mensal
                  </CardTitle>
                  <CardDescription>
                    Tendência de crescimento dos principais indicadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={performanceData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="uptime" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Tempo de Resposta
                  </CardTitle>
                  <CardDescription>
                    Performance média do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.avgResponseTime}ms
                  </div>
                  <div className="text-sm text-gray-600">
                    Tempo médio de resposta das requisições
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Estatísticas de Uso
                  </CardTitle>
                  <CardDescription>
                    Métricas de utilização do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de Tokens</span>
                    <span className="font-semibold">{stats.totalTokensUsed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Requisições OpenAI</span>
                    <span className="font-semibold">{stats.openaiUsage.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Uptime Médio</span>
                    <span className="font-semibold text-green-600">99.8%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Custos Operacionais
                  </CardTitle>
                  <CardDescription>
                    Estimativa de custos com APIs externas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Custo Estimado (USD)</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${stats.openaiUsage.estimatedCostUSD.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Custo Estimado (BRL)</span>
                    <span className="text-2xl font-bold text-gray-900">
                      R$ {stats.openaiUsage.estimatedCostBRL.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tokens OpenAI</span>
                    <span className="font-semibold">{stats.openaiUsage.totalTokens.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Eficiência de Custos
                  </CardTitle>
                  <CardDescription>
                    Análise de custo por utilização
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Custo por Token</span>
                      <span className="font-semibold">
                        ${(stats.openaiUsage.estimatedCostUSD / stats.openaiUsage.totalTokens * 1000).toFixed(4)}/1K
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Custo por Requisição</span>
                      <span className="font-semibold">
                        ${(stats.openaiUsage.estimatedCostUSD / stats.openaiUsage.totalRequests).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Custo por Conversa</span>
                      <span className="font-semibold">
                        ${(stats.openaiUsage.estimatedCostUSD / stats.totalConversations).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminTelemetryWrapper>
  );
}
