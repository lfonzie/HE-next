# 🎤 Aplicação da Estrutura Live-Audio nas Aulas - Plano de Implementação

## 📋 Análise da Implementação Atual

### **Sistema TTS Atual nas Aulas**
- **Componente**: `BufferTTSPlayer` em `AnimationSlide`
- **Funcionamento**: Gera áudio completo → Buffer → Reproduz
- **Latência**: ~2-5 segundos para geração + reprodução
- **Qualidade**: Boa, mas não em tempo real
- **API**: Usa endpoints REST com fallback

### **Limitações Identificadas**
1. **Latência alta**: Usuário espera geração completa do áudio
2. **Sem streaming**: Não há reprodução durante geração
3. **Sem visualização**: Não há feedback visual do áudio
4. **Arquitetura tradicional**: REST API em vez de WebSocket direto

## 🚀 Plano de Migração para Streaming Nativo

### **Fase 1: Componente de Streaming Baseado na Live-Audio**

#### 1.1 Criar `LiveAudioStreamPlayer`
```typescript
// components/audio/LiveAudioStreamPlayer.tsx
interface LiveAudioStreamPlayerProps {
  text: string;
  voice?: string;
  autoPlay?: boolean;
  showVisualization?: boolean;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onError?: (error: string) => void;
}

export default function LiveAudioStreamPlayer({
  text,
  voice = 'Orus',
  autoPlay = false,
  showVisualization = true,
  onAudioStart,
  onAudioEnd,
  onError
}: LiveAudioStreamPlayerProps) {
  // Implementação baseada na live-audio
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Conexão direta com Gemini Live API
  const connectToGemini = useCallback(async () => {
    const client = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    const session = await client.live.connect({
      model: 'gemini-2.5-flash-preview-native-audio-dialog',
      callbacks: {
        onopen: () => setIsConnected(true),
        onmessage: handleAudioResponse,
        onerror: handleError,
        onclose: () => setIsConnected(false),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
        },
      },
    });
    setSession(session);
  }, [voice]);

  // Streaming de texto para áudio
  const streamTextToAudio = useCallback(async () => {
    if (!session || !text) return;
    
    setIsStreaming(true);
    onAudioStart?.();
    
    // Enviar texto para Gemini Live API
    await session.sendRealtimeInput({
      text: text
    });
  }, [session, text, onAudioStart]);

  return (
    <div className="live-audio-stream-player">
      {/* Controles de conexão e streaming */}
      {/* Visualização de áudio em tempo real */}
      {/* Status e progresso */}
    </div>
  );
}
```

#### 1.2 Implementar Visualização de Áudio
```typescript
// components/audio/AudioVisualizer.tsx
interface AudioVisualizerProps {
  audioContext: AudioContext;
  inputNode: AudioNode;
  outputNode: AudioNode;
}

export default function AudioVisualizer({ audioContext, inputNode, outputNode }: AudioVisualizerProps) {
  const [inputAnalyser, setInputAnalyser] = useState<AnalyserNode | null>(null);
  const [outputAnalyser, setOutputAnalyser] = useState<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (audioContext && inputNode && outputNode) {
      // Criar analisadores de frequência
      const inputAnalyser = audioContext.createAnalyser();
      const outputAnalyser = audioContext.createAnalyser();
      
      inputAnalyser.fftSize = 256;
      outputAnalyser.fftSize = 256;
      
      inputNode.connect(inputAnalyser);
      outputNode.connect(outputAnalyser);
      
      setInputAnalyser(inputAnalyser);
      setOutputAnalyser(outputAnalyser);
    }
  }, [audioContext, inputNode, outputNode]);

  // Renderizar visualização em tempo real
  const renderVisualization = useCallback(() => {
    if (!canvasRef.current || !inputAnalyser || !outputAnalyser) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const inputData = new Uint8Array(inputAnalyser.frequencyBinCount);
    const outputData = new Uint8Array(outputAnalyser.frequencyBinCount);
    
    inputAnalyser.getByteFrequencyData(inputData);
    outputAnalyser.getByteFrequencyData(outputData);
    
    // Renderizar visualização
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar barras de frequência
    const barWidth = canvas.width / inputData.length;
    for (let i = 0; i < inputData.length; i++) {
      const barHeight = (inputData[i] / 255) * canvas.height;
      ctx.fillStyle = `hsl(${i * 2}, 70%, 50%)`;
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    }
    
    requestAnimationFrame(renderVisualization);
  }, [inputAnalyser, outputAnalyser]);

  useEffect(() => {
    const interval = setInterval(renderVisualization, 1000 / 60); // 60 FPS
    return () => clearInterval(interval);
  }, [renderVisualization]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="w-full h-32 bg-gray-900 rounded-lg"
    />
  );
}
```

