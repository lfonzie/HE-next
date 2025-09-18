'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, RotateCcw, Check } from 'lucide-react'
import { useNotifications } from '@/components/providers/NotificationProvider'

interface CameraCaptureProps {
  onImageCaptured: (file: File) => void
  onClose: () => void
}

export function CameraCapture({ onImageCaptured, onClose }: CameraCaptureProps) {
  const { addNotification } = useNotifications()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Usar câmera traseira por padrão
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err)
      setError('Não foi possível acessar a câmera. Verifique as permissões.')
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível acessar a câmera'
      })
    }
  }, [addNotification])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Definir dimensões do canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Capturar frame do vídeo
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Converter para blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `redacao-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        
        // Criar URL para preview
        const imageUrl = URL.createObjectURL(blob)
        setCapturedImage(imageUrl)
        
        // Parar a câmera
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `redacao-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        
        onImageCaptured(file)
        onClose()
      }
    }, 'image/jpeg', 0.8)
  }, [onImageCaptured, onClose])

  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Capturar Foto da Redação
            </CardTitle>
            <CardDescription>
              Posicione a redação na tela e tire uma foto nítida
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!capturedImage && !isStreaming && !error && (
            <div className="text-center py-8">
              <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Clique no botão abaixo para iniciar a câmera
              </p>
              <Button onClick={startCamera} className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Iniciar Câmera</span>
              </Button>
            </div>
          )}

          {isStreaming && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 right-4 bottom-4 border border-white/30 rounded"></div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={capturePhoto} className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>Capturar Foto</span>
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={confirmPhoto} className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Usar Esta Foto</span>
                </Button>
                <Button variant="outline" onClick={retakePhoto} className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4" />
                  <span>Tirar Outra</span>
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  )
}
