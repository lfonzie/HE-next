'use client';

import React, { useState, useCallback } from 'react';
import { CheckCircle, Circle, Play, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TIResolutionData {
  problema: string;
  status: 'ativo' | 'resolvido';
  etapas: Array<{
    id: number;
    titulo: string;
    descricao: string;
    comando?: string;
    status: 'pendente' | 'executando' | 'concluido' | 'falhou';
    validacao?: string;
  }>;
  proxima_acao?: string;
}

interface TIResolutionStepsProps {
  data: TIResolutionData;
  onStepComplete: (stepId: number, success?: boolean) => void;
  isLoading?: boolean;
  loadingStepId?: number | null;
}

export function TIResolutionSteps({ data, onStepComplete, isLoading, loadingStepId }: TIResolutionStepsProps) {

  const getStatusIcon = (status: string, stepId: number) => {
    // Se esta etapa está sendo processada, mostrar loading
    if (loadingStepId === stepId) {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'executando':
        return <Play className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'falhou':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string, stepId: number) => {
    // Se esta etapa está sendo processada, usar cor de loading
    if (loadingStepId === stepId) {
      return 'bg-blue-100 border-blue-200';
    }
    
    switch (status) {
      case 'concluido':
        return 'bg-green-100 border-green-200';
      case 'executando':
        return 'bg-blue-100 border-blue-200';
      case 'falhou':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com problema identificado */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Problema Identificado
            </CardTitle>
            <Badge variant={data.status === 'resolvido' ? 'default' : 'secondary'}>
              {data.status === 'resolvido' ? 'Resolvido' : 'Em Andamento'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{data.problema}</p>
        </CardContent>
      </Card>

      {/* Etapas de resolução */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Etapas de Resolução</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.etapas.map((etapa) => (
            <div
              key={etapa.id}
              className={`border rounded-lg p-4 transition-all ${getStatusColor(etapa.status, etapa.id)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getStatusIcon(etapa.status, etapa.id)}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {etapa.id}. {etapa.titulo}
                    </h4>
                    <Badge variant={
                      etapa.status === 'concluido' ? 'default' :
                      etapa.status === 'executando' ? 'secondary' :
                      etapa.status === 'falhou' ? 'destructive' : 'outline'
                    }>
                      {etapa.status}
                    </Badge>
                  </div>

                  <p className="text-gray-700 text-sm">{etapa.descricao}</p>

                  {etapa.comando && (
                    <div className="bg-gray-800 text-gray-100 p-3 rounded font-mono text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">COMANDO:</span>
                      </div>
                      {etapa.comando}
                    </div>
                  )}

                  {etapa.validacao && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm font-medium text-green-800 mb-1">✅ Validação:</p>
                      <p className="text-sm text-green-700">{etapa.validacao}</p>
                    </div>
                  )}

                  {/* Botões de ação */}
                  {etapa.status === 'pendente' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onStepComplete(etapa.id, true)}
                        disabled={isLoading || loadingStepId === etapa.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {loadingStepId === etapa.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Funcionou'
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onStepComplete(etapa.id, false)}
                        disabled={isLoading || loadingStepId === etapa.id}
                        className="flex-1"
                      >
                        {loadingStepId === etapa.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Ainda com Problemas'
                        )}
                      </Button>
                    </div>
                  )}

                  {etapa.status === 'executando' && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-700">
                        <strong>Executando...</strong> Aguarde a conclusão desta etapa.
                      </p>
                    </div>
                  )}

                  {loadingStepId === etapa.id && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        <p className="text-sm text-blue-700">
                          <strong>Processando feedback...</strong> Aguarde enquanto analisamos sua resposta.
                        </p>
                      </div>
                    </div>
                  )}

                  {etapa.status === 'concluido' && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm text-green-700">
                        <strong>✅ Concluído!</strong> Esta etapa foi finalizada com sucesso.
                      </p>
                    </div>
                  )}

                  {etapa.status === 'falhou' && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-700">
                        <strong>❌ Falhou</strong> Houve um problema nesta etapa. Tente novamente.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}