### **Fase 2: Integração no AnimationSlide**

#### 2.1 Substituir BufferTTSPlayer
```typescript
// components/interactive/AnimationSlide.tsx
import LiveAudioStreamPlayer from '@/components/audio/LiveAudioStreamPlayer';

export default function AnimationSlide({
  title,
  content,
  // ... outros props
}: AnimationSlideProps) {
  return (
    <div className="animation-slide">
      {/* Conteúdo existente */}
      
      {/* Substituir BufferTTSPlayer por LiveAudioStreamPlayer */}
      {content && (
        <div className="mb-6">
          <LiveAudioStreamPlayer
            text={content}
            voice="Orus"
            autoPlay={false}
            showVisualization={true}
            onAudioStart={() => console.log('Áudio iniciado')}
            onAudioEnd={() => console.log('Áudio finalizado')}
            onError={(error) => console.error('Erro de áudio:', error)}
          />
        </div>
      )}
      
      {/* Resto do conteúdo */}
    </div>
  );
}
```

#### 2.2 Adicionar Configurações de Streaming
```typescript
// Adicionar props para configuração de streaming
interface AnimationSlideProps {
  // ... props existentes
  streamingConfig?: {
    enabled: boolean;
    voice: string;
    autoPlay: boolean;
    showVisualization: boolean;
    latency: 'low' | 'medium' | 'high';
  };
}

// Usar configuração de streaming
const defaultStreamingConfig = {
  enabled: true,
  voice: 'Orus',
  autoPlay: false,
  showVisualization: true,
  latency: 'low'
};
```

### **Fase 3: Conexão Direta com Gemini Live API**

#### 3.1 Criar Hook para Gemini Live
```typescript
// hooks/useGeminiLiveStream.ts
export function useGeminiLiveStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      const client = new GoogleGenAI({ 
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY 
      });
      
      const session = await client.live.connect({
        model: 'gemini-2.5-flash-preview-native-audio-dialog',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setError(null);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
            if (audio) {
              // Processar áudio recebido
              await handleAudioResponse(audio);
            }
          },
          onerror: (e: ErrorEvent) => {
            setError(e.message);
            setIsConnected(false);
          },
          onclose: (e: CloseEvent) => {
            setIsConnected(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
          },
        },
      });
      
      setSession(session);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }, []);

  const streamText = useCallback(async (text: string) => {
    if (!session || !text) return;
    
    setIsStreaming(true);
    await session.sendRealtimeInput({ text });
  }, [session]);

  const disconnect = useCallback(() => {
    if (session) {
      session.close();
      setSession(null);
      setIsConnected(false);
    }
  }, [session]);

  return {
    isConnected,
    session,
    isStreaming,
    error,
    connect,
    streamText,
    disconnect
  };
}
```

#### 3.2 Implementar Processamento de Áudio
```typescript
// utils/audio/liveAudioProcessor.ts
export class LiveAudioProcessor {
  private audioContext: AudioContext;
  private outputNode: AudioNode;
  private nextStartTime: number = 0;
  private sources = new Set<AudioBufferSourceNode>();

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.outputNode = this.audioContext.createGain();
    this.outputNode.connect(this.audioContext.destination);
  }

  async processAudioResponse(audioData: string): Promise<void> {
    try {
      // Decodificar áudio recebido
      const audioBuffer = await this.decodeAudioData(audioData);
      
      // Criar fonte de áudio
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);
      
      // Configurar timing
      this.nextStartTime = Math.max(
        this.nextStartTime,
        this.audioContext.currentTime
      );
      
      // Reproduzir áudio
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
      
      // Limpar fonte quando terminar
      source.addEventListener('ended', () => {
        this.sources.delete(source);
      });
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      throw error;
    }
  }

  private async decodeAudioData(audioData: string): Promise<AudioBuffer> {
    // Implementar decodificação baseada na live-audio
    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return await this.audioContext.decodeAudioData(bytes.buffer);
  }

  stopAllAudio(): void {
    this.sources.forEach(source => {
      source.stop();
    });
    this.sources.clear();
    this.nextStartTime = 0;
  }
}
```

### **Fase 4: Visualização Avançada**

