'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Atom, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Target,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Flask,
  Zap,
  Shield,
  Activity,
  Layers
} from 'lucide-react';

interface OrganicChemistryLabProps {}

interface Molecule {
  id: string;
  name: string;
  formula: string;
  structure: {
    atoms: Array<{
      id: string;
      element: string;
      position: { x: number; y: number };
      bonds: string[];
    }>;
    bonds: Array<{
      id: string;
      from: string;
      to: string;
      type: 'single' | 'double' | 'triple';
    }>;
  };
  properties: {
    molecularWeight: number;
    meltingPoint: number;
    boilingPoint: number;
    solubility: string;
    reactivity: number;
  };
}

interface Reaction {
  id: string;
  name: string;
  reactants: string[];
  products: string[];
  conditions: {
    temperature: number;
    pressure: number;
    catalyst: string;
    solvent: string;
  };
  mechanism: string;
  yield: number;
}

interface SynthesisStep {
  step: number;
  description: string;
  reactants: string[];
  products: string[];
  conditions: string;
  yield: number;
  time: number;
}

export const OrganicChemistryLab: React.FC<OrganicChemistryLabProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [temperature, setTemperature] = useState(25);
  const [pressure, setPressure] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [experimentType, setExperimentType] = useState<string>('synthesis');
  const [currentMolecule, setCurrentMolecule] = useState<Molecule | null>(null);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [synthesisSteps, setSynthesisSteps] = useState<SynthesisStep[]>([]);
  const [show3D, setShow3D] = useState(false);
  const [showElectrons, setShowElectrons] = useState(false);

  const experimentTypes = [
    { id: 'synthesis', name: 'Síntese Orgânica', description: 'Crie moléculas complexas passo a passo', color: '#3b82f6' },
    { id: 'reaction-mechanism', name: 'Mecanismo de Reação', description: 'Visualize como as reações ocorrem', color: '#ef4444' },
    { id: 'functional-groups', name: 'Grupos Funcionais', description: 'Identifique e transforme grupos funcionais', color: '#10b981' },
    { id: 'stereochemistry', name: 'Estereoquímica', description: 'Explore isômeros e quiralidade', color: '#f59e0b' },
    { id: 'spectroscopy', name: 'Espectroscopia', description: 'Analise estruturas com espectros', color: '#8b5cf6' },
    { id: 'drug-design', name: 'Design de Fármacos', description: 'Crie medicamentos virtuais', color: '#ec4899' }
  ];

  const molecules: Molecule[] = [
    {
      id: 'benzene',
      name: 'Benzeno',
      formula: 'C₆H₆',
      structure: {
        atoms: [
          { id: 'C1', element: 'C', position: { x: 200, y: 150 }, bonds: ['C2', 'C6'] },
          { id: 'C2', element: 'C', position: { x: 250, y: 120 }, bonds: ['C1', 'C3'] },
          { id: 'C3', element: 'C', position: { x: 300, y: 150 }, bonds: ['C2', 'C4'] },
          { id: 'C4', element: 'C', position: { x: 300, y: 200 }, bonds: ['C3', 'C5'] },
          { id: 'C5', element: 'C', position: { x: 250, y: 230 }, bonds: ['C4', 'C6'] },
          { id: 'C6', element: 'C', position: { x: 200, y: 200 }, bonds: ['C5', 'C1'] }
        ],
        bonds: [
          { id: 'b1', from: 'C1', to: 'C2', type: 'single' },
          { id: 'b2', from: 'C2', to: 'C3', type: 'double' },
          { id: 'b3', from: 'C3', to: 'C4', type: 'single' },
          { id: 'b4', from: 'C4', to: 'C5', type: 'double' },
          { id: 'b5', from: 'C5', to: 'C6', type: 'single' },
          { id: 'b6', from: 'C6', to: 'C1', type: 'double' }
        ]
      },
      properties: {
        molecularWeight: 78.11,
        meltingPoint: 5.5,
        boilingPoint: 80.1,
        solubility: 'Insolúvel em água',
        reactivity: 0.3
      }
    },
    {
      id: 'ethanol',
      name: 'Etanol',
      formula: 'C₂H₅OH',
      structure: {
        atoms: [
          { id: 'C1', element: 'C', position: { x: 200, y: 200 }, bonds: ['C2', 'H1', 'H2', 'H3'] },
          { id: 'C2', element: 'C', position: { x: 250, y: 200 }, bonds: ['C1', 'O1', 'H4', 'H5'] },
          { id: 'O1', element: 'O', position: { x: 280, y: 180 }, bonds: ['C2', 'H6'] },
          { id: 'H1', element: 'H', position: { x: 180, y: 180 }, bonds: ['C1'] },
          { id: 'H2', element: 'H', position: { x: 180, y: 220 }, bonds: ['C1'] },
          { id: 'H3', element: 'H', position: { x: 200, y: 240 }, bonds: ['C1'] },
          { id: 'H4', element: 'H', position: { x: 250, y: 240 }, bonds: ['C2'] },
          { id: 'H5', element: 'H', position: { x: 270, y: 200 }, bonds: ['C2'] },
          { id: 'H6', element: 'H', position: { x: 300, y: 180 }, bonds: ['O1'] }
        ],
        bonds: [
          { id: 'b1', from: 'C1', to: 'C2', type: 'single' },
          { id: 'b2', from: 'C2', to: 'O1', type: 'single' },
          { id: 'b3', from: 'O1', to: 'H6', type: 'single' }
        ]
      },
      properties: {
        molecularWeight: 46.07,
        meltingPoint: -114.1,
        boilingPoint: 78.4,
        solubility: 'Miscível com água',
        reactivity: 0.7
      }
    },
    {
      id: 'aspirin',
      name: 'Ácido Acetilsalicílico',
      formula: 'C₉H₈O₄',
      structure: {
        atoms: [
          { id: 'C1', element: 'C', position: { x: 200, y: 200 }, bonds: ['C2', 'C6', 'H1', 'H2'] },
          { id: 'C2', element: 'C', position: { x: 250, y: 200 }, bonds: ['C1', 'C3', 'H3', 'H4'] },
          { id: 'C3', element: 'C', position: { x: 300, y: 200 }, bonds: ['C2', 'C4', 'H5', 'H6'] },
          { id: 'C4', element: 'C', position: { x: 350, y: 200 }, bonds: ['C3', 'C5', 'H7', 'H8'] },
          { id: 'C5', element: 'C', position: { x: 400, y: 200 }, bonds: ['C4', 'C6', 'H9', 'H10'] },
          { id: 'C6', element: 'C', position: { x: 200, y: 150 }, bonds: ['C1', 'C5', 'O1', 'O2'] },
          { id: 'O1', element: 'O', position: { x: 180, y: 130 }, bonds: ['C6', 'C7'] },
          { id: 'O2', element: 'O', position: { x: 200, y: 100 }, bonds: ['C6', 'H11'] },
          { id: 'C7', element: 'C', position: { x: 150, y: 130 }, bonds: ['O1', 'O3', 'O4'] },
          { id: 'O3', element: 'O', position: { x: 130, y: 110 }, bonds: ['C7'] },
          { id: 'O4', element: 'O', position: { x: 130, y: 150 }, bonds: ['C7'] }
        ],
        bonds: [
          { id: 'b1', from: 'C1', to: 'C2', type: 'single' },
          { id: 'b2', from: 'C2', to: 'C3', type: 'single' },
          { id: 'b3', from: 'C3', to: 'C4', type: 'single' },
          { id: 'b4', from: 'C4', to: 'C5', type: 'single' },
          { id: 'b5', from: 'C5', to: 'C6', type: 'single' },
          { id: 'b6', from: 'C6', to: 'C1', type: 'single' },
          { id: 'b7', from: 'C6', to: 'O1', type: 'single' },
          { id: 'b8', from: 'C6', to: 'O2', type: 'double' },
          { id: 'b9', from: 'O1', to: 'C7', type: 'single' },
          { id: 'b10', from: 'C7', to: 'O3', type: 'double' },
          { id: 'b11', from: 'C7', to: 'O4', type: 'single' }
        ]
      },
      properties: {
        molecularWeight: 180.16,
        meltingPoint: 135,
        boilingPoint: 140,
        solubility: 'Pouco solúvel em água',
        reactivity: 0.5
      }
    }
  ];

  const reactions: Reaction[] = [
    {
      id: 'esterification',
      name: 'Esterificação',
      reactants: ['Ácido Carboxílico', 'Álcool'],
      products: ['Éster', 'Água'],
      conditions: {
        temperature: 80,
        pressure: 1,
        catalyst: 'Ácido Sulfúrico',
        solvent: 'Água'
      },
      mechanism: 'Substituição Nucleofílica',
      yield: 85
    },
    {
      id: 'aldol-condensation',
      name: 'Condensação Aldólica',
      reactants: ['Aldeído', 'Cetona'],
      products: ['β-Hidroxicetona'],
      conditions: {
        temperature: 25,
        pressure: 1,
        catalyst: 'Hidróxido de Sódio',
        solvent: 'Etanol'
      },
      mechanism: 'Condensação',
      yield: 70
    },
    {
      id: 'grignard',
      name: 'Reação de Grignard',
      reactants: ['Haleto de Alquila', 'Magnésio'],
      products: ['Reagente de Grignard'],
      conditions: {
        temperature: 0,
        pressure: 1,
        catalyst: 'Iodo',
        solvent: 'Éter'
      },
      mechanism: 'Formação de Organometálico',
      yield: 90
    }
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

  const startSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawChemistry(ctx, canvas.width, canvas.height);
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
    setCurrentMolecule(null);
    setReaction(null);
    setSynthesisSteps([]);

    switch (experimentType) {
      case 'synthesis':
        initializeSynthesis();
        break;
      case 'reaction-mechanism':
        initializeReactionMechanism();
        break;
      case 'functional-groups':
        initializeFunctionalGroups();
        break;
      case 'stereochemistry':
        initializeStereochemistry();
        break;
      case 'spectroscopy':
        initializeSpectroscopy();
        break;
      case 'drug-design':
        initializeDrugDesign();
        break;
    }
  };

  const initializeSynthesis = () => {
    setCurrentMolecule(molecules[0]); // Benzeno
    
    const steps: SynthesisStep[] = [
      {
        step: 1,
        description: 'Nitração do Benzeno',
        reactants: ['Benzeno', 'Ácido Nítrico'],
        products: ['Nitrobenzeno'],
        conditions: 'H₂SO₄, 50°C',
        yield: 85,
        time: 2
      },
      {
        step: 2,
        description: 'Redução do Nitrobenzeno',
        reactants: ['Nitrobenzeno', 'Hidrogênio'],
        products: ['Anilina'],
        conditions: 'Ni, 100°C',
        yield: 90,
        time: 3
      },
      {
        step: 3,
        description: 'Acetilação da Anilina',
        reactants: ['Anilina', 'Anidrido Acético'],
        products: ['Acetanilida'],
        conditions: 'Ácido Acético, 80°C',
        yield: 95,
        time: 1
      }
    ];
    
    setSynthesisSteps(steps);
  };

  const initializeReactionMechanism = () => {
    setReaction(reactions[0]); // Esterificação
  };

  const initializeFunctionalGroups = () => {
    setCurrentMolecule(molecules[1]); // Etanol
  };

  const initializeStereochemistry = () => {
    setCurrentMolecule(molecules[2]); // Aspirina
  };

  const initializeSpectroscopy = () => {
    setCurrentMolecule(molecules[0]); // Benzeno
  };

  const initializeDrugDesign = () => {
    setCurrentMolecule(molecules[2]); // Aspirina
  };

  const drawChemistry = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    switch (experimentType) {
      case 'synthesis':
        drawSynthesis(ctx, width, height);
        break;
      case 'reaction-mechanism':
        drawReactionMechanism(ctx, width, height);
        break;
      case 'functional-groups':
        drawFunctionalGroups(ctx, width, height);
        break;
      case 'stereochemistry':
        drawStereochemistry(ctx, width, height);
        break;
      case 'spectroscopy':
        drawSpectroscopy(ctx, width, height);
        break;
      case 'drug-design':
        drawDrugDesign(ctx, width, height);
        break;
    }
    
    // Desenhar análise
    drawAnalysis(ctx, width, height);
  };

  const drawSynthesis = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!currentMolecule) return;
    
    // Desenhar molécula atual
    drawMolecule(ctx, currentMolecule, width / 2, height / 2);
    
    // Desenhar passos da síntese
    const stepWidth = width / synthesisSteps.length;
    synthesisSteps.forEach((step, index) => {
      const x = index * stepWidth + stepWidth / 2;
      const y = height - 100;
      
      // Desenhar passo
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(x - 40, y - 20, 80, 40);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Passo ${step.step}`, x, y - 5);
      ctx.fillText(`${step.yield}%`, x, y + 10);
      
      // Desenhar seta para o próximo passo
      if (index < synthesisSteps.length - 1) {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 40, y);
        ctx.lineTo(x + stepWidth - 40, y);
        ctx.stroke();
        
        // Seta
        ctx.beginPath();
        ctx.moveTo(x + stepWidth - 50, y - 5);
        ctx.lineTo(x + stepWidth - 40, y);
        ctx.lineTo(x + stepWidth - 50, y + 5);
        ctx.stroke();
      }
    });
  };

  const drawReactionMechanism = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!reaction) return;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Desenhar reagentes
    ctx.fillStyle = '#3b82f6';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(reaction.reactants.join(' + '), centerX - 150, centerY);
    
    // Desenhar seta de reação
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY);
    ctx.lineTo(centerX + 50, centerY);
    ctx.stroke();
    
    // Desenhar produtos
    ctx.fillStyle = '#10b981';
    ctx.fillText(reaction.products.join(' + '), centerX + 150, centerY);
    
    // Desenhar condições
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText(`T: ${reaction.conditions.temperature}°C`, centerX, centerY + 30);
    ctx.fillText(`P: ${reaction.conditions.pressure} atm`, centerX, centerY + 50);
    ctx.fillText(`Catalisador: ${reaction.conditions.catalyst}`, centerX, centerY + 70);
  };

  const drawFunctionalGroups = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!currentMolecule) return;
    
    // Desenhar molécula
    drawMolecule(ctx, currentMolecule, width / 2, height / 2);
    
    // Destacar grupos funcionais
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    
    if (currentMolecule.id === 'ethanol') {
      // Destacar grupo OH
      ctx.beginPath();
      ctx.arc(280, 180, 20, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = '#f59e0b';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Grupo Hidroxila', 280, 210);
    }
  };

  const drawStereochemistry = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!currentMolecule) return;
    
    // Desenhar molécula em 3D se habilitado
    if (show3D) {
      drawMolecule3D(ctx, currentMolecule, width / 2, height / 2);
    } else {
      drawMolecule(ctx, currentMolecule, width / 2, height / 2);
    }
    
    // Desenhar centros quirais
    ctx.fillStyle = '#8b5cf6';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Centros Quirais', width / 2, height - 50);
  };

  const drawSpectroscopy = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!currentMolecule) return;
    
    // Desenhar molécula
    drawMolecule(ctx, currentMolecule, width / 2, height / 2);
    
    // Desenhar espectro IR simulado
    const spectrumWidth = 200;
    const spectrumHeight = 100;
    const spectrumX = width - spectrumWidth - 20;
    const spectrumY = 20;
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(spectrumX, spectrumY, spectrumWidth, spectrumHeight);
    
    // Desenhar picos do espectro
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    
    const peaks = [
      { x: spectrumX + 20, y: spectrumY + 80, intensity: 0.8 },
      { x: spectrumX + 60, y: spectrumY + 60, intensity: 0.6 },
      { x: spectrumX + 100, y: spectrumY + 40, intensity: 0.9 },
      { x: spectrumX + 140, y: spectrumY + 70, intensity: 0.5 },
      { x: spectrumX + 180, y: spectrumY + 30, intensity: 0.7 }
    ];
    
    peaks.forEach(peak => {
      ctx.beginPath();
      ctx.moveTo(peak.x, spectrumY + spectrumHeight);
      ctx.lineTo(peak.x, peak.y);
      ctx.stroke();
    });
    
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Espectro IR', spectrumX + spectrumWidth / 2, spectrumY + spectrumHeight + 20);
  };

  const drawDrugDesign = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!currentMolecule) return;
    
    // Desenhar molécula
    drawMolecule(ctx, currentMolecule, width / 2, height / 2);
    
    // Desenhar propriedades farmacológicas
    const properties = [
      { name: 'LogP', value: 1.2, color: '#3b82f6' },
      { name: 'MW', value: currentMolecule.properties.molecularWeight, color: '#10b981' },
      { name: 'TPSA', value: 43.3, color: '#f59e0b' },
      { name: 'HBD', value: 1, color: '#ef4444' }
    ];
    
    const propWidth = 80;
    const propHeight = 60;
    const startX = 20;
    const startY = 20;
    
    properties.forEach((prop, index) => {
      const x = startX + index * (propWidth + 10);
      const y = startY;
      
      ctx.fillStyle = prop.color;
      ctx.fillRect(x, y, propWidth, propHeight);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(prop.name, x + propWidth / 2, y + 20);
      ctx.fillText(prop.value.toString(), x + propWidth / 2, y + 40);
    });
  };

  const drawMolecule = (ctx: CanvasRenderingContext2D, molecule: Molecule, centerX: number, centerY: number) => {
    // Desenhar ligações primeiro
    molecule.structure.bonds.forEach(bond => {
      const fromAtom = molecule.structure.atoms.find(a => a.id === bond.from);
      const toAtom = molecule.structure.atoms.find(a => a.id === bond.to);
      
      if (fromAtom && toAtom) {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = bond.type === 'single' ? 2 : bond.type === 'double' ? 4 : 6;
        
        ctx.beginPath();
        ctx.moveTo(centerX + fromAtom.position.x - 200, centerY + fromAtom.position.y - 200);
        ctx.lineTo(centerX + toAtom.position.x - 200, centerY + toAtom.position.y - 200);
        ctx.stroke();
      }
    });
    
    // Desenhar átomos
    molecule.structure.atoms.forEach(atom => {
      const x = centerX + atom.position.x - 200;
      const y = centerY + atom.position.y - 200;
      
      // Cor baseada no elemento
      let color = '#6b7280'; // Cinza padrão
      switch (atom.element) {
        case 'C': color = '#374151'; break;
        case 'H': color = '#ffffff'; break;
        case 'O': color = '#ef4444'; break;
        case 'N': color = '#3b82f6'; break;
        case 'S': color = '#fbbf24'; break;
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Desenhar símbolo do elemento
      ctx.fillStyle = atom.element === 'H' ? '#000000' : '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(atom.element, x, y + 4);
    });
  };

  const drawMolecule3D = (ctx: CanvasRenderingContext2D, molecule: Molecule, centerX: number, centerY: number) => {
    // Versão simplificada de visualização 3D
    molecule.structure.atoms.forEach(atom => {
      const x = centerX + atom.position.x - 200;
      const y = centerY + atom.position.y - 200;
      
      // Desenhar sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x + 2, y + 2, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Desenhar átomo com gradiente
      const gradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 15);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#6b7280');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Desenhar símbolo
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(atom.element, x, y + 4);
    });
  };

  const drawAnalysis = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(10, height - 120, 300, 110);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillText('Análise Química:', 20, height - 100);
    
    if (currentMolecule) {
      ctx.fillText(`Molécula: ${currentMolecule.name}`, 20, height - 80);
      ctx.fillText(`Fórmula: ${currentMolecule.formula}`, 20, height - 60);
      ctx.fillText(`Peso Molecular: ${currentMolecule.properties.molecularWeight} g/mol`, 20, height - 40);
      ctx.fillText(`Ponto de Fusão: ${currentMolecule.properties.meltingPoint}°C`, 20, height - 20);
    }
    
    if (reaction) {
      ctx.fillText(`Reação: ${reaction.name}`, 20, height - 80);
      ctx.fillText(`Rendimento: ${reaction.yield}%`, 20, height - 60);
      ctx.fillText(`Mecanismo: ${reaction.mechanism}`, 20, height - 40);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Atom className="w-5 h-5 text-green-600" />
            <span>Laboratório de Química Orgânica</span>
          </CardTitle>
          <CardDescription>
            Explore síntese de moléculas, mecanismos de reação e design de fármacos
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
                max={200}
                step={5}
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

          {/* Controles de visualização */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={show3D}
                onChange={(e) => setShow3D(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Visualização 3D</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showElectrons}
                onChange={(e) => setShowElectrons(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Mostrar elétrons</span>
            </label>
          </div>

          {/* Seleção de molécula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Molécula
            </label>
            <div className="flex space-x-2">
              {molecules.map((molecule) => (
                <button
                  key={molecule.id}
                  onClick={() => setCurrentMolecule(molecule)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    currentMolecule?.id === molecule.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {molecule.name}
                </button>
              ))}
            </div>
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
                setTemperature(25);
                setPressure(1);
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
            <span>Simulação Química</span>
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
              Análise Química Detalhada
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Propriedades:</h5>
                <ul className="space-y-1 text-blue-700">
                  {currentMolecule && (
                    <>
                      <li>• Nome: {currentMolecule.name}</li>
                      <li>• Fórmula: {currentMolecule.formula}</li>
                      <li>• Peso Molecular: {currentMolecule.properties.molecularWeight} g/mol</li>
                      <li>• Ponto de Fusão: {currentMolecule.properties.meltingPoint}°C</li>
                      <li>• Ponto de Ebulição: {currentMolecule.properties.boilingPoint}°C</li>
                      <li>• Solubilidade: {currentMolecule.properties.solubility}</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Resultados:</h5>
                <div className="space-y-1 text-blue-700">
                  {experimentType === 'synthesis' && synthesisSteps.length > 0 && (
                    <>
                      <li>• Passos da Síntese: {synthesisSteps.length}</li>
                      <li>• Rendimento Total: {synthesisSteps.reduce((acc, step) => acc * step.yield / 100, 100).toFixed(1)}%</li>
                      <li>• Tempo Total: {synthesisSteps.reduce((acc, step) => acc + step.time, 0)} horas</li>
                    </>
                  )}
                  {experimentType === 'reaction-mechanism' && reaction && (
                    <>
                      <li>• Reação: {reaction.name}</li>
                      <li>• Rendimento: {reaction.yield}%</li>
                      <li>• Mecanismo: {reaction.mechanism}</li>
                      <li>• Temperatura: {reaction.conditions.temperature}°C</li>
                    </>
                  )}
                  {experimentType === 'drug-design' && currentMolecule && (
                    <>
                      <li>• LogP: 1.2 (Lipofilicidade)</li>
                      <li>• TPSA: 43.3 (Área de Superfície Polar)</li>
                      <li>• HBD: 1 (Doadores de Hidrogênio)</li>
                      <li>• HBA: 4 (Aceitadores de Hidrogênio)</li>
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

export default OrganicChemistryLab;
