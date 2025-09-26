"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LiveAudioStreamPlayer from '@/components/audio/LiveAudioStreamPlayer';
import AudioVisualizer from '@/components/audio/AudioVisualizer';
import { useGeminiLiveStream } from '@/hooks/useGeminiLiveStream';
import { getStreamingConfig, saveStreamingConfig, type StreamingConfig } from '@/lib/streaming-config';
import { Volume2, Settings, TestTube, BookOpen, Mic } from 'lucide-react';

export default function TestLiveAudioAulas() {
  const [testText, setTestText] = useState('Olá! Este é um teste do sistema de streaming de áudio nas aulas. A tecnologia Gemini Live permite reprodução em tempo real com latência mínima.');
  const [streamingConfig, setStreamingConfig] = useState<StreamingConfig>(getStreamingConfig());
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [inputNode, setInputNode] = useState<AudioNode | null>(null);
  const [outputNode, setOutputNode] = useState<AudioNode | null>(null);

  // Hook para streaming
  const {
    isConnected,
    isConnecting,
    isStreaming,
    error,
    status,
    connect,
    disconnect,
    streamText
  } = useGeminiLiveStream({
    voice: streamingConfig.voice,
    onAudioReceived: async (audioData) => {
      console.log('Áudio recebido:', audioData);
    },
    onError: (error) => {
      console.error('Erro no streaming:', error);
    },
    onStatusChange: (status) => {
      console.log('Status:', status);
    }
  });

  const handleConfigChange = (key: keyof StreamingConfig, value: any) => {
    const newConfig = { ...streamingConfig, [key]: value };
    setStreamingConfig(newConfig);
    saveStreamingConfig(newConfig);
  };

  const testTexts = [
    'Olá! Este é um teste do sistema de streaming de áudio nas aulas.',
    'A tecnologia Gemini Live permite reprodução em tempo real com latência mínima.',
    'Este é um exemplo de como o conteúdo das aulas será narrado automaticamente.',
    'O sistema oferece feedback visual em tempo real do áudio sendo reproduzido.',
    'Teste de voz em português brasileiro com pronúncia natural e clara.'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TestTube className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Teste de Streaming de Áudio nas Aulas
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Teste a integração do sistema de streaming de áudio baseado na estrutura live-audio
          </p>
        </div>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Status da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={
                isConnected ? 'bg-green-100 text-green-800' :
                isConnecting ? 'bg-yellow-100 text-yellow-800' :
                error ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {status}
              </Badge>
              
              <div className="flex gap-2">
                <Button
                  onClick={connect}
                  disabled={isConnected || isConnecting}
                  size="sm"
                >
                  {isConnecting ? 'Conectando...' : 'Conectar'}
                </Button>
                
                <Button
                  onClick={disconnect}
                  disabled={!isConnected}
                  variant="outline"
                  size="sm"
                >
                  Desconectar
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Streaming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="enabled">Streaming Habilitado</Label>
                <Switch
                  id="enabled"
                  checked={streamingConfig.enabled}
                  onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voice">Voz</Label>
                <Select
                  value={streamingConfig.voice}
                  onValueChange={(value) => handleConfigChange('voice', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orus">Orus</SelectItem>
                    <SelectItem value="Zephyr">Zephyr</SelectItem>
                    <SelectItem value="Alloy">Alloy</SelectItem>
                    <SelectItem value="Echo">Echo</SelectItem>
                    <SelectItem value="Fable">Fable</SelectItem>
                    <SelectItem value="Onyx">Onyx</SelectItem>
                    <SelectItem value="Nova">Nova</SelectItem>
                    <SelectItem value="Shimmer">Shimmer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoPlay">Reprodução Automática</Label>
                <Switch
                  id="autoPlay"
                  checked={streamingConfig.autoPlay}
                  onCheckedChange={(checked) => handleConfigChange('autoPlay', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="showVisualization">Visualização</Label>
                <Switch
                  id="showVisualization"
                  checked={streamingConfig.showVisualization}
                  onCheckedChange={(checked) => handleConfigChange('showVisualization', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="latency">Latência</Label>
                <Select
                  value={streamingConfig.latency}
                  onValueChange={(value) => handleConfigChange('latency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa (~100ms)</SelectItem>
                    <SelectItem value="medium">Média (~500ms)</SelectItem>
                    <SelectItem value="high">Alta (~1000ms)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fallbackToTTS">Fallback para TTS</Label>
                <Switch
                  id="fallbackToTTS"
                  checked={streamingConfig.fallbackToTTS}
                  onCheckedChange={(checked) => handleConfigChange('fallbackToTTS', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Texto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Teste de Conteúdo das Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testText">Texto para Teste</Label>
                <Textarea
                  id="testText"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {testTexts.map((text, index) => (
                  <Button
                    key={index}
                    onClick={() => setTestText(text)}
                    variant="outline"
                    size="sm"
                  >
                    Exemplo {index + 1}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => streamText(testText)}
                  disabled={!isConnected || !testText.trim()}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Testar Streaming
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player de Streaming */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Live Audio Stream Player
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveAudioStreamPlayer
              text={testText}
              voice={streamingConfig.voice}
              autoPlay={streamingConfig.autoPlay}
              showVisualization={streamingConfig.showVisualization}
              onAudioStart={() => console.log('Áudio iniciado')}
              onAudioEnd={() => console.log('Áudio finalizado')}
              onError={(error) => console.error('Erro de áudio:', error)}
            />
          </CardContent>
        </Card>

        {/* Visualização de Áudio */}
        {streamingConfig.showVisualization && audioContext && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Visualização de Áudio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioVisualizer
                audioContext={audioContext}
                inputNode={inputNode}
                outputNode={outputNode}
                width={800}
                height={200}
                showInput={true}
                showOutput={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Informações Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Configuração Atual:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Streaming: {streamingConfig.enabled ? 'Habilitado' : 'Desabilitado'}</li>
                  <li>• Voz: {streamingConfig.voice}</li>
                  <li>• Auto-play: {streamingConfig.autoPlay ? 'Sim' : 'Não'}</li>
                  <li>• Visualização: {streamingConfig.showVisualization ? 'Sim' : 'Não'}</li>
                  <li>• Latência: {streamingConfig.latency}</li>
                  <li>• Fallback: {streamingConfig.fallbackToTTS ? 'Sim' : 'Não'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Status da Conexão:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Conectado: {isConnected ? 'Sim' : 'Não'}</li>
                  <li>• Conectando: {isConnecting ? 'Sim' : 'Não'}</li>
                  <li>• Streaming: {isStreaming ? 'Sim' : 'Não'}</li>
                  <li>• Status: {status}</li>
                  <li>• Erro: {error || 'Nenhum'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

