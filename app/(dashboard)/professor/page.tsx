"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  Copy, 
  CheckCircle, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Target, 
  Hash, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Zap, 
  Eye, 
  Gamepad2, 
  Trophy,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Subject {
  id: string
  name: string
  color: string
  icon: string
}

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Lesson {
  title: string
  subject: string
  introduction: string
  sections: Array<{
    title: string
    content: string
    examples: string[]
  }>
  quiz: Question
  summary: string
  nextSteps: string[]
}

export default function ProfessorPage() {
  const { data: session, status } = useSession()
  const [isHydrated, setIsHydrated] = useState(false)
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [detectedSubject, setDetectedSubject] = useState<{ subject: string; confidence: number; keywords: string[] } | null>(null)
  const [showSubjectDetection, setShowSubjectDetection] = useState(false)
  const [gamifiedLesson, setGamifiedLesson] = useState<Lesson | null>(null)
  const [showGamified, setShowGamified] = useState(false)
  const { toast } = useToast()

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Show loading during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Carregando…</p>
        </div>
      </div>
    )
  }

  const subjects: Subject[] = [
    { id: "matematica", name: "Matemática (MT)", color: "bg-blue-500", icon: "🔢" },
    { id: "ciencias-natureza", name: "Ciências da Natureza (CN)", color: "bg-green-500", icon: "🔬" },
    { id: "ciencias-humanas", name: "Ciências Humanas (CH)", color: "bg-purple-500", icon: "🌍" },
    { id: "linguagens", name: "Linguagens e Códigos (LC)", color: "bg-orange-500", icon: "📚" },
    { id: "redacao", name: "Redação", color: "bg-red-500", icon: "✍️" },
    { id: "fisica", name: "Física", color: "bg-indigo-500", icon: "⚡" },
    { id: "quimica", name: "Química", color: "bg-teal-500", icon: "🧪" },
    { id: "biologia", name: "Biologia", color: "bg-emerald-500", icon: "🧬" },
  ]

  const commonQuestions = [
    "Função quadrática ENEM",
    "Segunda Guerra Mundial ENEM",
    "Sistema digestório humano",
    "Equações do segundo grau",
    "Fotossíntese e respiração",
    "Interpretação de texto ENEM",
    "Geometria espacial",
    "História do Brasil República",
    "Química orgânica",
    "Redação ENEM estrutura"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResponse("")
    setGamifiedLesson(null)
    setShowGamified(false)

    // Detectar disciplina automaticamente se não foi selecionada manualmente
    let subjectToUse = selectedSubject
    if (!selectedSubject && query.trim()) {
      const detection = detectSubject(query)
      setDetectedSubject(detection)
      subjectToUse = detection.subject
      
      toast({
        title: "Disciplina Detectada",
        description: `Detectamos que sua pergunta é sobre ${getSubjectInfo(detection.subject).name} (${Math.round(detection.confidence * 100)}% de confiança)`,
        variant: "default",
      })
    }

    try {
      const res = await fetch("/api/professor/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query,
          subject: subjectToUse,
          // Incluir informações de sessão para debug
          sessionInfo: {
            hasSession: !!session,
            userEmail: session?.user?.email,
            status: status
          }
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      console.log("📊 Resposta da API:", data)
      
      if (data.success && data.lesson) {
        console.log("✅ Criando aula gamificada:", data.lesson.title)
        setGamifiedLesson(data.lesson)
        setShowGamified(true)
        
        toast({
          title: "Aula ENEM Criada!",
          description: "Sua pergunta foi transformada em uma aula focada no ENEM com quiz interativo!",
          variant: "default",
        })
      } else {
        console.log("⚠️ Fallback para resposta simples")
        setResponse(data.response || "Resposta não disponível")
        
        toast({
          title: "Resposta Gerada",
          description: "O Assistente ENEM respondeu sua pergunta com sucesso!",
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error("Erro ao gerar resposta:", error)
      toast({
        title: "Erro na geração",
        description: error.message || "Falha ao gerar resposta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const detectSubject = (text: string) => {
    const keywords = {
      matematica: ['matemática', 'matematica', 'número', 'número', 'equação', 'equacao', 'álgebra', 'algebra', 'geometria', 'fração', 'fracao', 'cálculo', 'calculo', 'função', 'funcao', 'trigonometria'],
      'ciencias-natureza': ['ciências da natureza', 'ciencias da natureza', 'física', 'fisica', 'química', 'quimica', 'biologia', 'meiose', 'mitose', 'célula', 'celula', 'fotossíntese', 'fotossintese'],
      'ciencias-humanas': ['ciências humanas', 'ciencias humanas', 'história', 'historia', 'geografia', 'filosofia', 'sociologia', 'guerra', 'revolução', 'revolucao', 'independência', 'independencia'],
      linguagens: ['linguagens e códigos', 'linguagens e codigos', 'português', 'portugues', 'gramática', 'gramatica', 'literatura', 'inglês', 'ingles', 'espanhol', 'interpretação', 'interpretacao'],
      redacao: ['redação', 'redacao', 'dissertação', 'dissertacao', 'argumentação', 'argumentacao', 'proposta', 'intervenção', 'intervencao']
    }

    const words = text.toLowerCase().split(/\s+/)
    let maxScore = 0
    let detectedSubject = 'ciencias-natureza'
    let matchedKeywords: string[] = []

    for (const [subject, subjectKeywords] of Object.entries(keywords)) {
      const score = subjectKeywords.reduce((acc, keyword) => {
        if (words.some(word => word.includes(keyword))) {
          matchedKeywords.push(keyword)
          return acc + 1
        }
        return acc
      }, 0)

      if (score > maxScore) {
        maxScore = score
        detectedSubject = subject
      }
    }

    return {
      subject: detectedSubject,
      confidence: maxScore / Math.max(words.length, 1),
      keywords: matchedKeywords
    }
  }

  const getSubjectInfo = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId) || subjects[0]
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response)
      setCopied(true)
      toast({
        title: "Copiado!",
        description: "Resposta copiada para a área de transferência.",
        variant: "default",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erro ao copiar:", error)
      toast({
        title: "Erro",
        description: "Falha ao copiar a resposta.",
        variant: "destructive",
      })
    }
  }

  const handleQuestionClick = (question: string) => {
    setQuery(question)
    const detection = detectSubject(question)
    setDetectedSubject(detection)
    setSelectedSubject(detection.subject)
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    
    if (!selectedSubject && value.trim().length > 10) {
      const detection = detectSubject(value)
      if (detection.confidence > 0.3) {
        setDetectedSubject(detection)
        setShowSubjectDetection(true)
      }
    } else if (selectedSubject) {
      setShowSubjectDetection(false)
      setDetectedSubject(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const capabilities = [
    {
      icon: BookOpen,
      title: "Conteúdos ENEM",
      description: "Foco nos conteúdos que mais caem no ENEM conforme estatísticas oficiais"
    },
    {
      icon: Brain,
      title: "Questões Estilo ENEM",
      description: "Questões com explicações detalhadas seguindo o padrão TRI"
    },
    {
      icon: Lightbulb,
      title: "Estratégias de Prova",
      description: "Dicas para otimizar tempo e performance no exame"
    },
    {
      icon: Target,
      title: "Preparação Completa",
      description: "Aulas interativas focadas nas 4 áreas do ENEM"
    }
  ]

  const features = [
    {
      title: "IA Especializada",
      description: "Usando GPT-4 otimizado para preparação ENEM",
      color: "bg-green-500"
    },
    {
      title: "4 Áreas ENEM",
      description: "CN, CH, LC e MT com conteúdos específicos",
      color: "bg-blue-500"
    },
    {
      title: "Sistema TRI",
      description: "Questões baseadas na Teoria de Resposta ao Item",
      color: "bg-purple-500"
    },
    {
      title: "Contexto Brasileiro",
      description: "Situações do cotidiano brasileiro",
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assistente ENEM</h1>
            <p className="text-gray-600">Preparação completa para o Exame Nacional do Ensino Médio</p>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Assistente especializado em preparação para o ENEM. Receba aulas focadas nos conteúdos que mais caem,
          questões estilo ENEM com explicações detalhadas e estratégias para otimizar sua performance no exame.
        </p>
      </div>

      {/* Capabilities */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {capabilities.map((capability, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <capability.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">{capability.title}</h3>
              <p className="text-sm text-gray-600">{capability.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subject Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Seleção de Disciplina
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Detecção automática ativa</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Detecção automática */}
          {showSubjectDetection && detectedSubject && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Detectamos: {getSubjectInfo(detectedSubject.subject).name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(detectedSubject.confidence * 100)}% confiança
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSubject(detectedSubject.subject)
                    setShowSubjectDetection(false)
                  }}
                  className="text-xs"
                >
                  Usar esta disciplina
                </Button>
              </div>
              {detectedSubject.keywords.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-blue-600">Palavras-chave detectadas: </span>
                  <span className="text-xs text-blue-700">
                    {detectedSubject.keywords.slice(0, 3).join(', ')}
                    {detectedSubject.keywords.length > 3 && '...'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Seleção manual */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {subjects.map((subject) => (
              <Button
                key={subject.id}
                variant={selectedSubject === subject.id ? "default" : "outline"}
                className={`flex flex-col items-center gap-2 h-auto py-4 transition-all duration-200 ${
                  selectedSubject === subject.id 
                    ? subject.color + " text-white shadow-lg" 
                    : "hover:bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => {
                  setSelectedSubject(subject.id)
                  setShowSubjectDetection(false)
                  setDetectedSubject(null)
                }}
              >
                <span className="text-2xl">{subject.icon}</span>
                <span className="text-xs font-medium">{subject.name}</span>
              </Button>
            ))}
          </div>
          
          {/* Informação sobre detecção automática */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">💡 Detecção Automática</p>
                <p>
                  O sistema detecta automaticamente a disciplina baseada no conteúdo da sua pergunta. 
                  Você pode selecionar manualmente se preferir ou se a detecção não estiver correta.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Sua Pergunta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Digite sua dúvida ou pergunta... (ex: Função quadrática ENEM, Sistema digestório, Segunda Guerra Mundial)"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[120px] resize-none text-base"
              disabled={loading}
            />
            
            {/* Common Questions */}
            <div>
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Perguntas comuns:
              </p>
              <div className="flex flex-wrap gap-2">
                {commonQuestions.map((question, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors px-3 py-1"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-3"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando Aula ENEM...
                </>
              ) : (
                <>
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Criar Aula ENEM
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Gamified Lesson */}
      {showGamified && gamifiedLesson && (
        <Card className="mb-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Trophy className="w-5 h-5" />
              Aula Gamificada: {gamifiedLesson.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Introdução</h3>
                <p className="text-gray-700">{gamifiedLesson.introduction}</p>
              </div>
              
              {gamifiedLesson.sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{section.title}</h4>
                  <p className="text-gray-700 mb-3">{section.content}</p>
                  {section.examples.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Exemplos:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {section.examples.map((example, i) => (
                          <li key={i} className="text-sm text-gray-600">{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Quiz Interativo</h4>
                <p className="text-gray-700 mb-3">{gamifiedLesson.quiz.question}</p>
                <div className="space-y-2">
                  {gamifiedLesson.quiz.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-medium">{String.fromCharCode(65 + index)})</span>
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowGamified(false)
                    setGamifiedLesson(null)
                    setQuery("")
                    setSelectedSubject("")
                    setDetectedSubject(null)
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nova Aula
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback Response */}
      {response && !showGamified && (
        <Card className="mb-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-green-700">
                <MessageSquare className="w-5 h-5" />
                Resposta do Assistente ENEM
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="hover:bg-green-100 hover:border-green-300"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">
                {response}
              </div>
            </div>
            
            {/* Response Stats */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  {response.length} caracteres
                </span>
              </div>
              {(selectedSubject || detectedSubject) && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {selectedSubject 
                    ? subjects.find(s => s.id === selectedSubject)?.name
                    : detectedSubject 
                      ? getSubjectInfo(detectedSubject.subject).name + " (detectada)"
                      : "Disciplina não identificada"
                  }
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <div className={`w-12 h-12 ${feature.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{index + 1}</span>
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
