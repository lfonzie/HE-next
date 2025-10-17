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

interface CellMicroscopyLabProps {}

export const CellMicroscopyLab: React.FC<CellMicroscopyLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [magnification, setMagnification] = useState(100);
  const [focus, setFocus] = useState(50);
  const [isObserving, setIsObserving] = useState(false);
  const [currentCell, setCurrentCell] = useState<string>('plant');
  const [observations, setObservations] = useState<string[]>([]);

  const cellTypes = [
    { id: 'plant', name: 'Célula Vegetal', color: '#4ade80', description: 'Parede celular, cloroplastos, vacúolo' },
    { id: 'animal', name: 'Célula Animal', color: '#f59e0b', description: 'Membrana plasmática, núcleo, mitocôndrias' },
    { id: 'bacteria', name: 'Bactéria', color: '#ef4444', description: 'Parede celular, flagelo, plasmídeo' },
    { id: 'fungus', name: 'Fungo', color: '#8b5cf6', description: 'Hifa, esporos, quitina' }
  ];

  const organelles = {
    plant: [
      { name: 'Parede Celular', visible: true, color: '#22c55e' },
      { name: 'Membrana Plasmática', visible: magnification > 200, color: '#3b82f6' },
      { name: 'Núcleo', visible: magnification > 150, color: '#8b5cf6' },
      { name: 'Cloroplastos', visible: magnification > 300, color: '#16a34a' },
      { name: 'Vacúolo', visible: magnification > 100, color: '#eab308' },
      { name: 'Mitocôndrias', visible: magnification > 400, color: '#dc2626' }
    ],
    animal: [
      { name: 'Membrana Plasmática', visible: magnification > 200, color: '#3b82f6' },
      { name: 'Núcleo', visible: magnification > 150, color: '#8b5cf6' },
      { name: 'Mitocôndrias', visible: magnification > 300, color: '#dc2626' },
      { name: 'Retículo Endoplasmático', visible: magnification > 400, color: '#ea580c' },
      { name: 'Complexo de Golgi', visible: magnification > 350, color: '#7c3aed' },
      { name: 'Ribossomos', visible: magnification > 500, color: '#059669' }
    ],
    bacteria: [
      { name: 'Parede Celular', visible: magnification > 100, color: '#22c55e' },
      { name: 'Membrana Plasmática', visible: magnification > 200, color: '#3b82f6' },
      { name: 'Citoplasma', visible: magnification > 150, color: '#f59e0b' },
      { name: 'Flagelo', visible: magnification > 300, color: '#6b7280' },
      { name: 'Plasmídeo', visible: magnification > 400, color: '#8b5cf6' },
      { name: 'Ribossomos', visible: magnification > 500, color: '#059669' }
    ],
    fungus: [
      { name: 'Parede Celular', visible: magnification > 100, color: '#22c55e' },
      { name: 'Membrana Plasmática', visible: magnification > 200, color: '#3b82f6' },
      { name: 'Núcleo', visible: magnification > 150, color: '#8b5cf6' },
      { name: 'Hifa', visible: magnification > 250, color: '#7c3aed' },
      { name: 'Esporos', visible: magnification > 300, color: '#dc2626' },
      { name: 'Mitocôndrias', visible: magnification > 400, color: '#ea580c' }
    ]
  };

  useEffect(() => {
    if (isObserving) {
      startObservation();
    } else {
      stopObservation();
    }
    
    return () => stopObservation();
  }, [isObserving]);

  const startObservation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawCell(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopObservation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawCell = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const cellRadius = Math.min(width, height) * 0.3;
    
    // Desenhar célula base
    ctx.beginPath();
    ctx.arc(centerX, centerY, cellRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Desenhar organelas
    const currentOrganelles = organelles[currentCell as keyof typeof organelles];
    currentOrganelles.forEach((organelle, index) => {
      if (organelle.visible) {
        const angle = (index / currentOrganelles.length) * 2 * Math.PI;
        const x = centerX + Math.cos(angle) * (cellRadius * 0.6);
        const y = centerY + Math.sin(angle) * (cellRadius * 0.6);
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = organelle.color;
        ctx.fill();
        
        // Adicionar label se magnificação for alta
        if (magnification > 300) {
          ctx.fillStyle = '#374151';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(organelle.name, x, y - 15);
        }
      }
    });

    // Adicionar efeito de foco
    if (focus < 50) {
      ctx.fillStyle = `rgba(0, 0, 0, ${(50 - focus) / 100})`;
      ctx.fillRect(0, 0, width, height);
    }
  };

  const handleCellChange = (cellId: string) => {
    setCurrentCell(cellId);
    setObservations([]);
  };

  const addObservation = () => {
    const cellType = cellTypes.find(c => c.id === currentCell);
    const newObservation = `Observação ${observations.length + 1}: ${cellType?.name} - Magnificação ${magnification}x`;
    setObservations(prev => [...prev, newObservation]);
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Beaker className="w-5 h-5 text-blue-600" />
            <span>Microscópio Virtual</span>
          </CardTitle>
          <CardDescription>
            Observe diferentes tipos de células e suas estruturas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de célula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Célula
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cellTypes.map((cell) => (
                <button
                  key={cell.id}
                  onClick={() => handleCellChange(cell.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    currentCell === cell.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cell.color }}
                    />
                    <span className="text-sm font-medium">{cell.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{cell.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Controles de magnificação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Magnificação: {magnification}x
              </label>
              <Slider
                value={[magnification]}
                onValueChange={(value) => setMagnification(value[0])}
                min={50}
                max={1000}
                step={50}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foco: {focus}%
              </label>
              <Slider
                value={[focus]}
                onValueChange={(value) => setFocus(value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Botões de controle */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsObserving(!isObserving)}
              className={isObserving ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
            >
              {isObserving ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isObserving ? 'Pausar' : 'Observar'}
            </Button>
            
            <Button
              onClick={addObservation}
              variant="outline"
              disabled={!isObserving}
            >
              <Target className="w-4 h-4 mr-2" />
              Adicionar Observação
            </Button>
            
            <Button
              onClick={() => {
                setObservations([]);
                setMagnification(100);
                setFocus(50);
              }}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Área de visualização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Microscope className="w-5 h-5 text-green-600" />
            <span>Visualização Microscópica</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full bg-white rounded border"
            />
          </div>
          
          {/* Informações da célula atual */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              {cellTypes.find(c => c.id === currentCell)?.name}
            </h4>
            <p className="text-sm text-blue-700">
              {cellTypes.find(c => c.id === currentCell)?.description}
            </p>
            
            {/* Organelas visíveis */}
            <div className="mt-3">
              <h5 className="text-sm font-medium text-blue-900 mb-2">
                Estruturas Visíveis ({magnification}x):
              </h5>
              <div className="flex flex-wrap gap-2">
                {organelles[currentCell as keyof typeof organelles]
                  .filter(org => org.visible)
                  .map((organelle, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <div 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: organelle.color }}
                      />
                      {organelle.name}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {observations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Observações Registradas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {observations.map((observation, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                  {observation}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CellMicroscopyLab;
