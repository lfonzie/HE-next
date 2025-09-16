"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Settings, 
  BookOpen, 
  Brain,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { EnemMode } from '@/types/enem';

interface EnemModeSelectorProps {
  onModeSelect: (mode: EnemMode) => void;
  onCustomize: () => void;
}

export function EnemModeSelector({ onModeSelect, onCustomize }: EnemModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<EnemMode | null>(null);

  const modes = [
    {
      id: 'QUICK' as EnemMode,
      title: 'Modo Rápido',
      icon: <Clock className="h-6 w-6" />,
      description: '15 questões mistas em 30 minutos',
      features: ['Questões balanceadas', 'Tempo otimizado', 'Ideal para iniciantes'],
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      recommended: true
    },
    {
      id: 'CUSTOM' as EnemMode,
      title: 'Modo Personalizado',
      icon: <Settings className="h-6 w-6" />,
      description: 'Configure área, quantidade e tempo',
      features: ['Escolha a área', 'Defina quantidade', 'Controle o tempo'],
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      recommended: false
    },
    {
      id: 'OFFICIAL' as EnemMode,
      title: 'Modo Oficial',
      icon: <BookOpen className="h-6 w-6" />,
      description: 'Simule uma prova completa do ENEM',
      features: ['Prova completa', 'Ordem original', 'Tempo real'],
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      recommended: false
    },
    {
      id: 'ADAPTIVE' as EnemMode,
      title: 'Modo Adaptativo',
      icon: <Brain className="h-6 w-6" />,
      description: 'Dificuldade ajustada ao seu desempenho',
      features: ['IA adaptativa', '3 blocos sequenciais', 'Aprendizado personalizado'],
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      recommended: false
    }
  ];

  const handleModeClick = (mode: EnemMode) => {
    setSelectedMode(mode);
    if (mode === 'CUSTOM') {
      onCustomize();
    } else {
      onModeSelect(mode);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Escolha o Modo de Simulado</h2>
        <p className="text-gray-600">
          Selecione o tipo de simulado que melhor se adapta ao seu objetivo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => (
          <Card 
            key={mode.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedMode === mode.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => handleModeClick(mode.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${mode.color} text-white`}>
                  {mode.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{mode.title}</CardTitle>
                  {mode.recommended && (
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Recomendado
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-gray-600 mb-4">{mode.description}</p>
              
              <Button 
                className={`w-full bg-gradient-to-r ${mode.gradient} hover:opacity-90`}
                onClick={() => handleModeClick(mode.id)}
              >
                Selecionar Modo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
