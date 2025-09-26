'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import GeminiNativeAudioPlayer from '@/components/audio/GeminiNativeAudioPlayer'
import { Volume2, Zap, Star, Info } from 'lucide-react'

export default function GeminiNativeAudioDemoPage() {
  const [testText, setTestText] = useState('Olá! Este é um teste do Gemini 2.5 Flash Native Audio. Esta tecnologia oferece áudio muito mais natural e expressivo.')
  const [selectedVoice, setSelectedVoice] = useState('Zephyr')

  const voices = [
    { value: 'Zephyr', label: 'Zephyr', description: 'Voz neutra e equilibrada' },
    { value: 'Nova', label: 'Nova', description: 'Voz feminina jovem e energética' },
    { value: 'Echo', label: 'Echo', description: 'Voz masculina profunda' },
    { value: 'Fable', label: 'Fable', description: 'Voz feminina expressiva' },
    { value: 'Onyx', label: 'Onyx', description: 'Voz masculina autoritária' },
    { value: 'Shimmer', label: 'Shimmer', description: 'Voz feminina suave' }
  ]

  const sampleTexts = [
    'Olá! Este é um teste do Gemini 2.5 Flash Native Audio. Esta tecnologia oferece áudio muito mais natural e expressivo.',
    'A inteligência artificial está revolucionando a educação. Com ferramentas como o Gemini Native Audio, podemos criar experiências de aprendizado mais envolventes e naturais.',
    'O Gemini 2.5 Flash Native Audio representa um avanço significativo na síntese de voz, oferecendo qualidade de áudio superior e maior naturalidade na comunicação.',
    'Esta demonstração mostra como a tecnologia de áudio nativo pode melhorar a acessibilidade e tornar o conteúdo mais inclusivo para todos os usuários.'
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Zap className="h-10 w-10 text-purple-600" />
          Gemini 2.5 Flash Native Audio
        </h1>
        <p className="text-lg text-muted-foreground">
          Tecnologia de áudio nativo de última geração para síntese de voz ultra-natural
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Star className="h-5 w-5" />
              Qualidade Superior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">
              Áudio gerado com tecnologia neural avançada, muito mais natural que TTS tradicional
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Volume2 className="h-5 w-5" />
              Streaming em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">
              Geração de áudio em tempo real com streaming, sem espera por arquivos completos
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Zap className="h-5 w-5" />
              Múltiplas Vozes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              6 vozes diferentes disponíveis, cada uma com características únicas e expressivas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="voice">Selecione a Voz</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma voz" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>
                      <div className="flex items-center gap-2">
                        {voice.label}
                        <span className="text-xs text-muted-foreground">
                          - {voice.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="text">Texto para Conversão</Label>
              <Textarea
                id="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Digite o texto que deseja converter em voz..."
                rows={4}
              />
            </div>

            <div>
              <Label>Textos de Exemplo</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {sampleTexts.map((text, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setTestText(text)}
                    className="text-left justify-start h-auto p-2"
                  >
                    {text.substring(0, 60)}...
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <div>
          <GeminiNativeAudioPlayer
            text={testText}
            voice={selectedVoice}
            autoPlay={false}
            className="w-full"
          />
        </div>
      </div>

      {/* Comparison */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Comparação de Tecnologias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Google Cloud TTS</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Vozes WaveNet (boas)</li>
                <li>• Arquivo completo gerado</li>
                <li>• ~45-90KB por áudio</li>
                <li>• Qualidade: Boa</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">OpenAI TTS</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Vozes Alloy, Nova, etc.</li>
                <li>• Arquivo completo gerado</li>
                <li>• ~20-50KB por áudio</li>
                <li>• Qualidade: Muito Boa</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Gemini Native Audio ⭐</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Vozes Zephyr, Nova, etc.</li>
                <li>• Streaming em tempo real</li>
                <li>• Qualidade neural superior</li>
                <li>• Qualidade: Excelente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Alert className="mt-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Gemini 2.5 Flash Native Audio</strong> é uma tecnologia experimental que oferece síntese de voz de alta qualidade com streaming em tempo real. 
          Requer chave de API do Gemini configurada e está disponível apenas para usuários autorizados.
        </AlertDescription>
      </Alert>
    </div>
  )
}
