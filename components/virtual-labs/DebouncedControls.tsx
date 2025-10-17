// components/virtual-labs/DebouncedControls.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Save, 
  Play, 
  Pause, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ControlParameter {
  name: string;
  label: string;
  type: 'slider' | 'input' | 'number';
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  defaultValue: number;
  validator?: (value: number) => { isValid: boolean; error?: string };
}

interface DebouncedControlsProps {
  parameters: ControlParameter[];
  onParameterChange: (name: string, value: number) => void;
  onSave?: (parameters: Record<string, number>) => void;
  onReset?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  isRunning?: boolean;
  debounceDelay?: number;
  showValidation?: boolean;
  showTimestamps?: boolean;
  className?: string;
}

export const DebouncedControls: React.FC<DebouncedControlsProps> = ({
  parameters,
  onParameterChange,
  onSave,
  onReset,
  onStart,
  onPause,
  isRunning = false,
  debounceDelay = 300,
  showValidation = true,
  showTimestamps = false,
  className = ''
}) => {
  // Estado para cada parâmetro
  const [parameterValues, setParameterValues] = useState<Record<string, number>>(
    parameters.reduce((acc, param) => ({
      ...acc,
      [param.name]: param.defaultValue
    }), {})
  );

  // Estado para validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [lastUpdated, setLastUpdated] = useState<Record<string, Date>>({});

  // Debounced callback para mudanças de parâmetros
  const debouncedParameterChange = useDebouncedCallback(
    (name: string, value: number) => {
      onParameterChange(name, value);
      setLastUpdated(prev => ({ ...prev, [name]: new Date() }));
    },
    debounceDelay
  );

  // Função para atualizar parâmetro
  const updateParameter = useCallback((name: string, value: number) => {
    setParameterValues(prev => ({ ...prev, [name]: value }));
    
    // Validar se necessário
    const param = parameters.find(p => p.name === name);
    if (param?.validator && showValidation) {
      const validation = param.validator(value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: validation.error || ''
      }));
    }
    
    // Chamar callback debounced
    debouncedParameterChange(name, value);
  }, [parameters, debouncedParameterChange, showValidation]);

  // Função para resetar parâmetros
  const handleReset = useCallback(() => {
    const defaultValues = parameters.reduce((acc, param) => ({
      ...acc,
      [param.name]: param.defaultValue
    }), {});
    
    setParameterValues(defaultValues);
    setValidationErrors({});
    setLastUpdated({});
    
    if (onReset) {
      onReset();
    }
  }, [parameters, onReset]);

  // Função para salvar parâmetros
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(parameterValues);
    }
  }, [parameterValues, onSave]);

  // Verificar se há erros de validação
  const hasValidationErrors = useMemo(() => {
    return Object.values(validationErrors).some(error => error !== '');
  }, [validationErrors]);

  // Verificar se todos os parâmetros são válidos
  const allParametersValid = useMemo(() => {
    return parameters.every(param => {
      const value = parameterValues[param.name];
      if (param.validator) {
        return param.validator(value).isValid;
      }
      return value >= param.min && value <= param.max;
    });
  }, [parameters, parameterValues]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Controles de Parâmetros</span>
          {showTimestamps && (
            <Badge variant="outline" className="ml-auto">
              <Clock className="w-3 h-3 mr-1" />
              Debounce: {debounceDelay}ms
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Ajuste os parâmetros do experimento. As mudanças são aplicadas automaticamente após {debounceDelay}ms.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Parâmetros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parameters.map((param) => {
            const value = parameterValues[param.name];
            const error = validationErrors[param.name];
            const isValid = !error && param.validator ? param.validator(value).isValid : true;
            const lastUpdate = lastUpdated[param.name];

            return (
              <div key={param.name} className="space-y-2">
                <Label htmlFor={param.name} className="flex items-center space-x-2">
                  <span>{param.label}</span>
                  {showValidation && (
                    isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )
                  )}
                </Label>
                
                <div className="space-y-2">
                  {param.type === 'slider' ? (
                    <Slider
                      id={param.name}
                      value={[value]}
                      onValueChange={(newValue) => updateParameter(param.name, newValue[0])}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full"
                    />
                  ) : (
                    <Input
                      id={param.name}
                      type="number"
                      value={value}
                      onChange={(e) => updateParameter(param.name, parseFloat(e.target.value) || 0)}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className={!isValid ? 'border-red-500' : ''}
                    />
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{value}{param.unit}</span>
                    {showTimestamps && lastUpdate && (
                      <span className="text-xs">
                        {lastUpdate.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  {showValidation && error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}
                  
                  <p className="text-xs text-gray-500">{param.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controles de ação */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              onClick={onStart}
              disabled={!allParametersValid || isRunning}
              className="bg-green-500 hover:bg-green-600"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Executando...' : 'Iniciar'}
            </Button>
            
            {isRunning && onPause && (
              <Button
                onClick={onPause}
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSave}
              variant="outline"
              disabled={hasValidationErrors}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-gray-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>
        </div>

        {/* Status de validação */}
        {showValidation && (
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2 text-sm">
              {allParametersValid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Todos os parâmetros são válidos</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">Alguns parâmetros precisam ser corrigidos</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebouncedControls;
