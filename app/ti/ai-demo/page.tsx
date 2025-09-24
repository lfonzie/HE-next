'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Brain, 
  Wrench, 
  Play, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react'

interface GeneratedPlaybook {
  issue: string
  metadata: {
    title: string
    tags: string[]
    category: string
    complexity: 'simple' | 'medium' | 'complex'
  }
  entry: {
    say: string
    checklist: string[]
  }
  steps: Record<string, any>
}

export default function AIPlaybookDemo() {
  const [problem, setProblem] = useState('')
  const [deviceLabel, setDeviceLabel] = useState('')
  const [generatedPlaybook, setGeneratedPlaybook] = useState<GeneratedPlaybook | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [cachedPlaybooks, setCachedPlaybooks] = useState<any[]>([])
  const [error, setError] = useState('')

  const generatePlaybook = async () => {
    if (!problem.trim()) {
      setError('Por favor, descreva o problema')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/ti/generate-playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          context: {
            deviceLabel: deviceLabel || undefined
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedPlaybook(data.playbook)
        await loadCachedPlaybooks() // Refresh cache
      } else {
        setError(data.error || 'Erro ao gerar playbook')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setIsGenerating(false)
    }
  }

  const loadCachedPlaybooks = async () => {
    try {
      const response = await fetch('/api/ti/generate-playbook')
      const data = await response.json()
      
      if (data.success) {
        setCachedPlaybooks(data.playbooks)
      }
    } catch (err) {
      console.error('Error loading cached playbooks:', err)
    }
  }

  const clearCache = async () => {
    try {
      const response = await fetch('/api/ti/generate-playbook', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCachedPlaybooks([])
        setGeneratedPlaybook(null)
      }
    } catch (err) {
      console.error('Error clearing cache:', err)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'complex': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'Simples'
      case 'medium': return 'Médio'
      case 'complex': return 'Complexo'
      default: return 'Desconhecido'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gerador de Playbooks via IA</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sistema inteligente que gera playbooks personalizados para <strong>qualquer problema de TI</strong> 
            usando inteligência artificial. Não precisa mais criar playbooks manuais!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Gerar Playbook Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="problem">Descreva o problema de TI:</Label>
                  <Textarea
                    id="problem"
                    placeholder="Ex: Meu computador está muito lento e travando constantemente..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="device">Dispositivo (opcional):</Label>
                  <Input
                    id="device"
                    placeholder="Ex: Dell OptiPlex 7090 - Sala 12"
                    value={deviceLabel}
                    onChange={(e) => setDeviceLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={generatePlaybook} 
                  disabled={isGenerating || !problem.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando Playbook...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Gerar Playbook via IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Cached Playbooks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Playbooks em Cache ({cachedPlaybooks.length})
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCache}
                    disabled={cachedPlaybooks.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cachedPlaybooks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum playbook em cache ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cachedPlaybooks.map((playbook, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{playbook.title}</div>
                          <div className="text-xs text-gray-500">{playbook.category}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getComplexityColor(playbook.complexity)}>
                            {getComplexityLabel(playbook.complexity)}
                          </Badge>
                          <span className="text-xs text-gray-500">{playbook.stepsCount} passos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generated Playbook Display */}
          <div>
            {generatedPlaybook ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Playbook Gerado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Informações do Playbook</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Título:</strong> {generatedPlaybook.metadata.title}</div>
                      <div><strong>Categoria:</strong> {generatedPlaybook.metadata.category}</div>
                      <div><strong>Complexidade:</strong> 
                        <Badge className={`ml-2 ${getComplexityColor(generatedPlaybook.metadata.complexity)}`}>
                          {getComplexityLabel(generatedPlaybook.metadata.complexity)}
                        </Badge>
                      </div>
                      <div><strong>Passos:</strong> {Object.keys(generatedPlaybook.steps).length}</div>
                    </div>
                    <div className="mt-2">
                      <strong>Tags:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedPlaybook.metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Entry Message */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Mensagem Inicial</h3>
                    <p className="text-sm">{generatedPlaybook.entry.say}</p>
                  </div>

                  {/* Steps */}
                  <div>
                    <h3 className="font-medium mb-3">Passos do Playbook</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {Object.entries(generatedPlaybook.steps).map(([key, step], index) => (
                        <div key={key} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium text-sm">{step.title}</span>
                          </div>
                          {step.ask && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Pergunta:</strong> {step.ask}
                            </p>
                          )}
                          {step.say && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Instrução:</strong> {step.say}
                            </p>
                          )}
                          {step.options && (
                            <div className="text-xs text-gray-500">
                              <strong>Opções:</strong> {step.options.map(opt => opt.label).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum Playbook Gerado
                  </h3>
                  <p className="text-gray-500">
                    Descreva um problema de TI acima para gerar um playbook personalizado via IA
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                IA Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Gera playbooks personalizados baseados no problema específico, 
                adaptando-se ao contexto educacional.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Cache Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Sistema de cache para evitar regenerar playbooks similares, 
                melhorando performance e consistência.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-green-600" />
                Universal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Funciona com qualquer problema de TI, desde questões simples 
                até problemas complexos que requerem escalação.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
