'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, Play, Pause, Loader2, Mic, MicOff } from 'lucide-react'
import { toast } from 'sonner'

interface GeminiNativeAudioPlayerProps {
  text: string
  className?: string
  voice?: string
  autoPlay?: boolean
  onAudioStart?: () => void
  onAudioEnd?: () => void
}

// Available voices for Gemini Native Audio
const AVAILABLE_VOICES = [
  { value: 'Zephyr', label: 'Zephyr', description: 'Voz neutra e equilibrada' },
  { value: 'Nova', label: 'Nova', description: 'Voz feminina jovem e energética' },
  { value: 'Echo', label: 'Echo', description: 'Voz masculina profunda' },
  { value: 'Fable', label: 'Fable', description: 'Voz feminina expressiva' },
  { value: 'Onyx', label: 'Onyx', description: 'Voz masculina autoritária' },
  { value: 'Shimmer', label: 'Shimmer', description: 'Voz feminina suave' }
]

export default function GeminiNativeAudioPlayer({
  text,
  className = '',
  voice = 'Zephyr',
  autoPlay = false,
  onAudioStart,
  onAudioEnd
}: GeminiNativeAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

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
    setError(null)

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      console.log(`🎤 [GEMINI-NATIVE] Generating audio for: "${text.substring(0, 50)}..."`)

      const response = await fetch('/api/tts/gemini-native', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: voice,
          speed: 1.0,
          pitch: 0.0
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      setIsStreaming(true)
      const audioChunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        // Parse SSE data
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'audio' && data.data) {
                // Convert base64 to Uint8Array
                const audioData = Uint8Array.from(atob(data.data), c => c.charCodeAt(0))
                audioChunks.push(audioData)
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e)
            }
          }
        }
      }

      if (audioChunks.length === 0) {
        throw new Error('No audio data received')
      }

      // Combine all audio chunks
      const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const combinedAudio = new Uint8Array(totalLength)
      let offset = 0
      
      for (const chunk of audioChunks) {
        combinedAudio.set(chunk, offset)
        offset += chunk.length
      }

      // Create blob and URL
      const audioBlob = new Blob([combinedAudio], { type: 'audio/pcm' })
      const url = URL.createObjectURL(audioBlob)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(url)

      // Set up audio element
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        
        audioRef.current.addEventListener('play', () => {
          setIsPlaying(true)
          onAudioStart?.()
        })
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false)
          onAudioEnd?.()
        })

        if (autoPlay) {
          audioRef.current.play()
        }
      }

      toast.success('Áudio gerado com Gemini Native Audio!')
      console.log(`✅ [GEMINI-NATIVE] Audio generated: ${audioBlob.size} bytes`)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Gemini Native Audio Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio'
      setError(errorMessage)
      toast.error(`Erro ao gerar áudio: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }
        setAudioUrl(url)
        
        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.load()
        }
        
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        toast.success('Gravação concluída!')
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.info('Gravando áudio...')

    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Erro ao iniciar gravação')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  return (
    <Card className={`border-purple-200 bg-purple-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Volume2 className="h-5 w-5" />
          Gemini 2.5 Flash Native Audio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div>
          <label className="text-sm font-medium text-purple-800 mb-2 block">
            Voz: {AVAILABLE_VOICES.find(v => v.value === voice)?.label}
          </label>
          <p className="text-xs text-purple-600">
            {AVAILABLE_VOICES.find(v => v.value === voice)?.description}
          </p>
        </div>

        {/* Text Display */}
        <div className="p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700">{text}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={generateAudio} 
            disabled={isLoading || isStreaming}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
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

          {audioUrl && (
            <>
              <Button 
                onClick={isPlaying ? pauseAudio : playAudio}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            variant="outline"
            className={`flex-1 ${isRecording 
              ? 'border-red-300 text-red-700 hover:bg-red-100' 
              : 'border-green-300 text-green-700 hover:bg-green-100'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Parar Gravação
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Gravar Áudio
              </>
            )}
          </Button>
        </div>

        {/* Status */}
        <div className="text-xs text-purple-600 space-y-1">
          <p>✨ Tecnologia: Gemini 2.5 Flash Native Audio</p>
          <p>🎤 Voz: {voice}</p>
          {audioUrl && <p>✅ Áudio pronto para reprodução</p>}
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} />
      </CardContent>
    </Card>
  )
}
