// components/admin/GeminiBetaAdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { Settings, ToggleLeft, ToggleRight, RefreshCw, AlertCircle, CheckCircle, Info, Save } from 'lucide-react';

interface BetaStatus {
  enabled: boolean;
  model: string;
  imageSlides: number[];
  maxRetries: number;
  timeout: number;
  lastUpdated: string;
  stats: {
    totalRequests: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageGenerationTime: number;
  };
}

interface GeminiBetaAdminPanelProps {
  className?: string;
}

export function GeminiBetaAdminPanel({ className = '' }: GeminiBetaAdminPanelProps) {
  const [betaStatus, setBetaStatus] = useState<BetaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editConfig, setEditConfig] = useState<Partial<BetaStatus>>({});

  // Carregar status inicial
  useEffect(() => {
    loadBetaStatus();
  }, []);

  const loadBetaStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/gemini/beta-control');
      if (!response.ok) {
        throw new Error('Failed to load beta status');
      }

      const data = await response.json();
      setBetaStatus(data.betaStatus);

    } catch (err) {
      console.error('Error loading beta status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBetaSystem = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/gemini/beta-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: enabled ? 'enable' : 'disable' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle beta system');
      }

      const data = await response.json();
      setBetaStatus(data.betaStatus);
      setSuccessMessage(data.message);

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Error toggling beta system:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/gemini/beta-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'config',
          config: editConfig
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update config');
      }

      const data = await response.json();
      setBetaStatus(data.betaStatus);
      setEditConfig({});
      setIsEditing(false);
      setSuccessMessage(data.message);

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Error updating config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    if (betaStatus) {
      setEditConfig({
        model: betaStatus.model,
        imageSlides: [...betaStatus.imageSlides],
        maxRetries: betaStatus.maxRetries,
        timeout: betaStatus.timeout
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setEditConfig({});
    setIsEditing(false);
  };

  if (isLoading && !betaStatus) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Carregando status do sistema beta...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sistema Beta de Imagens Gemini
              </h3>
              <p className="text-sm text-gray-600">
                Controle manual do sistema de geração de imagens
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={loadBetaStatus}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status Principal */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${betaStatus?.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Status: {betaStatus?.enabled ? 'ATIVADO' : 'DESATIVADO'}
                </h4>
                <p className="text-sm text-gray-600">
                  Modelo: {betaStatus?.model || 'N/A'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => toggleBetaSystem(!betaStatus?.enabled)}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                betaStatus?.enabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {betaStatus?.enabled ? (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Desativar</span>
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Ativar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configurações */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Configurações</h4>
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={updateConfig}
                  disabled={isLoading}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span>Salvar</span>
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slides com Imagens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slides com Imagens
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editConfig.imageSlides?.join(', ') || ''}
                  onChange={(e) => {
                    const values = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                    setEditConfig(prev => ({ ...prev, imageSlides: values }));
                  }}
                  placeholder="1, 3, 6, 8, 11, 14"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-700">
                    {betaStatus?.imageSlides.join(', ') || 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo Gemini
              </label>
              {isEditing ? (
                <select
                  value={editConfig.model || ''}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-700">
                    {betaStatus?.model || 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {/* Max Retries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Tentativas
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editConfig.maxRetries || ''}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-700">
                    {betaStatus?.maxRetries || 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (ms)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editConfig.timeout || ''}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                  min="5000"
                  max="60000"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-700">
                    {betaStatus?.timeout || 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {betaStatus?.stats && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Estatísticas</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {betaStatus.stats.totalRequests}
                </div>
                <div className="text-sm text-gray-600">Total de Requisições</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {betaStatus.stats.successfulGenerations}
                </div>
                <div className="text-sm text-gray-600">Sucessos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {betaStatus.stats.failedGenerations}
                </div>
                <div className="text-sm text-gray-600">Falhas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {betaStatus.stats.averageGenerationTime}ms
                </div>
                <div className="text-sm text-gray-600">Tempo Médio</div>
              </div>
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Sobre o Sistema Beta</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Gera imagens automaticamente usando Google Gemini 2.5 Nano Banana</li>
                <li>Prompts são traduzidos automaticamente para inglês</li>
                <li>Sistema de fallback para imagens de placeholder em caso de erro</li>
                <li>Pode ser ativado/desativado a qualquer momento</li>
                <li>Configurações podem ser ajustadas conforme necessário</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeminiBetaAdminPanel;
