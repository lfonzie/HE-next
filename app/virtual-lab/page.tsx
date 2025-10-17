// page.tsx - Página principal do laboratório virtual
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BenchCanvas } from './components/BenchCanvas';
import { InventoryPanel } from './components/InventoryPanel';
import { ControlPanel } from './components/ControlPanel';
import { InstrumentsPanel } from './components/InstrumentsPanel';
import { StockroomPanel } from './components/StockroomPanel';
import { LiquidTransferPanel } from './components/LiquidTransferPanel';
import { ActivityPanel } from './components/ActivityPanel';
import { ContextMenu, useContextMenu } from './components/ContextMenu';
import { SolutionValidator } from './components/SolutionValidator';
import { RealisticRenderer } from './components/RealisticRenderer';
import { LiquidEffects, useLiquidEffects } from './components/LiquidEffects';
import { RealisticAnimations, useRealisticAnimations } from './components/RealisticAnimations';
import { VoiceAssistant } from '../../components/virtual-labs/VoiceAssistant';
import { useLabStore, useBenchState, useSimulationState, useCanUndo, useCanRedo } from './state/store';
import { LabItem, LabPosition, RendererConfig, ExperimentPreset } from './types/lab';
import { SimulationEngine } from './engine/core/engine';
import { DeterministicRNG } from './engine/core/rng';
import { 
  Microscope, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  StepForward,
  Save,
  Upload,
  Download,
  Undo,
  Redo,
  Package,
  Pipette,
  BookOpen,
  Target,
  BarChart3,
  Bot
} from 'lucide-react';

// Presets de exemplo
const EXAMPLE_PRESETS: ExperimentPreset[] = [
  {
    id: 'chem_titration_ab_01',
    title: 'Titulação Ácido-Base (HCl × NaOH)',
    discipline: 'chem',
    objective: 'Compreender neutralização e curvas de titulação; identificar ponto de equivalência com indicador.',
    seed: 42,
    bench: {
      items: [
        {
          id: 'v1',
          kind: 'vessel',
          name: 'Erlenmeyer 250 mL',
          sprite: '/assets/vessels/erlen250.png',
          props: { capacity_mL: 250 },
          constraints: ['liquid-only']
        },
        {
          id: 'b1',
          kind: 'vessel',
          name: 'Bureta 50 mL',
          sprite: '/assets/vessels/burette50.png',
          props: { capacity_mL: 50, flow_mLps: [0, 1] },
          constraints: ['requires-stand']
        },
        {
          id: 'r1',
          kind: 'reagent',
          name: 'HCl 0,1 M',
          sprite: '/assets/reagents/hcl.png',
          props: { concentration_M: 0.1 }
        },
        {
          id: 'r2',
          kind: 'reagent',
          name: 'NaOH 0,1 M',
          sprite: '/assets/reagents/naoh.png',
          props: { concentration_M: 0.1 }
        },
        {
          id: 'ind',
          kind: 'reagent',
          name: 'Fenolftaleína',
          sprite: '/assets/reagents/indicator.png',
          props: { indicator: 'phenolphthalein' }
        },
        {
          id: 'phm',
          kind: 'instrument',
          name: 'pHmetro',
          sprite: '/assets/instruments/phmeter.png',
          props: { precision: 0.01 }
        }
      ],
      layout: [
        { itemId: 'v1', x: 420, y: 520 },
        { itemId: 'b1', x: 620, y: 120 },
        { itemId: 'r1', x: 120, y: 520 },
        { itemId: 'r2', x: 120, y: 420 },
        { itemId: 'ind', x: 240, y: 520 },
        { itemId: 'phm', x: 320, y: 320 }
      ],
      connections: []
    },
    initialState: {},
    objectives: [
      {
        id: 'o1',
        description: 'Determinar o ponto de equivalência (pH ~ 7.0)',
        validator: { type: 'pH-in-range', params: { min: 6.9, max: 7.1 } },
        points: 50
      }
    ],
    hints: ['Use a bureta abrindo aos poucos e meça o pH em intervalos regulares.'],
    expectedOutcomes: {}
  },
  {
    id: 'phy_ohm_series_parallel_01',
    title: 'Lei de Ohm e Associações',
    discipline: 'physics',
    objective: 'Explorar V=IR e calcular correntes em série e paralelo.',
    seed: 8,
    bench: {
      items: [
        {
          id: 'bat',
          kind: 'physics',
          name: 'Bateria 9V',
          sprite: '/assets/physics/battery.png',
          props: { V: 9 }
        },
        {
          id: 'rA',
          kind: 'physics',
          name: 'Resistor 100Ω',
          sprite: '/assets/physics/resistor.png',
          props: { R_ohm: 100 }
        },
        {
          id: 'rB',
          kind: 'physics',
          name: 'Resistor 200Ω',
          sprite: '/assets/physics/resistor.png',
          props: { R_ohm: 200 }
        },
        {
          id: 'amm',
          kind: 'instrument',
          name: 'Amperímetro',
          sprite: '/assets/physics/ammeter.png',
          props: { range_A: [0, 2] }
        },
        {
          id: 'volt',
          kind: 'instrument',
          name: 'Voltímetro',
          sprite: '/assets/physics/voltmeter.png',
          props: { range_V: [0, 20] }
        }
      ],
      layout: [
        { itemId: 'bat', x: 100, y: 300 },
        { itemId: 'rA', x: 200, y: 300 },
        { itemId: 'rB', x: 300, y: 300 },
        { itemId: 'amm', x: 250, y: 200 },
        { itemId: 'volt', x: 250, y: 400 }
      ],
      connections: []
    },
    initialState: {},
    objectives: [
      {
        id: 'o1',
        description: 'Medir a corrente no circuito em série',
        validator: { type: 'current-in-range', params: { min: 0.025, max: 0.03 } },
        points: 30
      }
    ],
    hints: ['Use o amperímetro para medir a corrente total do circuito.'],
    expectedOutcomes: {}
  }
];

