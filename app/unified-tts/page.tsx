'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UnifiedTTSPlayer from '@/components/audio/UnifiedTTSPlayer'
import { Volume2, Zap, Star, Info, CheckCircle } from 'lucide-react'

export default function UnifiedTTSDemoPage() {
  const [testText, setTestText] = useState('Olá! Este é um teste do sistema TTS unificado. Usa Gemini Native Audio como principal, com fallback automático para Google TTS e OpenAI TTS.')
  const [selectedVoice, setSelectedVoice] = useState('Zephyr')

  const voices = [
    { value: 'Zephyr', label: 'Zephyr', description: 'Neutra e equilibrada (Gemini)' },
    { value: 'Nova', label: 'Nova', description: 'Feminina jovem e energética (Gemini)' },
    { value: 'Echo', label: 'Echo', description: 'Masculina profunda (Gemini)' },
    { value: 'Fable', label: 'Fable', description: 'Feminina expressiva (Gemini)' },
    { value: 'Onyx', label: 'Onyx', description: 'Masculina autoritária (Gemini)' },
    { value: 'Shimmer', label: 'Shimmer', description: 'Feminina suave (Gemini)' }
  ]

  const sampleTexts = [
    'Olá! Este é um teste do sistema TTS unificado. Usa Gemini Native Audio como principal, com fallback automático para Google TTS e OpenAI TTS.',
    'A inteligência artificial está revolucionando a educação. Com o sistema TTS unificado, temos acesso à melhor tecnologia de síntese de voz disponível.',
    'O sistema detecta automaticamente qual provedor está funcionando e usa o melhor disponível. Gemini Native Audio oferece streaming em tempo real.',
    'Esta demonstração mostra como diferentes tecnologias podem trabalhar juntas para oferecer a melhor experiência de áudio possível.'
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Zap className="h-10 w-10 text-purple-600" />
          Sistema TTS Unificado
        </h1>
        <p className="text-lg text-muted-foreground">
          Gemini Native Audio + Fallback Inteligente para Google TTS e OpenAI TTS
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Star className="h-5 w-5" />
              Principal: Gemini Native
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">
              Usa Gemini 2.5 Flash Native Audio com streaming em tempo real e qualidade superior
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Volume2 className="h-5 w-5" />
              Fallback: Google TTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">
              Se Gemini falhar, usa Google TTS WaveNet com vozes em português brasileiro
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              Fallback: OpenAI TTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              Se ambos falharem, usa OpenAI TTS como último recurso para garantir funcionamento
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

        {/* TTS Player */}
        <div>
          <UnifiedTTSPlayer
            text={testText}
            voice={selectedVoice}
            autoPlay={false}
            enableFallback={true}
            className="w-full"
          />
        </div>
      </div>

      {/* How it Works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Como Funciona o Sistema Unificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-700">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-purple-900">Gemini Native Audio</h4>
                <p className="text-sm text-gray-700">
                  Tenta primeiro usar Gemini 2.5 Flash Native Audio com streaming em tempo real. 
                  Oferece a melhor qualidade e experiência.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Google TTS WaveNet</h4>
                <p className="text-sm text-gray-700">
                  Se Gemini falhar, usa Google TTS com vozes WaveNet em português brasileiro. 
                  Qualidade muito boa e confiável.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-700">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-green-900">OpenAI TTS</h4>
                <p className="text-sm text-gray-700">
                  Se ambos falharem, usa OpenAI TTS como último recurso. 
                  Garante que o áudio sempre funcione.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Alert className="mt-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema TTS Unificado</strong> oferece a melhor experiência possível combinando múltiplas tecnologias. 
          O usuário sempre recebe áudio de alta qualidade, independentemente de qual provedor esteja funcionando.
        </AlertDescription>
      </Alert>
    </div>
  )
}
