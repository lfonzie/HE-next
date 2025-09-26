'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface BouncingBallLabProps {}

export const BouncingBallLab: React.FC<BouncingBallLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [restitution, setRestitution] = useState(0.8);
  const [gravity, setGravity] = useState(9.81);
  const [airResistance, setAirResistance] = useState(0.01);
  const [initialHeight, setInitialHeight] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 300, y: initialHeight });
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);
  const [bounceCount, setBounceCount] = useState(0);
  const [maxHeight, setMaxHeight] = useState(initialHeight);

  const ballRadius = 15;
  const canvasWidth = 600;
  const canvasHeight = 400;
  const groundY = canvasHeight - 50;

  const startSimulation = () => {
    setIsRunning(true);
    setIsPaused(false);
    setBallPosition({ x: 300, y: initialHeight });
    setBallVelocity({ x: 0, y: 0 });
    setTime(0);
    setBounceCount(0);
    setMaxHeight(initialHeight);
  };

  const pauseSimulation = () => {
    setIsPaused(!isPaused);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setBallPosition({ x: 300, y: initialHeight });
    setBallVelocity({ x: 0, y: 0 });
    setTime(0);
    setBounceCount(0);
    setMaxHeight(initialHeight);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const updateBall = () => {
    if (!isRunning || isPaused) return;

    const dt = 0.016; // ~60fps
    
    // Aplicar gravidade
    const newVelocityY = ballVelocity.y + gravity * dt;
    
    // Aplicar resistência do ar
    const newVelocityX = ballVelocity.x * (1 - airResistance);
    const newVelocityYWithResistance = newVelocityY * (1 - airResistance);
    
    // Atualizar posição
    const newX = ballPosition.x + newVelocityX * dt;
    const newY = ballPosition.y + newVelocityYWithResistance * dt;
    
    // Verificar colisão com o chão
    if (newY + ballRadius >= groundY) {
      setBallPosition(prev => ({ ...prev, y: groundY - ballRadius }));
      setBallVelocity(prev => ({ 
        x: prev.x * restitution, 
        y: -Math.abs(prev.y) * restitution 
      }));
      setBounceCount(prev => prev + 1);
    } else {
      setBallPosition({ x: newX, y: newY });
      setBallVelocity({ x: newVelocityX, y: newVelocityYWithResistance });
    }
    
    // Verificar colisão com as paredes
    if (newX - ballRadius <= 0 || newX + ballRadius >= canvasWidth) {
      setBallVelocity(prev => ({ ...prev, x: -prev.x * restitution }));
    }
    
    // Atualizar altura máxima
    setMaxHeight(prev => Math.max(prev, groundY - newY));
    
    setTime(prev => prev + dt);
  };

  const drawBall = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Draw ball
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(ballPosition.x, ballPosition.y, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(ballPosition.x, groundY, ballRadius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Draw trajectory
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(300, initialHeight);
    ctx.lineTo(ballPosition.x, ballPosition.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw info
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Posição: (${ballPosition.x.toFixed(0)}, ${(groundY - ballPosition.y).toFixed(0)})`, 10, 30);
    ctx.fillText(`Velocidade: (${ballVelocity.x.toFixed(1)}, ${ballVelocity.y.toFixed(1)})`, 10, 50);
    ctx.fillText(`Tempo: ${time.toFixed(1)}s`, 10, 70);
    ctx.fillText(`Quiques: ${bounceCount}`, 10, 90);
    ctx.fillText(`Altura Máxima: ${maxHeight.toFixed(0)}px`, 10, 110);
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      const animate = () => {
        updateBall();
        drawBall();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      drawBall();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, isPaused, ballPosition, ballVelocity, time, bounceCount, maxHeight]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Canvas Area */}
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Simulação de Bola Saltitante</span>
            </CardTitle>
            <CardDescription>
              Explore gravidade, elasticidade e resistência do ar
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
                Coeficiente de Restituição: {restitution}
              </label>
              <Slider
                value={[restitution]}
                onValueChange={(value) => setRestitution(value[0])}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
            
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
                Altura Inicial: {initialHeight}px
              </label>
              <Slider
                value={[initialHeight]}
                onValueChange={(value) => setInitialHeight(value[0])}
                min={100}
                max={350}
                step={10}
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
                Resistência do Ar: {airResistance}
              </label>
              <Slider
                value={[airResistance]}
                onValueChange={(value) => setAirResistance(value[0])}
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
              <div className="text-2xl font-bold text-blue-600">{bounceCount}</div>
              <div className="text-sm text-gray-600">Quiques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{maxHeight.toFixed(0)}px</div>
              <div className="text-sm text-gray-600">Altura Máxima</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{ballVelocity.y.toFixed(1)}px/s</div>
              <div className="text-sm text-gray-600">Velocidade Y</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{time.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Tempo</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Coeficiente de Restituição:</strong> Mede a elasticidade da colisão (0 = inelástica, 1 = perfeitamente elástica)
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Resistência do Ar:</strong> Força que se opõe ao movimento da bola
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
