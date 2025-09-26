# 🎤 Gemini 2.5 Flash Native Audio

## Visão Geral

O **Gemini 2.5 Flash Native Audio** é uma tecnologia experimental da Google que oferece síntese de voz de alta qualidade com streaming em tempo real. Esta implementação permite gerar áudio muito mais natural e expressivo que os sistemas TTS tradicionais.

## ✨ Características

- **🎯 Qualidade Superior**: Áudio gerado com tecnologia neural avançada
- **⚡ Streaming em Tempo Real**: Geração de áudio sem espera por arquivos completos
- **🎭 Múltiplas Vozes**: 6 vozes diferentes disponíveis
- **🔄 Integração Nativa**: Usa a API oficial do Google Gemini Live

## 🚀 Como Usar

### 1. Configuração da API

```bash
# Adicione ao .env.local
GEMINI_API_KEY=sua_chave_gemini_aqui
# ou
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_gemini_aqui
```

### 2. Obter Chave da API

1. Acesse [Google AI Studio](https://ai.google.dev/)
2. Faça login com sua conta Google
3. Crie uma nova chave de API
4. Adicione ao arquivo `.env.local`

### 3. Usar o Componente

```tsx
import GeminiNativeAudioPlayer from '@/components/audio/GeminiNativeAudioPlayer'

function MyComponent() {
  return (
    <GeminiNativeAudioPlayer
      text="Seu texto aqui"
      voice="Zephyr"
      autoPlay={false}
      onAudioStart={() => console.log('Áudio iniciado')}
      onAudioEnd={() => console.log('Áudio finalizado')}
    />
  )
}
```

### 4. Usar a API Diretamente

```javascript
const response = await fetch('/api/tts/gemini-native', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Seu texto aqui',
    voice: 'Zephyr',
    speed: 1.0,
    pitch: 0.0
  })
})

// Processar stream de áudio
const reader = response.body.getReader()
// ... processar chunks de áudio
```

## 🎭 Vozes Disponíveis

| Voz | Descrição | Características |
|-----|-----------|-----------------|
| **Zephyr** | Neutra e equilibrada | Voz padrão, boa para conteúdo geral |
| **Nova** | Feminina jovem e energética | Ideal para conteúdo dinâmico |
| **Echo** | Masculina profunda | Autoritária e confiável |
| **Fable** | Feminina expressiva | Envolvente e narrativa |
| **Onyx** | Masculina autoritária | Profissional e séria |
| **Shimmer** | Feminina suave | Delicada e acolhedora |

## 📊 Comparação de Tecnologias

| Tecnologia | Qualidade | Velocidade | Streaming | Tamanho |
|------------|-----------|------------|-----------|---------|
| **Google Cloud TTS** | Boa | Rápida | ❌ | ~45-90KB |
| **OpenAI TTS** | Muito Boa | Rápida | ❌ | ~20-50KB |
| **Gemini Native Audio** | Excelente | Muito Rápida | ✅ | Variável |

## 🛠️ Páginas de Demonstração

- **`/gemini-native-audio`** - Demonstração completa com todas as vozes
- **`/test-voices`** - Comparação entre diferentes tecnologias TTS
- **`/clear-cache`** - Limpeza de cache e testes

## 🧪 Testando a Implementação

```bash
# Teste via script
node test-gemini-native-audio.js

# Teste via página web
http://localhost:3000/gemini-native-audio
```

## ⚠️ Limitações e Considerações

- **Experimental**: Esta é uma tecnologia em preview
- **API Key**: Requer chave válida do Gemini
- **Custo**: Pode ter custos associados ao uso da API
- **Disponibilidade**: Pode não estar disponível em todas as regiões

## 🔧 Configuração Avançada

### Modelo Utilizado
```typescript
const model = 'models/gemini-2.5-flash-native-audio-preview-09-2025'
```

### Configuração de Resposta
```typescript
const config = {
  responseModalities: [Modality.AUDIO],
  mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: 'Zephyr', // ou outra voz
      }
    }
  }
}
```

## 📈 Benefícios

1. **Qualidade Superior**: Áudio muito mais natural que TTS tradicional
2. **Streaming**: Reprodução durante geração, sem espera
3. **Flexibilidade**: Múltiplas vozes e configurações
4. **Integração**: Funciona perfeitamente com React/Next.js
5. **Performance**: Otimizado para aplicações web modernas

## 🎯 Casos de Uso Ideais

- **Educação**: Conteúdo educacional com áudio natural
- **Acessibilidade**: Melhorar acesso para usuários com deficiência visual
- **Podcasts**: Geração de conteúdo de áudio automatizado
- **Assistentes Virtuais**: Respostas de voz mais naturais
- **Aplicações Multimídia**: Integração de áudio em tempo real

## 🔮 Futuro

Esta tecnologia representa o futuro da síntese de voz, oferecendo:
- Qualidade de áudio indistinguível de vozes humanas
- Streaming em tempo real
- Personalização avançada de vozes
- Integração nativa com modelos de IA

---

**Nota**: Esta implementação usa a API experimental do Gemini 2.5 Flash Native Audio. Consulte a documentação oficial da Google para atualizações e mudanças na API.
