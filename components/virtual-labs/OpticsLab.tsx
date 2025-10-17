'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Target,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Camera
} from 'lucide-react';

interface OpticsLabProps {}

interface LightRay {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  wavelength: number;
  intensity: number;
  angle: number;
}

interface OpticalElement {
  id: string;
  type: 'lens' | 'mirror' | 'prism' | 'slit';
  position: { x: number; y: number };
  properties: {
    focalLength?: number;
    refractiveIndex?: number;
    angle?: number;
    width?: number;
  };
}

interface InterferencePattern {
  wavelength: number;
  slitDistance: number;
  screenDistance: number;
  intensity: number[];
  positions: number[];
}

export const OpticsLab: React.FC<OpticsLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [wavelength, setWavelength] = useState(500);
  const [intensity, setIntensity] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [experimentType, setExperimentType] = useState<string>('refraction');
  const [lightRays, setLightRays] = useState<LightRay[]>([]);
  const [opticalElements, setOpticalElements] = useState<OpticalElement[]>([]);
  const [interferencePattern, setInterferencePattern] = useState<InterferencePattern | null>(null);
  const [showWavefronts, setShowWavefronts] = useState(false);
  const [showPolarization, setShowPolarization] = useState(false);

  const experimentTypes = [
    { id: 'refraction', name: 'Refração', description: 'Lei de Snell e índice de refração', color: '#3b82f6' },
    { id: 'reflection', name: 'Reflexão', description: 'Lei da reflexão e espelhos', color: '#ef4444' },
    { id: 'interference', name: 'Interferência', description: 'Fenda dupla e padrões', color: '#10b981' },
    { id: 'diffraction', name: 'Difração', description: 'Difração por fenda única', color: '#f59e0b' },
    { id: 'polarization', name: 'Polarização', description: 'Luz polarizada e filtros', color: '#8b5cf6' },
    { id: 'lenses', name: 'Lentes', description: 'Lentes convergentes e divergentes', color: '#ec4899' }
  ];

  const materials = [
    { name: 'air', label: 'Ar', refractiveIndex: 1.0, color: '#e5e7eb' },
    { name: 'water', label: 'Água', refractiveIndex: 1.33, color: '#3b82f6' },
    { name: 'glass', label: 'Vidro', refractiveIndex: 1.5, color: '#6b7280' },
    { name: 'diamond', label: 'Diamante', refractiveIndex: 2.42, color: '#fbbf24' },
    { name: 'oil', label: 'Óleo', refractiveIndex: 1.47, color: '#f59e0b' }
  ];

  useEffect(() => {
    if (isRunning) {
      startSimulation();
    } else {
      stopSimulation();
    }
    
    return () => stopSimulation();
  }, [isRunning]);

  useEffect(() => {
    initializeExperiment();
  }, [experimentType]);

  useEffect(() => {
    if (isRunning) {
      calculateOptics();
    }
  }, [wavelength, intensity, experimentType, isRunning]);

  const startSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawOptics(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const initializeExperiment = () => {
    setLightRays([]);
    setOpticalElements([]);
    setInterferencePattern(null);

    switch (experimentType) {
      case 'refraction':
        initializeRefraction();
        break;
      case 'reflection':
        initializeReflection();
        break;
      case 'interference':
        initializeInterference();
        break;
      case 'diffraction':
        initializeDiffraction();
        break;
      case 'polarization':
        initializePolarization();
        break;
      case 'lenses':
        initializeLenses();
        break;
    }
  };

  const initializeRefraction = () => {
    // Criar raio de luz incidente
    const incidentRay: LightRay = {
      startX: 100,
      startY: 200,
      endX: 300,
      endY: 200,
      wavelength,
      intensity,
      angle: 0
    };
    setLightRays([incidentRay]);

    // Criar interface entre materiais
    const interfaceElement: OpticalElement = {
      id: 'interface',
      type: 'prism',
      position: { x: 300, y: 200 },
      properties: {
        refractiveIndex: 1.5,
        angle: 0
      }
    };
    setOpticalElements([interfaceElement]);
  };

  const initializeReflection = () => {
    // Criar raio incidente
    const incidentRay: LightRay = {
      startX: 100,
      startY: 150,
      endX: 300,
      endY: 250,
      wavelength,
      intensity,
      angle: 30
    };
    setLightRays([incidentRay]);

    // Criar espelho
    const mirror: OpticalElement = {
      id: 'mirror',
      type: 'mirror',
      position: { x: 300, y: 200 },
      properties: {
        angle: 0
      }
    };
    setOpticalElements([mirror]);
  };

  const initializeInterference = () => {
    // Criar duas fendas
    const slit1: OpticalElement = {
      id: 'slit1',
      type: 'slit',
      position: { x: 200, y: 150 },
      properties: { width: 2 }
    };
    
    const slit2: OpticalElement = {
      id: 'slit2',
      type: 'slit',
      position: { x: 200, y: 250 },
      properties: { width: 2 }
    };
    
    setOpticalElements([slit1, slit2]);
    
    // Calcular padrão de interferência
    calculateInterferencePattern();
  };

  const initializeDiffraction = () => {
    // Criar fenda única
    const slit: OpticalElement = {
      id: 'slit',
      type: 'slit',
      position: { x: 200, y: 200 },
      properties: { width: 10 }
    };
    
    setOpticalElements([slit]);
  };

  const initializePolarization = () => {
    // Criar raio de luz não polarizada
    const unpolarizedRay: LightRay = {
      startX: 100,
      startY: 200,
      endX: 300,
      endY: 200,
      wavelength,
      intensity,
      angle: 0
    };
    setLightRays([unpolarizedRay]);

    // Criar filtro polarizador
    const polarizer: OpticalElement = {
      id: 'polarizer',
      type: 'prism',
      position: { x: 200, y: 200 },
      properties: {
        angle: 45
      }
    };
    setOpticalElements([polarizer]);
  };

  const initializeLenses = () => {
    // Criar raio paralelo
    const parallelRay: LightRay = {
      startX: 100,
      startY: 200,
      endX: 300,
      endY: 200,
      wavelength,
      intensity,
      angle: 0
    };
    setLightRays([parallelRay]);

    // Criar lente convergente
    const lens: OpticalElement = {
      id: 'lens',
      type: 'lens',
      position: { x: 300, y: 200 },
      properties: {
        focalLength: 100
      }
    };
    setOpticalElements([lens]);
  };

  const calculateOptics = () => {
    switch (experimentType) {
      case 'refraction':
        calculateRefraction();
        break;
      case 'reflection':
        calculateReflection();
        break;
      case 'interference':
        calculateInterferencePattern();
        break;
      case 'diffraction':
        calculateDiffraction();
        break;
      case 'polarization':
        calculatePolarization();
        break;
      case 'lenses':
        calculateLenses();
        break;
    }
  };

  const calculateRefraction = () => {
    if (lightRays.length === 0 || opticalElements.length === 0) return;

    const incidentRay = lightRays[0];
    const interfaceElement = opticalElements[0];
    
    // Lei de Snell: n1 * sin(θ1) = n2 * sin(θ2)
    const n1 = 1.0; // Ar
    const n2 = interfaceElement.properties.refractiveIndex || 1.5;
    const incidentAngle = Math.PI / 6; // 30 graus
    
    const refractedAngle = Math.asin((n1 * Math.sin(incidentAngle)) / n2);
    
    // Criar raio refratado
    const refractedRay: LightRay = {
      startX: interfaceElement.position.x,
      startY: interfaceElement.position.y,
      endX: interfaceElement.position.x + 100 * Math.cos(refractedAngle),
      endY: interfaceElement.position.y + 100 * Math.sin(refractedAngle),
      wavelength,
      intensity: intensity * 0.9, // Perda de intensidade
      angle: refractedAngle * 180 / Math.PI
    };
    
    setLightRays([incidentRay, refractedRay]);
  };

  const calculateReflection = () => {
    if (lightRays.length === 0 || opticalElements.length === 0) return;

    const incidentRay = lightRays[0];
    const mirror = opticalElements[0];
    
    // Lei da reflexão: ângulo de incidência = ângulo de reflexão
    const incidentAngle = incidentRay.angle;
    const reflectedAngle = -incidentAngle; // Reflexão especular
    
    // Criar raio refletido
    const reflectedRay: LightRay = {
      startX: mirror.position.x,
      startY: mirror.position.y,
      endX: mirror.position.x + 100 * Math.cos(reflectedAngle * Math.PI / 180),
      endY: mirror.position.y + 100 * Math.sin(reflectedAngle * Math.PI / 180),
      wavelength,
      intensity: intensity * 0.95, // Pequena perda
      angle: reflectedAngle
    };
    
    setLightRays([incidentRay, reflectedRay]);
  };

  const calculateInterferencePattern = () => {
    const slitDistance = 50; // Distância entre fendas
    const screenDistance = 200; // Distância até a tela
    const wavelengthM = wavelength * 1e-9; // Converter para metros
    
    const positions: number[] = [];
    const intensities: number[] = [];
    
    // Calcular padrão de interferência
    for (let y = 0; y < 400; y += 2) {
      const position = y - 200; // Centralizar
      const pathDifference = (slitDistance * position) / screenDistance;
      const phaseDifference = (2 * Math.PI * pathDifference) / wavelengthM;
      
      // Intensidade da interferência
      const intensity = Math.pow(Math.cos(phaseDifference / 2), 2);
      
      positions.push(position);
      intensities.push(intensity * 255);
    }
    
    setInterferencePattern({
      wavelength,
      slitDistance,
      screenDistance,
      intensity: intensities,
      positions
    });
  };

  const calculateDiffraction = () => {
    // Difração por fenda única
    const slitWidth = 10;
    const screenDistance = 200;
    const wavelengthM = wavelength * 1e-9;
    
    const positions: number[] = [];
    const intensities: number[] = [];
    
    for (let y = 0; y < 400; y += 2) {
      const position = y - 200;
      const angle = Math.atan(position / screenDistance);
      const beta = (Math.PI * slitWidth * Math.sin(angle)) / wavelengthM;
      
      // Intensidade da difração
      const intensity = Math.pow(Math.sin(beta) / beta, 2);
      
      positions.push(position);
      intensities.push(Math.max(0, intensity * 255));
    }
    
    setInterferencePattern({
      wavelength,
      slitDistance: slitWidth,
      screenDistance,
      intensity: intensities,
      positions
    });
  };

  const calculatePolarization = () => {
    if (lightRays.length === 0 || opticalElements.length === 0) return;

    const incidentRay = lightRays[0];
    const polarizer = opticalElements[0];
    
    // Lei de Malus: I = I₀ * cos²(θ)
    const angle = polarizer.properties.angle || 45;
    const transmittedIntensity = intensity * Math.pow(Math.cos(angle * Math.PI / 180), 2);
    
    // Criar raio polarizado
    const polarizedRay: LightRay = {
      startX: polarizer.position.x,
      startY: polarizer.position.y,
      endX: polarizer.position.x + 100,
      endY: polarizer.position.y,
      wavelength,
      intensity: transmittedIntensity,
      angle: angle
    };
    
    setLightRays([incidentRay, polarizedRay]);
  };

  const calculateLenses = () => {
    if (lightRays.length === 0 || opticalElements.length === 0) return;

    const incidentRay = lightRays[0];
    const lens = opticalElements[0];
    
    // Equação das lentes: 1/f = 1/p + 1/q
    const focalLength = lens.properties.focalLength || 100;
    const objectDistance = 200; // Distância do objeto
    const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
    
    // Criar raio refratado pela lente
    const refractedRay: LightRay = {
      startX: lens.position.x,
      startY: lens.position.y,
      endX: lens.position.x + imageDistance,
      endY: lens.position.y - 50, // Convergir para o foco
      wavelength,
      intensity: intensity * 0.8,
      angle: -30
    };
    
    setLightRays([incidentRay, refractedRay]);
  };

  const drawOptics = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Desenhar elementos ópticos
    opticalElements.forEach(element => {
      drawOpticalElement(ctx, element);
    });
    
    // Desenhar raios de luz
    lightRays.forEach(ray => {
      drawLightRay(ctx, ray);
    });
    
    // Desenhar padrão de interferência se aplicável
    if (interferencePattern && (experimentType === 'interference' || experimentType === 'diffraction')) {
      drawInterferencePattern(ctx, width, height);
    }
    
    // Desenhar frentes de onda se habilitado
    if (showWavefronts) {
      drawWavefronts(ctx, width, height);
    }
    
    // Desenhar análise
    drawAnalysis(ctx, width, height);
  };

  const drawOpticalElement = (ctx: CanvasRenderingContext2D, element: OpticalElement) => {
    const x = element.position.x;
    const y = element.position.y;
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    
    switch (element.type) {
      case 'lens':
        // Desenhar lente convergente
        ctx.beginPath();
        ctx.arc(x, y, 30, -Math.PI/2, Math.PI/2);
        ctx.arc(x, y, 20, Math.PI/2, -Math.PI/2);
        ctx.stroke();
        break;
        
      case 'mirror':
        // Desenhar espelho
        ctx.beginPath();
        ctx.moveTo(x - 50, y - 30);
        ctx.lineTo(x + 50, y + 30);
        ctx.stroke();
        break;
        
      case 'prism':
        // Desenhar prisma
        ctx.beginPath();
        ctx.moveTo(x, y - 30);
        ctx.lineTo(x + 30, y + 30);
        ctx.lineTo(x - 30, y + 30);
        ctx.closePath();
        ctx.stroke();
        break;
        
      case 'slit':
        // Desenhar fenda
        const width = element.properties.width || 5;
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x - width/2, y - 50, width, 100);
        break;
    }
  };

  const drawLightRay = (ctx: CanvasRenderingContext2D, ray: LightRay) => {
    // Cor baseada no comprimento de onda
    const color = wavelengthToColor(ray.wavelength);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = ray.intensity / 255;
    
    ctx.beginPath();
    ctx.moveTo(ray.startX, ray.startY);
    ctx.lineTo(ray.endX, ray.endY);
    ctx.stroke();
    
    // Desenhar seta
    const angle = Math.atan2(ray.endY - ray.startY, ray.endX - ray.startX);
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;
    
    ctx.beginPath();
    ctx.moveTo(ray.endX, ray.endY);
    ctx.lineTo(
      ray.endX - arrowLength * Math.cos(angle - arrowAngle),
      ray.endY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(ray.endX, ray.endY);
    ctx.lineTo(
      ray.endX - arrowLength * Math.cos(angle + arrowAngle),
      ray.endY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  };

  const drawInterferencePattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!interferencePattern) return;
    
    const screenX = width - 100;
    
    // Desenhar tela
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, height);
    ctx.stroke();
    
    // Desenhar padrão de interferência
    interferencePattern.positions.forEach((position, index) => {
      const intensity = interferencePattern.intensity[index];
      const y = height/2 + position;
      
      ctx.fillStyle = `rgba(0, 0, 0, ${intensity/255})`;
      ctx.fillRect(screenX, y, 50, 2);
    });
  };

  const drawWavefronts = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    lightRays.forEach(ray => {
      const dx = ray.endX - ray.startX;
      const dy = ray.endY - ray.startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(length / 20);
      
      for (let i = 0; i < steps; i++) {
        const x = ray.startX + (dx * i) / steps;
        const y = ray.startY + (dy * i) / steps;
        
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    ctx.setLineDash([]);
  };

  const drawAnalysis = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(10, 10, 250, 120);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillText('Análise Ótica:', 20, 30);
    ctx.fillText(`Comprimento de onda: ${wavelength} nm`, 20, 50);
    ctx.fillText(`Intensidade: ${intensity}%`, 20, 70);
    
    if (experimentType === 'refraction') {
      const refractiveIndex = opticalElements[0]?.properties.refractiveIndex || 1.5;
      ctx.fillText(`Índice de refração: ${refractiveIndex}`, 20, 90);
    } else if (experimentType === 'interference') {
      ctx.fillText(`Distância entre fendas: 50 μm`, 20, 90);
    } else if (experimentType === 'lenses') {
      const focalLength = opticalElements[0]?.properties.focalLength || 100;
      ctx.fillText(`Distância focal: ${focalLength} mm`, 20, 90);
    }
  };

  const wavelengthToColor = (wavelength: number): string => {
    if (wavelength < 400) return '#8b5cf6'; // Violeta
    if (wavelength < 450) return '#3b82f6'; // Azul
    if (wavelength < 500) return '#10b981'; // Verde
    if (wavelength < 570) return '#fbbf24'; // Amarelo
    if (wavelength < 590) return '#f59e0b'; // Laranja
    if (wavelength < 700) return '#ef4444'; // Vermelho
    return '#6b7280'; // Cinza para fora do espectro visível
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-purple-600" />
            <span>Laboratório de Ótica</span>
          </CardTitle>
          <CardDescription>
            Explore refração, reflexão, interferência e outros fenômenos ópticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de tipo de experimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Experimento
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {experimentTypes.map((experiment) => (
                <button
                  key={experiment.id}
                  onClick={() => setExperimentType(experiment.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    experimentType === experiment.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: experiment.color }}
                    />
                    <span className="text-sm font-medium">{experiment.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{experiment.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Controles de parâmetros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprimento de Onda: {wavelength} nm
              </label>
              <Slider
                value={[wavelength]}
                onValueChange={(value) => setWavelength(value[0])}
                min={400}
                max={700}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Violeta (400nm)</span>
                <span>Verde (550nm)</span>
                <span>Vermelho (700nm)</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensidade: {intensity}%
              </label>
              <Slider
                value={[intensity]}
                onValueChange={(value) => setIntensity(value[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Controles de visualização */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showWavefronts}
                onChange={(e) => setShowWavefronts(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Mostrar frentes de onda</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPolarization}
                onChange={(e) => setShowPolarization(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Mostrar polarização</span>
            </label>
          </div>

          {/* Botões de controle */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className={isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            
            <Button
              onClick={() => {
                setIsRunning(false);
                setWavelength(500);
                setIntensity(100);
                initializeExperiment();
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
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span>Simulação Ótica</span>
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
          
          {/* Análise detalhada */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Análise Ótica Detalhada
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Parâmetros:</h5>
                <ul className="space-y-1 text-blue-700">
                  <li>• Comprimento de onda: {wavelength} nm</li>
                  <li>• Intensidade: {intensity}%</li>
                  <li>• Cor: {wavelengthToColor(wavelength)}</li>
                  <li>• Frequência: {(3e8 / (wavelength * 1e-9) / 1e12).toFixed(2)} THz</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Resultados:</h5>
                <div className="space-y-1 text-blue-700">
                  {experimentType === 'refraction' && (
                    <>
                      <li>• Ângulo de incidência: 30°</li>
                      <li>• Ângulo de refração: {Math.asin(0.5 / 1.5) * 180 / Math.PI}°</li>
                      <li>• Índice de refração: 1.5</li>
                    </>
                  )}
                  {experimentType === 'reflection' && (
                    <>
                      <li>• Ângulo de incidência: 30°</li>
                      <li>• Ângulo de reflexão: 30°</li>
                      <li>• Lei da reflexão: θᵢ = θᵣ</li>
                    </>
                  )}
                  {experimentType === 'interference' && (
                    <>
                      <li>• Distância entre fendas: 50 μm</li>
                      <li>• Comprimento de onda: {wavelength} nm</li>
                      <li>• Padrão de interferência: Construtiva/Destrutiva</li>
                    </>
                  )}
                  {experimentType === 'lenses' && (
                    <>
                      <li>• Distância focal: 100 mm</li>
                      <li>• Distância do objeto: 200 mm</li>
                      <li>• Distância da imagem: 200 mm</li>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpticsLab;
