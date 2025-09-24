import { Suspense } from 'react'
import GuidedChat from '@/app/ti/components/GuidedChat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wrench, Printer, Wifi, Monitor, AlertCircle, CheckCircle, Clock, Smartphone, HardDrive, Volume2, Video, Shield } from 'lucide-react'

export default function TiSupportPage() {
  const exampleProblems = [
    {
      icon: <Printer className="h-5 w-5 text-blue-600" />,
      title: "Problemas de Impressora",
      description: "Impressora não imprime, sem tinta, driver",
      example: "Minha impressora HP não está imprimindo",
      category: "printer"
    },
    {
      icon: <Wifi className="h-5 w-5 text-green-600" />,
      title: "Problemas de Rede",
      description: "Wi-Fi lento, sem internet, conexão",
      example: "O Wi-Fi está muito lento na escola",
      category: "wifi"
    },
    {
      icon: <Monitor className="h-5 w-5 text-purple-600" />,
      title: "Problemas de Software",
      description: "Programa não abre, erro, instalação",
      example: "O Excel não está abrindo",
      category: "software"
    },
    {
      icon: <HardDrive className="h-5 w-5 text-orange-600" />,
      title: "Problemas de Hardware",
      description: "Mouse, teclado, monitor, CPU",
      example: "Meu mouse não está funcionando",
      category: "hardware"
    },
    {
      icon: <Volume2 className="h-5 w-5 text-pink-600" />,
      title: "Problemas de Áudio",
      description: "Sem som, microfone, caixas",
      example: "Não consigo ouvir nada no computador",
      category: "audio"
    },
    {
      icon: <Video className="h-5 w-5 text-red-600" />,
      title: "Problemas de Vídeo",
      description: "Câmera, webcam, streaming",
      example: "Minha webcam não funciona nas aulas online",
      category: "video"
    },
    {
      icon: <Smartphone className="h-5 w-5 text-indigo-600" />,
      title: "Problemas Mobile",
      description: "Celular, tablet, apps",
      example: "Meu celular não conecta no Wi-Fi da escola",
      category: "mobile"
    },
    {
      icon: <Shield className="h-5 w-5 text-yellow-600" />,
      title: "Problemas de Segurança",
      description: "Vírus, antivírus, backup",
      example: "Apareceu um vírus no meu computador",
      category: "security"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wrench className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Suporte TI Universal</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sistema inteligente que funciona com <strong>qualquer problema ou dúvida de TI</strong>. 
            Descreva seu problema e nossa IA vai te guiar pela solução mais adequada.
          </p>
        </div>

        {/* Universal Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Como Funciona - Universal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Descreva QUALQUER Problema</h4>
                    <p className="text-sm text-gray-600">Não importa o tipo: hardware, software, rede, mobile, etc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium">IA Classifica Automaticamente</h4>
                    <p className="text-sm text-gray-600">Sistema identifica o tipo de problema e carrega o playbook adequado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Diagnóstico Personalizado</h4>
                    <p className="text-sm text-gray-600">Passos específicos para seu tipo de problema</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Resolução ou Escalação</h4>
                    <p className="text-sm text-gray-600">Problema resolvido ou escalado com contexto completo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Problemas Suportados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">"Minha impressora não imprime" → Playbook Impressora</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">"O computador está lento" → Playbook Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">"Não consigo acessar o email" → Playbook Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">"Meu mouse não funciona" → Playbook Hardware</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">"Apareceu um vírus" → Playbook Segurança</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">"Qualquer outro problema" → Playbook Geral</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example Problems Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Tipos de Problemas Suportados</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exampleProblems.map((problem, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {problem.icon}
                    {problem.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-2">{problem.description}</p>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    <strong>Exemplo:</strong><br />
                    "{problem.example}"
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {problem.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Chat Interface */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Assistente Universal de Suporte TI
            </CardTitle>
            <p className="text-sm text-gray-600">
              Descreva qualquer problema técnico abaixo. O sistema vai identificar automaticamente 
              o tipo de problema e te guiar pela solução mais adequada.
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="ml-2">Carregando assistente...</span>
              </div>
            }>
              <GuidedChat />
            </Suspense>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            <strong>Sistema Universal:</strong> Funciona com qualquer problema de TI - hardware, software, rede, mobile, segurança, etc.
          </p>
          <p className="mt-1">
            Para problemas complexos, o sistema automaticamente cria tickets para nossa equipe técnica
          </p>
        </div>
      </div>
    </div>
  )
}