'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, RefreshCw, Users, Bug, BookOpen, Sparkles, Target } from 'lucide-react'
import { SessionGuard } from '@/components/auth/SessionGuard'
import { useAulaGeneration } from '@/hooks/useAulaGeneration'
import { useAulaCache } from '@/hooks/useAulaCache'
import { useAulaProgress } from '@/hooks/useAulaProgress'
import AulaGenerator from './AulaGenerator'
import AulaPreview from './AulaPreview'
import AulaProgress from './AulaProgress'
import AulaSuggestions from './AulaSuggestions'

export default function AulasPageRefactored() {
  const router = useRouter()
  
  // Custom hooks
  const {
    formData,
    formErrors,
    generationState,
    setFormData,
    generateLesson,
    handleSuggestionClick,
    handleKeyPress,
    resetGeneration,
    isGenerating,
    generatedLesson,
    generationProgress,
    generationStatus,
    elapsedTime
  } = useAulaGeneration()

  const { setLesson, getLesson, hasLesson } = useAulaCache()
  const { formattedTime } = useAulaProgress()

  // Timer effect for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isGenerating && generationState.startTime) {
      interval = setInterval(() => {
        // Timer is handled by useAulaProgress hook
      }, 100)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating, generationState.startTime])

  const handleStartLesson = () => {
    if (!generatedLesson) {
      console.error('Nenhuma aula gerada para iniciar')
      return
    }
    
    console.log('🚀 Iniciando aula com ID:', generatedLesson.id)
    console.log('📊 Dados da aula:', generatedLesson)
    
    // Verificar se o ID existe e é válido
    const lessonId = generatedLesson.id
    if (!lessonId || lessonId === '') {
      console.error('❌ ID da aula inválido:', lessonId)
      return
    }
    
    // Salvar aula no localStorage para modo demo
    try {
      localStorage.setItem(`demo_lesson_${lessonId}`, JSON.stringify(generatedLesson))
      console.log('💾 Aula salva no localStorage:', lessonId)
    } catch (storageError) {
      console.warn('⚠️ Erro ao salvar no localStorage:', storageError)
    }
    
    // Salvar no cache
    setLesson(lessonId, generatedLesson)
    
    try {
      const targetUrl = `/aulas/${lessonId}`
      console.log('🎯 Navegando para:', targetUrl)
      
      router.push(targetUrl)
      
    } catch (error) {
      console.error('❌ Erro ao navegar para a aula:', error)
    }
  }

  const handleSaveLesson = async () => {
    if (!generatedLesson) return

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Aula salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar aula. Tente novamente.')
    }
  }

  return (
    <SessionGuard>
      <div className="container mx-auto px-4 py-8 max-w-6xl" role="main">
        {/* Header quando aula foi gerada */}
        {generatedLesson && (
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
                  Aula Gerada com Sucesso!
                </h1>
                <p className="text-lg text-gray-600">{generatedLesson.title || "Título da Aula"}</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={resetGeneration}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Gerar Nova Aula
              </Button>
              <Button 
                onClick={handleStartLesson}
                className="bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Iniciar Aula
              </Button>
              <Button 
                onClick={() => setShowDebugger(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Bug className="h-4 w-4" />
                Debug
              </Button>
            </div>
          </header>
        )}

        {/* Enhanced Header - Oculto durante carregamento E quando aula foi gerada */}
        {!isGenerating && !generatedLesson && (
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-purple-600 rounded-2xl mb-6">
              <BookOpen className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-purple-600 bg-clip-text text-transparent">
              Aulas Interativas com IA
            </h1>
            <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
              Transforme qualquer tópico em uma experiência de aprendizado envolvente e personalizada
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
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Interativo
              </Badge>
            </div>
          </header>
        )}

        {/* Enhanced Suggestions - Oculto durante carregamento E quando aula foi gerada */}
        {!generatedLesson && (
          <AulaSuggestions
            onSuggestionClick={handleSuggestionClick}
            isGenerating={isGenerating}
            className="mb-8"
          />
        )}

        {/* Main Content Grid - Oculto quando aula foi gerada */}
        {!generatedLesson && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Generation Form - Larger */}
            <div className="lg:col-span-3">
              <AulaGenerator
                formData={formData}
                onFormDataChange={setFormData}
                onGenerate={generateLesson}
                onKeyPress={handleKeyPress}
                isGenerating={isGenerating}
              />

              {isGenerating && (
                <div className="mt-6">
                  <AulaProgress
                    progress={generationProgress}
                    status={generationStatus}
                    isGenerating={isGenerating}
                    elapsedTime={elapsedTime}
                    className="min-h-[120px]"
                  />
                </div>
              )}
            </div>

            {/* Generated Lesson Preview - Smaller but detailed */}
            <div className="lg:col-span-2">
              <AulaPreview
                generatedLesson={generatedLesson}
                pacingMetrics={generationState.pacingMetrics}
                pacingWarnings={generationState.pacingWarnings}
                onStartLesson={handleStartLesson}
                onSaveLesson={handleSaveLesson}
              />
            </div>
          </div>
        )}

        {/* Aula Gerada - Layout completo quando aula está presente */}
        {generatedLesson && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Informações principais da aula */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {generatedLesson.title || "Título da Aula"}
                    </h2>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {generatedLesson.subject || "Matéria"}
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800">
                        {generatedLesson.level || "Nível"}
                      </Badge>
                      <Badge className="bg-red-100 text-red-800">
                        {generatedLesson.difficulty || "Médio"}
                      </Badge>
                    </div>
                    <div className="flex justify-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <div className="h-4 w-4 bg-yellow-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs">⏱</span>
                        </div>
                        {generatedLesson.estimatedDuration || ""} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {generatedLesson.stages?.length || 0} etapas
                      </span>
                    </div>
                  </div>

                  {/* Objetivos de Aprendizagem */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-yellow-500" />
                      Objetivos de Aprendizagem
                    </h3>
                    <ul className="space-y-3">
                      {(generatedLesson.objectives || []).map((objective: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Estrutura da Aula */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      Estrutura da Aula
                    </h3>
                    <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Target className="h-6 w-6 text-purple-600" />
                        <span className="text-xl font-semibold text-purple-800">
                          {generatedLesson.stages?.length || 0} etapas interativas
                        </span>
                      </div>
                      <p className="text-purple-700 mb-4">
                        Aula completa com conteúdo personalizado e atividades adaptadas ao seu nível
                      </p>
                      <div className="flex justify-center gap-4 text-sm text-purple-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          Conteúdo educacional
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Avaliações interativas
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-yellow-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs">⭐</span>
                          </div>
                          Gamificação
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button 
                      onClick={handleStartLesson} 
                      className="flex-1 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 h-12 text-lg"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Iniciar Aula Agora
                    </Button>
                    <Button 
                      onClick={handleSaveLesson} 
                      variant="outline" 
                      className="sm:w-auto h-12"
                    >
                      <div className="mr-2 h-4 w-4 bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs">📄</span>
                      </div>
                      Salvar Aula
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Debugger Modal - Removido */}
      </div>
    </SessionGuard>
  )
}


