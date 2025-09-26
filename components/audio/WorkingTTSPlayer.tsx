'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Volume2, Play, Pause, Loader2, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface WorkingTTSPlayerProps {
  text: string
  className?: string
  voice?: string
  autoPlay?: boolean
  onAudioStart?: () => void
  onAudioEnd?: () => void
  onError?: (error: string) => void
  // Controles de navegação
  onPrevious?: () => void
  onNext?: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
  // Controles de velocidade
  initialSpeed?: number
  onSpeedChange?: (speed: number) => void
  // Controles de volume
  initialVolume?: number
  onVolumeChange?: (volume: number) => void
}

export default function WorkingTTSPlayer({
  text,
  className = '',
  voice = 'Zephyr',
  autoPlay = false,
  onAudioStart,
  onAudioEnd,
  onError,
  onPrevious,
  onNext,
  canGoPrevious = false,
  canGoNext = false,
  initialSpeed = 1.0,
  onSpeedChange,
  initialVolume = 0.8,
  onVolumeChange
}: WorkingTTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(initialSpeed)
  const [volume, setVolume] = useState(initialVolume)
  const [showSettings, setShowSettings] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<string>('')
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [audioUrl])

  // Atualizar progresso do áudio
  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration)
      }
    }
  }, [])

  // Iniciar/parar atualização de progresso
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(updateProgress, 100)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPlaying, updateProgress])

  // Event handlers do áudio
  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    onAudioStart?.()
  }, [onAudioStart])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    onAudioEnd?.()
  }, [onAudioEnd])

  const handleError = useCallback(() => {
    const errorMsg = 'Erro ao reproduzir áudio'
    setError(errorMsg)
    setIsPlaying(false)
    onError?.(errorMsg)
    toast.error(errorMsg)
  }, [onError])

  const handleCanPlay = useCallback(() => {
    console.log('🎵 [WORKING-TTS] Audio can play')
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration)
    }
  }, [])

  // Gerar áudio com Google TTS (que funciona)
  const generateAudioWithGoogleTTS = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎤 [WORKING-TTS] Trying Google TTS...')
      
      const response = await fetch('/api/tts/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'pt-BR-Wavenet-C', // Use best Google TTS voice
          speed: speed,
          pitch: 0.0
        }),
        signal: abortControllerRef.current?.signal
      })

      if (!response.ok) {
        throw new Error(`Google TTS failed: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(url)
      setCurrentProvider('Google TTS WaveNet')

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        audioRef.current.playbackRate = speed
        audioRef.current.volume = volume
        
        // Remove existing event listeners to avoid duplicates
        audioRef.current.removeEventListener('play', handlePlay)
        audioRef.current.removeEventListener('pause', handlePause)
        audioRef.current.removeEventListener('ended', handleEnded)
        audioRef.current.removeEventListener('error', handleError)
        audioRef.current.removeEventListener('canplay', handleCanPlay)
        
        // Add new event listeners
        audioRef.current.addEventListener('play', handlePlay)
        audioRef.current.addEventListener('pause', handlePause)
        audioRef.current.addEventListener('ended', handleEnded)
        audioRef.current.addEventListener('error', handleError)
        audioRef.current.addEventListener('canplay', handleCanPlay)

        // Auto-play when audio is ready
        if (autoPlay) {
          audioRef.current.play().catch((error) => {
            console.warn('⚠️ [WORKING-TTS] Auto-play failed (browser restriction):', error)
          })
        }
      }

      console.log('✅ [WORKING-TTS] Google TTS success!')
      toast.success('Áudio gerado com Google TTS!')
      return true

    } catch (error) {
      console.warn('⚠️ [WORKING-TTS] Google TTS failed:', error)
      return false
    }
  }, [text, speed, volume, autoPlay, audioUrl, handlePlay, handlePause, handleEnded, handleError, handleCanPlay])

  // Gerar áudio com OpenAI TTS (fallback)
  const generateAudioWithOpenAI = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎤 [WORKING-TTS] Trying OpenAI TTS...')
      
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'shimmer',
          model: 'tts-1-hd',
          speed: speed,
          format: 'mp3'
        }),
        signal: abortControllerRef.current?.signal
      })

      if (!response.ok) {
        throw new Error(`OpenAI TTS failed: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(url)
      setCurrentProvider('OpenAI TTS')

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        audioRef.current.playbackRate = speed
        audioRef.current.volume = volume
        
        // Remove existing event listeners to avoid duplicates
        audioRef.current.removeEventListener('play', handlePlay)
        audioRef.current.removeEventListener('pause', handlePause)
        audioRef.current.removeEventListener('ended', handleEnded)
        audioRef.current.removeEventListener('error', handleError)
        audioRef.current.removeEventListener('canplay', handleCanPlay)
        
        // Add new event listeners
        audioRef.current.addEventListener('play', handlePlay)
        audioRef.current.addEventListener('pause', handlePause)
        audioRef.current.addEventListener('ended', handleEnded)
        audioRef.current.addEventListener('error', handleError)
        audioRef.current.addEventListener('canplay', handleCanPlay)

        // Auto-play when audio is ready
        if (autoPlay) {
          audioRef.current.play().catch((error) => {
            console.warn('⚠️ [WORKING-TTS] Auto-play failed (browser restriction):', error)
          })
        }
      }

      console.log('✅ [WORKING-TTS] OpenAI TTS success!')
      toast.success('Áudio gerado com OpenAI TTS!')
      return true

    } catch (error) {
      console.warn('⚠️ [WORKING-TTS] OpenAI TTS failed:', error)
      return false
    }
  }, [text, speed, volume, autoPlay, audioUrl, handlePlay, handlePause, handleEnded, handleError, handleCanPlay])

  // Gerar áudio com fallback automático
  const generateAudio = useCallback(async () => {
    console.log('🎤 [WORKING-TTS] generateAudio called')
    console.log('🎤 [WORKING-TTS] Text:', text)
    
    if (!text || !text.trim()) {
      console.error('❌ [WORKING-TTS] No text provided')
      toast.error('Nenhum texto para gerar áudio')
      return
    }

    console.log('🎤 [WORKING-TTS] Starting audio generation...')
    setIsLoading(true)
    setError(null)

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      // Try Google TTS first (most reliable)
      const googleSuccess = await generateAudioWithGoogleTTS()
      
      if (!googleSuccess) {
        console.log('⚠️ [WORKING-TTS] Google TTS failed, trying OpenAI TTS...')
        const openaiSuccess = await generateAudioWithOpenAI()
        
        if (!openaiSuccess) {
          throw new Error('Todos os provedores de TTS falharam')
        }
      }

      console.log(`✅ [WORKING-TTS] Audio generation completed with ${currentProvider}`)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Working TTS Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio'
      setError(errorMessage)
      onError?.(errorMessage)
      toast.error(`Erro ao gerar áudio: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [text, generateAudioWithGoogleTTS, generateAudioWithOpenAI, currentProvider, onError])

  // Controles de reprodução
  const playAudio = useCallback(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch((error) => {
        console.error('🎵 [WORKING-TTS] Play failed:', error)
        toast.error('Erro ao reproduzir áudio: ' + error.message)
      })
    } else {
      toast.error('Áudio não está pronto para reprodução')
    }
  }, [audioUrl])

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }, [])

  // Controles de velocidade
  const handleSpeedChange = useCallback((newSpeed: number[]) => {
    const speedValue = newSpeed[0]
    setSpeed(speedValue)
    if (audioRef.current) {
      audioRef.current.playbackRate = speedValue
    }
    onSpeedChange?.(speedValue)
  }, [onSpeedChange])

  // Controles de volume
  const handleVolumeChange = useCallback((newVolume: number[]) => {
    const volumeValue = newVolume[0]
    setVolume(volumeValue)
    if (audioRef.current) {
      audioRef.current.volume = volumeValue
    }
    onVolumeChange?.(volumeValue)
  }, [onVolumeChange])

  // Controles de navegação
  const handlePrevious = useCallback(() => {
    onPrevious?.()
  }, [onPrevious])

  const handleNext = useCallback(() => {
    onNext?.()
  }, [onNext])

  // Formatar tempo
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Progresso do áudio
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controles principais */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
        {/* Botão Gerar/Regenerar */}
        {!audioUrl && (
          <Button 
            onClick={generateAudio} 
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Gerar Áudio
              </>
            )}
          </Button>
        )}

        {/* Controles de navegação */}
        {audioUrl && (
          <>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                variant="outline"
                size="sm"
                title="Slide anterior"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                onClick={stopAudio}
                variant="outline"
                size="sm"
                title="Parar"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                variant="outline"
                size="sm"
                title="Próximo slide"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Informações de tempo */}
            <div className="text-sm text-gray-600 min-w-[100px] text-center">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Botão de configurações */}
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              title="Configurações"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Barra de progresso */}
      {audioUrl && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Configurações */}
      {showSettings && audioUrl && (
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
          {/* Controle de velocidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Velocidade: {speed}x
            </label>
            <Slider
              value={[speed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Controle de volume */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Volume: {Math.round(volume * 100)}%
            </label>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Botão regenerar */}
          <Button
            onClick={generateAudio}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Regenerando...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Regenerar Áudio
              </>
            )}
          </Button>
        </div>
      )}

      {/* Status do provedor */}
      {audioUrl && currentProvider && (
        <div className="text-sm text-green-600 text-center">
          ✅ Áudio gerado com {currentProvider}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Elemento de áudio oculto */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
