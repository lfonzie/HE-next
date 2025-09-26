'use client';

import { useEffect, useState } from 'react';
import { useLiveChat } from '@/hooks/useLiveChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  AlertCircle,
  Send,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LivePage() {
  const { 
    connected, 
    connecting, 
    error, 
    audioEnabled, 
    videoEnabled, 
    screenEnabled,
    isRecording,
    isPlaying,
    aiResponse,
    connect, 
    disconnect, 
    startRecording,
    stopRecording,
    sendTextMessage,
    toggleAudio, 
    toggleVideo 
  } = useLiveChat();
  
  const { toast } = useToast();
  const [textMessage, setTextMessage] = useState('');

  useEffect(() => {
    // No need for audio element setup with new implementation
  }, []);

  const handleConnect = async (options: { mic?: boolean; cam?: boolean; screen?: boolean }) => {
    try {
      await connect(options);
      toast({
        title: "Conectado!",
        description: "Chat ao vivo iniciado com sucesso",
      });
    } catch (err) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao chat ao vivo",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Desconectado",
      description: "Chat ao vivo encerrado",
    });
  };

  const handleSendText = async () => {
    if (!textMessage.trim()) return;
    
    try {
      await sendTextMessage(textMessage);
      setTextMessage('');
      toast({
        title: "Mensagem enviada",
        description: "Aguarde a resposta da IA",
      });
    } catch (err) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem de texto",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chat ao Vivo</h1>
            <p className="text-muted-foreground mt-2">
              Converse em tempo real com IA usando voz e vídeo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={connected ? "default" : "secondary"} 
              className="flex items-center gap-1"
            >
              {connected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Conectado
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  Desconectado
                </>
              )}
            </Badge>
            
            {isRecording && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Gravando
              </Badge>
            )}
            
            {isPlaying && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Reproduzindo
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Status e Erros */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Erro:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles de Conexão */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Controles de Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleConnect({ mic: true })} 
              disabled={connected || connecting}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Conectar (Voz)
            </Button>
            
            <Button 
              onClick={() => handleConnect({ mic: true, cam: true })} 
              disabled={connected || connecting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Conectar (Voz + Vídeo)
            </Button>
            
            <Button 
              onClick={() => handleConnect({ mic: true, screen: true })} 
              disabled={connected || connecting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Conectar (Voz + Tela)
            </Button>
            
            <Button 
              onClick={handleDisconnect} 
              disabled={!connected}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              Desconectar
            </Button>
          </div>
          
          {connecting && (
            <div className="mt-4 text-center text-muted-foreground">
              Conectando...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de Mídia */}
      {connected && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Controles de Mídia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={startRecording}
                disabled={!connected || isRecording}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Iniciar Gravação
              </Button>
              
              <Button 
                onClick={stopRecording}
                disabled={!connected || !isRecording}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Parar Gravação
              </Button>
              
              <Button 
                onClick={toggleAudio}
                variant={audioEnabled ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {audioEnabled ? "Microfone Ligado" : "Microfone Desligado"}
              </Button>
              
              <Button 
                onClick={toggleVideo}
                variant={videoEnabled ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                {videoEnabled ? "Câmera Ligada" : "Câmera Desligada"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat de Texto */}
      {connected && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Chat de Texto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendText}
                disabled={!textMessage.trim()}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resposta da IA */}
      {connected && aiResponse && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Resposta da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">{aiResponse}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <strong>Chat ao Vivo:</strong> Powered by Google Gemini API
            </p>
            <p className="mt-1">
              Converse usando texto e áudio com IA
            </p>
            <p className="mt-1">
              Grave áudio ou envie mensagens de texto para conversar
            </p>
            <p className="mt-1">
              Respostas são exibidas em texto
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}