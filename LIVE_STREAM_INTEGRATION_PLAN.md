# 🚀 Plano de Integração Live-Audio → Live-Stream

## 📋 Objetivo

Migrar a página `live-stream` atual para usar a arquitetura de streaming nativo da pasta `live-audio`, implementando streaming de áudio em tempo real com latência mínima e visualizações avançadas.

## 🎯 Benefícios da Migração

### Performance
- **Latência reduzida**: De ~3000ms para ~16ms
- **Qualidade superior**: Processamento PCM nativo
- **Eficiência**: Streaming contínuo vs chunks

### Experiência do Usuário
- **Visualização 3D**: Análise de frequência em tempo real
- **Controles intuitivos**: Interface moderna com Web Components
- **Feedback visual**: Reação em tempo real ao áudio

### Arquitetura
- **Modularidade**: Web Components reutilizáveis
- **Manutenibilidade**: Código mais limpo e organizado
- **Escalabilidade**: Base sólida para futuras funcionalidades

## 🏗️ Arquitetura Proposta

### 1. **Componentes Principais**

```
live-stream/
├── components/
│   ├── AudioStreamer.tsx          # Componente principal de streaming
│   ├── AudioVisualizer.tsx        # Visualização 3D do áudio
│   ├── AudioControls.tsx         # Controles de gravação/reprodução
│   └── AudioAnalyser.ts          # Análise de frequência
├── hooks/
│   ├── useAudioStream.ts         # Hook para streaming de áudio
│   ├── useAudioContext.ts       # Hook para contexto de áudio
│   └── useGeminiLive.ts         # Hook para conexão Gemini
├── utils/
│   ├── audioUtils.ts            # Utilitários de áudio
│   ├── pcmConverter.ts          # Conversão PCM
│   └── blobUtils.ts             # Manipulação de blobs
└── types/
    └── audio.ts                 # Tipos TypeScript
```

### 2. **Fluxo de Dados**

```typescript
// Hook principal para streaming
export function useAudioStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Inicialização do contexto de áudio
  const initAudioContext = useCallback(() => {
    const ctx = new AudioContext({ sampleRate: 16000 });
    setAudioContext(ctx);
    return ctx;
  }, []);

  // Conexão com Gemini Live API
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
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
        },
      },
    });
    setSession(session);
  }, []);

  // Início da gravação
  const startRecording = useCallback(async () => {
    if (!audioContext || !session) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const sourceNode = audioContext.createMediaStreamSource(stream);
    
    const processor = audioContext.createScriptProcessor(256, 1, 1);
    processor.onaudioprocess = (event) => {
      const pcmData = event.inputBuffer.getChannelData(0);
      const blob = createBlob(pcmData);
      session.sendRealtimeInput({ media: blob });
    };

    sourceNode.connect(processor);
    processor.connect(audioContext.destination);
    setIsRecording(true);
  }, [audioContext, session]);

  return {
    isConnected,
    isRecording,
    audioContext,
    initAudioContext,
    connectToGemini,
    startRecording,
    stopRecording: () => setIsRecording(false),
  };
}
```

## 🔧 Implementação Passo a Passo

### Fase 1: Preparação da Base
1. **Criar estrutura de componentes**
   - Implementar `AudioStreamer` principal
   - Criar hooks personalizados
   - Configurar tipos TypeScript

2. **Configurar dependências**
   - Adicionar `@google/genai` para Gemini Live API
   - Configurar `three.js` para visualização 3D
   - Instalar dependências de áudio

### Fase 2: Migração do Streaming
1. **Implementar streaming nativo**
   - Substituir MediaRecorder por ScriptProcessor
   - Implementar conversão PCM
   - Configurar conexão direta com Gemini

2. **Migrar controles**
   - Adaptar interface atual
   - Implementar controles de tempo real
   - Adicionar feedback visual

