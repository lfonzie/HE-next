'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Target,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Cpu,
  Battery,
  Resistor,
  Capacitor,
  Inductor
} from 'lucide-react';

interface ElectromagnetismLabProps {}

interface CircuitComponent {
  id: string;
  type: 'resistor' | 'capacitor' | 'inductor' | 'battery' | 'wire';
  value: number;
  unit: string;
  position: { x: number; y: number };
  rotation: number;
  connections: string[];
}

interface CircuitAnalysis {
  totalResistance: number;
  totalCurrent: number;
  totalVoltage: number;
  power: number;
  components: Array<{
    id: string;
    voltage: number;
    current: number;
    power: number;
  }>;
}

export const ElectromagnetismLab: React.FC<ElectromagnetismLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [voltage, setVoltage] = useState(12);
  const [frequency, setFrequency] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [circuitType, setCircuitType] = useState<string>('series');
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [analysis, setAnalysis] = useState<CircuitAnalysis | null>(null);
  const [showFieldLines, setShowFieldLines] = useState(false);
  const [magneticField, setMagneticField] = useState(0);

  const circuitTypes = [
    { id: 'series', name: 'Circuito Série', description: 'Componentes conectados em sequência', color: '#3b82f6' },
    { id: 'parallel', name: 'Circuito Paralelo', description: 'Componentes conectados lado a lado', color: '#ef4444' },
    { id: 'mixed', name: 'Circuito Misto', description: 'Combinação de série e paralelo', color: '#10b981' },
    { id: 'rc', name: 'Circuito RC', description: 'Resistor e capacitor', color: '#f59e0b' },
    { id: 'rl', name: 'Circuito RL', description: 'Resistor e indutor', color: '#8b5cf6' },
    { id: 'rlc', name: 'Circuito RLC', description: 'Resistor, indutor e capacitor', color: '#ec4899' }
  ];

  const componentTypes = [
    { id: 'resistor', name: 'Resistor', icon: Resistor, color: '#ef4444', defaultValue: 100, unit: 'Ω' },
    { id: 'capacitor', name: 'Capacitor', icon: Capacitor, color: '#3b82f6', defaultValue: 0.001, unit: 'F' },
    { id: 'inductor', name: 'Indutor', icon: Inductor, color: '#10b981', defaultValue: 0.1, unit: 'H' },
    { id: 'battery', name: 'Bateria', icon: Battery, color: '#f59e0b', defaultValue: 12, unit: 'V' }
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
    initializeCircuit();
  }, [circuitType]);

  useEffect(() => {
    if (isRunning) {
      calculateCircuitAnalysis();
    }
  }, [components, voltage, frequency, isRunning]);

  const startSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawCircuit(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const initializeCircuit = () => {
    const newComponents: CircuitComponent[] = [];
    
    switch (circuitType) {
      case 'series':
        newComponents.push(
          { id: 'battery1', type: 'battery', value: voltage, unit: 'V', position: { x: 100, y: 200 }, rotation: 0, connections: ['r1'] },
          { id: 'r1', type: 'resistor', value: 100, unit: 'Ω', position: { x: 200, y: 200 }, rotation: 0, connections: ['battery1', 'r2'] },
          { id: 'r2', type: 'resistor', value: 200, unit: 'Ω', position: { x: 300, y: 200 }, rotation: 0, connections: ['r1', 'battery1'] }
        );
        break;
        
      case 'parallel':
        newComponents.push(
          { id: 'battery1', type: 'battery', value: voltage, unit: 'V', position: { x: 100, y: 150 }, rotation: 0, connections: ['r1', 'r2'] },
          { id: 'r1', type: 'resistor', value: 100, unit: 'Ω', position: { x: 200, y: 100 }, rotation: 0, connections: ['battery1'] },
          { id: 'r2', type: 'resistor', value: 200, unit: 'Ω', position: { x: 200, y: 200 }, rotation: 0, connections: ['battery1'] }
        );
        break;
        
      case 'rc':
        newComponents.push(
          { id: 'battery1', type: 'battery', value: voltage, unit: 'V', position: { x: 100, y: 200 }, rotation: 0, connections: ['r1'] },
          { id: 'r1', type: 'resistor', value: 100, unit: 'Ω', position: { x: 200, y: 200 }, rotation: 0, connections: ['battery1', 'c1'] },
          { id: 'c1', type: 'capacitor', value: 0.001, unit: 'F', position: { x: 300, y: 200 }, rotation: 0, connections: ['r1', 'battery1'] }
        );
        break;
        
      case 'rlc':
        newComponents.push(
          { id: 'battery1', type: 'battery', value: voltage, unit: 'V', position: { x: 100, y: 200 }, rotation: 0, connections: ['r1'] },
          { id: 'r1', type: 'resistor', value: 100, unit: 'Ω', position: { x: 200, y: 200 }, rotation: 0, connections: ['battery1', 'l1'] },
          { id: 'l1', type: 'inductor', value: 0.1, unit: 'H', position: { x: 300, y: 200 }, rotation: 0, connections: ['r1', 'c1'] },
          { id: 'c1', type: 'capacitor', value: 0.001, unit: 'F', position: { x: 400, y: 200 }, rotation: 0, connections: ['l1', 'battery1'] }
        );
        break;
    }
    
    setComponents(newComponents);
  };

  const calculateCircuitAnalysis = () => {
    let totalResistance = 0;
    let totalCurrent = 0;
    let totalVoltage = voltage;
    
    // Calcular resistência total baseada no tipo de circuito
    switch (circuitType) {
      case 'series':
        totalResistance = components
          .filter(c => c.type === 'resistor')
          .reduce((sum, c) => sum + c.value, 0);
        break;
        
      case 'parallel':
        totalResistance = 1 / components
          .filter(c => c.type === 'resistor')
          .reduce((sum, c) => sum + (1 / c.value), 0);
        break;
        
      case 'rc':
        const resistor = components.find(c => c.type === 'resistor');
        const capacitor = components.find(c => c.type === 'capacitor');
        if (resistor && capacitor) {
          const reactance = 1 / (2 * Math.PI * frequency * capacitor.value);
          totalResistance = Math.sqrt(resistor.value * resistor.value + reactance * reactance);
        }
        break;
        
      case 'rlc':
        const r = components.find(c => c.type === 'resistor');
        const l = components.find(c => c.type === 'inductor');
        const c = components.find(c => c.type === 'capacitor');
        if (r && l && c) {
          const inductiveReactance = 2 * Math.PI * frequency * l.value;
          const capacitiveReactance = 1 / (2 * Math.PI * frequency * c.value);
          const reactance = inductiveReactance - capacitiveReactance;
          totalResistance = Math.sqrt(r.value * r.value + reactance * reactance);
        }
        break;
    }
    
    totalCurrent = totalVoltage / totalResistance;
    const power = totalVoltage * totalCurrent;
    
    const componentAnalysis = components.map(comp => ({
      id: comp.id,
      voltage: comp.type === 'battery' ? comp.value : totalVoltage * (comp.value / totalResistance),
      current: comp.type === 'battery' ? totalCurrent : totalCurrent,
      power: comp.type === 'battery' ? comp.value * totalCurrent : totalVoltage * totalCurrent * (comp.value / totalResistance)
    }));
    
    setAnalysis({
      totalResistance,
      totalCurrent,
      totalVoltage,
      power,
      components: componentAnalysis
    });
  };

  const drawCircuit = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Desenhar componentes
    components.forEach(component => {
      const compType = componentTypes.find(ct => ct.id === component.type);
      if (!compType) return;
      
      const IconComponent = compType.icon;
      const x = component.position.x;
      const y = component.position.y;
      
      // Desenhar componente
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(component.rotation);
      
      // Cor do componente
      ctx.fillStyle = compType.color;
      ctx.strokeStyle = compType.color;
      ctx.lineWidth = 2;
      
      // Desenhar forma baseada no tipo
      switch (component.type) {
        case 'resistor':
          ctx.fillRect(-20, -5, 40, 10);
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${component.value}${component.unit}`, 0, 25);
          break;
          
        case 'capacitor':
          ctx.beginPath();
          ctx.moveTo(-20, -10);
          ctx.lineTo(-20, 10);
          ctx.moveTo(20, -10);
          ctx.lineTo(20, 10);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${component.value}${component.unit}`, 0, 25);
          break;
          
        case 'inductor':
          ctx.beginPath();
          for (let i = -15; i <= 15; i += 5) {
            ctx.arc(i, 0, 3, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${component.value}${component.unit}`, 0, 25);
          break;
          
        case 'battery':
          ctx.fillRect(-15, -10, 30, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-10, -5, 20, 10);
          ctx.fillStyle = '#000000';
          ctx.fillRect(-5, -2, 10, 4);
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${component.value}${component.unit}`, 0, 35);
          break;
      }
      
      ctx.restore();
    });
    
    // Desenhar conexões
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    components.forEach(component => {
      component.connections.forEach(connId => {
        const connectedComponent = components.find(c => c.id === connId);
            if (connectedComponent) {
              ctx.beginPath();
              ctx.moveTo(component.position.x, component.position.y);
              ctx.lineTo(connectedComponent.position.x, connectedComponent.position.y);
              ctx.stroke();
            }
          });
        });
    
    // Desenhar linhas de campo magnético se habilitado
    if (showFieldLines) {
      drawMagneticFieldLines(ctx, width, height);
    }
    
    // Desenhar análise do circuito
    if (analysis) {
      drawAnalysis(ctx, width, height);
    }
  };

  const drawMagneticFieldLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Desenhar linhas de campo ao redor de indutores
    components.filter(c => c.type === 'inductor').forEach(inductor => {
      const x = inductor.position.x;
      const y = inductor.position.y;
      const radius = 30;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + i * 10, angle, angle + Math.PI);
        ctx.stroke();
      }
    });
    
    ctx.setLineDash([]);
  };

  const drawAnalysis = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(width - 200, 10, 190, 120);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillText('Análise do Circuito:', width - 190, 30);
    ctx.fillText(`Resistência: ${analysis.totalResistance.toFixed(2)} Ω`, width - 190, 50);
    ctx.fillText(`Corrente: ${analysis.totalCurrent.toFixed(3)} A`, width - 190, 70);
    ctx.fillText(`Voltagem: ${analysis.totalVoltage.toFixed(1)} V`, width - 190, 90);
    ctx.fillText(`Potência: ${analysis.power.toFixed(2)} W`, width - 190, 110);
  };

  const updateComponent = (componentId: string, newValue: number) => {
    setComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, value: newValue } : comp
    ));
  };

  const addComponent = (type: string) => {
    const compType = componentTypes.find(ct => ct.id === type);
    if (!compType) return;
    
    const newComponent: CircuitComponent = {
      id: `${type}_${Date.now()}`,
      type: type as any,
      value: compType.defaultValue,
      unit: compType.unit,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      rotation: 0,
      connections: []
    };
    
    setComponents(prev => [...prev, newComponent]);
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Laboratório de Eletromagnetismo</span>
          </CardTitle>
          <CardDescription>
            Explore circuitos elétricos, campos magnéticos e eletromagnetismo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de tipo de circuito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Circuito
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {circuitTypes.map((circuit) => (
                <button
                  key={circuit.id}
                  onClick={() => setCircuitType(circuit.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    circuitType === circuit.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: circuit.color }}
                    />
                    <span className="text-sm font-medium">{circuit.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{circuit.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Controles de parâmetros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voltagem: {voltage}V
              </label>
              <Slider
                value={[voltage]}
                onValueChange={(value) => setVoltage(value[0])}
                min={1}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência: {frequency}Hz
              </label>
              <Slider
                value={[frequency]}
                onValueChange={(value) => setFrequency(value[0])}
                min={1}
                max={1000}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Controles de componentes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar Componentes
            </label>
            <div className="flex space-x-2">
              {componentTypes.map((compType) => {
                const IconComponent = compType.icon;
                return (
                  <button
                    key={compType.id}
                    onClick={() => addComponent(compType.id)}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <IconComponent className="w-4 h-4" style={{ color: compType.color }} />
                    <span className="text-sm">{compType.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controles de visualização */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showFieldLines}
                onChange={(e) => setShowFieldLines(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Mostrar linhas de campo magnético</span>
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
                initializeCircuit();
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
            <span>Simulação do Circuito</span>
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
          {analysis && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Análise Detalhada do Circuito
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-800 mb-1">Parâmetros Gerais:</h5>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Resistência Total: {analysis.totalResistance.toFixed(2)} Ω</li>
                    <li>• Corrente Total: {analysis.totalCurrent.toFixed(3)} A</li>
                    <li>• Voltagem Total: {analysis.totalVoltage.toFixed(1)} V</li>
                    <li>• Potência Total: {analysis.power.toFixed(2)} W</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-blue-800 mb-1">Componentes:</h5>
                  <div className="space-y-1 text-blue-700">
                    {analysis.components.map((comp, index) => (
                      <div key={index}>
                        • {comp.id}: {comp.voltage.toFixed(2)}V, {comp.current.toFixed(3)}A, {comp.power.toFixed(2)}W
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectromagnetismLab;
