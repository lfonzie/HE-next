"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  VolumeX, 
  Loader2, 
  Play, 
  Square,
  AlertCircle,
  CheckCircle,
  Mic,
  MicOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Importar tipos do Google GenAI
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

interface LiveAudioStreamPlayerProps {
  text: string;
  className?: string;
  voice?: string;
  autoPlay?: boolean;
  showVisualization?: boolean;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onError?: (error: string) => void;
}

export default function LiveAudioStreamPlayer({
  text,
  className = '',
  voice = 'Orus',
  autoPlay = false,
  showVisualization = true,
  onAudioStart,
  onAudioEnd,
  onError
}: LiveAudioStreamPlayerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Desconectado');
  
  const sessionRef = useRef<Session | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { toast } = useToast();

  // Inicializar contexto de áudio
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);
      nextStartTimeRef.current = audioContextRef.current.currentTime;
    }
  }, []);

  // Conectar ao Gemini Live API
  const connectToGemini = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    setStatus('Conectando...');
    
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
            toast({
              title: "Conectado ao Gemini Live",
              description: "Streaming de áudio ativo",
            });
            
            // Auto-leitura do conteúdo se habilitado
            if (autoPlay && text?.trim()) {
              setTimeout(() => {
                streamTextToAudio();
              }, 500); // Pequeno delay para garantir conexão estável
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            
            if (audio && audioContextRef.current && outputNodeRef.current) {
              try {
                await playAudioResponse(audio.data);
              } catch (error) {
                console.error('Erro ao reproduzir áudio:', error);
                setError('Erro ao reproduzir áudio');
              }
            }

            // Verificar se foi interrompido
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              stopAllAudio();
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Erro na conexão Gemini:', e);
            setError(`Erro de conexão: ${e.message}`);
            setIsConnected(false);
            setIsConnecting(false);
            setStatus('Erro de conexão');
            onError?.(e.message);
          },
          onclose: (e: CloseEvent) => {
            console.log('Conexão fechada:', e.reason);
            setIsConnected(false);
            setIsConnecting(false);
            setStatus('Desconectado');
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
      onError?.(errorMessage);
    }
  }, [isConnected, isConnecting, voice, initAudioContext, toast, onError]);

  // Reproduzir áudio recebido
  const playAudioResponse = useCallback(async (audioData: string) => {
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
      
      // Criar fonte de áudio
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
      
      setIsPlaying(true);
      onAudioStart?.();
      
      // Limpar fonte quando terminar
      source.addEventListener('ended', () => {
        sourcesRef.current.delete(source);
        if (sourcesRef.current.size === 0) {
          setIsPlaying(false);
          onAudioEnd?.();
        }
      });
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      throw error;
    }
  }, [onAudioStart, onAudioEnd]);

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
    setIsPlaying(false);
    onAudioEnd?.();
  }, [onAudioEnd]);

  // Stream de texto para áudio
  const streamTextToAudio = useCallback(async () => {
    if (!sessionRef.current || !text || !isConnected) {
      toast({
        title: "Erro",
        description: "Não conectado ou texto vazio",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsStreaming(true);
      setStatus('Enviando texto...');
      
      // Enviar texto para Gemini Live API
      await sessionRef.current.sendRealtimeInput({ text });
      
      setStatus('Processando áudio...');
      
    } catch (error) {
      console.error('Erro ao enviar texto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar texto';
      setError(errorMessage);
      setIsStreaming(false);
      setStatus('Erro');
      onError?.(errorMessage);
    }
  }, [text, isConnected, toast, onError]);

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
    setIsPlaying(false);
    setStatus('Desconectado');
  }, [stopAllAudio]);

  // Auto-play quando texto muda
  useEffect(() => {
    if (autoPlay && text && isConnected && !isStreaming) {
      streamTextToAudio();
    }
  }, [autoPlay, text, isConnected, isStreaming, streamTextToAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const getStatusIcon = () => {
    if (isConnecting) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isStreaming) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isPlaying) return <Volume2 className="w-4 h-4" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (isConnected) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Mic className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (error) return 'bg-red-100 text-red-800';
    if (isPlaying) return 'bg-green-100 text-green-800';
    if (isStreaming) return 'bg-yellow-100 text-yellow-800';
    if (isConnected) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Controles principais */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {!isConnected ? (
                <Button
                  onClick={connectToGemini}
                  disabled={isConnecting}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  {isConnecting ? 'Conectando...' : 'Conectar'}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={streamTextToAudio}
                    disabled={!text?.trim() || isStreaming}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isStreaming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isStreaming ? 'Processando...' : 'Falar'}
                  </Button>
                  
                  {isPlaying && (
                    <Button
                      onClick={stopAllAudio}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Parar
                    </Button>
                  )}
                  
                  <Button
                    onClick={disconnect}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MicOff className="w-4 h-4" />
                    Desconectar
                  </Button>
                </>
              )}
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor()}>
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                  <span>{status}</span>
                </div>
              </Badge>
            </div>
          </div>


          {/* Mensagem de erro */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
