/**
 * Voice Assistant Component
 * Assistente de voz integrado ao laboratório virtual usando Gemini Live API
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  MessageSquare, 
  Zap,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { AudioCapture, AudioPlayback, useAudioCapture } from './AudioComponents';
import { 
  GeminiLiveService, 
  GeminiLiveSession, 
  FunctionCall, 
  FunctionResponse,
  initializeGeminiLive 
} from '../../lib/gemini-live-api';
import { getLabFunctionHandler, LabFunctionCall } from '../../lib/lab-function-handler';

export interface VoiceAssistantProps {
  experimentId?: string;
  experimentType?: 'chemistry' | 'physics' | 'biology' | 'mathematics';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onMeasurementRequest?: (instrument: string, value: number, unit: string) => void;
  onCalculationRequest?: (formula: string, variables: Record<string, number>) => number;
  onExperimentGuidance?: (step: string, instructions: string[]) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioData?: ArrayBuffer;
  isTranscription?: boolean;
}

interface AssistantState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isMinimized: boolean;
  currentExperiment?: string;
  messages: Message[];
  error?: string;
}

export function VoiceAssistant({
  experimentId,
  experimentType = 'chemistry',
  difficulty = 'intermediate',
  onMeasurementRequest,
  onCalculationRequest,
  onExperimentGuidance,
  onError,
  className = ''
}: VoiceAssistantProps) {
  const [state, setState] = useState<AssistantState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isMinimized: false,
    messages: [],
    error: undefined
  });

  const [settings, setSettings] = useState({
    voiceEnabled: true,
    autoListen: false,
    showTranscriptions: true,
    voiceName: 'Aoede',
    language: 'pt-BR'
  });

  const geminiServiceRef = useRef<GeminiLiveService | null>(null);
  const sessionRef = useRef<GeminiLiveSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isRecording,
    audioData,
    error: audioError,
    handleAudioData,
    handleError: handleAudioError,
    startRecording,
    stopRecording,
    clearAudioData
  } = useAudioCapture();

  // Configurar Gemini Live API
  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 
                      process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        
        if (!apiKey) {
          throw new Error('Chave da API Gemini não encontrada');
        }

        // Configurar ferramentas específicas do laboratório
        const labTools = [
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
              name: 'provide_guidance',
              description: 'Fornece orientação para o experimento',
              parameters: {
                type: 'object',
                properties: {
                  step: {
                    type: 'string',
                    description: 'Etapa atual do experimento'
                  },
                  instructions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Lista de instruções'
                  }
                },
                required: ['step', 'instructions']
              }
            }]
          }
        ];

        geminiServiceRef.current = initializeGeminiLive({
          apiKey,
          tools: labTools,
          systemInstruction: `Você é um assistente especializado em laboratório virtual para ${experimentType}. 
                           Ajude estudantes com experimentos de nível ${difficulty}. 
                           Seja claro, educativo e encorajador. 
                           Use as ferramentas disponíveis para medições e cálculos.`
        });

        setState(prev => ({ ...prev, isConnected: true }));
      } catch (error) {
        const err = error as Error;
        setState(prev => ({ ...prev, error: err.message }));
        onError?.(err);
      }
    };

    initializeAssistant();
  }, [experimentType, difficulty, onError]);

  // Conectar à sessão Gemini Live
  const connectToSession = useCallback(async () => {
    if (!geminiServiceRef.current) return;

    try {
      const session = await geminiServiceRef.current.createSession();
      sessionRef.current = session;

      // Configurar callbacks
      session.onMessage((message) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: message.content || '',
          timestamp: new Date(),
          audioData: message.data,
          isTranscription: message.type === 'output_transcription'
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage],
          isSpeaking: !!message.data
        }));
      });

      session.onFunctionCall((call: FunctionCall) => {
        handleFunctionCall(call);
      });

      session.onError((error) => {
        setState(prev => ({ ...prev, error: error.message }));
        onError?.(error);
      });

      // Mensagem de boas-vindas
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'system',
        content: `Olá! Sou seu assistente de laboratório virtual. Estou aqui para ajudar com seu experimento de ${experimentType}. Como posso ajudar?`,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, welcomeMessage]
      }));

    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, error: err.message }));
      onError?.(err);
    }
  }, [experimentType, onError]);

  // Processar function calls
  const handleFunctionCall = useCallback(async (call: FunctionCall) => {
    try {
      const labFunctionHandler = getLabFunctionHandler();
      const labCall: LabFunctionCall = {
        id: call.id,
        name: call.name,
        args: call.args
      };

      const result = await labFunctionHandler.processFunctionCall(labCall);

      // Chamar callbacks específicos se necessário
      if (result.success) {
        switch (call.name) {
          case 'take_measurement':
            const { instrument, value, unit } = call.args;
            onMeasurementRequest?.(instrument, value, unit);
            break;
          case 'calculate_formula':
            const { formula, variables } = call.args;
            onCalculationRequest?.(formula, variables);
            break;
          case 'provide_guidance':
            const { step, instructions } = call.args;
            onExperimentGuidance?.(step, instructions);
            break;
        }
      }

      // Enviar resposta
      if (sessionRef.current) {
        await sessionRef.current.sendFunctionResponse({
          id: call.id,
          response: result.response
        });
      }
    } catch (error) {
      console.error('Erro ao processar function call:', error);
      if (sessionRef.current) {
        await sessionRef.current.sendFunctionResponse({
          id: call.id,
          response: { error: 'Erro ao processar solicitação' }
        });
      }
    }
  }, [onMeasurementRequest, onCalculationRequest, onExperimentGuidance]);

  // Enviar áudio para Gemini
  const sendAudioToGemini = useCallback(async () => {
    if (!audioData || !sessionRef.current) return;

    try {
      await sessionRef.current.sendMessage({
        type: 'audio',
        data: audioData,
        sampleRate: 16000,
        channels: 1
      });

      clearAudioData();
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
    }
  }, [audioData, clearAudioData]);

  // Enviar texto para Gemini
  const sendTextToGemini = useCallback(async (text: string) => {
    if (!sessionRef.current) return;

    try {
      await sessionRef.current.sendMessage({
        type: 'text',
        content: text
      });
    } catch (error) {
      console.error('Erro ao enviar texto:', error);
    }
  }, []);

  // Conectar quando componente montar
  useEffect(() => {
    if (state.isConnected && !sessionRef.current) {
      connectToSession();
    }
  }, [state.isConnected, connectToSession]);

  // Enviar áudio automaticamente quando capturado
  useEffect(() => {
    if (audioData && state.isConnected) {
      sendAudioToGemini();
    }
  }, [audioData, state.isConnected, sendAudioToGemini]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Alternar escuta
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopRecording();
      setState(prev => ({ ...prev, isListening: false }));
    } else {
      startRecording();
      setState(prev => ({ ...prev, isListening: true }));
    }
  }, [state.isListening, startRecording, stopRecording]);

  // Alternar minimização
  const toggleMinimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  // Limpar mensagens
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  if (state.isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <button
          onClick={toggleMinimize}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
        >
          <Bot className="h-6 w-6" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Assistente de Voz</h3>
          {state.isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleMinimize}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={clearMessages}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {state.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'system'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.audioData && settings.voiceEnabled && (
                  <AudioPlayback
                    audioData={message.audioData}
                    sampleRate={24000}
                    autoPlay={false}
                    className="mt-2"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4">
          <AudioCapture
            onAudioData={handleAudioData}
            onError={handleAudioError}
            enabled={state.isConnected}
            className="flex-shrink-0"
          />
          
          <button
            onClick={toggleListening}
            disabled={!state.isConnected}
            className={`p-3 rounded-full transition-colors ${
              state.isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${!state.isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {state.isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {state.isSpeaking && (
            <div className="flex items-center space-x-2 text-green-600">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm">Falando...</span>
            </div>
          )}
        </div>

        {state.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            {state.error}
          </div>
        )}
      </div>
    </motion.div>
  );
}
