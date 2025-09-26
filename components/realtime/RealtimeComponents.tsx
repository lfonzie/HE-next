"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectionType: "webrtc" | "websocket";
}

export function ConnectionStatus({ isConnected, isConnecting, error, connectionType }: ConnectionStatusProps) {
  const getStatusColor = () => {
    if (error) return "destructive";
    if (isConnected) return "default";
    if (isConnecting) return "secondary";
    return "outline";
  };

  const getStatusText = () => {
    if (error) return "Erro";
    if (isConnected) return "Conectado";
    if (isConnecting) return "Conectando...";
    return "Desconectado";
  };

  const getStatusIcon = () => {
    if (error) return <WifiOff className="h-4 w-4" />;
    if (isConnected) return <Wifi className="h-4 w-4" />;
    return <WifiOff className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusColor()} className="flex items-center gap-1">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {connectionType.toUpperCase()}
      </Badge>
      {error && (
        <span className="text-sm text-destructive max-w-xs truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}

interface AudioControlsProps {
  isMuted: boolean;
  isSpeaking: boolean;
  onToggleMute: () => void;
  disabled?: boolean;
}

export function AudioControls({ isMuted, isSpeaking, onToggleMute, disabled }: AudioControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isMuted ? "destructive" : "default"}
        size="icon"
        onClick={onToggleMute}
        disabled={disabled}
        className={cn(
          "transition-all duration-200",
          isSpeaking && !isMuted && "animate-pulse bg-green-500 hover:bg-green-600"
        )}
      >
        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      {isSpeaking && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Volume2 className="h-4 w-4" />
          <span>IA falando...</span>
        </div>
      )}
    </div>
  );
}

interface ConnectionControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  disabled?: boolean;
}

export function ConnectionControls({ isConnected, isConnecting, onConnect, onDisconnect, disabled }: ConnectionControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <Button
          variant="destructive"
          onClick={onDisconnect}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <PhoneOff className="h-4 w-4" />
          Desconectar
        </Button>
      ) : (
        <Button
          onClick={onConnect}
          disabled={disabled || isConnecting}
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          {isConnecting ? "Conectando..." : "Conectar"}
        </Button>
      )}
    </div>
  );
}

interface RealtimeCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function RealtimeCard({ title, description, children, className }: RealtimeCardProps) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface MessageListProps {
  messages: Array<{ role: string; content: string; timestamp: Date }>;
  className?: string;
}

export function MessageList({ messages, className }: MessageListProps) {
  return (
    <div className={cn("space-y-4 max-h-96 overflow-y-auto", className)}>
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Nenhuma mensagem ainda. Conecte-se para começar a conversar!
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col gap-1 p-3 rounded-lg",
              message.role === "user"
                ? "bg-primary/10 ml-8"
                : "bg-muted mr-8"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {message.role === "user" ? "Você" : "IA"}
              </span>
              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

interface SettingsPanelProps {
  model: string;
  voice: string;
  onModelChange: (model: string) => void;
  onVoiceChange: (voice: string) => void;
  className?: string;
}

export function SettingsPanel({ model, voice, onModelChange, onVoiceChange, className }: SettingsPanelProps) {
  const models = [
    { value: "gpt-4o-realtime", label: "GPT-4o Realtime" },
    { value: "gpt-4o-mini-realtime", label: "GPT-4o Mini Realtime" },
  ];

  const voices = [
    { value: "alloy", label: "Alloy" },
    { value: "echo", label: "Echo" },
    { value: "fable", label: "Fable" },
    { value: "onyx", label: "Onyx" },
    { value: "nova", label: "Nova" },
    { value: "shimmer", label: "Shimmer" },
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Modelo</label>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
          >
            {models.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Voz</label>
          <select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
          >
            {voices.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
