// components/InstrumentsPanel.tsx - Painel de instrumentos de medição
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Thermometer, 
  Activity, 
  Zap, 
  Scale, 
  Clock, 
  Eye,
  BarChart3,
  Download
} from 'lucide-react';

interface Measurement {
  timestamp: number;
  value: number;
  unit: string;
  instrument: string;
}

interface InstrumentsPanelProps {
  measurements: Measurement[];
  onAddMeasurement: (instrument: string, value: number, unit: string) => void;
  onClearMeasurements: () => void;
  onExportData: () => void;
}

export const InstrumentsPanel: React.FC<InstrumentsPanelProps> = ({
  measurements,
  onAddMeasurement,
  onClearMeasurements,
  onExportData
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [showDataLogger, setShowDataLogger] = useState(false);

  const instruments = [
    { id: 'thermometer', name: 'Termômetro', icon: Thermometer, unit: '°C', color: 'red' },
    { id: 'phmeter', name: 'pHmetro', icon: Activity, unit: 'pH', color: 'blue' },
    { id: 'voltmeter', name: 'Voltímetro', icon: Zap, unit: 'V', color: 'green' },
    { id: 'ammeter', name: 'Amperímetro', icon: Zap, unit: 'A', color: 'yellow' },
    { id: 'balance', name: 'Balança', icon: Scale, unit: 'g', color: 'purple' },
    { id: 'timer', name: 'Cronômetro', icon: Clock, unit: 's', color: 'orange' },
    { id: 'ruler', name: 'Régua', icon: Eye, unit: 'cm', color: 'gray' }
  ];

  const handleMeasure = (instrument: typeof instruments[0]) => {
    // Simular medição com valor aleatório baseado no instrumento
    let value: number;
    switch (instrument.id) {
      case 'thermometer':
        value = 20 + Math.random() * 20; // 20-40°C
        break;
      case 'phmeter':
        value = 1 + Math.random() * 13; // pH 1-14
        break;
      case 'voltmeter':
        value = Math.random() * 12; // 0-12V
        break;
      case 'ammeter':
        value = Math.random() * 2; // 0-2A
        break;
      case 'balance':
        value = Math.random() * 100; // 0-100g
        break;
      case 'timer':
        value = Math.random() * 60; // 0-60s
        break;
      case 'ruler':
        value = Math.random() * 30; // 0-30cm
        break;
      default:
        value = Math.random() * 10;
    }

    onAddMeasurement(instrument.id, value, instrument.unit);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMeasurementsByInstrument = (instrumentId: string) => {
    return measurements.filter(m => m.instrument === instrumentId);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Instrumentos</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDataLogger(!showDataLogger)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <button
            onClick={onExportData}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lista de instrumentos */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {instruments.map(instrument => {
          const recentMeasurements = getMeasurementsByInstrument(instrument.id);
          const lastMeasurement = recentMeasurements[recentMeasurements.length - 1];
          
          return (
            <motion.div
              key={instrument.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMeasure(instrument)}
              className={`bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedInstrument === instrument.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${instrument.color}-100 text-${instrument.color}-600`}>
                  <instrument.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800">{instrument.name}</h4>
                  {lastMeasurement && (
                    <p className="text-lg font-mono text-gray-900">
                      {lastMeasurement.value.toFixed(2)} {instrument.unit}
                    </p>
                  )}
                </div>
              </div>
              
              {recentMeasurements.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {recentMeasurements.length} medição(ões)
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Data Logger */}
      <AnimatePresence>
        {showDataLogger && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-800">Data Logger</h4>
              <button
                onClick={onClearMeasurements}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Limpar dados
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {measurements.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhuma medição registrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {measurements.slice(-20).reverse().map((measurement, index) => {
                    const instrument = instruments.find(i => i.id === measurement.instrument);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-2 text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          {instrument && (
                            <instrument.icon className={`h-4 w-4 text-${instrument.color}-600`} />
                          )}
                          <span className="font-medium">{instrument?.name || measurement.instrument}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono">{measurement.value.toFixed(2)} {measurement.unit}</span>
                          <div className="text-xs text-gray-500">{formatTimestamp(measurement.timestamp)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Estatísticas */}
            {measurements.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-600">
                    Total: <span className="font-medium">{measurements.length}</span>
                  </div>
                  <div className="text-gray-600">
                    Última: <span className="font-medium">{formatTimestamp(measurements[measurements.length - 1].timestamp)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumo rápido */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Medições:</span>
            <span className="font-medium">{measurements.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Instrumentos:</span>
            <span className="font-medium">{instruments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
