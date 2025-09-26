'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Volume2, Play, Pause, Download, Star } from 'lucide-react'
import { toast } from 'sonner'

export default function VoiceComparisonPage() {
  const [testText, setTestText] = useState('Olá! Esta é uma demonstração de voz sintética. Você pode notar a diferença na naturalidade e expressividade desta voz.')
  const [selectedVoice, setSelectedVoice] = useState('pt-BR-Wavenet-C')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const voices = [
    { 
      value: 'pt-BR-Standard-A', 
      label: 'Standard A (Feminina)', 
      description: 'Voz básica feminina - mais robotizada',
      quality: 'Básica',
      recommended: false
    },
    { 
      value: 'pt-BR-Standard-B', 
      label: 'Standard B (Masculina)', 
      description: 'Voz básica masculina - mais robotizada',
      quality: 'Básica',
      recommended: false
    },
    { 
      value: 'pt-BR-Standard-C', 
      label: 'Standard C (Feminina Alt)', 
      description: 'Voz básica feminina alternativa',
      quality: 'Básica',
      recommended: false
    },
    { 
      value: 'pt-BR-Wavenet-A', 
      label: 'WaveNet A (Feminina) ⭐', 
      description: 'Voz neural feminina - MUITO mais natural',
      quality: 'Alta',
      recommended: true
    },
    { 
      value: 'pt-BR-Wavenet-B', 
      label: 'WaveNet B (Masculina) ⭐', 
      description: 'Voz neural masculina - MUITO mais natural',
      quality: 'Alta',
      recommended: true
    },
    { 
      value: 'pt-BR-Wavenet-C', 
      label: 'WaveNet C (Feminina Alt) ⭐', 
      description: 'Voz neural feminina alternativa - MUITO mais natural (PADRÃO)',
      quality: 'Alta',
      recommended: true
    }
  ]

  const sampleTexts = [
    'Olá! Esta é uma demonstração de voz sintética. Você pode notar a diferença na naturalidade e expressividade desta voz.',
    'A inteligência artificial está revolucionando a educação. Com ferramentas como esta, podemos criar experiências de aprendizado mais envolventes.',
    'O Google Cloud Text-to-Speech oferece vozes de alta qualidade em mais de 40 idiomas, incluindo português brasileiro.',
    'Esta é uma demonstração de como a tecnologia pode melhorar a acessibilidade e tornar o conteúdo mais inclusivo para todos os usuários.'
  ]

  const generateAudio = async () => {
    if (!testText.trim()) {
      toast.error('Digite um texto para testar')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/tts/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText.trim(),
          voice: selectedVoice,
          speed: 1.0,
          pitch: 0.0
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar áudio')
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      
      setAudioUrl(url)
      toast.success('Áudio gerado com sucesso!')
      
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao gerar áudio')
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
      setIsPlaying(true)
      
      audio.onended = () => {
        setIsPlaying(false)
      }
      
      audio.onerror = () => {
        setIsPlaying(false)
        toast.error('Erro ao reproduzir áudio')
      }
    }
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `teste-voz-${selectedVoice}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download iniciado!')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🎤 Comparação de Vozes Google TTS</h1>
        <p className="text-lg text-muted-foreground">
          Teste diferentes vozes e encontre a mais natural para seu projeto
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Configuração de Voz
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
                        {voice.recommended && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {voices.find(v => v.value === selectedVoice)?.description}
              </p>
            </div>

            <div>
              <Label htmlFor="text">Texto para Teste</Label>
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

            <div className="flex gap-2">
              <Button 
                onClick={generateAudio} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Gerando...' : 'Gerar Áudio'}
              </Button>
              
              {audioUrl && (
                <>
                  <Button 
                    onClick={playAudio} 
                    disabled={isPlaying}
                    variant="outline"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    onClick={downloadAudio}
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações das Vozes */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Vozes Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {voices.map((voice) => (
                <div 
                  key={voice.value}
                  className={`p-4 rounded-lg border ${
                    voice.value === selectedVoice 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{voice.label}</h3>
                    {voice.recommended && <Star className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {voice.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      voice.quality === 'Alta' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {voice.quality}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ID: {voice.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Recomendações</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>⭐ <strong>WaveNet C (PADRÃO)</strong> - Voz feminina alternativa muito natural</li>
                <li>⭐ <strong>WaveNet A</strong> - Voz feminina neural</li>
                <li>⭐ <strong>WaveNet B</strong> - Voz masculina neural</li>
                <li>⚠️ <strong>Standard</strong> - Vozes básicas, mais robotizadas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      {audioUrl && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🎵 Áudio Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">Voz: {voices.find(v => v.value === selectedVoice)?.label}</p>
                <p className="text-sm text-muted-foreground">Texto: "{testText.substring(0, 100)}..."</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={playAudio} disabled={isPlaying}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button onClick={downloadAudio} variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
