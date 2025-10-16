'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TIResolutionSteps } from './TIResolutionSteps';
import { Laptop, Wrench, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export function TIModal({ isOpen, onClose, initialMessage }: TIModalProps) {
  console.log(`🔧 [TI-MODAL-PROPS] Modal props:`, { isOpen, initialMessage });
  
  const [problemDescription, setProblemDescription] = useState('');
  const [tiData, setTiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepId, setLoadingStepId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Função para comunicar diretamente com a IA
  const sendToAI = useCallback(async (message: string, isStepUpdate: boolean = false) => {
    if (!isStepUpdate) {
      setIsLoading(true);
    }
    try {
      const response = await fetch('/api/chat/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'grok',
          model: 'grok-4-fast-reasoning',
          input: message,
          module: 'ti'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com a IA');
      }

      const data = await response.json();
      
      // Tentar parsear como JSON primeiro
      try {
        const jsonData = JSON.parse(data.reply);
        setTiData(jsonData);
      } catch {
        // Se não for JSON, criar estrutura básica
        setTiData({
          problema: message,
          status: 'ativo',
          etapas: [
            {
              id: 1,
              titulo: "Análise do problema",
              descricao: data.reply,
              status: 'pendente',
              validacao: "Analise a resposta e continue com os próximos passos"
            }
          ],
          proxima_acao: "Continue com a resolução do problema"
        });
      }
    } catch (error) {
      console.error('Erro ao comunicar com IA:', error);
      // Criar dados de fallback
      setTiData({
        problema: message,
        status: 'ativo',
        etapas: [
          {
            id: 1,
            titulo: "Problema identificado",
            descricao: "Houve um erro na comunicação. Tente novamente.",
            status: 'pendente',
            validacao: "Tente descrever o problema novamente"
          }
        ],
        proxima_acao: "Tente novamente"
      });
    } finally {
      if (!isStepUpdate) {
        setIsLoading(false);
      }
    }
  }, []);

  // Effect para processar mensagem inicial automaticamente
  React.useEffect(() => {
    console.log(`🔧 [TI-MODAL-DEBUG] useEffect triggered:`, {
      isOpen,
      initialMessage,
      hasTiData: !!tiData
    });
    
    if (isOpen && initialMessage) {
      console.log(`🔧 [TI-MODAL] Auto-processing initial message: "${initialMessage}"`);
      sendToAI(initialMessage);
    }
  }, [isOpen, initialMessage, sendToAI]);

  // Effect para resetar estado quando modal fecha
  React.useEffect(() => {
    if (!isOpen) {
      setTiData(null);
      setProblemDescription('');
      setLoadingStepId(null);
    }
  }, [isOpen]);

  const handleSendProblem = () => {
    if (problemDescription.trim()) {
      sendToAI(problemDescription.trim());
      setProblemDescription('');
    }
  };

  const handleStepComplete = useCallback(async (stepId: number, success: boolean = true) => {
    if (!tiData) return;

    // Definir loading para esta etapa específica
    setLoadingStepId(stepId);
    
    const message = success
      ? `Etapa ${stepId} funcionou. Problema resolvido.`
      : `Etapa ${stepId} não funcionou. Ainda há problemas. Forneça a próxima solução em formato JSON estruturado.`;

    try {
      await sendToAI(message, true);
    } finally {
      // Limpar loading da etapa
      setLoadingStepId(null);
    }
  }, [tiData, sendToAI]);

  const isInitialState = !tiData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Laptop className="text-white text-sm w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Resolução de Problemas Técnicos</h2>
              <p className="text-sm text-muted-foreground">Suporte técnico passo a passo</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isInitialState ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Descreva seu problema técnico</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Para iniciar o processo de resolução, descreva detalhadamente o problema que você está enfrentando.
                </p>
                <Textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Ex: Minha impressora HP não está imprimindo desde ontem. Quando tento imprimir, aparece erro 'Impressora não encontrada'..."
                  className="min-h-[100px] mb-4"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendProblem}
                    disabled={!problemDescription.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? 'Processando...' : 'Enviar Problema'}
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <TIResolutionSteps
              data={tiData}
              onStepComplete={handleStepComplete}
              isLoading={isLoading}
              loadingStepId={loadingStepId}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
