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

export default function GenerateAulaPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '',
    duration: '',
    difficulty: '',
    objectives: '',
    context: '',
    learningStyle: '',
    specialNeeds: ''
  })

  const subjects = [
    'Ciências', 'Matemática', 'História', 'Geografia', 'Português', 
    'Inglês', 'Física', 'Química', 'Biologia', 'Educação Física'
  ]

  const difficulties = [
    { value: 'easy', label: 'Fácil', description: 'Conceitos básicos e fundamentais' },
    { value: 'medium', label: 'Médio', description: 'Conceitos intermediários com aplicação' },
    { value: 'hard', label: 'Difícil', description: 'Conceitos avançados e análise crítica' }
  ]

  const learningStyles = [
    { value: 'visual', label: 'Visual', description: 'Imagens, diagramas e vídeos' },
    { value: 'auditory', label: 'Auditivo', description: 'Músicas, discussões e explicações' },
    { value: 'kinesthetic', label: 'Cinestésico', description: 'Atividades práticas e movimento' },
    { value: 'mixed', label: 'Misto', description: 'Combinação de diferentes estilos' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerate = async () => {
    if (!formData.title || !formData.subject || !formData.grade || !formData.objectives) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsGenerating(true)
    
    try {
      // Preparar dados no formato esperado pela API
      const requestData = {
        topic: formData.title, // A API espera 'topic' como campo principal
        subject: formData.subject,
        grade: formData.grade,
        objectives: formData.objectives,
        context: formData.context,
        difficulty: formData.difficulty,
        learningStyle: formData.learningStyle,
        specialNeeds: formData.specialNeeds,
        duration: formData.duration,
        demoMode: false // Salvar no banco de dados
      }

      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar aula')
      }

      const result = await response.json()
      
      // A API retorna { success: true, lesson: {...} }
      if (result.success && result.lesson) {
        // Lesson is now saved in database, no need for localStorage
        
        setGeneratedLesson(result.lesson)
        toast.success('Aula gerada com sucesso!')
      } else {
        throw new Error('Resposta inválida da API')
      }
    } catch (error) {
      console.error('Error generating lesson:', error)
      toast.error('Erro ao gerar aula. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartLesson = () => {
    if (generatedLesson) {
      console.log('Iniciando aula com ID:', generatedLesson.id)
      console.log('Dados da aula:', generatedLesson)
      
      // Salvar aula no localStorage para modo demo
      localStorage.setItem(`demo_lesson_${generatedLesson.id}`, JSON.stringify(generatedLesson))
      console.log('Aula salva no localStorage para modo demo')
      
      router.push(`/aulas/${generatedLesson.id}`)
    } else {
      console.error('Nenhuma aula gerada para iniciar')
      toast.error('Nenhuma aula foi gerada ainda')
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
        router.push('/aulas')
      } else {
        throw new Error('Erro ao salvar aula')
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
      toast.error('Erro ao salvar aula')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/aulas')}
            className="flex items-center gap-2"
          >
            ← Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              Gerar Nova Aula
            </h1>
            <p className="text-gray-600">
              Crie aulas interativas personalizadas com IA
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Configurações da Aula
            </CardTitle>
            <CardDescription>
              Preencha os detalhes para gerar uma aula personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Aula *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Fotossíntese: Do Sol às Folhas"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Matéria *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="grade">Série *</Label>
                  <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                        <SelectItem key={grade} value={grade.toString()}>
                          {grade}º ano
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="45"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>
                          <div>
                            <div className="font-medium">{diff.label}</div>
                            <div className="text-xs text-gray-500">{diff.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            <div>
              <Label htmlFor="objectives">Objetivos de Aprendizagem *</Label>
              <Textarea
                id="objectives"
                placeholder="Ex: Explicar o que é fotossíntese, Descrever os ingredientes e produtos, Entender o processo bioquímico"
                value={formData.objectives}
                onChange={(e) => handleInputChange('objectives', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separe cada objetivo com vírgula
              </p>
            </div>

            {/* Context */}
            <div>
              <Label htmlFor="context">Contexto Adicional</Label>
              <Textarea
                id="context"
                placeholder="Ex: Aula para alunos que já estudaram células vegetais..."
                value={formData.context}
                onChange={(e) => handleInputChange('context', e.target.value)}
                rows={2}
              />
            </div>

            {/* Learning Style */}
            <div>
              <Label htmlFor="learningStyle">Estilo de Aprendizagem</Label>
              <Select value={formData.learningStyle} onValueChange={(value) => handleInputChange('learningStyle', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {learningStyles.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-gray-500">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Special Needs */}
            <div>
              <Label htmlFor="specialNeeds">Necessidades Especiais</Label>
              <Input
                id="specialNeeds"
                placeholder="Ex: Alunos com TDAH, deficiência visual..."
                value={formData.specialNeeds}
                onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Gerando Aula...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Gerar Aula com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-6">
          {generatedLesson ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Aula Gerada
                </CardTitle>
                <CardDescription>
                  Sua aula personalizada está pronta!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{generatedLesson.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{generatedLesson.subject}</Badge>
                    <Badge variant="outline">{generatedLesson.level}º ano</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Objetivos:</h4>
                  <ul className="space-y-1">
                    {generatedLesson.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Etapas ({generatedLesson.stages.length}):</h4>
                  <div className="space-y-2">
                    {generatedLesson.stages.map((stage, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span>{stage.etapa}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stage.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleStartLesson} className="flex-1">
                    Iniciar Aula
                  </Button>
                  <Button onClick={handleSaveLesson} variant="outline">
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Aula será gerada aqui</h3>
                <p className="text-gray-600">
                  Preencha o formulário e clique em &quot;Gerar Aula com IA&quot; para ver a prévia
                </p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Recursos Incluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">IA Avançada</div>
                    <div className="text-sm text-gray-600">Conteúdo personalizado</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Interatividade</div>
                    <div className="text-sm text-gray-600">Quizzes e atividades</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Objetivos Claros</div>
                    <div className="text-sm text-gray-600">Metas de aprendizagem</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
