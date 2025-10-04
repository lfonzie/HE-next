/**
 * Dashboard completo das estatísticas do NEON DB
 * Mostra uso de tokens, custos, aulas geradas etc.
 */

'use client';

import React from 'react';
import { useUserStats, useQuotaMonitor, useRecentActivity } from '@/lib/hooks/use-neon-real-time-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Zap, DollarSign, TrendingUp, Activity } from 'lucide-react';

interface NeonStatsDashboardProps {
  className?: string;
}

export function NeonStatsDashboard({ className = '' }: NeonStatsDashboardProps) {
  const { stats: userStats, loading: userStatsLoading } = useUserStats();
  const { 
    quotaStatus, 
    remainingTokens, 
    usagePercentage, 
    loading: quotaLoading 
  } = useQuotaMonitor();
  const { activities, loading: activitiesLoading } = useRecentActivity();

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getQuotaBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (value: number, currency: 'USD' | 'BRL' = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 4
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (userStatsLoading || quotaLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aulas Geradas</p>
              <p className="text-2xl font-bold text-blue-600">
                {userStats?.lessonsCount || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tokens Usados</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatNumber(userStats?.tokensUsed || 0)}
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custo Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(userStats?.costTotalBrl || 0, 'BRL')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tokens Restantes</p>
              <p className={`text-2xl font-bold ${getQuotaColor(usagePercentage)}`}>
                {formatNumber(remainingTokens)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Quota Usage */}
      {quotaStatus && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Uso da Quota Mensal
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Usado: {formatNumber(quotaStatus.token_used)} tokens</span>
              <span>Limite: {formatNumber(quotaStatus.token_limit)} tokens</span>
            </div>
            
            <Progress 
              value={usagePercentage} 
              className="h-3"
            />
            
            <div className="flex justify-between text-sm">
              <span className={getQuotaColor(usagePercentage)}>
                {usagePercentage.toFixed(1)}% utilizado
              </span>
              <span className="text-gray-500">
                {quotaStatus.month}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Atividades Recentes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Atividades Recentes
        </h3>
        
        <div className="space-y-3">
          {activitiesLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        activity.type.includes('lesson') ? 'default' :
                        activity.type.includes('complete') ? 'success' : 'secondary'
                      }
                    >
                      {activity.type.replace('_', ' ')}
                    </Badge>
                    <p className="font-medium">{activity.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 ml-2">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma atividade recente
            </p>
          )}
        </div>
      </Card>

      {/* Resumo Financeiro */}
      {userStats && userStats.costTotalUsd > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resumo Financeiro</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Custo Reais</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(userStats.costTotalBrl, 'BRL')}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Custo USD</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(userStats.costTotalUsd, 'USD')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default NeonStatsDashboard;
