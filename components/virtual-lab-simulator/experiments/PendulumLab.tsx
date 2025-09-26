'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Clock, RotateCcw, Play, Pause } from 'lucide-react';

interface PendulumLabProps {}

export const PendulumLab: React.FC<PendulumLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [length, setLength] = useState(100);
  const [angle, setAngle] = useState(30);
  const [mass, setMass] = useState(1);
  const [gravity, setGravity] = useState(9.81);
  const [damping, setDamping] = useState(0.01);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(angle);
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [time, setTime] = useState(0);
  const [period, setPeriod] = useState(0);

  const calculatePeriod = (l: number, g: number) => {
    return 2 * Math.PI * Math.sqrt(l / g);
  };

  const updatePendulum = () => {
    if (!isRunning || isPaused) return;

    const dt = 0.016; // ~60fps
    const angularAcceleration = -(gravity / length) * Math.sin(currentAngle) - damping * angularVelocity;
    
    setAngularVelocity(prev => prev + angularAcceleration * dt);
    setCurrentAngle(prev => prev + angularVelocity * dt);
    setTime(prev => prev + dt);
  };

  const startSimulation = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentAngle(angle);
    setAngularVelocity(0);
    setTime(0);
  };

  const pauseSimulation = () => {
    setIsPaused(!isPaused);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentAngle(angle);
    setAngularVelocity(0);
    setTime(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawPendulum = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = 50;
    const pendulumLength = length * 2;
    const bobRadius = 10 + mass * 5;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pivot point
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw string
    const bobX = centerX + pendulumLength * Math.sin(currentAngle);
    const bobY = centerY + pendulumLength * Math.cos(currentAngle);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Draw bob
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw trajectory
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, pendulumLength, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw angle indicator
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + 50 * Math.sin(currentAngle), centerY + 50 * Math.cos(currentAngle));
    ctx.stroke();

    // Draw angle text
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Ângulo: ${(currentAngle * 180 / Math.PI).toFixed(1)}°`, 10, 30);
    ctx.fillText(`Velocidade: ${(angularVelocity * 180 / Math.PI).toFixed(1)}°/s`, 10, 50);
    ctx.fillText(`Tempo: ${time.toFixed(1)}s`, 10, 70);
    ctx.fillText(`Período: ${period.toFixed(2)}s`, 10, 90);
  };

  useEffect(() => {
    setPeriod(calculatePeriod(length, gravity));
  }, [length, gravity]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      const animate = () => {
        updatePendulum();
        drawPendulum();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      drawPendulum();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, isPaused, currentAngle, angularVelocity, time, length, mass, gravity, damping]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Canvas Area */}
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Simulação de Pêndulo</span>
            </CardTitle>
            <CardDescription>
              Observe o movimento harmônico simples do pêndulo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="w-full h-full border border-gray-200 rounded-lg bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Comprimento: {length}cm
              </label>
              <Slider
                value={[length]}
                onValueChange={(value) => setLength(value[0])}
                min={50}
                max={200}
                step={10}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ângulo Inicial: {angle}°
              </label>
              <Slider
                value={[angle]}
                onValueChange={(value) => setAngle(value[0])}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Massa: {mass}kg
              </label>
              <Slider
                value={[mass]}
                onValueChange={(value) => setMass(value[0])}
                min={0.5}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Gravidade: {gravity}m/s²
              </label>
              <Slider
                value={[gravity]}
                onValueChange={(value) => setGravity(value[0])}
                min={1}
                max={20}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Amortecimento: {damping}
              </label>
              <Slider
                value={[damping]}
                onValueChange={(value) => setDamping(value[0])}
                min={0}
                max={0.1}
                step={0.001}
                className="w-full"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={startSimulation}
                disabled={isRunning && !isPaused}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
              <Button
                onClick={pauseSimulation}
                disabled={!isRunning}
                variant="outline"
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                {isPaused ? 'Continuar' : 'Pausar'}
              </Button>
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{period.toFixed(2)}s</div>
              <div className="text-sm text-gray-600">Período</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(currentAngle * 180 / Math.PI).toFixed(1)}°</div>
              <div className="text-sm text-gray-600">Ângulo Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{(angularVelocity * 180 / Math.PI).toFixed(1)}°/s</div>
              <div className="text-sm text-gray-600">Velocidade Angular</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{time.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Tempo</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Fórmula do Período:</strong> T = 2π√(L/g)
            </p>
            <p className="text-sm text-blue-800 mt-1">
              O período de um pêndulo simples depende apenas do comprimento e da gravidade, não da massa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
