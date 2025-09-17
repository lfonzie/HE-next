"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Calendar, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface DatabaseInfo {
  success: boolean;
  available: boolean;
  data?: {
    years: number[];
    areas: string[];
    yearDetails: Array<{
      year: number;
      title: string;
      disciplines: Array<{
        label: string;
        value: string;
      }>;
      languages: Array<{
        label: string;
        value: string;
      }>;
      totalQuestions: number;
    }>;
    totalYears: number;
    totalAreas: number;
  };
  error?: string;
}

export function EnemDatabaseInfo() {
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enem/local-data');
      const data = await response.json();
      setDatabaseInfo(data);
    } catch (error) {
      console.error('Error fetching database info:', error);
      setDatabaseInfo({
        success: false,
        available: false,
        error: 'Failed to fetch database information'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Carregando informações do banco...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!databaseInfo?.available) {
    return (
      <Card className="w-full border-orange-200 bg-orange-50">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-orange-800">
            <AlertCircle className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Banco de Questões Não Disponível</h3>
              <p className="text-sm text-orange-700">
                {databaseInfo?.error || 'O banco local de questões do ENEM não foi encontrado.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data } = databaseInfo;

  return (
    <div className="space-y-6">
      {/* Database Status */}
      <Card className="w-full border-green-200 bg-green-50">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Banco de Questões ENEM Disponível</h3>
              <p className="text-sm text-green-700">
                {data?.totalYears} anos disponíveis • {data?.totalAreas} áreas do conhecimento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Years Available */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Anos Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data?.years.map(year => (
              <Badge key={year} variant="outline" className="text-sm">
                ENEM {year}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Total: {data?.totalYears} anos de questões oficiais do ENEM
          </p>
        </CardContent>
      </Card>

      {/* Areas Available */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Áreas do Conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data?.areas.map(area => {
              const areaLabels: Record<string, string> = {
                'linguagens': 'Linguagens',
                'ciencias-humanas': 'Ciências Humanas',
                'ciencias-natureza': 'Ciências da Natureza',
                'matematica': 'Matemática'
              };
              
              return (
                <div key={area} className="text-center p-3 bg-gray-50 rounded-lg">
                  <Badge variant="secondary" className="mb-2">
                    {areaLabels[area] || area}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estatísticas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.yearDetails.slice(0, 5).map(yearDetail => (
              <div key={yearDetail.year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">ENEM {yearDetail.year}</h4>
                  <p className="text-sm text-gray-600">
                    {yearDetail.totalQuestions} questões • {yearDetail.disciplines.length} áreas
                  </p>
                </div>
                <Badge variant="outline">
                  {yearDetail.totalQuestions} questões
                </Badge>
              </div>
            ))}
            
            {data && data.yearDetails.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                ... e mais {data.yearDetails.length - 5} anos disponíveis
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6">
          <div className="text-center">
            <h3 className="font-semibold text-blue-800 mb-2">
              Como Funciona
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              O simulador seleciona automaticamente questões oficiais do ENEM baseadas nas áreas 
              e quantidade solicitadas, garantindo um simulado autêntico e representativo.
            </p>
            <div className="flex justify-center gap-4 text-xs text-blue-600">
              <span>✓ Questões Reais</span>
              <span>✓ Seleção Aleatória</span>
              <span>✓ Balanceamento por Área</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