### Fase 3: Visualização Avançada
1. **Implementar análise de frequência**
   - Criar componente `AudioAnalyser`
   - Implementar visualização 3D
   - Adicionar efeitos visuais

2. **Otimizar performance**
   - Implementar buffer management
   - Otimizar renderização 3D
   - Adicionar debouncing

### Fase 4: Integração e Testes
1. **Integrar com sistema atual**
   - Manter compatibilidade com APIs existentes
   - Implementar fallbacks
   - Testar em diferentes navegadores

2. **Testes e otimização**
   - Testes de latência
   - Testes de qualidade de áudio
   - Otimização de performance

## 📊 Comparação de Implementações

| Aspecto | Atual | Proposta |
|---------|-------|----------|
| **Latência** | ~3000ms | ~16ms |
| **Qualidade** | WebM comprimido | PCM nativo |
| **Visualização** | Básica | 3D avançada |
| **Arquitetura** | REST API | WebSocket direto |
| **Manutenibilidade** | Média | Alta |
| **Performance** | Limitada | Otimizada |

## 🎨 Interface Proposta

### Layout Principal
```
┌─────────────────────────────────────────┐
│  🎤 Live Stream - Audio em Tempo Real    │
├─────────────────────────────────────────┤
│                                         │
│  [Visualização 3D do Áudio]             │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │  🎵 Análise de Frequência           │ │
│  │  ████████████████████████████████  │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  [🔴] [⏸️] [⏹️] [🔊] [🎛️]              │
│                                         │
│  Status: Conectado | Latência: 16ms     │
└─────────────────────────────────────────┘
```

### Controles Avançados
- **Botão de gravação**: Início/parada com feedback visual
- **Controle de volume**: Slider para entrada e saída
- **Seletor de voz**: Diferentes vozes do Gemini
- **Configurações**: Sample rate, buffer size, etc.

## 🚀 Cronograma de Implementação

### Semana 1: Preparação
- [ ] Criar estrutura de componentes
- [ ] Configurar dependências
- [ ] Implementar hooks básicos

### Semana 2: Streaming Nativo
- [ ] Implementar conexão Gemini Live
- [ ] Migrar processamento de áudio
- [ ] Testar streaming básico

### Semana 3: Visualização
- [ ] Implementar análise de frequência
- [ ] Criar visualização 3D
- [ ] Adicionar efeitos visuais

### Semana 4: Integração
- [ ] Integrar com sistema atual
- [ ] Testes de performance
- [ ] Otimização final

## 🎯 Métricas de Sucesso

### Performance
- **Latência**: < 50ms end-to-end
- **Qualidade**: PCM 16kHz sem compressão
- **Estabilidade**: 99% uptime

### Experiência
- **Usabilidade**: Interface intuitiva
- **Visualização**: Feedback visual em tempo real
- **Responsividade**: Controles responsivos

### Técnico
- **Manutenibilidade**: Código modular
- **Escalabilidade**: Base para futuras funcionalidades
- **Compatibilidade**: Suporte a navegadores modernos

## 🔍 Considerações Técnicas

### Limitações Atuais
- **Navegadores**: Requer suporte a Web Audio API
- **HTTPS**: Necessário para acesso ao microfone
- **Permissões**: Usuário deve autorizar microfone

### Soluções Propostas
- **Fallbacks**: Implementar fallback para navegadores antigos
- **Progressive Enhancement**: Funcionalidades graduais
- **Error Handling**: Tratamento robusto de erros

## 🎉 Conclusão

A migração da página `live-stream` para usar a arquitetura da pasta `live-audio` resultará em:

1. **Performance superior**: Latência mínima e qualidade nativa
2. **Experiência imersiva**: Visualização 3D reativa ao áudio
3. **Arquitetura moderna**: Componentes modulares e reutilizáveis
4. **Base sólida**: Fundação para futuras funcionalidades avançadas

Esta implementação posicionará o sistema como uma das melhores soluções de streaming de áudio em tempo real disponíveis.

