'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  DollarSign, 
  Users, 
  Settings, 
  ArrowRight,
  CheckCircle,
  Zap
} from 'lucide-react'

const moduleExamples = {
  secretaria: {
    name: 'Secretaria Virtual',
    icon: MessageSquare,
    color: 'blue',
    examples: [
      'Quais documentos preciso para matrícula?',
      'Há vagas para o 6º ano?',
      'Qual o horário de funcionamento da secretaria?',
      'Quando é o período de matrículas?'
    ],
    description: 'Informações sobre vagas, matrícula, documentos e calendário escolar'
  },
  financeiro: {
    name: 'Financeiro Virtual',
    icon: DollarSign,
    color: 'green',
    examples: [
      'Qual o valor da mensalidade do 6º ano?',
      'Que descontos posso ter?',
      'Quais formas de pagamento vocês aceitam?',
      'Qual o valor dos materiais escolares?'
    ],
    description: 'Valores, descontos, formas de pagamento e materiais escolares'
  },
  coordenacao: {
    name: 'Coordenação Pedagógica',
    icon: Users,
    color: 'purple',
    examples: [
      'Como funciona o programa bilíngue?',
      'Quais são as regras do uniforme?',
      'Como é a metodologia de ensino?',
      'O que é o programa LIV?'
    ],
    description: 'Programas pedagógicos, regras institucionais e orientações acadêmicas'
  },
  rh: {
    name: 'RH Interno',
    icon: Settings,
    color: 'orange',
    examples: [
      'Como consultar minha folha de pagamento?',
      'Qual o processo para solicitar férias?',
      'Onde encontro o manual do funcionário?',
      'Como funciona a comunicação interna?'
    ],
    description: 'Folha de pagamento, processos internos e políticas da empresa'
  }
}

export function ModuleDemo() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Status de Integração */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Integração Concluída
          </CardTitle>
          <CardDescription className="text-green-700">
            Todos os módulos de comunicação institucional foram integrados ao sistema de chat existente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Orchestrator Atualizado</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Prompts Institucionais</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Sistema Multi-tenant</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona a Integração</CardTitle>
          <CardDescription>
            Os módulos estão integrados ao sistema de chat existente via orchestrator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Detecção Automática</h3>
              <p className="text-sm text-gray-600">
                O orchestrator detecta automaticamente qual módulo usar baseado nas palavras-chave da mensagem
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Prompt Institucional</h3>
              <p className="text-sm text-gray-600">
                Cada módulo usa um prompt específico da escola com persona e informações personalizadas
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Resposta Contextual</h3>
              <p className="text-sm text-gray-600">
                A IA responde com informações específicas da escola e sempre sugere confirmação presencial
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Módulos Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(moduleExamples).map(([moduleKey, module]) => {
          const Icon = module.icon
          const isSelected = selectedModule === moduleKey
          
          return (
            <Card 
              key={moduleKey}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedModule(isSelected ? null : moduleKey)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${module.color}-600`} />
                  {module.name}
                  <Badge variant="secondary" className="ml-auto">
                    Integrado
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">
                    Exemplos de perguntas:
                  </h4>
                  <div className="space-y-2">
                    {module.examples.map((example, index) => (
                      <div 
                        key={index}
                        className="text-sm text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-gray-200"
                      >
                        "{example}"
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Abrir chat com módulo específico
                        window.open('/chat', '_blank')
                      }}
                    >
                      Testar no Chat
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Instruções de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Como Testar</CardTitle>
          <CardDescription>
            Instruções para testar os módulos integrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Acesse o Chat</h4>
                <p className="text-sm text-gray-600">
                  Vá para <code className="bg-gray-100 px-1 rounded">/chat</code> ou clique em "Testar no Chat" acima
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Digite uma Pergunta</h4>
                <p className="text-sm text-gray-600">
                  Use os exemplos acima ou faça suas próprias perguntas sobre secretaria, financeiro, coordenação ou RH
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Observe a Detecção</h4>
                <p className="text-sm text-gray-600">
                  O sistema detectará automaticamente qual módulo usar e responderá com a persona "Maria Clara"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
