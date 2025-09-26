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

interface AutoReadSlideGoogleProps {
  text: string;
  className?: string;
  voice?: string;
  autoPlay?: boolean;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onError?: (error: string) => void;
}

export default function AutoReadSlideGoogle({
  text,
  className = '',
  voice = 'pt-BR-Wavenet-A',
  autoPlay = false,
  onAudioStart,
  onAudioEnd,
  onError
}: AutoReadSlideGoogleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Pronto');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Função para converter texto em áudio usando Google TTS
  const convertTextToSpeech = useCallback(async (textToConvert: string) => {
    if (!textToConvert?.trim()) {
      setError('Nenhum texto fornecido para conversão');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setStatus('Convertendo texto...');

    try {
      // Usar a API do Google Text-to-Speech
      const response = await fetch('/api/tts/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToConvert,
          voice: voice,
          language: 'pt-BR'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setStatus('Áudio pronto');
      return audioUrl;
      
    } catch (error) {
      console.error('Erro ao converter texto em áudio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      setStatus('Erro');
      onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [voice, onError]);

  // Função para reproduzir áudio
  const playAudio = useCallback(async () => {
    if (!text?.trim()) {
      setError('Nenhum texto para reproduzir');
      return;
    }

    try {
      setIsPlaying(true);
      setStatus('Reproduzindo...');
      onAudioStart?.();

      // Converter texto em áudio se ainda não foi convertido
      const audioUrl = await convertTextToSpeech(text);
      
      if (!audioUrl) {
        setIsPlaying(false);
        setStatus('Erro');
        return;
      }

      // Criar elemento de áudio e reproduzir
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setStatus('Concluído');
        onAudioEnd?.();
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('error', (e) => {
        console.error('Erro ao reproduzir áudio:', e);
        setError('Erro ao reproduzir áudio');
        setIsPlaying(false);
        setStatus('Erro');
        onError?.('Erro ao reproduzir áudio');
        URL.revokeObjectURL(audioUrl);
      });

      await audio.play();
      
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reproduzir áudio';
      setError(errorMessage);
      setIsPlaying(false);
      setStatus('Erro');
      onError?.(errorMessage);
    }
  }, [text, convertTextToSpeech, onAudioStart, onAudioEnd, onError]);

  // Função para parar áudio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setStatus('Parado');
    onAudioEnd?.();
  }, [onAudioEnd]);

  // Auto-play se habilitado
  useEffect(() => {
    if (autoPlay && text?.trim() && !isPlaying && !isLoading) {
      playAudio();
    }
  }, [autoPlay, text, isPlaying, isLoading, playAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isPlaying) return <Volume2 className="w-4 h-4" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Mic className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (error) return 'bg-red-100 text-red-800';
    if (isPlaying) return 'bg-green-100 text-green-800';
    if (isLoading) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Controles principais */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={playAudio}
                disabled={!text?.trim() || isLoading || isPlaying}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isLoading ? 'Convertendo...' : isPlaying ? 'Reproduzindo...' : 'Ler Texto'}
              </Button>
              
              {isPlaying && (
                <Button
                  onClick={stopAudio}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Parar
                </Button>
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

