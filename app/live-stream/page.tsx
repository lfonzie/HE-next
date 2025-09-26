"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Camera,
  CameraOff
} from "lucide-react";

interface MediaMessage {
  type: 'audio' | 'video' | 'screen' | 'text' | 'error' | 'done' | 'audio_response';
  content?: string;
  mimeType?: string;
  audioData?: string;
}

export default function LiveStreamPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MediaMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("audio");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStreamTimeRef = useRef<number>(0);

  const addDebugInfo = (message: string) => {
    console.log("DEBUG:", message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const addMessage = (message: MediaMessage) => {
    setMessages(prev => [...prev, message]);
  };

  // Play native audio from Gemini TTS
  const playNativeAudio = (audioData: string) => {
    if (!audioData || isMuted) return;

    try {
      // Convert base64 to blob
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // Create audio element
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => {
        setIsSpeaking(true);
        addDebugInfo("🔊 Reproduzindo áudio nativo do Gemini...");
      };

      audio.onended = () => {
        setIsSpeaking(false);
        addDebugInfo("🔊 Áudio nativo concluído");
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (event) => {
        setIsSpeaking(false);
        console.error("Native audio error:", event);
        addDebugInfo("❌ Erro no áudio nativo");
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
    } catch (error: any) {
      console.error("Error playing native audio:", error);
      addDebugInfo(`❌ Erro ao reproduzir áudio nativo: ${error.message}`);
    }
  };

  // Text-to-Speech function with queue (fallback)
  const speakText = (text: string) => {
    if (!text || isMuted) return;

    try {
      // Only cancel if we're not already speaking something important
      if (window.speechSynthesis.speaking && !isSpeaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.9;

      utterance.onstart = () => {
        setIsSpeaking(true);
        addDebugInfo(`🔊 Falando: ${text.substring(0, 50)}...`);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        addDebugInfo("🔊 Fala concluída");
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error("Speech synthesis error:", event);
        addDebugInfo(`❌ Erro na fala: ${event.error}`);
      };

      // Add a small delay to prevent rapid interruptions
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error: any) {
      console.error("Error with speech synthesis:", error);
      addDebugInfo(`❌ Erro na síntese de voz: ${error.message}`);
    }
  };

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      addDebugInfo("AudioContext inicializado");
    }
  };

  // Convert base64 audio to WAV buffer
  const convertToWav = (rawData: string[], mimeType: string) => {
    const options = parseMimeType(mimeType);
    const dataLength = rawData.reduce((a, b) => a + b.length, 0);
    const wavHeader = createWavHeader(dataLength, options);
    
    // Convert base64 strings to Uint8Array for browser compatibility
    const audioData = new Uint8Array(dataLength);
    let offset = 0;
    for (const data of rawData) {
      const decoded = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      audioData.set(decoded, offset);
      offset += decoded.length;
    }

    // Combine header and audio data
    const result = new Uint8Array(wavHeader.length + audioData.length);
    result.set(wavHeader, 0);
    result.set(audioData, wavHeader.length);
    
    return result;
  };

  const parseMimeType = (mimeType: string) => {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options: any = {
      numChannels: 1,
      bitsPerSample: 16,
      sampleRate: 16000,
    };

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map(s => s.trim());
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options;
  };

  const createWavHeader = (dataLength: number, options: any) => {
    const { numChannels, sampleRate, bitsPerSample } = options;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = new Uint8Array(44);

    // Helper function to write little-endian values
    const writeUInt32LE = (value: number, offset: number) => {
      buffer[offset] = value & 0xff;
      buffer[offset + 1] = (value >> 8) & 0xff;
      buffer[offset + 2] = (value >> 16) & 0xff;
      buffer[offset + 3] = (value >> 24) & 0xff;
    };

    const writeUInt16LE = (value: number, offset: number) => {
      buffer[offset] = value & 0xff;
      buffer[offset + 1] = (value >> 8) & 0xff;
    };

    const writeString = (str: string, offset: number) => {
      for (let i = 0; i < str.length; i++) {
        buffer[offset + i] = str.charCodeAt(i);
      }
    };

    writeString('RIFF', 0);
    writeUInt32LE(36 + dataLength, 4);
    writeString('WAVE', 8);
    writeString('fmt ', 12);
    writeUInt32LE(16, 16);
    writeUInt16LE(1, 20);
    writeUInt16LE(numChannels, 22);
    writeUInt32LE(sampleRate, 24);
    writeUInt32LE(byteRate, 28);
    writeUInt16LE(blockAlign, 32);
    writeUInt16LE(bitsPerSample, 34);
    writeString('data', 36);
    writeUInt32LE(dataLength, 40);

    return buffer;
  };

  // Note: Audio playback removed due to compatibility issues
  // The current implementation focuses on text-based conversation

  const playNextAudio = async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) {
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const audioBuffer = audioQueueRef.current.shift();
    if (!audioBuffer || !audioContextRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      // Play next audio if available
      if (audioQueueRef.current.length > 0) {
        setTimeout(() => playNextAudio(), 100);
      }
    };

    source.start();
    addDebugInfo("Reproduzindo áudio recebido");
  };

  // Start auto streaming
  const startAutoStreaming = async () => {
    try {
      setError(null);
      setIsAutoStreaming(true);
      addDebugInfo("Iniciando streaming automático...");

      // Start streaming interval
      streamingIntervalRef.current = setInterval(async () => {
        await captureAndSendCurrentMedia();
      }, 5000); // Send every 5 seconds to reduce spam

      addDebugInfo("Streaming automático iniciado");

    } catch (error: any) {
      console.error("Error starting auto streaming:", error);
      setError(`Erro ao iniciar streaming: ${error.message}`);
      addDebugInfo(`Erro: ${error.message}`);
    }
  };

  // Stop auto streaming
  const stopAutoStreaming = () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsAutoStreaming(false);
    addDebugInfo("Streaming automático parado");
  };

  // Capture and send current media based on active tab
  const captureAndSendCurrentMedia = async () => {
    try {
      const currentTime = Date.now();
      if (currentTime - lastStreamTimeRef.current < 4000) {
        return; // Throttle to prevent too frequent requests
      }
      lastStreamTimeRef.current = currentTime;

      switch (activeTab) {
        case 'audio':
          await captureAndSendAudio();
          break;
        case 'video':
          await captureAndSendVideo();
          break;
        case 'screen':
          await captureAndSendScreen();
          break;
        default:
          break;
      }
    } catch (error: any) {
      console.error("Error capturing media:", error);
      addDebugInfo(`Erro na captura: ${error.message}`);
    }
  };

  // Capture and send audio
  const captureAndSendAudio = async () => {
    if (!streamRef.current) {
      // Start audio stream if not already started
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        }
      });
      streamRef.current = stream;
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'audio/webm;codecs=opus'
    });

    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await sendMediaToAPI(audioBlob, 'audio', 'audio/webm');
      }
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 2000); // Record for 2 seconds
  };

  // Capture and send video frame
  const captureAndSendVideo = async () => {
    if (!streamRef.current) {
      // Start video stream if not already started
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }

    // Capture frame from video element
    if (localVideoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = localVideoRef.current.videoWidth;
        canvas.height = localVideoRef.current.videoHeight;
        ctx.drawImage(localVideoRef.current, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            await sendMediaToAPI(blob, 'video', 'image/jpeg');
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // Capture and send screen frame
  const captureAndSendScreen = async () => {
    if (!screenStreamRef.current) {
      // Start screen stream if not already started
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      screenStreamRef.current = screenStream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // Handle screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        addDebugInfo("Compartilhamento de tela encerrado pelo usuário");
        setIsScreenSharing(false);
        if (activeTab === 'screen') {
          stopAutoStreaming();
        }
      };
    }

    // Capture frame from screen stream
    if (localVideoRef.current && screenStreamRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = localVideoRef.current.videoWidth;
        canvas.height = localVideoRef.current.videoHeight;
        ctx.drawImage(localVideoRef.current, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            await sendMediaToAPI(blob, 'screen', 'image/jpeg');
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // Start recording audio (legacy function for manual mode)
  const startRecording = async () => {
    try {
      setError(null);
      addDebugInfo("Iniciando gravação manual de áudio...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        }
      });

      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await sendMediaToAPI(audioBlob, 'audio', 'audio/webm');
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      addDebugInfo("Gravação manual de áudio iniciada");

    } catch (error: any) {
      console.error("Error starting recording:", error);
      setError(`Erro ao iniciar gravação: ${error.message}`);
      addDebugInfo(`Erro: ${error.message}`);
    }
  };

  // Start video capture
  const startVideoCapture = async () => {
    try {
      setError(null);
      addDebugInfo("Iniciando captura de vídeo...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        addDebugInfo("Vídeo local configurado");
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;

      const videoChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        await sendMediaToAPI(videoBlob, 'video', 'video/webm');
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsVideoEnabled(true);
      addDebugInfo("Captura de vídeo iniciada");

    } catch (error: any) {
      console.error("Error starting video capture:", error);
      setError(`Erro ao iniciar captura de vídeo: ${error.message}`);
      addDebugInfo(`Erro: ${error.message}`);
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      setError(null);
      addDebugInfo("Iniciando compartilhamento de tela...");

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      screenStreamRef.current = screenStream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
        addDebugInfo("Tela compartilhada configurada");
      }

      const mediaRecorder = new MediaRecorder(screenStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;

      const screenChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          screenChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const screenBlob = new Blob(screenChunks, { type: 'video/webm' });
        await sendMediaToAPI(screenBlob, 'screen', 'video/webm');
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsScreenSharing(true);
      addDebugInfo("Compartilhamento de tela iniciado");

      // Handle screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        addDebugInfo("Compartilhamento de tela encerrado pelo usuário");
        setIsScreenSharing(false);
        setIsRecording(false);
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      };

    } catch (error: any) {
      console.error("Error starting screen share:", error);
      setError(`Erro ao iniciar compartilhamento de tela: ${error.message}`);
      addDebugInfo(`Erro: ${error.message}`);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      addDebugInfo("Gravação parada");
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Send media to API
  const sendMediaToAPI = async (mediaBlob: Blob, type: string, mimeType: string) => {
    try {
      addDebugInfo(`Enviando ${type} para API...`);

      // Convert blob to base64
      const arrayBuffer = await mediaBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Data = btoa(String.fromCharCode(...uint8Array));

      const response = await fetch('/api/live-stream/gemini-25-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data: base64Data,
          mimeType,
          context: messages.slice(-3).map(m => m.content).join(' ')
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamMessage(data);
            } catch (e) {
              console.error("Error parsing stream data:", e);
            }
          }
        }
      }

    } catch (error: any) {
      console.error(`Error sending ${type} to API:`, error);
      setError(`Erro ao enviar ${type}: ${error.message}`);
      addDebugInfo(`Erro API: ${error.message}`);
    }
  };

  // Handle stream messages
  const handleStreamMessage = (data: MediaMessage) => {
    addMessage(data);

    if (data.type === 'text' && data.content) {
      addDebugInfo(`Texto recebido: ${data.content}`);
      
      // Only speak if it's not a processing message and has meaningful content
      if (!data.content.includes('Processando') && 
          !data.content.includes('...') && 
          data.content.length > 3) {
        speakText(data.content);
      }
    } else if (data.type === 'audio_response' && data.content) {
      addDebugInfo(`Resposta de áudio: ${data.content}`);
      
      // Use native audio if available, otherwise fallback to TTS
      if (data.audioData) {
        playNativeAudio(data.audioData);
      } else {
        speakText(data.content);
      }
    } else if (data.type === 'error') {
      setError(data.content || 'Erro desconhecido');
      addDebugInfo(`Erro: ${data.content}`);
    }
  };

  // Send text message
  const sendTextMessage = async () => {
    if (!inputText.trim()) return;

    try {
      addDebugInfo(`Enviando texto: ${inputText}`);
      
      const response = await fetch('/api/live-stream/gemini-25-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text',
          data: inputText,
          context: messages.slice(-3).map(m => m.content).join(' ')
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamMessage(data);
            } catch (e) {
              console.error("Error parsing stream data:", e);
            }
          }
        }
      }

      setInputText("");
    } catch (error: any) {
      console.error("Error sending text message:", error);
      setError(`Erro ao enviar texto: ${error.message}`);
      addDebugInfo(`Erro texto: ${error.message}`);
    }
  };

  // Connect to live stream
  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    addDebugInfo("Conectando ao live stream...");

    try {
      const response = await fetch('/api/live-stream/connect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsConnected(true);
      addDebugInfo("Conectado com sucesso!");
      addMessage({ type: 'text', content: 'Conectado ao Gemini Live Stream' });

    } catch (error: any) {
      console.error("Error connecting:", error);
      setError(`Erro ao conectar: ${error.message}`);
      addDebugInfo(`Erro conexão: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect
  const disconnect = () => {
    setIsConnected(false);
    setIsRecording(false);
    setIsPlaying(false);
    setIsVideoEnabled(false);
    setIsScreenSharing(false);
    setIsAutoStreaming(false);
    setIsSpeaking(false);
    setMessages([]);
    setError(null);
    addDebugInfo("Desconectado");

    // Stop auto streaming
    stopAutoStreaming();

    // Stop speech synthesis
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Gemini Chat IA
          </h1>
          <p className="text-muted-foreground">
            Chat de IA com respostas por áudio usando Gemini 2.5 Flash TTS - você fala, a IA responde por áudio nativo
          </p>
        </div>

        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Chat de IA com Respostas por Áudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Conectado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Desconectado
                  </Badge>
                )}
                
                {isRecording && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Mic className="h-3 w-3" />
                    Gravando
                  </Badge>
                )}
                
                {isVideoEnabled && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    Vídeo
                  </Badge>
                )}
                
                {isScreenSharing && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    Tela
                  </Badge>
                )}
                
                {isAutoStreaming && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Auto Stream
                  </Badge>
                )}
                
                {isSpeaking && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    Falando
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {!isConnected ? (
                  <Button
                    onClick={connect}
                    disabled={isConnecting}
                    className="flex items-center gap-2"
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isConnecting ? "Conectando..." : "Conectar"}
                  </Button>
                ) : (
                  <Button
                    onClick={disconnect}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Desconectar
                  </Button>
                )}
              </div>
            </div>

            {/* Media Tabs */}
            {isConnected && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="audio" className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Áudio
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Vídeo
                  </TabsTrigger>
                  <TabsTrigger value="screen" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Tela
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Texto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="audio" className="space-y-4">
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={isAutoStreaming ? stopAutoStreaming : startAutoStreaming}
                      variant={isAutoStreaming ? "destructive" : "default"}
                      className="flex items-center gap-2"
                    >
                      {isAutoStreaming ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isAutoStreaming ? "Parar Auto Stream" : "Iniciar Auto Stream"}
                    </Button>

                    <Button
                      onClick={() => setIsMuted(!isMuted)}
                      variant={isMuted ? "destructive" : "outline"}
                      className="flex items-center gap-2"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      {isMuted ? "Desmutar" : "Mutar"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Streaming automático de áudio a cada 5 segundos
                  </p>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={isAutoStreaming ? stopAutoStreaming : startAutoStreaming}
                      variant={isAutoStreaming ? "destructive" : "default"}
                      className="flex items-center gap-2"
                    >
                      {isAutoStreaming ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isAutoStreaming ? "Parar Auto Stream" : "Iniciar Auto Stream"}
                    </Button>

                    <Button
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      variant={isVideoEnabled ? "default" : "outline"}
                      className="flex items-center gap-2"
                    >
                      {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      {isVideoEnabled ? "Vídeo Ativo" : "Vídeo Inativo"}
                    </Button>
                  </div>
                  
                  {isVideoEnabled && (
                    <div className="relative">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-primary/20"
                      />
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Streaming automático de frames de vídeo a cada 5 segundos
                  </p>
                </TabsContent>

                <TabsContent value="screen" className="space-y-4">
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={isAutoStreaming ? stopAutoStreaming : startAutoStreaming}
                      variant={isAutoStreaming ? "destructive" : "default"}
                      className="flex items-center gap-2"
                    >
                      {isAutoStreaming ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isAutoStreaming ? "Parar Auto Stream" : "Iniciar Auto Stream"}
                    </Button>
                  </div>
                  
                  {isScreenSharing && (
                    <div className="relative">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-primary/20"
                      />
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Streaming automático de frames da tela a cada 5 segundos
                  </p>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enviar Mensagem de Texto</label>
                    <div className="flex gap-2">
                      <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                      />
                      <Button
                        onClick={sendTextMessage}
                        disabled={!inputText.trim()}
                        size="icon"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Digite mensagens de texto para conversar com a IA
                  </p>
                </TabsContent>
              </Tabs>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Mensagens</h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {messages.map((message, index) => (
                    <div key={index} className="p-2 rounded bg-muted/50">
                      <Badge variant="outline" className="mb-1">
                        {message.type}
                      </Badge>
                      {message.type === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      {message.type === 'audio' && (
                        <p className="text-sm text-green-600">Áudio recebido e reproduzido</p>
                      )}
                      {message.type === 'error' && (
                        <p className="text-sm text-red-600">{message.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Info */}
            {debugInfo.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Log de Debug
                </h3>
                <div className="bg-muted/50 p-3 rounded-lg max-h-40 overflow-y-auto">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="text-xs font-mono text-muted-foreground">
                      {info}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Como usar:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Clique em "Conectar" para estabelecer conexão com Gemini API</li>
                <li><strong>Áudio:</strong> Clique "Iniciar Auto Stream" - você fala, a IA responde por áudio</li>
                <li><strong>Vídeo:</strong> Clique "Iniciar Auto Stream" - a IA vê o vídeo e relata por áudio</li>
                <li><strong>Tela:</strong> Clique "Iniciar Auto Stream" - a IA vê a tela e relata por áudio</li>
                <li><strong>Texto:</strong> Digite mensagens - a IA responde por áudio</li>
                <li>O streaming automático envia dados a cada 5 segundos</li>
                <li><strong>Todas as respostas são faladas automaticamente</strong></li>
                <li>Use "Mutar" para silenciar as respostas de áudio</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
