'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, Play, Pause, Loader2, Zap, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UnifiedTTSPlayerProps {
  text: string
  className?: string
  voice?: string
  autoPlay?: boolean
  onAudioStart?: () => void
  onAudioEnd?: () => void
  enableFallback?: boolean
}

// Available voices for different TTS providers
const GEMINI_VOICES = [
  { value: 'Zephyr', label: 'Zephyr', description: 'Neutra e equilibrada' },
  { value: 'Nova', label: 'Nova', description: 'Feminina jovem e energética' },
  { value: 'Echo', label: 'Echo', description: 'Masculina profunda' },
  { value: 'Fable', label: 'Fable', description: 'Feminina expressiva' },
  { value: 'Onyx', label: 'Onyx', description: 'Masculina autoritária' },
  { value: 'Shimmer', label: 'Shimmer', description: 'Feminina suave' }
]

const GOOGLE_TTS_VOICES = [
  { value: 'pt-BR-Wavenet-C', label: 'WaveNet C', description: 'Feminina alternativa neural' },
  { value: 'pt-BR-Wavenet-A', label: 'WaveNet A', description: 'Feminina neural' },
  { value: 'pt-BR-Wavenet-B', label: 'WaveNet B', description: 'Masculina neural' }
]

const OPENAI_VOICES = [
  { value: 'alloy', label: 'Alloy', description: 'Neutra e equilibrada' },
  { value: 'nova', label: 'Nova', description: 'Feminina jovem' },
  { value: 'shimmer', label: 'Shimmer', description: 'Feminina suave' },
  { value: 'echo', label: 'Echo', description: 'Masculina profunda' },
  { value: 'fable', label: 'Fable', description: 'Feminina expressiva' },
  { value: 'onyx', label: 'Onyx', description: 'Masculina autoritária' }
]

type TTSProvider = 'gemini-native' | 'google-tts' | 'openai-tts'

