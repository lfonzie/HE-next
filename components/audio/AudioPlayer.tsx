'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2, 
  AlertCircle,
  RotateCcw,
  Gauge,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  Share2
} from 'lucide-react'
import { toast } from 'sonner'

interface AudioPlayerProps {
  text: string
  className?: string
  autoPlay?: boolean
  showControls?: boolean
  enableKeyboard?: boolean
  onPlay?: () => void
  onPause?: () => void
  onComplete?: () => void
  onError?: (error: string) => void
}

// Cache key generator - Unicode-safe encoding
const generateCacheKey = (text: string): string => {
  const utf8Bytes = new TextEncoder().encode(text)
  const base64 = btoa(String.fromCharCode(...utf8Bytes))
  return `tts_alloy_tts-1_${base64.replace(/[^a-zA-Z0-9]/g, '')}`
}

// Cache management with IndexedDB fallback
const getCachedAudio = async (cacheKey: string): Promise<string | null> => {
  if (typeof window === 'undefined') return null

  try {
    // Try localStorage first
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp, expiresAt } = JSON.parse(cached)
      if (Date.now() < expiresAt) {
        return data
      } else {
        localStorage.removeItem(cacheKey)
      }
    }

    // Fallback to IndexedDB
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('AudioCache', 1)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('audio')) {
            db.createObjectStore('audio', { keyPath: 'key' })
          }
        }
      })

      const transaction = db.transaction(['audio'], 'readonly')
      const store = transaction.objectStore('audio')
      const request = store.get(cacheKey)
      
      return new Promise<string | null>((resolve) => {
        request.onsuccess = () => {
          const result = request.result
          if (result && Date.now() < result.expiresAt) {
            resolve(result.data)
          } else {
            resolve(null)
          }
        }
        request.onerror = () => resolve(null)
      })
    } catch (indexedDBError) {
      console.warn('IndexedDB not available:', indexedDBError)
      return null
    }
  } catch (error) {
    console.warn('Error reading audio cache:', error)
    return null
  }
}

const setCachedAudio = async (cacheKey: string, data: string): Promise<void> => {
  if (typeof window === 'undefined') return

  const cacheData = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (localStorageError) {
    console.warn('localStorage full, trying IndexedDB:', localStorageError)
    
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('AudioCache', 1)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('audio')) {
            db.createObjectStore('audio', { keyPath: 'key' })
          }
        }
      })

      const transaction = db.transaction(['audio'], 'readwrite')
      const store = transaction.objectStore('audio')
      store.put({ key: cacheKey, ...cacheData })
    } catch (indexedDBError) {
      console.error('Failed to cache audio:', indexedDBError)
    }
  }
}

const base64toBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

export default function AudioPlayer({ 
  text, 
  className = '', 
  autoPlay = false,
  showControls = true,
  enableKeyboard = true,
  onPlay,
  onPause,
  onComplete,
  onError
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isCached, setIsCached] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Memoized cache key
  const cacheKey = useMemo(() => generateCacheKey(text), [text])

  // Generate audio function with caching
  const generateAudio = useCallback(async () => {
    if (!text || !text.trim()) {
      setError('Nenhum texto fornecido para gerar áudio')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check cache first
      const cachedAudio = await getCachedAudio(cacheKey)
      if (cachedAudio) {
        console.log('Using cached audio')
        setIsCached(true)
        const audioBlob = base64toBlob(cachedAudio, 'audio/mpeg')
        const url = URL.createObjectURL(audioBlob)
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }
        setAudioUrl(url)
        setIsLoading(false)
        return
      }

      // Generate new audio
      console.log('Generating new audio for text:', text.substring(0, 50) + '...')
      
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/tts/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'alloy',
          model: 'tts-1'
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      
      // Convert to base64 for caching
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        await setCachedAudio(cacheKey, base64)
      }
      reader.readAsDataURL(audioBlob)

      const url = URL.createObjectURL(audioBlob)
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(url)
      setIsCached(false)
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Audio generation cancelled')
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao gerar áudio'
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error generating audio:', err)
    } finally {
      setIsLoading(false)
    }
  }, [text, cacheKey, audioUrl, onError])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      onComplete?.()
    }
    const handleError = () => {
      setError('Erro ao reproduzir áudio')
      setIsPlaying(false)
    }
    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()
    }
    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [onPlay, onPause, onComplete])

  // Update audio properties
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume
    audio.playbackRate = playbackSpeed
  }, [volume, isMuted, playbackSpeed])

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          handleTogglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleSeek(Math.max(0, currentTime - 10))
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSeek(Math.min(duration, currentTime + 10))
          break
        case 'm':
          e.preventDefault()
          setIsMuted(!isMuted)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboard, currentTime, duration, isMuted])

  const handleTogglePlay = useCallback(async () => {
    if (!audioUrl) {
      await generateAudio()
      return
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        try {
          await audioRef.current.play()
        } catch (err) {
          setError('Erro ao reproduzir áudio')
          console.error('Play error:', err)
        }
      }
    }
  }, [audioUrl, isPlaying, generateAudio])

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0])
  }, [])

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }, [])

  const handleSkipBack = useCallback(() => {
    handleSeek(Math.max(0, currentTime - 10))
  }, [currentTime, handleSeek])

  const handleSkipForward = useCallback(() => {
    handleSeek(Math.min(duration, currentTime + 10))
  }, [currentTime, duration, handleSeek])

  const handleDownload = useCallback(() => {
    if (audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = `audio-${Date.now()}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }, [audioUrl])

  const handleShare = useCallback(() => {
    if (navigator.share && audioUrl) {
      navigator.share({
        title: 'Áudio gerado',
        text: text.substring(0, 100) + '...',
        url: audioUrl,
      }).catch(console.error)
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(audioUrl || '').then(() => {
        toast.success('Link copiado para a área de transferência')
      }).catch(console.error)
    }
  }, [audioUrl, text])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [audioUrl])

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipBack}
              disabled={!audioUrl || isLoading}
              aria-label="Voltar 10 segundos"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              size="lg"
              onClick={handleTogglePlay}
              disabled={isLoading}
              className="w-16 h-16 rounded-full"
              aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipForward}
              disabled={!audioUrl || isLoading}
              aria-label="Avançar 10 segundos"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          {audioUrl && (
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={(value) => handleSeek(value[0])}
                className="w-full"
                disabled={isLoading}
                aria-label="Posição do áudio"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Secondary Controls */}
          {showControls && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                    disabled={isMuted}
                    aria-label="Volume"
                  />
                </div>

                {/* Playback Speed */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Velocidade:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                    disabled={!audioUrl}
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestart}
                  disabled={!audioUrl}
                  aria-label="Reiniciar áudio"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!audioUrl}
                  aria-label="Baixar áudio"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  disabled={!audioUrl}
                  aria-label="Compartilhar áudio"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {isCached && (
                <Badge variant="outline" className="text-xs">
                  <Gauge className="w-3 h-3 mr-1" />
                  Cache
                </Badge>
              )}
              {isLoading && (
                <Badge variant="outline" className="text-xs">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Gerando
                </Badge>
              )}
            </div>
            
            {enableKeyboard && (
              <div className="text-xs">
                Pressione <kbd className="px-1 py-0.5 bg-gray-200 rounded">Espaço</kbd> para reproduzir/pausar
              </div>
            )}
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} src={audioUrl || undefined} preload="none" />
      </CardContent>
    </Card>
  )
}