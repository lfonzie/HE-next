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

interface GoogleAudioPlayerProps {
  text: string
  voice?: string
  speed?: number
  pitch?: number
  enableFallback?: boolean
  className?: string
}

export default function GoogleAudioPlayer({
  text,
  voice = 'pt-BR-Wavenet-C',
  speed = 1.0,
  pitch = 0.0,
  enableFallback = true,
  className = ''
}: GoogleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = async () => {
    if (!text.trim()) {
      setError('Texto não pode estar vazio')
      return
    }

    setIsLoading(true)
    setError(null)
    setUsingFallback(false)

    try {
      const response = await fetch('/api/google-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          speed,
          pitch,
          enableFallback,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar áudio')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      // Check if fallback was used
      const fallbackUsed = response.headers.get('X-Fallback-Used') === 'true'
      setUsingFallback(fallbackUsed)

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
              {usingFallback && (
                <span className="text-orange-600">(Fallback OpenAI)</span>
              )}
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
                Áudio gerado com sucesso usando {usingFallback ? 'OpenAI TTS (fallback)' : 'Google TTS'}
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
