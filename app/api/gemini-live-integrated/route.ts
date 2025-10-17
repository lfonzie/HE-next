/**
 * API Route para Gemini Live com Function Calling
 * Integração completa com Gemini 2.5 Flash Live API
 */

import { NextRequest, NextResponse } from 'next/server';
import { GeminiLiveService, initializeGeminiLive } from '@/lib/gemini-live-api';
import { getLabFunctionHandler } from '@/lib/lab-function-handler';

// Instância singleton do serviço
let geminiLiveService: GeminiLiveService | null = null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Inicializar serviço se necessário
    if (!geminiLiveService) {
      const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Chave da API Gemini não encontrada' },
          { status: 401 }
        );
      }

      geminiLiveService = initializeGeminiLive({
        apiKey,
        modelId: 'gemini-live-2.5-flash-preview-native-audio-09-2025',
        responseModalities: ['AUDIO', 'TEXT'],
        voiceConfig: {
          voiceName: 'Aoede',
          language: 'pt-BR'
        },
        systemInstruction: 'Você é um assistente especializado em laboratório virtual e análises científicas.',
        tools: [
          {
            function_declarations: [{
              name: 'take_measurement',
              description: 'Registra uma medição de instrumento',
              parameters: {
                type: 'object',
                properties: {
                  instrument: {
                    type: 'string',
                    description: 'Nome do instrumento (pHmetro, termômetro, etc.)'
                  },
                  value: {
                    type: 'number',
                    description: 'Valor medido'
                  },
                  unit: {
                    type: 'string',
                    description: 'Unidade da medição (pH, °C, mL, etc.)'
                  }
                },
                required: ['instrument', 'value', 'unit']
              }
            }]
          },
          {
            function_declarations: [{
              name: 'calculate_formula',
              description: 'Executa cálculos científicos',
              parameters: {
                type: 'object',
                properties: {
                  formula: {
                    type: 'string',
                    description: 'Fórmula a ser calculada'
                  },
                  variables: {
                    type: 'object',
                    description: 'Variáveis da fórmula'
                  }
                },
                required: ['formula', 'variables']
              }
            }]
          },
          {
            function_declarations: [{
              name: 'analyze_audio',
              description: 'Analisa características do áudio',
              parameters: {
                type: 'object',
                properties: {
                  frequency: {
                    type: 'number',
                    description: 'Frequência dominante em Hz'
                  },
                  amplitude: {
                    type: 'number',
                    description: 'Amplitude do sinal'
                  },
                  duration: {
                    type: 'number',
                    description: 'Duração em segundos'
                  }
                },
                required: ['frequency', 'amplitude']
              }
            }]
          }
        ]
      });
    }

    switch (action) {
      case 'create_session':
        try {
          const session = await geminiLiveService.createSession();
          return NextResponse.json({
            success: true,
            sessionId: Date.now().toString(),
            message: 'Sessão criada com sucesso'
          });
        } catch (error) {
          console.error('Erro ao criar sessão:', error);
          return NextResponse.json(
            { error: 'Erro ao criar sessão Gemini Live' },
            { status: 500 }
          );
        }

      case 'process_function_call':
        try {
          const labFunctionHandler = getLabFunctionHandler();
          const result = await labFunctionHandler.processFunctionCall(data);
          
          return NextResponse.json({
            success: result.success,
            response: result.response,
            error: result.error
          });
        } catch (error) {
          console.error('Erro ao processar function call:', error);
          return NextResponse.json(
            { error: 'Erro ao processar function call' },
            { status: 500 }
          );
        }

      case 'analyze_audio_data':
        try {
          const { audioData, sampleRate } = data;
          
          // Análise básica do áudio
          const analysis = {
            duration: audioData.length / sampleRate,
            sampleRate,
            channels: 1,
            bitDepth: 16,
            frequency: Math.random() * 2000 + 100, // Simulação
            amplitude: Math.random() * 0.5 + 0.1, // Simulação
            timestamp: Date.now()
          };

          return NextResponse.json({
            success: true,
            analysis,
            message: 'Análise de áudio concluída'
          });
        } catch (error) {
          console.error('Erro na análise de áudio:', error);
          return NextResponse.json(
            { error: 'Erro na análise de áudio' },
            { status: 500 }
          );
        }

      case 'get_measurements':
        try {
          const labFunctionHandler = getLabFunctionHandler();
          const measurements = labFunctionHandler.getMeasurements();
          
          return NextResponse.json({
            success: true,
            measurements,
            count: measurements.length
          });
        } catch (error) {
          console.error('Erro ao obter medições:', error);
          return NextResponse.json(
            { error: 'Erro ao obter medições' },
            { status: 500 }
          );
        }

      case 'get_calculations':
        try {
          const labFunctionHandler = getLabFunctionHandler();
          const calculations = labFunctionHandler.getCalculations();
          
          return NextResponse.json({
            success: true,
            calculations,
            count: calculations.length
          });
        } catch (error) {
          console.error('Erro ao obter cálculos:', error);
          return NextResponse.json(
            { error: 'Erro ao obter cálculos' },
            { status: 500 }
          );
        }

      case 'clear_data':
        try {
          const labFunctionHandler = getLabFunctionHandler();
          labFunctionHandler.clearData();
          
          return NextResponse.json({
            success: true,
            message: 'Dados limpos com sucesso'
          });
        } catch (error) {
          console.error('Erro ao limpar dados:', error);
          return NextResponse.json(
            { error: 'Erro ao limpar dados' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erro na API Gemini Live:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          status: geminiLiveService ? 'initialized' : 'not_initialized',
          timestamp: Date.now()
        });

      case 'health':
        return NextResponse.json({
          success: true,
          health: 'ok',
          timestamp: Date.now(),
          version: '1.0.0'
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'API Gemini Live funcionando',
          endpoints: [
            'POST /api/gemini-live-integrated - Processar ações',
            'GET /api/gemini-live-integrated?action=status - Status do serviço',
            'GET /api/gemini-live-integrated?action=health - Health check'
          ]
        });
    }

  } catch (error) {
    console.error('Erro no GET da API Gemini Live:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
