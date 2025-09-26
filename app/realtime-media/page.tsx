"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Phone, PhoneOff, AlertCircle } from "lucide-react";

export default function RealtimeMediaDemo() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [permissions, setPermissions] = useState({
    microphone: false,
    camera: false,
    screen: false,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const addDebugInfo = (message: string) => {
    console.log("DEBUG:", message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Verificar se getUserMedia está disponível
  const checkMediaSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Seu navegador não suporta acesso à mídia. Use Chrome, Firefox, Safari ou Edge modernos.");
      return false;
    }
    return true;
  };

  // Solicitar permissões de mídia
  const requestMediaPermissions = async () => {
    try {
      setError(null);
      addDebugInfo("Iniciando solicitação de permissões...");
      
      if (!checkMediaSupport()) {
        return;
      }

      addDebugInfo("Solicitando acesso ao microfone e câmera...");
      
      // Solicitar microfone e câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
      });

      addDebugInfo("✅ Permissões concedidas!");
      addDebugInfo(`Stream criado: ${stream.id}`);
      addDebugInfo(`Tracks de áudio: ${stream.getAudioTracks().length}`);
      addDebugInfo(`Tracks de vídeo: ${stream.getVideoTracks().length}`);

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        addDebugInfo("Vídeo local configurado");
      }

      setPermissions({
        microphone: true,
        camera: true,
        screen: false, // Screen sharing precisa ser solicitado separadamente
      });

      addDebugInfo("Estado atualizado: microfone e câmera ativos");
    } catch (err: any) {
      console.error("❌ Erro ao solicitar permissões:", err);
      addDebugInfo(`❌ Erro: ${err.name} - ${err.message}`);
      
      let errorMessage = "Erro ao solicitar permissões: ";
      
      if (err.name === "NotAllowedError") {
        errorMessage += "Permissões negadas pelo usuário. Clique no ícone de cadeado na barra de endereços e permita acesso ao microfone e câmera.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "Nenhum dispositivo de mídia encontrado. Verifique se você tem microfone e câmera conectados.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "Dispositivo de mídia está sendo usado por outro aplicativo.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage += "Configurações de mídia não suportadas pelo dispositivo.";
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    }
  };

  // Solicitar permissão de compartilhamento de tela
  const requestScreenPermission = async () => {
    try {
      setError(null);
      addDebugInfo("Solicitando compartilhamento de tela...");
      
      if (!navigator.mediaDevices.getDisplayMedia) {
        throw new Error("getDisplayMedia não suportado");
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      addDebugInfo("✅ Compartilhamento de tela concedido!");
      addDebugInfo(`Screen stream criado: ${screenStream.id}`);

      screenStreamRef.current = screenStream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
        addDebugInfo("Vídeo local mudou para tela compartilhada");
      }

      setPermissions(prev => ({
        ...prev,
        screen: true,
      }));

      // Quando o usuário para de compartilhar a tela
      screenStream.getVideoTracks()[0].onended = () => {
        addDebugInfo("Usuário parou de compartilhar a tela");
        setIsScreenSharing(false);
        setPermissions(prev => ({
          ...prev,
          screen: false,
        }));
        
        // Voltar para a câmera se estava ativa
        if (isVideoEnabled && localStreamRef.current) {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
            addDebugInfo("Voltou para a câmera");
          }
        }
      };

      setIsScreenSharing(true);
    } catch (err: any) {
      console.error("❌ Erro ao solicitar compartilhamento de tela:", err);
      addDebugInfo(`❌ Erro screen share: ${err.name} - ${err.message}`);
      
      let errorMessage = "Erro ao solicitar compartilhamento de tela: ";
      
      if (err.name === "NotAllowedError") {
        errorMessage += "Permissão de compartilhamento de tela negada.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "Nenhuma tela disponível para compartilhamento.";
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    }
  };

  // Conectar/Desconectar
  const handleConnect = async () => {
    if (isConnected) {
      // Desconectar
      addDebugInfo("Desconectando...");
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          addDebugInfo(`Track ${track.kind} parado`);
        });
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => {
          track.stop();
          addDebugInfo(`Screen track ${track.kind} parado`);
        });
        screenStreamRef.current = null;
      }
      
      setIsConnected(false);
      setIsMuted(false);
      setIsVideoEnabled(true);
      setIsScreenSharing(false);
      setPermissions({
        microphone: false,
        camera: false,
        screen: false,
      });
      addDebugInfo("Desconectado com sucesso");
    } else {
      // Conectar
      setIsConnecting(true);
      addDebugInfo("Iniciando conexão...");
      await requestMediaPermissions();
      setIsConnected(true);
      setIsConnecting(false);
    }
  };

  // Alternar microfone
  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
        addDebugInfo(`Microfone ${isMuted ? 'ativado' : 'desativado'}`);
      });
      setIsMuted(!isMuted);
    }
  };

  // Alternar câmera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
        addDebugInfo(`Câmera ${!isVideoEnabled ? 'ativada' : 'desativada'}`);
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Alternar compartilhamento de tela
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Parar compartilhamento de tela
      addDebugInfo("Parando compartilhamento de tela...");
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      
      // Voltar para a câmera se estava ativa
      if (isVideoEnabled && localStreamRef.current) {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          addDebugInfo("Voltou para a câmera");
        }
      }
    } else {
      // Iniciar compartilhamento de tela
      await requestScreenPermission();
    }
  };

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Demo de Mídia - Microfone, Câmera e Tela
          </h1>
          <p className="text-muted-foreground">
            Teste as permissões de microfone, câmera e compartilhamento de tela
          </p>
        </div>

        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Controles de Mídia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status das Permissões */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Mic className={`h-4 w-4 ${permissions.microphone ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium">Microfone</span>
                <Badge variant={permissions.microphone ? "default" : "destructive"}>
                  {permissions.microphone ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Video className={`h-4 w-4 ${permissions.camera ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium">Câmera</span>
                <Badge variant={permissions.camera ? "default" : "destructive"}>
                  {permissions.camera ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Monitor className={`h-4 w-4 ${permissions.screen ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium">Tela</span>
                <Badge variant={permissions.screen ? "default" : "destructive"}>
                  {permissions.screen ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            {/* Controles Principais */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                variant={isConnected ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isConnected ? (
                  <>
                    <PhoneOff className="h-4 w-4" />
                    Desconectar
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    {isConnecting ? "Conectando..." : "Conectar"}
                  </>
                )}
              </Button>

              {isConnected && (
                <>
                  <Button
                    onClick={toggleMicrophone}
                    variant={isMuted ? "destructive" : "default"}
                    className="flex items-center gap-2"
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isMuted ? "Desmutar" : "Mutar"}
                  </Button>

                  <Button
                    onClick={toggleCamera}
                    variant={!isVideoEnabled ? "destructive" : "default"}
                    className="flex items-center gap-2"
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    {isVideoEnabled ? "Desligar Câmera" : "Ligar Câmera"}
                  </Button>

                  <Button
                    onClick={toggleScreenShare}
                    variant={isScreenSharing ? "destructive" : "default"}
                    className="flex items-center gap-2"
                  >
                    {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    {isScreenSharing ? "Parar Tela" : "Compartilhar Tela"}
                  </Button>
                </>
              )}
            </div>

            {/* Vídeo Local */}
            {isConnected && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vídeo Local</h3>
                <div className="relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-primary/20"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    {isMuted && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <MicOff className="h-3 w-3" />
                        Mutado
                      </Badge>
                    )}
                    {!isVideoEnabled && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <VideoOff className="h-3 w-3" />
                        Câmera Off
                      </Badge>
                    )}
                    {isScreenSharing && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        Compartilhando Tela
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vídeo Remoto (placeholder) */}
            {isConnected && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vídeo Remoto (IA)</h3>
                <div className="relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-secondary/20 bg-muted"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge variant="secondary" className="text-sm">
                      Aguardando conexão com IA...
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Info */}
            {debugInfo.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Log de Debug
                </h3>
                <div className="bg-muted/50 p-3 rounded-lg max-h-40 overflow-y-auto">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="text-xs font-mono text-muted-foreground">
                      {info}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Instruções */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Como usar:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Clique em "Conectar" para solicitar permissões de microfone e câmera</li>
                <li>Permita o acesso quando o navegador solicitar</li>
                <li>Use os controles para mutar/desmutar microfone e ligar/desligar câmera</li>
                <li>Clique em "Compartilhar Tela" para compartilhar sua tela</li>
                <li>O vídeo local mostrará sua câmera ou tela compartilhada</li>
                <li>Verifique o log de debug para informações detalhadas</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}