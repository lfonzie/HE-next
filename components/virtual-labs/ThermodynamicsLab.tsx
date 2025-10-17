'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Thermometer, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Target,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Flame,
  Snowflake,
  Droplets,
  Wind,
  Zap
} from 'lucide-react';

interface ThermodynamicsLabProps {}

interface HeatTransfer {
  conduction: number;
  convection: number;
  radiation: number;
  total: number;
}

interface PhaseChange {
  substance: string;
  currentPhase: 'solid' | 'liquid' | 'gas';
  temperature: number;
  pressure: number;
  heatContent: number;
}

interface ThermodynamicSystem {
  temperature: number;
  pressure: number;
  volume: number;
  internalEnergy: number;
  entropy: number;
  heatCapacity: number;
}

export const ThermodynamicsLab: React.FC<ThermodynamicsLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [temperature, setTemperature] = useState(25);
  const [pressure, setPressure] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [experimentType, setExperimentType] = useState<string>('heat-transfer');
  const [heatTransfer, setHeatTransfer] = useState<HeatTransfer>({
    conduction: 0,
    convection: 0,
    radiation: 0,
    total: 0
  });
  const [phaseChange, setPhaseChange] = useState<PhaseChange>({
    substance: 'water',
    currentPhase: 'liquid',
    temperature: 25,
    pressure: 1,
    heatContent: 0
  });
  const [system, setSystem] = useState<ThermodynamicSystem>({
    temperature: 25,
    pressure: 1,
    volume: 1,
    internalEnergy: 0,
    entropy: 0,
    heatCapacity: 4.18
  });

  const experimentTypes = [
    { id: 'heat-transfer', name: 'Transferência de Calor', description: 'Condução, convecção e radiação', color: '#ef4444' },
    { id: 'phase-change', name: 'Mudança de Fase', description: 'Fusão, vaporização e sublimação', color: '#3b82f6' },
    { id: 'heat-engine', name: 'Máquina Térmica', description: 'Ciclo de Carnot e eficiência', color: '#10b981' },
    { id: 'gas-laws', name: 'Leis dos Gases', description: 'Boyle, Charles e Gay-Lussac', color: '#f59e0b' },
    { id: 'entropy', name: 'Entropia', description: 'Segunda lei da termodinâmica', color: '#8b5cf6' }
  ];

  const substances = [
    { name: 'water', label: 'Água', meltingPoint: 0, boilingPoint: 100, heatCapacity: 4.18 },
    { name: 'ice', label: 'Gelo', meltingPoint: 0, boilingPoint: 100, heatCapacity: 2.09 },
    { name: 'steam', label: 'Vapor', meltingPoint: 0, boilingPoint: 100, heatCapacity: 2.01 },
    { name: 'aluminum', label: 'Alumínio', meltingPoint: 660, boilingPoint: 2519, heatCapacity: 0.897 },
    { name: 'iron', label: 'Ferro', meltingPoint: 1538, boilingPoint: 2862, heatCapacity: 0.449 }
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
    calculateThermodynamics();
  }, [temperature, pressure, experimentType, isRunning]);

  const startSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawThermodynamics(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const calculateThermodynamics = () => {
    switch (experimentType) {
      case 'heat-transfer':
        calculateHeatTransfer();
        break;
      case 'phase-change':
        calculatePhaseChange();
        break;
      case 'heat-engine':
        calculateHeatEngine();
        break;
      case 'gas-laws':
        calculateGasLaws();
        break;
      case 'entropy':
        calculateEntropy();
        break;
    }
  };

  const calculateHeatTransfer = () => {
    // Condução: Q = k * A * (T1 - T2) / d
    const thermalConductivity = 0.6; // W/(m·K) para água
    const area = 1; // m²
    const thickness = 0.1; // m
    const tempDifference = temperature - 20; // Temperatura ambiente
    
    const conduction = thermalConductivity * area * tempDifference / thickness;
    
    // Convecção: Q = h * A * (T1 - T2)
    const convectionCoefficient = 10; // W/(m²·K)
    const convection = convectionCoefficient * area * tempDifference;
    
    // Radiação: Q = σ * ε * A * (T1⁴ - T2⁴)
    const stefanBoltzmann = 5.67e-8; // W/(m²·K⁴)
    const emissivity = 0.95;
    const tempKelvin1 = temperature + 273.15;
    const tempKelvin2 = 293.15; // 20°C em Kelvin
    
    const radiation = stefanBoltzmann * emissivity * area * 
      (Math.pow(tempKelvin1, 4) - Math.pow(tempKelvin2, 4));
    
    const total = conduction + convection + radiation;
    
    setHeatTransfer({ conduction, convection, radiation, total });
  };

  const calculatePhaseChange = () => {
    const substance = substances.find(s => s.name === phaseChange.substance);
    if (!substance) return;
    
    let currentPhase: 'solid' | 'liquid' | 'gas' = 'liquid';
    let heatContent = 0;
    
    if (temperature < substance.meltingPoint) {
      currentPhase = 'solid';
      heatContent = temperature * substance.heatCapacity;
    } else if (temperature < substance.boilingPoint) {
      currentPhase = 'liquid';
      heatContent = substance.meltingPoint * substance.heatCapacity + 
        (temperature - substance.meltingPoint) * substance.heatCapacity;
    } else {
      currentPhase = 'gas';
      heatContent = substance.meltingPoint * substance.heatCapacity + 
        (substance.boilingPoint - substance.meltingPoint) * substance.heatCapacity +
        (temperature - substance.boilingPoint) * substance.heatCapacity;
    }
    
    setPhaseChange(prev => ({
      ...prev,
      currentPhase,
      temperature,
      pressure,
      heatContent
    }));
  };

  const calculateHeatEngine = () => {
    // Ciclo de Carnot: η = 1 - (Tc/Th)
    const hotReservoirTemp = temperature + 273.15; // Kelvin
    const coldReservoirTemp = 273.15; // 0°C em Kelvin
    const efficiency = 1 - (coldReservoirTemp / hotReservoirTemp);
    
    // Trabalho realizado
    const heatInput = 1000; // J
    const workOutput = heatInput * efficiency;
    const heatRejected = heatInput - workOutput;
    
    setSystem(prev => ({
      ...prev,
      temperature,
      pressure,
      internalEnergy: workOutput,
      entropy: heatRejected / coldReservoirTemp
    }));
  };

  const calculateGasLaws = () => {
    // Lei de Boyle: P1V1 = P2V2
    // Lei de Charles: V1/T1 = V2/T2
    // Lei de Gay-Lussac: P1/T1 = P2/T2
    
    const initialTemp = 273.15; // 0°C em Kelvin
    const currentTemp = temperature + 273.15;
    const initialPressure = 1; // atm
    const initialVolume = 1; // L
    
    // Volume calculado pela lei de Charles
    const volume = initialVolume * (currentTemp / initialTemp);
    
    // Pressão calculada pela lei de Gay-Lussac
    const calculatedPressure = initialPressure * (currentTemp / initialTemp);
    
    setSystem(prev => ({
      ...prev,
      temperature,
      pressure: calculatedPressure,
      volume,
      internalEnergy: 1.5 * 8.314 * currentTemp, // Para gás ideal monoatômico
      entropy: 8.314 * Math.log(volume / initialVolume)
    }));
  };

  const calculateEntropy = () => {
    // ΔS = Q/T
    const heatAdded = temperature * system.heatCapacity;
    const tempKelvin = temperature + 273.15;
    const entropyChange = heatAdded / tempKelvin;
    
    setSystem(prev => ({
      ...prev,
      temperature,
      pressure,
      entropy: prev.entropy + entropyChange,
      internalEnergy: prev.internalEnergy + heatAdded
    }));
  };

  const drawThermodynamics = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    switch (experimentType) {
      case 'heat-transfer':
        drawHeatTransfer(ctx, width, height);
        break;
      case 'phase-change':
        drawPhaseChange(ctx, width, height);
        break;
      case 'heat-engine':
        drawHeatEngine(ctx, width, height);
        break;
      case 'gas-laws':
        drawGasLaws(ctx, width, height);
        break;
      case 'entropy':
        drawEntropy(ctx, width, height);
        break;
    }
    
    // Desenhar análise
    drawAnalysis(ctx, width, height);
  };

  const drawHeatTransfer = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Desenhar objeto quente
    ctx.fillStyle = `hsl(${Math.max(0, 60 - temperature * 2)}, 100%, 50%)`;
    ctx.fillRect(centerX - 50, centerY - 50, 100, 100);
    
    // Desenhar linhas de calor
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    
    // Condução (linhas retas)
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + 50, centerY - 30 + i * 15);
      ctx.lineTo(centerX + 150, centerY - 30 + i * 15);
      ctx.stroke();
    }
    
    // Convecção (linhas curvas)
    ctx.strokeStyle = '#3b82f6';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 50);
      ctx.quadraticCurveTo(centerX + 50, centerY - 100 - i * 20, centerX + 100, centerY - 50);
      ctx.stroke();
    }
    
    // Radiação (linhas onduladas)
    ctx.strokeStyle = '#f59e0b';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      for (let j = 0; j < 50; j++) {
        const x = centerX + Math.cos(angle) * j * 2;
        const y = centerY + Math.sin(angle) * j * 2 + Math.sin(j * 0.5) * 10;
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  };

  const drawPhaseChange = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Desenhar substância baseada na fase
    switch (phaseChange.currentPhase) {
      case 'solid':
        // Cristais/estrutura sólida
        ctx.fillStyle = '#e5e7eb';
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            ctx.fillRect(centerX - 100 + i * 20, centerY - 50 + j * 20, 15, 15);
          }
        }
        break;
        
      case 'liquid':
        // Forma líquida
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'gas':
        // Partículas gasosas
        ctx.fillStyle = '#8b5cf6';
        for (let i = 0; i < 20; i++) {
          const x = centerX - 100 + Math.random() * 200;
          const y = centerY - 100 + Math.random() * 200;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
    
    // Desenhar termômetro
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width - 50, 50, 20, 200);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width - 45, 55, 10, 190);
    
    // Mercúrio do termômetro
    const mercuryHeight = (temperature / 100) * 180;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(width - 43, 235 - mercuryHeight, 6, mercuryHeight);
  };

  const drawHeatEngine = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Reservatório quente
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(centerX - 150, centerY - 100, 100, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Reservatório Quente', centerX - 100, centerY - 50);
    ctx.fillText(`${temperature}°C`, centerX - 100, centerY - 30);
    
    // Reservatório frio
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(centerX + 50, centerY - 100, 100, 80);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Reservatório Frio', centerX + 100, centerY - 50);
    ctx.fillText('0°C', centerX + 100, centerY - 30);
    
    // Máquina térmica (círculo)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#10b981';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Máquina', centerX, centerY - 5);
    ctx.fillText('Térmica', centerX, centerY + 10);
    
    // Setas de fluxo de calor
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    
    // Calor entra
    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY);
    ctx.lineTo(centerX - 20, centerY);
    ctx.stroke();
    
    // Calor sai
    ctx.beginPath();
    ctx.moveTo(centerX + 20, centerY);
    ctx.lineTo(centerX + 50, centerY);
    ctx.stroke();
    
    // Trabalho realizado
    ctx.strokeStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY - 60);
    ctx.stroke();
  };

  const drawGasLaws = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Recipiente de gás
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 100, centerY - 80, 200, 160);
    
    // Partículas de gás
    const particleCount = Math.floor(system.volume * 50);
    ctx.fillStyle = '#8b5cf6';
    for (let i = 0; i < particleCount; i++) {
      const x = centerX - 90 + Math.random() * 180;
      const y = centerY - 70 + Math.random() * 140;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Manômetro
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width - 80, 100, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    // Ponteiro do manômetro
    const pressureAngle = (system.pressure / 5) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(width - 80, 100);
    ctx.lineTo(
      width - 80 + Math.cos(pressureAngle) * 25,
      100 + Math.sin(pressureAngle) * 25
    );
    ctx.stroke();
  };

  const drawEntropy = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Sistema isolado
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 150, centerY - 100, 300, 200);
    
    // Partículas com movimento aleatório
    ctx.fillStyle = '#8b5cf6';
    for (let i = 0; i < 30; i++) {
      const x = centerX - 140 + Math.random() * 280;
      const y = centerY - 90 + Math.random() * 180;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Indicador de entropia
    ctx.fillStyle = '#10b981';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Entropia: ${system.entropy.toFixed(2)} J/K`, centerX, centerY + 120);
  };

  const drawAnalysis = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(10, height - 120, 300, 110);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillText('Análise Termodinâmica:', 20, height - 100);
    ctx.fillText(`Temperatura: ${temperature.toFixed(1)}°C`, 20, height - 80);
    ctx.fillText(`Pressão: ${pressure.toFixed(2)} atm`, 20, height - 60);
    
    if (experimentType === 'heat-transfer') {
      ctx.fillText(`Condução: ${heatTransfer.conduction.toFixed(2)} W`, 20, height - 40);
      ctx.fillText(`Convecção: ${heatTransfer.convection.toFixed(2)} W`, 20, height - 20);
    } else if (experimentType === 'phase-change') {
      ctx.fillText(`Fase: ${phaseChange.currentPhase}`, 20, height - 40);
      ctx.fillText(`Calor: ${phaseChange.heatContent.toFixed(2)} J`, 20, height - 20);
    } else {
      ctx.fillText(`Volume: ${system.volume.toFixed(2)} L`, 20, height - 40);
      ctx.fillText(`Energia: ${system.internalEnergy.toFixed(2)} J`, 20, height - 20);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Thermometer className="w-5 h-5 text-red-600" />
            <span>Laboratório de Termodinâmica</span>
          </CardTitle>
          <CardDescription>
            Explore transferência de calor, mudanças de fase e leis da termodinâmica
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
                Temperatura: {temperature}°C
              </label>
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                min={-50}
                max={500}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pressão: {pressure} atm
              </label>
              <Slider
                value={[pressure]}
                onValueChange={(value) => setPressure(value[0])}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Seleção de substância para mudança de fase */}
          {experimentType === 'phase-change' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Substância
              </label>
              <div className="flex space-x-2">
                {substances.map((substance) => (
                  <button
                    key={substance.name}
                    onClick={() => setPhaseChange(prev => ({ ...prev, substance: substance.name }))}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      phaseChange.substance === substance.name
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {substance.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                setTemperature(25);
                setPressure(1);
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
            <span>Simulação Termodinâmica</span>
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
              Análise Detalhada
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Parâmetros:</h5>
                <ul className="space-y-1 text-blue-700">
                  <li>• Temperatura: {temperature.toFixed(1)}°C</li>
                  <li>• Pressão: {pressure.toFixed(2)} atm</li>
                  <li>• Volume: {system.volume.toFixed(2)} L</li>
                  <li>• Energia Interna: {system.internalEnergy.toFixed(2)} J</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Resultados:</h5>
                <div className="space-y-1 text-blue-700">
                  {experimentType === 'heat-transfer' && (
                    <>
                      <li>• Condução: {heatTransfer.conduction.toFixed(2)} W</li>
                      <li>• Convecção: {heatTransfer.convection.toFixed(2)} W</li>
                      <li>• Radiação: {heatTransfer.radiation.toFixed(2)} W</li>
                      <li>• Total: {heatTransfer.total.toFixed(2)} W</li>
                    </>
                  )}
                  {experimentType === 'phase-change' && (
                    <>
                      <li>• Fase Atual: {phaseChange.currentPhase}</li>
                      <li>• Conteúdo de Calor: {phaseChange.heatContent.toFixed(2)} J</li>
                      <li>• Substância: {substances.find(s => s.name === phaseChange.substance)?.label}</li>
                    </>
                  )}
                  {experimentType === 'heat-engine' && (
                    <>
                      <li>• Eficiência: {((1 - 273.15 / (temperature + 273.15)) * 100).toFixed(1)}%</li>
                      <li>• Trabalho: {system.internalEnergy.toFixed(2)} J</li>
                      <li>• Entropia: {system.entropy.toFixed(2)} J/K</li>
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

export default ThermodynamicsLab;
