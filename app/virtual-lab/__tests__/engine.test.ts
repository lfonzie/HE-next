// __tests__/engine.test.ts - Testes para engine de simulação
import { SimulationEngine } from '../engine/core/engine';
import { DeterministicRNG } from '../engine/core/rng';
import { LabState } from '../types/lab';

describe('SimulationEngine', () => {
  let engine: SimulationEngine;
  let mockLabState: LabState;

  beforeEach(() => {
    engine = new SimulationEngine({
      timestep: 0.1,
      maxTime: 10,
      precision: 0.01,
      enablePhysics: true,
      enableChemistry: true,
      enableOptics: false
    }, 42);

    mockLabState = {
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
    };
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(engine.simulationTime).toBe(0);
      expect(engine.isSimulationRunning).toBe(false);
    });

    it('should have deterministic RNG', () => {
      const rng = engine.randomGenerator;
      expect(rng).toBeInstanceOf(DeterministicRNG);
      expect(rng.getSeed()).toBe(42);
    });
  });

  describe('Simulation control', () => {
    it('should start simulation', () => {
      engine.start(mockLabState);
      expect(engine.isSimulationRunning).toBe(true);
    });

    it('should pause simulation', () => {
      engine.start(mockLabState);
      engine.pause();
      expect(engine.isSimulationRunning).toBe(true);
      // Note: isSimulationRunning still true but paused
    });

    it('should stop simulation', () => {
      engine.start(mockLabState);
      engine.stop();
      expect(engine.isSimulationRunning).toBe(false);
      expect(engine.simulationTime).toBe(0);
    });

    it('should reset simulation', () => {
      engine.start(mockLabState);
      engine.reset();
      expect(engine.simulationTime).toBe(0);
      expect(engine.isSimulationRunning).toBe(false);
    });
  });

  describe('Step simulation', () => {
    it('should execute single step', () => {
      const newState = engine.step(mockLabState);
      expect(newState.simulationState.currentTime).toBe(0.1);
    });

    it('should update trial log with step', () => {
      const newState = engine.step(mockLabState);
      expect(newState.trialLog).toHaveLength(1);
      expect(newState.trialLog[0].event).toBe('tick');
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      engine.updateConfig({ timestep: 0.2 });
      const config = engine.getConfig();
      expect(config.timestep).toBe(0.2);
    });
  });
});

describe('DeterministicRNG', () => {
  let rng: DeterministicRNG;

  beforeEach(() => {
    rng = new DeterministicRNG(42);
  });

  describe('Basic functionality', () => {
    it('should generate deterministic numbers', () => {
      const values1 = [rng.next(), rng.next(), rng.next()];
      rng.reset();
      const values2 = [rng.next(), rng.next(), rng.next()];
      
      expect(values1).toEqual(values2);
    });

    it('should generate numbers in range', () => {
      const value = rng.range(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThan(10);
    });

    it('should generate integers in range', () => {
      const value = rng.int(1, 6);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    });
  });

  describe('Normal distribution', () => {
    it('should generate normal distribution', () => {
      const values = Array.from({ length: 1000 }, () => rng.normal(0, 1));
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      
      expect(Math.abs(mean)).toBeLessThan(0.1); // Mean should be close to 0
      expect(Math.abs(variance - 1)).toBeLessThan(0.1); // Variance should be close to 1
    });
  });

  describe('Measurement noise', () => {
    it('should add realistic noise to measurements', () => {
      const trueValue = 100;
      const noisyValue = rng.measurementNoise(trueValue, 0.01);
      
      expect(Math.abs(noisyValue - trueValue)).toBeLessThan(trueValue * 0.05);
    });
  });

  describe('Seed management', () => {
    it('should set new seed', () => {
      rng.setSeed(123);
      expect(rng.getSeed()).toBe(123);
    });

    it('should reset to original seed', () => {
      rng.setSeed(123);
      rng.reset();
      expect(rng.getSeed()).toBe(42);
    });
  });
});
