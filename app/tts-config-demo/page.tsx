'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import TTSConfigPanel from '@/components/tts/TTSConfigPanel'
import AudioPlayer from '@/components/audio/AudioPlayer'
import { 
  Settings, 
  Play, 
  Volume2, 
  Zap, 
  Clock, 
  Mic,
  Info,
  CheckCircle
} from 'lucide-react'

interface TTSConfig {
  voice: string
  model: string
  speed: number
  format: string
  streaming: boolean
}

export default function TTSConfigDemoPage() {
  const [testText, setTestText] = useState('Olá! Este é um teste das configurações avançadas do TTS da OpenAI. Você pode ajustar a voz, velocidade, modelo e formato do áudio.')
  const [ttsConfig, setTtsConfig] = useState<TTSConfig>({
    voice: 'alloy',
    model: 'tts-1',
    speed: 1.0,
    format: 'mp3',
    streaming: false
  })

  const sampleTexts = [
    'Olá! Este é um teste das configurações avançadas do TTS da OpenAI.',
    'A inteligência artificial está revolucionando a educação com vozes naturais e personalizáveis.',
    'Com diferentes modelos e vozes, podemos criar experiências de aprendizado únicas para cada aluno.',
    'A velocidade da fala pode ser ajustada de 0.25x até 4x para diferentes necessidades de aprendizado.',
    'Formatos como MP3, Opus, AAC e FLAC oferecem diferentes qualidades e tamanhos de arquivo.'
  ]

  const handleConfigChange = (config: TTSConfig) => {
    setTtsConfig(config)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Configurações Avançadas do TTS OpenAI
          </h1>
          <p className="text-gray-600">
            Explore todas as opções disponíveis para personalizar a síntese de voz
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <TTSConfigPanel 
              onConfigChange={handleConfigChange}
              className="w-full"
            />

            {/* Test Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Texto para Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-text">Digite o texto que deseja converter em fala</Label>
                  <Textarea
                    id="test-text"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Digite aqui o texto para testar..."
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
                  Caracteres: {testText.length} / 4,096 (limite da API)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Player */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Player de Áudio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AudioPlayer 
                  text={testText}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Current Configuration */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Settings className="h-5 w-5" />
                  Configuração Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <span><strong>Voz:</strong> {ttsConfig.voice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span><strong>Modelo:</strong> {ttsConfig.model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span><strong>Velocidade:</strong> {ttsConfig.speed}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <span><strong>Formato:</strong> {ttsConfig.format.toUpperCase()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Recursos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Voices */}
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <h4 className="font-semibold text-purple-800 mb-2">6 Vozes Disponíveis</h4>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• <strong>Alloy</strong> - Neutra e equilibrada</li>
                      <li>• <strong>Echo</strong> - Masculina profunda</li>
                      <li>• <strong>Fable</strong> - Feminina expressiva</li>
                      <li>• <strong>Onyx</strong> - Masculina autoritária</li>
                      <li>• <strong>Nova</strong> - Feminina jovem</li>
                      <li>• <strong>Shimmer</strong> - Feminina suave</li>
                    </ul>
                  </div>

                  {/* Models */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2">2 Modelos de IA</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• <strong>TTS-1</strong> - Rápido ($0.015/1K chars)</li>
                      <li>• <strong>TTS-1-HD</strong> - Alta qualidade ($0.030/1K chars)</li>
                    </ul>
                  </div>

                  {/* Speed */}
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold text-green-800 mb-2">Controle de Velocidade</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• <strong>0.25x</strong> - Muito lento</li>
                      <li>• <strong>1.0x</strong> - Velocidade normal</li>
                      <li>• <strong>4.0x</strong> - Muito rápido</li>
                      <li>• Incrementos de 0.25x</li>
                    </ul>
                  </div>

                  {/* Formats */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <h4 className="font-semibold text-orange-800 mb-2">4 Formatos de Áudio</h4>
                    <ul className="text-orange-700 text-sm space-y-1">
                      <li>• <strong>MP3</strong> - Compatível universalmente</li>
                      <li>• <strong>Opus</strong> - Melhor compressão</li>
                      <li>• <strong>AAC</strong> - Qualidade superior</li>
                      <li>• <strong>FLAC</strong> - Sem perda de qualidade</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <CheckCircle className="h-5 w-5" />
                  Informações de Custo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-700 space-y-2">
                <ul className="space-y-1">
                  <li>• <strong>TTS-1:</strong> $0.015 por 1K caracteres</li>
                  <li>• <strong>TTS-1-HD:</strong> $0.030 por 1K caracteres</li>
                  <li>• <strong>Limite:</strong> 4,096 caracteres por requisição</li>
                  <li>• <strong>Exemplo:</strong> 1000 caracteres ≈ $0.015-$0.030</li>
                  <li>• <strong>Cache:</strong> Economiza custos com armazenamento local</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

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
