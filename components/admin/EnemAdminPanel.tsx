"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Users,
  BarChart3
} from 'lucide-react';

interface EnemStats {
  totalItems: number;
  totalSessions: number;
  totalUsers: number;
  itemsByYear: { [year: string]: number };
  itemsByArea: { [area: string]: number };
  recentSessions: number;
}

export function EnemAdminPanel() {
  const { toast } = useToast();
  const [stats, setStats] = useState<EnemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/enem/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleConvertData = async () => {
    setIsConverting(true);
    try {
      const response = await fetch('/api/admin/enem/convert-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Conversão concluída!',
          description: 'Dados existentes convertidos com sucesso.',
        });
      } else {
        toast({
          title: 'Erro na conversão',
          description: result.error || 'Falha ao converter dados.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro na conversão',
        description: error.message || 'Falha ao converter dados.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const response = await fetch('/api/admin/enem/import-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Importação concluída!',
          description: `Importados ${result.imported_items} itens com sucesso.`,
        });
        await fetchStats();
      } else {
        toast({
          title: 'Erro na importação',
          description: result.error || 'Falha ao importar dados.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro na importação',
        description: error.message || 'Falha ao importar dados.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-700">Carregando estatísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo - ENEM</h1>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Questões disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuários únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Sistema operacional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Área */}
      {stats?.itemsByArea && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.itemsByArea).map(([area, count]) => (
                <div key={area} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{area}</span>
                    <span>{count} questões</span>
                  </div>
                  <Progress 
                    value={(count / stats.totalItems) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Administrativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-2">Conversão de Dados Existentes</h3>
              <p className="text-sm text-blue-700 mb-4">
                Converte os dados existentes de QUESTOES_ENEM para o novo formato do sistema.
                Execute esta ação antes da primeira importação.
              </p>
              <Button 
                onClick={handleConvertData} 
                disabled={isConverting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Convertendo...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Converter Dados
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <h3 className="font-semibold text-green-900 mb-2">Importação para Banco de Dados</h3>
              <p className="text-sm text-green-700 mb-4">
                Importa os dados convertidos para o banco de dados PostgreSQL.
                Execute após a conversão dos dados.
              </p>
              <Button 
                onClick={handleImportData} 
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar para BD
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Ano */}
      {stats?.itemsByYear && (
        <Card>
          <CardHeader>
            <CardTitle>Questões por Ano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(stats.itemsByYear)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, count]) => (
                  <div key={year} className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{year}</div>
                    <div className="text-sm text-gray-600">{count} questões</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
