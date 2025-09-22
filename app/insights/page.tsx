'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Play, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface SQLInsight {
  id: string;
  name: string;
  description: string;
  query: string;
  category: 'performance' | 'business' | 'users' | 'ai' | 'cost';
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  enabled: boolean;
}

interface InsightResult {
  insight: SQLInsight;
  data: any[];
  executedAt: Date;
  executionTime: number;
  error?: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<SQLInsight[]>([]);
  const [results, setResults] = useState<InsightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insights');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setInsights(result.insights);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeInsight = async (insightId: string) => {
    try {
      setExecuting(insightId);
      const response = await fetch(`/api/insights?id=${insightId}&execute=true`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      
      // Atualizar resultados
      setResults(prev => {
        const filtered = prev.filter(r => r.insight.id !== insightId);
        return [...filtered, result.result];
      });
    } catch (err) {
      console.error('Erro ao executar insight:', err);
    } finally {
      setExecuting(null);
    }
  };

  const executeAllInsights = async () => {
    try {
      setExecuting('all');
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute_all' })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setResults(result.results);
    } catch (err) {
      console.error('Erro ao executar todos os insights:', err);
    } finally {
      setExecuting(null);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'business': return <DollarSign className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'ai': return <Brain className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'users': return 'bg-purple-100 text-purple-800';
      case 'ai': return 'bg-orange-100 text-orange-800';
      case 'cost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'realtime': return 'bg-green-100 text-green-800';
      case 'hourly': return 'bg-blue-100 text-blue-800';
      case 'daily': return 'bg-yellow-100 text-yellow-800';
      case 'weekly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTableData = (data: any[]) => {
    if (!data || data.length === 0) {
      return <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>;
    }

    const columns = Object.keys(data[0]);
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 10).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <p className="text-xs text-gray-500 text-center py-2">
            Mostrando 10 de {data.length} registros
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Carregando insights...</span>
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
              <span className="text-red-700">Erro ao carregar insights: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = ['performance', 'business', 'users', 'ai', 'cost'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SQL Insights</h1>
            <p className="text-gray-600 mt-1">
              Análises avançadas com queries SQL customizadas
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={executeAllInsights}
              disabled={executing === 'all'}
              className="flex items-center space-x-2"
            >
              {executing === 'all' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>Executar Todos</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="grid gap-6">
                {insights
                  .filter(insight => insight.category === category)
                  .map(insight => {
                    const result = results.find(r => r.insight.id === insight.id);
                    const isExecuting = executing === insight.id;

                    return (
                      <Card key={insight.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(insight.category)}
                              <div>
                                <CardTitle className="text-lg">{insight.name}</CardTitle>
                                <CardDescription>{insight.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getCategoryColor(insight.category)}>
                                {insight.category}
                              </Badge>
                              <Badge className={getFrequencyColor(insight.frequency)}>
                                {insight.frequency}
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => executeInsight(insight.id)}
                                disabled={isExecuting}
                              >
                                {isExecuting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {result ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>
                                  Executado em {result.executedAt.toLocaleString()}
                                </span>
                                <span>
                                  {result.executionTime}ms
                                </span>
                              </div>
                              
                              {result.error ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                  <div className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                                    <span className="text-red-700">Erro: {result.error}</span>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                      Resultados ({result.data.length} registros)
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="text-sm text-green-600">Sucesso</span>
                                    </div>
                                  </div>
                                  {renderTableData(result.data)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>Clique em executar para ver os resultados</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))}

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6">
              {insights.map(insight => {
                const result = results.find(r => r.insight.id === insight.id);
                const isExecuting = executing === insight.id;

                return (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(insight.category)}
                          <div>
                            <CardTitle className="text-lg">{insight.name}</CardTitle>
                            <CardDescription>{insight.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(insight.category)}>
                            {insight.category}
                          </Badge>
                          <Badge className={getFrequencyColor(insight.frequency)}>
                            {insight.frequency}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => executeInsight(insight.id)}
                            disabled={isExecuting}
                          >
                            {isExecuting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {result ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>
                              Executado em {result.executedAt.toLocaleString()}
                            </span>
                            <span>
                              {result.executionTime}ms
                            </span>
                          </div>
                          
                          {result.error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-red-700">Erro: {result.error}</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  Resultados ({result.data.length} registros)
                                </span>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-sm text-green-600">Sucesso</span>
                                </div>
                              </div>
                              {renderTableData(result.data)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Clique em executar para ver os resultados</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
