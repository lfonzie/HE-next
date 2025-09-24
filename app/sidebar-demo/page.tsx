'use client'

import { CompactLayout } from '@/components/layout/CompactLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  FileText,
  Zap,
  Star,
  Heart,
  Rocket,
  Sparkles
} from 'lucide-react'

export default function SidebarDemoPage() {
  return (
    <CompactLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
                  <Zap className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white fill-current" />
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Sidebar Ultra-Moderno 2025
              </h1>
              <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Design inspirado no chat input - discreto, moderno e eficiente
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <Zap className="h-4 w-4" />
                  Ultra-Compacto
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-100 text-orange-800 border border-orange-200">
                  <Heart className="h-4 w-4" />
                  Glass Morphism
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 border border-red-200">
                  <Rocket className="h-4 w-4" />
                  Chat Input Style
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow duration-200 group">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Chat IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Converse com assistentes especializados para diferentes áreas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 group">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Gere aulas interativas personalizadas com IA
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 group">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">ENEM</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Simulados e questões do ENEM com correção automática
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 group">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Redação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Corrija e melhore suas redações com feedback detalhado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Características do Sidebar Ultra-Moderno
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Chat Input Style</h3>
              <p className="text-gray-600">
                Design inspirado no chat input fixo - discreto e sempre acessível
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Glass Morphism</h3>
              <p className="text-gray-600">
                Efeito de vidro fosco com backdrop blur para visual moderno
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Logo Integrado</h3>
              <p className="text-gray-600">
                Logo oficial do HubEdu.ia integrado ao design
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-16 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 border border-yellow-200">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Especificações Técnicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Dimensões</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Recolhido:</strong> 64px de largura</li>
                <li>• <strong>Expandido:</strong> 288px de largura</li>
                <li>• <strong>Altura:</strong> 100vh (altura total da tela)</li>
                <li>• <strong>Posição:</strong> Fixed left</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Efeitos Visuais</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Backdrop Blur:</strong> 20px</li>
                <li>• <strong>Transparência:</strong> 95% opacidade</li>
                <li>• <strong>Sombras:</strong> Múltiplas camadas</li>
                <li>• <strong>Transições:</strong> 300ms cubic-bezier</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CompactLayout>
  )
}