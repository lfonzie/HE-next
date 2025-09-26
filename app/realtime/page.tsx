"use client";

import { useState, useEffect } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  RealtimeCard,
  ConnectionStatus,
  AudioControls,
  ConnectionControls,
  MessageList,
  SettingsPanel,
} from "@/components/realtime/RealtimeComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Zap, Globe } from "lucide-react";

export default function RealtimeDemo() {
  const [connectionType, setConnectionType] = useState<"webrtc" | "websocket">("webrtc");
  const [model, setModel] = useState("gpt-4o-realtime");
  const [voice, setVoice] = useState("Zephyr");
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // WebRTC connection
  const webrtc = useRealtime({
    model,
    voice,
    onEvent: (event) => {
      console.log("WebRTC event:", event);
    },
    onError: (error) => {
      console.error("WebRTC error:", error);
    },
    onConnectionChange: (connected) => {
      console.log("WebRTC connection changed:", connected);
    },
  });

  // WebSocket fallback
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

  const currentConnection = connectionType === "webrtc" ? webrtc : websocket;

  const handleConnect = () => {
    if (connectionType === "webrtc") {
      webrtc.connect();
    } else {
      websocket.connect();
    }
  };

  const handleDisconnect = () => {
    if (connectionType === "webrtc") {
      webrtc.disconnect();
    } else {
      websocket.disconnect();
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (connectionType === "webrtc") {
      webrtc.sendMessage(message);
    } else {
      websocket.sendMessage(message);
    }
    
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-switch to WebSocket if WebRTC fails
  useEffect(() => {
    if (connectionType === "webrtc" && webrtc.error && !websocket.isConnected) {
      console.log("WebRTC failed, switching to WebSocket fallback");
      setConnectionType("websocket");
    }
  }, [connectionType, webrtc.error, websocket.isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            OpenAI Realtime API
          </h1>
          <p className="text-muted-foreground">
            Conversação em tempo real com áudio bidirecional usando WebRTC e fallback WebSocket
          </p>
        </div>

        <Tabs value={connectionType} onValueChange={(value) => setConnectionType(value as "webrtc" | "websocket")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="webrtc" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              WebRTC (Baixa Latência)
            </TabsTrigger>
            <TabsTrigger value="websocket" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              WebSocket (Fallback)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webrtc">
            <RealtimeCard
              title="WebRTC - Conversação por Voz"
              description="Conecte-se usando WebRTC para conversação de áudio em tempo real com baixa latência"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <ConnectionStatus
                    isConnected={webrtc.isConnected}
                    isConnecting={webrtc.isConnecting}
                    error={webrtc.error}
                    connectionType="webrtc"
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
                  <AudioControls
                    isMuted={webrtc.isMuted}
                    isSpeaking={webrtc.isSpeaking}
                    onToggleMute={webrtc.toggleMute}
                    disabled={!webrtc.isConnected}
                  />
                  <ConnectionControls
                    isConnected={webrtc.isConnected}
                    isConnecting={webrtc.isConnecting}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                  />
                </div>

                {webrtc.error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Erro na conexão WebRTC: {webrtc.error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>• WebRTC oferece a menor latência para conversação de áudio</p>
                  <p>• Requer permissão de microfone do navegador</p>
                  <p>• Funciona melhor em Chrome, Edge, Firefox e Safari modernos</p>
                </div>
              </div>
            </RealtimeCard>
          </TabsContent>

          <TabsContent value="websocket">
            <RealtimeCard
              title="WebSocket - Conversação por Texto"
              description="Conecte-se usando WebSocket para conversação por texto com fallback automático"
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
                  <div className="text-sm text-muted-foreground">
                    Modo texto - sem controles de áudio
                  </div>
                  <ConnectionControls
                    isConnected={websocket.isConnected}
                    isConnecting={websocket.isConnecting}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
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
                      Erro na conexão WebSocket: {websocket.error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>• WebSocket funciona em todos os navegadores</p>
                  <p>• Conversação por texto com resposta de voz</p>
                  <p>• Fallback automático quando WebRTC não está disponível</p>
                </div>
              </div>
            </RealtimeCard>
          </TabsContent>
        </Tabs>

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
