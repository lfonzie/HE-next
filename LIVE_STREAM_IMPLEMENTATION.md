# Gemini Live Stream Implementation

## Visão Geral

Esta implementação cria uma nova página de live stream que permite conversação em tempo real com áudio, vídeo, compartilhamento de tela e texto usando o Gemini 2.0 Flash Thinking Experimental. A funcionalidade foi implementada conforme o exemplo fornecido, aproveitando as capacidades nativas de áudio do modelo mais avançado.

## Arquivos Criados

### 1. Página Principal
- **`/app/live-stream/page.tsx`** - Interface principal do live stream

### 2. APIs
- **`/app/api/live-stream/connect/route.ts`** - Estabelece conexão com Gemini API
- **`/app/api/live-stream/websocket/route.ts`** - Processa áudio, vídeo, tela e texto (legado)
- **`/app/api/live-stream/native-audio/route.ts`** - Processa com capacidades nativas de áudio
- **`/app/api/live-stream/process/route.ts`** - Processa áudio (legado)
- **`/app/api/live-stream/text/route.ts`** - Processa mensagens de texto (legado)

## Funcionalidades

### 🎤 Streaming Automático de Áudio
- Streaming contínuo de áudio a cada 3 segundos
- Gravação automática usando MediaRecorder API
- Conversão automática para formato compatível com Gemini
- Envio automático para processamento e transcrição
- Controles de mute/unmute

### 📹 Streaming Automático de Vídeo
- Streaming contínuo de frames de vídeo a cada 3 segundos
- Captura automática de frames da câmera
- Análise visual pelo Gemini
- Preview local do vídeo capturado
- Suporte a áudio e vídeo simultâneos

### 🖥️ Streaming Automático de Tela
- Streaming contínuo de frames da tela a cada 3 segundos
- Captura automática de frames da tela compartilhada
- Análise de conteúdo da tela pelo Gemini
- Suporte a áudio do sistema
- Controle automático de início/fim do compartilhamento

### 💬 Mensagens de Texto
- Envio de mensagens de texto em tempo real
- Resposta streaming da IA
- Interface conversacional intuitiva

### 🔧 Controles
- Conectar/Desconectar
- Abas para diferentes tipos de mídia
- Log de debug em tempo real
- Interface responsiva e intuitiva

## Configuração

### Dependências
```bash
npm install mime @types/mime
```

### Variáveis de Ambiente
Certifique-se de que `GEMINI_API_KEY` está configurada no `.env`:

```env
GEMINI_API_KEY=sua_chave_aqui
```

## Como Usar

1. **Acesse a página**: `/live-stream`
2. **Conecte**: Clique em "Conectar" para estabelecer conexão com Gemini API
3. **Escolha o tipo de mídia e inicie o streaming automático**:
   - **Áudio**: Clique "Iniciar Auto Stream" para streaming contínuo de áudio
   - **Vídeo**: Clique "Iniciar Auto Stream" para captura automática de frames
   - **Tela**: Clique "Iniciar Auto Stream" para captura automática da tela
   - **Texto**: Digite mensagens para conversação direta
4. **Veja respostas**: As respostas aparecerão em tempo real na área de mensagens
5. **Streaming contínuo**: O sistema envia dados automaticamente a cada 3 segundos

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **IA**: Google Gemini 2.0 Flash Experimental
- **Streaming**: Server-Sent Events (SSE)
- **API**: Google Generative AI SDK

## Recursos Técnicos

### Processamento de Texto
- Streaming de respostas em tempo real
- Tratamento de erros robusto
- Interface conversacional fluida

### Gerenciamento de Sessões
- Autenticação via NextAuth
- Validação de entrada de dados
- Tratamento seguro de requisições

### Streaming
- Respostas em tempo real via Server-Sent Events
- Processamento assíncrono de texto
- Feedback visual de status

## Segurança

- Autenticação obrigatória via NextAuth
- Validação de entrada de dados
- Tratamento seguro de arquivos de áudio
- Limpeza automática de recursos

## Limitações

- Depende da disponibilidade da API do Gemini
- Requer autenticação para uso
- Respostas apenas em texto (áudio de resposta não implementado)
- Requer navegador moderno com suporte a MediaRecorder
- Permissões de microfone, câmera e tela necessárias

## Próximos Passos

1. Implementar respostas de áudio da IA
2. Adicionar suporte a gravação de conversas
3. Implementar armazenamento persistente de sessões
4. Melhorar tratamento de erros de rede
5. Adicionar mais opções de personalização
6. Implementar histórico de conversas
7. Adicionar exportação de conversas

## Troubleshooting

### Erro de Conexão
- Verifique se `GEMINI_API_KEY` está configurada
- Confirme que a chave tem acesso ao Gemini API

### Problemas de Texto
- Verifique se está logado no sistema
- Teste a conexão com a internet

### Erro de Autenticação
- Certifique-se de estar logado no sistema
- Verifique se a sessão não expirou

## Logs

Todos os eventos são logados no console do servidor com prefixos:
- `🔗 [LIVE-STREAM]` - Conexões
- `🎤 [LIVE-STREAM]` - Processamento de áudio
- `💬 [LIVE-STREAM]` - Mensagens de texto
- `🎵 [LIVE-STREAM]` - Respostas de áudio
- `❌ [LIVE-STREAM]` - Erros
- `🧹 [LIVE-STREAM]` - Limpeza de recursos
