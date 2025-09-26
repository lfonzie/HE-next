'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  MessageSquare, 
  Users, 
  DollarSign, 
  Settings, 
  Heart,
  Smartphone,
  Wrench,
  Beaker,
  CreditCard,
  Video,
  Mic,
  FileSearch,
  MicIcon
} from 'lucide-react'

const modules = [
  // Módulos Acadêmicos
  {
    category: 'Acadêmico',
    items: [
      {
        name: 'Aulas Interativas',
        href: '/aulas',
        icon: BookOpen,
        description: 'Geração de aulas de 45min com quizzes e gamificação'
      },
      {
        name: 'ENEM',
        href: '/enem',
        icon: GraduationCap,
        description: 'Banco de questões + simulados adaptativos'
      },
      {
        name: 'Redação',
        href: '/redacao',
        icon: FileText,
        description: 'Temas oficiais + correção automatizada'
      },
      {
        name: 'Laboratório Virtual',
        href: '/virtual-lab',
        icon: Beaker,
        description: 'Simulações interativas de química e física'
      },
      {
        name: 'Flashcards',
        href: '/flashcards',
        icon: CreditCard,
        description: 'Gerador de flashcards interativos com IA'
      },
      {
        name: 'Vídeo para Aprendizado',
        href: '/video-learning',
        icon: Video,
        description: 'Transforme vídeos em apps de aprendizado'
      },
      {
        name: 'Chat com Documentos',
        href: '/chat-docs',
        icon: FileSearch,
        description: 'Converse com documentos usando IA'
      },
      {
        name: 'Ditado por Voz',
        href: '/dictation',
        icon: MicIcon,
        description: 'Transcreva e organize notas por voz'
      },
      {
        name: 'Live Audio',
        href: '/live-audio',
        icon: Mic,
        description: 'Chat de voz com visualizações 3D'
      }
    ]
  },
  // Módulos de Comunicação/Staff
  {
    category: 'Comunicação',
    items: [
      {
        name: 'Secretaria',
        href: '/comunicacao/secretaria',
        icon: MessageSquare,
        description: 'Informações sobre vagas, matrícula, documentos'
      },
      {
        name: 'Financeiro',
        href: '/comunicacao/financeiro',
        icon: DollarSign,
        description: 'Valores, descontos, formas de pagamento'
      },
      {
        name: 'Coordenação',
        href: '/comunicacao/coordenacao',
        icon: Users,
        description: 'Programas pedagógicos e regras institucionais'
      },
      {
        name: 'RH Interno',
        href: '/comunicacao/rh',
        icon: Settings,
        description: 'FAQ interno para equipe'
      }
    ]
  },
  // Módulos de Suporte
  {
    category: 'Suporte',
    items: [
      {
        name: 'Suporte TI',
        href: '/ti',
        icon: Wrench,
        description: 'Troubleshooting passo a passo'
      },
      {
        name: 'Social Media',
        href: '/suporte/social',
        icon: Smartphone,
        description: 'Sugestões de posts e campanhas'
      },
      {
        name: 'Bem-estar',
        href: '/suporte/bem-estar',
        icon: Heart,
        description: 'Orientações motivacionais e organização'
      }
    ]
  }
]

export function ModuleNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HE</span>
            </div>
            <span className="font-bold text-xl text-gray-900">HubEdu.ia</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            {modules.map((category) => (
              <div key={category.category} className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                  <span className="font-medium">{category.category}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {category.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname.startsWith(item.href)
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-start space-x-3 p-3 rounded-lg transition-colors",
                              isActive 
                                ? "bg-blue-50 text-blue-700" 
                                : "hover:bg-gray-50 text-gray-700"
                            )}
                          >
                            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/modulos-integrados" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Módulos
            </Link>
            <Link 
              href="/chat" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Chat
            </Link>
            <Link 
              href="/profile" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Perfil
            </Link>
            <Link 
              href="/admin" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
