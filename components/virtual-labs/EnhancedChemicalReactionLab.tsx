'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Beaker, 
  Droplets, 
  Thermometer, 
  Zap, 
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RotateCcw
} from 'lucide-react';

interface EnhancedChemicalReactionLabProps {}

export const EnhancedChemicalReactionLab: React.FC<EnhancedChemicalReactionLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [temperature, setTemperature] = useState(25);
  const [concentration, setConcentration] = useState(50);
  const [isReactionActive, setIsReactionActive] = useState(false);
  const [reactionProgress, setReactionProgress] = useState(0);
  const [selectedCompounds, setSelectedCompounds] = useState<string[]>([]);
  const [reactionResult, setReactionResult] = useState<string>('');
  const [reactionType, setReactionType] = useState<string>('');
  const [particles, setParticles] = useState<any[]>([]);
  const [showParticles, setShowParticles] = useState(true);
  const [reactionSpeed, setReactionSpeed] = useState(1);

  const compounds = [
    { 
      id: 'hcl', 
      name: 'HCl', 
      color: '#ff6b6b', 
      formula: 'HCl',
      description: 'Ácido clorídrico',
      properties: { pH: 1, state: 'líquido', hazard: 'corrosivo' }
    },
    { 
      id: 'naoh', 
      name: 'NaOH', 
      color: '#4ecdc4', 
      formula: 'NaOH',
      description: 'Hidróxido de sódio',
      properties: { pH: 14, state: 'sólido', hazard: 'corrosivo' }
    },
    { 
      id: 'h2so4', 
      name: 'H₂SO₄', 
      color: '#ffe66d', 
      formula: 'H₂SO₄',
      description: 'Ácido sulfúrico',
      properties: { pH: 0, state: 'líquido', hazard: 'muito corrosivo' }
    },
    { 
      id: 'caco3', 
      name: 'CaCO₃', 
      color: '#a8e6cf', 
      formula: 'CaCO₃',
      description: 'Carbonato de cálcio',
      properties: { pH: 9, state: 'sólido', hazard: 'inofensivo' }
    },
    { 
      id: 'agno3', 
      name: 'AgNO₃', 
      color: '#ffd93d', 
      formula: 'AgNO₃',
      description: 'Nitrato de prata',
      properties: { pH: 6, state: 'sólido', hazard: 'tóxico' }
    },
    { 
      id: 'nacl', 
      name: 'NaCl', 
      color: '#6bcf7f', 
      formula: 'NaCl',
      description: 'Cloreto de sódio',
      properties: { pH: 7, state: 'sólido', hazard: 'inofensivo' }
    }
  ];

  const reactions = [
    {
      reactants: ['hcl', 'naoh'],
      products: ['nacl', 'h2o'],
      name: 'Neutralização',
      type: 'exothermic',
      description: 'Reação de neutralização entre ácido e base',
      color: '#ff6b6b',
      energy: -57.1,
      equation: 'HCl + NaOH → NaCl + H₂O'
    },
    {
      reactants: ['h2so4', 'caco3'],
      products: ['caso4', 'h2o', 'co2'],
      name: 'Reação com Carbonato',
      type: 'exothermic',
      description: 'Liberação de CO₂ gasoso',
      color: '#ffe66d',
      energy: -45.2,
      equation: 'H₂SO₄ + CaCO₃ → CaSO₄ + H₂O + CO₂'
    },
    {
      reactants: ['agno3', 'nacl'],
      products: ['agcl', 'nano3'],
      name: 'Precipitação',
      type: 'endothermic',
      description: 'Formação de precipitado branco',
      color: '#ffd93d',
      energy: 12.3,
      equation: 'AgNO₃ + NaCl → AgCl + NaNO₃'
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
      setReactionType(reaction.type);
      
      // Criar partículas para animação
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 600,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: reaction.color,
        size: Math.random() * 4 + 2,
        life: 1
      }));
      setParticles(newParticles);
      
      // Simular progresso da reação
      let progress = 0;
      const interval = setInterval(() => {
        progress += reactionSpeed;
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
    setReactionType('');
    setSelectedCompounds([]);
    setParticles([]);
  };

  const updateParticles = () => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life - 0.02,
      size: particle.size * 0.98
    })).filter(particle => particle.life > 0));
  };

  useEffect(() => {
    if (isReactionActive && showParticles) {
      const interval = setInterval(updateParticles, 50);
      return () => clearInterval(interval);
    }
  }, [isReactionActive, showParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar mesa de laboratório
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Desenhar borda da mesa
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, canvas.height - 60, canvas.width, 60);

    // Desenhar frascos
    const drawFlask = (x: number, y: number, color: string, label: string, isSelected: boolean) => {
      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, 32, 0, Math.PI * 2);
      ctx.fill();
      
      // Frasco
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Borda
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#333';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();
      
      // Brilho
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(x - 8, y - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 50);
    };

    // Desenhar frascos selecionados
    selectedCompounds.forEach((compoundId, index) => {
      const compound = compounds.find(c => c.id === compoundId);
      if (compound) {
        drawFlask(100 + index * 150, 100, compound.color, compound.formula, true);
      }
    });

    // Desenhar seta de reação animada
    if (selectedCompounds.length === 2) {
      const arrowX = 250;
      const arrowY = 100;
      const arrowLength = 50;
      const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
      
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + pulse * 0.5})`;
      ctx.lineWidth = 3 + pulse * 2;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX + arrowLength, arrowY);
      ctx.stroke();
      
      // Cabeça da seta
      ctx.beginPath();
      ctx.moveTo(arrowX + arrowLength, arrowY);
      ctx.lineTo(arrowX + arrowLength - 10, arrowY - 5);
      ctx.moveTo(arrowX + arrowLength, arrowY);
      ctx.lineTo(arrowX + arrowLength - 10, arrowY + 5);
      ctx.stroke();
    }

    // Desenhar resultado da reação
    if (reactionResult) {
      const resultX = 450;
      const resultY = 100;
      
      // Efeito de brilho
      if (isReactionActive) {
        const glow = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
        ctx.shadowColor = reactionType === 'exothermic' ? '#ff6b6b' : '#4ecdc4';
        ctx.shadowBlur = 20 * glow;
      }
      
      ctx.fillStyle = reactionType === 'exothermic' ? '#ff6b6b' : '#4ecdc4';
      ctx.beginPath();
      ctx.arc(resultX, resultY, 30, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#333';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Produto', resultX, resultY);
    }

    // Desenhar partículas
    if (showParticles && particles.length > 0) {
      particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // Desenhar barra de progresso
    if (isReactionActive) {
      const progressWidth = (reactionProgress / 100) * 200;
      const progressX = 200;
      const progressY = 200;
      
      // Fundo da barra
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(progressX, progressY, 200, 20);
      
      // Barra de progresso
      const gradient = ctx.createLinearGradient(progressX, progressY, progressX + progressWidth, progressY);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = gradient;
      ctx.fillRect(progressX, progressY, progressWidth, 20);
      
      // Borda
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(progressX, progressY, 200, 20);
      
      // Texto
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${reactionProgress}%`, progressX + 100, progressY + 15);
    }

    // Desenhar informações
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Temperatura: ${temperature}°C`, 10, 30);
    ctx.fillText(`Concentração: ${concentration}%`, 10, 50);
    ctx.fillText(`Velocidade: ${reactionSpeed}x`, 10, 70);
    
    if (reactionResult) {
      ctx.fillText(`Reação: ${reactionResult}`, 10, 90);
      ctx.fillText(`Tipo: ${reactionType}`, 10, 110);
    }

  }, [selectedCompounds, reactionResult, isReactionActive, reactionProgress, reactionType, particles, temperature, concentration, reactionSpeed, showParticles]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Canvas Area */}
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Beaker className="h-5 w-5" />
              <span>Simulação de Reação Química</span>
              {isReactionActive && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Ativa
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Selecione dois compostos para iniciar uma reação química com visualizações avançadas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={300}
                  className="w-full h-full border border-gray-200 rounded-lg bg-white shadow-inner"
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Velocidade: {reactionSpeed}x
                    </label>
                    <Slider
                      value={[reactionSpeed]}
                      onValueChange={(value) => setReactionSpeed(value[0])}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showParticles"
                      checked={showParticles}
                      onChange={(e) => setShowParticles(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="showParticles" className="text-sm text-gray-700">
                      Mostrar partículas
                    </label>
                  </div>
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
          <div className="grid grid-cols-3 gap-4 mb-6">
            {compounds.map((compound) => {
              const isSelected = selectedCompounds.includes(compound.id);
              return (
                <Button
                  key={compound.id}
                  onClick={() => handleCompoundSelect(compound.id)}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-20 flex flex-col items-center justify-center space-y-2 ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  disabled={!isSelected && selectedCompounds.length >= 2}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: compound.color }}
                  />
                  <div className="text-center">
                    <div className="text-sm font-semibold">{compound.name}</div>
                    <div className="text-xs text-gray-500">{compound.formula}</div>
                  </div>
                  <div className="flex items-center">
                    {compound.properties.hazard === 'corrosivo' && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                    {compound.properties.hazard === 'inofensivo' && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    {compound.properties.hazard === 'tóxico' && (
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
          
          {/* Controles de reação separados */}
          <div className="flex space-x-3">
            <Button
              onClick={startReaction}
              disabled={selectedCompounds.length !== 2 || isReactionActive}
              className="flex-1 bg-green-600 hover:bg-green-700 h-12"
            >
              <Zap className="h-4 w-4 mr-2" />
              Iniciar Reação
            </Button>
            <Button
              onClick={resetReaction}
              variant="outline"
              className="flex-1 h-12"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
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
                <Badge variant="secondary">Velocidade: {reactionSpeed}x</Badge>
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
