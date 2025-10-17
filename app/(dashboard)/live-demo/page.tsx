/**
 * Página de Demonstração dos Módulos Live Integrados
 * Mostra todas as funcionalidades da Gemini Live API integradas
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Video, 
  Monitor, 
  Bot, 
  Zap, 
  BarChart3,
  Calculator,
  Volume2,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedLiveModule } from '@/components/live/UnifiedLiveModule';
import { VoiceAssistant } from '@/components/virtual-labs/VoiceAssistant';
import { AudioCapture, AudioPlayback } from '@/components/virtual-labs/AudioComponents';

export default function LiveModulesDemoPage() {
  const [activeDemo, setActiveDemo] = useState('unified');
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(false);

  const demos = [
    {
      id: 'unified',
      name: 'Módulo Unificado',
      description: 'Integração completa com chat, áudio, vídeo e dados',
      icon: Zap,
      color: 'bg-blue-500'
    },
    {
      id: 'chat',
      name: 'Chat ao Vivo',
      description: 'Conversação em tempo real com IA',
      icon: Bot,
      color: 'bg-green-500'
    },
    {
      id: 'audio',
      name: 'Análise de Áudio',
      description: 'Captura e análise de áudio em tempo real',
      icon: Volume2,
      color: 'bg-purple-500'
    },
    {
      id: 'video',
      name: 'Streaming de Vídeo',
      description: 'Transmissão de vídeo e compartilhamento de tela',
      icon: Video,
      color: 'bg-red-500'
    },
    {
      id: 'data',
      name: 'Análise de Dados',
      description: 'Coleta e análise de dados científicos',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Módulos Live - Gemini 2.5 Flash
              </h1>
              <p className="text-sm text-gray-600">
                Demonstração completa da integração com Gemini Live API
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setVoiceAssistantEnabled(!voiceAssistantEnabled)}
              className={voiceAssistantEnabled ? 'bg-blue-600' : ''}
            >
              <Bot className="h-4 w-4 mr-2" />
              {voiceAssistantEnabled ? 'IA Ativa' : 'Ativar IA'}
            </Button>
            
            <Badge variant="outline" className="text-green-600 border-green-600">
              Live API
            </Badge>
          </div>
        </div>
      </div>

      {/* Demo Selector */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {demos.map((demo) => {
            const IconComponent = demo.icon;
            return (
              <motion.div
                key={demo.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    activeDemo === demo.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveDemo(demo.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${demo.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{demo.name}</h3>
                        <p className="text-xs text-gray-600">{demo.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Demo Content */}
        <div className="h-[calc(100vh-200px)]">
          {activeDemo === 'unified' && (
            <UnifiedLiveModule
              config={{
                experimentType: 'chemistry',
                difficulty: 'intermediate',
                enableFunctionCalling: true,
                enableAudioAnalysis: true,
                enableVideoStreaming: true,
                enableScreenSharing: true
              }}
              className="h-full"
            />
          )}

          {activeDemo === 'chat' && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  Chat ao Vivo com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Chat ao Vivo</h3>
                    <p className="text-gray-600 mb-4">
                      Conversação em tempo real com Gemini Live API
                    </p>
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'audio' && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="h-5 w-5 mr-2" />
                  Análise de Áudio
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <AudioCapture
                    onAudioData={(data) => console.log('Áudio capturado:', data.byteLength)}
                    enabled={true}
                    className="flex-shrink-0"
                  />
                  
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Análise em Tempo Real</h3>
                    <p className="text-gray-600 mb-4">
                      Captura e análise de áudio com Gemini Live API
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="font-medium">Frequência</div>
                        <div className="text-gray-600">440 Hz</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="font-medium">Amplitude</div>
                        <div className="text-gray-600">0.75</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'video' && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Streaming de Vídeo
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Streaming de Vídeo</h3>
                    <p className="text-gray-600 mb-4">
                      Transmissão de vídeo e compartilhamento de tela
                    </p>
                    <div className="flex space-x-4">
                      <Button>
                        <Video className="h-4 w-4 mr-2" />
                        Câmera
                      </Button>
                      <Button>
                        <Monitor className="h-4 w-4 mr-2" />
                        Tela
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'data' && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Análise de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Medições
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm">pHmetro: 7.2 pH</div>
                        <div className="text-sm">Termômetro: 25°C</div>
                        <div className="text-sm">Voltímetro: 12V</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Calculator className="h-4 w-4 mr-2" />
                        Cálculos
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm">pH: 3.0</div>
                        <div className="text-sm">Concentração: 0.1M</div>
                        <div className="text-sm">Lei de Ohm: 3A</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Estatísticas</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Total de Medições</div>
                        <div className="text-gray-600">15</div>
                      </div>
                      <div>
                        <div className="font-medium">Cálculos Executados</div>
                        <div className="text-gray-600">8</div>
                      </div>
                      <div>
                        <div className="font-medium">Tempo de Sessão</div>
                        <div className="text-gray-600">5:32</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Voice Assistant */}
      {voiceAssistantEnabled && (
        <VoiceAssistant
          experimentId="live-demo"
          experimentType="chemistry"
          difficulty="intermediate"
          onMeasurementRequest={(instrument, value, unit) => {
            console.log('Medição:', { instrument, value, unit });
          }}
          onCalculationRequest={(formula, variables) => {
            console.log('Cálculo:', { formula, variables });
            return 0;
          }}
          onExperimentGuidance={(step, instructions) => {
            console.log('Orientação:', { step, instructions });
          }}
          onError={(error) => {
            console.error('Erro:', error);
          }}
        />
      )}
    </div>
  );
}
