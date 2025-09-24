'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  School, 
  MessageSquare, 
  DollarSign, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Save,
  X,
  Eye,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'

interface School {
  id: string
  name: string
  modules: string[]
  persona: {
    name: string
    tone: string
  }
  lastUpdated: string
}

interface ModulePrompt {
  module: string
  prompt: string
  isCustom: boolean
}

const mockSchools: School[] = [
  {
    id: 'escola-001',
    name: 'Colégio Exemplo',
    modules: ['secretaria', 'financeiro', 'coordenacao'],
    persona: {
      name: 'Maria Clara',
      tone: 'Acolhedor e profissional'
    },
    lastUpdated: '2024-01-15'
  },
  {
    id: 'escola-002', 
    name: 'Instituto Educacional',
    modules: ['secretaria', 'financeiro', 'coordenacao', 'rh'],
    persona: {
      name: 'Ana Beatriz',
      tone: 'Formal e eficiente'
    },
    lastUpdated: '2024-01-10'
  }
]

const moduleInfo = {
  secretaria: {
    name: 'Secretaria Virtual',
    description: 'Informações sobre vagas, matrícula, documentos e calendário',
    icon: MessageSquare,
    color: 'blue'
  },
  financeiro: {
    name: 'Financeiro Virtual',
    description: 'Valores, descontos, formas de pagamento e materiais',
    icon: DollarSign,
    color: 'green'
  },
  coordenacao: {
    name: 'Coordenação Pedagógica', 
    description: 'Programas pedagógicos e regras institucionais',
    icon: Users,
    color: 'purple'
  },
  rh: {
    name: 'RH Interno',
    description: 'Folha de pagamento e processos internos',
    icon: Settings,
    color: 'orange'
  }
}

export function InstitutionalPromptsAdmin() {
  const [schools, setSchools] = useState<School[]>(mockSchools)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null)
  const [promptText, setPromptText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEditPrompt = (module: string) => {
    setEditingPrompt(module)
    // TODO: Carregar prompt atual do banco de dados
    setPromptText(`# ${moduleInfo[module as keyof typeof moduleInfo]?.name || module}

You are Maria Clara, a friendly and professional virtual assistant representing ${selectedSchool?.name || 'the school'}.

## Your Role & Personality
- Name: Maria Clara
- Role: ${moduleInfo[module as keyof typeof moduleInfo]?.name || module} Assistant
- Tone: Warm, professional, helpful, and always include relevant emojis
- Language: Always respond in Portuguese (Brazilian Portuguese)

## Important Guidelines
1. Always be helpful and provide accurate information
2. If you're unsure about specific details, always recommend contacting the school directly
3. Always mention that information should be confirmed with the school administration
4. Use emojis appropriately to make communication friendly
5. Never provide information that could be outdated or incorrect

## Disclaimer
Always end responses with: "Para informações específicas ou confirmações, recomendo entrar em contato diretamente com a secretaria da escola. 📞"

Remember: You represent ${selectedSchool?.name || 'the school'} and should always maintain professional standards in your interactions.`)
  }

  const handleSavePrompt = async () => {
    if (!editingPrompt || !selectedSchool) return
    
    setIsLoading(true)
    try {
      // TODO: Salvar prompt no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular API call
      
      toast.success('Prompt salvo com sucesso!')
      setEditingPrompt(null)
      setPromptText('')
    } catch (error) {
      toast.error('Erro ao salvar prompt')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingPrompt(null)
    setPromptText('')
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(promptText)
    toast.success('Prompt copiado para a área de transferência!')
  }

  return (
    <div className="space-y-6">
      {/* Lista de Escolas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-5 h-5" />
            Escolas Cadastradas
          </CardTitle>
          <CardDescription>
            Selecione uma escola para gerenciar seus prompts institucionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school) => (
              <div
                key={school.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSchool?.id === school.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSchool(school)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{school.name}</h3>
                  <Badge variant="secondary">{school.modules.length} módulos</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Persona: {school.persona.name} ({school.persona.tone})
                </p>
                <p className="text-xs text-gray-500">
                  Última atualização: {school.lastUpdated}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de Prompts */}
      {selectedSchool && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Prompts Institucionais - {selectedSchool.name}
            </CardTitle>
            <CardDescription>
              Configure os prompts para cada módulo de comunicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="editor">Editor de Prompts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(moduleInfo).map(([moduleKey, info]) => {
                    const Icon = info.icon
                    const isActive = selectedSchool.modules.includes(moduleKey)
                    
                    return (
                      <div
                        key={moduleKey}
                        className={`p-4 border rounded-lg ${
                          isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-5 h-5 ${
                            isActive ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <h4 className="font-medium text-gray-900">{info.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            onClick={() => handleEditPrompt(moduleKey)}
                            disabled={!isActive}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPrompt(moduleKey)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="editor" className="space-y-4">
                {editingPrompt ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Editando: {moduleInfo[editingPrompt as keyof typeof moduleInfo]?.name}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyPrompt}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSavePrompt}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          {isLoading ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </div>
                    
                    <Textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Digite o prompt institucional..."
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Edit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Selecione um módulo para editar seu prompt institucional</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
