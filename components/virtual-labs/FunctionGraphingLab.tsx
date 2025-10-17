'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Play, 
  Pause, 
  RotateCcw,
  Target,
  CheckCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface FunctionGraphingLabProps {}

export const FunctionGraphingLab: React.FC<FunctionGraphingLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [functionType, setFunctionType] = useState<string>('linear');
  const [isAnimating, setIsAnimating] = useState(false);
  const [parameters, setParameters] = useState({
    a: 1,
    b: 0,
    c: 0,
    amplitude: 1,
    frequency: 1,
    phase: 0
  });
  const [domain, setDomain] = useState({ min: -10, max: 10 });
  const [range, setRange] = useState({ min: -10, max: 10 });
  const [points, setPoints] = useState<Array<{x: number, y: number}>>([]);

  const functionTypes = [
    { id: 'linear', name: 'Linear', description: 'f(x) = ax + b', color: '#3b82f6' },
    { id: 'quadratic', name: 'Quadrática', description: 'f(x) = ax² + bx + c', color: '#ef4444' },
    { id: 'exponential', name: 'Exponencial', description: 'f(x) = a^x', color: '#10b981' },
    { id: 'logarithmic', name: 'Logarítmica', description: 'f(x) = log(x)', color: '#f59e0b' },
    { id: 'trigonometric', name: 'Trigonométrica', description: 'f(x) = a·sin(bx + c)', color: '#8b5cf6' },
    { id: 'rational', name: 'Racional', description: 'f(x) = 1/x', color: '#ec4899' }
  ];

  useEffect(() => {
    if (isAnimating) {
      startAnimation();
    } else {
      stopAnimation();
    }
    
    return () => stopAnimation();
  }, [isAnimating]);

  useEffect(() => {
    drawFunction();
  }, [functionType, parameters, domain, range]);

  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawFunction();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const calculateFunction = (x: number): number => {
    switch (functionType) {
      case 'linear':
        return parameters.a * x + parameters.b;
      case 'quadratic':
        return parameters.a * x * x + parameters.b * x + parameters.c;
      case 'exponential':
        return Math.pow(parameters.a, x);
      case 'logarithmic':
        return Math.log(Math.abs(x)) || 0;
      case 'trigonometric':
        return parameters.amplitude * Math.sin(parameters.frequency * x + parameters.phase);
      case 'rational':
        return x !== 0 ? 1 / x : 0;
      default:
        return 0;
    }
  };

  const drawFunction = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    // Configurar coordenadas
    const xScale = width / (domain.max - domain.min);
    const yScale = height / (range.max - range.min);
    
    const xOffset = -domain.min * xScale;
    const yOffset = range.max * yScale;

    // Desenhar eixos
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // Eixo X
    ctx.beginPath();
    ctx.moveTo(0, yOffset);
    ctx.lineTo(width, yOffset);
    ctx.stroke();
    
    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(xOffset, 0);
    ctx.lineTo(xOffset, height);
    ctx.stroke();

    // Desenhar grade
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Linhas verticais
    for (let x = domain.min; x <= domain.max; x++) {
      const xPos = x * xScale + xOffset;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, height);
      ctx.stroke();
    }
    
    // Linhas horizontais
    for (let y = range.min; y <= range.max; y++) {
      const yPos = -y * yScale + yOffset;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(width, yPos);
      ctx.stroke();
    }

    // Desenhar função
    const functionColor = functionTypes.find(f => f.id === functionType)?.color || '#3b82f6';
    ctx.strokeStyle = functionColor;
    ctx.lineWidth = 3;
    ctx.beginPath();

    let firstPoint = true;
    const step = (domain.max - domain.min) / width;
    
    for (let x = domain.min; x <= domain.max; x += step) {
      const y = calculateFunction(x);
      
      if (y >= range.min && y <= range.max) {
        const xPos = x * xScale + xOffset;
        const yPos = -y * yScale + yOffset;
        
        if (firstPoint) {
          ctx.moveTo(xPos, yPos);
          firstPoint = false;
        } else {
          ctx.lineTo(xPos, yPos);
        }
      }
    }
    
    ctx.stroke();

    // Desenhar pontos especiais
    const specialPoints = findSpecialPoints();
    specialPoints.forEach(point => {
      const xPos = point.x * xScale + xOffset;
      const yPos = -point.y * yScale + yOffset;
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(xPos, yPos, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Adicionar labels dos eixos
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Labels do eixo X
    for (let x = domain.min; x <= domain.max; x += 2) {
      const xPos = x * xScale + xOffset;
      ctx.fillText(x.toString(), xPos, yOffset + 15);
    }
    
    // Labels do eixo Y
    for (let y = range.min; y <= range.max; y += 2) {
      const yPos = -y * yScale + yOffset;
      ctx.fillText(y.toString(), xOffset - 15, yPos + 4);
    }
  };

  const findSpecialPoints = () => {
    const points: Array<{x: number, y: number, type: string}> = [];
    
    // Encontrar zeros da função
    for (let x = domain.min; x <= domain.max; x += 0.1) {
      const y = calculateFunction(x);
      if (Math.abs(y) < 0.1) {
        points.push({ x, y, type: 'zero' });
      }
    }
    
    // Encontrar máximo/mínimo para funções quadráticas
    if (functionType === 'quadratic' && parameters.a !== 0) {
      const vertexX = -parameters.b / (2 * parameters.a);
      const vertexY = calculateFunction(vertexX);
      if (vertexX >= domain.min && vertexX <= domain.max) {
        points.push({ x: vertexX, y: vertexY, type: 'vertex' });
      }
    }
    
    return points;
  };

  const updateParameter = (param: string, value: number) => {
    setParameters(prev => ({ ...prev, [param]: value }));
  };

  const addPoint = (x: number) => {
    const y = calculateFunction(x);
    setPoints(prev => [...prev, { x, y }]);
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Gráficos de Funções</span>
          </CardTitle>
          <CardDescription>
            Explore propriedades de diferentes tipos de funções matemáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de tipo de função */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Função
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {functionTypes.map((func) => (
                <button
                  key={func.id}
                  onClick={() => setFunctionType(func.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    functionType === func.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: func.color }}
                    />
                    <span className="text-sm font-medium">{func.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{func.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Parâmetros específicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {functionType === 'linear' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coeficiente Angular (a): {parameters.a}
                  </label>
                  <Slider
                    value={[parameters.a]}
                    onValueChange={(value) => updateParameter('a', value[0])}
                    min={-5}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coeficiente Linear (b): {parameters.b}
                  </label>
                  <Slider
                    value={[parameters.b]}
                    onValueChange={(value) => updateParameter('b', value[0])}
                    min={-10}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            {functionType === 'quadratic' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coeficiente a: {parameters.a}
                  </label>
                  <Slider
                    value={[parameters.a]}
                    onValueChange={(value) => updateParameter('a', value[0])}
                    min={-3}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coeficiente b: {parameters.b}
                  </label>
                  <Slider
                    value={[parameters.b]}
                    onValueChange={(value) => updateParameter('b', value[0])}
                    min={-5}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coeficiente c: {parameters.c}
                  </label>
                  <Slider
                    value={[parameters.c]}
                    onValueChange={(value) => updateParameter('c', value[0])}
                    min={-5}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            {functionType === 'trigonometric' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amplitude: {parameters.amplitude}
                  </label>
                  <Slider
                    value={[parameters.amplitude]}
                    onValueChange={(value) => updateParameter('amplitude', value[0])}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência: {parameters.frequency}
                  </label>
                  <Slider
                    value={[parameters.frequency]}
                    onValueChange={(value) => updateParameter('frequency', value[0])}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fase: {parameters.phase}
                  </label>
                  <Slider
                    value={[parameters.phase]}
                    onValueChange={(value) => updateParameter('phase', value[0])}
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>

          {/* Controles de domínio e imagem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domínio: [{domain.min}, {domain.max}]
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={domain.min}
                  onChange={(e) => setDomain(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  value={domain.max}
                  onChange={(e) => setDomain(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem: [{range.min}, {range.max}]
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={range.min}
                  onChange={(e) => setRange(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  value={range.max}
                  onChange={(e) => setRange(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Botões de controle */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsAnimating(!isAnimating)}
              className={isAnimating ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
            >
              {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAnimating ? 'Pausar' : 'Animar'}
            </Button>
            
            <Button
              onClick={() => {
                setPoints([]);
                setParameters({
                  a: 1, b: 0, c: 0,
                  amplitude: 1, frequency: 1, phase: 0
                });
                setDomain({ min: -10, max: 10 });
                setRange({ min: -10, max: 10 });
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
            <span>Gráfico da Função</span>
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
          
          {/* Análise da função */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Análise da Função
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Propriedades:</h5>
                <ul className="space-y-1 text-blue-700">
                  <li>• Domínio: [{domain.min}, {domain.max}]</li>
                  <li>• Imagem: [{range.min}, {range.max}]</li>
                  {functionType === 'linear' && (
                    <li>• Inclinação: {parameters.a}</li>
                  )}
                  {functionType === 'quadratic' && (
                    <>
                      <li>• Concavidade: {parameters.a > 0 ? 'Para cima' : 'Para baixo'}</li>
                      <li>• Vértice: ({(-parameters.b / (2 * parameters.a)).toFixed(2)}, {calculateFunction(-parameters.b / (2 * parameters.a)).toFixed(2)})</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Pontos Especiais:</h5>
                <div className="space-y-1 text-blue-700">
                  {findSpecialPoints().map((point, index) => (
                    <div key={index}>
                      • {point.type === 'zero' ? 'Zero' : 'Vértice'}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionGraphingLab;
