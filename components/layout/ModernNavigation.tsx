'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  FileText,
  Menu,
  X,
  Home,
  ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'Chat inteligente com IA',
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'ENEM',
    href: '/enem',
    icon: Target,
    description: 'Simulador ENEM',
    color: 'from-green-500 to-green-600'
  },
  {
    name: 'Redação',
    href: '/redacao',
    icon: FileText,
    description: 'Correção de redação',
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Aulas',
    href: '/aulas',
    icon: BookOpen,
    description: 'Aulas interativas',
    color: 'from-yellow-500 to-yellow-600'
  }
]

interface ModernNavigationProps {
  className?: string
  showHome?: boolean
}

export function ModernNavigation({ className, showHome = true }: ModernNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest('[data-mobile-menu]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className={cn('relative overflow-visible', className)}>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-1">
        {showHome && (
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              isActive('/')
                ? 'bg-yellow-500 text-black shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Home className="h-4 w-4" />
            Início
          </Link>
        )}
        
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden',
              isActive(item.href)
                ? 'bg-yellow-500 text-black shadow-lg'
                : 'text-gray-600 hover:text-white hover:shadow-lg'
            )}
          >
            {/* Hover effect background */}
            <div 
              className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                `bg-gradient-to-r ${item.color}`
              )}
            />
            
            <item.icon className="h-4 w-4 relative z-10" />
            <span className="relative z-10">{item.name}</span>
            
            {/* Active indicator */}
            {isActive(item.href) && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                layoutId="activeIndicator"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        data-mobile-menu
        onClick={() => {
          console.log('Menu button clicked, current state:', isOpen)
          setIsOpen(!isOpen)
        }}
        className={cn(
          'lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 relative z-[50]',
          isScrolled 
            ? 'bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200' 
            : 'bg-white/80 backdrop-blur-sm shadow-md border border-gray-200'
        )}
        aria-label="Toggle navigation menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5 text-gray-700" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
              style={{ zIndex: 999999 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              data-mobile-menu
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl lg:hidden overflow-y-auto"
              style={{ zIndex: 1000000 }}
            >
                <div className="p-6 pt-20">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Navegação</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {showHome && (
                      <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl transition-all duration-200',
                          isActive('/')
                            ? 'bg-yellow-500 text-black shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <Home className="h-5 w-5" />
                        <div>
                          <div className="font-medium">Início</div>
                          <div className="text-sm text-gray-500">Página inicial</div>
                        </div>
                      </Link>
                    )}
                    
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-center gap-3 p-4 rounded-xl transition-all duration-200 relative overflow-hidden',
                          isActive(item.href)
                            ? 'bg-yellow-500 text-black shadow-lg'
                            : 'text-gray-600 hover:text-white hover:shadow-lg'
                        )}
                      >
                        {/* Hover effect background */}
                        <div 
                          className={cn(
                            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                            `bg-gradient-to-r ${item.color}`
                          )}
                        />
                        
                        <div className="relative z-10 flex items-center gap-3 w-full">
                          <item.icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm opacity-80">{item.description}</div>
                          </div>
                        </div>
                        
                        {/* Active indicator */}
                        {isActive(item.href) && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                            layoutId="mobileActiveIndicator"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-2">HubEdu.ia</div>
                      <div className="text-xs text-gray-400">
                        A Educação do Futuro
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
