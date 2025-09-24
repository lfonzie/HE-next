'use client'

import { useState } from 'react'
import AudioPlayer from '@/components/audio/AudioPlayer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gauge, Volume2, Play, Pause } from 'lucide-react'

export default function TTSSpeedDemo() {
  const [testText, setTestText] = useState('Esta é uma demonstração do novo controle de velocidade do sistema de Text-to-Speech. Agora você pode ajustar a velocidade de reprodução de 0.5x até 2x para uma experiência personalizada.')

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Controle de Velocidade TTS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎛️ Nova Funcionalidade</h3>
            <p className="text-blue-700">
              O botão de download foi substituído por controles de velocidade de reprodução. 
              Agora você pode ajustar a velocidade do áudio de 0.5x até 2x.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Texto para testar a velocidade:
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Digite o texto que deseja converter em áudio..."
            />
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Player com Controle de Velocidade:</h3>
            <AudioPlayer 
              text={testText}
              className="border-purple-200 bg-purple-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Play className="h-4 w-4" />
                Controles Disponíveis:
              </h4>
              <ul className="text-sm space-y-1">
                <li>• ▶️ Play/Pause</li>
                <li>• 🔊 Volume (mute/unmute)</li>
                <li>• ⚡ Velocidade (0.5x - 2x)</li>
                <li>• 📊 Barra de progresso</li>
                <li>• ⏱️ Tempo atual/total</li>
              </ul>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Velocidades Disponíveis:
              </h4>
              <ul className="text-sm space-y-1">
                <li>• 0.5x - Muito lento</li>
                <li>• 0.75x - Lento</li>
                <li>• 1x - Normal</li>
                <li>• 1.25x - Rápido</li>
                <li>• 1.5x - Muito rápido</li>
                <li>• 2x - Ultra rápido</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">💡 Dicas de Uso:</h3>
            <ul className="text-green-700 space-y-1 text-sm">
              <li>• Use 0.5x para estudar conteúdo complexo</li>
              <li>• Use 1.25x para revisar conteúdo já conhecido</li>
              <li>• Use 2x para fazer uma revisão rápida</li>
              <li>• A velocidade é mantida durante toda a reprodução</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => window.location.href = '/test-tts'}>
              Teste Completo
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/aulas'}>
              Voltar para Aulas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
