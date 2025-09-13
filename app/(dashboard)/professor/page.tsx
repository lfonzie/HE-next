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

  const subjects: Subject[] = [
    { id: "matematica", name: "Matemática", color: "bg-blue-500", icon: "🔢" },
    { id: "portugues", name: "Português", color: "bg-green-500", icon: "📚" },
    { id: "ciencias", name: "Ciências", color: "bg-purple-500", icon: "🔬" },
    { id: "historia", name: "História", color: "bg-orange-500", icon: "📖" },
    { id: "geografia", name: "Geografia", color: "bg-teal-500", icon: "🌍" },
    { id: "ingles", name: "Inglês", color: "bg-red-500", icon: "🇺🇸" },
    { id: "artes", name: "Artes", color: "bg-pink-500", icon: "🎨" },
    { id: "educacao-fisica", name: "Educação Física", color: "bg-indigo-500", icon: "⚽" },
  ]

  const commonQuestions = [
    "Explique frações em Matemática",
    "O que é sujeito em Português?",
    "Explique a Segunda Guerra Mundial",
    "Como ensinar Geografia?",
    "Diferença entre mitose e meiose",
    "Regras de acentuação",
    "Equações do segundo grau",
    "Fatores climáticos",
    "Literatura brasileira",
    "Sistema solar"
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
          title: "Aula Gamificada Criada!",
          description: "Sua pergunta foi transformada em uma apresentação interativa com quiz!",
          variant: "default",
        })
      } else {
        console.log("⚠️ Fallback para resposta simples")
        setResponse(data.response || "Resposta não disponível")
        
        toast({
          title: "Resposta Gerada",
          description: "O Professor IA respondeu sua pergunta com sucesso!",
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
      matematica: ['matemática', 'matematica', 'número', 'número', 'equação', 'equacao', 'álgebra', 'algebra', 'geometria', 'fração', 'fracao', 'cálculo', 'calculo'],
      portugues: ['português', 'portugues', 'gramática', 'gramatica', 'literatura', 'sujeito', 'predicado', 'verbo', 'substantivo', 'adjetivo'],
      ciencias: ['ciências', 'ciencias', 'física', 'fisica', 'química', 'quimica', 'biologia', 'meiose', 'mitose', 'célula', 'celula'],
      historia: ['história', 'historia', 'guerra', 'revolução', 'revolucao', 'independência', 'independencia', 'império', 'imperio'],
      geografia: ['geografia', 'clima', 'relevo', 'população', 'populacao', 'economia', 'país', 'pais', 'continente']
    }

    const words = text.toLowerCase().split(/\s+/)
    let maxScore = 0
    let detectedSubject = 'matematica'
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
      title: "Explicações Diretas",
      description: "Respostas claras e objetivas para suas dúvidas acadêmicas"
    },
    {
      icon: Brain,
      title: "Resolução de Problemas",
      description: "Soluções passo a passo para exercícios e questões"
    },
    {
      icon: Lightbulb,
      title: "Conceitos Fundamentais",
      description: "Explicações dos conceitos básicos de cada disciplina"
    },
    {
      icon: Target,
      title: "Foco no Aprendizado",
      description: "Respostas diretas sem distrações ou atividades extras"
    }
  ]

  const features = [
    {
      title: "IA Avançada",
      description: "Usando GPT-4 para respostas precisas e educativas",
      color: "bg-green-500"
    },
    {
      title: "Múltiplas Disciplinas",
      description: "Suporte para todas as matérias escolares",
      color: "bg-blue-500"
    },
    {
      title: "Sem Histórico",
      description: "Cada pergunta é tratada independentemente",
      color: "bg-purple-500"
    },
    {
      title: "Conteúdo Filtrado",
      description: "Respostas adequadas para cada faixa etária",
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
            <h1 className="text-3xl font-bold text-gray-900">Professor IA</h1>
            <p className="text-gray-600">Dúvidas pedagógicas e exercícios</p>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Assistente educacional para estudantes. Receba explicações claras, resoluções de exercícios 
          e conceitos fundamentais de todas as disciplinas escolares.
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
              placeholder="Digite sua dúvida ou pergunta... (ex: Como resolver equações do primeiro grau?)"
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
                  Criando Aula Gamificada...
                </>
              ) : (
                <>
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Criar Aula Interativa
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
                Resposta do Professor IA
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
