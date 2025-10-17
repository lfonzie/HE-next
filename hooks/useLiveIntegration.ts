/**
 * Hook para integração completa com Gemini Live API
 * Unifica todos os módulos live com funcionalidades avançadas
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GeminiLiveService, initializeGeminiLive } from '@/lib/gemini-live-api';
import { getLabFunctionHandler } from '@/lib/lab-function-handler';

export interface LiveIntegrationConfig {
  experimentType?: 'chemistry' | 'physics' | 'biology' | 'mathematics';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  enableFunctionCalling?: boolean;
  enableAudioAnalysis?: boolean;
  enableVideoStreaming?: boolean;
  enableScreenSharing?: boolean;
}

export interface LiveIntegrationState {
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isVideoStreaming: boolean;
  isScreenSharing: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  error?: string;
  measurements: any[];
  calculations: any[];
  audioAnalysis?: any;
}

export interface LiveIntegrationActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  startVideoStreaming: () => Promise<void>;
  stopVideoStreaming: () => Promise<void>;
  startScreenSharing: () => Promise<void>;
  stopScreenSharing: () => Promise<void>;
  sendAudioData: (audioData: ArrayBuffer) => Promise<void>;
  sendTextMessage: (message: string) => Promise<void>;
  processFunctionCall: (call: any) => Promise<any>;
  analyzeAudioData: (audioData: ArrayBuffer, sampleRate: number) => Promise<any>;
  clearData: () => void;
}

export function useLiveIntegration(config: LiveIntegrationConfig = {}) {
  const [state, setState] = useState<LiveIntegrationState>({
    isConnected: false,
    isRecording: false,
    isSpeaking: false,
    isVideoStreaming: false,
    isScreenSharing: false,
    connectionStatus: 'disconnected',
    measurements: [],
    calculations: []
  });

  const geminiServiceRef = useRef<GeminiLiveService | null>(null);
  const sessionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const labFunctionHandlerRef = useRef(getLabFunctionHandler());

  // Inicializar serviço Gemini Live
  const initializeService = useCallback(async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 
                    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Chave da API Gemini não encontrada');
      }

      const tools = config.enableFunctionCalling ? [
        {
          function_declarations: [{
            name: 'take_measurement',
            description: 'Registra uma medição de instrumento',
            parameters: {
              type: 'object',
              properties: {
                instrument: { type: 'string', description: 'Nome do instrumento' },
                value: { type: 'number', description: 'Valor medido' },
                unit: { type: 'string', description: 'Unidade da medição' }
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
                formula: { type: 'string', description: 'Fórmula a ser calculada' },
                variables: { type: 'object', description: 'Variáveis da fórmula' }
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
                frequency: { type: 'number', description: 'Frequência dominante' },
                amplitude: { type: 'number', description: 'Amplitude do sinal' },
                duration: { type: 'number', description: 'Duração em segundos' }
              },
              required: ['frequency', 'amplitude']
            }
          }]
        }
      ] : [];

      geminiServiceRef.current = initializeGeminiLive({
        apiKey,
        modelId: 'gemini-live-2.5-flash-preview-native-audio-09-2025',
        responseModalities: ['AUDIO', 'TEXT'],
        voiceConfig: {
          voiceName: 'Aoede',
          language: 'pt-BR'
        },
        systemInstruction: `Você é um assistente especializado em ${config.experimentType || 'ciências'} de nível ${config.difficulty || 'intermediário'}.`,
        tools
      });

      setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
    } catch (error) {
      console.error('Erro ao inicializar serviço:', error);
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, [config]);

  // Conectar ao serviço
  const connect = useCallback(async () => {
    try {
      if (!geminiServiceRef.current) {
        await initializeService();
      }

      if (geminiServiceRef.current) {
        sessionRef.current = await geminiServiceRef.current.createSession();
        
        // Configurar callbacks
        sessionRef.current.onMessage((message: any) => {
          if (message.type === 'audio') {
            setState(prev => ({ ...prev, isSpeaking: true }));
            // Reproduzir áudio
            playAudio(message.data);
          } else if (message.type === 'text') {
            console.log('Resposta do Gemini:', message.content);
          }
        });

        sessionRef.current.onFunctionCall(async (call: any) => {
          const result = await labFunctionHandlerRef.current.processFunctionCall(call);
          await sessionRef.current.sendFunctionResponse({
            id: call.id,
            response: result.response
          });
        });

        setState(prev => ({ 
          ...prev, 
          isConnected: true,
          connectionStatus: 'connected',
          error: undefined
        }));
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Erro de conexão'
      }));
    }
  }, [initializeService]);

  // Desconectar
  const disconnect = useCallback(async () => {
    try {
      if (sessionRef.current) {
        await sessionRef.current.close();
        sessionRef.current = null;
      }
      
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        isRecording: false,
        isSpeaking: false,
        connectionStatus: 'disconnected'
      }));
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }, []);

  // Iniciar gravação
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && sessionRef.current) {
          const audioData = await event.data.arrayBuffer();
          await sendAudioData(audioData);
        }
      };

      mediaRecorderRef.current.start(100);
      setState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erro ao acessar microfone'
      }));
    }
  }, []);

  // Parar gravação
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, []);

  // Enviar dados de áudio
  const sendAudioData = useCallback(async (audioData: ArrayBuffer) => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.sendMessage({
          type: 'audio',
          data: audioData,
          sampleRate: 16000,
          channels: 1
        });
      } catch (error) {
        console.error('Erro ao enviar áudio:', error);
      }
    }
  }, []);

  // Enviar mensagem de texto
  const sendTextMessage = useCallback(async (message: string) => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.sendMessage({
          type: 'text',
          content: message
        });
      } catch (error) {
        console.error('Erro ao enviar texto:', error);
      }
    }
  }, []);

  // Processar function call
  const processFunctionCall = useCallback(async (call: any) => {
    try {
      const result = await labFunctionHandlerRef.current.processFunctionCall(call);
      
      // Atualizar estado com novos dados
      if (call.name === 'take_measurement') {
        setState(prev => ({
          ...prev,
          measurements: [...prev.measurements, result.response.measurement]
        }));
      } else if (call.name === 'calculate_formula') {
        setState(prev => ({
          ...prev,
          calculations: [...prev.calculations, result.response.calculation]
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao processar function call:', error);
      throw error;
    }
  }, []);

  // Analisar dados de áudio
  const analyzeAudioData = useCallback(async (audioData: ArrayBuffer, sampleRate: number) => {
    try {
      const response = await fetch('/api/gemini-live-integrated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_audio_data',
          data: { audioData, sampleRate }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({ ...prev, audioAnalysis: result.analysis }));
        return result.analysis;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro na análise de áudio:', error);
      throw error;
    }
  }, []);

  // Reproduzir áudio
  const playAudio = useCallback(async (audioData: ArrayBuffer) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext({ sampleRate: 24000 });
      
      const audioBuffer = await audioContext.decodeAudioData(audioData.slice());
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        audioContext.close();
      };
      
      source.start();
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // Limpar dados
  const clearData = useCallback(async () => {
    labFunctionHandlerRef.current.clearData();
    setState(prev => ({ 
      ...prev, 
      measurements: [],
      calculations: [],
      audioAnalysis: undefined
    }));
  }, []);

  // Placeholders para vídeo e compartilhamento de tela
  const startVideoStreaming = useCallback(async () => {
    setState(prev => ({ ...prev, isVideoStreaming: true }));
  }, []);

  const stopVideoStreaming = useCallback(async () => {
    setState(prev => ({ ...prev, isVideoStreaming: false }));
  }, []);

  const startScreenSharing = useCallback(async () => {
    setState(prev => ({ ...prev, isScreenSharing: true }));
  }, []);

  const stopScreenSharing = useCallback(async () => {
    setState(prev => ({ ...prev, isScreenSharing: false }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const actions: LiveIntegrationActions = {
    connect,
    disconnect,
    startRecording,
    stopRecording,
    startVideoStreaming,
    stopVideoStreaming,
    startScreenSharing,
    stopScreenSharing,
    sendAudioData,
    sendTextMessage,
    processFunctionCall,
    analyzeAudioData,
    clearData
  };

  return {
    state,
    actions
  };
}
