'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Volume2, 
  Play, 
  Pause, 
  Loader2,
  Info,
  Zap,
  Clock,
  Mic,
  Gauge
} from 'lucide-react'

interface TTSConfig {
  voice: string
  model: string
  speed: number
  format: string
  streaming: boolean
}

interface TTSConfigPanelProps {
  onConfigChange?: (config: TTSConfig) => void
  className?: string
}

export default function TTSConfigPanel({ onConfigChange, className = '' }: TTSConfigPanelProps) {
  const [config, setConfig] = useState<TTSConfig>({
    voice: 'alloy',
    model: 'tts-1',
    speed: 1.0,
    format: 'mp3',
    streaming: false
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const voices = [
    { 
      value: 'alloy', 
      label: 'Alloy', 
      description: 'Voz neutra e equilibrada',
      gender: 'Neutra',
      accent: 'Americana'
    },
    { 
      value: 'echo', 
      label: 'Echo', 
      description: 'Voz masculina profunda',
      gender: 'Masculina',
      accent: 'Americana'
    },
    { 
      value: 'fable', 
      label: 'Fable', 
      description: 'Voz feminina expressiva',
      gender: 'Feminina',
      accent: 'Britânica'
    },
    { 
      value: 'onyx', 
      label: 'Onyx', 
      description: 'Voz masculina autoritária',
      gender: 'Masculina',
      accent: 'Americana'
    },
    { 
      value: 'nova', 
      label: 'Nova', 
      description: 'Voz feminina jovem',
      gender: 'Feminina',
      accent: 'Americana'
    },
    { 
      value: 'shimmer', 
      label: 'Shimmer', 
      description: 'Voz feminina suave',
      gender: 'Feminina',
      accent: 'Americana'
    }
  ]

  const models = [
    {
      value: 'tts-1',
      label: 'TTS-1',
      description: 'Rápido e eficiente',
      speed: 'Muito rápido',
      quality: 'Boa',
      cost: '$0.015/1K chars'
    },
    {
      value: 'tts-1-hd',
      label: 'TTS-1-HD',
      description: 'Alta qualidade',
      speed: 'Rápido',
      quality: 'Excelente',
      cost: '$0.030/1K chars'
    }
  ]

  const formats = [
    { value: 'mp3', label: 'MP3', description: 'Compatível universalmente' },
    { value: 'opus', label: 'Opus', description: 'Melhor compressão' },
    { value: 'aac', label: 'AAC', description: 'Qualidade superior' },
    { value: 'flac', label: 'FLAC', description: 'Sem perda de qualidade' }
  ]

  const handleConfigChange = (key: keyof TTSConfig, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  const testVoice = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Olá! Este é um teste da voz selecionada. A qualidade do áudio está sendo avaliada.',
          voice: config.voice,
          model: config.model,
          speed: config.speed,
          format: config.format
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onplay = () => setIsPlaying(true)
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
      }
    } catch (error) {
      console.error('Erro ao testar voz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedVoice = voices.find(v => v.value === config.voice)
  const selectedModel = models.find(m => m.value === config.model)

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações Avançadas do TTS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Modelo de IA</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {models.map((model) => (
              <Card 
                key={model.value}
                className={`cursor-pointer transition-all ${
                  config.model === model.value 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleConfigChange('model', model.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{model.label}</h4>
                    <Badge variant={config.model === model.value ? 'default' : 'secondary'}>
                      {model.cost}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {model.speed}
                    </Badge>
                    <Badge variant="outline">
                      <Mic className="h-3 w-3 mr-1" />
                      {model.quality}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Voice Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Voz</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {voices.map((voice) => (
              <Card 
                key={voice.value}
                className={`cursor-pointer transition-all ${
                  config.voice === voice.value 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleConfigChange('voice', voice.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{voice.label}</h4>
                    <Badge variant="outline">{voice.gender}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{voice.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {voice.accent}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Velocidade de Fala</Label>
            <Badge variant="outline">
              <Gauge className="h-3 w-3 mr-1" />
              {config.speed}x
            </Badge>
          </div>
          <div className="space-y-2">
            <Slider
              value={[config.speed]}
              onValueChange={([value]) => handleConfigChange('speed', value)}
              min={0.25}
              max={4.0}
              step={0.25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.25x (Muito lento)</span>
              <span>1x (Normal)</span>
              <span>4x (Muito rápido)</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Formato de Áudio</Label>
          <Select value={config.format} onValueChange={(value) => handleConfigChange('format', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{format.label}</span>
                    <span className="text-xs text-gray-500 ml-2">{format.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Streaming Option */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Streaming de Áudio</Label>
            <p className="text-sm text-gray-600">
              Reproduzir áudio enquanto ainda está sendo gerado
            </p>
          </div>
          <Switch
            checked={config.streaming}
            onCheckedChange={(checked) => handleConfigChange('streaming', checked)}
          />
        </div>

        <Separator />

        {/* Test Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Testar Configuração</Label>
            <p className="text-sm text-gray-600">
              Ouça como ficará o áudio com as configurações atuais
            </p>
          </div>
          <Button
            onClick={testVoice}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Gerando...
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Reproduzindo
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Testar
              </>
            )}
          </Button>
        </div>

        {/* Current Configuration Summary */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Configuração Atual
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Modelo:</span> {selectedModel?.label}
              </div>
              <div>
                <span className="font-medium">Voz:</span> {selectedVoice?.label}
              </div>
              <div>
                <span className="font-medium">Velocidade:</span> {config.speed}x
              </div>
              <div>
                <span className="font-medium">Formato:</span> {config.format.toUpperCase()}
              </div>
              <div>
                <span className="font-medium">Streaming:</span> {config.streaming ? 'Ativado' : 'Desativado'}
              </div>
              <div>
                <span className="font-medium">Custo:</span> {selectedModel?.cost}
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
