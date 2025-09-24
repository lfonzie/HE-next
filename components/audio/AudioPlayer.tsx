'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2, 
  AlertCircle,
  RotateCcw,
  Gauge
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface AudioPlayerProps {
  text: string
  className?: string
}

// Cache key generator
const generateCacheKey = (text: string): string => {
  return `tts_alloy_tts-1_${btoa(text).replace(/[^a-zA-Z0-9]/g, '')}`
}

// Cache management
const getCachedAudio = (cacheKey: string): string | null => {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp, expiresAt } = JSON.parse(cached)

      // Check if cache is still valid (24 hours)
      if (Date.now() < expiresAt) {
        return data // Return base64 data
      } else {
        // Remove expired cache
        localStorage.removeItem(cacheKey)
      }
    }
  } catch (error) {
    console.warn('Error reading audio cache:', error)
  }

  return null
}

const setCachedAudio = (cacheKey: string, base64Data: string): void => {
  if (typeof window === 'undefined') return

  try {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    localStorage.setItem(cacheKey, JSON.stringify({ data: base64Data, timestamp: Date.now(), expiresAt }))
  } catch (error) {
    console.warn('Error caching audio:', error)
  }
}

export default function AudioPlayer({
  text,
  className = ''
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null) // Store blob URL
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [playbackRate, setPlaybackRate] = useState<number>(1)

  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Generate audio when text changes
  useEffect(() => {
    // Don't auto-generate audio anymore
    // Audio will be generated only when user clicks play
  }, [text])

  const generateAudio = async () => {
    if (!text || !text.trim()) {
      console.log('No text to generate audio')
      return
    }

    console.log('Generating audio for text:', text.substring(0, 50) + '...')
    const cacheKey = generateCacheKey(text.trim())

    // Check cache first
    const cachedBase64 = getCachedAudio(cacheKey)
    if (cachedBase64) {
      console.log('Using cached audio for:', cacheKey)
      const audioBlob = base64toBlob(cachedBase64, 'audio/mpeg')
      const url = URL.createObjectURL(audioBlob)

      // Revoke previous URL if exists
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl)
      }
      setAudioBlobUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        audioRef.current.playbackRate = playbackRate // Apply current playback rate
      }
      return
    }

    console.log('Generating new audio...')
    setIsLoading(true)
    setError(null)

    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'alloy', // Hardcoded for simplicity
          model: 'tts-1'  // Hardcoded for simplicity
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      // Create blob URL from response
      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)

      // Convert blob to base64 for caching
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = () => {
        const base64data = reader.result as string
        setCachedAudio(cacheKey, base64data)
      }

      // Revoke previous URL if exists
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl)
      }
      setAudioBlobUrl(url)

      // Set up audio element
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        audioRef.current.playbackRate = playbackRate // Apply current playback rate

        // Verify audio loads correctly
        audioRef.current.addEventListener('error', () => {
          console.error('Audio failed to load:', url)
          setError('Erro ao carregar áudio')
        })

        audioRef.current.addEventListener('canplaythrough', () => {
          console.log('Audio loaded successfully:', url)
        })
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't show error
        return
      }

      console.error('Audio generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio'

      // Check if it's an API key error
      if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
        setError('Chave da OpenAI não configurada. Verifique o arquivo .env.local')
      } else {
        setError(errorMessage)
      }

      toast.error('Erro ao gerar áudio')
    } finally {
      setIsLoading(false)
    }
  }

  const base64toBlob = (base64: string, contentType: string = '', sliceSize: number = 512) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  const playAudio = async () => {
    // If no audio URL exists, generate it first
    if (!audioBlobUrl) {
      await generateAudio()
      // After generation, check if we have audio URL
      if (!audioBlobUrl) {
        console.log('Failed to generate audio')
        return
      }
    }
    
    if (audioRef.current && audioBlobUrl) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio()
    } else {
      playAudio()
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleError = () => {
    setError('Erro ao reproduzir áudio')
    setIsPlaying(false)
    toast.error('Erro ao reproduzir áudio')
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            disabled={isLoading || !!error || !text?.trim()}
            size="sm"
            variant="outline"
            className="flex-shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Gerando...
              </>
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 min-w-0">
            {error ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                {error.includes('Chave da OpenAI') && (
                  <div className="text-xs text-blue-600">
                    📋 <Link href="/tts-setup" className="underline">Ver instruções de configuração</Link>
                  </div>
                )}
                <Button
                  onClick={generateAudio}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Time Display */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
                    }}
                  />
                </div>

                {/* Status Text */}
                {!audioBlobUrl && !isLoading && (
                  <div className="text-xs text-gray-500 text-center">
                    Clique para gerar e reproduzir áudio
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <Button
            onClick={toggleMute}
            disabled={!audioBlobUrl || !!error}
            size="sm"
            variant="ghost"
            className="flex-shrink-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          {/* Speed Control */}
          {audioBlobUrl && !error && (
            <div className="flex items-center gap-1">
              <Gauge className="h-4 w-4 text-gray-500" />
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="text-xs border rounded px-1 py-0.5 bg-white"
                disabled={!audioBlobUrl || !!error}
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          )}
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="auto"
        />
      </CardContent>
    </Card>
  )
}