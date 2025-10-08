'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Send, Clock, Sparkles, Brain } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import RedacaoTimer from '@/components/redacao/RedacaoTimer'
import { EmbedWrapper } from '@/components/embed/EmbedWrapper'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
  isOfficial?: boolean
  isAIGenerated?: boolean
}

function RedacaoEmbedContent() {
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [showTimer, setShowTimer] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<EnemTheme | null>(null)
  const [availableThemes, setAvailableThemes] = useState<EnemTheme[]>([])
  const [officialThemes, setOfficialThemes] = useState<EnemTheme[]>([])
  const [isLoadingThemes, setIsLoadingThemes] = useState(false)

  // Contar palavras em tempo real
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [content])

  // Carregar temas
  useEffect(() => {
    const loadThemes = async () => {
      setIsLoadingThemes(true)
      try {
        const response = await fetch(`/api/redacao/temas?t=${Date.now()}`)
        
        if (response.ok) {
          const data = await response.json()
          
          setOfficialThemes(data.officialThemes || [])
          const allThemes = [...(data.officialThemes || []), ...(data.aiThemes || [])]
          setAvailableThemes(allThemes)
          
          // Selecionar tema aleatório
          if (allThemes.length > 0) {
            const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)]
            setCurrentTheme(randomTheme)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar temas:', error)
        toast({
          title: 'Erro',
          description: 'Falha ao carregar temas',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingThemes(false)
      }
    }

    loadThemes()
  }, [toast])

  const handleSubmit = async () => {
    if (!currentTheme) {
      toast({
        title: 'Erro',
        description: 'Selecione um tema primeiro',
        variant: 'destructive'
      })
      return
    }

    if (wordCount < 10) {
      toast({
        title: 'Redação muito curta',
        description: 'Escreva pelo menos 10 palavras',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/redacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: currentTheme.theme,
          content: content,
          wordCount: wordCount,
          isEmbed: true
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao enviar redação')
      }

      const result = await response.json()

      toast({
        title: 'Redação enviada!',
        description: 'Sua redação foi avaliada com sucesso',
      })

      // Mostrar resultados (você pode personalizar isso)
      if (result.sessionId) {
        // Abrir resultado em nova aba ou mostrar modal
        window.open(`/redacao/resultado/${result.sessionId}`, '_blank')
      }

      // Limpar formulário
      setContent('')
      setShowTimer(false)

    } catch (error) {
      console.error('Erro ao enviar redação:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao enviar redação. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWordCountColor = () => {
    if (wordCount < 200) return 'text-red-500'
    if (wordCount < 300) return 'text-yellow-500'
    if (wordCount > 400) return 'text-blue-500'
    return 'text-green-500'
  }

  const getWordCountBadge = () => {
    if (wordCount === 0) return <Badge variant="outline">0 palavras</Badge>
    if (wordCount < 200) return <Badge variant="destructive">{wordCount} palavras - Muito curto</Badge>
    if (wordCount < 300) return <Badge className="bg-yellow-500">{wordCount} palavras - Bom</Badge>
    if (wordCount > 400) return <Badge className="bg-blue-500">{wordCount} palavras - Extenso</Badge>
    return <Badge className="bg-green-500">{wordCount} palavras - Ótimo!</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <div className="container mx-auto px-3 py-6 max-w-5xl">
        {/* Header compacto */}
        <header className="text-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
              Redação ENEM
            </h1>
            <p className="text-base text-gray-600">
              Pratique sua redação com temas oficiais e avaliação por IA
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Área de Escrita */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-yellow-600" />
                    Sua Redação
                  </CardTitle>
                  <div className="flex gap-2">
                    {getWordCountBadge()}
                    {showTimer && <RedacaoTimer isEvaluating={isSubmitting} />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  placeholder="Comece a escrever sua redação aqui..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] text-base leading-relaxed resize-none"
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant={showTimer ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowTimer(!showTimer)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {showTimer ? 'Timer Ativo' : 'Iniciar Timer'}
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !currentTheme || wordCount < 10}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar para Correção
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Tema */}
          <div className="space-y-4">
            {/* Tema Atual */}
            <Card className="shadow-lg border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-600" />
                  Tema da Redação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isLoadingThemes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
                  </div>
                ) : currentTheme ? (
                  <div>
                    <div className="mb-3">
                      <Badge variant={currentTheme.isOfficial ? "default" : "secondary"}>
                        {currentTheme.isOfficial ? `ENEM ${currentTheme.year}` : 'IA'}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{currentTheme.theme}</h3>
                    <p className="text-sm text-gray-600">{currentTheme.description}</p>
                    
                    <div className="mt-4">
                      <Select
                        value={currentTheme.id}
                        onValueChange={(value) => {
                          const theme = availableThemes.find(t => t.id === value)
                          if (theme) setCurrentTheme(theme)
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um tema" />
                        </SelectTrigger>
                        <SelectContent>
                          {officialThemes.length > 0 && (
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                              Temas Oficiais
                            </div>
                          )}
                          {officialThemes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              {theme.year} - {theme.theme.substring(0, 40)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum tema disponível
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card className="shadow-lg border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  Dicas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="text-xs space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Mantenha entre 250-300 palavras (ideal ENEM)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Estruture em 4 parágrafos: introdução, 2 desenvolvimentos e conclusão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Apresente proposta de intervenção completa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Use argumentos consistentes e fundamentados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RedacaoEmbedPage() {
  return (
    <EmbedWrapper module="redacao">
      <RedacaoEmbedContent />
    </EmbedWrapper>
  )
}

