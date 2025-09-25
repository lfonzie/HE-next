'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Database, 
  Users, 
  MessageSquare, 
  School, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Activity,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseStats {
  timestamp: string;
  timeRange: string;
  summary: {
    totalTables: number;
    totalRecords: number;
    totalUsers: number;
    totalConversations: number;
    totalTokensUsed: number;
    avgTokensPerConversation: number;
    userGrowthRate: string;
    conversationGrowthRate: string;
  };
  tableCounts: {
    users: number;
    schools: number;
    conversations: number;
    analytics: number;
    systemMessages: number;
    schoolPrompts: number;
    enemQuestions: number;
    enemSessions: number;
    models: number;
    lessons: number;
    messageVotes: number;
  };
  userStats: {
    students: number;
    teachers: number;
    admins: number;
    newUsers: number;
    roleBreakdown: Array<{ role: string; _count: { role: number } }>;
  };
  conversationStats: {
    recentConversations: number;
    byModule: Array<{ module: string; _count: { module: number }; _sum: { token_count: number | null } }>;
    byModel: Array<{ model: string; _count: { model: number }; _sum: { token_count: number | null } }>;
    totals: { _sum: { token_count: number | null }; _avg: { token_count: number | null } };
  };
  analyticsStats: {
    recentAnalytics: number;
    byModule: Array<{ module: string; _count: { module: number }; _sum: { tokens_used: number | null } }>;
    totals: { _sum: { tokens_used: number | null }; _avg: { tokens_used: number | null } };
    dailyUsage: Array<{ date: Date; _count: { date: number }; _sum: { tokens_used: number | null } }>;
  };
  schoolStats: {
    newSchools: number;
    byState: Array<{ state: string; _count: { state: number } }>;
    byPlan: Array<{ plan: string; _count: { plan: number } }>;
  };
  promptStats: {
    systemMessages: number;
    schoolPrompts: number;
    activeSystemPrompts: number;
    activeSchoolPrompts: number;
  };
  enemStats: {
    questions: number;
    sessions: number;
    sessionsAlt: number;
    byArea: Array<{ area: string; _count: { area: number } }>;
    byDisciplina: Array<{ disciplina: string; _count: { disciplina: number } }>;
  };
  dbPerformance: {
    tableStats: any[];
    dbStats: any[];
  };
  recentActivity: {
    recentConversations: Array<{
      id: string;
      module: string;
      model: string;
      token_count: number;
      created_at: string;
    }>;
    recentAnalytics: Array<{
      id: string;
      module: string;
      tokens_used: number;
      date: string;
    }>;
    recentUsers: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      created_at: string;
    }>;
  };
  detailedMetrics?: {
    topModulesByUsage: any[];
    topModelsByUsage: any[];
    dailyTokenUsage: any[];
    schoolsByState: any[];
    enemQuestionsByYear: any[];
    enemQuestionsByDiscipline: any[];
  };
}

