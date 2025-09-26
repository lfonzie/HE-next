'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface OptimizedGeminiLiveChatProps {
  onStatusChange?: (status: string) => void
  onError?: (error: string) => void
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
type AudioStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

export default function OptimizedGeminiLiveChat({ 
  onStatusChange, 
  onError 
}: OptimizedGeminiLiveChatProps) {
  // Estados principais
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [autoStream, setAutoStream] = useState(false)
  
  // Refs para controle de áudio
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const audioQueueRef = useRef<AudioBuffer[]>([])
  const isPlayingRef = useRef(false)
  const currentAudioRef = useRef<AudioBufferSourceNode | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Logs de debug
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `${timestamp}: ${message}`
    setLogs(prev => [...prev.slice(-9), logMessage]) // Manter apenas os últimos 10 logs
    console.log(`[GeminiLive] ${logMessage}`)
  }, [])

  // Inicializar AudioContext
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      addLog('AudioContext inicializado')
    }
    return audioContextRef.current
  }, [addLog])

  // Conectar ao Gemini Live
  const connect = useCallback(async () => {
    if (connectionStatus === 'connecting') return
    
    setConnectionStatus('connecting')
    addLog('Conectando ao Gemini Live...')
    
    try {
      await initAudioContext()
      
      // Simular conexão (substituir pela implementação real)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setConnectionStatus('connected')
      addLog('Conectado com sucesso!')
      onStatusChange?.('connected')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setConnectionStatus('error')
      addLog(`Erro na conexão: ${errorMessage}`)
      onError?.(errorMessage)
    }
  }, [connectionStatus, initAudioContext, addLog, onStatusChange, onError])

  // Desconectar
  const disconnect = useCallback(() => {
    setConnectionStatus('disconnected')
    setAudioStatus('idle')
    setAutoStream(false)
    
    // Limpar recursos de áudio
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    // Parar áudio atual
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.stop()
      } catch (e) {
        // Ignorar erros de áudio já parado
      }
      currentAudioRef.current = null
    }
    
    isPlayingRef.current = false
    audioQueueRef.current = []
    
    addLog('Desconectado')
    onStatusChange?.('disconnected')
  }, [addLog, onStatusChange])

  // Reproduzir áudio de forma otimizada
  const playAudio = useCallback(async (audioData: string) => {
    if (!audioContextRef.current || isMuted || isPlayingRef.current) {
      addLog('Áudio ignorado (mudo ou já reproduzindo)')
      return
    }

    try {
      isPlayingRef.current = true
      setAudioStatus('speaking')
      
      // Decodificar áudio base64
      const binaryString = atob(audioData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Decodificar áudio
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer)
      
      // Criar source node
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      
      // Configurar eventos
      source.onended = () => {
        isPlayingRef.current = false
        setAudioStatus('idle')
        addLog('Reprodução de áudio finalizada')
      }
      
      // Reproduzir
      source.start()
      currentAudioRef.current = source
      
      addLog(`🔊 Reproduzindo áudio (${audioBuffer.duration.toFixed(2)}s)`)
      
    } catch (error) {
      isPlayingRef.current = false
      setAudioStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Erro na reprodução'
      addLog(`❌ Erro na reprodução: ${errorMessage}`)
      onError?.(errorMessage)
    }
  }, [audioContextRef, isMuted, addLog, onError])

  // Processar resposta de áudio
  const processAudioResponse = useCallback(async (audioData: string) => {
    if (!audioData) return
    
    addLog(`Resposta de áudio recebida (${audioData.length} chars)`)
    
    // Se já está reproduzindo, adicionar à fila
    if (isPlayingRef.current) {
      addLog('Áudio adicionado à fila')
      // Implementar fila de áudio se necessário
      return
    }
    
    await playAudio(audioData)
  }, [playAudio, addLog])

  // Iniciar streaming automático
  const startAutoStream = useCallback(async () => {
    if (!audioContextRef.current || autoStream) return
    
    try {
      setAutoStream(true)
      addLog('Iniciando streaming automático...')
      
      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      mediaStreamRef.current = stream
      
      // Criar processor para capturar áudio
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor
      
      processor.onaudioprocess = async (event) => {
        if (!autoStream) return
        
        const inputBuffer = event.inputBuffer
        const inputData = inputBuffer.getChannelData(0)
        
        // Converter para Int16Array
        const int16Data = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
        }
        
        // Enviar para API (implementação simplificada)
        try {
          addLog('Enviando áudio para API...')
          
          // Simular processamento
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Simular resposta de áudio
          const mockAudioResponse = btoa('mock-audio-data')
          await processAudioResponse(mockAudioResponse)
          
        } catch (error) {
          addLog(`Erro no processamento: ${error}`)
        }
      }
      
      // Conectar processor
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(processor)
      processor.connect(audioContextRef.current.destination)
      
      addLog('Streaming automático iniciado')
      
    } catch (error) {
      setAutoStream(false)
      const errorMessage = error instanceof Error ? error.message : 'Erro no streaming'
      addLog(`Erro no streaming: ${errorMessage}`)
      onError?.(errorMessage)
    }
  }, [audioContextRef, autoStream, addLog, processAudioResponse, onError])

  // Parar streaming automático
  const stopAutoStream = useCallback(() => {
    setAutoStream(false)
    
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    addLog('Streaming automático parado')
  }, [addLog])

  // Limpar logs
  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Gemini Live Chat Otimizado
        </h1>
        <p className="text-muted-foreground">
          Chat de IA com respostas por áudio usando Gemini 2.5 Flash TTS
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              Status da Conexão
              <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
                {connectionStatus === 'connected' ? (
                  <CheckCircle className="w-4 h-4 mr-1" />
                ) : connectionStatus === 'error' ? (
                  <XCircle className="w-4 h-4 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-1" />
                )}
                {connectionStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {connectionStatus === 'disconnected' ? (
                <Button onClick={connect} disabled={connectionStatus === 'connecting'}>
                  {connectionStatus === 'connecting' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar'
                  )}
                </Button>
              ) : (
                <Button onClick={disconnect} variant="destructive">
                  Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              Status do Áudio
              <Badge variant={audioStatus === 'speaking' ? 'default' : 'secondary'}>
                {audioStatus === 'speaking' ? (
                  <Volume2 className="w-4 h-4 mr-1" />
                ) : audioStatus === 'listening' ? (
                  <Mic className="w-4 h-4 mr-1" />
                ) : (
                  <VolumeX className="w-4 h-4 mr-1" />
                )}
                {audioStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant={isMuted ? 'destructive' : 'outline'}
                size="sm"
              >
                {isMuted ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                {isMuted ? 'Mutar' : 'Desmutar'}
              </Button>
              
              {connectionStatus === 'connected' && (
                <Button
                  onClick={autoStream ? stopAutoStream : startAutoStream}
                  variant={autoStream ? 'destructive' : 'default'}
                  size="sm"
                >
                  {autoStream ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Parar Stream
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Stream
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log de Debug */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Log de Debug</CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Limpar Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Nenhum log ainda...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Clique em "Conectar" para estabelecer conexão com Gemini API</p>
          <p>• Áudio: Clique "Iniciar Stream" - você fala, a IA responde por áudio</p>
          <p>• Use "Mutar" para silenciar as respostas de áudio</p>
          <p>• O streaming automático envia dados a cada 5 segundos</p>
          <p>• Todas as respostas são faladas automaticamente</p>
        </CardContent>
      </Card>
    </div>
  )
}
