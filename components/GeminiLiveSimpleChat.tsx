'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, Radio, Zap, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Message {
  role: 'user' | 'assistant'
  text?: string
  audioUrl?: string
  timestamp: Date
}

export default function GeminiLiveSimpleChat() {
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('Clique para começar')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  // Começar sessão automática
  const startSession = async () => {
    try {
      setError(null)
      setStatusText('Solicitando acesso ao microfone...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        } 
      })
      
      setStatusText('🎤 Fale agora! Estou ouvindo...')
      
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
        await sendToGemini(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      // Gravar por 5 segundos automaticamente
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsActive(true)
      
      // Parar após 5 segundos
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
          setIsActive(false)
          setIsProcessing(true)
          setStatusText('⏳ Processando sua fala...')
        }
      }, 5000)
      
    } catch (err) {
      console.error('Erro ao acessar microfone:', err)
      setError('Não foi possível acessar o microfone. Verifique as permissões.')
      setStatusText('Erro ao acessar microfone')
    }
  }

  // Enviar para Gemini Live
  const sendToGemini = async (audioBlob: Blob) => {
    try {
      setStatusText('🤖 IA está pensando...')
      
      // Converter para base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      )

      // Fazer request com streaming
      const response = await fetch('/api/gemini-live-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          mimeType: 'audio/webm;codecs=opus'
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao conectar com Gemini')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let currentText = ''
      const audioChunks: string[] = []

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            switch (data.type) {
              case 'connected':
                console.log('✅ Conectado ao Gemini Live')
                setStatusText('✅ Conectado! IA está respondendo...')
                break

              case 'text':
                currentText += data.content
                setStatusText('💬 IA está falando...')
                break

              case 'audio':
                audioChunks.push(data.data)
                setStatusText('🔊 Recebendo áudio...')
                break

              case 'turn_complete':
                console.log('✅ Resposta completa')
                
                // Adicionar mensagem do assistente
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  text: currentText || 'Resposta em áudio',
                  timestamp: new Date(),
                }])
                
                // Reproduzir áudio se disponível
                if (audioChunks.length > 0) {
                  await playAudioChunks(audioChunks)
                }
                
                setStatusText('✅ Pronto para próxima pergunta')
                setIsProcessing(false)
                
                // Começar nova sessão automaticamente após 2 segundos
                setTimeout(() => {
                  if (!isActive && !isProcessing) {
                    setStatusText('Pronto! Fale novamente...')
                  }
                }, 2000)
                break

              case 'error':
                throw new Error(data.message)
            }
          }
        }
      }

    } catch (err) {
      console.error('Erro ao enviar para Gemini:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar')
      setIsProcessing(false)
      setStatusText('❌ Erro. Tente novamente.')
    }
  }

  // Reproduzir chunks de áudio
  const playAudioChunks = async (chunks: string[]) => {
    try {
      // Combinar todos os chunks
      const combinedAudio = chunks.join('')
      
      // Converter para blob
      const binaryString = atob(combinedAudio)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const blob = new Blob([bytes], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(blob)
      
      // Usar elemento audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl)
        }
        audioRef.current.onerror = () => {
          console.error('Erro ao reproduzir áudio')
          URL.revokeObjectURL(audioUrl)
        }
        
        await audioRef.current.play()
        console.log('🔊 Reproduzindo áudio')
      }
      
    } catch (err) {
      console.error('Erro ao reproduzir áudio:', err)
    }
  }

  const stopSession = () => {
    if (mediaRecorderRef.current && isActive) {
      mediaRecorderRef.current.stop()
      setIsActive(false)
      setIsProcessing(true)
      setStatusText('⏳ Processando...')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 p-4">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-2xl border-2 border-indigo-200 dark:border-indigo-700">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-lg">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Radio className={`w-8 h-8 ${isActive ? 'animate-pulse' : ''}`} />
                <CardTitle className="text-3xl font-bold">
                  Conversa Simples ao Vivo
                </CardTitle>
                <Zap className="w-8 h-8" />
              </div>
              <p className="text-indigo-100 text-lg">
                Versão simplificada com reprodução de áudio corrigida
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Status Central */}
            <div className="text-center space-y-6">
              <div className={`inline-flex items-center justify-center w-48 h-48 rounded-full transition-all duration-500 ${
                isActive 
                  ? 'bg-red-500 animate-pulse shadow-2xl shadow-red-500/50' 
                  : isProcessing
                  ? 'bg-blue-500 animate-spin shadow-2xl shadow-blue-500/50'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl hover:shadow-2xl hover:scale-105'
              }`}>
                {isActive ? (
                  <Mic className="w-24 h-24 text-white" />
                ) : isProcessing ? (
                  <div className="w-24 h-24 border-8 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Volume2 className="w-24 h-24 text-white" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {statusText}
                </p>
                
                {isActive && (
                  <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    <span className="font-semibold">GRAVANDO (5 segundos)</span>
                  </div>
                )}
              </div>

              {/* Botões de Controle */}
              <div className="flex gap-4 justify-center">
                {!isActive && !isProcessing && (
                  <Button
                    onClick={startSession}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-lg"
                  >
                    <Mic className="w-6 h-6 mr-2" />
                    Começar a Falar
                  </Button>
                )}
                
                {isActive && (
                  <Button
                    onClick={stopSession}
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold shadow-lg"
                  >
                    <MicOff className="w-6 h-6 mr-2" />
                    Parar Agora
                  </Button>
                )}
              </div>
            </div>

            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Histórico Simplificado */}
            {messages.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-center">💬 Última Resposta</h3>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                  <p className="text-lg text-center">
                    {messages[messages.length - 1].text}
                  </p>
                </div>
              </div>
            )}

            {/* Instruções */}
            {messages.length === 0 && (
              <Alert className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <AlertDescription>
                  <p className="font-semibold mb-3 text-lg">🎯 Versão Corrigida:</p>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">1.</span>
                      <span>Clique em "Começar a Falar"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">2.</span>
                      <span>Fale por até 5 segundos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">3.</span>
                      <span>A IA responde com áudio corrigido!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">4.</span>
                      <span>Sem mais erros de decodificação ✨</span>
                    </li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {/* Audio Element (hidden) */}
            <audio ref={audioRef} className="hidden" />
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
          <p className="font-semibold">⚡ Powered by Gemini 2.5 Flash Native Audio</p>
          <p>Versão simplificada com reprodução de áudio corrigida</p>
        </div>
      </div>
    </div>
  )
}

