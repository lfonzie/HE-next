// components/LiquidTransferPanel.tsx - Sistema de transferência de líquidos
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Droplet, 
  Pipette, 
  Beaker, 
  Calculator,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';

interface LiquidTransfer {
  id: string;
  fromContainer: string;
  toContainer: string;
  volume: number;
  unit: string;
  precision: 'precise' | 'approximate';
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  timestamp: number;
}

interface Container {
  id: string;
  name: string;
  type: 'beaker' | 'erlenmeyer' | 'burette' | 'pipette' | 'flask';
  capacity: number;
  currentVolume: number;
  contents: {
    formula: string;
    concentration: number;
    unit: string;
    pH?: number;
  }[];
}

interface LiquidTransferPanelProps {
  containers: Container[];
  onTransfer: (transfer: LiquidTransfer) => void;
  onUpdateContainer: (containerId: string, newVolume: number) => void;
  onCalculateConcentration: (fromContainer: string, toContainer: string, volume: number) => void;
}

export const LiquidTransferPanel: React.FC<LiquidTransferPanelProps> = ({
  containers,
  onTransfer,
  onUpdateContainer,
  onCalculateConcentration
}) => {
  const [selectedFrom, setSelectedFrom] = useState<string>('');
  const [selectedTo, setSelectedTo] = useState<string>('');
  const [transferVolume, setTransferVolume] = useState<number>(0);
  const [transferUnit, setTransferUnit] = useState<string>('mL');
  const [precisionMode, setPrecisionMode] = useState<'precise' | 'approximate'>('precise');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferHistory, setTransferHistory] = useState<LiquidTransfer[]>([]);
  const [calculatedConcentration, setCalculatedConcentration] = useState<any>(null);

  const availableContainers = containers.filter(c => c.currentVolume > 0);
  const targetContainers = containers;

  const handleTransfer = async () => {
    if (!selectedFrom || !selectedTo || transferVolume <= 0) return;

    const fromContainer = containers.find(c => c.id === selectedFrom);
    const toContainer = containers.find(c => c.id === selectedTo);

    if (!fromContainer || !toContainer) return;

    // Verificar se há volume suficiente
    if (fromContainer.currentVolume < transferVolume) {
      alert('Volume insuficiente no recipiente de origem');
      return;
    }

    // Verificar se o recipiente de destino tem capacidade suficiente
    if (toContainer.currentVolume + transferVolume > toContainer.capacity) {
      alert('Recipiente de destino não tem capacidade suficiente');
      return;
    }

    setIsTransferring(true);

    const transfer: LiquidTransfer = {
      id: `transfer_${Date.now()}`,
      fromContainer: selectedFrom,
      toContainer: selectedTo,
      volume: transferVolume,
      unit: transferUnit,
      precision: precisionMode,
      status: 'in_progress',
      timestamp: Date.now()
    };

    setTransferHistory(prev => [transfer, ...prev]);

    // Simular transferência com animação
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Atualizar volumes
    onUpdateContainer(selectedFrom, fromContainer.currentVolume - transferVolume);
    onUpdateContainer(selectedTo, toContainer.currentVolume + transferVolume);

    // Calcular nova concentração
    const newConcentration = onCalculateConcentration(selectedFrom, selectedTo, transferVolume);
    setCalculatedConcentration(newConcentration);

    // Marcar como concluído
    setTransferHistory(prev => 
      prev.map(t => t.id === transfer.id ? { ...t, status: 'completed' } : t)
    );

    setIsTransferring(false);

    // Reset form
    setTransferVolume(0);
  };

  const calculateDilution = () => {
    if (!selectedFrom || !selectedTo || transferVolume <= 0) return;

    const fromContainer = containers.find(c => c.id === selectedFrom);
    const toContainer = containers.find(c => c.id === selectedTo);

    if (!fromContainer || !toContainer || !fromContainer.contents[0]) return;

    const initialConcentration = fromContainer.contents[0].concentration;
    const initialVolume = toContainer.currentVolume;
    const addedVolume = transferVolume;

    // Cálculo de diluição: C1V1 = C2V2
    const finalVolume = initialVolume + addedVolume;
    const finalConcentration = (initialConcentration * addedVolume) / finalVolume;

    return {
      initialConcentration,
      initialVolume,
      addedVolume,
      finalVolume,
      finalConcentration,
      dilutionFactor: finalVolume / addedVolume
    };
  };

  const dilutionResult = calculateDilution();

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Pipette className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Transferência de Líquidos</h3>
      </div>

      {/* Seleção de recipientes */}
      <div className="space-y-4 mb-6">
        {/* Recipiente de origem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            De (Origem)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableContainers.map(container => (
              <button
                key={container.id}
                onClick={() => setSelectedFrom(container.id)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedFrom === container.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Beaker className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">{container.name}</p>
                    <p className="text-xs text-gray-500">
                      {container.currentVolume.toFixed(1)} / {container.capacity} mL
                    </p>
                    {container.contents[0] && (
                      <p className="text-xs text-blue-600">
                        {container.contents[0].formula} {container.contents[0].concentration} {container.contents[0].unit}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipiente de destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Para (Destino)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {targetContainers.map(container => (
              <button
                key={container.id}
                onClick={() => setSelectedTo(container.id)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedTo === container.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                  <div className="flex items-center space-x-2">
                    <Beaker className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">{container.name}</p>
                      <p className="text-xs text-gray-500">
                        {container.currentVolume.toFixed(1)} / {container.capacity} mL
                      </p>
                      {container.contents[0] && (
                        <p className="text-xs text-blue-600">
                          {container.contents[0].formula} {container.contents[0].concentration} {container.contents[0].unit}
                        </p>
                      )}
                    </div>
                  </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Configuração da transferência */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={transferVolume}
                onChange={(e) => setTransferVolume(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0"
                max="1000"
                disabled={isTransferring}
              />
              <select
                value={transferUnit}
                onChange={(e) => setTransferUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isTransferring}
              >
                <option value="mL">mL</option>
                <option value="μL">μL</option>
                <option value="L">L</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modo
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setPrecisionMode('precise')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  precisionMode === 'precise'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isTransferring}
              >
                Preciso
              </button>
              <button
                onClick={() => setPrecisionMode('approximate')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  precisionMode === 'approximate'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isTransferring}
              >
                Aproximado
              </button>
            </div>
          </div>
        </div>

        {/* Cálculo de diluição */}
        {dilutionResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-800">Cálculo de Diluição</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Concentração inicial:</p>
                <p className="font-mono">{dilutionResult.initialConcentration} M</p>
              </div>
              <div>
                <p className="text-gray-600">Volume inicial:</p>
                <p className="font-mono">{dilutionResult.initialVolume.toFixed(1)} mL</p>
              </div>
              <div>
                <p className="text-gray-600">Volume adicionado:</p>
                <p className="font-mono">{dilutionResult.addedVolume.toFixed(1)} mL</p>
              </div>
              <div>
                <p className="text-gray-600">Volume final:</p>
                <p className="font-mono">{dilutionResult.finalVolume.toFixed(1)} mL</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Concentração final:</p>
                <p className="font-mono text-lg font-bold text-blue-600">
                  {dilutionResult.finalConcentration.toFixed(4)} M
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botão de transferência */}
      <div className="mb-6">
        <button
          onClick={handleTransfer}
          disabled={!selectedFrom || !selectedTo || transferVolume <= 0 || isTransferring}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {isTransferring ? (
            <>
              <Pause className="h-4 w-4 animate-spin" />
              <span>Transferindo...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Transferir Líquido</span>
            </>
          )}
        </button>
      </div>

      {/* Histórico de transferências */}
      <div className="flex-1 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Histórico de Transferências</h4>
        <div className="space-y-2">
          {transferHistory.slice(0, 10).map(transfer => (
            <motion.div
              key={transfer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 border rounded-lg ${
                transfer.status === 'completed' ? 'border-green-200 bg-green-50' :
                transfer.status === 'in_progress' ? 'border-blue-200 bg-blue-50' :
                transfer.status === 'error' ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {transfer.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {transfer.status === 'in_progress' && <Pause className="h-4 w-4 text-blue-600 animate-spin" />}
                  {transfer.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  <span className="text-sm font-medium">
                    {transfer.volume} {transfer.unit} ({transfer.precision})
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(transfer.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {containers.find(c => c.id === transfer.fromContainer)?.name} → {containers.find(c => c.id === transfer.toContainer)?.name}
              </p>
            </motion.div>
          ))}
        </div>

        {transferHistory.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Droplet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhuma transferência realizada</p>
          </div>
        )}
      </div>

      {/* Ações rápidas */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedFrom('');
              setSelectedTo('');
              setTransferVolume(0);
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Limpar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
