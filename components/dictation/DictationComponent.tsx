'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square,
  Save,
  Download,
  Trash2,
  Loader2,
  Volume2,
  VolumeX,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface DictationSession {
  id: string
  title: string
  content: string
  createdAt: Date
  duration: number
  wordCount: number
}

interface AudioChunk {
  id: string
  audioData: string
  text: string
  timestamp: Date
  duration: number
}

export default function DictationComponent() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [sessions, setSessions] = useState<DictationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([])
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar AudioContext
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Iniciar gravação
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      chunksRef.current = []
      startTimeRef.current = Date.now()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudioChunk(audioBlob)
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // Capturar dados a cada segundo
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      
      toast.success('Gravação iniciada')
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      toast.error('Erro ao acessar microfone')
    }
  }, [])

  // Parar gravação
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('Gravação finalizada')
    }
  }, [isRecording])

  // Processar chunk de áudio
  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      
      const response = await fetch('/api/dictation/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro na transcrição')
      }

      const data = await response.json()
      
      if (data.text && data.text.trim()) {
        const newChunk: AudioChunk = {
          id: Date.now().toString(),
          audioData: data.audioData || '',
          text: data.text,
          timestamp: new Date(),
          duration: audioBlob.size / 1000 // Estimativa
        }
        
        setAudioChunks(prev => [...prev, newChunk])
        setCurrentText(prev => prev + (prev ? ' ' : '') + data.text)
        
        // Reproduzir áudio se não estiver mudo
        if (!isMuted && data.audioData) {
          await playAudio(data.audioData)
        }
      }
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error)
      toast.error('Erro na transcrição')
    } finally {
      setIsProcessing(false)
    }
  }, [isMuted])

  // Reproduzir áudio
  const playAudio = useCallback(async (audioData: string) => {
    if (!audioData || isMuted) return

    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio
      
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
      setIsPlaying(true)
      
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
    }
  }, [isMuted])

  // Parar reprodução
  const stopPlayback = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  // Salvar sessão
  const saveSession = useCallback(() => {
    if (!currentText.trim()) {
      toast.error('Nenhum texto para salvar')
      return
    }

    const wordCount = currentText.split(/\s+/).filter(word => word.length > 0).length
    const duration = audioChunks.reduce((total, chunk) => total + chunk.duration, 0)
    
    const newSession: DictationSession = {
      id: Date.now().toString(),
      title: `Sessão ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      content: currentText,
      createdAt: new Date(),
      duration,
      wordCount
    }

    setSessions(prev => [newSession, ...prev])
    toast.success('Sessão salva com sucesso!')
  }, [currentText, audioChunks])

  // Limpar sessão atual
  const clearCurrentSession = useCallback(() => {
    setCurrentText('')
    setAudioChunks([])
    setSelectedSession(null)
    stopPlayback()
    toast.success('Sessão atual limpa')
  }, [])

  // Carregar sessão
  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentText(session.content)
      setSelectedSession(sessionId)
      toast.success(`Sessão "${session.title}" carregada`)
    }
  }, [sessions])

  // Remover sessão
  const removeSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (selectedSession === sessionId) {
      setSelectedSession(null)
      setCurrentText('')
    }
    toast.success('Sessão removida')
  }, [selectedSession])

  // Exportar texto
  const exportText = useCallback(() => {
    if (!currentText.trim()) {
      toast.error('Nenhum texto para exportar')
      return
    }

    const blob = new Blob([currentText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ditado-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Texto exportado!')
  }, [currentText])

  // Formatar duração
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
      }
    }
  }, [isRecording])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Ditado por Voz
        </h1>
        <p className="text-muted-foreground">
          Transcreva e organize suas notas por voz usando IA. Fale naturalmente e veja o texto aparecer em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Controle */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Controles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controles de Gravação */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Parar
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Gravar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    variant={isMuted ? "destructive" : "outline"}
                    size="sm"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>

                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando áudio...
                  </div>
                )}

                {isRecording && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    Gravando...
                  </div>
                )}
              </div>

              {/* Controles de Texto */}
              <div className="space-y-2">
                <Button onClick={saveSession} className="w-full" disabled={!currentText.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Sessão
                </Button>
                
                <Button onClick={exportText} variant="outline" className="w-full" disabled={!currentText.trim()}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Texto
                </Button>
                
                <Button onClick={clearCurrentSession} variant="destructive" className="w-full" disabled={!currentText.trim()}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>

              {/* Estatísticas */}
              {currentText && (
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm">Estatísticas</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Palavras:</span>
                      <span>{currentText.split(/\s+/).filter(w => w.length > 0).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Caracteres:</span>
                      <span>{currentText.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chunks:</span>
                      <span>{audioChunks.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessões Salvas */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Sessões Salvas
                <Badge variant="secondary">{sessions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessions.map((session) => (
                  <Card 
                    key={session.id} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedSession === session.id ? 'bg-primary/10 border-primary' : ''
                    }`}
                    onClick={() => loadSession(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(session.duration)}</span>
                          <span>•</span>
                          <span>{session.wordCount} palavras</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSession(session.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {sessions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma sessão salva</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor de Texto */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Editor de Texto
                {selectedSession && (
                  <Badge variant="outline">
                    {sessions.find(s => s.id === selectedSession)?.title}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="O texto transcrito aparecerá aqui conforme você fala..."
                className="flex-1 resize-none"
                disabled={isProcessing}
              />
              
              <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>{currentText.split(/\s+/).filter(w => w.length > 0).length} palavras</span>
                  <span>{currentText.length} caracteres</span>
                </div>
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <div className="flex items-center gap-1 text-red-600">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      <span>Gravando</span>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Processando</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
