'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Loader2, Play, Pause, RotateCcw } from 'lucide-react'

interface OptimizedTTSPlayerProps {
  text: string
  voice?: string
  model?: string
  speed?: number
  format?: string
  className?: string
  autoPlay?: boolean
  onAudioStart?: () => void
  onAudioEnd?: () => void
  onError?: (error: string) => void
}

interface AudioChunk {
  chunkIndex: number
  text: string
  audioData: string
  isLast: boolean
}

export default function OptimizedTTSPlayer({
  text,
  voice = 'Zephyr',
  model = 'tts-1',
  speed = 1.0,
  format = 'mp3',
  className = '',
  autoPlay = true,
  onAudioStart,
  onAudioEnd,
  onError
}: OptimizedTTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentChunk, setCurrentChunk] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  const currentChunkIndexRef = useRef(0)
  const isPlayingRef = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      // Clean up audio URLs
      audioRef.current.forEach(audio => {
        if (audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src)
        }
      })
    }
  }, [])

  // Reset state when text changes
  useEffect(() => {
    if (text) {
      resetState()
    }
  }, [text])

  const resetState = useCallback(() => {
    setIsPlaying(false)
    setIsLoading(false)
    setIsPaused(false)
    setError(null)
    setProgress(0)
    setCurrentChunk(0)
    setTotalChunks(0)
    currentChunkIndexRef.current = 0
    
    // Clean up existing audio
    audioRef.current.forEach(audio => {
      if (audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src)
      }
    })
    audioRef.current = []
  }, [])

  const playNextChunk = useCallback(() => {
    if (currentChunkIndexRef.current >= audioRef.current.length) {
      // All chunks played
      setIsPlaying(false)
      isPlayingRef.current = false
      onAudioEnd?.()
      return
    }

    const audio = audioRef.current[currentChunkIndexRef.current]
    if (!audio) return

    audio.currentTime = 0
    audio.play()
      .then(() => {
        setCurrentChunk(currentChunkIndexRef.current)
        setProgress((currentChunkIndexRef.current / totalChunks) * 100)
      })
      .catch((err) => {
        console.error('Error playing audio chunk:', err)
        setError('Erro ao reproduzir áudio')
        onError?.('Erro ao reproduzir áudio')
      })
  }, [totalChunks, onAudioEnd, onError])

  const setupAudioChunk = useCallback((chunk: AudioChunk) => {
    try {
      // Convert base64 to blob
      const binaryString = atob(chunk.audioData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: `audio/${format}` })
      const url = URL.createObjectURL(blob)

      // Create audio element
      const audio = new Audio(url)
      audio.preload = 'auto'
      audio.playbackRate = speed

      // Set up event listeners
      audio.addEventListener('ended', () => {
        currentChunkIndexRef.current++
        if (isPlayingRef.current) {
          playNextChunk()
        }
      })

      audio.addEventListener('error', (e) => {
        console.error('Audio chunk error:', e)
        setError('Erro no chunk de áudio')
        onError?.('Erro no chunk de áudio')
      })

      // Insert audio at correct position to maintain order
      audioRef.current[chunk.chunkIndex] = audio

      // Aguardar todos os chunks ficarem prontos antes de reproduzir
      if (chunk.isLast && autoPlay && !isPlayingRef.current && !isLoading) {
        // Função para verificar se todos os chunks estão prontos
        const checkAllChunksReady = () => {
          // Usar o totalChunks do estado ou o tamanho atual do array
          const expectedChunks = totalChunks > 0 ? totalChunks : audioRef.current.length
          const readyChunks = audioRef.current.filter(audio => audio && audio.readyState >= 2)
          
          console.log(`Verificando chunks: ${readyChunks.length}/${expectedChunks} prontos`)
          console.log('AudioRef length:', audioRef.current.length)
          console.log('TotalChunks state:', totalChunks)
          
          // Verificar se temos pelo menos o número esperado de chunks
          if (audioRef.current.length >= expectedChunks && readyChunks.length >= expectedChunks) {
            console.log('Todos os chunks estão prontos, iniciando reprodução')
            setTimeout(() => {
              if (audioRef.current[0] && !isPlayingRef.current) {
                playAudio()
              }
            }, 500) // Delay maior para garantir carregamento completo
            return true
          }
          return false
        }
        
        // Verificar imediatamente
        if (!checkAllChunksReady()) {
          // Se não estão todos prontos, verificar novamente em intervalos
          const checkInterval = setInterval(() => {
            if (checkAllChunksReady()) {
              clearInterval(checkInterval)
            }
          }, 100)
          
          // Timeout de segurança para evitar loop infinito
          setTimeout(() => {
            clearInterval(checkInterval)
            if (audioRef.current[0] && !isPlayingRef.current) {
              console.log('Timeout atingido, iniciando reprodução com chunks disponíveis')
              playAudio()
            }
          }, 5000) // 5 segundos de timeout
        }
      }
    } catch (err) {
      console.error('Error setting up audio chunk:', err)
      setError('Erro ao processar chunk de áudio')
      onError?.('Erro ao processar chunk de áudio')
    }
  }, [format, speed, playNextChunk, onError, autoPlay, isLoading])

  const generateStreamingAudio = useCallback(async () => {
    if (!text || !text.trim()) {
      console.log('No text to generate audio')
      return
    }

    console.log('Starting optimized TTS generation for:', text.substring(0, 50) + '...')
    
    resetState()
    setIsLoading(true)
    setError(null)

    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/tts/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          model,
          speed,
          format,
          chunkSize: 60 // Smaller chunks for faster streaming
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate streaming audio')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                console.log('Optimized TTS completed')
                break
              }

              try {
                const parsed = JSON.parse(data)
                
                if (parsed.type === 'metadata') {
                  setTotalChunks(parsed.totalChunks)
                  console.log('Received metadata:', parsed)
                } else if (parsed.type === 'audio_chunk') {
                  const chunk: AudioChunk = {
                    chunkIndex: parsed.chunkIndex,
                    text: parsed.text,
                    audioData: parsed.audioData,
                    isLast: parsed.isLast
                  }
                  
                  // Setup audio immediately for faster playback
                  setupAudioChunk(chunk)
                  
                  console.log(`Received audio chunk ${parsed.chunkIndex}/${parsed.totalChunks}`)
                } else if (parsed.type === 'chunk_error') {
                  console.error(`Chunk error for index ${parsed.chunkIndex}:`, parsed.error)
                  setError(`Erro no chunk ${parsed.chunkIndex}: ${parsed.error}`)
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.error)
                } else if (parsed.type === 'complete') {
                  console.log('Optimized TTS generation completed')
                  setIsLoading(false)
                }
              } catch (parseError) {
                console.error('Error parsing streaming data:', parseError)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

    } catch (error) {
      console.error('Optimized TTS Error:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Optimized TTS request cancelled')
        } else {
          setError(error.message)
          onError?.(error.message)
        }
      } else {
        setError('Erro desconhecido ao gerar áudio')
        onError?.('Erro desconhecido ao gerar áudio')
      }
      
      setIsLoading(false)
    }
  }, [text, voice, model, speed, format, resetState, setupAudioChunk, onError])

  const playAudio = useCallback(() => {
    if (audioRef.current.length === 0) {
      console.log('No audio chunks available to play')
      return
    }

    if (isPaused) {
      // Resume from current position
      const currentAudio = audioRef.current[currentChunkIndexRef.current]
      if (currentAudio) {
        currentAudio.play()
        setIsPaused(false)
        isPlayingRef.current = true
      }
    } else {
      // Start playing from beginning
      currentChunkIndexRef.current = 0
      isPlayingRef.current = true
      setIsPlaying(true)
      setIsPaused(false)
      onAudioStart?.()
      playNextChunk()
    }
  }, [isPaused, playNextChunk, onAudioStart])

  const pauseAudio = useCallback(() => {
    const currentAudio = audioRef.current[currentChunkIndexRef.current]
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause()
      setIsPaused(true)
      isPlayingRef.current = false
    }
  }, [])

  const stopAudio = useCallback(() => {
    audioRef.current.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    
    setIsPlaying(false)
    setIsPaused(false)
    isPlayingRef.current = false
    currentChunkIndexRef.current = 0
    setCurrentChunk(0)
    setProgress(0)
  }, [])

  const togglePlayPause = useCallback(() => {
    if (isPlaying || isPaused) {
      if (isPaused) {
        playAudio()
      } else {
        pauseAudio()
      }
    } else {
      if (audioRef.current.length === 0) {
        generateStreamingAudio()
      } else {
        playAudio()
      }
    }
  }, [isPlaying, isPaused, playAudio, pauseAudio, generateStreamingAudio])

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Play/Pause Button */}
      <Button
        onClick={togglePlayPause}
        disabled={isLoading}
        variant="outline"
        size="sm"
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

      {/* Stop Button */}
      {(isPlaying || isPaused) && (
        <Button
          onClick={stopAudio}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Parar
        </Button>
      )}

      {/* Progress Indicator */}
      {totalChunks > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{currentChunk + 1}/{totalChunks}</span>
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Voice Indicator */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Volume2 className="h-3 w-3" />
        <span className="capitalize">{voice}</span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 flex items-center gap-1">
          <VolumeX className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