export default function UnifiedTTSPlayer({
  text,
  className = '',
  voice = 'Zephyr',
  autoPlay = false,
  onAudioStart,
  onAudioEnd,
  enableFallback = true
}: UnifiedTTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentProvider, setCurrentProvider] = useState<TTSProvider | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  
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

  // Function to convert PCM to WAV
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

  const generateAudioWithGeminiNative = async (): Promise<boolean> => {
    try {
      console.log('🎤 [UNIFIED-TTS] Trying Gemini Native Audio...')
      
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
        signal: abortControllerRef.current?.signal
      })

      if (!response.ok) {
        throw new Error(`Gemini Native Audio failed: ${response.status}`)
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
        throw new Error('No audio data received from Gemini Native Audio')
      }

      // Combine all audio chunks
      const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const combinedAudio = new Uint8Array(totalLength)
      let offset = 0
      
      for (const chunk of audioChunks) {
        combinedAudio.set(chunk, offset)
        offset += chunk.length
      }

      // Convert PCM to WAV
      console.log('🔄 [UNIFIED-TTS] Converting PCM to WAV...')
      const wavData = convertPCMToWAV(combinedAudio, 24000, 1, 16) // 24kHz, mono, 16-bit
      console.log(`🎵 [UNIFIED-TTS] PCM converted to WAV: ${wavData.length} bytes`)

      // Create blob and URL
      const audioBlob = new Blob([wavData], { type: 'audio/wav' })
      const url = URL.createObjectURL(audioBlob)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(url)
      setCurrentProvider('gemini-native')

      // Set up audio element
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        
        // Auto-play when audio is ready
        audioRef.current.addEventListener('canplaythrough', () => {
          if (audioRef.current && !isPlaying) {
            audioRef.current.play()
          }
        })
      }

      console.log('✅ [UNIFIED-TTS] Gemini Native Audio success!')
      toast.success('Áudio gerado com Gemini Native Audio!')
      return true

    } catch (error) {
      console.warn('⚠️ [UNIFIED-TTS] Gemini Native Audio failed:', error)
      return false
    } finally {
      setIsStreaming(false)
    }
  }

  const generateAudioWithGoogleTTS = async (): Promise<boolean> => {
    try {
      console.log('🎤 [UNIFIED-TTS] Trying Google TTS...')
      
      const response = await fetch('/api/tts/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'pt-BR-Wavenet-C', // Use best Google TTS voice
          speed: 1.0,
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
      setCurrentProvider('google-tts')

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        
        // Auto-play when audio is ready
        audioRef.current.addEventListener('canplaythrough', () => {
          if (audioRef.current && !isPlaying) {
            audioRef.current.play()
          }
        })
      }

      console.log('✅ [UNIFIED-TTS] Google TTS success!')
      toast.success('Usando Google TTS como fallback')
      return true

    } catch (error) {
      console.warn('⚠️ [UNIFIED-TTS] Google TTS failed:', error)
      return false
    }
  }

  const generateAudioWithOpenAI = async (): Promise<boolean> => {
    try {
      console.log('🎤 [UNIFIED-TTS] Trying OpenAI TTS...')
      
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'shimmer', // Use best OpenAI voice
          model: 'tts-1-hd',
          speed: 1.0,
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
      setCurrentProvider('openai-tts')

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
        
        // Auto-play when audio is ready
        audioRef.current.addEventListener('canplaythrough', () => {
          if (audioRef.current && !isPlaying) {
            audioRef.current.play()
          }
        })
      }

      console.log('✅ [UNIFIED-TTS] OpenAI TTS success!')
      toast.success('Usando OpenAI TTS como fallback')
      return true

    } catch (error) {
      console.warn('⚠️ [UNIFIED-TTS] OpenAI TTS failed:', error)
      return false
    }
  }

  const generateAudio = async () => {
    if (!text || !text.trim()) {
      toast.error('Nenhum texto para gerar áudio')
      return
    }

    setIsLoading(true)
    setError(null)
    setCurrentProvider(null)

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      // Try providers in order of preference
      const providers = [
        { name: 'gemini-native', fn: generateAudioWithGeminiNative },
        { name: 'google-tts', fn: generateAudioWithGoogleTTS },
        { name: 'openai-tts', fn: generateAudioWithOpenAI }
      ]

      let success = false
      for (const provider of providers) {
        try {
          success = await provider.fn()
          if (success) {
            break
          }
        } catch (error) {
          console.warn(`Provider ${provider.name} failed:`, error)
          continue
        }
      }

      if (!success) {
        throw new Error('Todos os provedores de TTS falharam')
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Unified TTS Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio'
      setError(errorMessage)
      toast.error(`Erro ao gerar áudio: ${errorMessage}`)
    } finally {
      setIsLoading(false)
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

  const getProviderInfo = () => {
    switch (currentProvider) {
      case 'gemini-native':
        return { name: 'Gemini Native Audio', color: 'purple', icon: Zap }
      case 'google-tts':
        return { name: 'Google TTS WaveNet', color: 'blue', icon: Volume2 }
      case 'openai-tts':
        return { name: 'OpenAI TTS', color: 'green', icon: Volume2 }
      default:
        return { name: 'Nenhum', color: 'gray', icon: Volume2 }
    }
  }

  const providerInfo = getProviderInfo()
  const ProviderIcon = providerInfo.icon

  return (
    <div className={`${className}`}>
      {/* Simplified Interface - Only Generate Button */}
      <Button 
        onClick={generateAudio} 
        disabled={isLoading || isStreaming}
        className={`w-full bg-purple-600 hover:bg-purple-700 text-white`}
      >
        {isLoading || isStreaming ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isStreaming ? 'Gerando...' : 'Gerando...'}
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-2" />
            Gerar Áudio
          </>
        )}
      </Button>

      {/* Hidden Audio Element with AutoPlay */}
      <audio 
        ref={audioRef}
        onPlay={() => {
          setIsPlaying(true)
          onAudioStart?.()
        }}
        onEnded={() => {
          setIsPlaying(false)
          onAudioEnd?.()
        }}
        onLoadedData={() => {
          // Auto-play when audio is ready
          if (audioRef.current && !isPlaying) {
            audioRef.current.play()
          }
        }}
      />
    </div>
  )
}
