'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Pause, 
  Volume2, 
  Loader2, 
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface GeminiNativeAudioPlayerProps {
  text: string
  voice?: string
  autoPlay?: boolean
  className?: string
}

export default function GeminiNativeAudioPlayer({
  text,
  voice = 'Zephyr',
  autoPlay = false,
  className = ''
}: GeminiNativeAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = async () => {
    if (!text.trim()) {
      setError('Texto não pode estar vazio')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gemini-native-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar áudio')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  useEffect(() => {
    if (autoPlay && text.trim()) {
      handlePlay()
    }
  }, [autoPlay, text])

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Audio Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={isLoading || !text.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLoading ? 'Gerando...' : isPlaying ? 'Pausar' : 'Reproduzir'}
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Voz: {voice}</span>
            </div>
          </div>

          {/* Audio Element */}
          <audio
            ref={audioRef}
            onEnded={handleEnded}
            className="w-full"
            controls
            preload="none"
          />

          {/* Status */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {audioUrl && !error && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Áudio gerado com sucesso usando Gemini Native Audio
              </AlertDescription>
            </Alert>
          )}

          {/* Text Preview */}
          <div className="text-sm text-muted-foreground">
            <strong>Texto:</strong> {text.substring(0, 100)}
            {text.length > 100 && '...'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
