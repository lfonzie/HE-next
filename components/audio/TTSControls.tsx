'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Volume2, Settings, Play, Pause } from 'lucide-react'
import { toast } from 'sonner'

interface TTSConfig {
  enabled: boolean
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  model: 'tts-1' | 'tts-1-hd'
  autoPlay: boolean
}

interface TTSControlsProps {
  onConfigChange?: (config: TTSConfig) => void
  className?: string
}

const voiceOptions = [
  { value: 'alloy', label: 'Alloy (Neutra)', description: 'Voz equilibrada e clara' },
  { value: 'echo', label: 'Echo (Masculina)', description: 'Voz masculina profunda' },
  { value: 'fable', label: 'Fable (Feminina)', description: 'Voz feminina suave' },
  { value: 'onyx', label: 'Onyx (Masculina)', description: 'Voz masculina autoritativa' },
  { value: 'nova', label: 'Nova (Feminina)', description: 'Voz feminina jovem' },
  { value: 'shimmer', label: 'Shimmer (Feminina)', description: 'Voz feminina expressiva' }
]

const modelOptions = [
  { value: 'tts-1', label: 'TTS-1 (Rápido)', description: 'Geração rápida, qualidade padrão' },
  { value: 'tts-1-hd', label: 'TTS-1-HD (Alta Qualidade)', description: 'Qualidade superior, mais lento' }
]

export default function TTSControls({ onConfigChange, className = '' }: TTSControlsProps) {
  const [config, setConfig] = useState<TTSConfig>({
    enabled: true,
    voice: 'alloy',
    model: 'tts-1',
    autoPlay: false
  })

  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

  const handleConfigChange = (newConfig: Partial<TTSConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    onConfigChange?.(updatedConfig)
  }

  const previewVoice = async () => {
    if (isPreviewPlaying) return

    setIsPreviewPlaying(true)
    
    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Esta é uma prévia da voz selecionada. Você pode ajustar as configurações conforme sua preferência.',
          voice: config.voice,
          model: config.model
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar prévia')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        setIsPreviewPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      audio.onerror = () => {
        setIsPreviewPlaying(false)
        URL.revokeObjectURL(audioUrl)
        toast.error('Erro ao reproduzir prévia')
      }
      
      await audio.play()
      
    } catch (error) {
      setIsPreviewPlaying(false)
      console.error('Preview error:', error)
      toast.error('Erro ao gerar prévia da voz')
    }
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Volume2 className="h-5 w-5" />
          Configurações de Áudio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable TTS */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="tts-enabled">Ativar Text-to-Speech</Label>
            <p className="text-sm text-gray-500">
              Converter texto dos slides em áudio
            </p>
          </div>
          <Switch
            id="tts-enabled"
            checked={config.enabled}
            onCheckedChange={(enabled) => handleConfigChange({ enabled })}
          />
        </div>

        {config.enabled && (
          <>
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label htmlFor="voice-select">Voz</Label>
              <Select
                value={config.voice}
                onValueChange={(voice) => handleConfigChange({ voice: voice as any })}
              >
                <SelectTrigger id="voice-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model-select">Modelo</Label>
              <Select
                value={config.model}
                onValueChange={(model) => handleConfigChange({ model: model as any })}
              >
                <SelectTrigger id="model-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-play */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoplay">Reprodução Automática</Label>
                <p className="text-sm text-gray-500">
                  Reproduzir áudio automaticamente ao carregar slide
                </p>
              </div>
              <Switch
                id="autoplay"
                checked={config.autoPlay}
                onCheckedChange={(autoPlay) => handleConfigChange({ autoPlay })}
              />
            </div>

            {/* Preview Button */}
            <div className="pt-2">
              <Button
                onClick={previewVoice}
                disabled={isPreviewPlaying}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isPreviewPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Reproduzindo...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Prévia da Voz
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
