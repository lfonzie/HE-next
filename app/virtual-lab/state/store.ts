// state/store.ts - Store principal do laboratório virtual
import { create } from 'zustand';
import { LabState, LabItem, LabPosition, ExperimentPreset, TrialLog, ValidationResult } from '../types/lab';
import { SimulationEngine } from '../engine/core/engine';

interface LabStore {
  // Estado principal
  state: LabState;
  
  // Simulação
  simulationEngine: SimulationEngine | null;
  
  // Ações de estado
  setCurrentPreset: (preset: ExperimentPreset) => void;
  addItem: (item: LabItem, position: LabPosition) => void;
  removeItem: (itemId: string) => void;
  moveItem: (itemId: string, position: LabPosition) => void;
  selectItem: (itemId: string) => void;
  
  // Simulação
  startSimulation: () => void;
  pauseSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  
  // Histórico (undo/redo)
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Logs e medições
  addTrialLog: (log: TrialLog) => void;
  clearTrialLog: () => void;
  
  // Objetivos
  updateObjective: (objectiveId: string, completed: boolean, score?: number) => void;
  validateObjectives: () => ValidationResult[];
  
  // Persistência
  saveState: () => void;
  loadState: (state: LabState) => void;
  exportState: () => string;
  importState: (json: string) => void;
  
  // Configurações
  updateConfig: (config: Partial<LabState['simulationState']>) => void;
}

const createInitialState = (): LabState => ({
  currentPreset: null,
  benchState: {
    items: [],
    layout: [],
    connections: []
  },
  simulationState: {
    isRunning: false,
    isPaused: false,
    currentTime: 0,
    timestep: 0.1
  },
  trialLog: [],
  objectives: [],
  instruments: {},
  history: [],
  historyIndex: -1
});

