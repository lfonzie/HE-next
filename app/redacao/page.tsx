'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Send, Clock, Target } from 'lucide-react'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/redacao/FileUpload'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
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

  // Carregar temas do ENEM
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch('/api/redacao/temas')
        if (response.ok) {
          const data = await response.json()
          setThemes(data.themes || [])
        } else {
          // Fallback para temas estáticos se a API falhar
          setThemes([
            {
              id: '2023-1',
              year: 2023,
              theme: 'Desafios para o combate à invisibilidade e ao registro civil de pessoas em situação de rua no Brasil',
              description: 'Tema da redação ENEM 2023'
            },
            {
              id: '2022-1',
              year: 2022,
              theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
              description: 'Tema da redação ENEM 2022'
            },
            {
              id: '2021-1',
              year: 2021,
              theme: 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil',
              description: 'Tema da redação ENEM 2021'
            }
          ])
        }
      } catch (error) {
        console.error('Erro ao carregar temas:', error)
        addNotification({ type: 'error', title: 'Erro', message: 'Falha ao carregar temas de redação' })
      } finally {
        setIsLoadingThemes(false)
      }
    }

    loadThemes()
  }, [addNotification])

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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Redação ENEM
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                Pratique sua redação com temas oficiais do ENEM
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seleção de Tema */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Tema da Redação
              </CardTitle>
              <CardDescription>
                Escolha um tema oficial do ENEM para praticar
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
                          <span className="font-medium">{theme.year}</span>
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
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Tema Selecionado:
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {themes.find(t => t.id === selectedTheme)?.theme}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload de Arquivo */}
          <div className="lg:col-span-2">
            <FileUpload 
              onTextExtracted={handleTextExtracted}
              onFileProcessed={handleFileProcessed}
            />
          </div>
        </div>

        <div className="mt-6">
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
                Digite sua redação seguindo a estrutura dissertativa-argumentativa ou use o upload acima para carregar um arquivo
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
