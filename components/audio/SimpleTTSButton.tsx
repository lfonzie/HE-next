'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Volume2, Loader2, Play, Pause, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface SimpleTTSButtonProps {
  text: string
  className?: string
  voice?: string
  onAudioStart?: () => void
  onAudioEnd?: () => void
}

export default function SimpleTTSButton({
  text,
  className = '',
  voice = 'Zephyr',
  onAudioStart,
  onAudioEnd
}: SimpleTTSButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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

  const generateAudio = async () => {
    if (!text || !text.trim()) {
      toast.error('Nenhum texto para gerar áudio')
      return
    }

    setIsLoading(true)

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      let audioBlob: Blob
      let provider = 'Google TTS WaveNet'

      // Try Google TTS first (most reliable)
      console.log('🎤 Trying Google TTS WaveNet...')
      let response = await fetch('/api/tts/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'pt-BR-Wavenet-C',
          speed: 1.0,
          pitch: 0.0
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        console.log('⚠️ Google TTS failed, trying OpenAI TTS...')
        
        // Fallback to OpenAI TTS
        response = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            voice: 'shimmer',
            model: 'tts-1-hd',
            speed: 1.0,
            format: 'mp3'
          }),
          signal: abortControllerRef.current.signal
        })
        provider = 'OpenAI TTS'
      }

      if (!response.ok) {
        throw new Error('Todos os provedores de TTS falharam')
      }

      audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(url)

      // Set up audio element with auto-play
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        audioRef.current.playbackRate = playbackRate
        
        // Auto-play when ready
        audioRef.current.addEventListener('canplaythrough', () => {
          if (audioRef.current && !isPlaying) {
            audioRef.current.play()
          }
        })

        // Update duration when loaded
        audioRef.current.addEventListener('loadedmetadata', () => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration)
          }
        })

        // Update current time
        audioRef.current.addEventListener('timeupdate', () => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
          }
        })
      }

      toast.success(`Áudio gerado com ${provider}!`)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('TTS Error:', error)
      toast.error('Erro ao gerar áudio')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const handleSpeedChange = (value: number[]) => {
    const newRate = value[0]
    setPlaybackRate(newRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate
    }
  }


  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Generate Button */}
      <Button 
        onClick={generateAudio} 
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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

      {/* Compact Audio Controls */}
      {audioUrl && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
          {/* Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          
          {/* Reset Button */}
          <Button
            onClick={resetAudio}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-100"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>

          {/* Time Display */}
          <div className="text-xs text-gray-600 min-w-[80px] text-center">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">{playbackRate}x</span>
            <Slider
              value={[playbackRate]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-16 h-2"
            />
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        onPlay={() => {
          setIsPlaying(true)
          onAudioStart?.()
        }}
        onPause={() => {
          setIsPlaying(false)
        }}
        onEnded={() => {
          setIsPlaying(false)
          onAudioEnd?.()
        }}
      />
    </div>
  )
}