// Itens disponíveis no inventário
const AVAILABLE_ITEMS: LabItem[] = [
  // Vidrarias
  { id: 'beaker-100', kind: 'vessel', name: 'Béquer 100 mL', sprite: '/assets/vessels/beaker100.png', props: { capacity_mL: 100 } },
  { id: 'beaker-250', kind: 'vessel', name: 'Béquer 250 mL', sprite: '/assets/vessels/beaker250.png', props: { capacity_mL: 250 } },
  { id: 'erlenmeyer-250', kind: 'vessel', name: 'Erlenmeyer 250 mL', sprite: '/assets/vessels/erlen250.png', props: { capacity_mL: 250 } },
  { id: 'burette-50', kind: 'vessel', name: 'Bureta 50 mL', sprite: '/assets/vessels/burette50.png', props: { capacity_mL: 50, flow_mLps: [0, 1] } },
  { id: 'pipette-10', kind: 'vessel', name: 'Pipeta 10 mL', sprite: '/assets/vessels/pipette10.png', props: { capacity_mL: 10 } },
  
  // Reagentes
  { id: 'hcl-01', kind: 'reagent', name: 'HCl 0,1 M', sprite: '/assets/reagents/hcl.png', props: { concentration_M: 0.1 } },
  { id: 'naoh-01', kind: 'reagent', name: 'NaOH 0,1 M', sprite: '/assets/reagents/naoh.png', props: { concentration_M: 0.1 } },
  { id: 'phenolphthalein', kind: 'reagent', name: 'Fenolftaleína', sprite: '/assets/reagents/indicator.png', props: { indicator: 'phenolphthalein' } },
  { id: 'bromothymol', kind: 'reagent', name: 'Azul de Bromotimol', sprite: '/assets/reagents/indicator.png', props: { indicator: 'bromothymol' } },
  
  // Instrumentos
  { id: 'phmeter', kind: 'instrument', name: 'pHmetro', sprite: '/assets/instruments/phmeter.png', props: { precision: 0.01 } },
  { id: 'thermometer', kind: 'instrument', name: 'Termômetro', sprite: '/assets/instruments/thermometer.png', props: { precision: 0.1 } },
  { id: 'balance', kind: 'instrument', name: 'Balança', sprite: '/assets/instruments/balance.png', props: { precision: 0.001 } },
  
  // Física
  { id: 'battery-9v', kind: 'physics', name: 'Bateria 9V', sprite: '/assets/physics/battery.png', props: { V: 9 } },
  { id: 'resistor-100', kind: 'physics', name: 'Resistor 100Ω', sprite: '/assets/physics/resistor.png', props: { R_ohm: 100 } },
  { id: 'resistor-200', kind: 'physics', name: 'Resistor 200Ω', sprite: '/assets/physics/resistor.png', props: { R_ohm: 200 } },
  { id: 'resistor-300', kind: 'physics', name: 'Resistor 300Ω', sprite: '/assets/physics/resistor.png', props: { R_ohm: 300 } },
  { id: 'lamp-6v', kind: 'physics', name: 'Lâmpada 6V', sprite: '/assets/physics/lamp.png', props: { nominal_voltage: 6 } },
  { id: 'switch-spst', kind: 'physics', name: 'Chave SPST', sprite: '/assets/physics/switch.png', props: { type: 'SPST' } },
  { id: 'ammeter', kind: 'instrument', name: 'Amperímetro', sprite: '/assets/physics/ammeter.png', props: { range_A: [0, 2] } },
  { id: 'voltmeter', kind: 'instrument', name: 'Voltímetro', sprite: '/assets/physics/voltmeter.png', props: { range_V: [0, 20] } }
];

