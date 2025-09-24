'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SimpleAvatarPlayer from '@/components/avatar/SimpleAvatarPlayer'
import { Volume2, User, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestGoogleTTSPage() {
  const [testText, setTestText] = useState('Olá! Este é um teste do Google Text-to-Speech. A voz é natural e clara.')
  const [selectedVoice, setSelectedVoice] = useState('pt-BR-Standard-A')

  const voices = [
    { value: 'pt-BR-Standard-A', label: 'Voz Feminina Padrão (pt-BR-Standard-A)' },
    { value: 'pt-BR-Standard-B', label: 'Voz Masculina Padrão (pt-BR-Standard-B)' },
    { value: 'pt-BR-Standard-C', label: 'Voz Feminina Alternativa (pt-BR-Standard-C)' },
    { value: 'pt-BR-Wavenet-A', label: 'Voz Feminina Neural (pt-BR-Wavenet-A)' },
    { value: 'pt-BR-Wavenet-B', label: 'Voz Masculina Neural (pt-BR-Wavenet-B)' },
    { value: 'pt-BR-Wavenet-C', label: 'Voz Feminina Neural Alternativa (pt-BR-Wavenet-C)' }
  ]

  const sampleTexts = [
    'Olá! Este é um teste do Google Text-to-Speech. A voz é natural e clara.',
    'A inteligência artificial está revolucionando a educação. Com ferramentas como esta, podemos criar experiências de aprendizado mais envolventes.',
    'O Google Cloud Text-to-Speech oferece vozes de alta qualidade em mais de 40 idiomas, incluindo português brasileiro.',
    'Esta é uma demonstração de como a tecnologia pode melhorar a acessibilidade e tornar o conteúdo mais inclusivo para todos os usuários.'
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Teste do Google Text-to-Speech
          </h1>
          <p className="text-gray-600">
            Teste a configuração e experimente diferentes vozes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Configuração do Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voice Selection */}
              <div className="space-y-2">
                <Label htmlFor="voice">Voz</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma voz" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                Caracteres: {testText.length} / 1,000,000 (limite mensal gratuito)
              </div>
            </CardContent>
          </Card>

          {/* Avatar Player */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Avatar com Google TTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleAvatarPlayer 
                text={testText}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Comparação de Recursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Google TTS */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Google TTS
                </h3>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• 1M caracteres/mês grátis</li>
                  <li>• Vozes naturais</li>
                  <li>• Sem cartão necessário</li>
                  <li>• API estável</li>
                  <li>• Suporte a SSML</li>
                </ul>
              </div>

              {/* OpenAI TTS */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  OpenAI TTS
                </h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 6 vozes disponíveis</li>
                  <li>• Qualidade alta</li>
                  <li>• Modelos tts-1 e tts-1-hd</li>
                  <li>• Pago por uso</li>
                  <li>• Integração simples</li>
                </ul>
              </div>

              {/* Avatar Visual */}
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Avatar Visual
                </h3>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Sincronização labial</li>
                  <li>• Animações CSS</li>
                  <li>• Avatar simples</li>
                  <li>• Gratuito</li>
                  <li>• Personalizável</li>
                </ul>
              </div>
            </div>
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
