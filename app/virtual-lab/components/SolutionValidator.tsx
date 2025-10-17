// components/SolutionValidator.tsx - Sistema de validação de soluções
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Calculator,
  Beaker,
  Thermometer,
  Droplet,
  Zap,
  Target,
  BarChart3,
  Clock
} from 'lucide-react';

interface SolutionValidation {
  id: string;
  parameter: string;
  expectedValue: number;
  actualValue: number;
  tolerance: number;
  unit: string;
  status: 'pass' | 'fail' | 'warning';
  accuracy: number;
  message: string;
}

interface SolutionValidatorProps {
  solution: {
    id: string;
    name: string;
    volume: number;
    temperature: number;
    pH: number;
    concentration: number;
    species: Array<{
      formula: string;
      moles: number;
      concentration: number;
    }>;
  };
  expectedValues: Record<string, {
    value: number;
    tolerance: number;
    unit: string;
  }>;
  onValidationComplete: (validations: SolutionValidation[]) => void;
}

export const SolutionValidator: React.FC<SolutionValidatorProps> = ({
  solution,
  expectedValues,
  onValidationComplete
}) => {
  const [validations, setValidations] = useState<SolutionValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pass' | 'fail' | 'warning'>('pass');

  useEffect(() => {
    if (solution && expectedValues) {
      performValidation();
    }
  }, [solution, expectedValues]);

  const performValidation = async () => {
    setIsValidating(true);
    
    // Simular tempo de validação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newValidations: SolutionValidation[] = [];
    
    // Validar pH
    if (expectedValues.pH) {
      const pHValidation = validateParameter(
        'pH',
        solution.pH,
        expectedValues.pH.value,
        expectedValues.pH.tolerance,
        expectedValues.pH.unit
      );
      newValidations.push(pHValidation);
    }
    
    // Validar concentração
    if (expectedValues.concentration) {
      const concValidation = validateParameter(
        'Concentração',
        solution.concentration,
        expectedValues.concentration.value,
        expectedValues.concentration.tolerance,
        expectedValues.concentration.unit
      );
      newValidations.push(concValidation);
    }
    
    // Validar volume
    if (expectedValues.volume) {
      const volumeValidation = validateParameter(
        'Volume',
        solution.volume,
        expectedValues.volume.value,
        expectedValues.volume.tolerance,
        expectedValues.volume.unit
      );
      newValidations.push(volumeValidation);
    }
    
    // Validar temperatura
    if (expectedValues.temperature) {
      const tempValidation = validateParameter(
        'Temperatura',
        solution.temperature,
        expectedValues.temperature.value,
        expectedValues.temperature.tolerance,
        expectedValues.temperature.unit
      );
      newValidations.push(tempValidation);
    }
    
    // Validar espécies químicas
    if (expectedValues.species) {
      solution.species.forEach(species => {
        const speciesValidation = validateParameter(
          `Concentração ${species.formula}`,
          species.concentration,
          expectedValues.species[species.formula]?.value || 0,
          expectedValues.species[species.formula]?.tolerance || 0.1,
          expectedValues.species[species.formula]?.unit || 'M'
        );
        newValidations.push(speciesValidation);
      });
    }
    
    setValidations(newValidations);
    
    // Determinar status geral
    const hasFailures = newValidations.some(v => v.status === 'fail');
    const hasWarnings = newValidations.some(v => v.status === 'warning');
    
    if (hasFailures) {
      setOverallStatus('fail');
    } else if (hasWarnings) {
      setOverallStatus('warning');
    } else {
      setOverallStatus('pass');
    }
    
    setIsValidating(false);
    onValidationComplete(newValidations);
  };

  const validateParameter = (
    parameter: string,
    actualValue: number,
    expectedValue: number,
    tolerance: number,
    unit: string
  ): SolutionValidation => {
    const difference = Math.abs(actualValue - expectedValue);
    const accuracy = expectedValue > 0 ? ((expectedValue - difference) / expectedValue) * 100 : 100;
    
    let status: 'pass' | 'fail' | 'warning';
    let message: string;
    
    if (difference <= tolerance) {
      status = 'pass';
      message = `Valor dentro da tolerância (±${tolerance} ${unit})`;
    } else if (difference <= tolerance * 2) {
      status = 'warning';
      message = `Valor próximo do limite (diferença: ${difference.toFixed(3)} ${unit})`;
    } else {
      status = 'fail';
      message = `Valor fora da tolerância (diferença: ${difference.toFixed(3)} ${unit})`;
    }
    
    return {
      id: `validation_${parameter}_${Date.now()}`,
      parameter,
      expectedValue,
      actualValue,
      tolerance,
      unit,
      status,
      accuracy,
      message
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOverallScore = () => {
    if (validations.length === 0) return 0;
    const totalAccuracy = validations.reduce((sum, v) => sum + v.accuracy, 0);
    return totalAccuracy / validations.length;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Validação de Solução</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-lg transition-colors ${
              showDetails ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          
          <button
            onClick={performValidation}
            disabled={isValidating}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
          >
            <Calculator className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status geral */}
      <div className={`p-4 rounded-lg mb-4 ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon(overallStatus)}
          <div>
            <h4 className="font-semibold">
              {overallStatus === 'pass' ? 'Validação Aprovada' :
               overallStatus === 'fail' ? 'Validação Reprovada' :
               'Validação com Avisos'}
            </h4>
            <p className="text-sm">
              Pontuação geral: {getOverallScore().toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Informações da solução */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h5 className="font-medium text-gray-800 mb-3">Solução Atual</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Beaker className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Volume:</span>
            <span className="font-mono">{solution.volume.toFixed(1)} mL</span>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Temperatura:</span>
            <span className="font-mono">{solution.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplet className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">pH:</span>
            <span className="font-mono">{solution.pH.toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Concentração:</span>
            <span className="font-mono">{solution.concentration.toFixed(3)} M</span>
          </div>
        </div>
      </div>

      {/* Validações detalhadas */}
      <div className="flex-1 overflow-y-auto">
        <h5 className="font-medium text-gray-800 mb-3">Validações Detalhadas</h5>
        
        {isValidating ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-gray-600">Validando...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {validations.map(validation => (
              <motion.div
                key={validation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 border rounded-lg ${
                  validation.status === 'pass' ? 'border-green-200 bg-green-50' :
                  validation.status === 'fail' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(validation.status)}
                    <span className="font-medium text-gray-800">{validation.parameter}</span>
                  </div>
                  <span className="text-sm font-mono text-gray-600">
                    {validation.accuracy.toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Esperado:</span>
                    <span className="font-mono ml-2">
                      {validation.expectedValue.toFixed(3)} {validation.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Obtido:</span>
                    <span className="font-mono ml-2">
                      {validation.actualValue.toFixed(3)} {validation.unit}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mt-2">{validation.message}</p>
                
                {/* Barra de progresso da precisão */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        validation.status === 'pass' ? 'bg-green-500' :
                        validation.status === 'fail' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, validation.accuracy))}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {validations.length === 0 && !isValidating && (
          <div className="text-center text-gray-500 py-8">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhuma validação realizada</p>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex space-x-2">
          <button
            onClick={performValidation}
            disabled={isValidating}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span>Revalidar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
