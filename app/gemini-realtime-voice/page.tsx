"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Phone,
  PhoneOff,
  Radio,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Activity
} from "lucide-react";
import { AudioVisualizer } from "@/components/voice/AudioVisualizer";

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function GeminiRealtimeVoice() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const isMicActiveRef = useRef(false); // Ref para evitar closure issues
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string>("Desconectado");

  // Refs
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const startMicrophoneRef = useRef<(() => Promise<void>) | null>(null);

  // Inicializar contexto de áudio
  const initAudioContext = useCallback(async () => {
    if (audioContextRef.current) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    
    console.log('🔊 AudioContext inicializado');
  }, []);

  // Converter PCM para WAV (baseado no exemplo oficial)
  const convertPCMToWAV = useCallback((pcmData: string, mimeType: string): ArrayBuffer => {
    // Parse mime type para extrair parâmetros
    const params = mimeType.split(';').map(s => s.trim());
    let sampleRate = 24000; // padrão do Gemini
    const channels = 1;
    const bitsPerSample = 16;
    
    for (const param of params) {
      if (param.startsWith('rate=')) {
        sampleRate = parseInt(param.split('=')[1]);
      }
    }
    
    // Decodificar PCM base64
    const binaryString = atob(pcmData);
    const pcmBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }
    
    // Criar header WAV
    const byteRate = sampleRate * channels * bitsPerSample / 8;
    const blockAlign = channels * bitsPerSample / 8;
    const dataLength = pcmBytes.length;
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Combinar header + dados
    const wavBuffer = new Uint8Array(44 + dataLength);
    wavBuffer.set(new Uint8Array(header), 0);
    wavBuffer.set(pcmBytes, 44);
    
    return wavBuffer.buffer;
  }, []);

  // Helper para escrever string no DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Reproduzir áudio recebido
  const playAudioChunk = useCallback(async (base64Audio: string, mimeType: string = 'audio/pcm;rate=24000') => {
    if (!audioContextRef.current || isAudioMuted) return;

    try {
      console.log('🔊 [AUDIO] Recebendo áudio, mimeType:', mimeType);
      
      let audioData: ArrayBuffer;
      
      // Se for PCM, converter para WAV
      if (mimeType.includes('pcm')) {
        console.log('🔄 [AUDIO] Convertendo PCM para WAV...');
        audioData = convertPCMToWAV(base64Audio, mimeType);
      } else {
        // Decodificar base64 diretamente
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioData = bytes.buffer;
      }

      // Decodificar áudio
      console.log('🎵 [AUDIO] Decodificando áudio...');
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
      console.log('✅ [AUDIO] Áudio decodificado:', audioBuffer.duration, 'segundos');
      
      // Adicionar à fila
      audioQueueRef.current.push(audioBuffer);
      
      // Iniciar reprodução se não estiver tocando
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (error) {
      console.error('❌ [AUDIO] Erro ao reproduzir áudio:', error);
    }
  }, [isAudioMuted, convertPCMToWAV]);

  // Reproduzir próximo áudio da fila
  const playNextInQueue = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);

    const buffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      // Reproduzir próximo
      if (audioQueueRef.current.length > 0) {
        playNextInQueue();
      } else {
        isPlayingRef.current = false;
        setIsSpeaking(false);
      }
    };

    source.start();
  }, []);

  // Conectar ao Gemini Live API
  const connect = useCallback(async () => {
    console.log('🔵 [CONNECT] Iniciando conexão...');
    
    if (isConnected || isConnecting) {
      console.log('⚠️ [CONNECT] Já conectado ou conectando');
      return;
    }

    setIsConnecting(true);
    setError(null);
    setStatus("Conectando...");
    
    console.log('🔍 [CONNECT] Procurando API Key...');

    try {
      // Verificar API Key
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                     process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
      
      console.log('🔑 [CONNECT] API Key encontrada:', apiKey ? 'SIM (***' + apiKey.slice(-4) + ')' : 'NÃO');
      
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY não configurada. Configure NEXT_PUBLIC_GEMINI_API_KEY ou NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY no .env.local');
      }

      // Importar SDK
      console.log('📦 [CONNECT] Importando SDK @google/genai...');
      const { GoogleGenAI, Modality } = await import('@google/genai');
      console.log('✅ [CONNECT] SDK importado com sucesso');
      
      // Inicializar áudio
      console.log('🔊 [CONNECT] Inicializando AudioContext...');
      await initAudioContext();
      console.log('✅ [CONNECT] AudioContext inicializado');

      // Configurar cliente
      console.log('🤖 [CONNECT] Criando cliente GoogleGenAI...');
      const client = new GoogleGenAI({ apiKey });
      console.log('✅ [CONNECT] Cliente criado');

      console.log('🚀 [CONNECT] Conectando ao Gemini Live API...');

      // Conectar à sessão Live
      console.log('📡 [CONNECT] Tentando estabelecer conexão Live...');
      
      // Usar o modelo exato do exemplo oficial
      const modelName = 'models/gemini-2.0-flash-exp';
      console.log('🤖 [CONNECT] Usando modelo:', modelName);
      
      const session = await client.live.connect({
        model: modelName,
        callbacks: {
          onopen: () => {
            console.log('✅ [CONNECT] CONEXÃO ESTABELECIDA COM SUCESSO!');
            setIsConnected(true);
            setIsConnecting(false);
            setStatus("Conectado - Pronto para conversar");
          },
          onmessage: async (message: any) => {
            console.log('📨 [CONNECT] Mensagem recebida:', message);
            
            // Log detalhado do conteúdo
            if (message.setupComplete) {
              console.log('✅ [CONNECT] Setup completo!');
            }
            if (message.toolCall) {
              console.log('🔧 [CONNECT] Tool call recebida');
            }
            if (message.serverContent) {
              console.log('📦 [CONNECT] Conteúdo do servidor:', JSON.stringify(message.serverContent, null, 2));
            }
            
            // Log se houver turnComplete
            if (message.serverContent?.turnComplete) {
              console.log('✅ [CONNECT] Turno completo - IA terminou de responder');
            }
            
            // Processar áudio
            const audioPart = message.serverContent?.modelTurn?.parts?.find(
              (part: any) => part.inlineData?.mimeType?.startsWith('audio/')
            );
            
            if (audioPart?.inlineData?.data) {
              console.log('🎤 [AUDIO] Áudio recebido do Gemini');
              await playAudioChunk(
                audioPart.inlineData.data,
                audioPart.inlineData.mimeType || 'audio/pcm;rate=24000'
              );
            }

            // Processar texto (transcrição)
            const textPart = message.serverContent?.modelTurn?.parts?.find(
              (part: any) => part.text
            );
            
            if (textPart?.text) {
              addMessage('assistant', textPart.text);
            }

            // Verificar interrupção
            if (message.serverContent?.interrupted) {
              console.log('🛑 Interrompido');
              stopAudioPlayback();
            }
          },
          onerror: (error: ErrorEvent) => {
            console.error('❌ Erro na conexão:', error);
            setError(`Erro: ${error.message}`);
            setStatus("Erro de conexão");
          },
          onclose: (event: CloseEvent) => {
            console.warn('🔌 [CONNECT] Conexão fechada!');
            console.warn('🔌 [CONNECT] Code:', event.code);
            console.warn('🔌 [CONNECT] Reason:', event.reason || 'Nenhum motivo fornecido');
            console.warn('🔌 [CONNECT] Was clean:', event.wasClean);
            
            // Code 1000 = fechamento normal (esperado ao desconectar)
            if (event.code === 1000 && event.wasClean) {
              console.log('✅ [CONNECT] Fechamento normal');
            } else {
              console.error('⚠️ [CONNECT] Fechamento inesperado!');
              setError('Conexão perdida: ' + (event.reason || `Código ${event.code}`));
            }
            
            setIsConnected(false);
            setIsMicActive(false);
            isMicActiveRef.current = false;
            setStatus("Desconectado");
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Charon' } // Voz masculina
            },
          },
          systemInstruction: {
            parts: [{ 
              text: 'Você é um assistente de voz brasileiro. Responda sempre em português do Brasil de forma natural e conversacional. Seja breve e direto nas respostas.' 
            }]
          }
        },
      });

      console.log('💾 [CONNECT] Salvando sessão na ref...');
      sessionRef.current = session;
      console.log('✅ [CONNECT] Sessão salva, iniciando microfone...');
      
      // Enviar mensagem inicial para manter conexão viva
      console.log('📤 [CONNECT] Enviando mensagem inicial...');
      session.sendClientContent({
        turns: [
          {
            role: 'user',
            parts: [
              { text: 'Oi! Diga apenas "Olá, estou ouvindo" e aguarde minha próxima mensagem.' }
            ]
          }
        ]
      });
      
      // Iniciar microfone DEPOIS de salvar a sessão
      if (startMicrophoneRef.current) {
        await startMicrophoneRef.current();
      }
      
      console.log('✅ [CONNECT] Conexão totalmente estabelecida e ativa!');

    } catch (error: any) {
      console.error('❌ [CONNECT] ERRO AO CONECTAR:', error);
      console.error('❌ [CONNECT] Stack trace:', error.stack);
      console.error('❌ [CONNECT] Detalhes:', {
        message: error.message,
        name: error.name,
        cause: error.cause
      });
      setError(error.message);
      setIsConnecting(false);
      setStatus("Erro ao conectar");
    }
  }, [isConnected, isConnecting, initAudioContext]);

  // Iniciar microfone
  const startMicrophone = useCallback(async () => {
    console.log('🎤 [MIC] Verificando sessão...');
    
    if (!sessionRef.current) {
      console.error('❌ [MIC] Sessão não encontrada!');
      setError('Não conectado ao Gemini');
      return;
    }
    
    console.log('✅ [MIC] Sessão OK, prosseguindo...');

    try {
      console.log('🎤 [MIC] Solicitando permissão de microfone...');

      // Solicitar permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });

      console.log('✅ [MIC] Permissão concedida!');
      mediaStreamRef.current = stream;

      // Criar processador de áudio
      console.log('🔊 [MIC] Criando processador de áudio...');
      const audioContext = audioContextRef.current!;
      const source = audioContext.createMediaStreamSource(stream);

      // Usar ScriptProcessorNode para captura em tempo real
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      console.log('✅ [MIC] Processador criado');
      console.log(`🎯 [MIC] VAD ATIVADO - Limiar: 0.005, Logs a cada 2s`);
      const needsResampling = audioContext.sampleRate !== 16000;
      console.log(`🎙️ [MIC] Taxa: ${audioContext.sampleRate}Hz → 16000Hz ${needsResampling ? '(resampling ativo)' : '(sem resampling)'}`);

      let chunkCount = 0;
      const audioChunks: Int16Array[] = []; // Acumular Int16Array ao invés de Base64
      let isRecordingForSend = false;
      let lastSendTime = Date.now();
      let lastLogTime = Date.now();
      
      processor.onaudioprocess = (event) => {
        if (!sessionRef.current || !isMicActiveRef.current) {
          console.log('⚠️ [MIC] Handler chamado mas inativo:', { session: !!sessionRef.current, mic: isMicActiveRef.current });
          return;
        }

        const inputData = event.inputBuffer.getChannelData(0);
        
        // Detectar se há áudio significativo (Voice Activity Detection simples)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const average = sum / inputData.length;
        const hasVoice = average > 0.005; // Threshold REDUZIDO para mais sensibilidade
        
        // Log periódico do nível de áudio para debug
        if (Date.now() - lastLogTime > 2000) {
          console.log(`🎚️ [MIC] Nível de áudio: ${average.toFixed(5)} ${hasVoice ? '✅ VOZ DETECTADA' : '❌ Abaixo do limiar (0.005)'}`);
          lastLogTime = Date.now();
        }
        
        if (hasVoice) {
          // Verificar se precisa de resampling
          const inputSampleRate = audioContext.sampleRate;
          const outputSampleRate = 16000;
          const needsResampling = inputSampleRate !== outputSampleRate;
          
          let processedData: Float32Array;
          
          if (needsResampling) {
            // RESAMPLE (ex: 48kHz → 16kHz)
            const resampleRatio = inputSampleRate / outputSampleRate;
            const outputLength = Math.floor(inputData.length / resampleRatio);
            const resampledData = new Float32Array(outputLength);
            
            for (let i = 0; i < outputLength; i++) {
              const srcIndex = i * resampleRatio;
              const srcIndexFloor = Math.floor(srcIndex);
              const srcIndexCeil = Math.min(srcIndexFloor + 1, inputData.length - 1);
              const t = srcIndex - srcIndexFloor;
              
              // Interpolação linear
              resampledData[i] = inputData[srcIndexFloor] * (1 - t) + inputData[srcIndexCeil] * t;
            }
            
            processedData = resampledData;
          } else {
            // Sem resampling necessário (já está a 16kHz)
            processedData = inputData;
          }
          
          // Converter Float32 para Int16
          const int16Data = new Int16Array(processedData.length);
          for (let i = 0; i < processedData.length; i++) {
            const s = Math.max(-1, Math.min(1, processedData[i]));
            int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // Log de debug
          if (chunkCount === 0) {
            console.log(`🔍 [MIC] Primeiro chunk: ${int16Data.length} samples (${int16Data.byteLength} bytes)`);
          }

          // Acumular Int16Array bruto (não converter para Base64 ainda)
          audioChunks.push(int16Data);
          chunkCount++;
          isRecordingForSend = true;
          
          if (chunkCount === 1) {
            console.log(`🎤 [MIC] Detectado início da fala! (Nível: ${average.toFixed(5)})`);
          }
        } else if (isRecordingForSend && audioChunks.length > 0) {
          // Silêncio detectado após ter voz - enviar o que temos
          const timeSinceLastSend = Date.now() - lastSendTime;
          
          if (timeSinceLastSend > 2000) { // Esperar 2 segundos entre envios
            console.log(`🛑 [MIC] Silêncio detectado. Enviando ${audioChunks.length} chunks acumulados...`);
            
            try {
              // Calcular tamanho total
              const totalSamples = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
              const totalBytes = totalSamples * 2; // Int16 = 2 bytes por sample
              
              console.log(`🔍 [MIC] Total: ${totalSamples} samples (${totalBytes} bytes)`);
              
              if (totalBytes > 10000) { // Mínimo de ~0.3 segundos de áudio
                // Combinar todos os Int16Arrays em um único buffer
                const combinedInt16 = new Int16Array(totalSamples);
                let offset = 0;
                for (const chunk of audioChunks) {
                  combinedInt16.set(chunk, offset);
                  offset += chunk.length;
                }
                
                // Converter para Uint8Array (bytes)
                const uint8Array = new Uint8Array(combinedInt16.buffer);
                
                // Converter para Base64 de uma vez só
                let binaryString = '';
                for (let i = 0; i < uint8Array.length; i++) {
                  binaryString += String.fromCharCode(uint8Array[i]);
                }
                const base64Audio = btoa(binaryString);
                
                console.log(`📤 [MIC] Enviando ${base64Audio.length} chars base64 para Gemini`);
                console.log(`🔍 [MIC] Base64 preview: "${base64Audio.substring(0, 50)}..."`);
                console.log(`🔍 [MIC] Base64 fim: "...${base64Audio.substring(base64Audio.length - 10)}"`);
                
                // Debug: verificar primeiros bytes
                const firstInt16 = combinedInt16.slice(0, 5);
                console.log(`🔍 [MIC] Primeiros 5 samples (Int16):`, Array.from(firstInt16));
                
                // Formato PCM específico: mono, 16-bit signed integer, 16kHz
                const mimeType = 'audio/l16;rate=16000';
                console.log(`🔍 [MIC] MimeType: ${mimeType}`);
                
                // Enviar usando sendClientContent conforme exemplo oficial
                sessionRef.current.sendClientContent({
                  turns: [
                    {
                      role: 'user',
                      parts: [
                        {
                          inlineData: {
                            data: base64Audio,
                            mimeType: mimeType,
                          }
                        }
                      ]
                    }
                  ]
                  // Removido turnComplete temporariamente para teste
                });
                
                console.log('✅ [MIC] Áudio enviado! Aguardando resposta da IA...');
                lastSendTime = Date.now();
              } else {
                console.warn(`⚠️ [MIC] Áudio muito curto (${totalBytes} bytes), ignorando...`);
              }
              
              // Limpar buffer
              audioChunks.length = 0;
              isRecordingForSend = false;
              chunkCount = 0;
              
            } catch (error) {
              console.error('❌ [MIC] Erro ao enviar áudio:', error);
              console.error('❌ [MIC] Detalhes:', error);
            }
          }
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsMicActive(true);
      isMicActiveRef.current = true; // Atualizar ref IMEDIATAMENTE
      setStatus("Microfone ativo - Fale agora!");
      console.log('✅ [MIC] Microfone TOTALMENTE ativo e enviando dados!');

    } catch (error: any) {
      console.error('❌ [MIC] Erro ao acessar microfone:', error);
      setError(`Erro no microfone: ${error.message}`);
    }
  }, []);

  // Atualizar ref quando a função mudar
  useEffect(() => {
    startMicrophoneRef.current = startMicrophone;
  }, [startMicrophone]);

  // Parar microfone
  const stopMicrophone = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsMicActive(false);
    isMicActiveRef.current = false;
    setStatus("Microfone desativado");
    console.log('🛑 Microfone parado');
  }, []);

  // Parar reprodução de áudio
  const stopAudioPlayback = useCallback(() => {
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    console.log('🔴 [DISCONNECT] Desconectando...');
    
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
        console.log('✅ [DISCONNECT] Sessão fechada');
      } catch (error) {
        console.error('❌ [DISCONNECT] Erro ao fechar sessão:', error);
      }
      sessionRef.current = null;
    }

    stopMicrophone();
    stopAudioPlayback();
    
    setIsConnected(false);
    setStatus("Desconectado");
    console.log('✅ [DISCONNECT] Desconectado completamente');
  }, [stopMicrophone, stopAudioPlayback]);

  // Limpar recursos
  const cleanup = useCallback(() => {
    stopMicrophone();
    stopAudioPlayback();

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopMicrophone, stopAudioPlayback]);

  // Adicionar mensagem ao histórico
  const addMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    setMessages(prev => [...prev, {
      role,
      text,
      timestamp: new Date()
    }]);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsAudioMuted(prev => !prev);
    if (!isAudioMuted) {
      stopAudioPlayback();
    }
  }, [isAudioMuted, stopAudioPlayback]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 p-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Radio className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Chat de Voz em Tempo Real
            </h1>
            <Radio className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">
            Conversa bidirecional com Gemini AI - Fale naturalmente em tempo real
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Powered by Gemini 2.5 Flash Live API
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-2 border-indigo-200 dark:border-indigo-700">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Conversa ao Vivo
              </span>
              <Badge 
                variant={isConnected ? "default" : "secondary"}
                className={isConnected ? "bg-green-500" : ""}
              >
                {isConnected ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Offline</>
                )}
              </Badge>
            </CardTitle>
            <CardDescription className="text-indigo-100">
              {status}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Status Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {isMicActive && (
                <Badge variant="default" className="flex items-center gap-2 bg-red-500 animate-pulse">
                  <Mic className="w-4 h-4" />
                  Microfone Ativo
                </Badge>
              )}
              
              {isSpeaking && (
                <Badge variant="default" className="flex items-center gap-2 bg-blue-500 animate-pulse">
                  <Volume2 className="w-4 h-4" />
                  IA Falando
                </Badge>
              )}
              
              {isAudioMuted && (
                <Badge variant="destructive" className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4" />
                  Áudio Mudo
                </Badge>
              )}
            </div>

            {/* Audio Visualizer */}
            {isMicActive && (
              <AudioVisualizer 
                stream={mediaStreamRef.current} 
                isActive={isMicActive}
                className="mb-4"
              />
            )}

            {/* Control Buttons */}
            <div className="flex flex-col items-center gap-4">
              {!isConnected ? (
                <Button
                  onClick={connect}
                  disabled={isConnecting}
                  size="lg"
                  className="w-48 h-16 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Phone className="w-6 h-6 mr-2" />
                      Iniciar Conversa
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    onClick={disconnect}
                    size="lg"
                    variant="destructive"
                    className="w-48 h-16 text-lg"
                  >
                    <PhoneOff className="w-6 h-6 mr-2" />
                    Encerrar
                  </Button>

                  <Button
                    onClick={isMicActive ? stopMicrophone : startMicrophone}
                    size="lg"
                    variant={isMicActive ? "default" : "outline"}
                    className="w-48 h-16 text-lg"
                  >
                    {isMicActive ? (
                      <>
                        <MicOff className="w-6 h-6 mr-2" />
                        Pausar Mic
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6 mr-2" />
                        Ativar Mic
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={toggleMute}
                    size="lg"
                    variant={isAudioMuted ? "destructive" : "outline"}
                    className="h-16"
                  >
                    {isAudioMuted ? (
                      <VolumeX className="w-6 h-6" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Messages History */}
            {messages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Histórico da Conversa</h3>
                <div className="max-h-64 overflow-y-auto space-y-2 bg-muted/30 rounded-lg p-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 ml-8'
                          : 'bg-purple-100 dark:bg-purple-900/30 mr-8'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-sm">
                          {message.role === 'user' ? '👤 Você' : '🤖 Gemini'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{message.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {!isConnected && (
              <Alert className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
                <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold mb-2">Como usar:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Clique em "Iniciar Conversa" para conectar</li>
                    <li>Permita o acesso ao microfone quando solicitado</li>
                    <li>Fale naturalmente - o áudio é enviado em tempo real</li>
                    <li>Ouça a IA responder também em tempo real</li>
                    <li>Você pode interromper a IA a qualquer momento falando</li>
                    <li>Use os botões para controlar microfone e áudio</li>
                  </ol>
                  <p className="mt-3 text-xs text-muted-foreground">
                    💡 Esta é uma conversa bidirecional real - sem gravação, processamento instantâneo!
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            🎙️ Conversação em tempo real com streaming bidirecional
          </p>
          <p className="mt-1">
            Tecnologia: Gemini Live API + WebRTC Audio Processing
          </p>
        </div>
      </div>
    </div>
  );
}

