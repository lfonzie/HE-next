'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, FileText, Send, Clock, Target, Sparkles, X, Users, Brain } from 'lucide-react'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/redacao/FileUpload'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ModernHeader } from '@/components/layout/ModernHeader'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
  isOfficial?: boolean
  isAIGenerated?: boolean
  isSessionGenerated?: boolean
  createdAt?: string
}

interface RedacaoSubmission {
  theme: string
  content: string
  wordCount: number
}

function RedacaoPageContent() {
  const { user, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()
  
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [uploadedFileSize, setUploadedFileSize] = useState<number>(0)
  const [isLoadingAIThemes, setIsLoadingAIThemes] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<EnemTheme | null>(null)
  const [availableThemes, setAvailableThemes] = useState<EnemTheme[]>([])
  const [officialThemes, setOfficialThemes] = useState<EnemTheme[]>([])
  const [aiThemes, setAiThemes] = useState<EnemTheme[]>([])
  const [randomAiThemes, setRandomAiThemes] = useState<EnemTheme[]>([])
  const [showGeneratedModal, setShowGeneratedModal] = useState(false)
  const [generatedThemes, setGeneratedThemes] = useState<EnemTheme[]>([])

  // Contar palavras em tempo real
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [content])

  // Carregar temas automaticamente quando a página carrega
  useEffect(() => {
    const loadThemes = async () => {
      try {
        console.log('Carregando temas automaticamente...')
        const response = await fetch(`/api/redacao/temas?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Temas carregados:', data.officialThemes?.length || 0, 'oficiais +', data.aiThemes?.length || 0, 'IA')
          
          // Separar temas oficiais e de IA
          setOfficialThemes(data.officialThemes || [])
          setAiThemes(data.aiThemes || [])
          
          // Manter compatibilidade com código existente
          const allThemes = [...(data.officialThemes || []), ...(data.aiThemes || [])]
          setAvailableThemes(allThemes)
          
          addNotification({
            type: 'success',
            title: 'Temas Carregados!',
            message: `${data.officialCount || 0} temas oficiais + ${data.aiCount || 0} temas de IA disponíveis`
          })
        } else {
          console.warn('Erro ao carregar temas:', response.status)
          addNotification({
            type: 'error',
            title: 'Erro',
            message: 'Falha ao carregar temas. Tente novamente.'
          })
        }
      } catch (error) {
        console.error('Erro ao carregar temas:', error)
        addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Falha ao carregar temas. Verifique sua conexão.'
        })
      }
    }

    // Aguardar um pouco antes de carregar para evitar conflitos
    const timer = setTimeout(loadThemes, 1000)
    return () => clearTimeout(timer)
  }, []) // Removida dependência addNotification para evitar loop infinito

  // Função para carregar 5 temas aleatórios de IA
  const loadRandomAiThemes = async () => {
    try {
      console.log('Carregando 5 temas aleatórios de IA...')
      const response = await fetch(`/api/redacao/temas/random?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Temas aleatórios carregados:', data.themes?.length || 0)
        setRandomAiThemes(data.themes || [])
      } else {
        console.error('Erro ao carregar temas aleatórios:', response.statusText)
        setRandomAiThemes([])
      }
    } catch (error) {
      console.error('Erro ao carregar temas aleatórios:', error)
      setRandomAiThemes([])
    }
  }

  // Carregar temas aleatórios quando a página carrega
  useEffect(() => {
    loadRandomAiThemes()
  }, [])

  // Função para lidar com texto extraído de arquivo
  const handleTextExtracted = (text: string, extractedWordCount: number) => {
    setContent(text)
    setWordCount(extractedWordCount)
  }

  // Função para lidar com arquivo processado
  const handleFileProcessed = (fileName: string, fileSize: number) => {
    setUploadedFileName(fileName)
    setUploadedFileSize(fileSize)
  }

  const handleSubmit = async () => {
    if (!user) {
      addNotification({ type: 'error', title: 'Erro', message: 'Você precisa estar logado para enviar uma redação' })
      return
    }

    if (!currentTheme) {
      addNotification({ type: 'error', title: 'Erro', message: 'Gere um tema para sua redação' })
      return
    }

    if (content.trim().length < 100) {
      addNotification({ type: 'error', title: 'Erro', message: 'A redação deve ter pelo menos 100 palavras' })
      return
    }

    if (wordCount > 1000) {
      addNotification({ type: 'error', title: 'Erro', message: 'A redação não pode exceder 1000 palavras' })
      return
    }

    setIsSubmitting(true)
    addNotification({ type: 'info', title: 'Processando', message: 'Enviando redação para avaliação...' })

    try {
      const response = await fetch('/api/redacao/avaliar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: currentTheme.id,
          themeText: currentTheme.theme,
          content: content.trim(),
          wordCount,
          uploadedFileName: uploadedFileName || undefined,
          uploadedFileSize: uploadedFileSize || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao avaliar redação')
      }

      const result = await response.json()
      
      addNotification({ type: 'success', title: 'Sucesso', message: 'Redação avaliada com sucesso!' })
      
      // Redirecionar para página de resultados
      router.push(`/redacao/resultado/${result.sessionId}`)
      
    } catch (error) {
      console.error('Erro ao enviar redação:', error)
      addNotification({ type: 'error', title: 'Erro', message: error instanceof Error ? error.message : 'Falha ao avaliar redação' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWordCountColor = () => {
    if (wordCount < 100) return 'text-red-500'
    if (wordCount > 1000) return 'text-red-500'
    if (wordCount >= 300 && wordCount <= 800) return 'text-green-500'
    return 'text-yellow-500'
  }

  const getWordCountStatus = () => {
    if (wordCount < 100) return 'Muito curta'
    if (wordCount > 1000) return 'Muito longa'
    if (wordCount >= 300 && wordCount <= 800) return 'Ideal'
    return 'Aceitável'
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100">
      <ModernHeader showNavigation={true} showHome={true} />
      <div className="container mx-auto px-4 py-8 max-w-7xl pt-24" role="main">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
                  <FileText className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white fill-current" />
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Redação ENEM
              </h1>
              <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Pratique sua redação com temas oficiais do ENEM e avaliação por IA
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <Sparkles className="h-4 w-4" />
                  IA Avançada
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-100 text-orange-800 border border-orange-200">
                  <Target className="h-4 w-4" />
                  Personalizado
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 border border-red-200">
                  <Users className="h-4 w-4" />
                  Interativo
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 border border-green-200">
                  <Brain className="h-4 w-4" />
                  Inteligente
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Temas Oficiais</h3>
                  <p className="text-sm text-yellow-700">Banco completo com temas reais do ENEM</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-orange-900 mb-2">Avaliação IA</h3>
                  <p className="text-sm text-orange-700">Correção automática seguindo critérios ENEM</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-red-900 mb-2">Feedback Detalhado</h3>
                  <p className="text-sm text-red-700">Análise completa com sugestões de melhoria</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Seleção de Tema */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                Tema da Redação
              </CardTitle>
              <CardDescription className="text-yellow-100 text-lg mt-2">
                Escolha um tema oficial do ENEM ou gerado por IA para praticar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {!currentTheme && officialThemes.length === 0 && randomAiThemes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum tema disponível</p>
                  <p className="text-sm">Carregando temas...</p>
                </div>
              ) : null}

              {!currentTheme && (officialThemes.length > 0 || randomAiThemes.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Temas Oficiais - Todos */}
                  {officialThemes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          📚 ENEM
                        </Badge>
                        Temas Oficiais (Todos)
                      </h4>
                      <Select onValueChange={(value) => {
                        const theme = officialThemes.find(t => t.id === value)
                        if (theme) setCurrentTheme(theme)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tema oficial do ENEM" />
                        </SelectTrigger>
                        <SelectContent>
                          {officialThemes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{theme.theme}</span>
                                <span className="text-xs text-gray-500">ENEM {theme.year}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Temas de IA - 5 Exemplos Aleatórios */}
                  {randomAiThemes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          🤖 IA
                        </Badge>
                        Exemplos Aleatórios ({randomAiThemes.length})
                      </h4>
                      <Select onValueChange={(value) => {
                        const theme = randomAiThemes.find(t => t.id === value)
                        if (theme) setCurrentTheme(theme)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tema gerado por IA" />
                        </SelectTrigger>
                        <SelectContent>
                          {randomAiThemes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{theme.theme}</span>
                                <span className="text-xs text-gray-500">Gerado por IA</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ) : null}
              
              {currentTheme && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                        Tema Selecionado:
                      </h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                        {currentTheme.theme}
                      </p>
                      {currentTheme.isAIGenerated ? (
                        <Badge variant="secondary" className="text-xs">
                          🤖 Gerado por IA
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          📚 ENEM {currentTheme.year}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setCurrentTheme(null)
                        setAvailableThemes([])
                      }}
                    >
                      Trocar Tema
                    </Button>
                  </div>
                </div>
              )}

              {/* Botão para carregar temas de IA */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // Sempre gerar novo tema
                      setIsLoadingAIThemes(true)
                      try {
                        console.log('Iniciando requisição para API...')
                        const response = await fetch(`/api/redacao/temas/ai?t=${Date.now()}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                          },
                          body: JSON.stringify({ count: 1 })
                        })
                        console.log('Resposta recebida:', response.status, response.statusText)
                        
                        if (response.ok) {
                          const data = await response.json()
                          console.log('Dados recebidos da API:', data)
                          
                          // Recarregar todos os temas para incluir os novos gerados
                          const themesResponse = await fetch(`/api/redacao/temas?t=${Date.now()}`, {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                              'Cache-Control': 'no-cache',
                              'Pragma': 'no-cache'
                            }
                          })
                          
                          if (themesResponse.ok) {
                            const themesData = await themesResponse.json()
                            setOfficialThemes(themesData.officialThemes || [])
                            setAiThemes(themesData.aiThemes || [])
                            const allThemes = [...(themesData.officialThemes || []), ...(themesData.aiThemes || [])]
                            setAvailableThemes(allThemes)
                          }
                          
                          addNotification({
                            type: 'success',
                            title: 'Temas Gerados!',
                            message: `Novos temas foram gerados com IA. Escolha um para começar.`
                          })
                        } else {
                          const errorData = await response.json()
                          throw new Error(errorData.message || 'Falha ao carregar temas')
                        }
                      } catch (error) {
                        console.error('Erro ao gerar temas:', error)
                        addNotification({
                          type: 'error',
                          title: 'Erro',
                          message: 'Falha ao gerar temas com IA'
                        })
                      } finally {
                        setIsLoadingAIThemes(false)
                      }
                  }}
                  disabled={isLoadingAIThemes}
                  className="w-full"
                >
                  {isLoadingAIThemes ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando tema...
                    </>
                  ) : (
                    <>
                      🤖 {availableThemes.length > 0 ? 'Gerar Novos Temas com IA' : 'Gerar Temas com IA'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {availableThemes.length > 0 ? 'Clique para gerar novos temas únicos com IA' : 'Clique para gerar temas únicos com IA'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Editor de Redação */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  Sua Redação
                  {uploadedFileName && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-white/20 text-white border-white/30">
                      Carregado de: {uploadedFileName}
                    </Badge>
                  )}
                </span>
                <Badge variant="outline" className={`${getWordCountColor()} bg-white/20 border-white/30 text-white`}>
                  {wordCount} palavras - {getWordCountStatus()}
                </Badge>
              </CardTitle>
              <CardDescription className="text-yellow-100 text-lg mt-2">
                Digite sua redação seguindo a estrutura dissertativa-argumentativa ou use o upload abaixo para carregar um arquivo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite sua redação aqui... Lembre-se de seguir a estrutura: introdução, desenvolvimento e conclusão com proposta de intervenção."
                  className="min-h-[400px] resize-none"
                  maxLength={10000}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Tempo sugerido: 1h30min
                    </span>
                    <span>Mínimo: 100 palavras | Máximo: 1000 palavras</span>
                  </div>
                  <span>{content.length}/10000 caracteres</span>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !currentTheme || wordCount < 100 || wordCount > 1000}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Avaliando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para Avaliação
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload de Arquivo */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Send className="h-6 w-6" />
                </div>
                Upload de Arquivo ou Foto
              </CardTitle>
              <CardDescription className="text-yellow-100 text-lg mt-2">
                Envie um arquivo (PDF, DOC, DOCX, TXT, MD) ou tire uma foto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <FileUpload 
                onTextExtracted={handleTextExtracted}
                onFileProcessed={handleFileProcessed}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function RedacaoPage() {
  return (
    <ProtectedRoute>
      <RedacaoPageContent />
    </ProtectedRoute>
  )
}