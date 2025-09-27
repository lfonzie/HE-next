'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Beaker, Droplets, Thermometer, Zap } from 'lucide-react';

interface ChemicalReactionLabProps {}

export const ChemicalReactionLab: React.FC<ChemicalReactionLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temperature, setTemperature] = useState(25);
  const [concentration, setConcentration] = useState(50);
  const [isReactionActive, setIsReactionActive] = useState(false);
  const [reactionProgress, setReactionProgress] = useState(0);
  const [selectedCompounds, setSelectedCompounds] = useState<string[]>([]);
  const [reactionResult, setReactionResult] = useState<string>('');

  const compounds = [
    { id: 'hcl', name: 'HCl', color: '#ff6b6b', formula: 'HCl' },
    { id: 'naoh', name: 'NaOH', color: '#4ecdc4', formula: 'NaOH' },
    { id: 'h2so4', name: 'H₂SO₄', color: '#ffe66d', formula: 'H₂SO₄' },
    { id: 'caco3', name: 'CaCO₃', color: '#a8e6cf', formula: 'CaCO₃' },
    { id: 'agno3', name: 'AgNO₃', color: '#ffd93d', formula: 'AgNO₃' },
    { id: 'nacl', name: 'NaCl', color: '#6bcf7f', formula: 'NaCl' }
  ];

  const reactions = [
    {
      reactants: ['hcl', 'naoh'],
      products: ['nacl', 'h2o'],
      name: 'Neutralização',
      type: 'exothermic',
      description: 'Reação de neutralização entre ácido e base'
    },
    {
      reactants: ['h2so4', 'caco3'],
      products: ['caso4', 'h2o', 'co2'],
      name: 'Reação com Carbonato',
      type: 'exothermic',
      description: 'Liberação de CO₂ gasoso'
    },
    {
      reactants: ['agno3', 'nacl'],
      products: ['agcl', 'nano3'],
      name: 'Precipitação',
      type: 'endothermic',
      description: 'Formação de precipitado branco'
    }
  ];

  const handleCompoundSelect = (compoundId: string) => {
    setSelectedCompounds(prev => {
      if (prev.includes(compoundId)) {
        return prev.filter(id => id !== compoundId);
      } else if (prev.length < 2) {
        return [...prev, compoundId];
      }
      return prev;
    });
  };

  const startReaction = () => {
    if (selectedCompounds.length !== 2) return;
    
    const reaction = reactions.find(r => 
      r.reactants.every(reactant => selectedCompounds.includes(reactant))
    );
    
    if (reaction) {
      setIsReactionActive(true);
      setReactionResult(reaction.description);
      
      // Simular progresso da reação
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setReactionProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setIsReactionActive(false);
        }
      }, 50);
    }
  };

  const resetReaction = () => {
    setIsReactionActive(false);
    setReactionProgress(0);
    setReactionResult('');
    setSelectedCompounds([]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar frascos
    const drawFlask = (x: number, y: number, color: string, label: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 50);
    };

    // Desenhar frascos selecionados
    selectedCompounds.forEach((compoundId, index) => {
      const compound = compounds.find(c => c.id === compoundId);
      if (compound) {
        drawFlask(100 + index * 150, 100, compound.color, compound.formula);
      }
    });

    // Desenhar seta de reação
    if (selectedCompounds.length === 2) {
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(250, 100);
      ctx.lineTo(300, 100);
      ctx.stroke();
      
      // Cabeça da seta
      ctx.beginPath();
      ctx.moveTo(300, 100);
      ctx.lineTo(290, 95);
      ctx.moveTo(300, 100);
      ctx.lineTo(290, 105);
      ctx.stroke();
    }

    // Desenhar resultado da reação
    if (reactionResult) {
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(450, 100, 30, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Produto', 450, 100);
    }

    // Desenhar barra de progresso
    if (isReactionActive) {
      const progressWidth = (reactionProgress / 100) * 200;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(200, 200, progressWidth, 20);
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(200, 200, 200, 20);
      
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${reactionProgress}%`, 300, 215);
    }

  }, [selectedCompounds, reactionResult, isReactionActive, reactionProgress]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Canvas Area */}
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Beaker className="h-5 w-5" />
              <span>Simulação de Reação Química</span>
            </CardTitle>
            <CardDescription>
              Selecione dois compostos para iniciar uma reação química
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={300}
                  className="w-full h-full border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              
              {/* Controls */}
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Temperatura: {temperature}°C
                    </label>
                    <Slider
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Concentração: {concentration}%
                    </label>
                    <Slider
                      value={[concentration]}
                      onValueChange={(value) => setConcentration(value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={startReaction}
                    disabled={selectedCompounds.length !== 2 || isReactionActive}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Iniciar Reação
                  </Button>
                  <Button
                    onClick={resetReaction}
                    variant="outline"
                    className="flex-1"
                  >
                    Resetar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compounds Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="h-5 w-5" />
            <span>Compostos Disponíveis</span>
          </CardTitle>
          <CardDescription>
            Clique em dois compostos para formar uma reação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {compounds.map((compound) => {
              const isSelected = selectedCompounds.includes(compound.id);
              return (
                <Button
                  key={compound.id}
                  onClick={() => handleCompoundSelect(compound.id)}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-20 flex flex-col items-center justify-center space-y-1 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                  disabled={!isSelected && selectedCompounds.length >= 2}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: compound.color }}
                  />
                  <span className="text-xs font-medium">{compound.name}</span>
                  <span className="text-xs text-gray-500">{compound.formula}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reaction Info */}
      {reactionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5" />
              <span>Resultado da Reação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">{reactionResult}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Temperatura: {temperature}°C</Badge>
                <Badge variant="secondary">Concentração: {concentration}%</Badge>
                {isReactionActive && (
                  <Badge variant="default">Progresso: {reactionProgress}%</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
