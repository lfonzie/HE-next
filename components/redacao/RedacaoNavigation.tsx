'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FileText, BarChart3, Clock, Home } from 'lucide-react'

const navigationItems = [
  {
    href: '/redacao',
    label: 'Nova Redação',
    icon: FileText,
    description: 'Escreva uma nova redação ENEM'
  },
  {
    href: '/redacao/historico',
    label: 'Histórico',
    icon: Clock,
    description: 'Veja suas redações anteriores'
  },
  {
    href: '/redacao/estatisticas',
    label: 'Estatísticas',
    icon: BarChart3,
    description: 'Acompanhe seu progresso'
  }
]

export function RedacaoNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/redacao" className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Redação ENEM
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/redacao' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Back to Home */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">Voltar ao Início</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
