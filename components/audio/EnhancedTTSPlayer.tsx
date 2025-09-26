'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Volume2, Play, Pause, Loader2, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface EnhancedTTSPlayerProps {
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

export default function EnhancedTTSPlayer({
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
}: EnhancedTTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(initialSpeed)
  const [volume, setVolume] = useState(initialVolume)
  const [showSettings, setShowSettings] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Função para converter PCM para WAV
  const convertPCMToWAV = (pcmData: Uint8Array, sampleRate: number, channels: number, bitsPerSample: number): Uint8Array => {
    const length = pcmData.length
    const arrayBuffer = new ArrayBuffer(44 + length)
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, channels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true)
    view.setUint16(32, channels * bitsPerSample / 8, true)
    view.setUint16(34, bitsPerSample, true)
    writeString(36, 'data')
    view.setUint32(40, length, true)
    
    // Copy PCM data
    const wavData = new Uint8Array(arrayBuffer)
    wavData.set(pcmData, 44)
    
    return wavData
  }

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
    console.log('🎵 [ENHANCED-TTS] Audio can play')
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration)
    }
  }, [])

  const handleLoadStart = useCallback(() => {
    console.log('🎵 [ENHANCED-TTS] Audio load started')
  }, [])

  // Gerar áudio
  const generateAudio = useCallback(async () => {
    console.log('🎤 [ENHANCED-TTS] generateAudio called')
    console.log('🎤 [ENHANCED-TTS] Text:', text)
    console.log('🎤 [ENHANCED-TTS] Voice:', voice)
    
    if (!text || !text.trim()) {
      console.error('❌ [ENHANCED-TTS] No text provided')
      toast.error('Nenhum texto para gerar áudio')
      return
    }

    console.log('🎤 [ENHANCED-TTS] Starting audio generation...')
    setIsLoading(true)
    setError(null)

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      console.log(`🎤 [ENHANCED-TTS] Generating audio for: "${text.substring(0, 50)}..."`)
      console.log(`🎤 [ENHANCED-TTS] Voice: ${voice}`)
      console.log(`🎤 [ENHANCED-TTS] Making fetch request to /api/tts/gemini-native`)

      const response = await fetch('/api/tts/gemini-native', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: voice,
          speed: speed,
          pitch: 0.0
        }),
        signal: abortControllerRef.current.signal
      })

      console.log(`🎤 [ENHANCED-TTS] Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`❌ [ENHANCED-TTS] HTTP Error: ${response.status}`, errorData)
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      // Handle streaming response from Gemini Live API
      const reader = response.body?.getReader()
      if (!reader) {
        console.error('❌ [ENHANCED-TTS] No response body reader')
        throw new Error('No response body')
      }

      console.log('🎤 [ENHANCED-TTS] Response body reader created successfully')
      setIsStreaming(true)
      const audioChunks: Uint8Array[] = []
      let chunkCount = 0
      let detectedMimeType = 'audio/wav' // Default

      console.log('🔄 [ENHANCED-TTS] Starting real-time streaming...')

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('✅ [ENHANCED-TTS] Stream reading complete')
          break
        }

        // Parse SSE data
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log(`📨 [ENHANCED-TTS] Received data type: ${data.type}`)
              
              if (data.type === 'audio' && data.data) {
                chunkCount++
                console.log(`🎵 [ENHANCED-TTS] Audio chunk ${chunkCount} received: ${data.data.length} chars`)
                
                // Store mimeType from first chunk
                if (chunkCount === 1 && data.mimeType) {
                  detectedMimeType = data.mimeType
                  console.log(`🎵 [ENHANCED-TTS] Detected MIME type: ${detectedMimeType}`)
                }
                
                // Convert base64 to Uint8Array
                try {
                  const binaryString = atob(data.data)
                  const audioData = new Uint8Array(binaryString.length)
                  for (let i = 0; i < binaryString.length; i++) {
                    audioData[i] = binaryString.charCodeAt(i)
                  }

                  // Buffer all chunks for playback
                  audioChunks.push(audioData)
                  console.log(`✅ [ENHANCED-TTS] Chunk ${chunkCount} buffered, total chunks: ${audioChunks.length}`)
                } catch (e) {
                  console.error('❌ [ENHANCED-TTS] Error decoding base64:', e)
                }
              } else if (data.type === 'done') {
                console.log('✅ [ENHANCED-TTS] Streaming complete signal received')
                break
              } else if (data.type === 'error') {
                console.error('❌ [ENHANCED-TTS] Stream error:', data.content)
                throw new Error(data.content || 'Streaming error')
              }
            } catch (e) {
              console.warn('❌ [ENHANCED-TTS] Failed to parse SSE data:', e)
            }
          }
        }
      }

      console.log(`🎵 [ENHANCED-TTS] Total chunks received: ${chunkCount}`)

      // Process buffered chunks
      if (audioChunks.length > 0) {
        console.log('🔄 [ENHANCED-TTS] Processing buffered chunks')
        
        // Combine all audio chunks
        const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const combinedAudio = new Uint8Array(totalLength)
        let offset = 0
        
        for (const chunk of audioChunks) {
          combinedAudio.set(chunk, offset)
          offset += chunk.length
        }

        // Convert PCM to WAV if needed
        let finalAudioData = combinedAudio
        let mimeType = detectedMimeType || 'audio/mpeg'
        
        if (detectedMimeType && detectedMimeType.includes('pcm')) {
          console.log('🔄 [ENHANCED-TTS] Converting PCM to WAV...')
          finalAudioData = convertPCMToWAV(combinedAudio, 24000, 1, 16) // 24kHz, mono, 16-bit
          mimeType = 'audio/wav'
        }
        
        // Create blob and URL
        const audioBlob = new Blob([finalAudioData], { type: mimeType })
        const url = URL.createObjectURL(audioBlob)
        
        console.log(`🎵 [ENHANCED-TTS] Created audio blob: ${audioBlob.size} bytes, type: ${mimeType}`)

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }
        setAudioUrl(url)

        // Set up audio element
        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.load()
          
          // Remove existing event listeners to avoid duplicates
          audioRef.current.removeEventListener('play', handlePlay)
          audioRef.current.removeEventListener('pause', handlePause)
          audioRef.current.removeEventListener('ended', handleEnded)
          audioRef.current.removeEventListener('error', handleError)
          audioRef.current.removeEventListener('canplay', handleCanPlay)
          audioRef.current.removeEventListener('loadstart', handleLoadStart)
          
          // Add new event listeners
          audioRef.current.addEventListener('play', handlePlay)
          audioRef.current.addEventListener('pause', handlePause)
          audioRef.current.addEventListener('ended', handleEnded)
          audioRef.current.addEventListener('error', handleError)
          audioRef.current.addEventListener('canplay', handleCanPlay)
          audioRef.current.addEventListener('loadstart', handleLoadStart)

          // Set playback rate and volume
          audioRef.current.playbackRate = speed
          audioRef.current.volume = volume

          console.log(`🎵 [ENHANCED-TTS] Audio element configured, autoPlay: ${autoPlay}`)
          if (autoPlay) {
            console.log('🎵 [ENHANCED-TTS] Attempting to play audio...')
            audioRef.current.play().catch((error) => {
              console.warn('⚠️ [ENHANCED-TTS] Auto-play failed (browser restriction):', error)
            })
          }
        }
      } else {
        console.error('❌ [ENHANCED-TTS] No audio chunks received!')
        throw new Error('No audio data received from Gemini Native Audio')
      }

      toast.success('Áudio gerado com sucesso!')
      console.log(`✅ [ENHANCED-TTS] Audio generation completed`)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Enhanced TTS Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio'
      setError(errorMessage)
      onError?.(errorMessage)
      toast.error(`Erro ao gerar áudio: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [text, voice, speed, volume, autoPlay, audioUrl, handlePlay, handlePause, handleEnded, handleError, handleCanPlay, handleLoadStart, onError])

  // Controles de reprodução
  const playAudio = useCallback(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch((error) => {
        console.error('🎵 [ENHANCED-TTS] Play failed:', error)
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
            disabled={isLoading || isStreaming}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading || isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isStreaming ? 'Streaming...' : 'Gerando...'}
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
            disabled={isLoading || isStreaming}
          >
            {isLoading || isStreaming ? (
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

      {/* Status de streaming */}
      {isStreaming && (
        <div className="text-sm text-blue-600 text-center">
          Recebendo dados de áudio do servidor...
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
