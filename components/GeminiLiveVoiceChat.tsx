'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2, Volume2, MessageSquare, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Message {
  role: 'user' | 'assistant'
  text: string
  audio?: string
  timestamp: Date
}

export default function GeminiLiveVoiceChat() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  // Inicializar microfone
  const startRecording = async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await sendAudio(audioBlob)
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      
      console.log('🎤 Gravação iniciada')
      
    } catch (err) {
      console.error('Erro ao acessar microfone:', err)
      setError('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
      console.log('🛑 Gravação parada')
    }
  }

  const sendAudio = async (audioBlob: Blob) => {
    try {
      console.log('📤 Enviando áudio:', audioBlob.size, 'bytes')
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('/api/gemini-live-voice', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar áudio')
      }

      const data = await response.json()
      
      // Adicionar mensagem do usuário
      const userMessage: Message = {
        role: 'user',
        text: data.transcription,
        timestamp: new Date(),
      }
      
      // Adicionar resposta do assistente
      const assistantMessage: Message = {
        role: 'assistant',
        text: data.text,
        audio: data.audio,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, userMessage, assistantMessage])
      
      // Reproduzir áudio automaticamente
      if (data.audio && audioRef.current) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        )
        const audioUrl = URL.createObjectURL(audioBlob)
        audioRef.current.src = audioUrl
        audioRef.current.play()
      }
      
    } catch (err) {
      console.error('Erro ao enviar áudio:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-700">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8" />
                <CardTitle className="text-3xl">
                  Conversa ao Vivo com IA
                </CardTitle>
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-purple-100">
                Fale com o microfone e receba respostas em áudio
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Controles de Gravação */}
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={toggleRecording}
                disabled={isProcessing}
                size="lg"
                className={`w-32 h-32 rounded-full transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-12 h-12 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>

              <div className="text-center">
                {isRecording && (
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400 animate-pulse">
                    🔴 Gravando... Clique para parar
                  </p>
                )}
                {isProcessing && (
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    ⏳ Processando seu áudio...
                  </p>
                )}
                {!isRecording && !isProcessing && (
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    🎤 Clique para começar a falar
                  </p>
                )}
              </div>
            </div>

            {/* Mensagens de Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Histórico de Conversa */}
            {messages.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversa
                </h3>
                
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-purple-100 dark:bg-purple-900/30 ml-8'
                        : 'bg-blue-100 dark:bg-blue-900/30 mr-8'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                          U
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className="font-medium mb-1">
                          {message.role === 'user' ? 'Você' : 'Assistente IA'}
                        </p>
                        <p className="text-sm">{message.text}</p>
                        
                        {message.audio && message.role === 'assistant' && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Volume2 className="w-4 h-4" />
                            <span>Áudio reproduzido automaticamente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Instruções */}
            {messages.length === 0 && (
              <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold mb-2">Como usar:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Clique no botão do microfone para começar a gravar</li>
                    <li>Fale sua mensagem (pergunta, comando, etc.)</li>
                    <li>Clique novamente para parar a gravação</li>
                    <li>Aguarde enquanto a IA processa e responde</li>
                    <li>Ouça a resposta em áudio automaticamente!</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {/* Audio Element (hidden) */}
            <audio ref={audioRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Powered by Google Gemini 2.5 Flash + Google Cloud Text-to-Speech</p>
          <p className="mt-1">Conversação em tempo real com transcrição e síntese de voz</p>
        </div>
      </div>
    </div>
  )
}

