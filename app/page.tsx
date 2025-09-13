import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, BookOpen, Brain, Users, Target, Zap } from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: "Chat Inteligente",
      description: "Converse com IA especializada em 8 módulos educacionais diferentes"
    },
    {
      icon: BookOpen,
      title: "Simulador ENEM",
      description: "Pratique com questões reais do ENEM e melhore seu desempenho"
    },
    {
      icon: Brain,
      title: "IA Avançada",
      description: "Powered by GPT-4 com prompts especializados para educação"
    },
    {
      icon: Users,
      title: "Multi-tenant",
      description: "Suporte para escolas e instituições educacionais"
    },
    {
      icon: Target,
      title: "Analytics",
      description: "Acompanhe progresso e métricas de uso detalhadas"
    },
    {
      icon: Zap,
      title: "Tempo Real",
      description: "Streaming de respostas e atualizações instantâneas"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">HubEdu.ai</div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HubEdu.ai
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos especializados
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Começar Agora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Funcionalidades Principais</h2>
          <p className="text-muted-foreground">
            Uma plataforma completa para transformar a educação com IA
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Pronto para começar?</CardTitle>
            <p className="text-muted-foreground">
              Junte-se a milhares de educadores que já estão usando HubEdu.ai
            </p>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/register">Criar Conta Gratuita</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 HubEdu.ai. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}