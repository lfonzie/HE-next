/**
 * Componente Unificado para Módulos Live
 * Integra chat ao vivo, áudio, vídeo e function calling
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Bot,
  Settings,
  BarChart3,
  Calculator,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Loader2,
  RotateCcw,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLiveIntegration, LiveIntegrationConfig } from '@/hooks/useLiveIntegration';
import { VoiceAssistant } from '@/components/virtual-labs/VoiceAssistant';
import { AudioCapture, AudioPlayback } from '@/components/virtual-labs/AudioComponents';

interface UnifiedLiveModuleProps {
  config?: LiveIntegrationConfig;
  className?: string;
}

export function UnifiedLiveModule({ 
  config = {
    experimentType: 'chemistry',
    difficulty: 'intermediate',
    enableFunctionCalling: true,
    enableAudioAnalysis: true,
    enableVideoStreaming: true,
    enableScreenSharing: true
  },
  className = ''
}: UnifiedLiveModuleProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const { state, actions } = useLiveIntegration(config);

  // Handlers para o Voice Assistant
  const handleVoiceMeasurementRequest = (instrument: string, value: number, unit: string) => {
    const message = {
      id: Date.now().toString(),
      type: 'measurement',
      content: `📊 Medição: ${value} ${unit} (${instrument})`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleVoiceCalculationRequest = (formula: string, variables: Record<string, number>) => {
    let result = 0;
    try {
      switch (formula.toLowerCase()) {
        case 'ph':
          result = -Math.log10(variables.concentration || 0.001);
          break;
        case 'concentration':
          result = variables.moles / (variables.volume / 1000);
          break;
        case 'ohms_law':
          result = variables.voltage / variables.resistance;
          break;
        default:
          result = 0;
      }
    } catch (error) {
      console.error('Erro no cálculo:', error);
    }

    const message = {
      id: Date.now().toString(),
      type: 'calculation',
      content: `🧮 ${formula}: ${result.toFixed(2)}`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);
    return result;
  };

  const handleVoiceExperimentGuidance = (step: string, instructions: string[]) => {
    const message = {
      id: Date.now().toString(),
      type: 'guidance',
      content: `🎯 ${step}: ${instructions.join(', ')}`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleVoiceAssistantError = (error: Error) => {
    console.error('Erro do assistente de voz:', error);
  };

  // Conectar automaticamente
  useEffect(() => {
    if (!state.isConnected && state.connectionStatus === 'disconnected') {
      actions.connect();
    }
  }, [state.isConnected, state.connectionStatus, actions]);

  const getConnectionStatusColor = () => {
    switch (state.connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (state.connectionStatus) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Erro';
      default: return 'Desconectado';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Módulo Live Unificado
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
              <Badge variant={state.isConnected ? "default" : "secondary"}>
                {getConnectionStatusText()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                className={showVoiceAssistant ? 'bg-blue-50 text-blue-600' : ''}
              >
                <Bot className="w-4 h-4 mr-2" />
                IA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="audio">Áudio</TabsTrigger>
          <TabsTrigger value="video">Vídeo</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1">
          <Card className="h-full">
            <CardContent className="p-4 h-full overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Inicie uma conversa por voz</p>
                    <p className="text-sm mt-2">
                      {state.isConnected ? 'Conectado e pronto' : 'Conecte-se para começar'}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex justify-start"
                    >
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <p className="text-sm">{message.content}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Controles de Áudio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <AudioCapture
                  onAudioData={actions.sendAudioData}
                  enabled={state.isConnected}
                  className="flex-shrink-0"
                />
                
                <Button
                  onClick={state.isRecording ? actions.stopRecording : actions.startRecording}
                  disabled={!state.isConnected}
                  className={`rounded-full w-16 h-16 ${
                    state.isRecording
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {state.isRecording ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>

                {state.isSpeaking && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Volume2 className="h-4 w-4" />
                    <span className="text-sm">Falando...</span>
                  </div>
                )}
              </div>

              {state.audioAnalysis && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Análise de Áudio</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Frequência: {state.audioAnalysis.frequency?.toFixed(0)} Hz</div>
                    <div>Amplitude: {state.audioAnalysis.amplitude?.toFixed(2)}</div>
                    <div>Duração: {state.audioAnalysis.duration?.toFixed(2)}s</div>
                    <div>Sample Rate: {state.audioAnalysis.sampleRate} Hz</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Controles de Vídeo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={state.isVideoStreaming ? actions.stopVideoStreaming : actions.startVideoStreaming}
                  disabled={!state.isConnected}
                  className={`rounded-full w-16 h-16 ${
                    state.isVideoStreaming
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {state.isVideoStreaming ? (
                    <VideoOff className="h-6 w-6" />
                  ) : (
                    <Video className="h-6 w-6" />
                  )}
                </Button>

                <Button
                  onClick={state.isScreenSharing ? actions.stopScreenSharing : actions.startScreenSharing}
                  disabled={!state.isConnected}
                  className={`rounded-full w-16 h-16 ${
                    state.isScreenSharing
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {state.isScreenSharing ? (
                    <MonitorOff className="h-6 w-6" />
                  ) : (
                    <Monitor className="h-6 w-6" />
                  )}
                </Button>
              </div>

              <div className="text-center text-muted-foreground">
                <p className="text-sm">
                  {state.isVideoStreaming ? 'Streaming de vídeo ativo' : 
                   state.isScreenSharing ? 'Compartilhamento de tela ativo' : 
                   'Clique nos botões para iniciar'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Dados Coletados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Medições */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Medições ({state.measurements.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {state.measurements.map((measurement, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {measurement.instrument}: {measurement.value} {measurement.unit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cálculos */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  Cálculos ({state.calculations.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {state.calculations.map((calculation, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {calculation.formula}: {calculation.result}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={actions.clearData}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar Dados
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Voice Assistant */}
      {showVoiceAssistant && (
        <VoiceAssistant
          experimentId="unified-live"
          experimentType={config.experimentType}
          difficulty={config.difficulty}
          onMeasurementRequest={handleVoiceMeasurementRequest}
          onCalculationRequest={handleVoiceCalculationRequest}
          onExperimentGuidance={handleVoiceExperimentGuidance}
          onError={handleVoiceAssistantError}
        />
      )}
    </div>
  );
}