export default function VirtualLabPage() {
  const [selectedPreset, setSelectedPreset] = useState<ExperimentPreset | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [measurements, setMeasurements] = useState<Array<{ timestamp: number; value: number; unit: string; instrument: string }>>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'stockroom' | 'transfer' | 'activities' | 'validator'>('inventory');
  const [containers, setContainers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [solutionValidation, setSolutionValidation] = useState<any>(null);
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(true);
  
  // Context menu
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  
  // Efeitos visuais
  const { effects: liquidEffects, isActive: effectsActive, startPouring, startMixing, startBubbling } = useLiquidEffects();
  
  // Animações realistas
  const { animations, isActive: animationsActive, startPulse, startHeating, startStirring } = useRealisticAnimations();

  // Store
  const {
    state,
    setCurrentPreset,
    addItem,
    removeItem,
    moveItem,
    selectItem,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    resetSimulation,
    stepSimulation,
    undo,
    redo,
    addTrialLog,
    clearTrialLog,
    exportState,
    importState
  } = useLabStore();

  const benchState = useBenchState();
  const simulationState = useSimulationState();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // Configuração do renderer
  const [rendererConfig, setRendererConfig] = useState<RendererConfig>({
    canvasWidth: 800,
    canvasHeight: 600,
    gridSize: 20,
    showGrid: true,
    zoom: 1,
    panX: 0,
    panY: 0
  });

  // Engine de simulação
  const [simulationEngine, setSimulationEngine] = useState<SimulationEngine | null>(null);

  useEffect(() => {
    // Inicializar engine de simulação
    const engine = new SimulationEngine({
      timestep: 0.1,
      maxTime: 300,
      precision: 0.01,
      enablePhysics: true,
      enableChemistry: true,
      enableOptics: false
    }, 42);

    engine.setCallbacks({
      onUpdate: (newState) => {
        // Atualizar estado da simulação
        console.log('Simulação atualizada:', newState);
      },
      onComplete: (finalState) => {
        console.log('Simulação concluída:', finalState);
      },
      onError: (error) => {
        console.error('Erro na simulação:', error);
      }
    });

    setSimulationEngine(engine);
  }, []);

  const handlePresetSelect = (preset: ExperimentPreset) => {
    setSelectedPreset(preset);
    setCurrentPreset(preset);
  };

  const handleItemDrag = (item: LabItem) => {
    // Adicionar item à bancada em posição aleatória
    const position: LabPosition = {
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      rotation: 0
    };
    addItem(item, position);
  };

  const handleItemMove = (itemId: string, position: LabPosition) => {
    moveItem(itemId, position);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    selectItem(itemId);
  };

  const handleAddMeasurement = (instrument: string, value: number, unit: string) => {
    const measurement = {
      timestamp: Date.now(),
      value,
      unit,
      instrument
    };
    setMeasurements(prev => [...prev, measurement]);
    addTrialLog({
      timestamp: simulationState.currentTime,
      event: 'measure',
      payload: measurement
    });
  };

  const handleClearMeasurements = () => {
    setMeasurements([]);
    clearTrialLog();
  };

  const handleExportData = () => {
    const data = measurements.map(m => ({
      timestamp: new Date(m.timestamp).toISOString(),
      instrument: m.instrument,
      value: m.value,
      unit: m.unit
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurements.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Funções para os novos componentes
  const handleContainerUpdate = (containerId: string, newVolume: number) => {
    setContainers(prev => prev.map(c => 
      c.id === containerId ? { ...c, currentVolume: newVolume } : c
    ));
  };

  const handleCalculateConcentration = (fromContainer: string, toContainer: string, volume: number) => {
    // Implementar cálculo de concentração
    console.log('Calculando concentração:', { fromContainer, toContainer, volume });
    return { success: true };
  };

  const handleStartActivity = (activity: any) => {
    setCurrentActivity(activity);
    setActiveTab('activities');
  };

  const handleCompleteObjective = (activityId: string, objectiveId: string, value: number) => {
    setActivities(prev => prev.map(a => 
      a.id === activityId 
        ? {
            ...a,
            objectives: a.objectives.map((obj: any) => 
              obj.id === objectiveId 
                ? { ...obj, completed: true, actualValue: value }
                : obj
            )
          }
        : a
    ));
  };

  const handleSubmitActivity = (activity: any) => {
    console.log('Submetendo atividade:', activity);
    setCurrentActivity(null);
  };

  const handleResetActivity = (activity: any) => {
    setActivities(prev => prev.map(a => 
      a.id === activity.id 
        ? { ...a, status: 'not_started', objectives: a.objectives.map((obj: any) => ({ ...obj, completed: false })) }
        : a
    ));
    setCurrentActivity(null);
  };

  const handleDuplicateItem = (itemId: string) => {
    console.log('Duplicando item:', itemId);
  };

  const handleDeleteItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleEditItem = (itemId: string) => {
    console.log('Editando item:', itemId);
  };

  const handleRotateItem = (itemId: string) => {
    console.log('Rotacionando item:', itemId);
  };

  const handleMoveItem = (itemId: string) => {
    console.log('Movendo item:', itemId);
  };

  const handleToggleVisibility = (itemId: string) => {
    console.log('Alternando visibilidade:', itemId);
  };

  const handleToggleLock = (itemId: string) => {
    console.log('Alternando bloqueio:', itemId);
  };

  const handleExportItem = (itemId: string) => {
    console.log('Exportando item:', itemId);
  };

  const handleImportItem = (itemId: string) => {
    console.log('Importando item:', itemId);
  };

  const handleValidationComplete = (validations: any[]) => {
    setSolutionValidation(validations);
  };

  // Voice Assistant Handlers
  const handleVoiceMeasurementRequest = (instrument: string, value: number, unit: string) => {
    handleAddMeasurement(instrument, value, unit);
  };

  const handleVoiceCalculationRequest = (formula: string, variables: Record<string, number>) => {
    // Implementar cálculos científicos básicos
    try {
      let result = 0;
      
      switch (formula.toLowerCase()) {
        case 'ph':
          result = -Math.log10(variables.concentration || 0.001);
          break;
        case 'concentration':
          result = variables.moles / (variables.volume / 1000);
          break;
        case 'moles':
          result = variables.concentration * (variables.volume / 1000);
          break;
        case 'ohms_law':
          result = variables.voltage / variables.resistance;
          break;
        case 'power':
          result = variables.voltage * variables.current;
          break;
        default:
          result = 0;
      }
      
      return result;
    } catch (error) {
      console.error('Erro no cálculo:', error);
      return 0;
    }
  };

  const handleVoiceExperimentGuidance = (step: string, instructions: string[]) => {
    console.log('Orientação do experimento:', { step, instructions });
    // Aqui você pode implementar lógica para mostrar instruções na interface
  };

  const handleVoiceAssistantError = (error: Error) => {
    console.error('Erro do assistente de voz:', error);
  };

  // Funções para efeitos visuais
  const handleStartSimulation = () => {
    startSimulation();
    
    // Ativar efeitos visuais para instrumentos
    benchState.items.forEach(item => {
      if (item.kind === 'instrument') {
        startPulse(1000, '#00ff00');
      }
    });
  };

  const handleStopSimulation = () => {
    stopSimulation();
  };

  const handleItemInteraction = (itemId: string, action: string) => {
    const item = benchState.items.find(i => i.id === itemId);
    if (!item) return;

    switch (action) {
      case 'pour':
        startPouring({ x: 400, y: 300 }, 'down');
        break;
      case 'mix':
        startMixing({ x: 400, y: 300 });
        break;
      case 'heat':
        startHeating(3000);
        break;
      case 'stir':
        startStirring(2000);
        break;
      case 'bubble':
        startBubbling({ x: 400, y: 300 });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Microscope className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laboratório Virtual</h1>
              <p className="text-sm text-gray-600">
                {selectedPreset ? selectedPreset.title : 'Selecione um experimento para começar'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Seletor de presets */}
            <select
              value={selectedPreset?.id || ''}
              onChange={(e) => {
                const preset = EXAMPLE_PRESETS.find(p => p.id === e.target.value);
                if (preset) handlePresetSelect(preset);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecionar experimento...</option>
              <optgroup label="Química">
                {EXAMPLE_PRESETS.filter(p => p.discipline === 'chem').map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.title}</option>
                ))}
              </optgroup>
              <optgroup label="Física">
                {EXAMPLE_PRESETS.filter(p => p.discipline === 'physics').map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.title}</option>
                ))}
              </optgroup>
            </select>

            <button
              onClick={() => setVoiceAssistantEnabled(!voiceAssistantEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                voiceAssistantEnabled 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title={voiceAssistantEnabled ? 'Desativar Assistente de Voz' : 'Ativar Assistente de Voz'}
            >
              <Bot className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Painel esquerdo - Inventário */}
        <div className="w-80 border-r border-gray-200 bg-white">
          {/* Abas */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'inventory' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Inventário
            </button>
            <button
              onClick={() => setActiveTab('stockroom')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'stockroom' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Estoque
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'transfer' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Pipette className="h-4 w-4 inline mr-2" />
              Transferência
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'activities' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Atividades
            </button>
            <button
              onClick={() => setActiveTab('validator')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'validator' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Target className="h-4 w-4 inline mr-2" />
              Validação
            </button>
          </div>

          {/* Conteúdo das abas */}
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            {activeTab === 'inventory' && (
              <InventoryPanel
                items={AVAILABLE_ITEMS}
                onItemDrag={handleItemDrag}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            )}
            {activeTab === 'stockroom' && (
              <StockroomPanel
                onItemSelect={(item) => {
                  console.log('Item selecionado:', item);
                  // Converter StockroomItem para LabItem
                  const labItem: LabItem = {
                    id: item.id,
                    kind: item.category === 'reagents' ? 'reagent' : 
                          item.category === 'glassware' ? 'vessel' : 'instrument',
                    name: item.name,
                    sprite: '/assets/placeholder.png',
                    props: item.properties
                  };
                  handleItemDrag(labItem);
                }}
                onItemDuplicate={(item) => console.log('Duplicar:', item)}
                onItemInfo={(item) => console.log('Info:', item)}
              />
            )}
            {activeTab === 'transfer' && (
              <LiquidTransferPanel
                containers={containers}
                onTransfer={(transfer) => console.log('Transferência:', transfer)}
                onUpdateContainer={handleContainerUpdate}
                onCalculateConcentration={handleCalculateConcentration}
              />
            )}
            {activeTab === 'activities' && (
              <ActivityPanel
                activities={activities}
                currentActivity={currentActivity}
                onStartActivity={handleStartActivity}
                onCompleteObjective={handleCompleteObjective}
                onSubmitActivity={handleSubmitActivity}
                onResetActivity={handleResetActivity}
              />
            )}
            {activeTab === 'validator' && (
              <SolutionValidator
                solution={{
                  id: 'solution1',
                  name: 'Solução de Teste',
                  volume: 100,
                  temperature: 25,
                  pH: 7.0,
                  concentration: 0.1,
                  species: [
                    { formula: 'HCl', moles: 0.01, concentration: 0.1 }
                  ]
                }}
                expectedValues={{
                  pH: { value: 7.0, tolerance: 0.1, unit: '' },
                  concentration: { value: 0.1, tolerance: 0.01, unit: 'M' },
                  volume: { value: 100, tolerance: 5, unit: 'mL' }
                }}
                onValidationComplete={handleValidationComplete}
              />
            )}
          </div>
        </div>

        {/* Área central - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Realista */}
          <div className="flex-1 p-6 relative">
            <RealisticRenderer
              items={benchState.items}
              layout={benchState.layout}
              onItemClick={handleItemSelect}
              onItemRightClick={(event, itemId) => {
                const item = benchState.items.find(i => i.id === itemId);
                if (item) {
                  openContextMenu(event, {
                    id: item.id,
                    name: item.name,
                    type: item.kind,
                    properties: item.props
                  });
                }
              }}
              selectedItemId={selectedItemId}
              isSimulating={simulationState.isRunning && !simulationState.isPaused}
              className="w-full h-full"
            />
            
            {/* Efeitos de líquido */}
            <LiquidEffects
              effects={liquidEffects}
              isActive={effectsActive}
              onEffectComplete={(effectId) => {
                console.log('Efeito concluído:', effectId);
              }}
            />
            
            {/* Animações realistas */}
            <RealisticAnimations
              animations={animations}
              isActive={animationsActive}
              onAnimationComplete={(animationId) => {
                console.log('Animação concluída:', animationId);
              }}
            />
            
            {/* Menu de contexto */}
            <ContextMenu
              isOpen={contextMenu.isOpen}
              position={contextMenu.position}
              onClose={closeContextMenu}
              item={contextMenu.item}
              onDuplicate={handleDuplicateItem}
              onDelete={handleDeleteItem}
              onEdit={handleEditItem}
              onRotate={handleRotateItem}
              onMove={handleMoveItem}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              onExport={handleExportItem}
              onImport={handleImportItem}
            />
          </div>

          {/* Controles */}
          <div className="border-t border-gray-200 bg-white p-4">
            <ControlPanel
              isRunning={simulationState.isRunning}
              isPaused={simulationState.isPaused}
              currentTime={simulationState.currentTime}
              timestep={simulationState.timestep}
              onPlay={handleStartSimulation}
              onPause={pauseSimulation}
              onStop={handleStopSimulation}
              onReset={resetSimulation}
              onStep={stepSimulation}
              onSave={() => console.log('Salvar')}
              onLoad={() => console.log('Carregar')}
              onExport={exportState}
              onImport={() => {
                const json = prompt('Cole o JSON do estado:');
                if (json) importState(json);
              }}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onSettingsOpen={() => setShowSettings(true)}
            />
          </div>
        </div>

        {/* Painel direito - Instrumentos */}
        <div className="w-80 border-l border-gray-200 bg-white">
          <InstrumentsPanel
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            onClearMeasurements={handleClearMeasurements}
            onExportData={handleExportData}
          />
        </div>
      </div>

      {/* Modal de configurações */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Configurações</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timestep (s)
                  </label>
                  <input
                    type="number"
                    value={rendererConfig.gridSize}
                    onChange={(e) => setRendererConfig(prev => ({ ...prev, gridSize: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                    min="0.01"
                    max="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom
                  </label>
                  <input
                    type="range"
                    value={rendererConfig.zoom}
                    onChange={(e) => setRendererConfig(prev => ({ ...prev, zoom: Number(e.target.value) }))}
                    className="w-full"
                    min="0.5"
                    max="2"
                    step="0.1"
                  />
                  <div className="text-sm text-gray-600 text-center">
                    {Math.round(rendererConfig.zoom * 100)}%
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showGrid"
                    checked={rendererConfig.showGrid}
                    onChange={(e) => setRendererConfig(prev => ({ ...prev, showGrid: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="showGrid" className="text-sm text-gray-700">
                    Mostrar grid
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Assistant */}
      {voiceAssistantEnabled && (
        <VoiceAssistant
          experimentId={selectedPreset?.id}
          experimentType={selectedPreset?.discipline === 'chem' ? 'chemistry' : 
                        selectedPreset?.discipline === 'physics' ? 'physics' : 'chemistry'}
          difficulty={'intermediate'}
          onMeasurementRequest={handleVoiceMeasurementRequest}
          onCalculationRequest={handleVoiceCalculationRequest}
          onExperimentGuidance={handleVoiceExperimentGuidance}
          onError={handleVoiceAssistantError}
        />
      )}
    </div>
  );
}
