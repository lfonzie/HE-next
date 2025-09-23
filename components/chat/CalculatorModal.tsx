'use client';

import React, { useState, useEffect } from 'react';
import { X, Calculator, History, Clear, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExpression?: string;
  className?: string;
}

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export function CalculatorModal({ isOpen, onClose, initialExpression = '', className = '' }: CalculatorModalProps) {
  const [expression, setExpression] = useState(initialExpression);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialExpression) {
      setExpression(initialExpression);
      calculateExpression(initialExpression);
    }
  }, [isOpen, initialExpression]);

  const calculateExpression = async (expr: string) => {
    if (!expr.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Sanitize expression for security
      const sanitizedExpr = expr.replace(/[^0-9+\-*/().\s]/g, '');
      
      if (sanitizedExpr !== expr) {
        throw new Error('Expressão contém caracteres inválidos');
      }

      // Use Function constructor for safe evaluation
      const result = Function(`"use strict"; return (${sanitizedExpr})`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Resultado inválido');
      }

      const formattedResult = result.toString();
      setResult(formattedResult);

      // Add to history
      const newHistoryItem: CalculationHistory = {
        id: Date.now().toString(),
        expression: expr,
        result: formattedResult,
        timestamp: new Date()
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular');
      setResult('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      calculateExpression(expression);
    } else if (value === 'C') {
      setExpression('');
      setResult('');
      setError(null);
    } else if (value === '⌫') {
      setExpression(prev => prev.slice(0, -1));
    } else {
      setExpression(prev => prev + value);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const buttons = [
    ['C', '⌫', '/', '*'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '(', ')']
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-md w-full shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Calculadora</h2>
              <p className="text-sm opacity-90">Cálculos matemáticos e fórmulas</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                {expression || '0'}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="flex items-center justify-end gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Calculando...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-end gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                ) : (
                  result || '0'
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Calculator Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {buttons.flat().map((button, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(button)}
                className={`p-3 rounded-lg font-semibold transition-colors ${
                  button === '=' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : button === 'C' || button === '⌫'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {button}
              </button>
            ))}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Histórico</h3>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-600 truncate">
                        {item.expression}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        = {item.result}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(`${item.expression} = ${item.result}`, item.id)}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Copiar resultado"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <button
                onClick={() => setExpression('')}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                <Clear className="w-4 h-4 inline mr-1" />
                Limpar
              </button>
              <button
                onClick={() => copyToClipboard(result, 'current')}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                {copiedId === 'current' ? (
                  <Check className="w-4 h-4 inline mr-1" />
                ) : (
                  <Copy className="w-4 h-4 inline mr-1" />
                )}
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