#### 4.1 Implementar Visualização 3D (Opcional)
```typescript
// components/audio/AudioVisualization3D.tsx
import * as THREE from 'three';

export default function AudioVisualization3D({ 
  audioContext, 
  inputNode, 
  outputNode 
}: {
  audioContext: AudioContext;
  inputNode: AudioNode;
  outputNode: AudioNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Configurar Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 400 / 200, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    
    // Configurar analisador de áudio
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    outputNode.connect(analyser);
    
    // Criar geometria reativa
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    
    camera.position.z = 5;
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    analyserRef.current = analyser;
    
    // Loop de renderização
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Animar esfera baseada no áudio
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        sphere.scale.setScalar(1 + average / 255);
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      renderer.dispose();
    };
  }, [audioContext, outputNode]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="w-full h-32 bg-gray-900 rounded-lg"
    />
  );
}
```

### **Fase 5: Integração Completa**

#### 5.1 Atualizar DynamicStage
```typescript
// components/interactive/DynamicStage.tsx
import LiveAudioStreamPlayer from '@/components/audio/LiveAudioStreamPlayer';

export default function DynamicStage({ stage, ...props }: DynamicStageProps) {
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  
  return (
    <div className="dynamic-stage">
      {/* Conteúdo existente */}
      
      {/* Adicionar controles de streaming */}
      <div className="streaming-controls mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={streamingEnabled}
            onChange={(e) => setStreamingEnabled(e.target.checked)}
          />
          <span>Streaming de áudio em tempo real</span>
        </label>
      </div>
      
      {/* Renderizar atividade com streaming */}
      {renderActivity()}
    </div>
  );
}
```

#### 5.2 Configurações Globais
```typescript
// lib/streaming-config.ts
export interface StreamingConfig {
  enabled: boolean;
  voice: string;
  autoPlay: boolean;
  showVisualization: boolean;
  latency: 'low' | 'medium' | 'high';
  fallbackToTTS: boolean;
}

export const defaultStreamingConfig: StreamingConfig = {
  enabled: true,
  voice: 'Orus',
  autoPlay: false,
  showVisualization: true,
  latency: 'low',
  fallbackToTTS: true
};

export function getStreamingConfig(): StreamingConfig {
  if (typeof window === 'undefined') return defaultStreamingConfig;
  
  const saved = localStorage.getItem('streaming-config');
  return saved ? { ...defaultStreamingConfig, ...JSON.parse(saved) } : defaultStreamingConfig;
}

export function saveStreamingConfig(config: StreamingConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('streaming-config', JSON.stringify(config));
}
```

## 🎯 Benefícios da Migração

### **Performance**
- **Latência reduzida**: De ~5s para ~100ms
- **Streaming contínuo**: Reprodução durante geração
- **Qualidade nativa**: PCM sem compressão

### **Experiência do Usuário**
- **Feedback visual**: Visualização em tempo real
- **Controles intuitivos**: Interface moderna
- **Interatividade**: Resposta imediata

### **Arquitetura**
- **Conexão direta**: WebSocket em vez de REST
- **Modularidade**: Componentes reutilizáveis
- **Escalabilidade**: Base para futuras funcionalidades

## 📊 Comparação de Implementações

| Aspecto | Atual (BufferTTS) | Proposta (Live-Audio) |
|---------|-------------------|----------------------|
| **Latência** | ~5 segundos | ~100ms |
| **Streaming** | Não | Sim |
| **Visualização** | Básica | Avançada |
| **API** | REST | WebSocket direto |
| **Qualidade** | Boa | Nativa |
| **Interatividade** | Limitada | Alta |

## 🚀 Cronograma de Implementação

### **Semana 1: Base**
- [ ] Criar `LiveAudioStreamPlayer`
- [ ] Implementar conexão Gemini Live
- [ ] Testes básicos de streaming

### **Semana 2: Integração**
- [ ] Substituir `BufferTTSPlayer` em `AnimationSlide`
- [ ] Implementar visualização de áudio
- [ ] Testes de integração

### **Semana 3: Visualização**
- [ ] Adicionar visualização 3D (opcional)
- [ ] Implementar controles avançados
- [ ] Otimizar performance

### **Semana 4: Finalização**
- [ ] Testes completos
- [ ] Documentação
- [ ] Deploy e monitoramento

## 🎉 Conclusão

A aplicação da estrutura de streaming de áudio da `live-audio` nas aulas resultará em:

1. **Experiência imersiva**: Streaming de áudio em tempo real
2. **Performance superior**: Latência mínima e qualidade nativa
3. **Visualização avançada**: Feedback visual do áudio
4. **Arquitetura moderna**: Base sólida para futuras funcionalidades

Esta implementação posicionará o sistema de aulas como uma das melhores soluções de educação com IA disponíveis, oferecendo uma experiência de aprendizado verdadeiramente interativa e envolvente.

