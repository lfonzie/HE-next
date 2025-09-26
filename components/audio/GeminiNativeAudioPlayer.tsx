'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, Play, Pause, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface GeminiNativeAudioPlayerProps {
  text: string
  className?: string
  voice?: string
  autoPlay?: boolean
  onAudioStart?: () => void
  onAudioEnd?: () => void
}


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
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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
    console.log('🎤 [GEMINI-NATIVE] generateAudio called')
    console.log('🎤 [GEMINI-NATIVE] Text:', text)
    console.log('🎤 [GEMINI-NATIVE] Voice:', voice)
    
    if (!text || !text.trim()) {
      console.error('❌ [GEMINI-NATIVE] No text provided')
      toast.error('Nenhum texto para gerar áudio')
      return
    }

    console.log('🎤 [GEMINI-NATIVE] Starting audio generation...')
    setIsLoading(true)
    setError(null)

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      console.log(`🎤 [GEMINI-NATIVE] Generating audio for: "${text.substring(0, 50)}..."`)
      console.log(`🎤 [GEMINI-NATIVE] Voice: ${voice}`)
      console.log(`🎤 [GEMINI-NATIVE] Making fetch request to /api/tts/gemini-native`)

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

      console.log(`🎤 [GEMINI-NATIVE] Response status: ${response.status}`)
      console.log(`🎤 [GEMINI-NATIVE] Response headers:`, Object.fromEntries(response.headers.entries()))
      console.log(`🎤 [GEMINI-NATIVE] Response ok: ${response.ok}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`❌ [GEMINI-NATIVE] HTTP Error: ${response.status}`, errorData)
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      // Handle streaming response from Gemini Live API
      console.log(`🎤 [GEMINI-NATIVE] Response body exists: ${!!response.body}`)
      const reader = response.body?.getReader()
      if (!reader) {
        console.error('❌ [GEMINI-NATIVE] No response body reader')
        throw new Error('No response body')
      }

      console.log('🎤 [GEMINI-NATIVE] Response body reader created successfully')
      setIsStreaming(true)
      const audioChunks: Uint8Array[] = []
      let chunkCount = 0
      let detectedMimeType = 'audio/wav' // Default

      console.log('🔄 [GEMINI-NATIVE] Starting real-time streaming...')

      // Simplified approach - buffer all chunks first, then play
      console.log('🔄 [GEMINI-NATIVE] Using buffered playback approach')

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('✅ [GEMINI-NATIVE] Stream reading complete')
          break
        }

        // Parse SSE data
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log(`📨 [GEMINI-NATIVE] Received data type: ${data.type}`)
              
              if (data.type === 'audio' && data.data) {
                chunkCount++
                console.log(`🎵 [GEMINI-NATIVE] Audio chunk ${chunkCount} received: ${data.data.length} chars`)
                
                // Store mimeType from first chunk
                if (chunkCount === 1 && data.mimeType) {
                  detectedMimeType = data.mimeType
                  console.log(`🎵 [GEMINI-NATIVE] Detected MIME type: ${detectedMimeType}`)
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
                  console.log(`✅ [GEMINI-NATIVE] Chunk ${chunkCount} buffered, total chunks: ${audioChunks.length}`)
                } catch (e) {
                  console.error('❌ [GEMINI-NATIVE] Error decoding base64:', e)
                }
              } else if (data.type === 'done') {
                console.log('✅ [GEMINI-NATIVE] Streaming complete signal received')
                break
              } else if (data.type === 'error') {
                console.error('❌ [GEMINI-NATIVE] Stream error:', data.content)
                throw new Error(data.content || 'Streaming error')
              } else {
                console.log(`📨 [GEMINI-NATIVE] Unknown data type: ${data.type}`)
              }
            } catch (e) {
              console.warn('❌ [GEMINI-NATIVE] Failed to parse SSE data:', e)
              console.warn('❌ [GEMINI-NATIVE] Raw line:', line)
            }
          } else if (line.trim()) {
            console.log(`📨 [GEMINI-NATIVE] Non-data line: ${line}`)
          }
        }
      }

      console.log(`🎵 [GEMINI-NATIVE] Total chunks received: ${chunkCount}`)
      console.log(`🎵 [GEMINI-NATIVE] Audio chunks array length: ${audioChunks.length}`)

      // Process buffered chunks
      if (audioChunks.length > 0) {
        console.log('🔄 [GEMINI-NATIVE] Processing buffered chunks')
        
        // Combine all audio chunks
        const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
        console.log(`🔗 [GEMINI-NATIVE] Combining ${audioChunks.length} chunks, total length: ${totalLength} bytes`)
        
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
          console.log('🔄 [GEMINI-NATIVE] Converting PCM to WAV...')
          finalAudioData = convertPCMToWAV(combinedAudio, 24000, 1, 16) // 24kHz, mono, 16-bit
          mimeType = 'audio/wav'
          console.log(`🎵 [GEMINI-NATIVE] PCM converted to WAV: ${finalAudioData.length} bytes`)
        }
        
        // Create blob and URL
        const audioBlob = new Blob([finalAudioData], { type: mimeType })
        const url = URL.createObjectURL(audioBlob)
        
        console.log(`🎵 [GEMINI-NATIVE] Created audio blob: ${audioBlob.size} bytes, type: ${mimeType}`)

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }
        setAudioUrl(url)
        console.log(`🎵 [GEMINI-NATIVE] Audio URL set: ${url}`)

        // Set up audio element
        if (audioRef.current) {
          console.log(`🎵 [GEMINI-NATIVE] Setting up audio element with URL: ${url}`)
          audioRef.current.src = url
          audioRef.current.load()
          
          // Remove existing event listeners to avoid duplicates
          audioRef.current.removeEventListener('play', handlePlay)
          audioRef.current.removeEventListener('ended', handleEnded)
          audioRef.current.removeEventListener('error', handleError)
          audioRef.current.removeEventListener('canplay', handleCanPlay)
          audioRef.current.removeEventListener('loadstart', handleLoadStart)
          
          // Add new event listeners
          audioRef.current.addEventListener('play', handlePlay)
          audioRef.current.addEventListener('ended', handleEnded)
          audioRef.current.addEventListener('error', handleError)
          audioRef.current.addEventListener('canplay', handleCanPlay)
          audioRef.current.addEventListener('loadstart', handleLoadStart)

          console.log(`🎵 [GEMINI-NATIVE] Audio element configured, autoPlay: ${autoPlay}`)
          if (autoPlay) {
            console.log('🎵 [GEMINI-NATIVE] Attempting to play audio...')
            audioRef.current.play().catch((error) => {
              console.warn('⚠️ [GEMINI-NATIVE] Auto-play failed (browser restriction):', error)
              // Don't throw error, just log it - user can manually play
            })
          }
        } else {
          console.warn('🎵 [GEMINI-NATIVE] Audio ref is null!')
        }
      } else {
        console.error('❌ [GEMINI-NATIVE] No audio chunks received!')
        throw new Error('No audio data received from Gemini Native Audio')
      }

      toast.success('Áudio gerado com sucesso! Clique em Reproduzir para ouvir.')
      console.log(`✅ [GEMINI-NATIVE] Audio generation completed`)

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

  const handlePlay = () => {
    setIsPlaying(true)
    onAudioStart?.()
  }

  const handleEnded = () => {
    setIsPlaying(false)
    onAudioEnd?.()
  }

  const handleError = () => {
    setError('Erro ao reproduzir áudio')
    setIsPlaying(false)
    toast.error('Erro ao reproduzir áudio')
  }

  const handleCanPlay = () => {
    console.log('🎵 [GEMINI-NATIVE] Audio can play')
  }

  const handleLoadStart = () => {
    console.log('🎵 [GEMINI-NATIVE] Audio load started')
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      console.log('🎵 [GEMINI-NATIVE] Manual play requested')
      audioRef.current.play().catch((error) => {
        console.error('🎵 [GEMINI-NATIVE] Manual play failed:', error)
        toast.error('Erro ao reproduzir áudio: ' + error.message)
      })
    } else {
      console.warn('🎵 [GEMINI-NATIVE] Cannot play: audioRef or audioUrl is null')
      toast.error('Áudio não está pronto para reprodução')
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }


  console.log(`🎵 [GEMINI-NATIVE] Render - audioUrl: ${audioUrl}, isLoading: ${isLoading}, isStreaming: ${isStreaming}`)

  return (
    <div className={`${className}`}>
      {/* Generate Audio Button */}
      {!audioUrl && (
        <div className="space-y-2">
          <Button 
            onClick={generateAudio} 
            disabled={isLoading || isStreaming}
            className="w-full bg-purple-600 hover:bg-purple-700"
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
          {isStreaming && (
            <div className="text-sm text-gray-600 text-center">
              Recebendo dados de áudio do servidor...
            </div>
          )}
        </div>
      )}

      {/* Audio Controls */}
      {audioUrl && (
        <>
          {console.log(`🎵 [GEMINI-NATIVE] Showing audio controls for URL: ${audioUrl}`)}
          <div className="space-y-2">
            <div className="text-sm text-green-600 text-center">
              ✅ Áudio pronto para reprodução
            </div>
            <div className="flex gap-2">
          <Button 
            onClick={isPlaying ? pauseAudio : playAudio}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Reproduzir
              </>
            )}
          </Button>
          
          <Button 
            onClick={generateAudio}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
            </div>
          </div>
        </>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
