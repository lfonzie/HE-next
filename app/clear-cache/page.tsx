'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Volume2, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ClearCachePage() {
  const [testText, setTestText] = useState('Teste da nova voz WaveNet! Esta voz é muito mais natural e expressiva.')
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [cacheCleared, setCacheCleared] = useState(false)

  const clearAudioCache = () => {
    console.log('🧹 Limpando cache de áudio...');
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('google_tts_') || key.includes('tts_') || key.includes('audio_'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removido: ${key}`);
    });

    console.log(`✅ Cache limpo! ${keysToRemove.length} itens removidos.`);
    setCacheCleared(true);
    toast.success(`Cache limpo! ${keysToRemove.length} itens removidos.`);
  }

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
          voice: 'pt-BR-Wavenet-A', // Forçar voz WaveNet
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
      
      audio.onended = () => {
        console.log('Áudio reproduzido com sucesso')
      }
      
      audio.onerror = () => {
        toast.error('Erro ao reproduzir áudio')
      }
    }
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = 'teste-voz-wavenet.mp3'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download iniciado!')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🧹 Limpeza de Cache e Teste de Voz</h1>
        <p className="text-lg text-muted-foreground">
          Limpe o cache de áudio e teste a nova voz WaveNet
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Limpeza de Cache */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Limpeza de Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Se você ainda está ouvindo a voz antiga, pode ser devido ao cache do navegador. 
                Clique no botão abaixo para limpar o cache de áudio.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={clearAudioCache}
              className="w-full"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache de Áudio
            </Button>

            {cacheCleared && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Cache limpo com sucesso! Agora teste a nova voz WaveNet abaixo.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Teste de Voz */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Teste da Nova Voz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="flex gap-2">
              <Button 
                onClick={generateAudio} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Gerando...' : 'Gerar Áudio WaveNet'}
              </Button>
              
              {audioUrl && (
                <>
                  <Button 
                    onClick={playAudio}
                    variant="outline"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={downloadAudio}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Voz atual:</strong> pt-BR-Wavenet-A (Neural - Muito mais natural)<br/>
                <strong>Tamanho esperado:</strong> ~45-90KB (vs ~12KB da voz antiga)
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      {audioUrl && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🎵 Áudio Gerado com Nova Voz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">Voz: pt-BR-Wavenet-A (Neural)</p>
                <p className="text-sm text-muted-foreground">Texto: "{testText.substring(0, 100)}..."</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={playAudio}>
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button onClick={downloadAudio} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📋 Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Clique em "Limpar Cache de Áudio" para remover áudios antigos</li>
            <li>Digite um texto para testar</li>
            <li>Clique em "Gerar Áudio WaveNet"</li>
            <li>Reproduza o áudio para ouvir a diferença</li>
            <li>Se ainda estiver robotizada, recarregue a página (F5)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
