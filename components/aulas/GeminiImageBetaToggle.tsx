// components/aulas/GeminiImageBetaToggle.tsx
import React, { useState, useEffect } from 'react';

interface GeminiImageBetaToggleProps {
  onToggle: (enabled: boolean) => void;
  initialEnabled?: boolean;
  className?: string;
}

interface BetaStatus {
  enabled: boolean;
  model: string;
  imageSlides: number[];
  maxRetries: number;
  timeout: number;
}

export function GeminiImageBetaToggle({ 
  onToggle, 
  initialEnabled = true, 
  className = '' 
}: GeminiImageBetaToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [betaStatus, setBetaStatus] = useState<BetaStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar status do sistema beta
  useEffect(() => {
    loadBetaStatus();
  }, []);

  const loadBetaStatus = async () => {
    try {
      const response = await fetch('/api/gemini/generate-lesson-images');
      if (response.ok) {
        const data = await response.json();
        setBetaStatus(data.betaStatus);
        setEnabled(data.betaStatus.enabled);
      }
    } catch (error) {
      console.error('Erro ao carregar status do sistema beta:', error);
    }
  };

  const handleToggle = async (newEnabled: boolean) => {
    setLoading(true);
    try {
      setEnabled(newEnabled);
      onToggle(newEnabled);
      
      // Atualizar status no servidor
      await fetch('/api/gemini/generate-lesson-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betaEnabled: newEnabled })
      });
      
    } catch (error) {
      console.error('Erro ao atualizar sistema beta:', error);
      // Reverter estado em caso de erro
      setEnabled(!newEnabled);
      onToggle(!newEnabled);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`gemini-beta-toggle ${className}`}>
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              Sistema Beta de Imagens Gemini
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {enabled ? 'ATIVADO' : 'DESATIVADO'}
            </span>
            
            {betaStatus && (
              <span className="text-xs text-gray-500">
                {betaStatus.model}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Slides com imagens:</span>
            <span className="ml-1">
              {betaStatus?.imageSlides.join(', ') || '1, 3, 6, 8, 11, 14'}
            </span>
          </div>
          
          <button
            onClick={() => handleToggle(!enabled)}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              enabled ? 'bg-blue-600' : 'bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {enabled && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-blue-700">
              <p className="font-medium">Sistema Beta Ativado</p>
              <p className="mt-1">
                As imagens serão geradas automaticamente usando Google Gemini 2.5 Nano Banana 
                com prompts em inglês para os slides selecionados.
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
                <li>Geração automática de imagens educacionais</li>
                <li>Prompts otimizados em inglês</li>
                <li>Fallback para imagens de placeholder em caso de erro</li>
                <li>Sistema pode ser desativado a qualquer momento</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!enabled && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Sistema Beta Desativado</p>
              <p className="mt-1">
                As aulas serão criadas sem geração automática de imagens. 
                Você pode ativar o sistema beta a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeminiImageBetaToggle;
