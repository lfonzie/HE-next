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
  Video,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface AvatarPlayerProps {
  text: string
  className?: string
}

export default function AvatarPlayer({
  text,
  className = ''
}: AvatarPlayerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  
  const videoRef = useRef<HTMLVideoElement>(null)

  // Generate avatar video when text changes
  useEffect(() => {
    if (text && text.trim()) {
      generateAvatar()
    }
  }, [text])

  const generateAvatar = async () => {
    if (!text || !text.trim()) {
      console.log('No text to generate avatar')
      return
    }

    console.log('Generating avatar for text:', text.substring(0, 50) + '...')
    setIsGenerating(true)
    setError(null)
    setVideoUrl(null)
    setVideoId(null)

    try {
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'alloy',
          model: 'tts-1'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate avatar')
      }

      const result = await response.json()
      setVideoId(result.videoId)
      setStatus(result.status)
      
      // Start polling for video completion
      if (result.videoId) {
        pollVideoStatus(result.videoId)
      }

    } catch (error) {
      console.error('Avatar generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate avatar'
      
      // Check if it's an API key error
      if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
        setError('Chave da D-ID não configurada. Verifique o arquivo .env.local')
      } else {
        setError(errorMessage)
      }
      
      toast.error('Erro ao gerar avatar')
    } finally {
      setIsGenerating(false)
    }
  }

  const pollVideoStatus = async (id: string) => {
    const maxAttempts = 30 // 5 minutes max
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/avatar/status?videoId=${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to get video status')
        }

        const result = await response.json()
        setStatus(result.status)

        if (result.status === 'done' && result.videoUrl) {
          setVideoUrl(result.videoUrl)
          toast.success('Avatar gerado com sucesso!')
          return
        }

        if (result.status === 'error') {
          throw new Error('Video generation failed')
        }

        // Continue polling if still processing
        if (attempts < maxAttempts && (result.status === 'started' || result.status === 'created')) {
          attempts++
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else if (attempts >= maxAttempts) {
          throw new Error('Video generation timeout')
        }

      } catch (error) {
        console.error('Polling error:', error)
        setError('Erro ao verificar status do vídeo')
        setIsGenerating(false)
      }
    }

    poll()
  }

  const playVideo = () => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseVideo()
    } else {
      playVideo()
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
  }

  const handleVideoError = () => {
    setError('Erro ao reproduzir vídeo')
    setIsPlaying(false)
    toast.error('Erro ao reproduzir vídeo')
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Avatar Falante
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Player */}
        {videoUrl ? (
          <div className="space-y-3">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full rounded-lg"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              controls
            />
            <div className="flex justify-center">
              <Button
                onClick={togglePlayPause}
                size="sm"
                variant="outline"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? 'Pausar' : 'Reproduzir'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
            {isGenerating ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                <p className="text-sm text-gray-600 text-center">
                  Gerando avatar falante...
                  {status && <span className="block mt-1">Status: {status}</span>}
                </p>
              </>
            ) : error ? (
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mb-3 mx-auto" />
                <p className="text-sm text-red-600 mb-3">{error}</p>
                {error.includes('Chave da D-ID') && (
                  <div className="text-xs text-blue-600 mb-3">
                    📋 <a href="/avatar-setup" className="underline">Ver instruções de configuração</a>
                  </div>
                )}
                <Button
                  onClick={generateAvatar}
                  size="sm"
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Video className="h-8 w-8 text-gray-400 mb-3 mx-auto" />
                <p className="text-sm text-gray-500 mb-3">
                  Clique para gerar avatar falante
                </p>
                <Button
                  onClick={generateAvatar}
                  size="sm"
                  disabled={!text || !text.trim()}
                >
                  <User className="h-4 w-4 mr-2" />
                  Gerar Avatar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-blue-800 mb-2">🎭 Avatar Falante</h4>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Avatar visual com sincronização labial</li>
            <li>• Voz natural usando IA</li>
            <li>• Vídeo gerado automaticamente</li>
            <li>• Ideal para apresentações e tutoriais</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
