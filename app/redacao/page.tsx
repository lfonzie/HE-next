'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Send, Clock, Target, Sparkles } from 'lucide-react'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/redacao/FileUpload'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
  isOfficial?: boolean
  isAIGenerated?: boolean
}

interface RedacaoSubmission {
  theme: string
  content: string
  wordCount: number
}

export default function RedacaoPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()
  
  const [themes, setThemes] = useState<EnemTheme[]>([])
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingThemes, setIsLoadingThemes] = useState(true)
  const [wordCount, setWordCount] = useState(0)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [uploadedFileSize, setUploadedFileSize] = useState<number>(0)
  const [includeAIThemes, setIncludeAIThemes] = useState(false)
  const [isLoadingAIThemes, setIsLoadingAIThemes] = useState(false)

  const prepareThemes = useCallback((list: EnemTheme[]) => {
    return [...list]
      .map((theme) => {
        const isAITheme = theme.isAIGenerated || theme.year >= 2025 || theme.id?.startsWith('ai-')
        if (isAITheme) {
          return { ...theme, isAIGenerated: true, year: 2025 }
        }
        return { ...theme, isAIGenerated: false }
      })
      .sort((a, b) => {
        if (a.isAIGenerated && !b.isAIGenerated) return -1
        if (!a.isAIGenerated && b.isAIGenerated) return 1
        return b.year - a.year
      })
  }, [])

  // Carregar temas do ENEM
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const url = includeAIThemes ? '/api/redacao/temas?includeAI=true' : '/api/redacao/temas'
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setThemes(prepareThemes(data.themes || []))
        } else {
          // Fallback para temas estáticos se a API falhar
          setThemes(prepareThemes([
            {
              id: '2024-1',
              year: 2024,
              theme: 'Inclusão digital como direito de todos',
              description: 'Tema da redação ENEM 2024',
              isOfficial: true
            },
            {
              id: '2023-1',
              year: 2023,
              theme: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
              description: 'Tema da redação ENEM 2023',
              isOfficial: true
            },
            {
              id: '2022-1',
              year: 2022,
              theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
              description: 'Tema da redação ENEM 2022',
              isOfficial: true
            },
            {
              id: '2021-1',
              year: 2021,
              theme: 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil',
              description: 'Tema da redação ENEM 2021',
              isOfficial: true
            },
            {
              id: '2020-1',
              year: 2020,
              theme: 'O estigma associado às doenças mentais na sociedade brasileira',
              description: 'Tema da redação ENEM 2020',
              isOfficial: true
            },
            {
              id: '2019-1',
              year: 2019,
              theme: 'Democratização do acesso ao cinema no Brasil',
              description: 'Tema da redação ENEM 2019',
              isOfficial: true
            },
            {
              id: '2018-1',
              year: 2018,
              theme: 'Manipulação do comportamento do usuário pelo controle de dados na internet',
              description: 'Tema da redação ENEM 2018',
              isOfficial: true
            },
            {
              id: '2017-1',
              year: 2017,
              theme: 'Desafios para a formação educacional de surdos no Brasil',
              description: 'Tema da redação ENEM 2017',
              isOfficial: true
            },
            {
              id: '2016-1',
              year: 2016,
              theme: 'Caminhos para combater a intolerância religiosa no Brasil',
              description: 'Tema da redação ENEM 2016',
              isOfficial: true
            },
            {
              id: '2015-1',
              year: 2015,
              theme: 'A persistência da violência contra a mulher na sociedade brasileira',
              description: 'Tema da redação ENEM 2015',
              isOfficial: true
            }
          ]))
        }
      } catch (error) {
        console.error('Erro ao carregar temas:', error)
        addNotification({ type: 'error', title: 'Erro', message: 'Falha ao carregar temas de redação' })
      } finally {
        setIsLoadingThemes(false)
      }
    }

    loadThemes()
  }, [addNotification, includeAIThemes, prepareThemes])

  // Contar palavras em tempo real
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [content])

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

    if (!selectedTheme) {
      addNotification({ type: 'error', title: 'Erro', message: 'Selecione um tema para sua redação' })
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
          theme: selectedTheme,
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
    <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl mb-6">
            <FileText className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
            Redação ENEM
          </h1>
          <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
            Pratique sua redação com temas oficiais do ENEM
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              IA Avançada
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Personalizado
            </Badge>
          </div>
        </header>

        <div className="space-y-6">
          {/* Seleção de Tema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Tema da Redação
              </CardTitle>
              <CardDescription>
                Escolha um tema oficial do ENEM ou gerado por IA para praticar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingThemes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema..." />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{theme.year}</span>
                            {theme.isAIGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                🤖 IA
                              </Badge>
                            )}
                            {theme.isOfficial && (
                              <Badge variant="default" className="text-xs">
                                ✓ Oficial
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 truncate max-w-xs">
                            {theme.theme}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {selectedTheme && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    Tema Selecionado:
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {themes.find(t => t.id === selectedTheme)?.theme}
                  </p>
                  {themes.find(t => t.id === selectedTheme)?.isAIGenerated && (
                    <Badge variant="secondary" className="mt-2">
                      🤖 Gerado por IA
                    </Badge>
                  )}
                </div>
              )}

              {/* Botão para carregar temas de IA */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (includeAIThemes) {
                      setIncludeAIThemes(false)
                    } else {
                      setIsLoadingAIThemes(true)
                      try {
                        const response = await fetch('/api/redacao/temas/ai', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ count: 5 })
                        })
                        
                        if (response.ok) {
                          const data = await response.json()
                          const currentOfficialThemes = themes.filter(t => t.isOfficial)
                          setThemes(prepareThemes([...data.themes, ...currentOfficialThemes]))
                          setIncludeAIThemes(true)
                          addNotification({
                            type: 'success',
                            title: 'Temas Gerados!',
                            message: `${data.themes.length} novos temas foram gerados por IA`
                          })
                        } else {
                          throw new Error('Falha ao gerar temas')
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
                    }
                  }}
                  disabled={isLoadingAIThemes}
                  className="w-full"
                >
                  {isLoadingAIThemes ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando temas...
                    </>
                  ) : (
                    <>
                      🤖 {includeAIThemes ? 'Ocultar' : 'Gerar'} Temas com IA
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {includeAIThemes 
                    ? 'Temas de IA incluídos na lista' 
                    : 'Clique para gerar novos temas com IA'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Editor de Redação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Sua Redação
                  {uploadedFileName && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Carregado de: {uploadedFileName}
                    </Badge>
                  )}
                </span>
                <Badge variant="outline" className={getWordCountColor()}>
                  {wordCount} palavras - {getWordCountStatus()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Digite sua redação seguindo a estrutura dissertativa-argumentativa ou use o upload abaixo para carregar um arquivo
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  disabled={isSubmitting || !selectedTheme || wordCount < 100 || wordCount > 1000}
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
          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivo ou Foto</CardTitle>
              <CardDescription>Envie um arquivo (PDF, DOC, DOCX, TXT, MD) ou tire uma foto</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onTextExtracted={handleTextExtracted}
                onFileProcessed={handleFileProcessed}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dicas de Redação */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dicas para uma Boa Redação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">1</div>
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                  Domínio da Norma
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Gramática e ortografia corretas
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Compreensão
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Entender o tema proposto
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                  Organização
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Argumentos bem estruturados
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">4</div>
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Linguagem
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Mecanismos linguísticos
                </p>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-2">5</div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                  Intervenção
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Proposta de solução
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
