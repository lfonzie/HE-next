'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, BookOpen, Target, Users } from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedLesson {
  id: string
  title: string
  subject: string
  level: string
  objectives: string[]
  stages: Array<{
    etapa: string
    type: string
    activity: any
    route: string
  }>
  feedback: any
}

export default function GenerateLessonPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null)
  const [formData, setFormData] = useState({
    topic: '',
    objectives: '',
    methodology: ''
  })

  const methodologies = [
    'Construtivista', 'Montessori', 'Waldorf', 'Tradicional', 
    'Baseada em Projetos', 'Gamificação', 'Aprendizagem Ativa'
  ]

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast.error('Por favor, descreva o que você quer aprender')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          demoMode: true // Enable demo mode to bypass authentication
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar aula')
      }

      setGeneratedLesson(data.lesson)
      toast.success('Aula gerada com sucesso! (Modo Demo)')
      
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar aula')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartLesson = () => {
    if (generatedLesson) {
      router.push(`/lessons/${generatedLesson.id}`)
    }
  }

  const handleSaveLesson = async () => {
    if (!generatedLesson) return

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedLesson),
      })

      if (response.ok) {
        toast.success('Aula salva com sucesso!')
      } else {
        throw new Error('Erro ao salvar aula')
      }
    } catch (error) {
      toast.error('Erro ao salvar aula')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Gerador de Aulas Interativas
        </h1>
        <p className="text-gray-600">
          Crie aulas interativas e gamificadas com IA, inspiradas nas melhores plataformas educacionais
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Modo Demo:</strong> Teste a funcionalidade sem necessidade de login. 
            As aulas geradas não serão salvas permanentemente.
          </p>
          <p className="text-blue-700 text-xs mt-2">
            💡 <strong>Dica:</strong> Seja específico! O AI irá inferir automaticamente a matéria e série apropriadas baseado no seu tópico.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Configuração da Aula
            </CardTitle>
            <CardDescription>
              Preencha os detalhes para gerar uma aula personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">O que você quer aprender? *</Label>
              <Textarea
                id="topic"
                placeholder="Ex: Como funciona a fotossíntese nas plantas, A Segunda Guerra Mundial e suas consequências, Resolver equações de segundo grau, A história do Brasil colonial..."
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                Seja específico! Quanto mais detalhes você der, melhor será a aula gerada.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Objetivos Específicos (Opcional)</Label>
              <Textarea
                id="objectives"
                placeholder="Descreva objetivos específicos que gostaria de abordar..."
                value={formData.objectives}
                onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="methodology">Metodologia (Opcional)</Label>
              <Select value={formData.methodology} onValueChange={(value) => setFormData(prev => ({ ...prev, methodology: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma metodologia" />
                </SelectTrigger>
                <SelectContent>
                  {methodologies.map(methodology => (
                    <SelectItem key={methodology} value={methodology}>
                      {methodology}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Aula...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Aula Interativa
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Lesson Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Aula Gerada
            </CardTitle>
            <CardDescription>
              Visualize e personalize sua aula antes de começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedLesson ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{generatedLesson.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{generatedLesson.subject}</Badge>
                    <Badge variant="outline">{generatedLesson.level}º ano</Badge>
                    {generatedLesson.demoMode && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Demo
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Objetivos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {generatedLesson.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Etapas da Aula:</h4>
                  <div className="space-y-2">
                    {generatedLesson.stages.map((stage, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{stage.etapa}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stage.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleStartLesson} className="flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    Iniciar Aula
                  </Button>
                  <Button onClick={handleSaveLesson} variant="outline">
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gere uma aula para ver o preview aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recursos das Aulas Interativas</CardTitle>
          <CardDescription>
            Inspirado nas melhores plataformas educacionais do mundo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">IA Avançada</h3>
              <p className="text-sm text-gray-600">
                Geração automática de conteúdo interativo com IA, inspirado no Curipod e Teachy.ai
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Gamificação</h3>
              <p className="text-sm text-gray-600">
                Sistema de pontos, badges e progresso, como no Nearpod e Genially
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Interatividade</h3>
              <p className="text-sm text-gray-600">
                Quizzes, desenhos, discussões e feedback em tempo real
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
