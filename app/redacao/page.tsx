'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, FileText, Send, Clock, Target, Sparkles, X } from 'lucide-react'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/redacao/FileUpload'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

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
  const [generatedThemes, setGeneratedThemes] = useState<EnemTheme[]>([])
  const [showGeneratedModal, setShowGeneratedModal] = useState(false)

  const prepareThemes = useCallback((list: EnemTheme[]) => {
    return [...list]
      .map((theme) => {
        const isAITheme = theme.isAIGenerated || theme.year >= 2025 || theme.id?.startsWith('ai-')
        if (isAITheme) {
          return { ...theme, isAIGenerated: true }
        }
        return { ...theme, isAIGenerated: false }
      })
      .sort((a, b) => {
        // Priorizar temas gerados para a sessão atual
        if (a.isSessionGenerated && !b.isSessionGenerated) return -1
        if (!a.isSessionGenerated && b.isSessionGenerated) return 1
        // Depois temas de IA em geral
        if (a.isAIGenerated && !b.isAIGenerated) return -1
        if (!a.isAIGenerated && b.isAIGenerated) return 1
        return b.year - a.year
      })
  }, [])

  // Carregar temas do ENEM
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch('/api/redacao/temas')
        if (response.ok) {
          const data = await response.json()
          const preparedThemes = prepareThemes(data.themes || [])
          setThemes(preparedThemes)
        } else {
          console.error('Erro ao carregar temas:', response.statusText)
          addNotification({ type: 'error', title: 'Erro', message: 'Falha ao carregar temas de redação' })
        }
      } catch (error) {
        console.error('Erro ao carregar temas:', error)
        addNotification({ type: 'error', title: 'Erro', message: 'Falha ao carregar temas de redação' })
      } finally {
        setIsLoadingThemes(false)
      }
    }

    loadThemes()
  }, [addNotification, prepareThemes])

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

    const selectedThemeData = themes.find(t => t.id === selectedTheme)

    try {
      const response = await fetch('/api/redacao/avaliar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: selectedTheme,
          themeText: selectedThemeData?.theme,
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
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                🤖 IA
                              </Badge>
                            )}
                            {theme.isOfficial && (
                              <Badge variant="default" className="text-xs">
                                ✓ Oficial
                              </Badge>
                            )}
                            {selectedTheme === theme.id && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
                                ✓ Selecionado
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
                    {themes.find(t => t.id === selectedTheme)?.theme || 'Tema não encontrado'}
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
                    // Sempre gerar novos temas - não ocultar os existentes
                    if (!includeAIThemes) {
                      setIsLoadingAIThemes(true)
                      try {
                        const response = await fetch('/api/redacao/temas/ai', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ count: 3 })
                        })
                        
                        if (response.ok) {
                          const data = await response.json()
                          // Adicionar novos temas à lista existente
                          const sessionAIGeneratedThemes = data.themes.map((theme: any) => ({
                            ...theme,
                            isSessionGenerated: true // Marcar como gerado para esta sessão
                          }))
                          const allThemes = [...sessionAIGeneratedThemes, ...themes]
                          const preparedThemes = prepareThemes(allThemes)
                          setThemes(preparedThemes)
                          setIncludeAIThemes(true)
                          
                          // Salvar temas gerados para mostrar no modal
                          setGeneratedThemes(data.themes)
                          setShowGeneratedModal(true)
                          
                          // Manter seleção atual - não limpar
                          
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
                      🤖 Gerar Novos Temas com IA
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Clique para gerar novos temas com IA
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


        {/* Estrutura da Dissertação-Argumentativa */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Estrutura da Dissertação-Argumentativa
            </CardTitle>
            <CardDescription>
              Como estruturar sua redação seguindo o modelo ENEM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Introdução */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Introdução</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p><strong>Contextualizar</strong> o tema</p>
                  <p><strong>Apresentar</strong> tese clara</p>
                  <p><strong>Formas:</strong> conceituação, dados, metáfora, narração breve</p>
                </div>
              </div>

              {/* Desenvolvimento */}
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Desenvolvimento</h4>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                  <p><strong>Sustentar</strong> tese com argumentos</p>
                  <p><strong>Usar:</strong> fatos, opiniões, dados</p>
                  <p><strong>Recursos:</strong> conectores, exemplificações</p>
                </div>
              </div>

              {/* Conclusão */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Conclusão</h4>
                <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                  <p><strong>Proposta</strong> de intervenção</p>
                  <p><strong>Viável</strong> e detalhada</p>
                  <p><strong>Respeitar</strong> direitos humanos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como Evitar Nota Zero */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <span className="text-2xl mr-2">⚠️</span>
              Como NÃO Tirar Zero na Redação do ENEM
            </CardTitle>
            <CardDescription>
              Principais armadilhas que podem zerar sua redação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">❌ Causas de Nota Zero:</h4>
                <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span><strong>Fuga ao tema</strong> - Não abordar o tema proposto</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span><strong>Tipo textual errado</strong> - Não seguir dissertação-argumentativa</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span><strong>Ausência de intervenção</strong> - Não propor solução</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span><strong>Cópias</strong> - Repetir texto da coletânea</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span><strong>Menos de 7 linhas</strong> - Texto muito curto</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span><strong>Caligrafia ilegível</strong> - Texto incompreensível</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span><strong>Violar direitos humanos</strong> - Propostas discriminatórias</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">✅ Estratégias de Prevenção:</h4>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Leia atentamente</strong> a proposta e coletânea</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Planeje</strong> sua estrutura no rascunho</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Evite quebras</strong> semânticas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Escreva legível</strong> e dentro das margens</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Use caneta</strong> azul ou preta</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Respeite</strong> os direitos humanos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Proponha</strong> intervenção detalhada</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Dicas de Estudo */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Dicas de Estudo para Redação ENEM
            </CardTitle>
            <CardDescription>
              Práticas recomendadas baseadas na apostila oficial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📚 Leitura Diária</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Leia jornais, artigos acadêmicos e textos argumentativos para enriquecer seu vocabulário e argumentos.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✍️ Escrita Semanal</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Escreva pelo menos uma redação por semana com temas simulados para praticar a estrutura.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🔄 Revisão</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Revise suas correções e analise redações modelo nota 1000 para identificar padrões de sucesso.
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">👥 Grupos de Estudo</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Participe de grupos de discussão para receber feedback e trocar experiências com outros candidatos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Temas Gerados */}
        <Dialog open={showGeneratedModal} onOpenChange={setShowGeneratedModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                Temas Gerados por IA
              </DialogTitle>
              <DialogDescription>
                {generatedThemes.length} novos temas foram gerados especialmente para você
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {generatedThemes.map((theme, index) => (
                <Card key={theme.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            🤖 IA
                          </Badge>
                          <Badge variant="outline">
                            {theme.year}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                          {theme.theme}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {theme.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTheme(theme.id)
                          setShowGeneratedModal(false)
                          addNotification({
                            type: 'success',
                            title: 'Tema Selecionado!',
                            message: `Tema "${theme.theme}" foi selecionado com sucesso`
                          })
                        }}
                        className="ml-4"
                      >
                        Selecionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowGeneratedModal(false)}
              >
                Fechar
              </Button>
              <Button
                onClick={() => setShowGeneratedModal(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continuar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
