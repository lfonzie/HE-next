"use client";

import { useState } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

/**
 * Exemplo simples de uso do hook useRealtime
 * Este componente demonstra como integrar o OpenAI Realtime API
 * em qualquer página do seu aplicativo Next.js
 */
export function SimpleRealtimeExample() {
  const [isConnected, setIsConnected] = useState(false);
  
  const realtime = useRealtime({
    model: "gpt-4o-realtime",
    voice: "alloy",
    onEvent: (event) => {
      console.log("Evento recebido:", event);
    },
    onError: (error) => {
      console.error("Erro:", error);
    },
    onConnectionChange: (connected) => {
      setIsConnected(connected);
    },
  });

  const handleConnect = () => {
    if (realtime.isConnected) {
      realtime.disconnect();
    } else {
      realtime.connect();
    }
  };

  const handleToggleMute = () => {
    realtime.toggleMute();
  };

  const handleSendMessage = () => {
    realtime.sendMessage("Olá! Como você está hoje?");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          OpenAI Realtime
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">
            Status: {realtime.isConnected ? "Conectado" : "Desconectado"}
          </span>
          <Button
            onClick={handleConnect}
            variant={realtime.isConnected ? "destructive" : "default"}
            size="sm"
          >
            {realtime.isConnected ? (
              <>
                <PhoneOff className="h-4 w-4 mr-1" />
                Desconectar
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-1" />
                Conectar
              </>
            )}
          </Button>
        </div>

        {realtime.isConnected && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Microfone: {realtime.isMuted ? "Mutado" : "Ativo"}
              </span>
              <Button
                onClick={handleToggleMute}
                variant={realtime.isMuted ? "destructive" : "default"}
                size="sm"
              >
                {realtime.isMuted ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1" />
                    Desmutar
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1" />
                    Mutar
                  </>
                )}
              </Button>
            </div>

            {realtime.isSpeaking && (
              <div className="text-sm text-green-600 animate-pulse">
                🎤 IA está falando...
              </div>
            )}

            <Button
              onClick={handleSendMessage}
              className="w-full"
              disabled={!realtime.isConnected}
            >
              Enviar Mensagem de Teste
            </Button>
          </>
        )}

        {realtime.error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            Erro: {realtime.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Exemplo de integração em uma página existente
 * 
 * Para usar este componente em qualquer página:
 * 
 * 1. Importe o componente:
 *    import { SimpleRealtimeExample } from "@/components/realtime/SimpleRealtimeExample";
 * 
 * 2. Adicione na sua página:
 *    <SimpleRealtimeExample />
 * 
 * 3. Certifique-se de ter a API key configurada no .env.local:
 *    OPENAI_API_KEY=sk-your-key-here
 */
