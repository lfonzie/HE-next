"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  RealtimeCard,
  ConnectionStatus,
  ConnectionControls,
  MessageList,
  SettingsPanel,
} from "@/components/realtime/RealtimeComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Mic, MicOff, Volume2 } from "lucide-react";

export default function RealtimeDemo() {
  const [model, setModel] = useState("gpt-4o-realtime");
  const [voice, setVoice] = useState("Zephyr");
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // WebSocket connection
  const websocket = useWebSocket({
    model,
    onEvent: (event) => {
      console.log("WebSocket event:", event);
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
    onConnectionChange: (connected) => {
      console.log("WebSocket connection changed:", connected);
    },
  });

  const handleConnect = () => {
    if (websocket.isConnected) {
      websocket.disconnect();
    } else {
      websocket.connect();
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    websocket.sendMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Aqui você implementaria a gravação de áudio
    console.log("Recording:", !isRecording);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            OpenAI Realtime API
          </h1>
          <p className="text-muted-foreground">
            Conversação em tempo real com áudio usando WebSocket
          </p>
        </div>

        <RealtimeCard
          title="Realtime API - Conversação por Texto"
          description="Conecte-se usando WebSocket para conversação com resposta de voz"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <ConnectionStatus
                isConnected={websocket.isConnected}
                isConnecting={websocket.isConnecting}
                error={websocket.error}
                connectionType="websocket"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                Configurações
              </Button>
            </div>

            {showSettings && (
              <SettingsPanel
                model={model}
                voice={voice}
                onModelChange={setModel}
                onVoiceChange={setVoice}
              />
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="icon"
                  onClick={toggleRecording}
                  disabled={!websocket.isConnected}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {isRecording ? "Gravando..." : "Clique para gravar"}
                </span>
              </div>
              <ConnectionControls
                isConnected={websocket.isConnected}
                isConnecting={websocket.isConnecting}
                onConnect={handleConnect}
                onDisconnect={handleConnect}
              />
            </div>

            {websocket.isConnected && (
              <div className="space-y-4">
                <MessageList messages={websocket.messages} />
                
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    disabled={!websocket.isConnected}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!websocket.isConnected || !message.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {websocket.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Erro na conexão: {websocket.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              <p>• WebSocket funciona em todos os navegadores</p>
              <p>• Conversação por texto com resposta de voz</p>
              <p>• Reconexão automática em caso de falha</p>
              <p>• Suporte a múltiplos modelos e vozes</p>
            </div>
          </div>
        </RealtimeCard>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Powered by OpenAI Realtime API • 
            <a href="https://platform.openai.com/docs/guides/realtime" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              Documentação
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
