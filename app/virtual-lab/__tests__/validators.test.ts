// __tests__/validators.test.ts - Testes para validadores
import { ObjectiveValidator } from '../utils/validators';
import { LabState, ExperimentPreset } from '../types/lab';

describe('ObjectiveValidator', () => {
  const mockLabState: LabState = {
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

  const mockPreset: ExperimentPreset = {
    id: 'test_preset',
    title: 'Test Experiment',
    discipline: 'chem',
    objective: 'Test objective',
    seed: 42,
    bench: {
      items: [],
      layout: [],
      connections: []
    },
    initialState: {},
    objectives: [
      {
        id: 'ph_test',
        description: 'Test pH range',
        validator: {
          type: 'pH-in-range',
          params: { vesselId: 'v1', min: 6.9, max: 7.1 }
        },
        points: 50
      },
      {
        id: 'time_test',
        description: 'Test time limit',
        validator: {
          type: 'time-limit',
          params: { maxTime: 300 }
        },
        points: 30
      }
    ],
    hints: [],
    expectedOutcomes: {}
  };

  beforeEach(() => {
    mockLabState.currentPreset = mockPreset;
  });

  describe('validateAllObjectives', () => {
    it('should validate all objectives in a preset', () => {
      const results = ObjectiveValidator.validateAllObjectives(mockLabState);
      
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('isValid');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('message');
      expect(results[0]).toHaveProperty('details');
    });

    it('should return empty array when no preset is loaded', () => {
      mockLabState.currentPreset = null;
      const results = ObjectiveValidator.validateAllObjectives(mockLabState);
      
      expect(results).toHaveLength(0);
    });
  });

  describe('pH validation', () => {
    it('should validate pH in range', () => {
      const result = ObjectiveValidator.validateAllObjectives(mockLabState)[0];
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('score');
      expect(result.message).toContain('pH');
    });
  });

  describe('Time limit validation', () => {
    it('should validate time limit', () => {
      const result = ObjectiveValidator.validateAllObjectives(mockLabState)[1];
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('score');
      expect(result.message).toContain('tempo');
    });
  });

  describe('Log validation', () => {
    it('should validate log has key', () => {
      mockLabState.trialLog = [
        {
          timestamp: Date.now(),
          event: 'measure',
          payload: { testKey: 'testValue' }
        }
      ];

      const presetWithLogObjective: ExperimentPreset = {
        ...mockPreset,
        objectives: [
          {
            id: 'log_test',
            description: 'Test log has key',
            validator: {
              type: 'log-has-key',
              params: { key: 'testKey' }
            },
            points: 20
          }
        ]
      };

      mockLabState.currentPreset = presetWithLogObjective;
      const results = ObjectiveValidator.validateAllObjectives(mockLabState);
      
      expect(results[0].isValid).toBe(true);
      expect(results[0].message).toContain('encontrada');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid validator type', () => {
      const presetWithInvalidValidator: ExperimentPreset = {
        ...mockPreset,
        objectives: [
          {
            id: 'invalid_test',
            description: 'Test invalid validator',
            validator: {
              type: 'invalid-validator-type',
              params: {}
            },
            points: 0
          }
        ]
      };

      mockLabState.currentPreset = presetWithInvalidValidator;
      const results = ObjectiveValidator.validateAllObjectives(mockLabState);
      
      expect(results[0].isValid).toBe(false);
      expect(results[0].score).toBe(0);
      expect(results[0].message).toContain('não suportado');
    });
  });
});