export const useLabStore = create<LabStore>((set, get) => ({
  state: createInitialState(),
  simulationEngine: null,

  // Ações de estado
  setCurrentPreset: (preset: ExperimentPreset) => {
    set(state => ({
      state: {
        ...state.state,
        currentPreset: preset,
        benchState: preset.bench,
        objectives: preset.objectives.map(obj => ({
          id: obj.id,
          completed: false,
          score: 0
        }))
      }
    }));
    get().saveToHistory();
  },

  addItem: (item: LabItem, position: LabPosition) => {
    set(state => {
      const newItems = [...state.state.benchState.items, item];
      const newLayout = [...state.state.benchState.layout, {
        itemId: item.id,
        x: position.x,
        y: position.y,
        rot: position.rotation || 0
      }];
      
      return {
        state: {
          ...state.state,
          benchState: {
            ...state.state.benchState,
            items: newItems,
            layout: newLayout
          }
        }
      };
    });
    get().saveToHistory();
  },

  removeItem: (itemId: string) => {
    set(state => ({
      state: {
        ...state.state,
        benchState: {
          ...state.state.benchState,
          items: state.state.benchState.items.filter(item => item.id !== itemId),
          layout: state.state.benchState.layout.filter(layout => layout.itemId !== itemId)
        }
      }
    }));
    get().saveToHistory();
  },

  moveItem: (itemId: string, position: LabPosition) => {
    set(state => ({
      state: {
        ...state.state,
        benchState: {
          ...state.state.benchState,
          layout: state.state.benchState.layout.map(layout =>
            layout.itemId === itemId
              ? { ...layout, x: position.x, y: position.y, rot: position.rotation || 0 }
              : layout
          )
        }
      }
    }));
  },

  selectItem: (itemId: string) => {
    set(state => ({
      state: {
        ...state.state,
        selectedItemId: itemId
      }
    }));
  },

  // Simulação
  startSimulation: () => {
    const { state, simulationEngine } = get();
    if (!simulationEngine) return;

    simulationEngine.start(state);
    set(state => ({
      state: {
        ...state.state,
        simulationState: {
          ...state.state.simulationState,
          isRunning: true,
          isPaused: false
        }
      }
    }));
  },

  pauseSimulation: () => {
    const { simulationEngine } = get();
    if (!simulationEngine) return;

    simulationEngine.pause();
    set(state => ({
      state: {
        ...state.state,
        simulationState: {
          ...state.state.simulationState,
          isPaused: true
        }
      }
    }));
  },

  stopSimulation: () => {
    const { simulationEngine } = get();
    if (!simulationEngine) return;

    simulationEngine.stop();
    set(state => ({
      state: {
        ...state.state,
        simulationState: {
          ...state.state.simulationState,
          isRunning: false,
          isPaused: false,
          currentTime: 0
        }
      }
    }));
  },

  resetSimulation: () => {
    const { simulationEngine } = get();
    if (!simulationEngine) return;

    simulationEngine.reset();
    set(state => ({
      state: {
        ...state.state,
        simulationState: {
          ...state.state.simulationState,
          isRunning: false,
          isPaused: false,
          currentTime: 0
        }
      }
    }));
  },

  stepSimulation: () => {
    const { state, simulationEngine } = get();
    if (!simulationEngine) return;

    const newState = simulationEngine.step(state);
    set({ state: newState });
  },

  // Histórico (undo/redo)
  undo: () => {
    const { state } = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const previousState = state.history[newIndex];
      
      set({
        state: {
          ...previousState,
          history: state.history,
          historyIndex: newIndex
        }
      });
    }
  },

  redo: () => {
    const { state } = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const nextState = state.history[newIndex];
      
      set({
        state: {
          ...nextState,
          history: state.history,
          historyIndex: newIndex
        }
      });
    }
  },

  saveToHistory: () => {
    const { state } = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ ...state });
    
    set({
      state: {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1
      }
    });
  },

  // Logs e medições
  addTrialLog: (log: TrialLog) => {
    set(state => ({
      state: {
        ...state.state,
        trialLog: [...state.state.trialLog, log]
      }
    }));
  },

  clearTrialLog: () => {
    set(state => ({
      state: {
        ...state.state,
        trialLog: []
      }
    }));
  },

  // Objetivos
  updateObjective: (objectiveId: string, completed: boolean, score?: number) => {
    set(state => ({
      state: {
        ...state.state,
        objectives: state.state.objectives.map(obj =>
          obj.id === objectiveId
            ? { ...obj, completed, score: score || obj.score }
            : obj
        )
      }
    }));
  },

  validateObjectives: (): ValidationResult[] => {
    const { state } = get();
    const results: ValidationResult[] = [];

    if (!state.currentPreset) return results;

    for (const objective of state.currentPreset.objectives) {
      // Implementação simplificada de validação
      const isValid = Math.random() > 0.5; // Simulação aleatória
      const score = isValid ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30);
      
      results.push({
        isValid,
        score,
        message: isValid ? 'Objetivo atingido!' : 'Objetivo não atingido',
        details: {
          objectiveId: objective.id,
          description: objective.description
        }
      });
    }

    return results;
  },

  // Persistência
  saveState: () => {
    const { state } = get();
    localStorage.setItem('virtual-lab-state', JSON.stringify(state));
  },

  loadState: (newState: LabState) => {
    set({ state: newState });
    get().saveToHistory();
  },

  exportState: (): string => {
    const { state } = get();
    return JSON.stringify(state, null, 2);
  },

  importState: (json: string) => {
    try {
      const newState = JSON.parse(json) as LabState;
      get().loadState(newState);
    } catch (error) {
      console.error('Erro ao importar estado:', error);
    }
  },

  // Configurações
  updateConfig: (config: Partial<LabState['simulationState']>) => {
    set(state => ({
      state: {
        ...state.state,
        simulationState: {
          ...state.state.simulationState,
          ...config
        }
      }
    }));
  }
}));

// Selectors para otimização
export const useBenchState = () => useLabStore(state => state.state.benchState);
export const useSimulationState = () => useLabStore(state => state.state.simulationState);
export const useTrialLog = () => useLabStore(state => state.state.trialLog);
export const useObjectives = () => useLabStore(state => state.state.objectives);
export const useCanUndo = () => useLabStore(state => state.state.historyIndex > 0);
export const useCanRedo = () => useLabStore(state => 
  state.state.historyIndex < state.state.history.length - 1
);