export default function DatabaseStatsPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [showDetails, setShowDetails] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/database-stats?timeRange=${timeRange}&includeDetails=${showDetails}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching database stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch database statistics');
      toast.error('Erro ao carregar estatísticas do banco de dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange, showDetails]);

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const exportStats = () => {
    if (!stats) return;
    
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `database-stats-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Estatísticas exportadas com sucesso!');
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando estatísticas do banco de dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar estatísticas: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchStats} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!stats || !stats.summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Database className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma estatística disponível</p>
          <Button onClick={fetchStats} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Carregar Estatísticas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Estatísticas do Banco de Dados Neon
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão abrangente das métricas e performance do banco de dados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
          </Button>
          <Button onClick={exportStats} disabled={!stats}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Período:</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último dia</SelectItem>
              <SelectItem value="7d">Última semana</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {stats && (
          <Badge variant="outline">
            Atualizado em: {formatDate(stats.timestamp)}
          </Badge>
        )}
      </div>

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.summary.totalRecords)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.summary.totalTables} tabelas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.summary.totalUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  Crescimento: {stats.summary.userGrowthRate}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.summary.totalConversations)}</div>
                <p className="text-xs text-muted-foreground">
                  Crescimento: {stats.summary.conversationGrowthRate}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Utilizados</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.summary.totalTokensUsed)}</div>
                <p className="text-xs text-muted-foreground">
                  Média: {stats.summary.avgTokensPerConversation} por conversa
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="conversations">Conversas</TabsTrigger>
              <TabsTrigger value="schools">Escolas</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="enem">ENEM</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.tableCounts).map(([table, count]) => (
                  <Card key={table}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium capitalize">
                        {table.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(count)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.userStats.students)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Professores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.userStats.teachers)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.userStats.admins)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.userStats.newUsers)}</div>
                    <p className="text-xs text-muted-foreground">No período selecionado</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Conversations Tab */}
            <TabsContent value="conversations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Conversas por Módulo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.conversationStats?.byModule?.slice(0, 10).map((item) => (
                        <div key={item.module} className="flex justify-between items-center">
                          <span className="text-sm">{item.module}</span>
                          <Badge variant="secondary">
                            {formatNumber(item._count?.module || 0)}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-sm text-muted-foreground">
                          Nenhum dado de módulo disponível
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Conversas por Modelo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.conversationStats?.byModel?.slice(0, 10).map((item) => (
                        <div key={item.model} className="flex justify-between items-center">
                          <span className="text-sm">{item.model}</span>
                          <Badge variant="secondary">
                            {formatNumber(item._count?.model || 0)}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-sm text-muted-foreground">
                          Nenhum dado de modelo disponível
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Schools Tab */}
            <TabsContent value="schools" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Escolas por Estado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.schoolStats?.byState?.slice(0, 10).map((item) => (
                        <div key={item.state} className="flex justify-between items-center">
                          <span className="text-sm">{item.state}</span>
                          <Badge variant="secondary">
                            {formatNumber(item._count?.state || 0)}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-sm text-muted-foreground">
                          Nenhum dado de estado disponível
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Escolas por Plano</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.schoolStats?.byPlan?.slice(0, 10).map((item) => (
                        <div key={item.plan} className="flex justify-between items-center">
                          <span className="text-sm">{item.plan}</span>
                          <Badge variant="secondary">
                            {formatNumber(item._count?.plan || 0)}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-sm text-muted-foreground">
                          Nenhum dado de plano disponível
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Prompts Tab */}
            <TabsContent value="prompts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Prompts do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.promptStats.systemMessages)}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.promptStats.activeSystemPrompts} ativos
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Prompts das Escolas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.promptStats.schoolPrompts)}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.promptStats.activeSchoolPrompts} ativos
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Prompts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(stats.promptStats.systemMessages + stats.promptStats.schoolPrompts)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.promptStats.activeSystemPrompts + stats.promptStats.activeSchoolPrompts} ativos
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ENEM Tab */}
            <TabsContent value="enem" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Questões ENEM</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.enemStats.questions)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sessões ENEM</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(stats.enemStats.sessions + stats.enemStats.sessionsAlt)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Questões por Área</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.enemStats?.byArea?.slice(0, 10).map((item) => (
                        <div key={item.area} className="flex justify-between items-center">
                          <span className="text-sm">{item.area}</span>
                          <Badge variant="secondary">
                            {formatNumber(item._count?.area || 0)}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-sm text-muted-foreground">
                          Nenhum dado de área disponível
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Questões por Disciplina</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.enemStats?.byDisciplina?.slice(0, 10).map((item) => (
                        <div key={item.disciplina} className="flex justify-between items-center">
                          <span className="text-sm">{item.disciplina}</span>
                          <Badge variant="secondary">
                            {formatNumber(item._count?.disciplina || 0)}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-sm text-muted-foreground">
                          Nenhum dado de disciplina disponível
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Métricas de performance do banco de dados PostgreSQL (Neon)
                </AlertDescription>
              </Alert>
              {stats.dbPerformance?.tableStats?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Estatísticas das Tabelas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Tabela</th>
                            <th className="text-right p-2">Registros</th>
                            <th className="text-right p-2">Inserções</th>
                            <th className="text-right p-2">Atualizações</th>
                            <th className="text-right p-2">Exclusões</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.dbPerformance?.tableStats?.slice(0, 10).map((table: any, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{table.tablename}</td>
                              <td className="text-right p-2">{formatNumber(table.live_tuples || 0)}</td>
                              <td className="text-right p-2">{formatNumber(table.inserts || 0)}</td>
                              <td className="text-right p-2">{formatNumber(table.updates || 0)}</td>
                              <td className="text-right p-2">{formatNumber(table.deletes || 0)}</td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={5} className="p-2 text-center text-muted-foreground">
                                Nenhum dado de performance disponível
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Recent Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Conversas Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.recentActivity?.recentConversations?.map((conv) => (
                        <div key={conv.id} className="text-sm">
                          <div className="font-medium">{conv.module}</div>
                          <div className="text-muted-foreground">
                            {conv.model} • {conv.token_count} tokens
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(conv.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Analytics Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.recentActivity?.recentAnalytics?.map((analytics) => (
                        <div key={analytics.id} className="text-sm">
                          <div className="font-medium">{analytics.module}</div>
                          <div className="text-muted-foreground">
                            {analytics.tokens_used} tokens
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(analytics.date)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Usuários Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.recentActivity?.recentUsers?.map((user) => (
                        <div key={user.id} className="text-sm">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.role} • {formatDate(user.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
