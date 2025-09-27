'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  onAulaCreated?: (aula: { id: string; title: string }) => void;
  className?: string;
}

interface AulaData {
  id: string;
  title: string;
  topic: string;
  slides: Array<{
    id: string;
    title: string;
    content: string;
    type: 'content' | 'quiz' | 'activity';
  }>;
  createdAt: string;
  status: 'generating' | 'completed' | 'error';
}

export function AulaModal({ 
  isOpen, 
  onClose, 
  topic, 
  onAulaCreated,
  className = ''
}: AulaModalProps) {
  const router = useRouter();
  const [aulaData, setAulaData] = useState<AulaData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const handleGenerateAula = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentStep('Iniciando geração da aula...');

    try {
      // Simulate progress updates
      const progressSteps = [
        { step: 'Analisando o tópico...', progress: 20 },
        { step: 'Estruturando conteúdo...', progress: 40 },
        { step: 'Gerando slides...', progress: 60 },
        { step: 'Criando atividades...', progress: 80 },
        { step: 'Finalizando aula...', progress: 100 }
      ];

      for (const { step, progress: stepProgress } of progressSteps) {
        setCurrentStep(step);
        setProgress(stepProgress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const response = await fetch('/api/aulas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar a aula. Tente novamente.');
      }

      const data = await response.json();
      
      const aula: AulaData = {
        id: data.id || `aula-${Date.now()}`,
        title: data.title || `Aula sobre ${topic}`,
        topic: topic,
        slides: data.slides || [],
        createdAt: new Date().toISOString(),
        status: 'completed'
      };

      setAulaData(aula);
      
      if (onAulaCreated) {
        onAulaCreated({ id: aula.id, title: aula.title });
      }

    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao gerar a aula.');
      setAulaData({
        id: `error-${Date.now()}`,
        title: `Erro na aula sobre ${topic}`,
        topic: topic,
        slides: [],
        createdAt: new Date().toISOString(),
        status: 'error'
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const handleViewAula = () => {
    if (aulaData) {
      router.push(`/aulas/${aulaData.id}`);
      onClose();
    }
  };

  const handleRetry = () => {
    setError(null);
    setAulaData(null);
    handleGenerateAula();
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-surface-0 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Aula sobre: {topic}
                </h2>
                <p className="text-sm text-subtle">
                  Criação de aula personalizada com IA
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-subtle hover:text-foreground transition-colors p-2 hover:bg-surface-1 rounded-lg"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Erro ao gerar aula</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <h4 className="font-medium text-blue-800">Gerando sua aula...</h4>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-blue-700 mb-1">
                  <span>{currentStep}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              <p className="text-sm text-blue-600">
                Isso pode levar alguns minutos. Por favor, aguarde...
              </p>
            </div>
          )}

          {/* Success State */}
          {aulaData && aulaData.status === 'completed' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-800 mb-1">Aula criada com sucesso!</h4>
                  <p className="text-green-700 text-sm mb-3">
                    Sua aula "{aulaData.title}" foi gerada e está pronta para uso.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleViewAula}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Aula
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!aulaData && !isGenerating && !error && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quer criar uma aula sobre "{topic}"?
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Nossa IA irá gerar uma aula completa e interativa com slides, 
                  atividades e quizzes personalizados para este tópico.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">O que você receberá:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 14 slides estruturados e organizados</li>
                  <li>• Conteúdo baseado na BNCC</li>
                  <li>• Atividades interativas e quizzes</li>
                  <li>• Material adaptado para diferentes níveis</li>
                </ul>
              </div>
              
              <button
                onClick={handleGenerateAula}
                disabled={isGenerating}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 mx-auto"
                aria-label="Criar aula"
              >
                <BookOpen className="w-5 h-5" />
                Criar Aula Agora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
