# 🔧 Configuração Necessária para Chat ao Vivo

## ✅ Status Atual
- **API Key**: ✅ Configurada (`GEMINI_API_KEY` e `GOOGLE_GENERATIVE_AI_API_KEY`)
- **Live API URL**: ❌ Precisa ser adicionada
- **Content Type**: ❌ Precisa ser adicionada

## 📝 Adicione ao seu .env.local

Adicione estas duas linhas ao seu arquivo `.env.local`:

```bash
# Gemini Live API Configuration
GEMINI_LIVE_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-live:start"
GEMINI_LIVE_CONTENT_TYPE="application/sdp"
```

## 🚀 Após adicionar as variáveis

1. **Reinicie o servidor**:
   ```bash
   # Pare o servidor atual (Ctrl+C) e reinicie
   npm run dev
   ```

2. **Teste a rota**:
   ```bash
   curl -X POST http://localhost:3000/api/gemini/live/sdp \
     -H "Content-Type: application/json" \
     -d '{"sdp":"test"}'
   ```

3. **Acesse a página**:
   - Navegue para `http://localhost:3000/chat/live`
   - Teste os controles de conexão

## 🎯 Próximos Passos

Após configurar as variáveis, você poderá:
- ✅ Conectar com voz
- ✅ Conectar com voz + vídeo  
- ✅ Conectar com voz + compartilhamento de tela
- ✅ Controlar microfone e câmera em tempo real
- ✅ Receber áudio do Gemini Live API

## 🔍 Debug

Se houver problemas, verifique:
- Console do navegador para logs `[LiveChat]`
- Console do servidor para logs `[Gemini Live]`
- Network tab para requisições `/api/gemini/live/sdp`
