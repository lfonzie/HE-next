"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AudioRecorderProps {
  onRecordingStart?: () => void
  onRecordingStop?: (audioBlob: Blob) => void
  onError?: (error: Error) => void
  disabled?: boolean
  className?: string
}

export function AudioRecorder({ 
  onRecordingStart, 
  onRecordingStop, 
  onError, 
  disabled = false,
  className = '' 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  
  const { toast } = useToast()

  // Check browser support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false)
      onError?.(new Error('Audio recording not supported in this browser'))
    }
  }, [onError])

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      })
      
      streamRef.current = stream
      setPermissionGranted(true)
      
      toast({
        title: "Permissão concedida",
        description: "Microfone autorizado para gravação",
      })
      
    } catch (error: any) {
      console.error('Permission error:', error)
      setPermissionGranted(false)
      
      let errorMessage = 'Erro ao acessar microfone'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão de microfone negada'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhum microfone encontrado'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Gravação de áudio não suportada'
      }
      
      onError?.(new Error(errorMessage))
      
      toast({
        title: "Erro de permissão",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }, [onError, toast])

  const startRecording = useCallback(async () => {
    if (!isSupported) return

    try {
      if (!permissionGranted) {
        await requestPermission()
        if (!permissionGranted) return
      }

      if (!streamRef.current) {
        await requestPermission()
        if (!streamRef.current) return
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        })
        onRecordingStop?.(audioBlob)
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        onError?.(new Error('Erro durante a gravação'))
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms
      
      setIsRecording(true)
      onRecordingStart?.()

    } catch (error: any) {
      console.error('Start recording error:', error)
      onError?.(error)
    }
  }, [isSupported, permissionGranted, requestPermission, onRecordingStart, onRecordingStop, onError])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [])

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm text-muted-foreground">
            Gravação de áudio não suportada neste navegador
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-4">
          <Button
            size="lg"
            onClick={handleToggleRecording}
            disabled={disabled}
            className={`rounded-full w-16 h-16 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm font-medium">
              {isRecording ? 'Gravando...' : 'Gravar áudio'}
            </p>
            {isRecording && (
              <div className="flex items-center justify-center mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                <span className="text-xs text-muted-foreground">
                  Clique para parar
                </span>
              </div>
            )}
          </div>

          {!permissionGranted && !isRecording && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestPermission}
              className="text-xs"
            >
              Autorizar microfone
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
