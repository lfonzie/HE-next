/**
 * Audio Capture Component
 * Captura de áudio do microfone para interação com Gemini Live API
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export interface AudioCaptureProps {
  onAudioData?: (audioData: ArrayBuffer) => void;
  onError?: (error: Error) => void;
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
  enabled?: boolean;
  className?: string;
}

export interface AudioPlaybackProps {
  audioData?: ArrayBuffer;
  sampleRate?: number;
  channels?: number;
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

// Componente de captura de áudio
export function AudioCapture({
  onAudioData,
  onError,
  sampleRate = 16000,
  channels = 1,
  bitDepth = 16,
  enabled = true,
  className = ''
}: AudioCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Verificar suporte do navegador
  useEffect(() => {
    const checkSupport = () => {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasMediaRecorder = !!window.MediaRecorder;
      const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext);
      
      setIsSupported(hasGetUserMedia && hasMediaRecorder && hasAudioContext);
      
      if (!hasGetUserMedia) {
        setError('getUserMedia não suportado');
      } else if (!hasMediaRecorder) {
        setError('MediaRecorder não suportado');
      } else if (!hasAudioContext) {
        setError('AudioContext não suportado');
      }
    };

    checkSupport();
  }, []);

  // Solicitar permissão do microfone
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount: channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setPermissionGranted(true);
      setError(null);
      
      // Configurar AudioContext para análise de áudio
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      source.connect(analyserRef.current);
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

      // Configurar MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: sampleRate * channels * bitDepth
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && onAudioData) {
          // Converter Blob para ArrayBuffer
          event.data.arrayBuffer().then(buffer => {
            onAudioData(buffer);
          });
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        const error = new Error(`Erro no MediaRecorder: ${event}`);
        setError(error.message);
        onError?.(error);
      };

      return stream;
    } catch (err) {
      const error = err as Error;
      setError(`Erro ao acessar microfone: ${error.message}`);
      onError?.(error);
      return null;
    }
  }, [sampleRate, channels, bitDepth, onAudioData, onError]);

  // Iniciar gravação
  const startRecording = useCallback(async () => {
    if (!isSupported || !enabled) return;

    try {
      if (!permissionGranted) {
        const stream = await requestMicrophonePermission();
        if (!stream) return;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start(100); // Chunks de 100ms
        setIsRecording(true);
        setError(null);
      }
    } catch (err) {
      const error = err as Error;
      setError(`Erro ao iniciar gravação: ${error.message}`);
      onError?.(error);
    }
  }, [isSupported, enabled, permissionGranted, requestMicrophonePermission, onError]);

  // Parar gravação
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Alternar gravação
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Limpeza
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className={`flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <MicOff className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700">Microfone não suportado</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <button
        onClick={toggleRecording}
        disabled={!enabled}
        className={`p-4 rounded-full transition-all duration-200 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isRecording ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </button>
      
      <div className="text-sm text-gray-600">
        {isRecording ? 'Gravando...' : 'Clique para falar'}
      </div>
      
      {error && (
        <div className="text-xs text-red-600 text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}

// Componente de reprodução de áudio
export function AudioPlayback({
  audioData,
  sampleRate = 24000,
  channels = 1,
  autoPlay = false,
  onPlaybackComplete,
  onError,
  className = ''
}: AudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Verificar suporte
  useEffect(() => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    setIsSupported(!!AudioContext);
  }, []);

  // Reproduzir áudio
  const playAudio = useCallback(async () => {
    if (!audioData || !isSupported) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate });
      }

      // Converter ArrayBuffer para AudioBuffer
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData.slice());
      
      // Parar reprodução anterior se existir
      if (sourceRef.current) {
        sourceRef.current.stop();
      }

      // Criar nova fonte de áudio
      sourceRef.current = audioContextRef.current.createBufferSource();
      sourceRef.current.buffer = audioBuffer;
      sourceRef.current.connect(audioContextRef.current.destination);

      // Configurar eventos
      sourceRef.current.onended = () => {
        setIsPlaying(false);
        onPlaybackComplete?.();
      };

      sourceRef.current.addEventListener('error', (event) => {
        const error = new Error(`Erro na reprodução: ${event}`);
        setError(error.message);
        onError?.(error);
        setIsPlaying(false);
      });

      // Iniciar reprodução
      sourceRef.current.start();
      setIsPlaying(true);
      setError(null);

    } catch (err) {
      const error = err as Error;
      setError(`Erro ao reproduzir áudio: ${error.message}`);
      onError?.(error);
      setIsPlaying(false);
    }
  }, [audioData, sampleRate, isSupported, onPlaybackComplete, onError]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && audioData && !isPlaying) {
      playAudio();
    }
  }, [autoPlay, audioData, isPlaying, playAudio]);

  // Limpeza
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className={`flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <VolumeX className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700">Reprodução de áudio não suportada</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <button
        onClick={playAudio}
        disabled={!audioData || isPlaying}
        className={`p-4 rounded-full transition-all duration-200 ${
          isPlaying
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${!audioData || isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Volume2 className="h-6 w-6" />
      </button>
      
      <div className="text-sm text-gray-600">
        {isPlaying ? 'Reproduzindo...' : 'Clique para ouvir'}
      </div>
      
      {error && (
        <div className="text-xs text-red-600 text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}

// Hook para gerenciar áudio
export function useAudioCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleAudioData = useCallback((data: ArrayBuffer) => {
    setAudioData(data);
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err);
  }, []);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setError(null);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const clearAudioData = useCallback(() => {
    setAudioData(null);
  }, []);

  return {
    isRecording,
    audioData,
    error,
    handleAudioData,
    handleError,
    startRecording,
    stopRecording,
    clearAudioData
  };
}
