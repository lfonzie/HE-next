'use client'

import { useState } from 'react'
import OptimizedTTSPlayer from '@/components/audio/OptimizedTTSPlayer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Volume2, Sparkles } from 'lucide-react'

export default function TTSDemoPage() {
  const [text, setText] = useState('Olá! Este é um exemplo do sistema de TTS otimizado com voz Shimmer e streaming automático. O áudio começa a tocar assim que o primeiro chunk está pronto, sem precisar aguardar todo o áudio carregar.')

  const exampleTexts = [
    'Olá! Este é um exemplo do sistema de TTS otimizado com voz Shimmer e streaming automático.',
    'O sistema usa a voz Shimmer da OpenAI, que é suave e delicada, perfeita para conteúdo educacional.',
    'Com streaming automático, você não precisa aguardar todo o áudio carregar. A reprodução começa imediatamente.',
    'Esta é uma demonstração das capacidades avançadas do sistema de síntese de voz.',
    'O sistema processa o texto em chunks menores para máxima velocidade e eficiência.'
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-500" />
          Sistema TTS Otimizado - Voz Shimmer
        </h1>
        <p className="text-gray-600">
          Sistema de síntese de voz com streaming automático usando a voz Shimmer da OpenAI
        </p>
      </div>

      <div className="grid gap-6">
        {/* Main TTS Player */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Player Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o texto que deseja converter em áudio..."
              className="min-h-[100px]"
            />
            
            <div className="flex items-center justify-between">
              <OptimizedTTSPlayer
                text={text}
                autoPlay={true}
                onAudioStart={() => console.log('Áudio iniciado')}
                onAudioEnd={() => console.log('Áudio finalizado')}
                onError={(error) => console.error('Erro:', error)}
              />
              
              <div className="text-sm text-gray-500">
                {text.length} caracteres
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Texts */}
        <Card>
          <CardHeader>
            <CardTitle>Exemplos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exampleTexts.map((exampleText, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <p className="text-sm flex-1 mr-4">{exampleText}</p>
                  <OptimizedTTSPlayer
                    text={exampleText}
                    autoPlay={false}
                    className="flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Características do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">✅ Vantagens</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Voz Shimmer (suave e delicada)</li>
                  <li>• Streaming automático</li>
                  <li>• Reprodução imediata</li>
                  <li>• Processamento em paralelo</li>
                  <li>• Chunks otimizados</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600">⚡ Performance</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Chunks de 60 caracteres</li>
                  <li>• Processamento paralelo</li>
                  <li>• Cache inteligente</li>
                  <li>• Baixa latência</li>
                  <li>• Auto-play habilitado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
