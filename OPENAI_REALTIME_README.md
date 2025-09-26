# OpenAI Realtime API - Implementação Completa

Esta implementação fornece uma integração completa do OpenAI Realtime API com Next.js 15, incluindo WebRTC para baixa latência e fallback WebSocket.

## 🚀 Funcionalidades

- **WebRTC**: Conversação de áudio em tempo real com baixa latência
- **WebSocket Fallback**: Conversação por texto quando WebRTC não está disponível
- **Interface Moderna**: UI responsiva com shadcn/ui
- **Controles de Áudio**: Mute/unmute, detecção de fala
- **Configurações**: Seleção de modelo e voz
- **Tratamento de Erros**: Fallback automático e mensagens de erro claras

## 📁 Estrutura de Arquivos

```
app/
├── api/
│   └── realtime/
│       ├── route.ts              # API WebRTC principal
│       └── websocket/
│           └── route.ts          # API WebSocket fallback
├── realtime/
│   └── page.tsx                 # Página principal do demo
components/
└── realtime/
    └── RealtimeComponents.tsx   # Componentes de UI
hooks/
├── useRealtime.ts               # Hook WebRTC
└── useWebSocket.ts              # Hook WebSocket
```

## 🛠️ Configuração

### 1. Variáveis de Ambiente

Copie o arquivo de exemplo e configure sua API key:

```bash
cp env.realtime.example .env.local
```

Edite `.env.local` e adicione sua OpenAI API key:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Instalação de Dependências

As dependências já estão instaladas no projeto. Se necessário, instale:

```bash
npm install
```

### 3. Executar o Projeto

```bash
npm run dev
```

Acesse `http://localhost:3000/realtime` para ver o demo.

## 🔧 Como Usar

### WebRTC (Recomendado)

1. **Conectar**: Clique em "Conectar" na aba WebRTC
2. **Permitir Microfone**: O navegador solicitará permissão para acessar o microfone
3. **Falar**: Fale naturalmente - a IA detectará quando você parar de falar
4. **Escutar**: A resposta da IA será reproduzida automaticamente
5. **Controles**: Use o botão de microfone para mutar/desmutar

### WebSocket (Fallback)

1. **Conectar**: Clique em "Conectar" na aba WebSocket
2. **Digitar**: Digite sua mensagem no campo de texto
3. **Enviar**: Pressione Enter ou clique no botão de envio
4. **Resposta**: A IA responderá por texto

## 🎛️ Configurações Disponíveis

### Modelos Suportados
- `gpt-4o-realtime` (Recomendado)
- `gpt-4o-mini-realtime`

### Vozes Disponíveis
- `alloy` - Voz neutra e clara
- `echo` - Voz masculina
- `fable` - Voz britânica
- `onyx` - Voz masculina profunda
- `nova` - Voz feminina jovem
- `shimmer` - Voz feminina suave

## 🔌 API Endpoints

### POST `/api/realtime`
Cria uma sessão WebRTC com OpenAI Realtime API.

**Request:**
```json
{
  "clientSdp": "v=0\r\no=- 1234567890 1234567890 IN IP4 127.0.0.1\r\n...",
  "model": "gpt-4o-realtime",
  "voice": "alloy"
}
```

**Response:**
```
Content-Type: application/sdp
X-Session-Id: sess_abc123

v=0
o=- 9876543210 9876543210 IN IP4 127.0.0.1
...
```

### DELETE `/api/realtime`
Fecha uma sessão WebRTC.

**Headers:**
```
X-Session-Id: sess_abc123
```

### POST `/api/realtime/websocket`
Envia mensagens via WebSocket fallback.

**Request:**
```json
{
  "message": "Olá, como você está?",
  "sessionId": "sess_abc123",
  "model": "gpt-4o-realtime"
}
```

**Response:**
```json
{
  "response": "Olá! Estou bem, obrigado por perguntar. Como posso ajudá-lo hoje?",
  "sessionId": "sess_abc123"
}
```

## 🎯 Hooks Disponíveis

### `useRealtime(options)`

Hook para conexão WebRTC com OpenAI Realtime API.

```typescript
const {
  isConnected,
  isConnecting,
  isMuted,
  isSpeaking,
  error,
  sessionId,
  connect,
  disconnect,
  toggleMute,
  sendMessage,
  sendToolCall,
} = useRealtime({
  model: "gpt-4o-realtime",
  voice: "alloy",
  onEvent: (event) => console.log("Event:", event),
  onError: (error) => console.error("Error:", error),
  onConnectionChange: (connected) => console.log("Connected:", connected),
});
```

### `useWebSocket(options)`

Hook para conexão WebSocket fallback.

```typescript
const {
  isConnected,
  isConnecting,
  error,
  sessionId,
  messages,
  connect,
  disconnect,
  sendMessage,
  reconnect,
} = useWebSocket({
  model: "gpt-4o-realtime",
  onEvent: (event) => console.log("Event:", event),
  onError: (error) => console.error("Error:", error),
  onConnectionChange: (connected) => console.log("Connected:", connected),
});
```

## 🛡️ Segurança

- **API Key Protegida**: A API key nunca é exposta no frontend
- **Sessões Ephemerais**: Cada sessão é temporária e segura
- **Validação de Entrada**: Todas as entradas são validadas
- **Rate Limiting**: Implementado nas rotas da API

## 🐛 Solução de Problemas

### WebRTC não funciona
1. Verifique se o navegador suporta WebRTC (Chrome, Edge, Firefox, Safari modernos)
2. Certifique-se de que o microfone está permitido
3. Verifique se não há bloqueadores de popup ou extensões interferindo
4. Teste em modo incógnito

### Erro de conexão
1. Verifique se a API key está configurada corretamente
2. Confirme que a API key tem acesso ao Realtime API
3. Verifique a conexão com a internet
4. Teste o fallback WebSocket

### Áudio não funciona
1. Verifique as permissões do microfone
2. Teste com diferentes navegadores
3. Verifique se o volume está ligado
4. Confirme que não há outros aplicativos usando o microfone

## 📚 Recursos Adicionais

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [WebRTC com Realtime API](https://platform.openai.com/docs/guides/realtime-webrtc)
- [WebSocket com Realtime API](https://platform.openai.com/docs/guides/realtime-websocket)
- [Referência de Eventos](https://platform.openai.com/docs/api-reference/realtime-client-events)

## 🤝 Contribuição

Para contribuir com melhorias:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
