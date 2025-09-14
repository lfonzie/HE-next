'use client';

import { useState } from 'react';
import { useModuleRouter } from '@/lib/useModuleRouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RouterDemo() {
  const [inputText, setInputText] = useState('');
  const { response, loading, error, classifyMessage, handleModuleChange } = useModuleRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      await classifyMessage(inputText.trim());
    }
  };

  const testMessages = [
    "Quero 20 questões de matemática do ENEM com tempo 30min",
    "Não consigo abrir a página, dá erro 404",
    "Quanto fica a mensalidade com 30% de bolsa?",
    "Preciso fazer minha matrícula na secretaria",
    "Como criar uma aula sobre física?",
    "Build falhou no Render, preciso de ajuda"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Module Router Demo</CardTitle>
          <CardDescription>
            Test the intelligent module classification system that routes messages to the appropriate module handlers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma mensagem para classificar..."
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !inputText.trim()}>
              {loading ? 'Classificando...' : 'Classificar'}
            </Button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">Erro: {error}</p>
            </div>
          )}

          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Resultado da Classificação
                  <Badge variant={response.confidence >= 0.7 ? 'default' : 'secondary'}>
                    {Math.round(response.confidence * 100)}% confiança
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Módulo:</p>
                    <p className="font-semibold capitalize">{response.module_id.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Intent:</p>
                    <p className="font-semibold">{response.intent}</p>
                  </div>
                </div>
                
                {response.entities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entidades:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {response.entities.map((entity, index) => (
                        <Badge key={index} variant="outline">{entity}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600">Justificativa:</p>
                  <p className="text-sm">{response.rationale}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Trace ID:</p>
                  <p className="text-xs font-mono">{response.trace_id}</p>
                </div>

                {response.confidence < 0.7 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      Baixa confiança. Sugestões: ENEM, Secretaria, TI Suporte
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Mensagens de teste:</p>
            <div className="flex flex-wrap gap-2">
              {testMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInputText(message);
                    classifyMessage(message);
                  }}
                  disabled={loading}
                >
                  {message.substring(0, 30)}...
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
