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
  CheckCircle,
  User
} from 'lucide-react'

interface SimpleAvatarPlayerProps {
  text: string
  voice?: string
  className?: string
}

export default function SimpleAvatarPlayer({
  text,
  voice = 'pt-BR-Wavenet-C',
  className = ''
}: SimpleAvatarPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = async () => {
    if (!text.trim()) {
      setError('Texto não pode estar vazio')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/google-tts', {
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
        setIsSpeaking(true)
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
      setIsSpeaking(false)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setIsSpeaking(false)
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
          {/* Avatar */}
          <div className="flex justify-center">
            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-all duration-300 ${
              isSpeaking ? 'scale-110 shadow-lg' : 'scale-100'
            }`}>
              <User className="h-12 w-12 text-white" />
              
              {/* Speaking Animation */}
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping"></div>
              )}
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={isLoading || !text.trim()}
              className="flex items-center gap-2"
              size="lg"
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
                Avatar com áudio gerado com sucesso
              </AlertDescription>
            </Alert>
          )}

          {/* Text Preview */}
          <div className="text-sm text-muted-foreground text-center">
            <strong>Texto:</strong> {text.substring(0, 80)}
            {text.length > 80 && '...'}
          </div>

          {/* Voice Info */}
          <div className="text-xs text-muted-foreground text-center">
            <Volume2 className="h-3 w-3 inline mr-1" />
            Voz: {voice}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
