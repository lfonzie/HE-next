'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Play, 
  Pause, 
  Loader2, 
  AlertCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  User,
  Gauge
} from 'lucide-react'
import { toast } from 'sonner'

interface OpenAIAvatarPlayerProps {
  text: string
  className?: string
}

// Cache key generator - Unicode-safe encoding
const generateCacheKey = (text: string): string => {
  // Encode string to UTF-8 bytes, then to base64
  const utf8Bytes = new TextEncoder().encode(text)
  const base64 = btoa(String.fromCharCode(...utf8Bytes))
  return `openai_tts_${base64.replace(/[^a-zA-Z0-9]/g, '')}`
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
        return data
      } else {
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

export default function OpenAIAvatarPlayer({
  text,
  className = ''
}: OpenAIAvatarPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [playbackRate, setPlaybackRate] = useState<number>(1)
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy')

  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const voices = [
    { value: 'alloy', label: 'Alloy (Neutra)' },
    { value: 'echo', label: 'Echo (Masculina)' },
    { value: 'fable', label: 'Fable (Feminina)' },
    { value: 'onyx', label: 'Onyx (Masculina)' },
    { value: 'nova', label: 'Nova (Feminina)' },
    { value: 'shimmer', label: 'Shimmer (Feminina)' }
  ]

  // Generate audio when text changes
  useEffect(() => {
    if (text && text.trim()) {
      generateAudio()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl)
        setAudioBlobUrl(null)
      }
    }
  }, [text, selectedVoice])

  const generateAudio = async () => {
    if (!text || !text.trim()) {
      console.log('No text to generate audio')
      return
    }

    console.log('Generating OpenAI TTS audio for text:', text.substring(0, 50) + '...')
    const cacheKey = generateCacheKey(`${text.trim()}_${selectedVoice}`)

    // Check cache first
    const cachedBase64 = getCachedAudio(cacheKey)
    if (cachedBase64) {
      console.log('Using cached OpenAI TTS audio for:', cacheKey)
      const audioBlob = base64toBlob(cachedBase64, 'audio/mpeg')
      const url = URL.createObjectURL(audioBlob)

      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl)
      }
      setAudioBlobUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        audioRef.current.playbackRate = playbackRate
      }
      return
    }

    console.log('Generating new OpenAI TTS audio...')
    setIsLoading(true)
    setError(null)

    try {
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
          voice: selectedVoice,
          model: 'tts-1'
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

      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl)
      }
      setAudioBlobUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        audioRef.current.playbackRate = playbackRate
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('OpenAI TTS generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio'

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

  const playAudio = () => {
    if (audioRef.current && audioBlobUrl) {
      audioRef.current.play()
      setIsPlaying(true)
      setIsSpeaking(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setIsSpeaking(false)
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
    setIsSpeaking(false)
    setCurrentTime(0)
  }

  const handleError = () => {
    setError('Erro ao reproduzir áudio')
    setIsPlaying(false)
    setIsSpeaking(false)
    toast.error('Erro ao reproduzir áudio')
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Avatar OpenAI TTS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Voz</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
            disabled={isLoading}
          >
            {voices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Avatar Face */}
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              {/* Eyes */}
              <div className="flex gap-4 mb-2">
                <div className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${isSpeaking ? 'animate-pulse' : ''}`}></div>
                <div className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${isSpeaking ? 'animate-pulse' : ''}`}></div>
              </div>
              {/* Mouth */}
              <div className="absolute bottom-8">
                <div className={`w-6 h-3 bg-white rounded-full transition-all duration-200 ${isSpeaking ? 'animate-bounce' : ''}`}></div>
              </div>
            </div>
            
            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <Volume2 className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            disabled={isLoading || !!error || !audioBlobUrl}
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
                    📋 <a href="/tts-setup" className="underline">Ver instruções de configuração</a>
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
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
                    }}
                  />
                </div>

                {/* Status Text */}
                {!audioBlobUrl && !isLoading && (
                  <div className="text-xs text-gray-500 text-center">
                    Clique para gerar áudio
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

        {/* Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h4 className="font-semibold text-purple-800 mb-2">🤖 OpenAI TTS + Avatar</h4>
          <ul className="text-purple-700 space-y-1 text-sm">
            <li>• 6 vozes diferentes disponíveis</li>
            <li>• Qualidade profissional de áudio</li>
            <li>• Avatar animado sincronizado</li>
            <li>• Controle de velocidade de reprodução</li>
            <li>• Cache inteligente</li>
          </ul>
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
