"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Wifi, 
  WifiOff, 
  Loader2,
  RotateCcw,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Bot
} from 'lucide-react'
import { useLiveChat } from '@/hooks/useLiveChat'
import { useToast } from '@/hooks/use-toast'
import { LiveChatErrorBoundary, ConnectionErrorFallback } from './LiveChatErrorBoundary'
import { VoiceAssistant } from '../virtual-labs/VoiceAssistant'

interface LiveMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
}

interface LiveChatInterfaceProps {
  className?: string
  autoConnect?: boolean
}

export function LiveChatInterface({ className = '', autoConnect = false }: LiveChatInterfaceProps) {
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(false)
  
  // Elementos para WebRTC
  useEffect(() => {
    // Criar elemento de vídeo para exibir vídeo do Gemini
    const videoElement = document.getElementById('live-video') as HTMLVideoElement
    if (!videoElement) {
      const video = document.createElement('video')
      video.id = 'live-video'
      video.autoplay = true
      video.muted = true
      video.controls = false
      video.style.width = '100%'
      video.style.height = 'auto'
      video.style.borderRadius = '8px'
      video.style.display = 'none'
      document.body.appendChild(video)
    }

    return () => {
      // Cleanup não é necessário pois os elementos ficam no DOM
    }
  }, [])

  const {
    messages,
    connected: isConnected,
    isStreaming,
    isVideoStreaming,
    isScreenSharing,
    connectionStatus,
    error,
    videoElement,
    connect,
    disconnect,
    startVideoStreaming,
    stopVideoStreaming,
    startScreenSharing,
    stopScreenSharing,
    clearMessages,
    clearError
  } = useLiveChat({ autoConnect })

  // Debug logging
  console.log('[LiveChatInterface] State:', {
    isConnected,
    connectionStatus,
    error,
    messages: messages.length,
    isVideoStreaming,
    isScreenSharing
  })

  const { toast } = useToast()

  // Voice Assistant Handlers
  const handleVoiceMeasurementRequest = (instrument: string, value: number, unit: string) => {
    console.log('Medição via voz:', { instrument, value, unit })
    // Adicionar mensagem ao chat
    const message: LiveMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `📊 Medição registrada: ${value} ${unit} usando ${instrument}`,
      timestamp: Date.now()
    }
    // Aqui você adicionaria a mensagem ao estado do chat
  }

  const handleVoiceCalculationRequest = (formula: string, variables: Record<string, number>) => {
    console.log('Cálculo via voz:', { formula, variables })
    // Implementar cálculos básicos
    let result = 0
    try {
      switch (formula.toLowerCase()) {
        case 'ph':
          result = -Math.log10(variables.concentration || 0.001)
          break
        case 'concentration':
          result = variables.moles / (variables.volume / 1000)
          break
        case 'ohms_law':
          result = variables.voltage / variables.resistance
          break
        default:
          result = 0
      }
    } catch (error) {
      console.error('Erro no cálculo:', error)
    }
    
    const message: LiveMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🧮 Cálculo ${formula}: ${result.toFixed(2)}`,
      timestamp: Date.now()
    }
    return result
  }

  const handleVoiceExperimentGuidance = (step: string, instructions: string[]) => {
    console.log('Orientação via voz:', { step, instructions })
    const message: LiveMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🎯 ${step}: ${instructions.join(', ')}`,
      timestamp: Date.now()
    }
  }

  const handleVoiceAssistantError = (error: Error) => {
    console.error('Erro do assistente de voz:', error)
    toast({
      title: "Erro no Assistente de Voz",
      description: error.message,
      variant: "destructive"
    })
  }

  // Handle connection status changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro na conexão",
        description: error,
        variant: "destructive"
      })
    }
  }, [error, toast])



  const handleVideoStreamingToggle = useCallback(async () => {
    console.log('📹 [DEBUG] handleVideoStreamingToggle called, isVideoStreaming:', isVideoStreaming)
    
    // Show immediate feedback
    toast({
      title: "Iniciando câmera...",
      description: "Solicitando acesso à câmera",
    })
    
    if (isVideoStreaming) {
      stopVideoStreaming()
    } else {
      await startVideoStreaming()
    }
  }, [isVideoStreaming, startVideoStreaming, stopVideoStreaming, toast])

  const handleScreenSharingToggle = useCallback(async () => {
    console.log('🖥️ [DEBUG] handleScreenSharingToggle called, isScreenSharing:', isScreenSharing)
    
    // Show immediate feedback
    toast({
      title: "Iniciando compartilhamento...",
      description: "Solicitando acesso à tela",
    })
    
    if (isScreenSharing) {
      stopScreenSharing()
    } else {
      await startScreenSharing()
    }
  }, [isScreenSharing, startScreenSharing, stopScreenSharing, toast])


  const formatTimestamp = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }, [])

  const getConnectionStatusColor = useCallback(() => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }, [connectionStatus])

  const getConnectionStatusText = useCallback(() => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado'
      case 'connecting': return 'Conectando...'
      case 'error': return 'Erro'
      default: return 'Desconectado'
    }
  }, [connectionStatus])

  return (
    <LiveChatErrorBoundary
      onError={(error, errorInfo) => {
        console.error('LiveChat Error:', error, errorInfo)
        toast({
          title: "Erro no Chat ao Vivo",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive"
        })
      }}
    >
      <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Chat ao Vivo com IA
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
              <Badge variant={isConnected ? "default" : "secondary"}>
                {getConnectionStatusText()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video Preview */}
      {(isVideoStreaming || isScreenSharing) && videoElement && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">
              {isVideoStreaming ? 'Streaming de Vídeo' : 'Compartilhamento de Tela'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={(el) => {
                  if (el && videoElement) {
                    el.srcObject = videoElement.srcObject
                    el.autoplay = true
                    el.muted = true
                  }
                }}
                className="w-full h-auto rounded-lg border"
                style={{ maxHeight: '300px' }}
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {isVideoStreaming ? 'AO VIVO' : 'TELA'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card className="flex-1 mb-4 overflow-hidden">
        <CardContent className="p-4 h-full overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Inicie uma conversa por voz</p>
                <p className="text-sm mt-2">
                  {isConnected ? 'Conectado e pronto para conversar' : 'Conecte-se para começar'}
                </p>
                {isConnected && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      💡 Dica: Após conectar, clique nos botões de microfone, câmera ou tela para iniciar
                    </p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {/* Message content */}
                    <div className="mb-2">
                      {message.content && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      {message.isStreaming && (
                        <div className="flex items-center gap-1 mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs opacity-70">Digitando...</span>
                        </div>
                      )}
                    </div>


                    {/* Timestamp */}
                    <div className="text-xs opacity-70 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Connection controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnect}
                    className="text-red-600 hover:text-red-700"
                  >
                    <WifiOff className="w-4 h-4 mr-2" />
                    Desconectar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('[LiveChatInterface] Connect button clicked');
                      connect();
                    }}
                    disabled={connectionStatus === 'connecting'}
                  >
                    {connectionStatus === 'connecting' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wifi className="w-4 h-4 mr-2" />
                    )}
                    Conectar
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVoiceAssistantEnabled(!voiceAssistantEnabled)}
                  className={`${voiceAssistantEnabled ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {voiceAssistantEnabled ? 'IA Ativa' : 'Ativar IA'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMessages}
                  disabled={messages.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>

            {/* Real-time streaming controls */}
            <div className="flex items-center justify-center gap-4">

              {/* Video streaming */}
              <Button
                size="lg"
                onClick={handleVideoStreamingToggle}
                disabled={!isConnected || isStreaming}
                className={`rounded-full w-16 h-16 ${
                  isVideoStreaming 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isVideoStreaming ? (
                  <VideoOff className="w-6 h-6" />
                ) : (
                  <Video className="w-6 h-6" />
                )}
              </Button>

              {/* Screen sharing */}
              <Button
                size="lg"
                onClick={handleScreenSharingToggle}
                disabled={!isConnected || isStreaming}
                className={`rounded-full w-16 h-16 ${
                  isScreenSharing 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isScreenSharing ? (
                  <MonitorOff className="w-6 h-6" />
                ) : (
                  <Monitor className="w-6 h-6" />
                )}
              </Button>
            </div>


            {/* Status indicators */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {isConnected && !isVideoStreaming && !isScreenSharing && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Conectado - Clique nos botões para iniciar</span>
                </div>
              )}
              {isVideoStreaming && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Streaming vídeo...</span>
                </div>
              )}
              {isScreenSharing && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Compartilhando tela...</span>
                </div>
              )}
              {isStreaming && (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processando...</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Voice Assistant */}
      {voiceAssistantEnabled && (
        <VoiceAssistant
          experimentId="live-chat"
          experimentType="chemistry"
          difficulty="intermediate"
          onMeasurementRequest={handleVoiceMeasurementRequest}
          onCalculationRequest={handleVoiceCalculationRequest}
          onExperimentGuidance={handleVoiceExperimentGuidance}
          onError={handleVoiceAssistantError}
        />
      )}
    </LiveChatErrorBoundary>
  )
}
