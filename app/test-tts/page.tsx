'use client'

import { useState } from 'react'
import AudioPlayer from '@/components/audio/AudioPlayer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TTSTestPage() {
  const [testText, setTestText] = useState('Esta é uma demonstração do sistema de Text-to-Speech integrado às aulas. O áudio é gerado automaticamente usando a API da OpenAI.')

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔊 Teste do Sistema TTS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Texto para converter em áudio:
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Digite o texto que deseja converter em áudio..."
            />
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Player de Áudio:</h3>
            <AudioPlayer 
              text={testText}
              className="border-blue-200 bg-blue-50"
            />
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✅ Funcionalidades Implementadas:</h4>
            <ul className="text-green-700 space-y-1">
              <li>• Conversão de texto em áudio usando OpenAI TTS</li>
              <li>• Cache automático para evitar regeneração</li>
              <li>• Controles de reprodução (play/pause/mute)</li>
              <li>• Barra de progresso e tempo</li>
              <li>• Controle de velocidade (0.5x a 2x)</li>
              <li>• Integração automática nos slides das aulas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
