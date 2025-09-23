'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, RotateCcw, Clock, Timer, CheckCircle, AlertCircle } from 'lucide-react';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMinutes?: number;
  className?: string;
}

interface TimerPreset {
  name: string;
  minutes: number;
  color: string;
}

const TIMER_PRESETS: TimerPreset[] = [
  { name: 'Pomodoro', minutes: 25, color: 'bg-red-500' },
  { name: 'Pausa Curta', minutes: 5, color: 'bg-green-500' },
  { name: 'Pausa Longa', minutes: 15, color: 'bg-blue-500' },
  { name: 'Estudo', minutes: 45, color: 'bg-purple-500' },
  { name: 'Revisão', minutes: 30, color: 'bg-orange-500' },
  { name: 'Exercícios', minutes: 20, color: 'bg-pink-500' }
];

export function TimerModal({ isOpen, onClose, initialMinutes = 25, className = '' }: TimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset | null>(null);
  const [customMinutes, setCustomMinutes] = useState(initialMinutes);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (isOpen && initialMinutes) {
      setTimeLeft(initialMinutes * 60);
      setCustomMinutes(initialMinutes);
    }
  }, [isOpen, initialMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsCompleted(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(customMinutes * 60);
  };

  const handlePresetSelect = (preset: TimerPreset) => {
    setSelectedPreset(preset);
    setCustomMinutes(preset.minutes);
    setTimeLeft(preset.minutes * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const handleCustomTimeChange = (minutes: number) => {
    setCustomMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    setIsCompleted(false);
    setSelectedPreset(null);
  };

  const getProgressPercentage = () => {
    const totalSeconds = customMinutes * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const getTimerColor = () => {
    if (isCompleted) return 'text-green-600';
    if (isRunning) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getTimerBgColor = () => {
    if (isCompleted) return 'bg-green-100';
    if (isRunning) return 'bg-blue-100';
    return 'bg-gray-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-md w-full shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Timer className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Cronômetro</h2>
              <p className="text-sm opacity-90">Gerencie seu tempo de estudo</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Timer Display */}
          <div className={`${getTimerBgColor()} rounded-2xl p-8 mb-6 text-center`}>
            <div className={`text-6xl font-bold ${getTimerColor()} mb-2`}>
              {formatTime(timeLeft)}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2">
              {isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Tempo concluído!</span>
                </>
              ) : isRunning ? (
                <>
                  <Play className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Em execução</span>
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">Pausado</span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mb-6">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                Iniciar
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Pause className="w-5 h-5" />
                Pausar
              </button>
            )}
            
            <button
              onClick={handleStop}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Presets */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tempos pré-definidos</h3>
            <div className="grid grid-cols-2 gap-2">
              {TIMER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedPreset?.name === preset.name
                      ? `${preset.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.name}
                  <div className="text-xs opacity-75">{preset.minutes}min</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tempo personalizado</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => handleCustomTimeChange(parseInt(e.target.value) || 1)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Minutos"
              />
              <span className="text-gray-600">minutos</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <button
                onClick={() => handleCustomTimeChange(5)}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                5 min
              </button>
              <button
                onClick={() => handleCustomTimeChange(10)}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                10 min
              </button>
              <button
                onClick={() => handleCustomTimeChange(30)}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                30 min
              </button>
            </div>
          </div>

          {/* Study Tips */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Dicas de estudo:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use a técnica Pomodoro: 25min estudo + 5min pausa</li>
              <li>• Faça pausas regulares para manter o foco</li>
              <li>• Evite distrações durante o tempo de estudo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
