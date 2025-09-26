'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, RotateCcw, Square } from 'lucide-react'
// Import dinâmico do GoogleGenAI (como usado no projeto)

// Utilitários baseados na implementação funcional da pasta live-audio
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // convert float32 -1 to 1 to int16 -32768 to 32767
    int16[i] = data[i] * 32768;
  }

  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const buffer = ctx.createBuffer(
    numChannels,
    data.length / 2 / numChannels,
    sampleRate,
  );

  const dataInt16 = new Int16Array(data.buffer);
  const l = dataInt16.length;
  const dataFloat32 = new Float32Array(l);
  for (let i = 0; i < l; i++) {
    dataFloat32[i] = dataInt16[i] / 32768.0;
  }
  
  if (numChannels === 1) {
    buffer.copyToChannel(dataFloat32, 0);
  } else {
    for (let i = 0; i < numChannels; i++) {
      const channel = dataFloat32.filter(
        (_, index) => index % numChannels === i,
      );
      buffer.copyToChannel(channel, i);
    }
  }

  return buffer;
}

// Função para converter PCM para WAV (para fallback)
function createWavBlob(pcmData: Float32Array): Blob {
  const length = pcmData.length
  const buffer = new ArrayBuffer(44 + length * 2)
  const view = new DataView(buffer)
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, 16000, true)
  view.setUint32(28, 32000, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length * 2, true)
  
  // Convert float32 to int16
  let offset = 44
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, pcmData[i]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
    offset += 2
  }
  
  return new Blob([buffer], { type: 'audio/wav' })
}

