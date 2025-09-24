'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import OpenAIAvatarPlayer from '@/components/avatar/OpenAIAvatarPlayer'
import { Volume2, User, CheckCircle, AlertCircle, Zap } from 'lucide-react'

export default function TestOpenAIAvatarPage() {
  const [testText, setTestText] = useState('Olá! Este é um teste do OpenAI Text-to-Speech com avatar animado. A voz é natural e clara.')

  const sampleTexts = [
    'Olá! Este é um teste do OpenAI Text-to-Speech com avatar animado. A voz é natural e clara.',
    'A inteligência artificial está revolucionando a educação. Com avatares animados, podemos criar experiências de aprendizado mais envolventes e interativas.',
    'O OpenAI Text-to-Speech oferece 6 vozes diferentes de alta qualidade, incluindo vozes masculinas e femininas com características únicas.',
    'Esta é uma demonstração de como a tecnologia pode melhorar a acessibilidade e tornar o conteúdo mais inclusivo para todos os usuários.',
    'Com o avatar animado, os alunos podem ver visualmente quando o texto está sendo lido, criando uma experiência mais rica e envolvente.'
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Teste do OpenAI TTS + Avatar
          </h1>
          <p className="text-gray-600">
            Teste o avatar animado com as vozes da OpenAI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Configuração do Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="text">Texto para Teste</Label>
                <Textarea
                  id="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Digite o texto que deseja converter em fala..."
                  rows={4}
                />
              </div>

              {/* Sample Texts */}
              <div className="space-y-2">
                <Label>Textos de Exemplo</Label>
                <div className="space-y-2">
                  {sampleTexts.map((sample, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setTestText(sample)}
                      className="w-full text-left justify-start h-auto p-2"
                    >
                      {sample.substring(0, 60)}...
                    </Button>
                  ))}
                </div>
              </div>

              {/* Character Count */}
              <div className="text-sm text-gray-500">
                Caracteres: {testText.length}
              </div>
            </CardContent>
          </Card>

          {/* Avatar Player */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Avatar OpenAI TTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OpenAIAvatarPlayer 
                text={testText}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos do Avatar OpenAI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voices */}
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Vozes Disponíveis
                </h3>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• <strong>Alloy</strong> - Voz neutra e clara</li>
                  <li>• <strong>Echo</strong> - Voz masculina profunda</li>
                  <li>• <strong>Fable</strong> - Voz feminina expressiva</li>
                  <li>• <strong>Onyx</strong> - Voz masculina autoritária</li>
                  <li>• <strong>Nova</strong> - Voz feminina jovem</li>
                  <li>• <strong>Shimmer</strong> - Voz feminina suave</li>
                </ul>
              </div>

              {/* Features */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Recursos
                </h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Avatar animado sincronizado</li>
                  <li>• Controle de velocidade (0.5x - 2x)</li>
                  <li>• Controles de volume</li>
                  <li>• Barra de progresso</li>
                  <li>• Cache inteligente</li>
                  <li>• Seleção de voz</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Info */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Informações de Custo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700 space-y-2">
            <ul className="space-y-1">
              <li>• <strong>Custo</strong>: ~$0.015 por 1K caracteres</li>
              <li>• <strong>Qualidade</strong>: Alta qualidade de áudio</li>
              <li>• <strong>Modelos</strong>: tts-1 (rápido) e tts-1-hd (alta qualidade)</li>
              <li>• <strong>Cache</strong>: Economiza custos com cache local</li>
              <li>• <strong>Exemplo</strong>: 1000 caracteres ≈ $0.015</li>
            </ul>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
}
