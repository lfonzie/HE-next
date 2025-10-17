// types/lab.ts - Tipos principais do laboratório virtual
export interface LabItem {
  id: string;
  kind: 'vessel' | 'reagent' | 'instrument' | 'tool' | 'physics';
  name: string;
  sprite: string;           // caminho do asset
  props: Record<string, any>;
  constraints?: string[];   // ex.: ['liquid-only','requires-stand']
}

export interface LabPosition {
  x: number;
  y: number;
  rotation?: number;
}

export interface LabLayout {
  itemId: string;
  x: number;
  y: number;
  rot?: number;
}

export interface BenchState {
  items: LabItem[];
  layout: LabLayout[];
  connections?: Array<{
    from: string;
    to: string;
    type: 'wire' | 'tube' | 'connection';
  }>;
}

export interface TrialLog {
  timestamp: number;
  event: string; // 'add-reagent' | 'measure' | 'heat' | 'stir' | 'tick'
  payload: Record<string, any>;
}

export interface ExperimentPreset {
  id: string;
  title: string;
  discipline: 'chem' | 'physics';
  objective: string;              // texto BNCC-aligned
  seed?: number;
  bench: BenchState;
  initialState: Record<string, any>; // soluções, circuitos, etc.
  objectives: Array<{
    id: string;
    description: string;
    validator: { type: string; params: Record<string, any> }; // ex.: {type:'pH-in-range', params:{min:6.9, max:7.1}}
    points?: number;
  }>;
  hints?: string[];
  expectedOutcomes?: Record<string, any>;
}

export interface LabState {
  currentPreset: ExperimentPreset | null;
  benchState: BenchState;
  simulationState: {
    isRunning: boolean;
    isPaused: boolean;
    currentTime: number;
    timestep: number;
  };
  trialLog: TrialLog[];
  objectives: Array<{
    id: string;
    completed: boolean;
    score?: number;
  }>;
  instruments: Record<string, any>;
  history: LabState[]; // para undo/redo
  historyIndex: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  message: string;
  details?: Record<string, any>;
}

export interface RendererConfig {
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  showGrid: boolean;
  zoom: number;
  panX: number;
  panY: number;
}
