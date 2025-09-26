# 🎥 Chat ao Vivo - Gemini Live API

## 📋 Visão Geral

O módulo **Chat ao Vivo** permite conversas em tempo real com IA usando voz, vídeo e compartilhamento de tela através da **Gemini Live API** do Google. Este módulo convive harmoniosamente com o sistema de chat existente baseado no **Vercel AI SDK**.

## 🏗️ Arquitetura

### Separação de Responsabilidades
- **AI SDK**: Continua responsável pelo chat "texto/multimodal HTTP" (histórico, UI, logs, etc.)
- **Chat ao Vivo**: Usa **Gemini Live API via WebRTC** no cliente + rota server para troca SDP offer/answer
- **WebRTC Direto**: O AI SDK não abstrai WebRTC, então usamos WebRTC diretamente para o Live

### Componentes Implementados

#### 1. **Variáveis de Ambiente** (`env.gemini-live.example`)
```bash
# Chave da API do Google (mesma usada para Gemini)
GOOGLE_API_KEY="your-gemini-api-key-here"

# URL do endpoint do Live API
GEMINI_LIVE_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-live:start"

# Tipo de conteúdo para SDP
GEMINI_LIVE_CONTENT_TYPE="application/sdp"
```

#### 2. **Registry de Módulos** (`lib/modules-live.ts`)
- Novo tipo `'chat-live'` além do `'chat-http'` existente
- Módulo `gemini-live` com suporte a `['audio', 'video']`
- Funções utilitárias para filtrar módulos por tipo

#### 3. **Rota Server** (`app/api/gemini/live/sdp/route.ts`)
- Endpoint `/api/gemini/live/sdp` para troca SDP offer/answer
- Suporte a `application/sdp` (SDP puro) e `application/json`
- Logs detalhados para debugging
- Tratamento de erros robusto

#### 4. **Hook WebRTC** (`hooks/useLiveChat.ts`)
- Interface completa para WebRTC
- Estados de conexão, erro e mídia
- Controles para áudio, vídeo e tela
- Cleanup automático

#### 5. **Página UI** (`app/(dashboard)/chat/live/page.tsx`)
- Interface mínima e funcional
- Controles de conexão (voz, vídeo, tela)
- Controles de mídia em tempo real
- Indicadores de status

## 🚀 Como Usar

### 1. Configuração
1. Copie as variáveis de `env.gemini-live.example` para seu `.env.local`
2. Configure sua `GOOGLE_API_KEY` válida
3. Reinicie o servidor de desenvolvimento

### 2. Acesso
- Navegue para `/chat/live`
- O módulo será automaticamente selecionado como `gemini-live`

### 3. Conexão
- **Conectar (Voz)**: Apenas áudio bidirecional
- **Conectar (Voz + Vídeo)**: Áudio + vídeo da câmera
- **Conectar (Voz + Tela)**: Áudio + compartilhamento de tela

### 4. Controles
- **Microfone**: Liga/desliga áudio de entrada
- **Câmera**: Liga/desliga vídeo de entrada
- **Desconectar**: Encerra a sessão WebRTC

## 🔧 Funcionalidades Técnicas

### WebRTC Implementation
- **ICE Servers**: STUN server do Google
- **Transceivers**: Configuração automática para áudio/vídeo
- **Track Management**: Controle individual de tracks
- **Connection States**: Monitoramento de estados de conexão

### SDP Exchange
- **Offer Creation**: Criação automática de SDP offer
- **Server Proxy**: Rota server faz proxy para Gemini Live API
- **Answer Processing**: Processamento de SDP answer
- **Error Handling**: Tratamento de erros de conexão

### Media Controls
- **Audio Toggle**: Liga/desliga microfone
- **Video Toggle**: Liga/desliga câmera
- **Screen Share**: Compartilhamento de tela
- **Auto-play**: Reprodução automática de áudio recebido

## 🐛 Debugging

### Logs do Console
- `[LiveChat]`: Logs do hook useLiveChat
- `[Gemini Live]`: Logs da rota server
- Estados de conexão WebRTC
- Erros de SDP e mídia

### Verificações de Sanidade
1. **SDP Offer**: Verificar criação de offer no console
2. **Server Response**: POST `/api/gemini/live/sdp` deve retornar 200
3. **Audio Element**: Elemento `#live-audio` deve receber tracks
4. **Connection State**: Estados devem progredir corretamente

## 🔮 Integração Futura

### AI SDK Integration (Opcional)
- **Histórico**: Log de conversas em texto após turnos de áudio
- **Transcrição**: Captura de texto do modelo para histórico
- **Fallback**: Fallback para chat HTTP em caso de erro WebRTC

### Outros Provedores
- **Realtime API**: Suporte futuro para outros provedores
- **WebSocket**: Alternativa ao WebRTC se necessário
- **Hybrid Mode**: Combinação de WebRTC + HTTP streaming

## 📚 Referências

- [AI SDK by Vercel](https://ai-sdk.dev/docs/introduction)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live)
- [WebRTC MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Exemplo React Oficial](https://github.com/google-gemini/live-api-web-console)

## ✅ Status da Implementação

- [x] Variáveis de ambiente configuradas
- [x] Registry de módulos atualizado
- [x] Rota server SDP implementada
- [x] Hook WebRTC funcional
- [x] Página UI criada
- [x] Integração com sistema existente
- [x] Documentação completa

O módulo **Chat ao Vivo** está pronto para uso e integrado ao sistema existente sem afetar o chat tradicional!
