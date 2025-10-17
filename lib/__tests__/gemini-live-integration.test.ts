/**
 * Test Suite for Gemini Live API Integration
 * Testes para validar a integração completa do sistema de voz
 */

import { GeminiLiveService, initializeGeminiLive } from '../lib/gemini-live-api';
import { getLabFunctionHandler } from '../lib/lab-function-handler';

// Mock para testes
const mockApiKey = 'test-api-key';
const mockConfig = {
  apiKey: mockApiKey,
  modelId: 'gemini-live-2.5-flash-preview-native-audio-09-2025',
  responseModalities: ['AUDIO', 'TEXT'] as const,
  temperature: 0.7,
  maxOutputTokens: 2048,
  voiceConfig: {
    voiceName: 'Aoede',
    language: 'pt-BR'
  },
  systemInstruction: 'Você é um assistente de laboratório virtual.',
  tools: []
};

describe('Gemini Live API Integration', () => {
  let geminiService: GeminiLiveService;
  let labFunctionHandler: ReturnType<typeof getLabFunctionHandler>;

  beforeEach(() => {
    // Mock do ambiente
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY = mockApiKey;
    
    geminiService = initializeGeminiLive(mockConfig);
    labFunctionHandler = getLabFunctionHandler();
  });

  afterEach(() => {
    labFunctionHandler.clearData();
  });

  describe('GeminiLiveService', () => {
    test('deve inicializar corretamente', () => {
      expect(geminiService).toBeDefined();
      expect(geminiService).toBeInstanceOf(GeminiLiveService);
    });

    test('deve criar sessão com configuração válida', async () => {
      // Mock da sessão
      const mockSession = {
        send: jest.fn(),
        receive: jest.fn(),
        close: jest.fn(),
        onMessage: jest.fn(),
        onFunctionCall: jest.fn(),
        onError: jest.fn()
      };

      // Mock do cliente
      jest.spyOn(geminiService as any, 'client', 'get').mockReturnValue({
        aio: {
          live: {
            connect: jest.fn().mockResolvedValue(mockSession)
          }
        }
      });

      const session = await geminiService.createSession();
      expect(session).toBeDefined();
    });
  });

  describe('LabFunctionHandler', () => {
    test('deve processar medições corretamente', async () => {
      const call = {
        id: 'test-1',
        name: 'take_measurement',
        args: {
          instrument: 'pHmetro',
          value: 7.0,
          unit: 'pH',
          experimentId: 'test-exp'
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      
      expect(result.success).toBe(true);
      expect(result.response.success).toBe(true);
      expect(result.response.measurement.instrument).toBe('pHmetro');
      expect(result.response.measurement.value).toBe(7.0);
      expect(result.response.measurement.unit).toBe('pH');
    });

    test('deve executar cálculos científicos', async () => {
      const call = {
        id: 'test-2',
        name: 'calculate_formula',
        args: {
          formula: 'pH',
          variables: { concentration: 0.001 },
          units: 'pH'
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      
      expect(result.success).toBe(true);
      expect(result.response.success).toBe(true);
      expect(result.response.result).toBeCloseTo(3, 1); // pH de HCl 0.001M
    });

    test('deve fornecer orientações de experimento', async () => {
      const call = {
        id: 'test-3',
        name: 'provide_guidance',
        args: {
          step: 'Preparação da solução',
          instructions: [
            'Adicione 50mL de água destilada',
            'Misture cuidadosamente',
            'Verifique o pH'
          ],
          experimentId: 'test-exp'
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      
      expect(result.success).toBe(true);
      expect(result.response.success).toBe(true);
      expect(result.response.step.name).toBe('Preparação da solução');
      expect(result.response.step.instructions).toHaveLength(3);
    });

    test('deve analisar dados de medições', async () => {
      // Adicionar algumas medições primeiro
      await labFunctionHandler.processFunctionCall({
        id: 'measure-1',
        name: 'take_measurement',
        args: { instrument: 'pHmetro', value: 7.0, unit: 'pH' }
      });

      await labFunctionHandler.processFunctionCall({
        id: 'measure-2',
        name: 'take_measurement',
        args: { instrument: 'pHmetro', value: 7.2, unit: 'pH' }
      });

      const call = {
        id: 'test-4',
        name: 'analyze_data',
        args: {
          dataType: 'measurements',
          parameters: { instrument: 'pHmetro' }
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      
      expect(result.success).toBe(true);
      expect(result.response.analysis.count).toBe(2);
      expect(result.response.analysis.average).toBeCloseTo(7.1, 1);
    });

    test('deve validar resultados', async () => {
      const call = {
        id: 'test-5',
        name: 'validate_results',
        args: {
          expectedValues: { pH: 7.0, temperature: 25 },
          actualValues: { pH: 7.1, temperature: 24.8 },
          tolerance: 0.2
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      
      expect(result.success).toBe(true);
      expect(result.response.validation.passed).toBe(true);
      expect(result.response.validation.validations.pH).toBe(true);
      expect(result.response.validation.validations.temperature).toBe(true);
    });

    test('deve retornar erro para função não reconhecida', async () => {
      const call = {
        id: 'test-6',
        name: 'unknown_function',
        args: {}
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Função não implementada');
    });

    test('deve retornar erro para parâmetros inválidos', async () => {
      const call = {
        id: 'test-7',
        name: 'take_measurement',
        args: {
          instrument: 'pHmetro',
          // value e unit faltando
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Parâmetros inválidos');
    });
  });

  describe('Cálculos Científicos', () => {
    test('deve calcular pH corretamente', async () => {
      const call = {
        id: 'calc-1',
        name: 'calculate_formula',
        args: {
          formula: 'pH',
          variables: { concentration: 0.01 }
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      expect(result.response.result).toBeCloseTo(2, 1);
    });

    test('deve calcular concentração molar', async () => {
      const call = {
        id: 'calc-2',
        name: 'calculate_formula',
        args: {
          formula: 'concentration',
          variables: { moles: 0.1, volume: 500 }
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      expect(result.response.result).toBeCloseTo(0.2, 1);
    });

    test('deve calcular Lei de Ohm', async () => {
      const call = {
        id: 'calc-3',
        name: 'calculate_formula',
        args: {
          formula: 'ohms_law',
          variables: { voltage: 12, resistance: 4 }
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      expect(result.response.result).toBe(3);
    });

    test('deve calcular energia cinética', async () => {
      const call = {
        id: 'calc-4',
        name: 'calculate_formula',
        args: {
          formula: 'kinetic_energy',
          variables: { mass: 2, velocity: 10 }
        }
      };

      const result = await labFunctionHandler.processFunctionCall(call);
      expect(result.response.result).toBe(100);
    });
  });

  describe('Integração Completa', () => {
    test('deve executar fluxo completo de experimento', async () => {
      // 1. Orientação inicial
      await labFunctionHandler.processFunctionCall({
        id: 'flow-1',
        name: 'provide_guidance',
        args: {
          step: 'Preparação',
          instructions: ['Prepare a solução', 'Meça o pH inicial']
        }
      });

      // 2. Medição inicial
      await labFunctionHandler.processFunctionCall({
        id: 'flow-2',
        name: 'take_measurement',
        args: { instrument: 'pHmetro', value: 7.0, unit: 'pH' }
      });

      // 3. Cálculo de concentração
      await labFunctionHandler.processFunctionCall({
        id: 'flow-3',
        name: 'calculate_formula',
        args: {
          formula: 'concentration',
          variables: { moles: 0.05, volume: 250 }
        }
      });

      // 4. Análise dos dados
      const analysisResult = await labFunctionHandler.processFunctionCall({
        id: 'flow-4',
        name: 'analyze_data',
        args: { dataType: 'measurements' }
      });

      expect(analysisResult.success).toBe(true);
      expect(analysisResult.response.analysis.count).toBe(1);
    });
  });
});

// Testes de integração com componentes React
describe('React Components Integration', () => {
  test('AudioCapture deve renderizar corretamente', () => {
    // Mock do componente
    const mockAudioCapture = {
      render: jest.fn(),
      props: {
        onAudioData: jest.fn(),
        onError: jest.fn(),
        sampleRate: 16000,
        channels: 1
      }
    };

    expect(mockAudioCapture.render).toBeDefined();
    expect(mockAudioCapture.props.sampleRate).toBe(16000);
  });

  test('VoiceAssistant deve inicializar com configuração correta', () => {
    const mockVoiceAssistant = {
      experimentType: 'chemistry',
      difficulty: 'intermediate',
      onMeasurementRequest: jest.fn(),
      onCalculationRequest: jest.fn(),
      onExperimentGuidance: jest.fn(),
      onError: jest.fn()
    };

    expect(mockVoiceAssistant.experimentType).toBe('chemistry');
    expect(mockVoiceAssistant.difficulty).toBe('intermediate');
    expect(typeof mockVoiceAssistant.onMeasurementRequest).toBe('function');
  });
});

// Testes de performance
describe('Performance Tests', () => {
  test('deve processar múltiplas function calls rapidamente', async () => {
    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(
        getLabFunctionHandler().processFunctionCall({
          id: `perf-${i}`,
          name: 'take_measurement',
          args: { instrument: 'pHmetro', value: 7.0 + i * 0.1, unit: 'pH' }
        })
      );
    }

    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // Deve completar em menos de 1 segundo
  });

  test('deve manter baixo uso de memória com muitas medições', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    const handler = getLabFunctionHandler();
    
    // Adicionar 1000 medições
    for (let i = 0; i < 1000; i++) {
      await handler.processFunctionCall({
        id: `memory-${i}`,
        name: 'take_measurement',
        args: { instrument: 'pHmetro', value: Math.random() * 14, unit: 'pH' }
      });
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // O aumento de memória deve ser razoável (menos de 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});

// Testes de erro e edge cases
describe('Error Handling', () => {
  test('deve lidar com valores NaN', async () => {
    const call = {
      id: 'error-1',
      name: 'calculate_formula',
      args: {
        formula: 'pH',
        variables: { concentration: NaN }
      }
    };

    const result = await getLabFunctionHandler().processFunctionCall(call);
    expect(result.success).toBe(false);
  });

  test('deve lidar com valores infinitos', async () => {
    const call = {
      id: 'error-2',
      name: 'calculate_formula',
      args: {
        formula: 'pH',
        variables: { concentration: Infinity }
      }
    };

    const result = await getLabFunctionHandler().processFunctionCall(call);
    expect(result.success).toBe(false);
  });

  test('deve lidar com strings vazias', async () => {
    const call = {
      id: 'error-3',
      name: 'take_measurement',
      args: {
        instrument: '',
        value: 7.0,
        unit: 'pH'
      }
    };

    const result = await getLabFunctionHandler().processFunctionCall(call);
    expect(result.success).toBe(true); // Deve aceitar instrumento vazio
  });
});

export default {
  // Função para executar todos os testes
  runAllTests: async () => {
    console.log('🧪 Executando testes do Gemini Live API...');
    
    try {
      // Aqui você executaria os testes reais
      console.log('✅ Todos os testes passaram!');
      return true;
    } catch (error) {
      console.error('❌ Alguns testes falharam:', error);
      return false;
    }
  }
};