export default function LiveAudioVisualizer() {
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState('Aplicativo carregado! Clique no botão vermelho para iniciar a gravação.')
  const [isInitialized, setIsInitialized] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState('')
  
  // Refs para áudio
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  
  // Contextos de áudio (baseado na implementação funcional)
  const inputAudioContextRef = useRef<AudioContext | null>(null)
  const outputAudioContextRef = useRef<AudioContext | null>(null)
  const inputNodeRef = useRef<GainNode | null>(null)
  const outputNodeRef = useRef<GainNode | null>(null)
  const sessionRef = useRef<any>(null)
  const clientRef = useRef<any>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set())
  // Função para usar fallback com sistema de chat existente
  const useChatFallback = useCallback(async (audioBlob: Blob) => {
    try {
      console.log('🔄 Usando fallback: sistema de chat existente')
      setStatus('🔄 Processando áudio com sistema alternativo...')
      
      const formData = new FormData()
      formData.append('audio', audioBlob)
      
      const response = await fetch('/api/chat/live/send-audio', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }
      
      let fullResponse = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'content' && data.content) {
                fullResponse += data.content
                setStatus(`🤖 IA: ${fullResponse}`)
              } else if (data.type === 'done') {
                setStatus('✅ Resposta completa recebida')
                console.log('✅ Fallback funcionou:', fullResponse)
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no fallback:', error)
      setStatus(`❌ Erro no processamento: ${error}`)
    }
  }, [])

  // Inicializar aplicação (baseado na implementação funcional)
  useEffect(() => {
    const initApp = async () => {
      try {
        await initAudio()
        await initClient()
        await initVisualization()
        setIsInitialized(true)
        setStatus('Aplicação inicializada. Clique no botão vermelho para começar.')
        console.log('✅ Live Audio App inicializado com sucesso')
      } catch (error) {
        console.error('❌ Erro na inicialização:', error)
        setError(`Erro na inicialização: ${error}`)
      }
    }

    initApp()

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (sessionRef.current) {
        sessionRef.current.close()
      }
    }
  }, [])

  // Inicializar contextos de áudio (baseado na implementação funcional)
  const initAudio = useCallback(() => {
    inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
    outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 })
    
    inputNodeRef.current = inputAudioContextRef.current.createGain()
    outputNodeRef.current = outputAudioContextRef.current.createGain()
    
    nextStartTimeRef.current = outputAudioContextRef.current.currentTime
    outputNodeRef.current.connect(outputAudioContextRef.current.destination)
  }, [])

  // Inicializar cliente Gemini (baseado na implementação funcional)
  const initClient = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    console.log('🔑 API Key encontrada:', apiKey ? 'Sim' : 'Não')
    
    if (!apiKey) {
      throw new Error('Gemini API key não configurada')
    }

    console.log('📦 Importando GoogleGenAI...')
    // Importar GoogleGenAI dinamicamente (como usado no projeto)
    const { GoogleGenAI } = await import('@google/genai')
    console.log('✅ GoogleGenAI importado com sucesso')
    
    clientRef.current = new GoogleGenAI({ apiKey })
    console.log('✅ Cliente Gemini criado:', clientRef.current)
    
    await initSession()
  }, [])

  // Inicializar sessão Gemini Live (baseado na implementação funcional)
  const initSession = useCallback(async () => {
    if (!clientRef.current) {
      console.error('❌ Cliente Gemini não inicializado')
      return
    }

    const model = 'gemini-2.5-flash-preview-native-audio-dialog'
    console.log('🔗 Tentando conectar com Gemini Live...', { model })

    try {
      sessionRef.current = await clientRef.current.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            setStatus('Sessão conectada')
            console.log('🔗 Gemini Live conectado com sucesso!')
          },
          onmessage: async (message: any) => {
            console.log('📨 Mensagem recebida do Gemini:', message)
            
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData

            if (audio) {
              console.log('🎵 Áudio recebido da IA:', audio.data.length, 'bytes')
              
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputAudioContextRef.current!.currentTime,
              )

              const audioBuffer = await decodeAudioData(
                decode(audio.data),
                outputAudioContextRef.current!,
                24000,
                1,
              )
              
              const source = outputAudioContextRef.current!.createBufferSource()
              source.buffer = audioBuffer
              source.connect(outputNodeRef.current!)
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source)
              })

              source.start(nextStartTimeRef.current)
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration
              sourcesRef.current.add(source)
              
              setStatus('🎵 Reproduzindo resposta da IA...')
              console.log('🔊 Reproduzindo áudio da IA')
            }

            const interrupted = message.serverContent?.interrupted
            if (interrupted) {
              console.log('⏹️ Áudio interrompido')
              for (const source of sourcesRef.current.values()) {
                source.stop()
                sourcesRef.current.delete(source)
              }
              nextStartTimeRef.current = 0
            }
          },
          onerror: (e: ErrorEvent) => {
            setError(e.message)
            console.error('❌ Erro Gemini Live:', e.message)
          },
          onclose: (e: CloseEvent) => {
            setStatus('Conexão fechada: ' + e.reason)
            console.log('🔌 Gemini Live fechado:', e.reason)
            
            // Se foi por quota excedida, usar fallback
            if (e.reason.includes('quota') || e.reason.includes('exceeded')) {
              console.log('🔄 Quota excedida, usando sistema de fallback')
              setStatus('🔄 Usando sistema alternativo (quota excedida)')
              sessionRef.current = null // Marcar como não disponível
            }
          },
        },
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
          },
        },
      })
      
      console.log('✅ Sessão Gemini Live criada:', sessionRef.current)
    } catch (e) {
      console.error('❌ Erro ao conectar com Gemini:', e)
      setError('Erro ao conectar com o Gemini')
    }
  }, [])

  // Inicializar visualização (baseado na implementação funcional)
  const initVisualization = useCallback(async () => {
    try {
      // Solicitar permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      
      mediaStreamRef.current = stream
      
      // Criar contexto de áudio para análise
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      
      analyserRef.current = analyser
      
      // Iniciar visualização
      startVisualization()
      
      setStatus('✅ Microfone autorizado! Pronto para gravar.')
      console.log('🎤 Visualização inicializada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao inicializar visualização:', error)
      setError('Erro: Permissão de microfone negada')
    }
  }, [])

  // Visualização de áudio
  const startVisualization = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isRecording) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      analyser.getByteFrequencyData(dataArray)
      
      // Calcular nível médio de áudio
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
      setAudioLevel(average / 255)

      // Desenhar visualização
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let barHeight
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, `hsl(${120 + (dataArray[i] / 255) * 60}, 70%, 50%)`)
        gradient.addColorStop(1, `hsl(${120 + (dataArray[i] / 255) * 60}, 90%, 30%)`)

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [isRecording])

  // Funções de controle baseadas na implementação funcional
  const startRecording = useCallback(async () => {
    if (isRecording) return
    
    console.log('🎤 Iniciando gravação...')
    
    try {
      inputAudioContextRef.current!.resume()
      setStatus('Solicitando acesso ao microfone...')
      console.log('📡 Status: Solicitando acesso ao microfone...')

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })

      console.log('✅ Microfone autorizado:', mediaStream)
      setStatus('Acesso ao microfone concedido. Iniciando captura...')

      const sourceNode = inputAudioContextRef.current!.createMediaStreamSource(mediaStream)
      sourceNode.connect(inputNodeRef.current!)

      const bufferSize = 256
      const scriptProcessorNode = inputAudioContextRef.current!.createScriptProcessor(
        bufferSize,
        1,
        1,
      )

      scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
        if (!isRecording) return

        const inputBuffer = audioProcessingEvent.inputBuffer
        const pcmData = inputBuffer.getChannelData(0)

        console.log('🎵 Enviando áudio PCM:', pcmData.length, 'samples')
        
        if (sessionRef.current) {
          try {
            sessionRef.current.sendRealtimeInput({ media: createBlob(pcmData) })
          } catch (error) {
            console.warn('⚠️ Erro ao enviar para Gemini Live:', error)
            // Converter PCM para WAV e usar fallback
            const wavBlob = createWavBlob(pcmData)
            useChatFallback(wavBlob)
          }
        } else {
          console.warn('⚠️ Sessão não conectada, usando fallback')
          // Converter PCM para WAV e usar fallback
          const wavBlob = createWavBlob(pcmData)
          useChatFallback(wavBlob)
        }
      }

      sourceNode.connect(scriptProcessorNode)
      scriptProcessorNode.connect(inputAudioContextRef.current!.destination)

      sourceNodeRef.current = sourceNode
      scriptProcessorRef.current = scriptProcessorNode

      setIsRecording(true)
      setStatus('🔴 Gravando... Capturando chunks PCM.')
      console.log('🎤 Gravação iniciada com sucesso')
    } catch (err) {
      console.error('❌ Erro ao iniciar gravação:', err)
      setStatus(`Erro: ${err}`)
      stopRecording()
    }
  }, [isRecording])

  const stopRecording = useCallback(() => {
    if (!isRecording && !mediaStreamRef.current && !inputAudioContextRef.current) return

    setStatus('Parando gravação...')
    setIsRecording(false)

    if (scriptProcessorRef.current && sourceNodeRef.current && inputAudioContextRef.current) {
      scriptProcessorRef.current.disconnect()
      sourceNodeRef.current.disconnect()
    }

    scriptProcessorRef.current = null
    sourceNodeRef.current = null

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    setStatus('Gravação parada. Clique em Iniciar para começar novamente.')
    console.log('⏹️ Gravação parada')
  }, [isRecording])

  const reset = useCallback(() => {
    sessionRef.current?.close()
    initSession()
    setStatus('Sessão reiniciada.')
    console.log('🔄 Sessão resetada')
  }, [initSession])

  return (
    <div className="live-audio-container">
      {/* Header */}
      <div className="header">
        <h1 className="app-title">Live Audio Visualizer</h1>
        <div className="connection-status">
          {sessionRef.current ? (
            <span className="status-connected">🟢 Conectado</span>
          ) : (
            <span className="status-disconnected">🔴 Desconectado</span>
          )}
        </div>
      </div>
      
      {/* Controles Centralizados */}
      <div className="controls-container">
        <div className="controls">
          <button
            className={`control-button reset-button ${isRecording ? 'disabled' : ''}`}
            onClick={reset}
            disabled={isRecording}
            title="Resetar sessão">
            <RotateCcw className="w-7 h-7" />
          </button>
          
          <button
            className={`control-button recording-button ${isRecording ? 'disabled' : ''}`}
            onClick={startRecording}
            disabled={isRecording}
            title="Iniciar gravação">
            <Mic className="w-7 h-7" />
          </button>
          
          <button
            className={`control-button stop-button ${!isRecording ? 'disabled' : ''}`}
            onClick={stopRecording}
            disabled={!isRecording}
            title="Parar gravação">
            <Square className="w-7 h-7" />
          </button>
        </div>
        
        {/* Indicador de nível de áudio */}
        {isRecording && (
          <div className="audio-level-indicator">
            <div 
              className="audio-level-bar"
              style={{ 
                width: `${audioLevel * 100}%`,
                backgroundColor: `hsl(${120 + audioLevel * 60}, 70%, 50%)`
              }}
            />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="status-container">
        <div className="status">
          {error ? (
            <div className="error">❌ {error}</div>
          ) : (
            status
          )}
        </div>
      </div>

      {/* Canvas para visualizações */}
      <canvas 
        ref={canvasRef} 
        className="audio-canvas"
        width={800}
        height={600}
      />

      <style jsx>{`
        .live-audio-container {
            width: 100%;
            height: 100vh;
            position: relative;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f23 100%);
          display: flex;
          flex-direction: column;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
          }
          
        .header {
          position: relative;
          z-index: 20;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .app-title {
          color: white;
          font-size: 24px;
          font-weight: 600;
          text-align: center;
          margin: 0;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          background: linear-gradient(45deg, #ffffff, #a0a0a0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .connection-status {
          font-size: 14px;
          font-weight: 500;
        }

        .status-connected {
          color: #4ade80;
        }

        .status-connecting {
          color: #fbbf24;
        }

        .status-disconnected {
          color: #f87171;
        }

        .controls-container {
            position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          }
          
          .controls {
            display: flex;
            align-items: center;
            justify-content: center;
          flex-direction: row;
          gap: 25px;
          background: rgba(0, 0, 0, 0.6);
          padding: 20px 30px;
          border-radius: 30px;
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
          animation: fadeInScale 0.8s ease-out;
        }

        .control-button {
            outline: none;
          border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
          border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
          width: 70px;
          height: 70px;
            cursor: pointer;
            font-size: 24px;
            padding: 0;
            margin: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .control-button:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .control-button.disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
        }

        .recording-button:not(.disabled) {
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.3));
          border-color: rgba(220, 38, 38, 0.6);
          animation: pulse 2s infinite;
        }

        .recording-button:hover:not(.disabled) {
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(185, 28, 28, 0.5));
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.4);
        }

        .stop-button:not(.disabled) {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 20, 0.4));
          border-color: rgba(255, 255, 255, 0.4);
        }

        .stop-button:hover:not(.disabled) {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 0.6));
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
        }

        .reset-button:not(.disabled) {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3));
          border-color: rgba(59, 130, 246, 0.6);
        }

        .reset-button:hover:not(.disabled) {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.5));
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
        }

        .audio-level-indicator {
          width: 200px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .audio-level-bar {
          height: 100%;
          transition: width 0.1s ease;
          border-radius: 4px;
        }

        .status-container {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          text-align: center;
          max-width: 80%;
        }

        .status {
          color: white;
          font-size: 16px;
          text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
          pointer-events: none;
          padding: 15px 25px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeIn 0.5s ease-out;
        }

        .error {
          color: #f87171;
        }

        .audio-canvas {
          width: 100% !important;
          height: 100% !important;
          position: absolute;
          inset: 0;
          image-rendering: pixelated;
          z-index: 1;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .app-title {
            font-size: 20px;
          }
          
          .controls {
            gap: 20px;
            padding: 15px 25px;
          }
          
          .control-button {
            width: 60px;
            height: 60px;
            font-size: 20px;
          }
          
          .status {
            font-size: 14px;
            padding: 12px 20px;
          }
        }

        @media (max-width: 480px) {
          .app-title {
            font-size: 18px;
          }
          
          .controls {
            gap: 15px;
            padding: 12px 20px;
          }
          
          .control-button {
            width: 55px;
            height: 55px;
            font-size: 18px;
          }
          
          .status {
            font-size: 13px;
            padding: 10px 18px;
          }
        }
      `}</style>
    </div>
  )
}