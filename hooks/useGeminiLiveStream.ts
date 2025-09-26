"use client"

import { useState, useCallback, useRef, useEffect } from 'react';

// Tipos baseados na estrutura da live-audio
interface LiveServerMessage {
  serverContent?: {
    modelTurn?: {
      parts?: Array<{
        inlineData?: {
          data: string;
        };
      }>;
    };
    interrupted?: boolean;
  };
}

interface Session {
  sendRealtimeInput: (input: { text?: string; media?: any }) => Promise<void>;
  close: () => void;
}

interface UseGeminiLiveStreamOptions {
  voice?: string;
  autoConnect?: boolean;
  onAudioReceived?: (audioData: string) => Promise<void>;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
}

interface UseGeminiLiveStreamReturn {
  isConnected: boolean;
  isConnecting: boolean;
  isStreaming: boolean;
  error: string | null;
  status: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  streamText: (text: string) => Promise<void>;
  streamAudio: (audioData: Float32Array) => Promise<void>;
}

export function useGeminiLiveStream({
  voice = 'Orus',
  autoConnect = false,
  onAudioReceived,
  onError,
  onStatusChange
}: UseGeminiLiveStreamOptions = {}): UseGeminiLiveStreamReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Desconectado');
  
  const sessionRef = useRef<Session | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Inicializar contexto de áudio
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);
      nextStartTimeRef.current = audioContextRef.current.currentTime;
    }
  }, []);

  // Processar áudio recebido
  const processAudioResponse = useCallback(async (audioData: string) => {
    if (!audioContextRef.current || !outputNodeRef.current) return;

    try {
      // Decodificar dados base64
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decodificar áudio
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      
      // Chamar callback personalizado se fornecido
      if (onAudioReceived) {
        await onAudioReceived(audioData);
        return;
      }
      
      // Reprodução padrão
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputNodeRef.current);
      
      // Configurar timing
      nextStartTimeRef.current = Math.max(
        nextStartTimeRef.current,
        audioContextRef.current.currentTime
      );
      
      // Reproduzir áudio
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      sourcesRef.current.add(source);
      
      // Limpar fonte quando terminar
      source.addEventListener('ended', () => {
        sourcesRef.current.delete(source);
      });
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar áudio';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onAudioReceived, onError]);

  // Parar todo o áudio
  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignorar erros de source já parado
      }
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  // Conectar ao Gemini Live API
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    setStatus('Conectando...');
    onStatusChange?.('Conectando...');
    
    try {
      // Verificar se temos a API key
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg";
      if (!API_KEY) {
        throw new Error('GEMINI_API_KEY não configurada');
      }

      // Importar GoogleGenAI dinamicamente
      const { GoogleGenAI } = await import('@google/genai');
      
      const client = new GoogleGenAI({
        apiKey: API_KEY,
      });

      // Inicializar contexto de áudio
      initAudioContext();

      // Conectar à sessão Live
      const session = await client.live.connect({
        model: 'gemini-2.5-flash-preview-native-audio-dialog',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            setStatus('Conectado');
            onStatusChange?.('Conectado');
          },
          onmessage: async (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            
            if (audio) {
              await processAudioResponse(audio.data);
            }

            // Verificar se foi interrompido
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              stopAllAudio();
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Erro na conexão Gemini:', e);
            const errorMessage = `Erro de conexão: ${e.message}`;
            setError(errorMessage);
            setIsConnected(false);
            setIsConnecting(false);
            setStatus('Erro de conexão');
            onStatusChange?.('Erro de conexão');
            onError?.(errorMessage);
          },
          onclose: (e: CloseEvent) => {
            console.log('Conexão fechada:', e.reason);
            setIsConnected(false);
            setIsConnecting(false);
            setStatus('Desconectado');
            onStatusChange?.('Desconectado');
          },
        },
        config: {
          responseModalities: ['AUDIO'],
          inputModalities: ['TEXT'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
        },
      });

      sessionRef.current = session;
      
    } catch (error) {
      console.error('Erro ao conectar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      setIsConnecting(false);
      setStatus('Erro de conexão');
      onStatusChange?.('Erro de conexão');
      onError?.(errorMessage);
    }
  }, [isConnected, isConnecting, voice, initAudioContext, processAudioResponse, stopAllAudio, onError, onStatusChange]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    stopAllAudio();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsConnected(false);
    setIsStreaming(false);
    setStatus('Desconectado');
    onStatusChange?.('Desconectado');
  }, [stopAllAudio, onStatusChange]);

  // Stream de texto para áudio
  const streamText = useCallback(async (text: string) => {
    if (!sessionRef.current || !text || !isConnected) {
      const errorMessage = 'Não conectado ou texto vazio';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    try {
      setIsStreaming(true);
      setStatus('Enviando texto...');
      onStatusChange?.('Enviando texto...');
      
      // Enviar texto para Gemini Live API
      await sessionRef.current.sendRealtimeInput({ text });
      
      setStatus('Processando áudio...');
      onStatusChange?.('Processando áudio...');
      
    } catch (error) {
      console.error('Erro ao enviar texto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar texto';
      setError(errorMessage);
      setIsStreaming(false);
      setStatus('Erro');
      onStatusChange?.('Erro');
      onError?.(errorMessage);
    }
  }, [isConnected, onError, onStatusChange]);

  // Stream de áudio (para futuras funcionalidades)
  const streamAudio = useCallback(async (audioData: Float32Array) => {
    if (!sessionRef.current || !isConnected) {
      const errorMessage = 'Não conectado';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    try {
      setIsStreaming(true);
      setStatus('Enviando áudio...');
      onStatusChange?.('Enviando áudio...');
      
      // Converter Float32Array para blob PCM
      const int16 = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        int16[i] = audioData[i] * 32768;
      }
      
      const blob = {
        data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
        mimeType: 'audio/pcm;rate=16000',
      };
      
      await sessionRef.current.sendRealtimeInput({ media: blob });
      
      setStatus('Processando...');
      onStatusChange?.('Processando...');
      
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar áudio';
      setError(errorMessage);
      setIsStreaming(false);
      setStatus('Erro');
      onStatusChange?.('Erro');
      onError?.(errorMessage);
    }
  }, [isConnected, onError, onStatusChange]);

  // Auto-conectar se habilitado
  useEffect(() => {
    if (autoConnect && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect, isConnected, isConnecting, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    isStreaming,
    error,
    status,
    connect,
    disconnect,
    streamText,
    streamAudio
  };
}
