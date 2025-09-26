'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Play, Code, FileText, Download, Share2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { validateYoutubeUrl, getYoutubeEmbedUrl, getYouTubeVideoTitle } from '@/lib/youtube'

interface VideoLearningAppProps {
  initialUrl?: string
}

type LoadingState = 'idle' | 'validating' | 'generating-spec' | 'generating-code' | 'ready' | 'error'

export default function VideoLearningApp({ initialUrl = '' }: VideoLearningAppProps) {
  const [videoUrl, setVideoUrl] = useState(initialUrl)
  const [videoTitle, setVideoTitle] = useState('')
  const [spec, setSpec] = useState('')
  const [code, setCode] = useState('')
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('render')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const url = inputRef.current?.value.trim() || ''
    
    if (!url) {
      setError('Por favor, insira uma URL do YouTube')
      return
    }

    setLoadingState('validating')
    setError('')
    setVideoUrl('')
    setVideoTitle('')
    setSpec('')
    setCode('')

    try {
      // Validate URL
      const validation = await validateYoutubeUrl(url)
      if (!validation.isValid) {
        setError(validation.error || 'URL do YouTube inválida')
        setLoadingState('error')
        return
      }

      // Get video title
      try {
        const title = await getYouTubeVideoTitle(url)
        setVideoTitle(title)
      } catch (err) {
        console.warn('Could not fetch video title:', err)
      }

      setVideoUrl(url)
      setLoadingState('generating-spec')

      // Generate spec from video
      const specResponse = await fetch('/api/video-learning/generate-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      })

      if (!specResponse.ok) {
        throw new Error('Erro ao gerar especificação')
      }

      const specData = await specResponse.json()
      setSpec(specData.spec)
      setLoadingState('generating-code')

      // Generate code from spec
      const codeResponse = await fetch('/api/video-learning/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spec: specData.spec }),
      })

      if (!codeResponse.ok) {
        throw new Error('Erro ao gerar código')
      }

      const codeData = await codeResponse.json()
      setCode(codeData.code)
      setLoadingState('ready')
      setActiveTab('render')
      
      toast.success('Aplicação de aprendizado gerada com sucesso!')

    } catch (err) {
      console.error('Erro ao processar vídeo:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setLoadingState('error')
      toast.error('Erro ao processar vídeo')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && loadingState === 'idle') {
      handleSubmit()
    }
  }

  const downloadCode = () => {
    if (!code) return

    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `video-learning-app-${videoTitle.slice(0, 30) || 'app'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Código baixado!')
  }

  const shareApp = async () => {
    if (!code) return

    const shareData = {
      title: `Aplicação de Aprendizado: ${videoTitle}`,
      text: `Confira esta aplicação de aprendizado gerada a partir do vídeo: ${videoUrl}`,
      url: videoUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.text)
        toast.success('Link copiado para a área de transferência!')
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err)
      toast.error('Erro ao compartilhar aplicação')
    }
  }

  const renderLoadingState = () => {
    const messages = {
      'validating': 'Validando URL do YouTube...',
      'generating-spec': 'Analisando vídeo e gerando especificação...',
      'generating-code': 'Gerando aplicação interativa...',
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {messages[loadingState as keyof typeof messages]}
        </p>
      </div>
    )
  }

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
      <div className="text-6xl">⚠️</div>
      <h3 className="text-xl font-semibold">Erro</h3>
      <p className="text-muted-foreground">{error}</p>
      <Button onClick={() => setLoadingState('idle')}>
        Tentar Novamente
      </Button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Vídeo para Aplicação de Aprendizado
        </h1>
        <p className="text-muted-foreground">
          Transforme vídeos do YouTube em aplicações interativas de aprendizado usando IA
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>URL do YouTube</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="https://www.youtube.com/watch?v=..."
              defaultValue={initialUrl}
              onKeyDown={handleKeyDown}
              disabled={loadingState !== 'idle'}
              className="flex-1"
            />
            <Button 
              onClick={handleSubmit}
              disabled={loadingState !== 'idle'}
            >
              {loadingState === 'idle' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Gerar App
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      {videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>
              {videoTitle ? `Vídeo: ${videoTitle}` : 'Preview do Vídeo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={getYoutubeEmbedUrl(videoUrl)}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated App */}
      {loadingState === 'ready' && code && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aplicação de Aprendizado Gerada</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCode}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareApp}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(videoUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Vídeo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="render" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Renderizar
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Código
                </TabsTrigger>
                <TabsTrigger value="spec" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Especificação
                </TabsTrigger>
              </TabsList>

              <TabsContent value="render" className="mt-4">
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={code}
                    className="w-full h-96"
                    sandbox="allow-scripts"
                    title="Aplicação de Aprendizado"
                  />
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <div className="border rounded-lg overflow-hidden">
                  <pre className="bg-gray-900 text-gray-100 p-4 overflow-auto max-h-96 text-sm">
                    <code>{code}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="spec" className="mt-4">
                <div className="border rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">{spec}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Loading/Error States */}
      {loadingState !== 'idle' && loadingState !== 'ready' && (
        <Card>
          <CardContent className="p-8">
            {loadingState === 'error' ? renderErrorState() : renderLoadingState()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
