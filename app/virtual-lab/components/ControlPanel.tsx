// components/ControlPanel.tsx - Painel de controles da simulação
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Settings, 
  Save, 
  Upload, 
  Download,
  Undo,
  Redo,
  StepForward,
  Clock,
  Zap
} from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  timestep: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onStep: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSettingsOpen: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  isPaused,
  currentTime,
  timestep,
  onPlay,
  onPause,
  onStop,
  onReset,
  onStep,
  onSave,
  onLoad,
  onExport,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSettingsOpen
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Controles</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {showAdvanced ? 'Simples' : 'Avançado'}
        </button>
      </div>

      {/* Controles principais */}
      <div className="flex items-center space-x-3 mb-4">
        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRunning ? (isPaused ? onPlay : onPause) : onPlay}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isRunning && !isPaused
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRunning && !isPaused ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>{isRunning && !isPaused ? 'Pausar' : 'Executar'}</span>
        </motion.button>

        {/* Stop */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
        >
          <Square className="h-4 w-4" />
          <span>Parar</span>
        </motion.button>

        {/* Reset */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </motion.button>

        {/* Step */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStep}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          <StepForward className="h-4 w-4" />
          <span>Step</span>
        </motion.button>
      </div>

      {/* Informações da simulação */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Tempo</span>
          </div>
          <p className="text-lg font-mono text-gray-900">{formatTime(currentTime)}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Timestep</span>
          </div>
          <p className="text-lg font-mono text-gray-900">{timestep.toFixed(3)}s</p>
        </div>
      </div>

      {/* Controles avançados */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-4"
          >
            {/* Undo/Redo */}
            <div className="flex items-center space-x-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUndo}
                disabled={!canUndo}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <Undo className="h-4 w-4" />
                <span>Desfazer</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRedo}
                disabled={!canRedo}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <Redo className="h-4 w-4" />
                <span>Refazer</span>
              </motion.button>
            </div>

            {/* Arquivo */}
            <div className="flex items-center space-x-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Salvar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoad}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Carregar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExport}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onImport}
                className="flex items-center space-x-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-medium transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Importar</span>
              </motion.button>
            </div>

            {/* Configurações */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSettingsOpen}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status da simulação */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isRunning && !isPaused ? 'bg-green-500 animate-pulse' :
            isRunning && isPaused ? 'bg-yellow-500' :
            'bg-gray-400'
          }`} />
          <span className="text-sm text-gray-600">
            {isRunning && !isPaused ? 'Executando' :
             isRunning && isPaused ? 'Pausado' :
             'Parado'}
          </span>
        </div>
      </div>
    </div>
  );
};
