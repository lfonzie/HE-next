// engine/core/engine.ts - Motor principal de simulação
import { DeterministicRNG } from './rng';
import { LabState, TrialLog } from '../../types/lab';

export interface SimulationConfig {
  timestep: number;        // segundos por tick
  maxTime: number;         // tempo máximo de simulação
  precision: number;       // precisão numérica
  enablePhysics: boolean;  // habilitar física
  enableChemistry: boolean; // habilitar química
  enableOptics: boolean;   // habilitar óptica
}

export class SimulationEngine {
  private rng: DeterministicRNG;
  private config: SimulationConfig;
  private currentTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastUpdateTime: number = 0;
  private animationFrameId: number | null = null;

  // Callbacks para eventos
  private onUpdate?: (state: LabState) => void;
  private onComplete?: (state: LabState) => void;
  private onError?: (error: Error) => void;

  constructor(config: SimulationConfig, seed: number = 42) {
    this.config = config;
    this.rng = new DeterministicRNG(seed);
  }

  // Configuração de callbacks
  setCallbacks(callbacks: {
    onUpdate?: (state: LabState) => void;
    onComplete?: (state: LabState) => void;
    onError?: (error: Error) => void;
  }): void {
    this.onUpdate = callbacks.onUpdate;
    this.onComplete = callbacks.onComplete;
    this.onError = callbacks.onError;
  }

  // Inicia a simulação
  start(state: LabState): void {
    if (this.isRunning) {
      this.pause();
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.currentTime = 0;
    this.lastUpdateTime = performance.now();

    this.runSimulationLoop(state);
  }

  // Pausa a simulação
  pause(): void {
    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Resume a simulação
  resume(): void {
    if (!this.isRunning) return;
    
    this.isPaused = false;
    this.lastUpdateTime = performance.now();
    // O loop será retomado na próxima chamada de update
  }

  // Para a simulação
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.currentTime = 0;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Reseta a simulação
  reset(): void {
    this.stop();
    this.rng.reset();
    this.currentTime = 0;
  }

  // Step único da simulação
  step(state: LabState): LabState {
    const newState = this.updateSimulation(state, this.config.timestep);
    this.currentTime += this.config.timestep;
    return newState;
  }

  // Loop principal de simulação
  private runSimulationLoop(state: LabState): void {
    if (!this.isRunning || this.isPaused) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // converter para segundos

    if (deltaTime >= this.config.timestep) {
      try {
        const newState = this.updateSimulation(state, this.config.timestep);
        this.currentTime += this.config.timestep;
        this.lastUpdateTime = currentTime;

        // Log do evento
        const logEntry: TrialLog = {
          timestamp: this.currentTime,
          event: 'tick',
          payload: { timestep: this.config.timestep, currentTime: this.currentTime }
        };
        newState.trialLog.push(logEntry);

        // Callback de atualização
        this.onUpdate?.(newState);

        // Verificar se atingiu o tempo máximo
        if (this.currentTime >= this.config.maxTime) {
          this.stop();
          this.onComplete?.(newState);
          return;
        }

        // Continuar o loop
        this.animationFrameId = requestAnimationFrame(() => this.runSimulationLoop(newState));
      } catch (error) {
        this.stop();
        this.onError?.(error as Error);
      }
    } else {
      // Aguardar próximo frame
      this.animationFrameId = requestAnimationFrame(() => this.runSimulationLoop(state));
    }
  }

  // Atualiza o estado da simulação
  private updateSimulation(state: LabState, timestep: number): LabState {
    const newState = { ...state };
    
    // Atualizar estado de simulação
    newState.simulationState = {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentTime: this.currentTime + timestep,
      timestep: this.config.timestep
    };

    // Aqui serão chamados os módulos específicos (química, física, óptica)
    if (this.config.enableChemistry) {
      newState.benchState = this.updateChemistry(newState.benchState, timestep);
    }

    if (this.config.enablePhysics) {
      newState.benchState = this.updatePhysics(newState.benchState, timestep);
    }

    if (this.config.enableOptics) {
      newState.benchState = this.updateOptics(newState.benchState, timestep);
    }

    return newState;
  }

  // Placeholder para atualização de química
  private updateChemistry(benchState: any, timestep: number): any {
    // Implementação será feita nos módulos específicos
    return benchState;
  }

  // Placeholder para atualização de física
  private updatePhysics(benchState: any, timestep: number): any {
    // Implementação será feita nos módulos específicos
    return benchState;
  }

  // Placeholder para atualização de óptica
  private updateOptics(benchState: any, timestep: number): any {
    // Implementação será feita nos módulos específicos
    return benchState;
  }

  // Getters
  get isSimulationRunning(): boolean {
    return this.isRunning && !this.isPaused;
  }

  get simulationTime(): number {
    return this.currentTime;
  }

  get randomGenerator(): DeterministicRNG {
    return this.rng;
  }

  // Configuração
  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SimulationConfig {
    return { ...this.config };
  }
}
